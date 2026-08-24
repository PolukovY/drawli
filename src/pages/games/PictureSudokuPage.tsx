import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './PictureSudokuPage.css'

const SIZE = 4
const ROUNDS = 3
const SETS = [
  ['🍎', '🍐', '🍓', '🍌'],
  ['🐞', '🦋', '🐝', '🐟'],
  ['⭐', '🌙', '🌸', '🍄'],
]

/** Every full 4x4 grid is one of these, shuffled — no solver needed. */
const BASE = [
  [0, 1, 2, 3],
  [2, 3, 0, 1],
  [1, 0, 3, 2],
  [3, 2, 1, 0],
]

interface Round {
  things: string[]
  /** The finished grid, as indexes into `things`. */
  answer: number[]
  /** Which squares start empty. */
  blanks: number[]
}

/**
 * Sudoku for people who cannot read numbers: four pictures, and the rule that
 * none may repeat in a row, a column or a corner block.
 */
function build(seed: number, hard: boolean): Round {
  const things = shuffle(SETS[seed % SETS.length], seed + 3)
  // Swapping whole rows inside a band, and columns inside a stack, keeps every
  // sudoku rule true while making the grid look nothing like the base.
  const rowOrder = [...shuffle([0, 1], seed + 5), ...shuffle([2, 3], seed + 7)]
  const colOrder = [...shuffle([0, 1], seed + 11), ...shuffle([2, 3], seed + 13)]

  const answer: number[] = []
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) answer.push(BASE[rowOrder[r]][colOrder[c]])
  }

  // Six blanks to start with, eight once the child has the idea.
  const blanks = shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => i), seed + 17)
    .slice(0, hard ? 8 : 6)
  return { things, answer, blanks }
}

/** Fill the grid so no picture repeats in a row, a column or a block. */
export function PictureSudokuPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)

  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, (_, i) => build(seed + i * 83, i > 0)),
    [seed],
  )
  const game = useGameSession(rounds)
  const current = game.current

  const [filled, setFilled] = useState<Record<number, number>>({})
  const [held, setHeld] = useState<number | null>(null)

  useEffect(() => { setFilled({}); setHeld(null) }, [game.round, rounds])

  function place(cell: number) {
    if (!current || game.solved || held === null) return
    if (!current.blanks.includes(cell) || filled[cell] !== undefined) return

    if (current.answer[cell] !== held) { game.miss(); return }
    const next = { ...filled, [cell]: held }
    setFilled(next)
    if (Object.keys(next).length === current.blanks.length) void game.solve()
  }

  return (
    <GameShell
      title={t('play.sudoku')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 79); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">
            {held === null ? t('play.sudokuPick') : t('play.sudokuPlace')}
          </div>

          <div className="sudoku__grid">
            {current.answer.map((thing, cell) => {
              const blank = current.blanks.includes(cell)
              const shown = blank ? filled[cell] : thing
              // Blocks are tinted like a chessboard — the rule about corners is
              // easier to see than to explain to someone who cannot read it.
              const row = Math.floor(cell / SIZE)
              const col = cell % SIZE
              const altBlock = (Math.floor(row / 2) + Math.floor(col / 2)) % 2 === 1
              return (
                <button
                  key={cell}
                  className={`sudoku__cell ${altBlock ? 'sudoku__cell--alt' : ''} ${
                    blank ? 'sudoku__cell--blank' : ''
                  } ${blank && filled[cell] !== undefined ? 'sudoku__cell--done' : ''}`}
                  onClick={() => place(cell)}
                  disabled={!blank || filled[cell] !== undefined || game.solved}
                >
                  {shown === undefined ? '' : current.things[shown]}
                </button>
              )
            })}
          </div>

          <div className="sudoku__tray">
            {current.things.map((thing, i) => (
              <button
                key={thing}
                className={`sudoku__tile ${held === i ? 'sudoku__tile--held' : ''}`}
                onClick={() => setHeld(i)}
                disabled={game.solved}
              >
                {thing}
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
