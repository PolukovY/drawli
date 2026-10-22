import { createRoller } from './shuffle'

export const LANES = 3
export const LENGTH = 16
export const DICE = 4
export const COLOR_COUNT = 5

/** Where a car is: its lane, and how far along — -1 is the start grid. */
export interface Car {
  lane: number
  col: number
}

export interface Die {
  color: number
  used: boolean
}

export interface Step {
  lane: number
  col: number
  /** Which die pays for the step. */
  die: number
}

/** track[lane][col] is a colour index. */
export type Track = number[][]

/** Every column carries at least two colours, so no row is a wall for one roll. */
export function makeTrack(seed: number): Track {
  const roll = createRoller(seed)
  const track: Track = Array.from({ length: LANES }, () => [])
  for (let col = 0; col < LENGTH; col += 1) {
    const column = Array.from({ length: LANES }, () => roll(COLOR_COUNT))
    if (column.every((c) => c === column[0])) column[roll(LANES)] = (column[0] + 1 + roll(COLOR_COUNT - 1)) % COLOR_COUNT
    column.forEach((color, lane) => { track[lane][col] = color })
  }
  return track
}

export function rollDice(random: () => number = Math.random): Die[] {
  return Array.from({ length: DICE }, () => ({ color: Math.floor(random() * COLOR_COUNT), used: false }))
}

export const finished = (car: Car) => car.col >= LENGTH - 1

/**
 * The squares one column ahead — straight on or into a neighbouring lane —
 * that an unused die matches and the other car isn't sitting on.
 */
export function nextSteps(track: Track, car: Car, other: Car, dice: Die[]): Step[] {
  const col = car.col + 1
  if (col >= LENGTH) return []
  const steps: Step[] = []
  for (const lane of [car.lane - 1, car.lane, car.lane + 1]) {
    if (lane < 0 || lane >= LANES) continue
    if (other.lane === lane && other.col === col) continue
    const die = dice.findIndex((d) => !d.used && d.color === track[lane][col])
    if (die >= 0) steps.push({ lane, col, die })
  }
  return steps
}

/** The longest drive this roll allows (four dice, so trying them all is cheap). */
export function bestPath(track: Track, car: Car, other: Car, dice: Die[]): Step[] {
  let best: Step[] = []
  for (const step of nextSteps(track, car, other, dice)) {
    const rest = dice.map((d, i) => (i === step.die ? { ...d, used: true } : d))
    const tail = bestPath(track, { lane: step.lane, col: step.col }, other, rest)
    if (tail.length + 1 > best.length) best = [step, ...tail]
  }
  return best
}
