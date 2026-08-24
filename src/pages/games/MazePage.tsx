import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed } from '../../games/shuffle'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import './MazePage.css'

const SIZE = 7
const ROUNDS = 3
const MOUSE = '🐭'
const CHEESE = '🧀'

type Dir = 'up' | 'down' | 'left' | 'right'

/** Walls of one cell, as seen from that cell. */
interface Cell {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

const STEPS: Record<Dir, { dr: number; dc: number; back: Dir }> = {
  up: { dr: -1, dc: 0, back: 'down' },
  down: { dr: 1, dc: 0, back: 'up' },
  left: { dr: 0, dc: -1, back: 'right' },
  right: { dr: 0, dc: 1, back: 'left' },
}

/**
 * A perfect maze by depth-first carving: exactly one path between any two
 * cells, so the mouse can never be truly stuck, only turned around.
 */
function carve(seed: number): Cell[] {
  let value = seed
  const roll = (max: number) => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value % max
  }

  const cells: Cell[] = Array.from({ length: SIZE * SIZE }, () => ({
    up: true, down: true, left: true, right: true,
  }))
  const seen = new Set<number>([0])
  const stack = [0]

  while (stack.length > 0) {
    const at = stack[stack.length - 1]
    const row = Math.floor(at / SIZE)
    const col = at % SIZE

    const open = (Object.keys(STEPS) as Dir[]).filter((dir) => {
      const r = row + STEPS[dir].dr
      const c = col + STEPS[dir].dc
      return r >= 0 && c >= 0 && r < SIZE && c < SIZE && !seen.has(r * SIZE + c)
    })

    if (open.length === 0) { stack.pop(); continue }

    const dir = open[roll(open.length)]
    const next = (row + STEPS[dir].dr) * SIZE + (col + STEPS[dir].dc)
    cells[at][dir] = false
    cells[next][STEPS[dir].back] = false
    seen.add(next)
    stack.push(next)
  }

  return cells
}

/** Lead the mouse to the cheese: a path to plan, one turn at a time. */
export function MazePage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)

  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, (_, i) => carve(seed + i * 71)),
    [seed],
  )
  const game = useGameSession(rounds)
  const maze = game.current

  const [at, setAt] = useState(0)
  const [trail, setTrail] = useState<number[]>([0])
  const goal = SIZE * SIZE - 1

  useEffect(() => { setAt(0); setTrail([0]) }, [game.round, rounds])

  const atRef = useRef(0)
  atRef.current = at
  const solvedRef = useRef(false)
  solvedRef.current = game.solved

  const move = useCallback((dir: Dir) => {
    if (!maze || solvedRef.current) return
    const from = atRef.current
    if (maze[from][dir]) { playSound('soft'); return }

    const row = Math.floor(from / SIZE) + STEPS[dir].dr
    const col = (from % SIZE) + STEPS[dir].dc
    const next = row * SIZE + col
    atRef.current = next
    setAt(next)
    setTrail((prev) => (prev.includes(next) ? prev : [...prev, next]))
    if (next === goal) void game.solve()
  }, [maze, game, goal])

  useEffect(() => {
    const keys: Record<string, Dir> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    }
    function onKey(event: KeyboardEvent) {
      const dir = keys[event.key]
      if (!dir) return
      event.preventDefault()
      move(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  // Swiping is the natural control on a tablet; the pad is for small fingers.
  const touch = useRef<{ x: number; y: number } | null>(null)

  return (
    <GameShell
      title={t('play.maze')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 67); game.restart() }}
    >
      {maze ? (
        <div className="game-board">
          <div className="muted game-hint">
            {game.solved ? t('play.mazeWin') : t('play.mazeHint')}
          </div>

          <div
            className="maze__grid"
            style={{ '--maze-size': SIZE } as React.CSSProperties}
            onTouchStart={(event) => {
              const point = event.touches[0]
              touch.current = { x: point.clientX, y: point.clientY }
            }}
            onTouchEnd={(event) => {
              const start = touch.current
              touch.current = null
              if (!start) return
              const point = event.changedTouches[0]
              const dx = point.clientX - start.x
              const dy = point.clientY - start.y
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
              if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
              else move(dy > 0 ? 'down' : 'up')
            }}
          >
            {maze.map((cell, i) => (
              <div
                key={i}
                className={`maze__cell ${cell.up ? 'maze__cell--up' : ''} ${
                  cell.down ? 'maze__cell--down' : ''
                } ${cell.left ? 'maze__cell--left' : ''} ${cell.right ? 'maze__cell--right' : ''} ${
                  trail.includes(i) ? 'maze__cell--trail' : ''
                }`}
              >
                {i === at ? MOUSE : i === goal ? CHEESE : null}
              </div>
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
          ) : (
            <div className="maze__pad">
              <button className="maze__key maze__key--up" onClick={() => move('up')} aria-label={t('play.snakeUp')}>▲</button>
              <button className="maze__key maze__key--left" onClick={() => move('left')} aria-label={t('play.snakeLeft')}>◀</button>
              <button className="maze__key maze__key--right" onClick={() => move('right')} aria-label={t('play.snakeRight')}>▶</button>
              <button className="maze__key maze__key--down" onClick={() => move('down')} aria-label={t('play.snakeDown')}>▼</button>
            </div>
          )}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
