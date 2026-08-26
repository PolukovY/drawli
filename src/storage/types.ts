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

/** Bucket fill on the canvas itself; coordinates are normalized like strokes. */
export interface BucketAction {
  type: 'BUCKET'
  x: number
  y: number
  color: string
}

export type DrawingAction = StrokeAction | FillAction | BucketAction

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
  /**
   * How many actions existed when each step opened. Without it, a resumed
   * drawing cannot tell which strokes belong to the step being shown.
   */
  stepBaselines?: number[]
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

/**
 * The tutor's voice has its own language: a Ukrainian-speaking child can be
 * praised in Spanish, which is half the point of having three.
 */
export type VoiceLanguage = 'uk' | 'en' | 'es'

export interface AppSettings {
  id: 'app'
  childName: string
  language: Language
  soundEnabled: boolean
  /** The spoken tutor: explains each step, praises a finished one. */
  voiceEnabled?: boolean
  voiceLanguage?: VoiceLanguage
  stars: number
  onboardedAt: string
  /** Coach marks are shown once per screen, then never again. */
  tutorialHomeDone?: boolean
  tutorialDrawDone?: boolean
}

export interface Achievement {
  id: string
  type: string
  earnedAt: string
}
