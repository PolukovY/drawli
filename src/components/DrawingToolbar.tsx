import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import { ToolIcon } from './ToolIcon'
import type { ToolId } from '../storage/types'
import { playSound } from '../audio/sounds'
import './DrawingToolbar.css'

interface Props {
  tool: ToolId
  color: string
  canUndo: boolean
  canRedo: boolean
  tools?: ToolId[]
  /** The tool this step needs — it pulses until the child picks it up. */
  want?: ToolId
  /** The colour this step needs; the swatch button pulses instead. */
  wantColor?: string
  onToolChange: (tool: ToolId) => void
  onColorTap: () => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  canClear: boolean
}

const LABELS: Record<ToolId, string> = {
  PENCIL: 'drawing.tool.pencil',
  BRUSH: 'drawing.tool.brush',
  FILL: 'drawing.tool.fill',
  ERASER: 'drawing.tool.eraser',
}

const HINTS: Record<ToolId, string> = {
  PENCIL: 'drawing.tool.pencilHint',
  BRUSH: 'drawing.tool.brushHint',
  FILL: 'drawing.tool.fillHint',
  ERASER: 'drawing.tool.eraserHint',
}

/** Hover/focus explains the tool; a tablet still gets the label via aria. */
function Tip({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <span className="tool-wrap">
      {children}
      <span className="tool-tip" role="tooltip">
        <b>{title}</b>
        <i>{hint}</i>
      </span>
    </span>
  )
}

export function DrawingToolbar({
  tool, color, canUndo, canRedo, tools = ['PENCIL', 'BRUSH', 'FILL', 'ERASER'],
  want, wantColor, onToolChange, onColorTap, onUndo, onRedo, onClear, canClear,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="toolbar">
      {tools.map((id) => (
        <Tip key={id} title={t(LABELS[id])} hint={t(HINTS[id])}>
          <button
            className={`tool ${tool === id ? 'tool--on' : ''} ${want === id && tool !== id ? 'tool--want' : ''}`}
            onClick={() => { playSound('tap'); onToolChange(id) }}
            aria-label={t(LABELS[id])}
            aria-pressed={tool === id}
          >
            <ToolIcon tool={id} size={34} />
          </button>
        </Tip>
      ))}

      <div className="tool-divider" />

      <Tip title={t('drawing.tool.color')} hint={t('drawing.tool.colorHint')}>
        <button
          className={`tool ${wantColor && wantColor !== color ? 'tool--want' : ''}`}
          onClick={() => { playSound('tap'); onColorTap() }}
          aria-label={t('drawing.tool.color')}
        >
          <span className="swatch" style={{ background: color }} />
        </button>
      </Tip>

      <div className="tool-divider" />

      <Tip title={t('drawing.tool.undo')} hint={t('drawing.tool.undoHint')}>
        <button className="tool" onClick={() => { playSound('tap'); onUndo() }} disabled={!canUndo} aria-label={t('drawing.tool.undo')}>
          <Icon name="undo" size={30} color={canUndo ? 'var(--c-text-soft)' : 'var(--c-disabled)'} width={2.4} />
        </button>
      </Tip>

      <Tip title={t('drawing.tool.redo')} hint={t('drawing.tool.redoHint')}>
        <button className="tool" onClick={() => { playSound('tap'); onRedo() }} disabled={!canRedo} aria-label={t('drawing.tool.redo')}>
          <Icon name="redo" size={30} color={canRedo ? 'var(--c-text-soft)' : 'var(--c-disabled)'} width={2.4} />
        </button>
      </Tip>

      <Tip title={t('drawing.tool.clear')} hint={t('drawing.tool.clearHint')}>
        <button className="tool" onClick={() => { playSound('tap'); onClear() }} disabled={!canClear} aria-label={t('drawing.tool.clear')}>
          <Icon name="trash" size={30} color={canClear ? 'var(--c-danger)' : 'var(--c-disabled)'} width={2.2} />
        </button>
      </Tip>
    </div>
  )
}
