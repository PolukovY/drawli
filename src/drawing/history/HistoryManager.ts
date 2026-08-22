import type { DrawingAction } from '../../storage/types'

const MAX_DEPTH = 50

/**
 * One completed gesture (a stroke, an erase, a fill) is one undo step.
 * Undone actions stay in `redoStack` until the next new action drops them.
 */
export class HistoryManager {
  private actions: DrawingAction[] = []
  private redoStack: DrawingAction[] = []

  load(actions: DrawingAction[]) {
    this.actions = [...actions]
    this.redoStack = []
  }

  push(action: DrawingAction) {
    this.actions.push(action)
    if (this.actions.length > MAX_DEPTH) this.actions.shift()
    this.redoStack = []
  }

  undo(): boolean {
    const action = this.actions.pop()
    if (!action) return false
    this.redoStack.push(action)
    return true
  }

  redo(): boolean {
    const action = this.redoStack.pop()
    if (!action) return false
    this.actions.push(action)
    return true
  }

  get current(): DrawingAction[] { return this.actions }
  get canUndo(): boolean { return this.actions.length > 0 }
  get canRedo(): boolean { return this.redoStack.length > 0 }
  get size(): number { return this.actions.length }
}
