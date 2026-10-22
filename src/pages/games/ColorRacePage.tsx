import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed } from '../../games/shuffle'
import {
  bestPath, finished, LANES, makeTrack, nextSteps, rollDice,
  type Car, type Die, type Step,
} from '../../games/colorRace'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import './ColorRacePage.css'

const ROUNDS = 2
const CARS = ['🚗', '🚙'] as const
/** Each colour also has a mark, so the race works for a child who can't tell red from green. */
const COLORS = [
  { hex: '#E4443B', mark: '●' },
  { hex: '#FFC53D', mark: '▲' },
  { hex: '#4EA55F', mark: '■' },
  { hex: '#4E86E8', mark: '★' },
  { hex: '#9B5CE0', mark: '◆' },
]
const STEP_DELAY = 600
const PASS_DELAY = 1300

type Player = 0 | 1
type Mode = 'robot' | 'duo'

const startCars = (): [Car, Car] => [{ lane: 0, col: -1 }, { lane: LANES - 1, col: -1 }]

/**
 * A colour race in the spirit of HABA's Monza: roll colour dice, then drive
 * one square at a time onto squares a die matches — straight on or into a
 * neighbouring lane — spending each die once. The other car blocks its
 * square, which is where the tactics come in. First over the line wins.
 */
export function ColorRacePage() {
  const { t } = useTranslation()
  const rounds = useMemo(() => Array.from({ length: ROUNDS }, (_, i) => i), [])
  const game = useGameSession(rounds)

  const [mode, setMode] = useState<Mode>('robot')
  const [seed, setSeed] = useState(randomSeed)
  const track = useMemo(() => makeTrack(seed + game.round * 131), [seed, game.round])
  const [cars, setCars] = useState<[Car, Car]>(startCars)
  const [turn, setTurn] = useState<Player>(0)
  const [dice, setDice] = useState<Die[] | null>(null)
  const [winner, setWinner] = useState<Player | null>(null)
  const [stuck, setStuck] = useState(false)
  const carsRef = useRef(cars)
  carsRef.current = cars

  // A new race on every round, replay or mode switch. In two-player mode the
  // second car starts every other race, so neither child always goes first.
  useEffect(() => {
    setCars(startCars())
    setTurn(mode === 'duo' ? ((game.round % 2) as Player) : 0)
    setDice(null)
    setWinner(null)
    setStuck(false)
  }, [game.round, rounds, mode, seed])

  const robotTurn = mode === 'robot' && turn === 1
  const steps = useMemo(
    () => (dice && winner === null && !robotTurn ? nextSteps(track, cars[turn], cars[turn === 0 ? 1 : 0], dice) : []),
    [dice, winner, robotTurn, track, cars, turn],
  )

  function passTurn() {
    setDice(null)
    setStuck(false)
    setTurn((p) => (p === 0 ? 1 : 0))
  }

  function finish(player: Player) {
    setWinner(player)
    if (mode === 'duo' || player === 0) void game.solve()
    else game.miss()
  }

  // Out of moves after a roll or a step: say so, then hand the turn over.
  useEffect(() => {
    if (!dice || winner !== null || robotTurn || steps.length > 0) return
    setStuck(true)
    const timer = window.setTimeout(passTurn, PASS_DELAY)
    return () => window.clearTimeout(timer)
  }, [dice, winner, robotTurn, steps.length])

  // The computer rolls, then drives its best path one square at a time.
  // Beatable on purpose: now and then it stops a square short.
  useEffect(() => {
    if (!robotTurn || winner !== null) return
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    later(STEP_DELAY, () => {
      const rolled = rollDice()
      setDice(rolled)
      playSound('tap')
      const [human, robot] = carsRef.current
      let path = bestPath(track, robot, human, rolled)
      if (path.length > 1 && Math.random() < 0.3) path = path.slice(0, -1)

      let used = rolled
      path.forEach((step, i) => {
        later(STEP_DELAY * (i + 2), () => {
          used = used.map((d, j) => (j === step.die ? { ...d, used: true } : d))
          setDice(used)
          setCars(([h]) => [h, { lane: step.lane, col: step.col }])
          playSound('tap')
          if (finished(step)) finish(1)
        })
      })
      const reachesLine = path.length > 0 && finished(path[path.length - 1])
      if (!reachesLine) {
        if (path.length === 0) later(STEP_DELAY * 2, () => setStuck(true))
        later(STEP_DELAY * (path.length + 2) + (path.length === 0 ? PASS_DELAY : 300), passTurn)
      }
    })
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [robotTurn, winner, track])

  function roll() {
    if (dice || winner !== null || robotTurn) return
    playSound('tap')
    setDice(rollDice())
  }

  function drive(step: Step) {
    if (!dice) return
    playSound('tap')
    setDice(dice.map((d, i) => (i === step.die ? { ...d, used: true } : d)))
    const car = { lane: step.lane, col: step.col }
    setCars((prev) => (turn === 0 ? [car, prev[1]] : [prev[0], car]))
    if (finished(car)) finish(turn)
  }

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    game.restart()
  }

  const stepAt = (lane: number, col: number) => steps.find((s) => s.lane === lane && s.col === col)
  const carAt = (lane: number, col: number) => {
    const index = cars.findIndex((c) => c.lane === lane && c.col === col)
    return index >= 0 ? <span className="race__car">{CARS[index]}</span> : null
  }

  const hint = winner !== null
    ? mode === 'duo'
      ? t('play.raceWinner', { car: CARS[winner] })
      : winner === 0 ? t('play.raceWin') : t('play.raceLost')
    : stuck
      ? t('play.raceNoMoves')
      : robotTurn
        ? t('play.raceRobotTurn')
        : !dice
          ? mode === 'duo' ? t('play.raceRollTurn', { car: CARS[turn] }) : t('play.raceRollHint')
          : t('play.raceHint')

  return (
    <GameShell
      title={t('play.race')}
      round={game.round}
      total={game.total}
      solved={winner !== null && (mode === 'duo' || winner === 0)}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 53); game.restart() }}
    >
      <div className="game-board race">
        <div className="row race__modes">
          <button className={`chip ${mode === 'robot' ? 'chip--on' : ''}`} onClick={() => switchMode('robot')}>
            {t('play.raceVsRobot')}
          </button>
          <button className={`chip ${mode === 'duo' ? 'chip--on' : ''}`} onClick={() => switchMode('duo')}>
            {t('play.raceVsFriend')}
          </button>
        </div>

        <div className="muted game-hint">{hint}</div>

        <div className="race__track">
          {track.map((laneColors, lane) => (
            <Fragment key={lane}>
              <div className="race__cell race__cell--start">{carAt(lane, -1)}</div>
              {laneColors.map((color, col) => {
                const step = stepAt(lane, col)
                return (
                  <button
                    key={col}
                    className={`race__cell ${step ? 'race__cell--go' : ''}`}
                    style={{ background: COLORS[color].hex }}
                    onClick={() => step && drive(step)}
                    disabled={!step}
                    aria-label={step ? t('play.raceHint') : undefined}
                  >
                    {carAt(lane, col) ?? <span className="race__mark">{COLORS[color].mark}</span>}
                  </button>
                )
              })}
              <div className="race__cell race__cell--finish" />
            </Fragment>
          ))}
        </div>

        <div className="race__dice-row">
          <span className="race__turn">{CARS[turn]}</span>
          {dice ? (
            <div className="race__dice">
              {dice.map((die, i) => (
                <span
                  key={i}
                  className={`race__die ${die.used ? 'race__die--used' : ''}`}
                  style={{ background: COLORS[die.color].hex }}
                >
                  {COLORS[die.color].mark}
                </span>
              ))}
            </div>
          ) : (
            <button className="btn btn--primary btn--hero" onClick={roll} disabled={winner !== null || robotTurn}>
              🎲 {t('play.raceRoll')}
            </button>
          )}
        </div>

        {winner !== null ? (
          <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
            {game.solved ? <span className="game-next__fill" /> : null}
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
