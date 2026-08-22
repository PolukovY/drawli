export type Difficulty = 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'ADVANCED'

export type ToolId = 'PENCIL' | 'BRUSH' | 'ERASER' | 'FILL'

export interface Point {
  x: number
  y: number
  pressure?: number
}

/** A finished stroke. Coordinates and width are normalized to 0..1 of canvas width. */
export interface StrokeAction {
  type: 'STROKE'
  tool: 'PENCIL' | 'BRUSH' | 'ERASER'
  color: string
  width: number
  points: Point[]
}

export interface FillAction {
  type: 'FILL'
  regionId: string
  color: string
}

export type DrawingAction = StrokeAction | FillAction

export interface DrawingDocument {
  version: 1
  exerciseId: string
  canvasWidth: number
  canvasHeight: number
  actions: DrawingAction[]
}

export type DrawingStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface SavedDrawing {
  id: string
  exerciseId: string
  status: DrawingStatus
  currentStep: number
  document: DrawingDocument
  thumbnail?: Blob
  createdAt: string
  updatedAt: string
}

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface ExerciseProgress {
  exerciseId: string
  status: ProgressStatus
  currentStep: number
  timesCompleted: number
  startedAt?: string
  completedAt?: string
  updatedAt: string
}

export type Language = 'uk' | 'en'

export interface AppSettings {
  id: 'app'
  childName: string
  language: Language
  soundEnabled: boolean
  stars: number
  onboardedAt: string
}

export interface Achievement {
  id: string
  type: string
  earnedAt: string
}
