import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadSvg } from '../exercise/ExerciseLoader'
import type { ExerciseStep } from '../exercise/Exercise'
import './StepPreview.css'

interface Props {
  exerciseId: string
  steps: ExerciseStep[]
  currentIndex: number
  finalFile?: string
}

/**
 * The child needs to see where all this is going, so the finished picture sits
 * beside the canvas with the steps drawn in one by one up to the current one.
 */
export function StepPreview({ exerciseId, steps, currentIndex, finalFile }: Props) {
  const { t } = useTranslation()
  const [final, setFinal] = useState('')
  const [guides, setGuides] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    if (finalFile) {
      loadSvg(exerciseId, finalFile)
        .then((svg) => { if (!cancelled) setFinal(svg) })
        .catch(() => undefined)
    } else {
      setFinal('')
    }

    const files = steps.map((s) => s.guide).filter((f): f is string => Boolean(f))
    Promise.all(files.map((file) => loadSvg(exerciseId, file).then((svg) => [file, svg] as const)))
      .then((pairs) => { if (!cancelled) setGuides(Object.fromEntries(pairs)) })
      .catch(() => undefined)

    return () => { cancelled = true }
  }, [exerciseId, steps, finalFile])

  return (
    <aside className="preview">
      <div className="preview__label">{t('drawing.previewTitle')}</div>

      <div className="preview__art">
        {final ? (
          <div className="preview__final" dangerouslySetInnerHTML={{ __html: final }} />
        ) : null}
        {steps.map((step, index) => {
          if (!step.guide || step.mode === 'COLORING') return null
          const svg = guides[step.guide]
          if (!svg) return null
          return (
            <div
              key={step.id}
              className={`preview__step ${index <= currentIndex ? 'preview__step--on' : ''}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )
        })}
      </div>

      <div className="preview__steps">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={`preview__pip ${index < currentIndex ? 'preview__pip--done' : ''} ${
              index === currentIndex ? 'preview__pip--now' : ''
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </aside>
  )
}
