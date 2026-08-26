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
  /** The shaded picture is the goal, not a faint target: it shows at full strength. */
  finalIsArt?: boolean
  /** Letters and digits have no colouring sheet, so the label differs. */
  labelKey?: string
}

/**
 * The child needs to see where all this is going, so the finished picture sits
 * beside the canvas with the steps drawn in one by one up to the current one.
 */
export function StepPreview({
  exerciseId, steps, currentIndex, finalFile, finalIsArt, labelKey = 'drawing.previewTitle',
}: Props) {
  const { t } = useTranslation()
  const [final, setFinal] = useState('')
  const [guides, setGuides] = useState<Record<string, string>>({})
  const [zoomed, setZoomed] = useState(false)

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
      <div className="preview__label">{t(labelKey)}</div>

      <button
        className="preview__art"
        onClick={() => setZoomed(true)}
        aria-label={t(labelKey)}
      >
        {final ? (
          <div
            className={`preview__final ${finalIsArt ? 'preview__final--art' : ''}`}
            dangerouslySetInnerHTML={{ __html: final }}
          />
        ) : (
          // No colouring sheet (letters, digits, motor drills): the faint target
          // is every step at once, so the child still sees where this is going.
          steps.map((step) =>
            step.guide && guides[step.guide] ? (
              <div
                key={`ghost-${step.id}`}
                className="preview__final preview__ghost"
                dangerouslySetInnerHTML={{ __html: guides[step.guide] }}
              />
            ) : null,
          )
        )}
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
      </button>

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

      {zoomed ? (
        <div className="preview__zoom" onClick={() => setZoomed(false)}>
          <div className="preview__zoom-card" onClick={(e) => e.stopPropagation()}>
            <div className="preview__label">{t(labelKey)}</div>
            <div
              className="preview__zoom-art"
              dangerouslySetInnerHTML={{
                __html: final || steps.map((s) => (s.guide ? guides[s.guide] ?? '' : '')).join(''),
              }}
            />
            <button className="btn btn--primary" onClick={() => setZoomed(false)}>
              {t('coach.done')}
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
