/**
 * Big animal faces, meant to be dragged over the child's own face rather than
 * dropped in a corner like a small sticker — same `PhotoDecoration` under the
 * hood (drag to move, handle to resize), just placed larger and more central
 * by default. No face detection: the app is offline-only, so "becoming" the
 * animal is the child's own doing, one drag at a time.
 */
export const ANIMAL_MASKS: string[] = [
  '🦁', '🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐯', '🐨', '🐮', '🐷', '🐵', '🐸', '🦉', '🐔',
]

/** Relative to a sticker's base size — big enough to actually cover a face. */
export const MASK_SCALE = 2.4
