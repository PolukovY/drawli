import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../app/store'
import { DrawingCanvas } from '../components/DrawingCanvas'
import { DrawingToolbar } from '../components/DrawingToolbar'
import { ColorPalette } from '../components/ColorPalette'
import { Icon } from '../components/Icon'
import type { DrawingEngine } from '../drawing/DrawingEngine'
import { createDocument } from '../drawing/DrawingDocument'
import { composeThumbnail } from '../drawing/thumbnail'
import { useAutosave } from '../drawing/useAutosave'
import { playSound } from '../audio/sounds'
import type { DrawingAction } from '../storage/types'
import { findInProgress, upsertDrawing } from '../storage/DrawingRepository'
import { useLocalAI } from '../ai/useLocalAI'
import '../styles/ui.css'
import './DrawingPage.css'

const AUTOSAVE_DELAY = 2000
const THUMBNAIL_INTERVAL = 15000

/** A blank sheet: no steps, no guide, no Next — just paper and tools. */
export function FreeDrawPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tool = useAppStore((s) => s.tool)
  const color = useAppStore((s) => s.color)
  const setTool = useAppStore((s) => s.setTool)
  const setColor = useAppStore((s) => s.setColor)
  const settings = useAppStore((s) => s.settings)

  const [actions, setActions] = useState<DrawingAction[]>([])
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, isEmpty: true })
  const [confirmClear, setConfirmClear] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [savedAt, setSavedAt] = useState(0)
  const [loadedActions, setLoadedActions] = useState<DrawingAction[] | undefined>()

  // "Draw It": a fresh idea is always instant (the picked-locally list), never
  // gated on AI — the model, if the parent turned it on and it's ready, only
  // ever upgrades the text already on screen, and a stale response (the child
  // tapped again, or moved on) is dropped rather than overwriting it.
  const [prompt, setPrompt] = useState<string | null>(null)
  const [promptIsAi, setPromptIsAi] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const promptRequestRef = useRef(0)
  const { service: aiService, status: aiStatus, load: loadAi, isSupported: aiSupported } = useLocalAI()
  // English only: tried empirically against the real model (see ai-roadmap.md),
  // and a 270M-class instruction-tuned model does not reliably follow a
  // "reply in Ukrainian" instruction — it answers in English regardless. Since
  // this app is Ukrainian-first, that is not a quality bar worth shipping, so
  // the AI upgrade stays off outside English rather than risk showing a child
  // the wrong language for their idea.
  const aiEnabled = (settings?.aiIdeasEnabled ?? false) && aiSupported && settings?.language === 'en'

  const engineRef = useRef<DrawingEngine | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const drawingIdRef = useRef<string>(crypto.randomUUID())
  const lastThumbnailAt = useRef(0)
  const lastThumbnail = useRef<Blob | undefined>(undefined)

  // Pick up the sheet the child was on: leaving the screen should not mean
  // starting over, and a half-finished drawing is easy to walk away from.
  useEffect(() => {
    let cancelled = false
    void findInProgress('free').then((drawing) => {
      if (cancelled || !drawing) {
        setLoadedActions([])
        return
      }
      drawingIdRef.current = drawing.id
      setActions(drawing.document.actions)
      setLoadedActions(drawing.document.actions)
    })
    return () => { cancelled = true }
  }, [])

  const persist = useCallback(async (next: DrawingAction[], thumbnail?: Blob) => {
    if (next.length === 0) return

    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId: 'free',
      currentStep: 0,
      document: { ...createDocument('free', 1, 1), actions: next },
      thumbnail: thumbnail ?? lastThumbnail.current,
    })
    setSavedAt(Date.now())
  }, [])

  const autosave = useAutosave<DrawingAction[]>((pending) => persist(pending), AUTOSAVE_DELAY)

  /** Same reason as the exercise screen: photograph the canvas while it exists. */
  const refreshThumbnail = useCallback(async () => {
    const now = Date.now()
    if (lastThumbnail.current && now - lastThumbnailAt.current < THUMBNAIL_INTERVAL) return
    const canvasEl = cardRef.current?.querySelector('canvas') ?? null
    if (!canvasEl) return
    lastThumbnail.current = await composeThumbnail(canvasEl, null)
    lastThumbnailAt.current = now
  }, [])

  const handleActions = useCallback((next: DrawingAction[]) => {
    const copy = [...next]
    setActions(copy)
    void refreshThumbnail()
    autosave.schedule(copy)
  }, [autosave, refreshThumbnail])

  async function handleSave() {
    autosave.flush()
    const canvasEl = cardRef.current?.querySelector('canvas') ?? null
    const thumbnail = canvasEl ? await composeThumbnail(canvasEl, null) : undefined
    await persist(actions, thumbnail)
    playSound('star')
    setSavedToast(true)
    window.setTimeout(() => setSavedToast(false), 1800)
  }

  function pickLocalPrompt(): string {
    const prompts = t('free.drawItPrompts', { returnObjects: true }) as unknown as string[]
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  function newIdea() {
    const requestId = ++promptRequestRef.current
    setPrompt(pickLocalPrompt())
    setPromptIsAi(false)
    if (!aiEnabled) return

    setAiThinking(true)
    void (async () => {
      try {
        const ready = aiStatus === 'ready' || (await loadAi())
        if (!ready || promptRequestRef.current !== requestId) return
        const result = await aiService.generateDrawingPrompt({ language: 'en' })
        if (promptRequestRef.current !== requestId) return
        setPrompt(result.text)
        setPromptIsAi(true)
      } catch {
        // The locally-picked idea is already on screen — nothing else to do.
      } finally {
        if (promptRequestRef.current === requestId) setAiThinking(false)
      }
    })()
  }

  function startNewSheet() {
    autosave.flush()
    drawingIdRef.current = crypto.randomUUID()
    lastThumbnail.current = undefined
    lastThumbnailAt.current = 0
    engineRef.current?.clear()
    setActions([])
  }

  return (
    <div className="draw-screen">
      <header className="draw-header">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>

        <div className="draw-header__center">
          <div className="title">{t('free.title')}</div>
          <div className="muted" style={{ fontSize: 16 }}>{t('free.hint')}</div>
        </div>

        {savedAt ? (
          <span key={savedAt} className="saved-mark" role="status">
            <Icon name="check" size={18} color="var(--c-success)" width={3} />
            {t('drawing.autosaved')}
          </span>
        ) : null}

        <button className="btn save-now" onClick={() => void handleSave()} disabled={actions.length === 0}>
          <Icon name="download" size={22} color="var(--c-text-soft)" width={2.2} />
          {t('drawing.save')}
        </button>

        <button className="btn save-now" onClick={startNewSheet} disabled={actions.length === 0}>
          <Icon name="plus" size={22} color="var(--c-text-soft)" width={2.6} />
          {t('free.newSheet')}
        </button>

        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="home" size={26} color="var(--c-text-muted)" />
        </button>
      </header>

      <div className="row" style={{ padding: '0 20px 12px', flexWrap: 'wrap' }}>
        <button className="chip" onClick={newIdea}>
          <Icon name="again" size={18} color="var(--c-text-soft)" width={2.6} />
          &nbsp;{t('free.drawItNew')}
        </button>
        {prompt ? (
          <span className="pill-note">
            {prompt}
            {aiThinking ? '…' : null}
            {promptIsAi ? <span className="chip chip--on" style={{ height: 28, padding: '0 10px', fontSize: 13 }}>{t('free.drawItAi')}</span> : null}
          </span>
        ) : null}
      </div>

      <div className="draw-body">
        <DrawingToolbar
          tool={tool}
          color={color}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          tools={['PENCIL', 'BRUSH', 'FILL', 'ERASER']}
          onToolChange={setTool}
          onColorTap={() => undefined}
          onUndo={() => engineRef.current?.undo()}
          onRedo={() => engineRef.current?.redo()}
          onClear={() => setConfirmClear(true)}
          canClear={!history.isEmpty}
        />

        <div className="draw-main">
          <div className="canvas-card card" ref={cardRef}>
            <div className="canvas-holder">
              <DrawingCanvas
                tool={tool}
                color={color}
                actions={loadedActions}
                onEngineReady={(engine) => { engineRef.current = engine }}
                onActionCommitted={handleActions}
                onHistoryChange={setHistory}
              />
            </div>
          </div>

          <ColorPalette color={color} onPick={setColor} />
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
                onClick={() => { engineRef.current?.clear(); setConfirmClear(false) }}
              >
                {t('drawing.tool.clear')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
