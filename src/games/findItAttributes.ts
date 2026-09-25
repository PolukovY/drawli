export type FindItColor = 'red' | 'yellow' | 'orange' | 'green' | 'purple' | 'brown' | 'pink' | 'white' | 'gray' | 'blue'
export type FindItSize = 'small' | 'big'

export interface FindItAttributes {
  id: string
  color: FindItColor
  size: FindItSize
}

/**
 * A curated subset of the drawable picture library, tagged with the color
 * and relative size actually visible in that picture's own artwork —
 * checked directly against the rendered thumbnails, not guessed from the
 * object's name (a watermelon slice reads mostly red, a snail's shell reads
 * orange, etc.). "Size" is the real-world size of the thing relative to the
 * others in this list, not the artwork's pixel dimensions.
 *
 * Not every picture in the library is here: only ones with one unambiguous
 * dominant color and a size that's clearly small or big next to the rest.
 * Powers "Find It" — content-pipeline groundwork the roadmap called for.
 */
export const FIND_IT_ITEMS: FindItAttributes[] = [
  { id: 'apple', color: 'red', size: 'small' },
  { id: 'strawberry', color: 'red', size: 'small' },
  { id: 'cherries', color: 'red', size: 'small' },
  { id: 'ladybug', color: 'red', size: 'small' },
  { id: 'firetruck', color: 'red', size: 'big' },
  { id: 'watermelon', color: 'red', size: 'big' },
  { id: 'banana', color: 'yellow', size: 'small' },
  { id: 'lemon', color: 'yellow', size: 'small' },
  { id: 'bee', color: 'yellow', size: 'small' },
  { id: 'key', color: 'yellow', size: 'small' },
  { id: 'duck', color: 'yellow', size: 'small' },
  { id: 'sun', color: 'yellow', size: 'big' },
  { id: 'taxi', color: 'yellow', size: 'big' },
  { id: 'giraffe', color: 'yellow', size: 'big' },
  { id: 'bus', color: 'yellow', size: 'big' },
  { id: 'orange', color: 'orange', size: 'small' },
  { id: 'carrot', color: 'orange', size: 'small' },
  { id: 'snail', color: 'orange', size: 'small' },
  { id: 'fox', color: 'orange', size: 'big' },
  { id: 'cat', color: 'orange', size: 'big' },
  { id: 'frog', color: 'green', size: 'small' },
  { id: 'leaf', color: 'green', size: 'small' },
  { id: 'grapes', color: 'purple', size: 'small' },
  { id: 'acorn', color: 'brown', size: 'small' },
  { id: 'bear', color: 'brown', size: 'big' },
  { id: 'pig', color: 'pink', size: 'big' },
  { id: 'cloud', color: 'white', size: 'big' },
  { id: 'sheep', color: 'white', size: 'big' },
  { id: 'mouse', color: 'gray', size: 'small' },
  { id: 'elephant', color: 'gray', size: 'big' },
  { id: 'whale', color: 'blue', size: 'big' },
]

export const FIND_IT_COLOR_HEX: Record<FindItColor, string> = {
  red: '#E5484D',
  yellow: '#F5D90A',
  orange: '#F76B15',
  green: '#30A46C',
  purple: '#8E4EC6',
  brown: '#8B5E34',
  pink: '#E93D82',
  white: '#F5F5F5',
  gray: '#8B8D98',
  blue: '#0091FF',
}
