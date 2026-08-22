/**
 * Sound effects are synthesized with Web Audio rather than shipped as files:
 * no download, no cache to miss, and it stays working offline. Everything is
 * short, soft and unhurried — this runs next to a four-year-old's ear.
 */
export type SoundName = 'tap' | 'next' | 'correct' | 'soft' | 'star' | 'fanfare'

interface Note {
  /** Hz */
  freq: number
  /** Seconds from the start of the sound. */
  at: number
  duration: number
  gain?: number
  type?: OscillatorType
}

const SOUNDS: Record<SoundName, Note[]> = {
  // A blunt click for tools and buttons.
  tap: [{ freq: 660, at: 0, duration: 0.07, gain: 0.16 }],
  // Two notes up: a step is done.
  next: [
    { freq: 587, at: 0, duration: 0.1 },
    { freq: 784, at: 0.09, duration: 0.14 },
  ],
  // Major triad — the sound of being right.
  correct: [
    { freq: 523, at: 0, duration: 0.12 },
    { freq: 659, at: 0.1, duration: 0.12 },
    { freq: 784, at: 0.2, duration: 0.2 },
  ],
  // Not a buzzer: a low, quiet blip that says "try again".
  soft: [{ freq: 300, at: 0, duration: 0.13, gain: 0.12, type: 'sine' }],
  // A sparkle for a star.
  star: [
    { freq: 988, at: 0, duration: 0.08, gain: 0.14 },
    { freq: 1319, at: 0.07, duration: 0.12, gain: 0.12 },
  ],
  // Finish line.
  fanfare: [
    { freq: 523, at: 0, duration: 0.14 },
    { freq: 659, at: 0.12, duration: 0.14 },
    { freq: 784, at: 0.24, duration: 0.16 },
    { freq: 1047, at: 0.38, duration: 0.34 },
  ],
}

let enabled = true
let context: AudioContext | null = null

export function setSoundEnabled(value: boolean) {
  enabled = value
}

/** Browsers only allow audio after a gesture, so the context is built lazily. */
function getContext(): AudioContext | null {
  if (!enabled) return null
  if (context) return context

  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null

  try {
    context = new Ctor()
  } catch {
    return null
  }
  return context
}

export function playSound(name: SoundName) {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const start = ctx.currentTime + 0.01

  for (const note of SOUNDS[name]) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const peak = note.gain ?? 0.18

    oscillator.type = note.type ?? 'triangle'
    oscillator.frequency.value = note.freq

    // Fade in and out; a bare square edge clicks.
    gain.gain.setValueAtTime(0.0001, start + note.at)
    gain.gain.exponentialRampToValueAtTime(peak, start + note.at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.at + note.duration)

    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(start + note.at)
    oscillator.stop(start + note.at + note.duration + 0.05)
  }
}
