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
import type { DrawingAction } from '../storage/types'
import { upsertDrawing } from '../storage/DrawingRepository'
import '../styles/ui.css'
import './DrawingPage.css'

const AUTOSAVE_DELAY = 400

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

  const engineRef = useRef<DrawingEngine | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const drawingIdRef = useRef<string>(crypto.randomUUID())
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    // The fill tool needs regions to fill; a blank sheet has none.
    if (tool === 'FILL') setTool('PENCIL')
  }, [tool, setTool])

  const persist = useCallback(async (next: DrawingAction[], thumbnail?: Blob) => {
    if (next.length === 0) return
    await upsertDrawing({
      id: drawingIdRef.current,
      exerciseId: 'free',
      currentStep: 0,
      document: { ...createDocument('free', 1, 1), actions: next },
      thumbnail,
    })
  }, [])

  const handleActions = useCallback((next: DrawingAction[]) => {
    const copy = [...next]
    setActions(copy)
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => void persist(copy), AUTOSAVE_DELAY)
  }, [persist])

  useEffect(() => () => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
  }, [])

  async function handleSave() {
    const canvasEl = cardRef.current?.querySelector('canvas') ?? null
    const thumbnail = canvasEl ? await composeThumbnail(canvasEl, null) : undefined
    await persist(actions, thumbnail)
    setSavedToast(true)
    window.setTimeout(() => setSavedToast(false), 1800)
  }

  function startNewSheet() {
    drawingIdRef.current = crypto.randomUUID()
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
          tools={['PENCIL', 'BRUSH', 'ERASER']}
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
