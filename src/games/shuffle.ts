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
