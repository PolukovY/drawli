/**
 * A face-in-the-hole photo prop, like the wooden cutout boards at a fair: an
 * illustrated animal body with a round hole where the head would be, and the
 * child's own photo shows through it. No face detection — the app stays
 * offline — the "hole" is just a fixed circle the photo is cover-cropped
 * into, drawn on the same fixed square canvas as a Scene.
 */
export interface AnimalCutout {
  id: string
  titleKey: string
  previewEmoji: string
  bgTop: string
  bgBottom: string
  bodyColor: string
  /** Outer ear color, when it differs from the body (a panda's ears are black on a white body). */
  earColor?: string
  innerEarColor: string
  bellyColor?: string
  earShape: 'round' | 'tall' | 'pointy' | 'floppy'
  /** A ring drawn behind the ears, bigger than the face hole — currently just the lion's mane. */
  maneColor?: string
  /** Normalized 0..1 position and radius of the face hole within the square canvas. */
  faceSlot: { cx: number; cy: number; r: number }
}

const FACE_SLOT = { cx: 0.5, cy: 0.42, r: 0.22 }

export const ANIMAL_CUTOUTS: AnimalCutout[] = [
  {
    id: 'lion',
    titleKey: 'photo.cutoutLion',
    previewEmoji: '🦁',
    bgTop: '#FFF3D6',
    bgBottom: '#FFE1A8',
    bodyColor: '#F0B429',
    innerEarColor: '#FCEEDB',
    bellyColor: '#FCEEDB',
    earShape: 'round',
    maneColor: '#D98A2B',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'bear',
    titleKey: 'photo.cutoutBear',
    previewEmoji: '🐻',
    bgTop: '#E9DFC9',
    bgBottom: '#D8C7A1',
    bodyColor: '#8B5A3C',
    innerEarColor: '#D9A066',
    bellyColor: '#E8C9A0',
    earShape: 'round',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'panda',
    titleKey: 'photo.cutoutPanda',
    previewEmoji: '🐼',
    bgTop: '#EAF6EA',
    bgBottom: '#D5EAD5',
    bodyColor: '#FFFFFF',
    earColor: '#2B2B2B',
    innerEarColor: '#2B2B2B',
    bellyColor: '#F2F2F2',
    earShape: 'round',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'rabbit',
    titleKey: 'photo.cutoutRabbit',
    previewEmoji: '🐰',
    bgTop: '#FFF0F5',
    bgBottom: '#FADCE7',
    bodyColor: '#FFFFFF',
    innerEarColor: '#F6A6C1',
    earShape: 'tall',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'cat',
    titleKey: 'photo.cutoutCat',
    previewEmoji: '🐱',
    bgTop: '#FFF3E0',
    bgBottom: '#FCDFAE',
    bodyColor: '#E8952F',
    innerEarColor: '#FFF6E8',
    bellyColor: '#FFF6E8',
    earShape: 'pointy',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'dog',
    titleKey: 'photo.cutoutDog',
    previewEmoji: '🐶',
    bgTop: '#FFF6E8',
    bgBottom: '#F5E3C6',
    bodyColor: '#B9784A',
    innerEarColor: '#8B5A3C',
    bellyColor: '#F3DDBB',
    earShape: 'floppy',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'tiger',
    titleKey: 'photo.cutoutTiger',
    previewEmoji: '🐯',
    bgTop: '#FFEFDD',
    bgBottom: '#FBD9B0',
    bodyColor: '#F2831F',
    innerEarColor: '#FFF3E0',
    bellyColor: '#FFF3E0',
    earShape: 'round',
    faceSlot: FACE_SLOT,
  },
  {
    id: 'fox',
    titleKey: 'photo.cutoutFox',
    previewEmoji: '🦊',
    bgTop: '#FFE9DC',
    bgBottom: '#FAD0B4',
    bodyColor: '#E8672C',
    innerEarColor: '#FFFFFF',
    bellyColor: '#FFFFFF',
    earShape: 'pointy',
    faceSlot: FACE_SLOT,
  },
]

export function cutoutById(id: string | null): AnimalCutout | null {
  if (!id) return null
  return ANIMAL_CUTOUTS.find((c) => c.id === id) ?? null
}
