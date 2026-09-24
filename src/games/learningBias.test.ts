import { describe, expect, it } from 'vitest'
import { biasByLearningStats } from './learningBias'

describe('biasByLearningStats', () => {
  const stats: Record<string, { seenCount: number; missCount: number }> = {
    mastered: { seenCount: 5, missCount: 0 },
    missed: { seenCount: 3, missCount: 2 },
  }
  const statFor = (item: string) => stats[item]

  it('puts never-seen items ahead of everything else', () => {
    const items = ['mastered', 'missed', 'new']
    const ordered = biasByLearningStats(items, 1, statFor)
    expect(ordered[0]).toBe('new')
  })

  it('puts seen-and-missed items ahead of mastered ones', () => {
    const items = ['mastered', 'missed']
    const ordered = biasByLearningStats(items, 1, statFor)
    expect(ordered).toEqual(['missed', 'mastered'])
  })

  it('keeps every item, just reordered', () => {
    const items = ['mastered', 'missed', 'new', 'also-new']
    expect(biasByLearningStats(items, 7, statFor).sort()).toEqual([...items].sort())
  })

  it('is deterministic for a given seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    expect(biasByLearningStats(items, 42, () => undefined))
      .toEqual(biasByLearningStats(items, 42, () => undefined))
  })

  it('varies the order of same-priority items across seeds', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f']
    const first = biasByLearningStats(items, 1, () => undefined)
    const second = biasByLearningStats(items, 2, () => undefined)
    expect(first).not.toEqual(second)
  })
})
