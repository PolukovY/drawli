import { MOTOR } from './exercises/motor.mjs'
import { SHAPES } from './exercises/shapes.mjs'
import { NATURE } from './exercises/nature.mjs'
import { ANIMALS } from './exercises/animals.mjs'
import { FOOD } from './exercises/food.mjs'
import { HOME } from './exercises/home.mjs'
import { TRANSPORT } from './exercises/transport.mjs'

export const CATEGORIES = [
  { id: 'motor', color: '#8FA9F0', order: 1 },
  { id: 'shapes', color: '#9B5CE0', order: 2 },
  { id: 'nature', color: '#4EA55F', order: 3 },
  { id: 'animals', color: '#5FC7C0', order: 4 },
  { id: 'food', color: '#E4685B', order: 5 },
  { id: 'home', color: '#F5893B', order: 6 },
  { id: 'transport', color: '#4E86E8', order: 7 },
]

export const EXERCISES = [...MOTOR, ...SHAPES, ...NATURE, ...ANIMALS, ...FOOD, ...HOME, ...TRANSPORT]
