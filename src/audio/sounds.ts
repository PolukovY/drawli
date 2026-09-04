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
/** How long the context may sit unused before it is put to sleep. */
const IDLE_MS = 4000
let idleTimer: number | null = null

export function setSoundEnabled(value: boolean) {
  enabled = value
  if (!value) suspend()
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

function suspend() {
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }
  if (context && context.state === 'running') void context.suspend().catch(() => undefined)
}

/**
 * A running context keeps the audio thread awake for as long as the app is
 * open — hours, on a tablet the child never closes — for a handful of blips a
 * minute. It is put back to sleep once the last note has finished.
 */
function sleepWhenQuiet(endsAt: number) {
  const ctx = context
  if (!ctx) return
  if (idleTimer !== null) window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(suspend, Math.max(0, (endsAt - ctx.currentTime) * 1000) + IDLE_MS)
}

export function playSound(name: SoundName) {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)

  const start = ctx.currentTime + 0.01
  let endsAt = start

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
    const stopAt = start + note.at + note.duration + 0.05
    oscillator.stop(stopAt)
    endsAt = Math.max(endsAt, stopAt)

    // A finished oscillator still hangs off the destination until it is taken
    // out. A tap a second for an afternoon leaves thousands of dead nodes in
    // the graph, and the audio thread walks all of them on every render quantum.
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
  }

  sleepWhenQuiet(endsAt)
}

/**
 * Nothing should be playing, or waiting to play, once the app is out of sight:
 * a tablet put down mid-game used to leave the audio thread running.
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') suspend()
  })
}
