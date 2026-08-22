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
import '../styles/ui.css'
import './DrawingPage.css'

const AUTOSAVE_DELAY = 400
const THUMBNAIL_INTERVAL = 4000

/** A blank sheet: no steps, no guide, no Next — just paper and tools. */
export function FreeDrawPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tool = useAppStore((s) => s.tool)
  const color = useAppStore((s) => s.color)
  const setTool = useAppStore((s) => s.setTool)
  const setColor = useAppStore((s) => s.setColor)

  const [actions, setActions] = useState<DrawingAction[]>([])
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, isEmpty: true })
  const [confirmClear, setConfirmClear] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [savedAt, setSavedAt] = useState(0)
  const [loadedActions, setLoadedActions] = useState<DrawingAction[] | undefined>()

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
