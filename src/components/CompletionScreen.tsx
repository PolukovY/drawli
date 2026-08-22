import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import { Fireworks } from './Fireworks'
import './CompletionScreen.css'

interface Props {
  name: string
  stars: number
  thumbnail?: string
  onAnother: () => void
  onAgain: () => void
}

const CONFETTI = [
  { x: 12, y: 12, c: '#FFC53D' }, { x: 25, y: 20, c: '#7C5CFF' }, { x: 80, y: 16, c: '#34C77B' },
  { x: 68, y: 10, c: '#E4443B' }, { x: 18, y: 43, c: '#4E86E8' }, { x: 86, y: 50, c: '#F08BB4' },
  { x: 32, y: 9, c: '#4EA55F' }, { x: 61, y: 84, c: '#FFC53D' }, { x: 14, y: 81, c: '#9B5CE0' },
  { x: 88, y: 81, c: '#4E86E8' },
]

export function CompletionScreen({ name, stars, thumbnail, onAnother, onAgain }: Props) {
  const { t } = useTranslation()

  return (
    <div className="completion">
      <Fireworks variant="finale" />
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            style={{ left: `${piece.x}%`, top: `${piece.y}%`, background: piece.c, animationDelay: `${i * 0.06}s` }}
          />
        ))}
      </div>

      <div className="completion__title">{t('complete.title', { name })}</div>
      <div className="subtitle">{t('complete.subtitle')}</div>

      <div className="completion__frame">
        {thumbnail ? <img src={thumbnail} alt="" /> : null}
      </div>

      <div className="completion__stars">
        <Icon name="star" size={34} color="var(--c-star)" filled />
        {t('complete.stars', { count: stars })}
      </div>

      <div className="row" style={{ gap: 14 }}>
        <button className="btn btn--primary btn--hero" onClick={onAnother}>
          <Icon name="gallery" size={26} color="#fff" width={2.4} />
          {t('complete.another')}
        </button>
        <button className="btn btn--hero" onClick={onAgain}>
          <Icon name="again" size={26} color="var(--c-text-soft)" width={2.4} />
          {t('complete.again')}
        </button>
      </div>
    </div>
  )
}
