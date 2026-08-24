import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './CountThingsPage.css'

const ROUNDS = 5
const MAX_COUNT = 9

/** Things a child can name at a glance — the counting is the hard part. */
const THINGS = ['🍎', '🍐', '🍓', '🐞', '⭐', '🌸', '🐟', '🍋', '🦋', '🍄', '🐝', '🍊']

interface Round {
  /** What to count, and what is scattered around it as a distraction. */
  wanted: string
  count: number
  items: string[]
  choices: number[]
}

/** Count one kind of thing among others, then pick the number. */
export function CountThingsPage() {
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
      const kinds = shuffle(THINGS, seed + i * 23).slice(0, 3)
      // Early rounds stay small; later ones ask for more.
      const ceiling = i < 2 ? 5 : MAX_COUNT
      const count = 2 + roll(ceiling - 1)
      const items = [
        ...Array.from({ length: count }, () => kinds[0]),
        ...Array.from({ length: 1 + roll(4) }, () => kinds[1]),
        ...Array.from({ length: 1 + roll(3) }, () => kinds[2]),
      ]
      const others = shuffle(
        Array.from({ length: MAX_COUNT }, (_, n) => n + 1).filter((n) => n !== count),
        seed + i * 17,
      ).slice(0, 3)
      out.push({
        wanted: kinds[0],
        count,
        items: shuffle(items, seed + i * 31),
        choices: shuffle([count, ...others], seed + i * 41),
      })
    }
    return out
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  // Wrong picks belong to the round they were made in; the auto-advance does
  // not run the Next handler, so clearing them there was not enough.
  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(value: number) {
    if (!current || game.solved || wrong.includes(value)) return
    if (value === current.count) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, value])
  }

  return (
    <GameShell
      title={t('play.countThings')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 29); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="count-things__ask">
            {t('play.countThingsHint')}
            <span className="count-things__wanted">{current.wanted}</span>
          </div>

          <div className={`count-things__stage card ${game.solved ? 'count-things__stage--solved' : ''}`}>
            {current.items.map((thing, i) => (
              <span
                key={i}
                className={`count-things__item ${
                  game.solved && thing === current.wanted ? 'count-things__item--ok' : ''
                }`}
              >
                {thing}
              </span>
            ))}
          </div>

          <div className="count-things__choices">
            {current.choices.map((value) => (
              <button
                key={value}
                className={`count-things__number ${
                  game.solved && value === current.count ? 'count-things__number--ok' : ''
                } ${wrong.includes(value) ? 'count-things__number--off' : ''}`}
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
