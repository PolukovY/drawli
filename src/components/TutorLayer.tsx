import { useEffect, useRef, useState } from 'react'
import { loadSvg } from '../exercise/ExerciseLoader'
import type { ExerciseStep } from '../exercise/Exercise'
import './TutorLayer.css'

interface Props {
  exerciseId: string
  step?: ExerciseStep
  /** Play the hand demonstration once; the parent clears it when it ends. */
  demo: boolean
  onDemoEnd: () => void
}

/** How long the hand takes per shape, and how long the pace dot loops. */
const DEMO_MS = 2600
const PACE_MS = 4200
/**
 * The dot shows the pace a few times and then parks itself. It used to loop
 * for as long as the step was open, which meant the drawing screen animated at
 * 60fps for the whole session — on a tablet that is a core kept busy, and the
 * app grows sluggish long before the child is finished.
 */
const PACE_LOOPS = 3
/** Points sampled off each shape, once, so no frame has to ask for geometry. */
const SAMPLES = 160
/** The markup can be a frame from being laid out; it is never many. */
const MEASURE_ATTEMPTS = 5

type Shape = { points: { x: number; y: number }[]; length: number; d: string }

/**
 * The part of the lesson that shows *how*, not *what*: a green dot where the
 * stroke starts, an arrow for the direction, a dot moving at the speed the
 * child should follow — and, on demand, a hand that draws the whole step.
 *
 * Everything is measured off the step's own guide SVG, so no exercise needs
 * extra data for any of it.
 */
export function TutorLayer({ exerciseId, step, demo, onDemoEnd }: Props) {
  const [markup, setMarkup] = useState('')
  /** Bumped when the markup was not measurable yet, to try again next frame. */
  const [settled, setSettled] = useState(0)
  const hostRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  /** Guards the re-measure retry: a guide it cannot measure must not spin. */
  const attemptsRef = useRef(0)
  const endRef = useRef(onDemoEnd)
  endRef.current = onDemoEnd

  const file = step?.mode === 'COLORING' ? undefined : step?.guide

  useEffect(() => {
    let cancelled = false
    attemptsRef.current = 0
    if (!file) {
      setMarkup('')
      return
    }
    loadSvg(exerciseId, file)
      .then((svg) => { if (!cancelled) setMarkup(svg) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [exerciseId, file])

  /**
   * One animation loop drives both modes, and both of them end: the pace dot
   * after a few passes, the hand once it has been through every shape. Nothing
   * on this screen is left animating behind the child's back.
   */
  useEffect(() => {
    const host = hostRef.current
    if (!host || !markup) return

    const overlay = host.querySelector<SVGGElement>('.tutor__overlay')
    const runner = host.querySelector<SVGCircleElement>('.tutor__runner')
    const arrow = host.querySelector<SVGGElement>('.tutor__arrow')
    const start = host.querySelector<SVGGElement>('.tutor__start')
    const hand = host.querySelector<SVGGElement>('.tutor__hand')
    const trail = host.querySelector<SVGPathElement>('.tutor__trail')
    if (!overlay || !runner || !arrow || !start || !hand || !trail) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let startedAt = 0
    let shapeIndex = 0
    let drawnShape = -1

    const place = (node: SVGGraphicsElement, x: number, y: number, extra = '') => {
      node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})${extra}`)
    }

    // Measured here rather than kept in a ref: a step change swaps the markup,
    // and elements from the previous step are detached — asking one of those
    // for a point throws "the element is in an inactive document".
    //
    // Sampled once, too. getPointAtLength forces layout, so asking for a point
    // every frame made the drawing screen recalculate style and lay out sixty
    // times a second for nothing.
    const shapes = measure(host)
    // The injected markup can still be one frame away from being laid out.
    if (shapes.length === 0) {
      if (attemptsRef.current >= MEASURE_ATTEMPTS) return
      attemptsRef.current += 1
      frameRef.current = requestAnimationFrame(() => setSettled((n) => n + 1))
      return () => cancelAnimationFrame(frameRef.current)
    }

    // The step's first stroke carries the markers: where to put the pencil
    // down and which way to go.
    const first = shapes[0]
    const from = first.points[0]
    const towards = pointOn(first, Math.min(first.length * 0.08, 40) / first.length)
    place(start, from.x, from.y)
    place(
      arrow,
      towards.x,
      towards.y,
      ` rotate(${(Math.atan2(towards.y - from.y, towards.x - from.x) * 180 / Math.PI).toFixed(1)})`,
    )

    if (reduce) {
      runner.style.opacity = '0'
      if (demo) endRef.current()
      return
    }

    // Back on for this step, in case the last one left it parked.
    runner.style.opacity = ''

    const tick = (now: number) => {
      if (!startedAt) startedAt = now

      if (demo) {
        const shape = shapes[shapeIndex]
        const progress = Math.min((now - startedAt) / DEMO_MS, 1)
        const point = pointOn(shape, progress)

        // The trail is the step's own outline, revealed as the hand passes.
        // Its shape only changes when the hand moves on to the next stroke.
        if (drawnShape !== shapeIndex) {
          trail.setAttribute('d', shape.d)
          trail.style.strokeDasharray = `${shape.length}`
          drawnShape = shapeIndex
        }
        trail.style.strokeDashoffset = `${shape.length * (1 - progress)}`
        place(hand, point.x, point.y, ' scale(0.34)')

        if (progress >= 1) {
          shapeIndex += 1
          startedAt = now
          if (shapeIndex >= shapes.length) {
            endRef.current()
            return
          }
        }
      } else {
        const elapsed = now - startedAt
        // Shown, then over: the child is left with a still screen to draw on.
        if (elapsed >= PACE_MS * PACE_LOOPS) {
          runner.style.opacity = '0'
          return
        }
        const point = pointOn(shapes[0], (elapsed % PACE_MS) / PACE_MS)
        runner.setAttribute('cx', point.x.toFixed(1))
        runner.setAttribute('cy', point.y.toFixed(1))
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [markup, demo, settled])

  if (!markup) return null

  return (
    <div className={`tutor ${demo ? 'tutor--demo' : ''}`} ref={hostRef} aria-hidden="true">
      {/* The step's own shapes, invisible: they are here to be measured. */}
      <div key={file} className="tutor__source" dangerouslySetInnerHTML={{ __html: markup }} />

      <svg viewBox="0 0 400 400" className="tutor__svg">
        <g className="tutor__overlay">
          <path className="tutor__trail" d="" />

          <g className="tutor__start">
            <circle r="15" />
            <path d="M-5 0 L-1 5 L6 -5" />
          </g>

          <g className="tutor__arrow">
            <path d="M0 0 L-13 -8 M0 0 L-13 8" />
          </g>

          <circle className="tutor__runner" r="11" cx="-50" cy="-50" />

          <g className="tutor__hand">
            <path className="tutor__pencil" d="M2 4 L46 62 L34 72 L-6 12 Z" />
            <path className="tutor__ferrule" d="M-6 12 L2 4 L10 14 L1 21 Z" />
            <path className="tutor__tip" d="M0 2 L6 9 L1 13 Z" />
            <path className="tutor__palm" d="M30 66 q34 22 46 62 q10 44 -20 62 q-34 20 -62 -6 q-24 -24 -18 -60 q6 -34 30 -46 z" />
            <path className="tutor__knuckle" d="M22 116 q28 -12 52 4" />
            <path className="tutor__knuckle" d="M18 142 q30 -12 56 2" />
          </g>
        </g>
      </svg>
    </div>
  )
}

/**
 * The step's own shapes, in the order the exercise draws them, each sampled
 * into a list of points. Every geometry question the animation would ask is
 * answered here, once per step, instead of once per frame.
 */
function measure(host: HTMLElement): Shape[] {
  const found = Array.from(
    host.querySelectorAll<SVGGeometryElement>(
      '.tutor__source svg > :is(path, circle, ellipse, rect, line, polyline, polygon)',
    ),
  )
  const shapes: Shape[] = []

  for (const el of found) {
    if (!el.isConnected || typeof el.getTotalLength !== 'function') continue
    const length = el.getTotalLength()
    if (!length) continue

    const points: { x: number; y: number }[] = []
    for (let i = 0; i <= SAMPLES; i += 1) {
      const point = el.getPointAtLength((length * i) / SAMPLES)
      points.push({ x: point.x, y: point.y })
    }
    shapes.push({ points, length, d: pathOf(el) })
  }

  return shapes
}

/** Where the hand or the dot is at `progress` (0..1) along a sampled shape. */
function pointOn(shape: Shape, progress: number): { x: number; y: number } {
  const at = Math.min(Math.max(progress, 0), 1) * SAMPLES
  const index = Math.floor(at)
  const from = shape.points[index]
  const to = shape.points[index + 1] ?? from
  const fraction = at - index
  return {
    x: from.x + (to.x - from.x) * fraction,
    y: from.y + (to.y - from.y) * fraction,
  }
}

/**
 * The trail has to be a path, and half the guides are circles and ellipses.
 * Rather than convert every kind, the element is asked for its own outline
 * where it has one and approximated with arcs where it does not.
 */
function pathOf(el: SVGGeometryElement): string {
  const tag = el.tagName.toLowerCase()
  const num = (name: string) => Number(el.getAttribute(name) ?? 0)

  if (tag === 'path') return el.getAttribute('d') ?? ''

  if (tag === 'circle') {
    const cx = num('cx'), cy = num('cy'), r = num('r')
    return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
  }
  if (tag === 'ellipse') {
    const cx = num('cx'), cy = num('cy'), rx = num('rx'), ry = num('ry')
    return `M${cx} ${cy - ry} A${rx} ${ry} 0 1 1 ${cx - 0.01} ${cy - ry} Z`
  }
  if (tag === 'line') return `M${num('x1')} ${num('y1')} L${num('x2')} ${num('y2')}`
  if (tag === 'rect') {
    const x = num('x'), y = num('y'), w = num('width'), h = num('height')
    return `M${x} ${y} H${x + w} V${y + h} H${x} Z`
  }
  const points = el.getAttribute('points')
  if (points) return `M${points}${tag === 'polygon' ? ' Z' : ''}`
  return ''
}
