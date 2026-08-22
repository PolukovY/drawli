import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { Fireworks } from '../components/Fireworks'
import { useAppStore } from '../app/store'
import '../styles/ui.css'
import './GameShell.css'

interface Props {
  title: string
  /** Shown as a chip when the game is language-specific. */
  language?: string
  round: number
  total: number
  solved?: boolean
  finished: boolean
  earned: number
  onPlayAgain: () => void
  children: ReactNode
}

/** Header, celebration and finish screen — the frame every game sits in. */
export function GameShell({
  title, language, round, total, solved = false, finished, earned, onPlayAgain, children,
}: Props) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  if (finished) {
    return (
      <div className="center-screen">
        <Fireworks variant="finale" />
        <div className="game-done__title">{t('play.finished')}</div>
        <div className="completion__stars">
          <Icon name="star" size={30} color="var(--c-star)" filled />
          {t('complete.stars', { count: earned })}
        </div>
        <div className="row game-done__actions">
          <button className="btn btn--primary btn--hero" onClick={onPlayAgain}>
            <Icon name="again" size={24} color="#fff" width={2.4} />
            {t('play.again')}
          </button>
          <button className="btn btn--hero" onClick={() => navigate('/')}>
            {t('complete.another')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen game-screen">
      {solved ? <Fireworks /> : null}

      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{title}</div>
        {language ? <div className="chip">{language}</div> : null}
        <div className="muted game-round">{round + 1} / {total || 1}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {children}
    </div>
  )
}
