import type { BucketAction, DrawingAction, Point, StrokeAction, ToolId } from '../storage/types'
import { HistoryManager } from './history/HistoryManager'

/** Stroke widths as a fraction of canvas width, so they scale across tablets. */
const TOOL_WIDTH: Record<'PENCIL' | 'BRUSH' | 'ERASER', number> = {
  PENCIL: 0.008,
  BRUSH: 0.022,
  ERASER: 0.036,
}

/** Points closer than this (in CSS px) add jitter, not detail. */
const MIN_POINT_DISTANCE = 2

/**
 * How far a pixel may differ from the seed and still be flooded. Strokes are
 * antialiased, so an exact match would leave a halo around every fill.
 */
const FILL_TOLERANCE = 48

function hexToRgb(hex: string): [number, number, number] | null {
  const value = hex.replace('#', '')
  if (value.length !== 6) return null
  const int = Number.parseInt(value, 16)
  if (Number.isNaN(int)) return null
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

export interface DrawingEngineOptions {
  onActionCommitted?: (actions: DrawingAction[]) => void
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean; isEmpty: boolean }) => void
  onFirstAction?: () => void
}

/**
 * Owns the canvas, the pointer stream and the action list. Deliberately outside
 * React: putting per-move coordinates into component state drops frames on a tablet.
 */
export class DrawingEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  /** Everything already committed, so a live stroke costs one drawImage. */
  private committed: HTMLCanvasElement
  private committedCtx: CanvasRenderingContext2D

  private history = new HistoryManager()
  private options: DrawingEngineOptions

  private tool: ToolId = 'PENCIL'
  private color = '#E4443B'

  private activePointerId: number | null = null
  private currentPoints: Point[] = []
  /** Pen wins over touch: while a stylus is in use, palms are ignored. */
  private lastPenAt = 0

  private cssWidth = 0
  private cssHeight = 0
  private frame: number | null = null

  constructor(canvas: HTMLCanvasElement, options: DrawingEngineOptions = {}) {
    this.canvas = canvas
    this.options = options

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas context unavailable')
    this.ctx = ctx

    this.committed = document.createElement('canvas')
    const committedCtx = this.committed.getContext('2d')
    if (!committedCtx) throw new Error('2D canvas context unavailable')
    this.committedCtx = committedCtx

    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerCancel)
    canvas.addEventListener('pointerleave', this.onPointerUp)

    this.resize()
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel)
    this.canvas.removeEventListener('pointerleave', this.onPointerUp)
    if (this.frame !== null) cancelAnimationFrame(this.frame)
  }

  setTool(tool: ToolId) { this.tool = tool }
  setColor(color: string) { this.color = color }

  get actions(): DrawingAction[] { return this.history.current }
  get isEmpty(): boolean { return this.history.size === 0 }

  /** Match the backing store to devicePixelRatio, or strokes look furry on Retina. */
  resize() {
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const dpr = window.devicePixelRatio || 1
    this.cssWidth = rect.width
    this.cssHeight = rect.height

    for (const [canvas, ctx] of [
      [this.canvas, this.ctx] as const,
      [this.committed, this.committedCtx] as const,
    ]) {
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    this.redrawCommitted()
    this.present()
  }

  loadActions(actions: DrawingAction[]) {
    this.history.load(actions)
    this.redrawCommitted()
    this.present()
    this.emitHistory()
  }

  /**
   * Wipe the drawing without losing it: every action moves to the redo stack,
   * so a child who clears by accident gets it back one press at a time.
   */
  clear() {
    while (this.history.undo()) { /* drain into redo */ }
    this.redrawCommitted()
    this.present()
    this.emitHistory()
    this.options.onActionCommitted?.(this.history.current)
  }

  /**
   * Take the drawing back to a known number of actions — how a step is redone:
   * everything the child drew since that point returns to the redo stack, so a
   * back button is never the same as losing work.
   */
  undoTo(count: number) {
    let changed = false
    while (this.history.size > Math.max(0, count) && this.history.undo()) changed = true
    if (!changed) return
    this.redrawCommitted()
    this.present()
    this.emitHistory()
    this.options.onActionCommitted?.(this.history.current)
  }

  undo() {
    if (!this.history.undo()) return
    this.redrawCommitted()
    this.present()
    this.emitHistory()
    this.options.onActionCommitted?.(this.history.current)
  }

  redo() {
    if (!this.history.redo()) return
    this.redrawCommitted()
    this.present()
    this.emitHistory()
    this.options.onActionCommitted?.(this.history.current)
  }

  /**
   * Flood fill from a tap. The area is whatever the child has enclosed with
   * their own strokes; an open shape floods the sheet, which undo takes back.
   */
  bucketFill(x: number, y: number) {
    const action: BucketAction = { type: 'BUCKET', x, y, color: this.color }
    if (!this.paintBucket(this.committedCtx, action)) return

    const wasEmpty = this.history.size === 0
    this.history.push(action)
    this.present()
    this.emitHistory()
    if (wasEmpty) this.options.onFirstAction?.()
    this.options.onActionCommitted?.(this.history.current)
  }

  /** Fills are chosen on the SVG guide layer, but they belong to the same history. */
  pushFill(regionId: string, color: string) {
    const wasEmpty = this.history.size === 0
    this.history.push({ type: 'FILL', regionId, color })
    this.emitHistory()
    if (wasEmpty) this.options.onFirstAction?.()
    this.options.onActionCommitted?.(this.history.current)
  }

  // --- pointer handling -------------------------------------------------

  private onPointerDown = (event: PointerEvent) => {
    if (this.shouldIgnore(event)) return

    if (this.tool === 'FILL') {
      // A tap with the bucket fills; there is no stroke to track.
      if (event.pointerType === 'mouse' && event.buttons !== 1) return
      const point = this.pointFrom(event)
      this.bucketFill(point.x / this.cssWidth, point.y / this.cssHeight)
      event.preventDefault()
      return
    }

    if (this.activePointerId !== null) return
    if (event.pointerType === 'mouse' && event.buttons !== 1) return

    if (event.pointerType === 'pen') this.lastPenAt = performance.now()

    this.activePointerId = event.pointerId
    this.canvas.setPointerCapture(event.pointerId)
    this.currentPoints = [this.pointFrom(event)]
    event.preventDefault()
    this.scheduleFrame()
  }

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return
    if (event.pointerType === 'pen') this.lastPenAt = performance.now()

    // Coalesced events keep fast strokes smooth instead of polygonal.
    const events = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : [event]

    for (const raw of events.length ? events : [event]) {
      const point = this.pointFrom(raw)
      const last = this.currentPoints[this.currentPoints.length - 1]
      if (last) {
        const dx = point.x - last.x
        const dy = point.y - last.y
        if (dx * dx + dy * dy < MIN_POINT_DISTANCE * MIN_POINT_DISTANCE) continue
      }
      this.currentPoints.push(point)
    }

    event.preventDefault()
    this.scheduleFrame()
  }

  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return
    this.commitStroke()
    this.releasePointer(event)
  }

  private onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.activePointerId) return
    this.currentPoints = []
    this.releasePointer(event)
    this.present()
  }

  private releasePointer(event: PointerEvent) {
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId)
    }
    this.activePointerId = null
  }

  /** A palm landing next to an active Apple Pencil must not draw. */
  private shouldIgnore(event: PointerEvent): boolean {
    return event.pointerType === 'touch' && performance.now() - this.lastPenAt < 800
  }

  private pointFrom(event: PointerEvent | { clientX: number; clientY: number; pressure?: number; pointerType?: string }): Point {
    const rect = this.canvas.getBoundingClientRect()
    const pressure = 'pressure' in event && event.pressure && event.pressure > 0 ? event.pressure : undefined
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: event.pointerType === 'pen' ? pressure : undefined,
    }
  }

  private commitStroke() {
    if (this.currentPoints.length === 0) return

    // A tap with no movement still deserves a dot.
    if (this.currentPoints.length === 1) {
      const only = this.currentPoints[0]
      this.currentPoints.push({ ...only, x: only.x + 0.01 })
    }

    const tool = this.tool === 'FILL' ? 'PENCIL' : this.tool
    const wasEmpty = this.history.size === 0

    const action: StrokeAction = {
      type: 'STROKE',
      tool,
      color: this.color,
      width: TOOL_WIDTH[tool],
      points: this.currentPoints.map((p) => ({
        x: p.x / this.cssWidth,
        y: p.y / this.cssHeight,
        ...(p.pressure !== undefined ? { pressure: p.pressure } : {}),
      })),
    }

    this.history.push(action)
    this.currentPoints = []

    this.paintStroke(this.committedCtx, action)
    this.present()
    this.emitHistory()
    if (wasEmpty) this.options.onFirstAction?.()
    this.options.onActionCommitted?.(this.history.current)
  }

  // --- rendering --------------------------------------------------------

  private scheduleFrame() {
    if (this.frame !== null) return
    this.frame = requestAnimationFrame(() => {
      this.frame = null
      this.present()
    })
  }

  /** Committed layer + the stroke in flight. */
  private present() {
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(this.committed, 0, 0)
    this.ctx.restore()

    if (this.currentPoints.length > 1) {
      const tool = this.tool === 'FILL' ? 'PENCIL' : this.tool
      this.paintStroke(this.ctx, {
        type: 'STROKE',
        tool,
        color: this.color,
        width: TOOL_WIDTH[tool],
        points: this.currentPoints.map((p) => ({
          x: p.x / this.cssWidth,
          y: p.y / this.cssHeight,
          ...(p.pressure !== undefined ? { pressure: p.pressure } : {}),
        })),
      })
    }
  }

  private redrawCommitted() {
    this.committedCtx.save()
    this.committedCtx.setTransform(1, 0, 0, 1, 0, 0)
    this.committedCtx.clearRect(0, 0, this.committed.width, this.committed.height)
    this.committedCtx.restore()

    for (const action of this.history.current) {
      if (action.type === 'STROKE') this.paintStroke(this.committedCtx, action)
      else if (action.type === 'BUCKET') this.paintBucket(this.committedCtx, action)
    }
  }

  /**
   * Quadratic curves through the midpoints of consecutive samples: cheap,
   * stable under finger jitter, and no corner artefacts at speed.
   */
  private paintStroke(ctx: CanvasRenderingContext2D, action: StrokeAction) {
    const points = action.points.map((p) => ({
      x: p.x * this.cssWidth,
      y: p.y * this.cssHeight,
      pressure: p.pressure,
    }))
    if (points.length < 2) return

    const baseWidth = action.width * this.cssWidth

    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (action.tool === 'ERASER') {
      // Only the child's own drawing lives on this canvas, so the guide is safe.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = action.color
    }

    if (action.tool === 'BRUSH' && points.some((p) => p.pressure !== undefined)) {
      // Pressure changes width, so each span is stroked on its own.
      for (let i = 1; i < points.length; i += 1) {
        const from = points[i - 1]
        const to = points[i]
        const pressure = to.pressure ?? from.pressure ?? 0.5
        ctx.lineWidth = baseWidth * (0.45 + pressure)
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }
      ctx.restore()
      return
    }

    ctx.lineWidth = baseWidth
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length - 1; i += 1) {
      const midX = (points[i].x + points[i + 1].x) / 2
      const midY = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY)
    }

    const last = points[points.length - 1]
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Scanline flood fill over the backing store. Returns false when the tap
   * lands on a pixel already the target colour, so nothing enters history.
   */
  private paintBucket(ctx: CanvasRenderingContext2D, action: BucketAction): boolean {
    const width = this.committed.width
    const height = this.committed.height
    if (width === 0 || height === 0) return false

    const startX = Math.round(action.x * width)
    const startY = Math.round(action.y * height)
    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return false

    const image = ctx.getImageData(0, 0, width, height)
    const data = image.data
    const seed = (startY * width + startX) * 4

    const target = [data[seed], data[seed + 1], data[seed + 2], data[seed + 3]]
    const fill = hexToRgb(action.color)
    if (!fill) return false

    const same =
      Math.abs(target[0] - fill[0]) < 4 &&
      Math.abs(target[1] - fill[1]) < 4 &&
      Math.abs(target[2] - fill[2]) < 4 &&
      Math.abs(target[3] - 255) < 4
    if (same) return false

    const matches = (index: number) => {
      // Transparent pixels only match other transparent ones, otherwise a fill
      // would bleed straight through the antialiased edge of a stroke.
      if (target[3] < 16) return data[index + 3] < 16
      if (data[index + 3] < 16) return false
      return (
        Math.abs(data[index] - target[0]) <= FILL_TOLERANCE &&
        Math.abs(data[index + 1] - target[1]) <= FILL_TOLERANCE &&
        Math.abs(data[index + 2] - target[2]) <= FILL_TOLERANCE
      )
    }

    const stack: number[] = [startX, startY]
    while (stack.length > 0) {
      const y = stack.pop() as number
      const x = stack.pop() as number

      let left = x
      let index = (y * width + left) * 4
      while (left >= 0 && matches(index)) {
        left -= 1
        index -= 4
      }
      left += 1

      let right = x
      index = (y * width + right) * 4
      while (right < width && matches(index)) {
        right += 1
        index += 4
      }
      right -= 1

      let spanAbove = false
      let spanBelow = false
      for (let px = left; px <= right; px += 1) {
        const at = (y * width + px) * 4
        data[at] = fill[0]
        data[at + 1] = fill[1]
        data[at + 2] = fill[2]
        data[at + 3] = 255

        if (y > 0) {
          const above = ((y - 1) * width + px) * 4
          const hit = matches(above)
          if (hit && !spanAbove) { stack.push(px, y - 1); spanAbove = true }
          else if (!hit) spanAbove = false
        }
        if (y < height - 1) {
          const below = ((y + 1) * width + px) * 4
          const hit = matches(below)
          if (hit && !spanBelow) { stack.push(px, y + 1); spanBelow = true }
          else if (!hit) spanBelow = false
        }
      }
    }

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.putImageData(image, 0, 0)
    ctx.restore()
    return true
  }

  private emitHistory() {
    this.options.onHistoryChange?.({
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
      isEmpty: this.history.size === 0,
    })
  }

  /** WebP preview for the gallery; falls back to PNG where WebP is unsupported. */
  async toThumbnail(width = 300, height = 225, background = '#FFFFFF'): Promise<Blob | undefined> {
    const out = document.createElement('canvas')
    out.width = width
    out.height = height
    const ctx = out.getContext('2d')
    if (!ctx) return undefined

    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)

    const scale = Math.min(width / this.canvas.width, height / this.canvas.height)
    const drawWidth = this.canvas.width * scale
    const drawHeight = this.canvas.height * scale
    ctx.drawImage(this.canvas, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)

    return new Promise((resolve) => {
      out.toBlob((blob) => resolve(blob ?? undefined), 'image/webp', 0.85)
    })
  }
}
