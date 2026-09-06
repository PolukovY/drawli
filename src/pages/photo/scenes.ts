/**
 * A "scene" drops the child's photo into an illustrated background — a
 * toy room, a party table — instead of the photo filling the whole frame.
 * No real background removal (that needs ML this app deliberately doesn't
 * ship): the photo is cropped into a framed slot, like a picture placed in
 * a room, while the scene's props are drawn around it. Everything here is
 * plain data so the same list drives the live preview (PhotoStudioPage),
 * the final composite (capture.ts), and the picker cards.
 */

/** The composed canvas is always this many pixels square once a scene is on — fixed, since it no longer follows the photo's own aspect ratio. */
export const SCENE_SIZE = 1080

export interface SceneProp {
  /** Emoji, drawn with `ctx.fillText` / rendered as a plain span — no image assets. */
  emoji: string
  /** Center position, normalized 0..1 of the scene canvas. */
  x: number
  y: number
  /** Font size in scene-canvas pixels. */
  size: number
  rotation?: number
}

export interface PhotoScene {
  id: string
  titleKey: string
  /** The one glyph standing in for the whole scene on its picker card. */
  previewEmoji: string
  /** Sky/wall gradient, top to bottom. */
  skyTop: string
  skyBottom: string
  /** An optional solid band along the bottom — floor, grass, a tabletop. */
  groundColor?: string
  groundHeight?: number
  props: SceneProp[]
  /** Where the photo sits, normalized 0..1 of the scene canvas — cropped to cover this rect, like a framed picture. */
  slot: { x: number; y: number; w: number; h: number }
}

export const PHOTO_SCENES: PhotoScene[] = [
  {
    id: 'toyroom',
    titleKey: 'photo.sceneToyroom',
    previewEmoji: '🧸',
    skyTop: '#EAF2FF',
    skyBottom: '#F4F1FA',
    groundColor: '#E8C99B',
    groundHeight: 0.16,
    props: [
      { emoji: '🧸', x: 0.11, y: 0.74, size: 84 },
      { emoji: '🧩', x: 0.90, y: 0.16, size: 64 },
      { emoji: '🚂', x: 0.10, y: 0.20, size: 70 },
      { emoji: '🎈', x: 0.90, y: 0.80, size: 66 },
    ],
    slot: { x: 0.16, y: 0.10, w: 0.68, h: 0.68 },
  },
  {
    id: 'party',
    titleKey: 'photo.sceneParty',
    previewEmoji: '🎂',
    skyTop: '#FFF3D6',
    skyBottom: '#FFE8C2',
    groundColor: '#8B5E3C',
    groundHeight: 0.16,
    props: [
      { emoji: '🎂', x: 0.5, y: 0.88, size: 90 },
      { emoji: '🎈', x: 0.10, y: 0.14, size: 74 },
      { emoji: '🎈', x: 0.90, y: 0.16, size: 74 },
      { emoji: '🎉', x: 0.12, y: 0.80, size: 58 },
      { emoji: '🎊', x: 0.88, y: 0.80, size: 58 },
    ],
    slot: { x: 0.14, y: 0.05, w: 0.72, h: 0.62 },
  },
  {
    id: 'park',
    titleKey: 'photo.scenePark',
    previewEmoji: '🌳',
    skyTop: '#BEE3FF',
    skyBottom: '#EAF6EE',
    groundColor: '#7CAE86',
    groundHeight: 0.2,
    props: [
      { emoji: '☀️', x: 0.86, y: 0.10, size: 74 },
      { emoji: '🌳', x: 0.09, y: 0.60, size: 104 },
      { emoji: '🌸', x: 0.90, y: 0.82, size: 56 },
      { emoji: '🦋', x: 0.20, y: 0.18, size: 46 },
    ],
    slot: { x: 0.18, y: 0.10, w: 0.64, h: 0.6 },
  },
  {
    id: 'space',
    titleKey: 'photo.sceneSpace',
    previewEmoji: '🚀',
    skyTop: '#1A1440',
    skyBottom: '#2A2340',
    props: [
      { emoji: '⭐', x: 0.12, y: 0.12, size: 34 },
      { emoji: '⭐', x: 0.85, y: 0.20, size: 28 },
      { emoji: '⭐', x: 0.90, y: 0.76, size: 26 },
      { emoji: '🪐', x: 0.11, y: 0.82, size: 72 },
      { emoji: '🚀', x: 0.88, y: 0.55, size: 76, rotation: 35 },
    ],
    slot: { x: 0.18, y: 0.12, w: 0.64, h: 0.66 },
  },
]

export function sceneById(id: string | null): PhotoScene | null {
  return PHOTO_SCENES.find((s) => s.id === id) ?? null
}
