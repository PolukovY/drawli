export interface DifficultyTier<T> {
  /** The round index (0-based) from which this tier's value applies. */
  from: number
  value: T
}

/**
 * The `BiggerNumber`/`CountThings` pattern of "easy for the first couple of
 * rounds, harder after" generalized to any number of steps. `tiers` must be
 * given in ascending `from` order; the value returned is the last tier whose
 * `from` the round has reached.
 */
export function difficultyTier<T>(round: number, tiers: DifficultyTier<T>[]): T {
  let value = tiers[0].value
  for (const tier of tiers) {
    if (round < tier.from) break
    value = tier.value
  }
  return value
}
