import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'

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
