import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './SizeOrderPage.css'

const ROUNDS = 5
const THINGS = ['🍎', '🐞', '⭐', '🌸', '🐟', '🦋', '🍄', '🐝', '🎈', '🐢', '🍋', '🌙']
/** Four sizes are enough to see an order; five turns it into a chore. */
const SCALES = [0.45, 0.65, 0.85, 1.1]

interface Card {
  scale: number
  rank: number
}

interface Round {
  thing: string
  cards: Card[]
}

/** Smallest to biggest: ordering by one property, the root of measuring. */
export function SizeOrderPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)
  const [placed, setPlaced] = useState<number[]>([])

  const rounds = useMemo<Round[]>(() => {
    return Array.from({ length: ROUNDS }, (_, i) => {
      const thing = shuffle(THINGS, seed + i * 17)[0]
      const cards = SCALES.map((scale, rank) => ({ scale, rank }))
      return { thing, cards: shuffle(cards, seed + i * 29) }
    })
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setPlaced([]) }, [game.round, rounds])

  function tap(rank: number) {
    if (!current || game.solved || placed.includes(rank)) return
    // The next one has to be the smallest of what is left.
    if (rank !== placed.length) { game.miss(); return }
    const next = [...placed, rank]
    setPlaced(next)
    if (next.length === current.cards.length) void game.solve()
  }

  return (
    <GameShell
      title={t('play.sizeOrder')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 59); setPlaced([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.sizeOrderHint')}</div>

          <div className="size__row">
            {current.cards.map((card) => (
              <button
                key={card.rank}
                className={`size__card ${placed.includes(card.rank) ? 'size__card--done' : ''}`}
                onClick={() => tap(card.rank)}
                disabled={placed.includes(card.rank) || game.solved}
              >
                <span style={{ fontSize: `${Math.round(card.scale * 64)}px` }}>{current.thing}</span>
                {placed.includes(card.rank) ? (
                  <span className="size__badge">{placed.indexOf(card.rank) + 1}</span>
                ) : null}
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
