import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { Icon } from '../../components/Icon'
import './RockPaperScissorsPage.css'

const ROUNDS = 5
const ROCK = '✊'
const PAPER = '✋'
const SCISSORS = '✌️'
/** Long enough to look like thinking, short enough not to feel stuck. */
const COMPUTER_DELAY = 700

type Choice = typeof ROCK | typeof PAPER | typeof SCISSORS
type Outcome = 'win' | 'lose' | 'tie'

const CHOICES: Choice[] = [ROCK, PAPER, SCISSORS]

/** What beats what: the key beats the value. */
const BEATS: Record<Choice, Choice> = {
  [ROCK]: SCISSORS,
  [PAPER]: ROCK,
  [SCISSORS]: PAPER,
}

function judge(player: Choice, computer: Choice): Outcome {
  if (player === computer) return 'tie'
  return BEATS[player] === computer ? 'win' : 'lose'
}

/** Rock, paper, scissors against the computer. */
export function RockPaperScissorsPage() {
  const { t } = useTranslation()

  const rounds = useMemo(() => Array.from({ length: ROUNDS }, (_, i) => i), [])
  const game = useGameSession(rounds)

  const [player, setPlayer] = useState<Choice | null>(null)
  const [computer, setComputer] = useState<Choice | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [waiting, setWaiting] = useState(false)

  // Every round — and every replay — starts with empty hands.
  useEffect(() => {
    setPlayer(null)
    setComputer(null)
    setOutcome(null)
    setWaiting(false)
  }, [game.round, rounds])

  const over = outcome !== null

  function play(choice: Choice) {
    if (over || waiting) return
    setPlayer(choice)
    setComputer(null)
    setWaiting(true)

    window.setTimeout(() => {
      const move = CHOICES[Math.floor(Math.random() * CHOICES.length)]
      setComputer(move)
      setWaiting(false)

      const result = judge(choice, move)
      setOutcome(result)
      if (result === 'win') void game.solve()
      else game.miss()
    }, COMPUTER_DELAY)
  }

  const label: Record<Choice, string> = {
    [ROCK]: t('play.rpsRock'),
    [PAPER]: t('play.rpsPaper'),
    [SCISSORS]: t('play.rpsScissors'),
  }

  const hint = waiting
    ? t('play.rpsThinking')
    : outcome === 'win'
      ? t('play.rpsWin')
      : outcome === 'lose'
        ? t('play.rpsLose')
        : outcome === 'tie'
          ? t('play.rpsTie')
          : t('play.rpsHint')

  return (
    <GameShell
      title={t('play.rps')}
      round={game.round}
      total={game.total}
      solved={outcome === 'win'}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={game.restart}
    >
      <div className="game-board">
        <div className="muted game-hint">{hint}</div>

        <div className="rps__arena">
          <div className="rps__side">
            <div className="rps__label">{t('play.rpsYou')}</div>
            <div className="rps__slot">{player ?? '❔'}</div>
          </div>
          <div className="rps__vs">×</div>
          <div className="rps__side">
            <div className="rps__label">{t('play.rpsComputer')}</div>
            <div className={`rps__slot ${waiting ? 'rps__slot--thinking' : ''}`}>
              {computer ?? '❔'}
            </div>
          </div>
        </div>

        <div className="rps__choices">
          {CHOICES.map((choice) => (
            <button
              key={choice}
              className={`rps__choice ${player === choice ? 'rps__choice--picked' : ''}`}
              onClick={() => play(choice)}
              disabled={over || waiting}
              aria-label={label[choice]}
            >
              {choice}
            </button>
          ))}
        </div>

        {over ? (
          <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
            {outcome === 'win' ? <span className="game-next__fill" /> : null}
            <span className="game-next__label">
              {t('play.next')}
              <Icon name="arrow" size={24} color="#fff" width={2.6} />
            </span>
          </button>
        ) : null}
      </div>
    </GameShell>
  )
}
