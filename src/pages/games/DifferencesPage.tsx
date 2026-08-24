import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './DifferencesPage.css'

const ROUNDS = 3
const COLS = 4
const ROWS = 3
const DIFFERENCES = 3
const THINGS = ['🍎', '🍐', '🐞', '⭐', '🌸', '🐟', '🦋', '🍄', '🐝', '🍋', '🌙', '🍓', '🎈', '🐢']

interface Round {
  left: string[]
  right: string[]
  changed: number[]
}

/** Two shelves that are almost the same — find the three swapped things. */
function build(seed: number): Round {
  const pool = shuffle(THINGS, seed)
  const left = Array.from({ length: COLS * ROWS }, (_, i) => pool[i % pool.length])
  const changed = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i), seed + 7).slice(0, DIFFERENCES)
  const right = [...left]
  changed.forEach((cell, i) => {
    // Swap in something that is not already sitting in that square.
    const spare = pool.filter((thing) => thing !== left[cell])
    right[cell] = spare[(seed + i * 5) % spare.length]
  })
  return { left, right, changed }
}

/** Spot what changed: careful looking, one square at a time. */
export function DifferencesPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)

  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, (_, i) => build(seed + i * 97)),
    [seed],
  )
  const game = useGameSession(rounds)
  const current = game.current

  const [found, setFound] = useState<number[]>([])
  useEffect(() => { setFound([]) }, [game.round, rounds])

  function tap(cell: number) {
    if (!current || game.solved || found.includes(cell)) return
    if (!current.changed.includes(cell)) { game.miss(); return }
    const next = [...found, cell]
    setFound(next)
    if (next.length === current.changed.length) void game.solve()
  }

  return (
    <GameShell
      title={t('play.differences')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 89); setFound([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">
            {t('play.differencesHint', { found: found.length, total: DIFFERENCES })}
          </div>

          <div className="diff__pair">
            <div className="diff__grid card" style={{ '--diff-cols': COLS } as React.CSSProperties}>
              {current.left.map((thing, i) => (
                <span key={i} className="diff__cell">{thing}</span>
              ))}
            </div>

            {/* Only the right shelf is tappable, so a tap always means
                "this one changed" rather than "these two differ". */}
            <div className="diff__grid card" style={{ '--diff-cols': COLS } as React.CSSProperties}>
              {current.right.map((thing, i) => (
                <button
                  key={i}
                  className={`diff__cell diff__cell--tappable ${found.includes(i) ? 'diff__cell--found' : ''}`}
                  onClick={() => tap(i)}
                  disabled={game.solved || found.includes(i)}
                >
                  {thing}
                </button>
              ))}
            </div>
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
