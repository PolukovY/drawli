import { useEffect, useState } from 'react'
import { loadSvg } from '../exercise/ExerciseLoader'
import type { ExerciseStep } from '../exercise/Exercise'
import './GuideLayer.css'

interface Props {
  exerciseId: string
  steps: ExerciseStep[]
  currentIndex: number
}

/**
 * Steps already traced stay as a faint outline; the current one is the dashed
 * guide the child follows. Both sit under the drawing canvas.
 */
export function GuideLayer({ exerciseId, steps, currentIndex }: Props) {
  const [markup, setMarkup] = useState<Record<string, string>>({})

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

  return (
    <div className="guide-stack" aria-hidden="true">
      {steps.slice(0, currentIndex + 1).map((step, index) => {
        if (!step.guide || step.mode === 'COLORING') return null
        const svg = markup[step.guide]
        if (!svg) return null
        return (
          <div
            key={step.id}
            className={`guide ${index === currentIndex ? 'guide--current' : 'guide--past'}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      })}
    </div>
  )
}
