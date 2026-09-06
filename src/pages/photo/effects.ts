export type EffectCollection = 'colors' | 'tale' | 'space' | 'nature' | 'fun' | 'seasons'

/** One small emoji an effect bakes onto the photo, not placed by hand like a sticker. */
export interface EffectParticle {
  emoji: string
  /** Normalized 0..1 position within whatever the photo currently is (the full frame, or the scene slot). */
  x: number
  y: number
  /** Fraction of the photo's shorter side. */
  size: number
  rotation?: number
}

export interface PhotoEffect {
  id: string
  titleKey: string
  collection: EffectCollection
  /** A canvas 2D `ctx.filter` string; also valid as a CSS `filter` for the picker preview. */
  filter: string
  /** A colored wash on top of the filter, for effects a filter alone can't sell. */
  overlay?: { color: string; alpha: number }
  /** Baked straight onto the photo — what makes an effect read as more than a color tweak. */
  particles?: EffectParticle[]
}

/** Order the collections appear in the picker. */
export const EFFECT_COLLECTIONS: { id: EffectCollection; titleKey: string }[] = [
  { id: 'colors', titleKey: 'photo.collectionColors' },
  { id: 'tale', titleKey: 'photo.collectionTale' },
  { id: 'space', titleKey: 'photo.collectionSpace' },
  { id: 'nature', titleKey: 'photo.collectionNature' },
  { id: 'fun', titleKey: 'photo.collectionFun' },
  { id: 'seasons', titleKey: 'photo.collectionSeasons' },
]

/**
 * No AI, no internet: every effect is a canvas filter (plus an optional color
 * wash) applied to the child's own photo — fast, offline, and reversible,
 * since the original shot is always kept alongside it. Every collection from
 * the feature spec gets its full line-up rather than one token effect each —
 * a picker with a single card per shelf reads as broken, not minimal.
 *
 * Filters lean on `saturate`/`brightness`/`contrast` plus a low-alpha color
 * wash rather than a big `hue-rotate` — a large hue shift flips a face's skin
 * tone toward green or purple, which a filter meant to be flattering should
 * never do.
 */
export const PHOTO_EFFECTS: PhotoEffect[] = [
  // Кольори
  { id: 'none', titleKey: 'photo.effectNone', collection: 'colors', filter: 'none' },
  { id: 'vivid', titleKey: 'photo.effectVivid', collection: 'colors', filter: 'saturate(1.6) brightness(1.08) contrast(1.05)' },
  { id: 'warm', titleKey: 'photo.effectWarm', collection: 'colors', filter: 'saturate(1.25) brightness(1.06) contrast(1.05)', overlay: { color: '#FFB347', alpha: 0.14 } },
  { id: 'cool', titleKey: 'photo.effectCool', collection: 'colors', filter: 'saturate(1.15) brightness(1.03) contrast(1.05)', overlay: { color: '#4E86E8', alpha: 0.14 } },
  { id: 'mono', titleKey: 'photo.effectMono', collection: 'colors', filter: 'grayscale(1) contrast(1.1)' },
  { id: 'neon', titleKey: 'photo.effectNeon', collection: 'colors', filter: 'saturate(1.8) contrast(1.25) brightness(1.05)', overlay: { color: '#7C5CFF', alpha: 0.12 } },

  // Казка
  {
    id: 'sparkle',
    titleKey: 'photo.effectSparkle',
    collection: 'tale',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.05)',
    overlay: { color: '#C9A6FF', alpha: 0.16 },
    particles: [
      { emoji: '✨', x: 0.1, y: 0.12, size: 0.13 },
      { emoji: '✨', x: 0.9, y: 0.16, size: 0.1 },
      { emoji: '✨', x: 0.14, y: 0.86, size: 0.11 },
      { emoji: '✨', x: 0.88, y: 0.84, size: 0.13 },
    ],
  },
  { id: 'castle', titleKey: 'photo.effectCastle', collection: 'tale', filter: 'saturate(1.1) contrast(1.15) brightness(0.97)', overlay: { color: '#5C3CE0', alpha: 0.18 } },
  {
    id: 'fairy',
    titleKey: 'photo.effectFairy',
    collection: 'tale',
    filter: 'saturate(1.3) brightness(1.08)',
    overlay: { color: '#F08BB4', alpha: 0.18 },
    particles: [
      { emoji: '🌸', x: 0.12, y: 0.14, size: 0.12 },
      { emoji: '✨', x: 0.88, y: 0.18, size: 0.1 },
      { emoji: '🌸', x: 0.86, y: 0.86, size: 0.12 },
    ],
  },
  {
    id: 'unicorn',
    titleKey: 'photo.effectUnicorn',
    collection: 'tale',
    filter: 'saturate(1.45) brightness(1.06)',
    overlay: { color: '#F0A6FF', alpha: 0.16 },
    particles: [
      { emoji: '🌈', x: 0.5, y: 0.1, size: 0.22 },
      { emoji: '💫', x: 0.12, y: 0.82, size: 0.11 },
      { emoji: '💫', x: 0.88, y: 0.82, size: 0.11 },
    ],
  },
  {
    id: 'butterflies',
    titleKey: 'photo.effectButterflies',
    collection: 'tale',
    filter: 'saturate(1.3) brightness(1.05)',
    particles: [
      { emoji: '🦋', x: 0.12, y: 0.16, size: 0.12, rotation: -12 },
      { emoji: '🦋', x: 0.88, y: 0.2, size: 0.1, rotation: 14 },
      { emoji: '🌸', x: 0.14, y: 0.88, size: 0.1 },
    ],
  },

  // Космос
  {
    id: 'stars',
    titleKey: 'photo.effectStars',
    collection: 'space',
    filter: 'saturate(1.2) contrast(1.15) brightness(0.92)',
    overlay: { color: '#241E4E', alpha: 0.26 },
    particles: [
      { emoji: '⭐', x: 0.1, y: 0.14, size: 0.1 },
      { emoji: '🌟', x: 0.9, y: 0.12, size: 0.11 },
      { emoji: '⭐', x: 0.86, y: 0.86, size: 0.09 },
      { emoji: '✨', x: 0.12, y: 0.86, size: 0.09 },
    ],
  },
  { id: 'planets', titleKey: 'photo.effectPlanets', collection: 'space', filter: 'saturate(1.25) contrast(1.1) brightness(0.96)', overlay: { color: '#3B2E7A', alpha: 0.2 } },
  { id: 'astronaut', titleKey: 'photo.effectAstronaut', collection: 'space', filter: 'saturate(1.1) contrast(1.2) brightness(0.94)', overlay: { color: '#1F2A44', alpha: 0.22 } },
  {
    id: 'meteor',
    titleKey: 'photo.effectMeteor',
    collection: 'space',
    filter: 'saturate(1.15) contrast(1.2) brightness(0.9)',
    overlay: { color: '#0B1030', alpha: 0.28 },
    particles: [
      { emoji: '☄️', x: 0.86, y: 0.16, size: 0.16, rotation: 35 },
      { emoji: '⭐', x: 0.12, y: 0.82, size: 0.09 },
    ],
  },

  // Природа
  { id: 'rainbow', titleKey: 'photo.effectRainbow', collection: 'nature', filter: 'saturate(1.7) brightness(1.05)' },
  { id: 'flowers', titleKey: 'photo.effectFlowers', collection: 'nature', filter: 'saturate(1.3) brightness(1.05)', overlay: { color: '#F08BB4', alpha: 0.12 } },
  { id: 'jungle', titleKey: 'photo.effectJungle', collection: 'nature', filter: 'saturate(1.25) contrast(1.08) brightness(0.98)', overlay: { color: '#1F5C33', alpha: 0.2 } },
  {
    id: 'underwater',
    titleKey: 'photo.effectUnderwater',
    collection: 'nature',
    filter: 'saturate(1.2) brightness(1.0) contrast(1.05)',
    overlay: { color: '#2A6FA8', alpha: 0.22 },
    particles: [
      { emoji: '🫧', x: 0.14, y: 0.2, size: 0.08 },
      { emoji: '🫧', x: 0.86, y: 0.3, size: 0.06 },
      { emoji: '🫧', x: 0.5, y: 0.12, size: 0.07 },
    ],
  },
  {
    id: 'rain',
    titleKey: 'photo.effectRain',
    collection: 'nature',
    filter: 'saturate(1.05) contrast(1.05) brightness(0.98)',
    overlay: { color: '#3A6EA5', alpha: 0.16 },
    particles: [
      { emoji: '💧', x: 0.16, y: 0.18, size: 0.08 },
      { emoji: '💧', x: 0.84, y: 0.24, size: 0.07 },
      { emoji: '☔', x: 0.5, y: 0.86, size: 0.14 },
    ],
  },

  // Веселі
  { id: 'comic', titleKey: 'photo.effectComic', collection: 'fun', filter: 'contrast(1.5) saturate(1.6)' },
  { id: 'sketch', titleKey: 'photo.effectSketch', collection: 'fun', filter: 'grayscale(0.85) contrast(1.3) brightness(1.1)' },
  { id: 'pixels', titleKey: 'photo.effectPixels', collection: 'fun', filter: 'contrast(1.3) saturate(1.4)' },
  { id: 'clay', titleKey: 'photo.effectClay', collection: 'fun', filter: 'saturate(1.3) contrast(0.94) brightness(1.05)', overlay: { color: '#F5893B', alpha: 0.1 } },
  {
    id: 'confetti',
    titleKey: 'photo.effectConfetti',
    collection: 'fun',
    filter: 'saturate(1.4) contrast(1.1)',
    particles: [
      { emoji: '🎊', x: 0.12, y: 0.14, size: 0.12, rotation: -10 },
      { emoji: '🎉', x: 0.88, y: 0.16, size: 0.13, rotation: 12 },
      { emoji: '🎈', x: 0.14, y: 0.86, size: 0.11 },
      { emoji: '🎈', x: 0.86, y: 0.84, size: 0.1 },
    ],
  },
  {
    id: 'hearts',
    titleKey: 'photo.effectHearts',
    collection: 'fun',
    filter: 'saturate(1.3) brightness(1.05)',
    overlay: { color: '#FF6FA5', alpha: 0.08 },
    particles: [
      { emoji: '❤️', x: 0.12, y: 0.16, size: 0.11 },
      { emoji: '💕', x: 0.88, y: 0.18, size: 0.1 },
      { emoji: '💗', x: 0.5, y: 0.9, size: 0.1 },
    ],
  },
  {
    id: 'fireworks',
    titleKey: 'photo.effectFireworks',
    collection: 'fun',
    filter: 'contrast(1.2) saturate(1.5) brightness(0.98)',
    overlay: { color: '#1B1240', alpha: 0.18 },
    particles: [
      { emoji: '🎆', x: 0.16, y: 0.18, size: 0.18 },
      { emoji: '🎇', x: 0.84, y: 0.22, size: 0.16 },
      { emoji: '✨', x: 0.5, y: 0.1, size: 0.09 },
    ],
  },

  // Сезони
  {
    id: 'snow',
    titleKey: 'photo.effectSnow',
    collection: 'seasons',
    filter: 'saturate(0.9) brightness(1.1)',
    overlay: { color: '#E8F1FF', alpha: 0.2 },
    particles: [
      { emoji: '❄️', x: 0.14, y: 0.14, size: 0.08 },
      { emoji: '❄️', x: 0.86, y: 0.2, size: 0.07 },
      { emoji: '❄️', x: 0.5, y: 0.08, size: 0.07 },
      { emoji: '❄️', x: 0.2, y: 0.88, size: 0.07 },
    ],
  },
  {
    id: 'autumn',
    titleKey: 'photo.effectAutumn',
    collection: 'seasons',
    filter: 'saturate(1.3) brightness(1.02)',
    overlay: { color: '#F5893B', alpha: 0.16 },
    particles: [
      { emoji: '🍂', x: 0.14, y: 0.16, size: 0.11 },
      { emoji: '🍁', x: 0.86, y: 0.2, size: 0.1 },
      { emoji: '🍂', x: 0.2, y: 0.88, size: 0.09 },
    ],
  },
  { id: 'summer', titleKey: 'photo.effectSummer', collection: 'seasons', filter: 'saturate(1.35) brightness(1.1) contrast(1.05)', overlay: { color: '#FFC53D', alpha: 0.12 } },
  {
    id: 'spring',
    titleKey: 'photo.effectSpring',
    collection: 'seasons',
    filter: 'saturate(1.3) brightness(1.07)',
    particles: [
      { emoji: '🌷', x: 0.14, y: 0.86, size: 0.11 },
      { emoji: '🌼', x: 0.86, y: 0.84, size: 0.1 },
      { emoji: '🐝', x: 0.86, y: 0.16, size: 0.08 },
    ],
  },
]

export function effectById(id: string | null): PhotoEffect {
  return PHOTO_EFFECTS.find((e) => e.id === id) ?? PHOTO_EFFECTS[0]
}
