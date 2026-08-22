import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import './CoachMarks.css'

export interface CoachStep {
  /** Element to spotlight; the step is skipped when nothing matches. */
  selector: string
  titleKey: string
  textKey: string
  placement?: 'above' | 'below'
}

interface Props {
  steps: CoachStep[]
  onDone: () => void
}

interface Box { top: number; left: number; width: number; height: number }

/** Card height plus breathing room, so a card near an edge never clips. */
const CARD_MAX_HEIGHT = 232

/**
 * A four-year-old cannot read a manual, so the app shows what to do: one target
 * at a time, spotlit, with a hand pointing at it.
 */
export function CoachMarks({ steps, onDone }: Props) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [box, setBox] = useState<Box | null>(null)

  const step = steps[index]

  useLayoutEffect(() => {
    if (!step) return
    let frame = 0

    const measure = () => {
      const target = document.querySelector(step.selector)
      if (!target) {
        setBox(null)
        return
      }
      const rect = target.getBoundingClientRect()
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
    }

    // The target may still be mounting (SVG thumbnails, async exercise load).
    measure()
    frame = window.setTimeout(measure, 220)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(frame)
      window.removeEventListener('resize', measure)
    }
  }, [step])

  useEffect(() => {
    if (steps.length === 0) onDone()
  }, [steps.length, onDone])

  if (!step) return null

  const advance = () => {
    if (index + 1 < steps.length) setIndex(index + 1)
    else onDone()
  }

  const placement = step.placement ?? 'below'
  const cardTop = box
    ? placement === 'below'
      ? Math.min(box.top + box.height + 18, window.innerHeight - CARD_MAX_HEIGHT)
      : Math.max(box.top - CARD_MAX_HEIGHT - 8, 16)
    : window.innerHeight / 2 - 90
  const cardLeft = box
    ? Math.min(Math.max(box.left + box.width / 2 - 190, 16), window.innerWidth - 396)
    : window.innerWidth / 2 - 190

  return (
    <div className="coach" onClick={advance}>
      {box ? (
        <div
          className="coach__spot"
          style={{
            top: box.top - 10,
            left: box.left - 10,
            width: box.width + 20,
            height: box.height + 20,
          }}
        />
      ) : null}

      {box ? (
        <div
          className="coach__hand"
          style={{ top: box.top + box.height / 2 - 22, left: box.left + box.width / 2 - 18 }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="13" fill="#fff" opacity="0.92" />
            <circle cx="22" cy="22" r="7" fill="var(--c-accent)" />
          </svg>
        </div>
      ) : null}

      <div className="coach__card" style={{ top: cardTop, left: cardLeft }} onClick={(e) => e.stopPropagation()}>
        <div className="coach__title">{t(step.titleKey)}</div>
        <div className="coach__text">{t(step.textKey)}</div>
        <div className="coach__foot">
          <div className="coach__pips">
            {steps.map((s, i) => (
              <span key={s.selector + s.titleKey} className={i === index ? 'on' : ''} />
            ))}
          </div>
          <button className="btn btn--primary" onClick={advance}>
            {index + 1 < steps.length ? t('coach.next') : t('coach.done')}
            <Icon name="arrow" size={22} color="#fff" width={2.6} />
          </button>
        </div>
      </div>
    </div>
  )
}
