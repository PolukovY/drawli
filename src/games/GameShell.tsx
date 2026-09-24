import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { Fireworks } from '../components/Fireworks'
import { useAppStore } from '../app/store'
import { GAMES } from './catalogue'
import { addGameStars, recordGamePlay } from '../storage/GameStatsRepository'
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
  const location = useLocation()
  const { t } = useTranslation()
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  // One integration point for the games audit (`doc/ai-roadmap.md`): every
  // game renders through this shell, so recording a play here — instead of
  // in each of the ~30 game pages — covers all of them for free. The id is
  // read from the route rather than passed as a prop, for the same reason.
  const gameId = GAMES.find((g) => g.path === location.pathname)?.id ?? null
  const lastEarnedRef = useRef(0)

  useEffect(() => {
    if (gameId) void recordGamePlay(gameId)
  }, [gameId])

  // `earned` only ever grows within a session — a replay resets it to 0
  // first — so any increase is stars the child just earned in this game.
  useEffect(() => {
    if (gameId && earned > lastEarnedRef.current) {
      void addGameStars(gameId, earned - lastEarnedRef.current)
    }
    lastEarnedRef.current = earned
  }, [gameId, earned])

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
