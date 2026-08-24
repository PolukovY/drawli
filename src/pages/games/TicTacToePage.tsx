import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { Icon } from '../../components/Icon'
import './TicTacToePage.css'

const ROUNDS = 3
const CAT = '🐱'
const DOG = '🐶'
/** Long enough to look like thinking, short enough not to feel stuck. */
const ROBOT_DELAY = 700

type Mark = typeof CAT | typeof DOG
type Cell = Mark | null
type Mode = 'robot' | 'duo'

const LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function winningLine(board: Cell[], mark: Mark): number[] | null {
  return LINES.find((line) => line.every((i) => board[i] === mark)) ?? null
}

function free(board: Cell[]): number[] {
  return board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i >= 0)
}

/** The cell that completes a line for this mark, if there is one. */
function finisher(board: Cell[], mark: Mark): number | null {
  for (const line of LINES) {
    const own = line.filter((i) => board[i] === mark)
    const empty = line.filter((i) => board[i] === null)
    if (own.length === 2 && empty.length === 1) return empty[0]
  }
  return null
}

/**
 * Beatable on purpose: the robot takes its own win, blocks only half the time,
 * and otherwise plays anywhere. A child who never wins stops playing.
 */
function robotMove(board: Cell[]): number | null {
  const open = free(board)
  if (open.length === 0) return null

  const win = finisher(board, DOG)
  if (win !== null) return win

  const block = finisher(board, CAT)
  if (block !== null && Math.random() < 0.5) return block

  if (board[4] === null && Math.random() < 0.5) return 4
  return open[Math.floor(Math.random() * open.length)]
}

/** Noughts and crosses: against a gentle robot, or two children in turns. */
export function TicTacToePage() {
  const { t } = useTranslation()

  const rounds = useMemo(() => Array.from({ length: ROUNDS }, (_, i) => i), [])
  const game = useGameSession(rounds)

  const [mode, setMode] = useState<Mode>('robot')
  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null))
  const [turn, setTurn] = useState<Mark>(CAT)
  const [line, setLine] = useState<number[] | null>(null)
  const [winner, setWinner] = useState<Mark | null>(null)
  const [draw, setDraw] = useState(false)
  const [waiting, setWaiting] = useState(false)

  // Every round — and every replay — starts on an empty board. In two-player
  // mode the second child opens every other round, so neither always goes first.
  useEffect(() => {
    setBoard(Array(9).fill(null))
    setTurn(game.round % 2 === 0 ? CAT : DOG)
    setLine(null)
    setWinner(null)
    setDraw(false)
    setWaiting(false)
  }, [game.round, rounds, mode])

  const over = winner !== null || draw

  function place(index: number) {
    if (over || waiting || board[index] !== null) return
    // The robot owns the dog; in two-player mode both marks are the children's.
    const mark: Mark = mode === 'robot' ? CAT : turn

    const next = [...board]
    next[index] = mark
    setBoard(next)

    const won = winningLine(next, mark)
    if (won) { setLine(won); setWinner(mark); void game.solve(); return }
    if (free(next).length === 0) { setDraw(true); game.miss(); return }

    if (mode === 'duo') { setTurn(mark === CAT ? DOG : CAT); return }

    setWaiting(true)
    window.setTimeout(() => {
      const move = robotMove(next)
      if (move === null) { setWaiting(false); return }
      const after = [...next]
      after[move] = DOG
      setBoard(after)
      setWaiting(false)

      const lost = winningLine(after, DOG)
      if (lost) { setLine(lost); setWinner(DOG); game.miss(); return }
      if (free(after).length === 0) { setDraw(true); game.miss() }
    }, ROBOT_DELAY)
  }

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    game.restart()
  }

  const hint = draw
    ? t('play.ticTacToeDraw')
    : winner
      ? mode === 'duo'
        ? t('play.ticTacToeWinner', { mark: winner })
        : winner === CAT ? t('play.ticTacToeWin') : t('play.ticTacToeLost')
      : mode === 'duo'
        ? t('play.ticTacToeTurn', { mark: turn })
        : t('play.ticTacToeHint', { mark: CAT })

  return (
    <GameShell
      title={t('play.ticTacToe')}
      round={game.round}
      total={game.total}
      solved={winner !== null && (mode === 'duo' || winner === CAT)}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={game.restart}
    >
      <div className="game-board">
        <div className="row ttt__modes">
          <button
            className={`chip ${mode === 'robot' ? 'chip--on' : ''}`}
            onClick={() => switchMode('robot')}
          >
            {t('play.ticTacToeVsRobot')}
          </button>
          <button
            className={`chip ${mode === 'duo' ? 'chip--on' : ''}`}
            onClick={() => switchMode('duo')}
          >
            {t('play.ticTacToeVsFriend')}
          </button>
        </div>

        <div className="muted game-hint">{hint}</div>

        <div className="ttt__board">
          {board.map((cell, i) => (
            <button
              key={i}
              className={`ttt__cell ${line?.includes(i) ? 'ttt__cell--win' : ''}`}
              onClick={() => place(i)}
              disabled={over || waiting || cell !== null}
              aria-label={cell ?? t('play.ticTacToeEmpty')}
            >
              {cell}
            </button>
          ))}
        </div>

        {over ? (
          <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
            {winner ? <span className="game-next__fill" /> : null}
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
