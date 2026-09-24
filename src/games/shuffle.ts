/** Deterministic shuffle: the same seed always deals the same round. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let random = seed
  for (let i = out.length - 1; i > 0; i -= 1) {
    random = (random * 1103515245 + 12345) % 2147483648
    // This generator's low bits cycle fast and barely vary; taking them
    // straight into `% (i + 1)` used to leave some items almost never
    // picked once a pool grew past a handful of entries. The high bits
    // don't have that problem.
    const j = Math.floor(random / 65536) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * A starting seed for a game. Fixed seeds dealt the same round every time the
 * app was opened; kept small so the shuffle arithmetic stays exact.
 */
export function randomSeed(): number {
  return 1 + Math.floor(Math.random() * 100000)
}

/**
 * A `roll(max)` closure for games that need numbers, not a reordered array:
 * each call advances the same LCG `shuffle` uses and returns a value in
 * [0, max). Several games used to hand-roll this with `state % max`
 * directly, which hit the same low-bit weakness `shuffle` had — a small
 * modulus could return the same value for many calls in a row. This reads
 * the generator's high bits instead, like `shuffle` does.
 */
export function createRoller(seed: number): (max: number) => number {
  let state = seed
  return (max: number) => {
    state = (state * 1103515245 + 12345) % 2147483648
    return Math.floor(state / 65536) % max
  }
}
