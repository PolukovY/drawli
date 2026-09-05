import { useRef } from 'react'
import type { PhotoDecoration } from '../../storage/types'
import type { DisplayRect } from './photoUtils'
import './Sticker.css'

interface Props {
  decoration: PhotoDecoration
  selected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, scale: number) => void
  onRemove: (id: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Where the photo itself sits inside the (possibly letterboxed) container. */
  imageRect: DisplayRect
}

const TAP_THRESHOLD = 6
const BASE_SIZE = 44

/**
 * A placed sticker: drag with one finger to move it, tap without moving to
 * remove it, drag the handle (shown once selected) to resize. No real pinch
 * gesture — a single-finger handle is far more reliable on a 5-year-old's
 * hand than tracking two fingers at once.
 *
 * `decoration.x/y` are normalized to the PHOTO, not this component's
 * container — the container can be letterboxed, so every screen-space
 * conversion goes through `imageRect` (see photoUtils.imageDisplayRect).
 */
export function Sticker({ decoration, selected, onSelect, onMove, onResize, onRemove, containerRef, imageRect }: Props) {
  const moved = useRef(false)

  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    moved.current = false
    onSelect(decoration.id)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (e.buttons === 0 && e.pointerType === 'mouse') return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const startX = rect.left + imageRect.offsetX + decoration.x * imageRect.width
    const startY = rect.top + imageRect.offsetY + decoration.y * imageRect.height
    const dx = Math.abs(e.clientX - startX)
    const dy = Math.abs(e.clientY - startY)
    if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) moved.current = true

    const x = Math.min(1, Math.max(0, (e.clientX - rect.left - imageRect.offsetX) / imageRect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top - imageRect.offsetY) / imageRect.height))
    onMove(decoration.id, x, y)
  }

  function onPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!moved.current) onRemove(decoration.id)
  }

  function onHandlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const startX = e.clientX
    const startScale = decoration.scale

    function onMoveHandle(ev: PointerEvent) {
      const delta = (ev.clientX - startX) / 80
      onResize(decoration.id, Math.min(2.6, Math.max(0.5, startScale + delta)))
    }
    function onUpHandle() {
      window.removeEventListener('pointermove', onMoveHandle)
      window.removeEventListener('pointerup', onUpHandle)
    }
    window.addEventListener('pointermove', onMoveHandle)
    window.addEventListener('pointerup', onUpHandle)
  }

  const size = BASE_SIZE * decoration.scale

  return (
    <div
      className={`sticker ${selected ? 'sticker--selected' : ''}`}
      style={{
        left: imageRect.offsetX + decoration.x * imageRect.width,
        top: imageRect.offsetY + decoration.y * imageRect.height,
        fontSize: size,
        transform: `translate(-50%, -50%) rotate(${decoration.rotation}deg)`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {decoration.sticker}
      {selected ? (
        <div className="sticker__handle" onPointerDown={onHandlePointerDown} />
      ) : null}
    </div>
  )
}
