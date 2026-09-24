import { shuffle } from './shuffle'

export interface LearningStat {
  seenCount: number
  missCount: number
}

/**
 * Orders `items` so the ones most worth practicing again come first: never
 * seen, then seen-and-missed, then everything already mastered — ties within
 * a tier broken by the same seeded shuffle every other pool uses, so a
 * repeat play still feels varied instead of drilling the same due item.
 */
export function biasByLearningStats<T>(
  items: T[],
  seed: number,
  statFor: (item: T) => LearningStat | undefined,
): T[] {
  const priority = (item: T): number => {
    const stat = statFor(item)
    if (!stat) return 2
    if (stat.missCount > 0) return 1
    return 0
  }
  return shuffle(items, seed)
    .map((item, i) => ({ item, i, priority: priority(item) }))
    .sort((a, b) => b.priority - a.priority || a.i - b.i)
    .map((entry) => entry.item)
}
