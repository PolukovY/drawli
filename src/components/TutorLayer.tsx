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

type Shape = { el: SVGGeometryElement; length: number }

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
  const endRef = useRef(onDemoEnd)
  endRef.current = onDemoEnd

  const file = step?.mode === 'COLORING' ? undefined : step?.guide

  useEffect(() => {
    let cancelled = false
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
   * One animation loop drives both modes. The pace dot runs for as long as the
   * step is open; the hand runs once through every shape and then hands over.
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

    const place = (node: SVGGraphicsElement, x: number, y: number, extra = '') => {
      node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})${extra}`)
    }

    // Measured here rather than kept in a ref: a step change swaps the markup,
    // and elements from the previous step are detached — asking one of those
    // for a point throws "the element is in an inactive document".
    const shapes = measure(host)
    // The injected markup can still be one frame away from being laid out.
    if (shapes.length === 0) {
      frameRef.current = requestAnimationFrame(() => setSettled((n) => n + 1))
      return () => cancelAnimationFrame(frameRef.current)
    }

    // The step's first stroke carries the markers: where to put the pencil
    // down and which way to go.
    const first = shapes[0]
    const from = first.el.getPointAtLength(0)
    const towards = first.el.getPointAtLength(Math.min(first.length * 0.08, 40))
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

    const tick = (now: number) => {
      if (!startedAt) startedAt = now

      if (demo) {
        const shape = shapes[shapeIndex]
        const progress = Math.min((now - startedAt) / DEMO_MS, 1)
        const point = shape.el.getPointAtLength(shape.length * progress)

        // The trail is the step's own outline, revealed as the hand passes.
        trail.setAttribute('d', pathOf(shape.el))
        trail.style.strokeDasharray = `${shape.length}`
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
        const shape = shapes[0]
        const progress = ((now - startedAt) % PACE_MS) / PACE_MS
        const point = shape.el.getPointAtLength(shape.length * progress)
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

/** The step's own shapes, in the order the exercise draws them. */
function measure(host: HTMLElement): Shape[] {
  const found = Array.from(
    host.querySelectorAll<SVGGeometryElement>(
      '.tutor__source svg > :is(path, circle, ellipse, rect, line, polyline, polygon)',
    ),
  )
  return found
    .filter((el) => el.isConnected && typeof el.getTotalLength === 'function')
    .map((el) => ({ el, length: el.getTotalLength() }))
    .filter((shape) => shape.length > 0)
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
