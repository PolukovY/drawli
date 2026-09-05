import type { ChildPhoto } from '../../storage/types'

export type DayGroupKey = 'today' | 'yesterday' | 'earlier'

export interface DayGroup {
  key: DayGroupKey
  photos: ChildPhoto[]
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** "Сьогодні" / "Учора" / "Раніше" — empty groups are dropped, not shown blank. */
export function groupPhotosByDay(photos: ChildPhoto[], now: Date = new Date()): DayGroup[] {
  const today = startOfDay(now)
  const yesterday = today - 24 * 60 * 60 * 1000
  const buckets: Record<DayGroupKey, ChildPhoto[]> = { today: [], yesterday: [], earlier: [] }

  for (const photo of photos) {
    const day = startOfDay(new Date(photo.createdAt))
    if (day === today) buckets.today.push(photo)
    else if (day === yesterday) buckets.yesterday.push(photo)
    else buckets.earlier.push(photo)
  }

  return (['today', 'yesterday', 'earlier'] as const)
    .map((key) => ({ key, photos: buckets[key] }))
    .filter((group) => group.photos.length > 0)
}

export interface GateQuestion {
  a: number
  b: number
}

/** A single-digit sum a parent answers in a second — see the feature spec's "4 + 3?". */
export function makeGateQuestion(random: () => number = Math.random): GateQuestion {
  const a = 2 + Math.floor(random() * 7) // 2..8
  const b = 2 + Math.floor(random() * 7) // 2..8
  return { a, b }
}

export function checkGateAnswer(question: GateQuestion, input: string): boolean {
  const value = Number.parseInt(input.trim(), 10)
  return Number.isFinite(value) && value === question.a + question.b
}
