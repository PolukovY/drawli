import type { Difficulty } from '../storage/types'

export interface ExerciseStep {
  id: string
  guide?: string
  mode?: 'COLORING'
  defaultTool?: 'PENCIL' | 'BRUSH' | 'FILL' | 'ERASER'
}

export interface Exercise {
  id: string
  titleKey: string
  category: string
  difficulty: Difficulty
  thumbnail: string
  steps: ExerciseStep[]
}

export interface CategorySummary {
  id: string
  titleKey: string
  color: string
  order: number
}

export interface ExerciseSummary {
  id: string
  titleKey: string
  category: string
  difficulty: Difficulty
  thumbnail: string
  steps: number
}

export interface ExerciseIndex {
  version: 1
  categories: CategorySummary[]
  exercises: ExerciseSummary[]
}
