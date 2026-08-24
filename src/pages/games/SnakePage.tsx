import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { Icon } from '../../components/Icon'
import { playSound } from '../../audio/sounds'
import './SnakePage.css'

const SIZE = 11
/** Three rounds, each one apple longer than the last. */
const TARGETS = [3, 4, 5]
const STEP_MS = 420
const SWIPE_MIN = 24

type Point = { x: number; y: number }
type Dir = 'up' | 'down' | 'left' | 'right'

const STEPS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

const START: Point[] = [
  { x: 3, y: 5 },
  { x: 2, y: 5 },
]

function same(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y
}

/** An apple anywhere the snake is not. */
function placeApple(snake: Point[]): Point {
  const open: Point[] = []
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) open.push({ x, y })
    }
  }
  return open[Math.floor(Math.random() * open.length)]
}

/** Snake, slowed down and forgiving: a bump ends the try, never the game. */
export function SnakePage() {
  const { t } = useTranslation()

  const rounds = useMemo(() => TARGETS, [])
  const game = useGameSession(rounds)
  const target = game.current ?? TARGETS[0]

  const [snake, setSnake] = useState<Point[]>(START)
  const [apple, setApple] = useState<Point>(() => placeApple(START))
  const [eaten, setEaten] = useState(0)
  const [crashed, setCrashed] = useState(false)
  const [moving, setMoving] = useState(false)

  // The direction the snake is travelling, and the one asked for since the last
  // step. Two taps between steps must not turn the snake back into itself.
  const dir = useRef<Dir>('right')
  const queued = useRef<Dir>('right')
  const solvedRef = useRef(false)
  solvedRef.current = game.solved
  const snakeRef = useRef<Point[]>(START)
  snakeRef.current = snake
  const appleRef = useRef<Point>(apple)
  appleRef.current = apple
  const eatenRef = useRef(0)
  eatenRef.current = eaten

  const reset = useCallback(() => {
    dir.current = 'right'
    queued.current = 'right'
    snakeRef.current = START
    eatenRef.current = 0
    setSnake(START)
    const fresh = placeApple(START)
    appleRef.current = fresh
    setApple(fresh)
    setEaten(0)
    setCrashed(false)
    setMoving(false)
  }, [])

  // A new round — or a replay — starts a fresh snake.
  useEffect(() => { reset() }, [game.round, rounds, reset])

  const turn = useCallback((next: Dir) => {
    if (solvedRef.current || crashed) return
    if (next === OPPOSITE[dir.current]) return
    queued.current = next
    setMoving(true)
  }, [crashed])

  /**
   * Everything happens outside the state updater on purpose: React may re-run
   * an updater, and awarding stars or placing an apple from inside one fires
   * twice. The refs hold the truth between ticks.
   */
  const step = useCallback(() => {
    dir.current = queued.current
    const body = snakeRef.current
    const delta = STEPS[dir.current]
    const head = { x: body[0].x + delta.x, y: body[0].y + delta.y }

    const outside = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE
    // The tail vacates the square it is on, so bumping it is not a crash.
    const bitSelf = body.slice(0, -1).some((part) => same(part, head))
    if (outside || bitSelf) {
      setCrashed(true)
      setMoving(false)
      playSound('soft')
      return
    }

    const ate = same(head, appleRef.current)
    const grown = ate ? [head, ...body] : [head, ...body.slice(0, -1)]
    snakeRef.current = grown
    setSnake(grown)

    if (!ate) return
    const total = eatenRef.current + 1
    eatenRef.current = total
    setEaten(total)
    setApple(placeApple(grown))
    if (total >= target) {
      setMoving(false)
      void game.solve()
    } else {
      playSound('star')
    }
  }, [game, target])

  useEffect(() => {
    if (!moving || game.solved || crashed) return
    const timer = window.setInterval(step, STEP_MS)
    return () => window.clearInterval(timer)
  }, [moving, game.solved, crashed, step])

  useEffect(() => {
    const keys: Record<string, Dir> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    }
    function onKey(event: KeyboardEvent) {
      const next = keys[event.key]
      if (!next) return
      event.preventDefault()
      turn(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn])

  // Swiping the board is the natural control on a tablet; the buttons stay for
  // small fingers that would rather aim than swipe.
  const touch = useRef<Point | null>(null)
  function onTouchStart(event: React.TouchEvent) {
    const point = event.touches[0]
    touch.current = { x: point.clientX, y: point.clientY }
  }
  function onTouchEnd(event: React.TouchEvent) {
    const start = touch.current
    touch.current = null
    if (!start) return
    const point = event.changedTouches[0]
    const dx = point.clientX - start.x
    const dy = point.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left')
    else turn(dy > 0 ? 'down' : 'up')
  }

  const hint = game.solved
    ? t('play.snakeDone')
    : crashed
      ? t('play.snakeCrash')
      : moving
        ? t('play.snakeEaten', { eaten, target })
        : t('play.snakeHint')

  return (
    <GameShell
      title={t('play.snake')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { reset(); game.restart() }}
    >
      <div className="game-board">
        <div className="muted game-hint">{hint}</div>

        <div
          className="snake__board"
          style={{ '--snake-size': SIZE } as React.CSSProperties}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {Array.from({ length: SIZE * SIZE }, (_, i) => {
            const point = { x: i % SIZE, y: Math.floor(i / SIZE) }
            const part = snake.findIndex((s) => same(s, point))
            const isApple = same(point, apple)
            return (
              <div
                key={i}
                className={`snake__cell ${part === 0 ? 'snake__cell--head' : ''} ${
                  part > 0 ? 'snake__cell--body' : ''
                } ${crashed && part === 0 ? 'snake__cell--crash' : ''}`}
              >
                {isApple && part < 0 ? '🍎' : null}
              </div>
            )
          })}
        </div>

        {game.solved ? (
          <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
            <span className="game-next__fill" />
            <span className="game-next__label">
              {t('play.next')}
              <Icon name="arrow" size={24} color="#fff" width={2.6} />
            </span>
          </button>
        ) : crashed ? (
          <button className="btn btn--primary btn--hero game-next" onClick={reset}>
            <span className="game-next__label">
              <Icon name="again" size={24} color="#fff" width={2.4} />
              {t('play.again')}
            </span>
          </button>
        ) : (
          <div className="snake__pad">
            <button className="snake__key snake__key--up" onClick={() => turn('up')} aria-label={t('play.snakeUp')}>▲</button>
            <button className="snake__key snake__key--left" onClick={() => turn('left')} aria-label={t('play.snakeLeft')}>◀</button>
            <button className="snake__key snake__key--right" onClick={() => turn('right')} aria-label={t('play.snakeRight')}>▶</button>
            <button className="snake__key snake__key--down" onClick={() => turn('down')} aria-label={t('play.snakeDown')}>▼</button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
