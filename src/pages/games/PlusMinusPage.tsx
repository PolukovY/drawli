import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './PlusMinusPage.css'

const ROUNDS = 5
const MAX_ANSWER = 9
const THINGS = ['🍎', '🍓', '🐞', '⭐', '🍌', '🐟', '🎈', '🍄']

interface Round {
  thing: string
  left: number
  right: number
  /** Minus is shown as things being taken away, not as an abstract sign. */
  plus: boolean
  answer: number
  choices: number[]
}

/** Adding and taking away, with the things still on the table to be counted. */
export function PlusMinusPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<number[]>([])

  const rounds = useMemo<Round[]>(() => {
    const out: Round[] = []
    let value = seed
    const roll = (max: number) => {
      value = (value * 1103515245 + 12345) % 2147483648
      return value % max
    }

    for (let i = 0; i < ROUNDS; i += 1) {
      const thing = shuffle(THINGS, seed + i * 13)[0]
      // The first rounds only add; taking away comes once adding is steady.
      const plus = i < 2 ? true : roll(2) === 0
      let left: number
      let right: number
      if (plus) {
        left = 1 + roll(4)
        right = 1 + roll(Math.min(4, MAX_ANSWER - left))
      } else {
        left = 3 + roll(5)
        right = 1 + roll(left - 1)
      }
      const answer = plus ? left + right : left - right
      const others = shuffle(
        Array.from({ length: MAX_ANSWER + 1 }, (_, n) => n).filter((n) => n !== answer),
        seed + i * 19,
      ).slice(0, 3)
      out.push({ thing, left, right, plus, answer, choices: shuffle([answer, ...others], seed + i * 23) })
    }
    return out
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(value: number) {
    if (!current || game.solved || wrong.includes(value)) return
    if (value === current.answer) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, value])
  }

  return (
    <GameShell
      title={t('play.plusMinus')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 71); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">
            {current.plus ? t('play.plusMinusAdd') : t('play.plusMinusTake')}
          </div>

          <div className="sum__row card">
            <span className="sum__group">
              {Array.from({ length: current.left }, (_, i) => (
                <span
                  key={i}
                  // In a subtraction the last few are crossed out rather than
                  // hidden: a child counts what is left, they cannot count a gap.
                  className={`sum__thing ${
                    !current.plus && i >= current.left - current.right ? 'sum__thing--gone' : ''
                  }`}
                >
                  {current.thing}
                </span>
              ))}
            </span>

            {current.plus ? (
              <>
                <span className="sum__sign">+</span>
                <span className="sum__group">
                  {Array.from({ length: current.right }, (_, i) => (
                    <span key={i} className="sum__thing">{current.thing}</span>
                  ))}
                </span>
              </>
            ) : null}

            <span className="sum__sign">=</span>
            <span className={`sum__answer ${game.solved ? 'sum__answer--ok' : ''}`}>
              {game.solved ? current.answer : '?'}
            </span>
          </div>

          <div className="sum__choices">
            {current.choices.map((value) => (
              <button
                key={value}
                className={`sum__choice ${game.solved && value === current.answer ? 'sum__choice--ok' : ''} ${
                  wrong.includes(value) ? 'sum__choice--off' : ''
                }`}
                onClick={() => pick(value)}
                disabled={game.solved || wrong.includes(value)}
              >
                {value}
              </button>
            ))}
          </div>

          {game.solved ? (
            <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
              <span className="game-next__fill" />
              <span className="game-next__label">
                {t('play.next')}
                <Icon name="arrow" size={24} color="#fff" width={2.6} />
              </span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
