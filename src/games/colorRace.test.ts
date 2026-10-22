import { describe, expect, it } from 'vitest'
import { bestPath, COLOR_COUNT, LANES, LENGTH, makeTrack, nextSteps, type Die, type Track } from './colorRace'

const dice = (...colors: number[]): Die[] => colors.map((color) => ({ color, used: false }))
// Lane 0 all colour 0, lane 1 all colour 1, lane 2 all colour 2.
const stripes: Track = Array.from({ length: LANES }, (_, lane) => Array(LENGTH).fill(lane))

describe('makeTrack', () => {
  it('is deterministic per seed and the right size', () => {
    const a = makeTrack(42)
    expect(a).toEqual(makeTrack(42))
    expect(a).toHaveLength(LANES)
    a.forEach((lane) => expect(lane).toHaveLength(LENGTH))
  })

  it('never makes a column all one colour', () => {
    for (let seed = 1; seed < 200; seed += 1) {
      const track = makeTrack(seed)
      for (let col = 0; col < LENGTH; col += 1) {
        const colors = new Set(track.map((lane) => lane[col]))
        expect(colors.size).toBeGreaterThan(1)
        colors.forEach((c) => expect(c).toBeLessThan(COLOR_COUNT))
      }
    }
  })
})

describe('nextSteps', () => {
  it('offers straight on and the neighbouring lanes, matched by an unused die', () => {
    const steps = nextSteps(stripes, { lane: 1, col: -1 }, { lane: 0, col: 5 }, dice(0, 1, 2))
    expect(steps.map((s) => s.lane).sort()).toEqual([0, 1, 2])
  })

  it('never jumps two lanes or goes past the finish', () => {
    expect(nextSteps(stripes, { lane: 0, col: 3 }, { lane: 2, col: 9 }, dice(2, 2))).toEqual([])
    expect(nextSteps(stripes, { lane: 0, col: LENGTH - 1 }, { lane: 2, col: 0 }, dice(0))).toEqual([])
  })

  it('treats the other car as a block', () => {
    const steps = nextSteps(stripes, { lane: 0, col: 3 }, { lane: 0, col: 4 }, dice(0, 1))
    expect(steps.map((s) => s.lane)).toEqual([1])
  })

  it('skips dice already spent', () => {
    const spent = [{ color: 0, used: true }]
    expect(nextSteps(stripes, { lane: 0, col: 0 }, { lane: 2, col: 0 }, spent)).toEqual([])
  })
})

describe('bestPath', () => {
  it('finds the longest drive, changing lanes when it pays', () => {
    // Stay in lane 0 for two steps, then hop to lane 1 for the last die.
    const path = bestPath(stripes, { lane: 0, col: -1 }, { lane: 2, col: 0 }, dice(0, 1, 0))
    expect(path).toHaveLength(3)
    expect(path.map((s) => s.col)).toEqual([0, 1, 2])
  })

  it('uses each die once', () => {
    const path = bestPath(stripes, { lane: 1, col: -1 }, { lane: 2, col: 9 }, dice(1, 1, 1, 1))
    expect(new Set(path.map((s) => s.die)).size).toBe(path.length)
    expect(path).toHaveLength(4)
  })
})
