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
import type { DrawingEngine } from '../drawing/DrawingEngine'
import { loadExercise } from '../exercise/ExerciseLoader'
import type { Exercise } from '../exercise/Exercise'
import { createDocument } from '../drawing/DrawingDocument'
import type { DrawingAction, ToolId } from '../storage/types'
import { findInProgress, upsertDrawing } from '../storage/DrawingRepository'
import { markCompleted, markStarted } from '../storage/ProgressRepository'
import '../styles/ui.css'
import './DrawingPage.css'

const AUTOSAVE_DELAY = 400

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

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [actions, setActions] = useState<DrawingAction[]>([])
  const [loadedActions, setLoadedActions] = useState<DrawingAction[] | undefined>()
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, isEmpty: true })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [finished, setFinished] = useState<{ stars: number; thumbnail?: string } | null>(null)

  const engineRef = useRef<DrawingEngine | null>(null)
  const drawingIdRef = useRef<string>('')
  const saveTimer = useRef<number | null>(null)
  /** Actions present when the current step opened — Next unlocks above this. */
  const stepBaselineRef = useRef(0)
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

      if (existing) {
        drawingIdRef.current = existing.id
        setStepIndex(Math.min(existing.currentStep, loaded.steps.length - 1))
        setActions(existing.document.actions)
        setLoadedActions(existing.document.actions)
        stepBaselineRef.current = existing.document.actions.length
      } else {
        drawingIdRef.current = crypto.randomUUID()
        setStepIndex(0)
        setActions([])
        setLoadedActions([])
        stepBaselineRef.current = 0
      }
    })()

    return () => { cancelled = true }
  }, [exerciseId, search])

  // --- autosave ---------------------------------------------------------

  const persist = useCallback(async (nextActions: DrawingAction[], step: number) => {
    if (!exerciseId || !drawingIdRef.current) return
    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId,
      currentStep: step,
      document: { ...createDocument(exerciseId, 1, 1), actions: nextActions },
    })
    await markStarted(exerciseId, step)
  }, [exerciseId])

  const scheduleSave = useCallback((nextActions: DrawingAction[]) => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void persist(nextActions, stepIndexRef.current)
    }, AUTOSAVE_DELAY)
  }, [persist])

  // A tablet can be locked mid-stroke; flush before the page goes away.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState !== 'hidden') return
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
      void persist(engineRef.current?.actions ?? [], stepIndexRef.current)
    }
    document.addEventListener('visibilitychange', flush)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    }
  }, [persist])

  const handleActions = useCallback((next: DrawingAction[]) => {
    setActions([...next])
    scheduleSave([...next])
  }, [scheduleSave])

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

  const canProceed = actions.length > stepBaselineRef.current

  async function handleNext() {
    if (!exercise) return

    if (!isLastStep) {
      const next = stepIndex + 1
      stepBaselineRef.current = actions.length
      setStepIndex(next)
      const defaultTool = exercise.steps[next]?.defaultTool
      if (defaultTool) setTool(defaultTool as ToolId)
      void persist(actions, next)
      return
    }

    const thumbnailBlob = await engineRef.current?.toThumbnail()
    const stars = await markCompleted(exercise.id, exercise.steps.length)
    await awardStars(stars)

    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId: exercise.id,
      currentStep: exercise.steps.length,
      document: { ...createDocument(exercise.id, 1, 1), actions },
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
          tools={isColoring ? ['FILL', 'BRUSH', 'ERASER'] : ['PENCIL', 'BRUSH', 'ERASER']}
          onToolChange={setTool}
          onColorTap={() => setPaletteOpen((open) => !open)}
          onUndo={() => engineRef.current?.undo()}
          onRedo={() => engineRef.current?.redo()}
        />

        <div className="draw-main">
          <div className="canvas-card card">
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
              {isColoring ? t('drawing.hintColor') : t('drawing.hintDraw')}
            </div>
          </div>

          {paletteOpen || isColoring ? (
            <ColorPalette color={color} onPick={(next) => { setColor(next); setPaletteOpen(false) }} />
          ) : null}
        </div>

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
    </div>
  )
}
