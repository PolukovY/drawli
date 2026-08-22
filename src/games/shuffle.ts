/** Deterministic shuffle: the same seed always deals the same round. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let random = seed
  for (let i = out.length - 1; i > 0; i -= 1) {
    random = (random * 1103515245 + 12345) % 2147483648
    const j = random % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
