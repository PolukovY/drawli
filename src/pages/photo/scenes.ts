/**
 * A scene composites the child's photo into an illustrated background instead
 * of letting the photo fill the frame — a fixed square canvas with a sky
 * gradient, an optional ground band, a handful of emoji "props", and a
 * rounded "slot" rect the photo is cover-cropped into (like a framed
 * picture). No real background removal: the app is offline-only with no
 * ML/backend, so the illustration is drawn around the photo rather than the
 * child cut out of it.
 */
export const SCENE_SIZE = 1080

export interface SceneProp {
  emoji: string
  /** Normalized 0..1 position of the prop's center within the scene square. */
  x: number
  y: number
  /** Font size in scene-square pixels (the square is always SCENE_SIZE wide). */
  size: number
  rotation?: number
}

export interface PhotoScene {
  id: string
  titleKey: string
  /** Shown on the picker card, standing in for a full illustration preview. */
  previewEmoji: string
  skyTop: string
  skyBottom: string
  groundColor?: string
  /** Normalized 0..1 height of the ground band, measured from the bottom. */
  groundHeight?: number
  props: SceneProp[]
  /** Normalized 0..1 rect the photo is cover-cropped and framed into. */
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
      { emoji: '🧩', x: 0.9, y: 0.16, size: 64 },
      { emoji: '🚂', x: 0.1, y: 0.2, size: 70 },
      { emoji: '🎈', x: 0.9, y: 0.8, size: 66 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.68 },
  },
  {
    id: 'party',
    titleKey: 'photo.sceneParty',
    previewEmoji: '🎂',
    skyTop: '#FFE9F3',
    skyBottom: '#FFF6D9',
    groundColor: '#FFD1E3',
    groundHeight: 0.14,
    props: [
      { emoji: '🎂', x: 0.5, y: 0.87, size: 90 },
      { emoji: '🎈', x: 0.12, y: 0.16, size: 70 },
      { emoji: '🎉', x: 0.88, y: 0.18, size: 66 },
      { emoji: '🎁', x: 0.88, y: 0.82, size: 70 },
    ],
    slot: { x: 0.16, y: 0.08, w: 0.68, h: 0.64 },
  },
  {
    id: 'park',
    titleKey: 'photo.scenePark',
    previewEmoji: '🌳',
    skyTop: '#BEE7FD',
    skyBottom: '#DFF3D8',
    groundColor: '#8FCB6B',
    groundHeight: 0.18,
    props: [
      { emoji: '🌳', x: 0.1, y: 0.62, size: 92 },
      { emoji: '☀️', x: 0.86, y: 0.14, size: 72 },
      { emoji: '🌼', x: 0.88, y: 0.8, size: 58 },
      { emoji: '🦋', x: 0.14, y: 0.2, size: 54 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.66 },
  },
  {
    id: 'space',
    titleKey: 'photo.sceneSpace',
    previewEmoji: '🚀',
    skyTop: '#1B1240',
    skyBottom: '#3A2B6B',
    props: [
      { emoji: '🚀', x: 0.86, y: 0.2, size: 80, rotation: 35 },
      { emoji: '🪐', x: 0.12, y: 0.16, size: 66 },
      { emoji: '⭐', x: 0.88, y: 0.82, size: 50 },
      { emoji: '🌙', x: 0.12, y: 0.8, size: 64 },
    ],
    slot: { x: 0.16, y: 0.12, w: 0.68, h: 0.66 },
  },
  {
    id: 'beach',
    titleKey: 'photo.sceneBeach',
    previewEmoji: '🏖️',
    skyTop: '#BEE7FD',
    skyBottom: '#FFF3D6',
    groundColor: '#F5DFA4',
    groundHeight: 0.2,
    props: [
      { emoji: '☀️', x: 0.86, y: 0.14, size: 74 },
      { emoji: '🌴', x: 0.1, y: 0.58, size: 96 },
      { emoji: '🐚', x: 0.88, y: 0.84, size: 52 },
      { emoji: '🦀', x: 0.16, y: 0.88, size: 52 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.64 },
  },
  {
    id: 'zoo',
    titleKey: 'photo.sceneZoo',
    previewEmoji: '🦁',
    skyTop: '#DFF3D8',
    skyBottom: '#F5F9E0',
    groundColor: '#9ED97A',
    groundHeight: 0.18,
    props: [
      { emoji: '🦁', x: 0.12, y: 0.64, size: 86 },
      { emoji: '🐘', x: 0.88, y: 0.68, size: 90 },
      { emoji: '🦒', x: 0.88, y: 0.18, size: 80 },
      { emoji: '🎈', x: 0.12, y: 0.16, size: 60 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.66 },
  },
  {
    id: 'circus',
    titleKey: 'photo.sceneCircus',
    previewEmoji: '🎪',
    skyTop: '#FFE1E8',
    skyBottom: '#FFD3A8',
    groundColor: '#E8546B',
    groundHeight: 0.14,
    props: [
      { emoji: '🎪', x: 0.86, y: 0.2, size: 92 },
      { emoji: '🎈', x: 0.12, y: 0.16, size: 64 },
      { emoji: '🍿', x: 0.88, y: 0.82, size: 60 },
      { emoji: '⭐', x: 0.12, y: 0.82, size: 50 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.66 },
  },
  {
    id: 'underwater',
    titleKey: 'photo.sceneUnderwater',
    previewEmoji: '🐠',
    skyTop: '#1C6FA8',
    skyBottom: '#4FB6D6',
    groundColor: '#E8D5A0',
    groundHeight: 0.16,
    props: [
      { emoji: '🐠', x: 0.12, y: 0.2, size: 64 },
      { emoji: '🐙', x: 0.88, y: 0.62, size: 80 },
      { emoji: '🐚', x: 0.88, y: 0.88, size: 46 },
      { emoji: '🐢', x: 0.12, y: 0.68, size: 68 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.66 },
  },
  {
    id: 'castle',
    titleKey: 'photo.sceneCastle',
    previewEmoji: '🏰',
    skyTop: '#FBD6F0',
    skyBottom: '#D6C4F5',
    groundColor: '#B7E38B',
    groundHeight: 0.14,
    props: [
      { emoji: '🏰', x: 0.86, y: 0.18, size: 90 },
      { emoji: '👑', x: 0.12, y: 0.16, size: 58 },
      { emoji: '✨', x: 0.88, y: 0.82, size: 50 },
      { emoji: '🦄', x: 0.12, y: 0.78, size: 74 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.66 },
  },
  {
    id: 'dino',
    titleKey: 'photo.sceneDino',
    previewEmoji: '🦕',
    skyTop: '#F3F0C4',
    skyBottom: '#CFE8A0',
    groundColor: '#7FB35A',
    groundHeight: 0.18,
    props: [
      { emoji: '🦕', x: 0.12, y: 0.64, size: 88 },
      { emoji: '🦖', x: 0.88, y: 0.6, size: 90 },
      { emoji: '🌋', x: 0.5, y: 0.14, size: 70 },
      { emoji: '🥚', x: 0.88, y: 0.86, size: 44 },
    ],
    slot: { x: 0.16, y: 0.1, w: 0.68, h: 0.66 },
  },
]

export function sceneById(id: string | null): PhotoScene | null {
  if (!id) return null
  return PHOTO_SCENES.find((s) => s.id === id) ?? null
}
