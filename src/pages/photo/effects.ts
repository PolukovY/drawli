export type EffectCollection = 'colors' | 'tale' | 'space' | 'nature' | 'fun' | 'seasons'

export interface PhotoEffect {
  id: string
  titleKey: string
  collection: EffectCollection
  /** A canvas 2D `ctx.filter` string; also valid as a CSS `filter` for the picker preview. */
  filter: string
  /** A colored wash on top of the filter, for effects a filter alone can't sell. */
  overlay?: { color: string; alpha: number }
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

  // Казка
  { id: 'sparkle', titleKey: 'photo.effectSparkle', collection: 'tale', filter: 'saturate(1.35) contrast(1.08) brightness(1.05)', overlay: { color: '#C9A6FF', alpha: 0.16 } },
  { id: 'castle', titleKey: 'photo.effectCastle', collection: 'tale', filter: 'saturate(1.1) contrast(1.15) brightness(0.97)', overlay: { color: '#5C3CE0', alpha: 0.18 } },
  { id: 'fairy', titleKey: 'photo.effectFairy', collection: 'tale', filter: 'saturate(1.3) brightness(1.08)', overlay: { color: '#F08BB4', alpha: 0.18 } },
  { id: 'unicorn', titleKey: 'photo.effectUnicorn', collection: 'tale', filter: 'saturate(1.45) brightness(1.06)', overlay: { color: '#F0A6FF', alpha: 0.16 } },

  // Космос
  { id: 'stars', titleKey: 'photo.effectStars', collection: 'space', filter: 'saturate(1.2) contrast(1.15) brightness(0.92)', overlay: { color: '#241E4E', alpha: 0.26 } },
  { id: 'planets', titleKey: 'photo.effectPlanets', collection: 'space', filter: 'saturate(1.25) contrast(1.1) brightness(0.96)', overlay: { color: '#3B2E7A', alpha: 0.2 } },
  { id: 'astronaut', titleKey: 'photo.effectAstronaut', collection: 'space', filter: 'saturate(1.1) contrast(1.2) brightness(0.94)', overlay: { color: '#1F2A44', alpha: 0.22 } },

  // Природа
  { id: 'rainbow', titleKey: 'photo.effectRainbow', collection: 'nature', filter: 'saturate(1.7) brightness(1.05)' },
  { id: 'flowers', titleKey: 'photo.effectFlowers', collection: 'nature', filter: 'saturate(1.3) brightness(1.05)', overlay: { color: '#F08BB4', alpha: 0.12 } },
  { id: 'jungle', titleKey: 'photo.effectJungle', collection: 'nature', filter: 'saturate(1.25) contrast(1.08) brightness(0.98)', overlay: { color: '#1F5C33', alpha: 0.2 } },
  { id: 'underwater', titleKey: 'photo.effectUnderwater', collection: 'nature', filter: 'saturate(1.2) brightness(1.0) contrast(1.05)', overlay: { color: '#2A6FA8', alpha: 0.22 } },

  // Веселі
  { id: 'comic', titleKey: 'photo.effectComic', collection: 'fun', filter: 'contrast(1.5) saturate(1.6)' },
  { id: 'sketch', titleKey: 'photo.effectSketch', collection: 'fun', filter: 'grayscale(0.85) contrast(1.3) brightness(1.1)' },
  { id: 'pixels', titleKey: 'photo.effectPixels', collection: 'fun', filter: 'contrast(1.3) saturate(1.4)' },
  { id: 'clay', titleKey: 'photo.effectClay', collection: 'fun', filter: 'saturate(1.3) contrast(0.94) brightness(1.05)', overlay: { color: '#F5893B', alpha: 0.1 } },

  // Сезони
  { id: 'snow', titleKey: 'photo.effectSnow', collection: 'seasons', filter: 'saturate(0.9) brightness(1.1)', overlay: { color: '#E8F1FF', alpha: 0.2 } },
  { id: 'autumn', titleKey: 'photo.effectAutumn', collection: 'seasons', filter: 'saturate(1.3) brightness(1.02)', overlay: { color: '#F5893B', alpha: 0.16 } },
  { id: 'summer', titleKey: 'photo.effectSummer', collection: 'seasons', filter: 'saturate(1.35) brightness(1.1) contrast(1.05)', overlay: { color: '#FFC53D', alpha: 0.12 } },
]

export function effectById(id: string | null): PhotoEffect {
  return PHOTO_EFFECTS.find((e) => e.id === id) ?? PHOTO_EFFECTS[0]
}
