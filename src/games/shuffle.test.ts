import { describe, expect, it } from 'vitest'
import { createRoller, shuffle } from './shuffle'

describe('shuffle', () => {
  it('keeps every item, just reordered', () => {
    const items = [1, 2, 3, 4, 5]
    expect(shuffle(items, 42).sort((a, b) => a - b)).toEqual(items)
  })

  it('is deterministic for a given seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    expect(shuffle(items, 777)).toEqual(shuffle(items, 777))
  })

  // A regression check for a real bug: this generator's low bits were poor
  // quality, and taking them straight into the swap index left some items
  // in a 10-item pool almost never landing in the first few slots.
  it('gives every item roughly the same chance of landing early, even in a bigger pool', () => {
    const items = Array.from({ length: 10 }, (_, i) => i)
    const counts = Array.from({ length: 10 }, () => 0)
    for (let seed = 1; seed <= 3000; seed += 1) {
      for (const item of shuffle(items, seed).slice(0, 3)) counts[item] += 1
    }
    // ~900 expected per item (3000 seeds * 3 slots / 10 items); a real bug
    // drove some items below 20.
    for (const count of counts) expect(count).toBeGreaterThan(500)
  })
})

describe('createRoller', () => {
  it('is deterministic for a given seed', () => {
    const rollA = createRoller(42)
    const rollB = createRoller(42)
    expect([rollA(9), rollA(9), rollA(9)]).toEqual([rollB(9), rollB(9), rollB(9)])
  })

  // The same regression as shuffle's: a hand-rolled version of this exact
  // pattern (`state % max` on the raw LCG state) used to collapse to the
  // same value call after call once max was small, which is precisely how
  // several games used it — e.g. Feed the Monster's `roll(4)`.
  it('does not collapse to the same value across repeated calls', () => {
    const roll = createRoller(4154)
    const values = Array.from({ length: 20 }, () => roll(5))
    expect(new Set(values).size).toBeGreaterThan(1)
  })

  it('stays roughly evenly distributed across many seeds', () => {
    const counts = Array.from({ length: 5 }, () => 0)
    for (let seed = 1; seed <= 3000; seed += 1) {
      counts[createRoller(seed)(5)] += 1
    }
    // ~600 expected per bucket; a real bug drove some buckets far below that.
    for (const count of counts) expect(count).toBeGreaterThan(400)
  })
})
