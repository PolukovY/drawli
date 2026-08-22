import { useEffect, useRef } from 'react'
import { DrawingEngine } from '../drawing/DrawingEngine'
import type { DrawingAction, ToolId } from '../storage/types'

interface Props {
  tool: ToolId
  color: string
  actions?: DrawingAction[]
  onEngineReady?: (engine: DrawingEngine) => void
  onActionCommitted?: (actions: DrawingAction[]) => void
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean; isEmpty: boolean }) => void
  onFirstAction?: () => void
}

export function DrawingCanvas({
  tool, color, actions, onEngineReady, onActionCommitted, onHistoryChange, onFirstAction,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DrawingEngine | null>(null)

  // Callbacks live in a ref so a re-render never tears down the engine mid-stroke.
  const handlers = useRef({ onActionCommitted, onHistoryChange, onFirstAction })
  handlers.current = { onActionCommitted, onHistoryChange, onFirstAction }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new DrawingEngine(canvas, {
      onActionCommitted: (next) => handlers.current.onActionCommitted?.(next),
      onHistoryChange: (state) => handlers.current.onHistoryChange?.(state),
      onFirstAction: () => handlers.current.onFirstAction?.(),
    })
    engineRef.current = engine
    onEngineReady?.(engine)

    const observer = new ResizeObserver(() => engine.resize())
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      engine.destroy()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { engineRef.current?.setTool(tool) }, [tool])
  useEffect(() => { engineRef.current?.setColor(color) }, [color])
  useEffect(() => { if (actions) engineRef.current?.loadActions(actions) }, [actions])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />
}
