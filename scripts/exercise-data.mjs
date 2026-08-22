import { MOTOR } from './exercises/motor.mjs'
import { SHAPES } from './exercises/shapes.mjs'
import { NATURE } from './exercises/nature.mjs'
import { ANIMALS } from './exercises/animals.mjs'
import { FOOD } from './exercises/food.mjs'
import { HOME } from './exercises/home.mjs'
import { TRANSPORT } from './exercises/transport.mjs'
import { GLYPHS } from './exercises/glyphs.mjs'

// `kind` splits the library into modes: pictures to draw, glyphs to write.
export const CATEGORIES = [
  { id: 'motor', color: '#8FA9F0', order: 1, kind: 'draw' },
  { id: 'shapes', color: '#9B5CE0', order: 2, kind: 'draw' },
  { id: 'nature', color: '#4EA55F', order: 3, kind: 'draw' },
  { id: 'animals', color: '#5FC7C0', order: 4, kind: 'draw' },
  { id: 'food', color: '#E4685B', order: 5, kind: 'draw' },
  { id: 'home', color: '#F5893B', order: 6, kind: 'draw' },
  { id: 'transport', color: '#4E86E8', order: 7, kind: 'draw' },

  { id: 'letters_uk', color: '#7C5CFF', order: 8, kind: 'write' },
  { id: 'letters_en', color: '#4E86E8', order: 9, kind: 'write' },
  { id: 'letters_es', color: '#F5893B', order: 10, kind: 'write' },
  { id: 'digits', color: '#34C77B', order: 11, kind: 'write' },
]

export const EXERCISES = [
  ...MOTOR, ...SHAPES, ...NATURE, ...ANIMALS, ...FOOD, ...HOME, ...TRANSPORT,
  ...GLYPHS,
]
