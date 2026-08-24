import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import { playSound } from '../../audio/sounds'
import './SeaBattlePage.css'

const SIZE = 6
const ROUNDS = 3
/** Small fleet, short game: a hunt a child can finish in a few minutes. */
const FLEET = [3, 2, 2, 1]

interface Board {
  /** Cell index → which ship sits there. */
  ships: Map<number, number>
  sizes: number[]
}

/** Places the fleet without ships touching, so every hit is unambiguous. */
function deploy(seed: number): Board {
  let value = seed
  const roll = (max: number) => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value % max
  }

  const ships = new Map<number, number>()
  const blocked = new Set<number>()

  FLEET.forEach((size, shipIndex) => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const horizontal = roll(2) === 0
      const row = roll(horizontal ? SIZE : SIZE - size + 1)
      const col = roll(horizontal ? SIZE - size + 1 : SIZE)
      const cells = Array.from({ length: size }, (_, i) => (
        horizontal ? row * SIZE + col + i : (row + i) * SIZE + col
      ))
      if (cells.some((cell) => blocked.has(cell))) continue

      for (const cell of cells) {
        ships.set(cell, shipIndex)
        // Block the ring around the ship too, so two ships never share an edge.
        const r = Math.floor(cell / SIZE)
        const c = cell % SIZE
        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nc >= 0 && nr < SIZE && nc < SIZE) blocked.add(nr * SIZE + nc)
          }
        }
      }
      return
    }
  })

  return { ships, sizes: FLEET }
}

/** Find the hidden ships: tap the water and remember what the misses tell you. */
export function SeaBattlePage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)

  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, (_, i) => deploy(seed + i * 101)),
    [seed],
  )
  const game = useGameSession(rounds)
  const board = game.current

  const [shots, setShots] = useState<number[]>([])

  // A new board is a new hunt.
  useEffect(() => { setShots([]) }, [game.round, rounds])

  const hits = shots.filter((cell) => board?.ships.has(cell)).length
  const total = board ? board.ships.size : 0
  const sunk = useMemo(() => {
    if (!board) return new Set<number>()
    const done = new Set<number>()
    board.sizes.forEach((size, shipIndex) => {
      const cells = [...board.ships.entries()].filter(([, ship]) => ship === shipIndex).map(([cell]) => cell)
      if (cells.length === size && cells.every((cell) => shots.includes(cell))) done.add(shipIndex)
    })
    return done
  }, [board, shots])

  function fire(cell: number) {
    if (!board || game.solved || shots.includes(cell)) return
    const next = [...shots, cell]
    setShots(next)

    if (!board.ships.has(cell)) { game.miss(); return }
    // The last mast: the round is won, and only then do the stars land.
    if (next.filter((c) => board.ships.has(c)).length === total) void game.solve()
    // A hit is a small cheer of its own, not the round's fanfare.
    else playSound('star')
  }

  return (
    <GameShell
      title={t('play.seaBattle')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 37); setShots([]); game.restart() }}
    >
      {board ? (
        <div className="game-board">
          <div className="muted game-hint">
            {game.solved ? t('play.seaBattleWin') : t('play.seaBattleHint')}
          </div>

          <div className="sea__fleet">
            {board.sizes.map((size, shipIndex) => (
              <span key={shipIndex} className={`sea__ship ${sunk.has(shipIndex) ? 'sea__ship--sunk' : ''}`}>
                {Array.from({ length: size }, (_, i) => <i key={i} />)}
              </span>
            ))}
          </div>

          <div className="sea__grid">
            {Array.from({ length: SIZE * SIZE }, (_, cell) => {
              const shot = shots.includes(cell)
              const ship = board.ships.get(cell)
              const hit = shot && ship !== undefined
              return (
                <button
                  key={cell}
                  className={`sea__cell ${hit ? 'sea__cell--hit' : ''} ${
                    shot && !hit ? 'sea__cell--miss' : ''
                  } ${ship !== undefined && sunk.has(ship) ? 'sea__cell--sunk' : ''}`}
                  onClick={() => fire(cell)}
                  disabled={shot || game.solved}
                  aria-label={shot ? (hit ? t('play.seaBattleHit') : t('play.seaBattleMiss')) : t('play.seaBattleWater')}
                >
                  {hit ? '🚢' : shot ? '💧' : ''}
                </button>
              )
            })}
          </div>

          <div className="muted sea__score">{t('play.seaBattleFound', { hits, total })}</div>

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
