import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/Icon'
import { Fireworks } from '../../components/Fireworks'
import { playSound } from '../../audio/sounds'
import { useAppStore } from '../../app/store'
import './RockPaperScissorsPage.css'

type Move = 'rock' | 'paper' | 'scissors'
type Outcome = 'win' | 'tie' | 'lose'

const MOVES: Move[] = ['rock', 'paper', 'scissors']
const ICON: Record<Move, IconName> = { rock: 'rock', paper: 'paper', scissors: 'scissorsHand' }
/** Rock blunts scissors, scissors cut paper, paper wraps rock. */
const BEATS: Record<Move, Move> = { rock: 'scissors', paper: 'rock', scissors: 'paper' }

const ROUNDS = 5
/** Long enough to read the result, short enough to keep playing. */
const REVEAL_MS = 900
const NEXT_DELAY = 2600
const STARS: Record<Outcome, number> = { win: 2, tie: 1, lose: 0 }

function outcomeOf(child: Move, computer: Move): Outcome {
  if (child === computer) return 'tie'
  return BEATS[child] === computer ? 'win' : 'lose'
}

function randomMove(): Move {
  return MOVES[Math.floor(Math.random() * MOVES.length)]
}

/**
 * Rock, paper, scissors against the tablet. The child picks first, so nothing
 * on screen already knows what beats what; the computer's hand only opens
 * once the child has committed to theirs.
 */
export function RockPaperScissorsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [round, setRound] = useState(0)
  const [child, setChild] = useState<Move | null>(null)
  const [computer, setComputer] = useState<Move | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [tally, setTally] = useState({ win: 0, tie: 0, lose: 0 })
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)

  const roundRef = useRef(0)
  roundRef.current = round

  const play = useCallback((move: Move) => {
    if (child) return
    playSound('tap')
    setChild(move)
    setRevealed(false)

    window.setTimeout(() => {
      const theirs = randomMove()
      const result = outcomeOf(move, theirs)
      setComputer(theirs)
      setOutcome(result)
      setRevealed(true)
      setTally((prev) => ({ ...prev, [result]: prev[result] + 1 }))

      const gained = STARS[result]
      if (gained > 0) {
        setEarned((prev) => prev + gained)
        void awardStars(gained)
      }
      playSound(result === 'win' ? 'correct' : result === 'tie' ? 'next' : 'soft')
    }, REVEAL_MS)
  }, [child, awardStars])

  // The round turns by itself once the result has had a moment on screen —
  // a tie or a loss is not something to linger on asking the child to confirm.
  useEffect(() => {
    if (!revealed) return
    const timer = window.setTimeout(() => {
      if (roundRef.current + 1 < ROUNDS) {
        setRound(roundRef.current + 1)
        setChild(null)
        setComputer(null)
        setRevealed(false)
        setOutcome(null)
      } else {
        setFinished(true)
      }
    }, NEXT_DELAY)
    return () => window.clearTimeout(timer)
  }, [revealed])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  function playAgain() {
    setRound(0)
    setChild(null)
    setComputer(null)
    setRevealed(false)
    setOutcome(null)
    setTally({ win: 0, tie: 0, lose: 0 })
    setEarned(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="center-screen">
        <Fireworks variant="finale" />
        <div className="game-done__title">{t('play.finished')}</div>
        <div className="completion__stars">
          <Icon name="star" size={30} color="var(--c-star)" filled />
          {t('complete.stars', { count: earned })}
        </div>
        <div className="muted" style={{ fontSize: 18 }}>
          {t('play.rpsTally', tally)}
        </div>
        <div className="row game-done__actions">
          <button className="btn btn--primary btn--hero" onClick={playAgain}>
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
      {outcome === 'win' ? <Fireworks /> : null}

      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.rps')}</div>
        <div className="muted game-round">{round + 1} / {ROUNDS}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      <div className="rps">
        <div className="rps__table">
          <div className="rps__side">
            <div className={`rps__hand rps__hand--child ${child ? 'rps__hand--set' : ''} ${!child ? 'rps__hand--shake' : ''}`}>
              <Icon name={child ? ICON[child] : 'rock'} size={64} color="#fff" width={1.6} />
            </div>
            <div className="muted">{t('play.rpsYou')}</div>
          </div>

          <div className="rps__vs">{t('play.rpsVs')}</div>

          <div className="rps__side">
            <div className={`rps__hand rps__hand--computer ${revealed ? 'rps__hand--set' : ''} ${child && !revealed ? 'rps__hand--shake' : ''}`}>
              {revealed && computer ? (
                <Icon name={ICON[computer]} size={64} color="#fff" width={1.6} />
              ) : (
                <span className="rps__question">?</span>
              )}
            </div>
            <div className="muted">{t('play.rpsComputer')}</div>
          </div>
        </div>

        {revealed && outcome ? (
          <div className={`rps__result rps__result--${outcome}`}>
            {t(`play.rps${outcome === 'win' ? 'Win' : outcome === 'tie' ? 'Tie' : 'Lose'}`)}
          </div>
        ) : (
          <div className="muted game-hint">{child ? t('play.rpsWaiting') : t('play.rpsHint')}</div>
        )}

        <div className="rps__choices">
          {MOVES.map((move) => (
            <button
              key={move}
              className={`rps__choice ${child === move ? 'rps__choice--picked' : ''}`}
              onClick={() => play(move)}
              disabled={Boolean(child)}
            >
              <Icon name={ICON[move]} size={40} color={child === move ? '#fff' : 'var(--c-accent)'} width={1.8} />
              <span>{t(`play.rps${move[0].toUpperCase()}${move.slice(1)}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
