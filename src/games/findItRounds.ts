import { shuffle } from './shuffle'
import type { FindItAttributes } from './findItAttributes'

export interface FindItRound {
  target: FindItAttributes
  choices: FindItAttributes[]
}

/**
 * Picks a target and up to 3 decoys from `items`. At tier 1+, one decoy
 * shares the target's color — so recognizing the color alone isn't enough
 * to solve it. At tier 2, another decoy shares its size instead of its
 * color — so both attributes have to be read together. Remaining slots (or
 * all of them, at tier 0) are filled with anything else in the pool.
 */
export function buildFindItRound(items: FindItAttributes[], seed: number, tier: 0 | 1 | 2): FindItRound | null {
  if (items.length < 4) return null

  const shuffled = shuffle(items, seed)
  const target = shuffled[0]
  let rest = shuffled.slice(1)
  const decoys: FindItAttributes[] = []

  if (tier >= 1) {
    const sameColor = rest.find((item) => item.color === target.color)
    if (sameColor) {
      decoys.push(sameColor)
      rest = rest.filter((item) => item !== sameColor)
    }
  }
  if (tier >= 2) {
    const sameSize = rest.find((item) => item.size === target.size)
    if (sameSize) {
      decoys.push(sameSize)
      rest = rest.filter((item) => item !== sameSize)
    }
  }
  while (decoys.length < 3 && rest.length > 0) decoys.push(rest.shift() as FindItAttributes)

  return { target, choices: shuffle([target, ...decoys], seed + 1) }
}
