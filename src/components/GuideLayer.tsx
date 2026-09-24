import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { loadSvg } from '../exercise/ExerciseLoader'
import type { ExerciseStep } from '../exercise/Exercise'
import './GuideLayer.css'

interface Props {
  exerciseId: string
  steps: ExerciseStep[]
  currentIndex: number
  /** Runs a light along the current outline to show where the stroke starts. */
  showTrace?: boolean
  /**
   * Per-letter guide strength for `DrawingPage`'s letter exercises (see
   * `LetterMastery`): 0 = strong dotted (the default below), 1 = weak and
   * thinned. Omitted for every other exercise type, which always gets the
   * strong outline this component has always shown.
   */
  level?: 0 | 1
}

export function GuideLayer({ exerciseId, steps, currentIndex, showTrace = true, level = 0 }: Props) {
  const [markup, setMarkup] = useState<Record<string, string>>({})
  const traceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const files = steps
      .slice(0, currentIndex + 1)
      .map((s) => s.guide)
      .filter((f): f is string => Boolean(f))

    Promise.all(files.map((file) => loadSvg(exerciseId, file).then((svg) => [file, svg] as const)))
      .then((pairs) => {
        if (!cancelled) setMarkup((prev) => ({ ...prev, ...Object.fromEntries(pairs) }))
      })
      .catch(() => undefined)

    return () => { cancelled = true }
  }, [exerciseId, steps, currentIndex])

  const currentFile = steps[currentIndex]?.mode === 'COLORING' ? undefined : steps[currentIndex]?.guide
  const currentMarkup = currentFile ? markup[currentFile] : undefined

  /**
   * Measure each shape and drive the dash from its real length. The tidier
   * pathLength="1" trick silently no-ops when the attribute lands after the
   * browser has already resolved the dash, and the comet degrades into a line.
   */
  useLayoutEffect(() => {
    const container = traceRef.current
    if (!container || !currentMarkup) return

    const apply = () => {
      const shapes = container.querySelectorAll<SVGGeometryElement>(
        'path, circle, ellipse, rect, line, polyline, polygon',
      )
      shapes.forEach((shape, i) => {
        const length = typeof shape.getTotalLength === 'function' ? shape.getTotalLength() : 0
        if (!length) return
        shape.style.strokeDasharray = `${(length * 0.16).toFixed(1)} ${length.toFixed(1)}`
        shape.style.setProperty('--dash-length', `${length.toFixed(1)}`)
        shape.style.animationDelay = `${i * 0.18}s`
      })
    }

    apply()
    // Layout can still be settling on first paint; one more pass is cheap.
    const frame = requestAnimationFrame(apply)
    return () => cancelAnimationFrame(frame)
  }, [currentMarkup])

  return (
    <div className="guide-stack" aria-hidden="true">
      {steps.slice(0, currentIndex + 1).map((step, index) => {
        if (!step.guide || step.mode === 'COLORING') return null
        const svg = markup[step.guide]
        if (!svg) return null
        const isCurrent = index === currentIndex
        return (
          <div
            key={step.id}
            className={`guide ${isCurrent ? 'guide--current' : 'guide--past'} ${
              isCurrent && level === 1 ? 'guide--weak' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      })}

      {showTrace && currentMarkup ? (
        <div
          key={`trace-${currentIndex}`}
          ref={traceRef}
          className="guide guide--trace"
          dangerouslySetInnerHTML={{ __html: currentMarkup }}
        />
      ) : null}
    </div>
  )
}
