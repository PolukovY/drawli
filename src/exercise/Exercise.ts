import type { Difficulty } from '../storage/types'

export interface ExerciseStep {
  id: string
  guide?: string
  mode?: 'COLORING'
  defaultTool?: 'PENCIL' | 'BRUSH' | 'FILL' | 'ERASER'
  /** The colour the tutor asks for on this step, so the palette can point at it. */
  wantColor?: string
}

export interface Exercise {
  id: string
  titleKey: string
  glyph?: string
  category: string
  difficulty: Difficulty
  thumbnail: string
  /** The shaded picture: what the drawing is meant to become. */
  art?: string
  steps: ExerciseStep[]
}

export type CategoryKind = 'draw' | 'write'

export interface CategorySummary {
  id: string
  titleKey: string
  color: string
  order: number
  kind: CategoryKind
}

export interface ExerciseSummary {
  id: string
  titleKey: string
  category: string
  difficulty: Difficulty
  thumbnail: string
  steps: number
  /** Present on letters and digits: the character being written. */
  glyph?: string
}

export interface ExerciseIndex {
  version: 1
  categories: CategorySummary[]
  exercises: ExerciseSummary[]
}
