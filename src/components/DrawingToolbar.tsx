import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import type { ToolId } from '../storage/types'
import './DrawingToolbar.css'

interface Props {
  tool: ToolId
  color: string
  canUndo: boolean
  canRedo: boolean
  tools?: ToolId[]
  onToolChange: (tool: ToolId) => void
  onColorTap: () => void
  onUndo: () => void
  onRedo: () => void
}

const ICONS: Record<ToolId, 'pencil' | 'brush' | 'fill' | 'eraser'> = {
  PENCIL: 'pencil',
  BRUSH: 'brush',
  FILL: 'fill',
  ERASER: 'eraser',
}

const LABELS: Record<ToolId, string> = {
  PENCIL: 'drawing.tool.pencil',
  BRUSH: 'drawing.tool.brush',
  FILL: 'drawing.tool.fill',
  ERASER: 'drawing.tool.eraser',
}

export function DrawingToolbar({
  tool, color, canUndo, canRedo, tools = ['PENCIL', 'BRUSH', 'FILL', 'ERASER'],
  onToolChange, onColorTap, onUndo, onRedo,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="toolbar">
      {tools.map((id) => (
        <button
          key={id}
          className={`tool ${tool === id ? 'tool--on' : ''}`}
          onClick={() => onToolChange(id)}
          aria-label={t(LABELS[id])}
          aria-pressed={tool === id}
        >
          <Icon name={ICONS[id]} size={30} color={tool === id ? '#fff' : 'var(--c-text-soft)'} />
        </button>
      ))}

      <div className="tool-divider" />

      <button className="tool" onClick={onColorTap} aria-label={t('drawing.tool.pencil')}>
        <span className="swatch" style={{ background: color }} />
      </button>

      <div className="tool-divider" />

      <button className="tool" onClick={onUndo} disabled={!canUndo} aria-label={t('drawing.tool.undo')}>
        <Icon name="undo" size={30} color={canUndo ? 'var(--c-text-soft)' : 'var(--c-disabled)'} width={2.4} />
      </button>
      <button className="tool" onClick={onRedo} disabled={!canRedo} aria-label={t('drawing.tool.redo')}>
        <Icon name="redo" size={30} color={canRedo ? 'var(--c-text-soft)' : 'var(--c-disabled)'} width={2.4} />
      </button>
    </div>
  )
}
