import type { DrawingAction, DrawingDocument } from '../storage/types'

export function createDocument(exerciseId: string, width: number, height: number): DrawingDocument {
  return { version: 1, exerciseId, canvasWidth: width, canvasHeight: height, actions: [] }
}

/**
 * Widths and coordinates live in 0..1 of canvas WIDTH (height uses the same
 * scale so strokes keep their aspect on a differently sized tablet).
 */
export function toNormalized(x: number, y: number, width: number, height: number) {
  return { x: x / width, y: y / height }
}

export function fromNormalized(x: number, y: number, width: number, height: number) {
  return { x: x * width, y: y * height }
}

export function cloneDocument(doc: DrawingDocument): DrawingDocument {
  return { ...doc, actions: doc.actions.map((a) => structuredClone(a) as DrawingAction) }
}
