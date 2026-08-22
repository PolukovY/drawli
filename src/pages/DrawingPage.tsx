import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../app/store'
import { DrawingCanvas } from '../components/DrawingCanvas'
import { DrawingToolbar } from '../components/DrawingToolbar'
import { ColorPalette } from '../components/ColorPalette'
import { GuideLayer } from '../components/GuideLayer'
import { ColoringLayer } from '../components/ColoringLayer'
import { CompletionScreen } from '../components/CompletionScreen'
import { Icon } from '../components/Icon'
import { StepPreview } from '../components/StepPreview'
import { CoachMarks, type CoachStep } from '../components/CoachMarks'
import type { DrawingEngine } from '../drawing/DrawingEngine'
import { loadExercise } from '../exercise/ExerciseLoader'
import type { Exercise } from '../exercise/Exercise'
import { createDocument } from '../drawing/DrawingDocument'
import { composeThumbnail } from '../drawing/thumbnail'
import { useAutosave } from '../drawing/useAutosave'
import { playSound } from '../audio/sounds'
import type { DrawingAction, ToolId } from '../storage/types'
import { findInProgress, upsertDrawing } from '../storage/DrawingRepository'
import { markCompleted, markStarted } from '../storage/ProgressRepository'
import '../styles/ui.css'
import './DrawingPage.css'

const AUTOSAVE_DELAY = 400
/** A gallery picture is worth redrawing at most this often while drawing. */
const THUMBNAIL_INTERVAL = 4000

export function DrawingPage() {
  const { exerciseId = '' } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const settings = useAppStore((s) => s.settings)
  const tool = useAppStore((s) => s.tool)
  const color = useAppStore((s) => s.color)
  const setTool = useAppStore((s) => s.setTool)
  const setColor = useAppStore((s) => s.setColor)
  const awardStars = useAppStore((s) => s.awardStars)
  const markTutorialDone = useAppStore((s) => s.markTutorialDone)

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [actions, setActions] = useState<DrawingAction[]>([])
  const [loadedActions, setLoadedActions] = useState<DrawingAction[] | undefined>()
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, isEmpty: true })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [savedAt, setSavedAt] = useState(0)
  const [finished, setFinished] = useState<{ stars: number; thumbnail?: string } | null>(null)

  const engineRef = useRef<DrawingEngine | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const drawingIdRef = useRef<string>('')
  /** Thumbnails are the expensive part of a save, so they lag behind. */
  const lastThumbnailAt = useRef(0)
  /**
   * Actions present when each step opened — Next unlocks above the current
   * step's mark. Kept per step (and saved) so returning to a drawing does not
   * demand a fresh stroke on work the child already finished.
   */
  const stepBaselinesRef = useRef<number[]>([0])
  const stepIndexRef = useRef(0)
  stepIndexRef.current = stepIndex

  const steps = exercise?.steps ?? []
  const currentStep = steps[stepIndex]
  const isColoring = currentStep?.mode === 'COLORING'
  const isLastStep = stepIndex === steps.length - 1
  const title = exercise ? t(exercise.titleKey) : ''

  // --- load exercise and any unfinished drawing for it ------------------

  useEffect(() => {
    let cancelled = false
    const startFresh = search.get('new') === '1'

    void (async () => {
      const loaded = await loadExercise(exerciseId)
      if (cancelled) return
      setExercise(loaded)

      const existing = startFresh ? undefined : await findInProgress(exerciseId)
      if (cancelled) return

      const startStep = existing
        ? Math.min(existing.currentStep, loaded.steps.length - 1)
        : 0

      if (existing) {
        drawingIdRef.current = existing.id
        setActions(existing.document.actions)
        setLoadedActions(existing.document.actions)
        // Drawings saved before baselines were tracked fall back to 0, which
        // keeps the button enabled rather than trapping the child.
        stepBaselinesRef.current = existing.stepBaselines ?? [0]
      } else {
        drawingIdRef.current = crypto.randomUUID()
        setActions([])
        setLoadedActions([])
        stepBaselinesRef.current = [0]
      }

      setStepIndex(startStep)
      // Without this the fill tool carried over from a colouring step stays
      // selected, and the pencil silently refuses to draw on the next exercise.
      setTool((loaded.steps[startStep]?.defaultTool as ToolId | undefined) ?? 'PENCIL')
    })()

    return () => { cancelled = true }
  }, [exerciseId, search, setTool])

  // --- autosave ---------------------------------------------------------

  const persist = useCallback(async (nextActions: DrawingAction[], step: number) => {
    if (!exerciseId || !drawingIdRef.current) return
    // An opened-but-untouched exercise is not a drawing: saving it would put an
    // empty card in the gallery and hijack the "continue" prompt on the home screen.
    if (nextActions.length === 0 && step === 0) return

    // Refresh the picture now and then, so an unfinished drawing shows what the
    // child actually made rather than a grey outline of the exercise.
    let thumbnail: Blob | undefined
    const now = Date.now()
    if (nextActions.length > 0 && now - lastThumbnailAt.current > THUMBNAIL_INTERVAL) {
      const canvasEl = cardRef.current?.querySelector('canvas') ?? null
      const overlaySvg = cardRef.current?.querySelector<SVGSVGElement>('.coloring-layer svg') ?? null
      if (canvasEl) {
        thumbnail = await composeThumbnail(canvasEl, overlaySvg)
        lastThumbnailAt.current = now
      }
    }

    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId,
      currentStep: step,
      stepBaselines: [...stepBaselinesRef.current],
      document: { ...createDocument(exerciseId, 1, 1), actions: nextActions },
      thumbnail,
    })
    await markStarted(exerciseId, step)
    setSavedAt(Date.now())
  }, [exerciseId])

  const autosave = useAutosave<{ actions: DrawingAction[]; step: number }>(
    ({ actions: pending, step }) => persist(pending, step),
    AUTOSAVE_DELAY,
  )

  const handleActions = useCallback((next: DrawingAction[]) => {
    const copy = [...next]
    setActions(copy)
    autosave.schedule({ actions: copy, step: stepIndexRef.current })
  }, [autosave])

  // --- colouring --------------------------------------------------------

  const fills = useMemo(() => {
    const map: Record<string, string> = {}
    for (const action of actions) if (action.type === 'FILL') map[action.regionId] = action.color
    return map
  }, [actions])

  const handleFill = useCallback((regionId: string) => {
    engineRef.current?.pushFill(regionId, useAppStore.getState().color)
  }, [])

  // --- step flow --------------------------------------------------------

  const canProceed = actions.length > (stepBaselinesRef.current[stepIndex] ?? 0)

  const showCoach = Boolean(settings && !settings.tutorialDrawDone && exercise)
  const coachSteps: CoachStep[] = [
    { selector: '.canvas-card', titleKey: 'coach.draw.canvasTitle', textKey: 'coach.draw.canvasText', placement: 'below' },
    { selector: '.preview', titleKey: 'coach.draw.previewTitle', textKey: 'coach.draw.previewText', placement: 'below' },
    { selector: '.toolbar', titleKey: 'coach.draw.toolsTitle', textKey: 'coach.draw.toolsText', placement: 'below' },
    { selector: '.next-btn', titleKey: 'coach.draw.nextTitle', textKey: 'coach.draw.nextText', placement: 'above' },
  ]

  /** Explicit save: autosave already keeps the strokes, this adds the picture
   *  so the drawing shows up in the gallery as it looks right now. */
  async function handleSaveNow() {
    if (!exercise) return
    const canvasEl = cardRef.current?.querySelector('canvas') ?? null
    const overlaySvg = cardRef.current?.querySelector<SVGSVGElement>('.coloring-layer svg') ?? null
    const thumbnailBlob = canvasEl ? await composeThumbnail(canvasEl, overlaySvg) : undefined

    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId: exercise.id,
      currentStep: stepIndex,
      stepBaselines: [...stepBaselinesRef.current],
      document: { ...createDocument(exercise.id, 1, 1), actions },
      thumbnail: thumbnailBlob,
    })

    playSound('star')
    setSavedToast(true)
    window.setTimeout(() => setSavedToast(false), 1800)
  }

  async function handleNext() {
    if (!exercise) return

    if (!isLastStep) {
      playSound('next')
      const next = stepIndex + 1
      stepBaselinesRef.current[next] = actions.length
      setStepIndex(next)
      const defaultTool = exercise.steps[next]?.defaultTool
      if (defaultTool) setTool(defaultTool as ToolId)
      autosave.flush()
      void persist(actions, next)
      return
    }

    // Capture what the child actually sees: coloured regions under their strokes.
    const canvasEl = cardRef.current?.querySelector('canvas') ?? null
    const overlaySvg = cardRef.current?.querySelector<SVGSVGElement>('.coloring-layer svg') ?? null
    autosave.flush()
    const thumbnailBlob = canvasEl
      ? await composeThumbnail(canvasEl, overlaySvg)
      : await engineRef.current?.toThumbnail()
    const stars = await markCompleted(exercise.id, exercise.steps.length)
    await awardStars(stars)
    playSound('fanfare')

    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId: exercise.id,
      currentStep: exercise.steps.length,
      document: { ...createDocument(exercise.id, 1, 1), actions },
      stepBaselines: [...stepBaselinesRef.current],
      status: 'COMPLETED',
      thumbnail: thumbnailBlob,
    })

    setFinished({
      stars,
      thumbnail: thumbnailBlob ? URL.createObjectURL(thumbnailBlob) : undefined,
    })
  }

  if (finished) {
    return (
      <CompletionScreen
        name={settings?.childName ?? ''}
        stars={finished.stars}
        thumbnail={finished.thumbnail}
        onAnother={() => navigate('/')}
        onAgain={() => {
          setFinished(null)
          navigate(`/draw/${exerciseId}?new=1`)
        }}
      />
    )
  }

  return (
    <div className="draw-screen">
      <header className="draw-header">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>

        <div className="draw-header__center">
          <div className="title">{isColoring ? `${t('drawing.colorTitle')} ${title}` : title}</div>
          <div className="muted" style={{ fontSize: 16 }}>
            {t('drawing.step', { step: stepIndex + 1, total: steps.length || 1 })}
          </div>
          <div className="dots">
            {steps.map((step, i) => (
              <span key={step.id} className={`dot ${i <= stepIndex ? 'dot--on' : ''}`} />
            ))}
          </div>
        </div>

        {savedAt ? (
          <span key={savedAt} className="saved-mark" role="status">
            <Icon name="check" size={18} color="var(--c-success)" width={3} />
            {t('drawing.autosaved')}
          </span>
        ) : null}

        <button
          className="btn save-now"
          onClick={() => void handleSaveNow()}
          disabled={actions.length === 0}
        >
          <Icon name="download" size={22} color="var(--c-text-soft)" width={2.2} />
          {t('drawing.save')}
        </button>

        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {settings?.stars ?? 0}
        </div>

        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="home" size={26} color="var(--c-text-muted)" />
        </button>
      </header>

      <div className="draw-body">
        <DrawingToolbar
          tool={tool}
          color={color}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          tools={isColoring ? ['FILL', 'BRUSH', 'ERASER'] : ['PENCIL', 'BRUSH', 'FILL', 'ERASER']}
          onToolChange={setTool}
          onColorTap={() => setPaletteOpen((open) => !open)}
          onUndo={() => engineRef.current?.undo()}
          onRedo={() => engineRef.current?.redo()}
          onClear={() => setConfirmClear(true)}
          canClear={!history.isEmpty}
        />

        <div className="draw-main">
          <div className="canvas-card card" ref={cardRef}>
            {exercise ? (
              isColoring && currentStep?.guide ? (
                <ColoringLayer
                  exerciseId={exercise.id}
                  file={currentStep.guide}
                  fills={fills}
                  onFill={handleFill}
                />
              ) : (
                <GuideLayer exerciseId={exercise.id} steps={steps} currentIndex={stepIndex} />
              )
            ) : null}

            <div className={`canvas-holder ${isColoring && tool === 'FILL' ? 'canvas-holder--passive' : ''}`}>
              <DrawingCanvas
                tool={tool}
                color={color}
                actions={loadedActions}
                onEngineReady={(engine) => { engineRef.current = engine }}
                onActionCommitted={handleActions}
                onHistoryChange={setHistory}
              />
            </div>

            <div className="canvas-hint">
              <Icon name="star" size={20} color="var(--c-accent)" filled />
              {isColoring
                ? t('drawing.hintColor')
                : exercise?.glyph
                  ? t(/^\d+$/.test(exercise.glyph) ? 'drawing.hintNumber' : 'drawing.hintWrite')
                  : t('drawing.hintDraw')}
            </div>
          </div>

          {paletteOpen || isColoring ? (
            <ColorPalette color={color} onPick={(next) => { setColor(next); setPaletteOpen(false) }} />
          ) : null}
        </div>

        {exercise ? (
          <StepPreview
            exerciseId={exercise.id}
            steps={steps}
            currentIndex={stepIndex}
            finalFile={steps.find((s) => s.mode === 'COLORING')?.guide}
            labelKey={exercise.glyph ? 'drawing.previewWrite' : 'drawing.previewTitle'}
          />
        ) : null}

        <div className="draw-next">
          <button
            className={`next-btn ${isLastStep ? 'next-btn--done' : ''}`}
            disabled={!canProceed}
            onClick={() => void handleNext()}
          >
            <Icon name={isLastStep ? 'check' : 'arrow'} size={46} color="#fff" width={2.6} />
            {isLastStep ? t('drawing.done') : t('drawing.next')}
          </button>
        </div>
      </div>

      {savedToast ? (
        <div className="toast" role="status">
          <Icon name="check" size={22} color="#fff" width={3} />
          {t('drawing.saved')}
        </div>
      ) : null}

      {confirmClear ? (
        <div className="modal-backdrop" onClick={() => setConfirmClear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="title">{t('drawing.clearConfirm')}</div>
            <div className="subtitle">{t('drawing.clearHint')}</div>
            <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn" onClick={() => setConfirmClear(false)}>{t('settings.cancel')}</button>
              <button
                className="btn btn--danger"
                onClick={() => {
                  engineRef.current?.clear()
                  setConfirmClear(false)
                }}
              >
                {t('drawing.tool.clear')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCoach ? (
        <CoachMarks steps={coachSteps} onDone={() => void markTutorialDone('draw')} />
      ) : null}
    </div>
  )
}
