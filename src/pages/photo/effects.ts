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
 * since the original shot is always kept alongside it.
 */
export const PHOTO_EFFECTS: PhotoEffect[] = [
  { id: 'none', titleKey: 'photo.effectNone', collection: 'colors', filter: 'none' },
  { id: 'vivid', titleKey: 'photo.effectVivid', collection: 'colors', filter: 'saturate(1.6) brightness(1.08)' },
  { id: 'warm', titleKey: 'photo.effectWarm', collection: 'colors', filter: 'sepia(0.25) saturate(1.3) hue-rotate(-8deg) brightness(1.05)' },
  { id: 'cool', titleKey: 'photo.effectCool', collection: 'colors', filter: 'saturate(1.2) hue-rotate(165deg) brightness(1.03)' },
  { id: 'mono', titleKey: 'photo.effectMono', collection: 'colors', filter: 'grayscale(1) contrast(1.1)' },
  { id: 'sparkle', titleKey: 'photo.effectSparkle', collection: 'tale', filter: 'saturate(1.4) contrast(1.08) brightness(1.05)', overlay: { color: '#9B5CE0', alpha: 0.18 } },
  { id: 'stars', titleKey: 'photo.effectStars', collection: 'space', filter: 'brightness(0.75) contrast(1.25) saturate(1.15)', overlay: { color: '#1A1A3D', alpha: 0.35 } },
  { id: 'rainbow', titleKey: 'photo.effectRainbow', collection: 'nature', filter: 'saturate(1.7) hue-rotate(6deg)' },
  { id: 'comic', titleKey: 'photo.effectComic', collection: 'fun', filter: 'contrast(1.5) saturate(1.6)' },
  { id: 'autumn', titleKey: 'photo.effectAutumn', collection: 'seasons', filter: 'sepia(0.4) saturate(1.3) hue-rotate(-18deg) brightness(1.02)' },
]

export function effectById(id: string | null): PhotoEffect {
  return PHOTO_EFFECTS.find((e) => e.id === id) ?? PHOTO_EFFECTS[0]
}
