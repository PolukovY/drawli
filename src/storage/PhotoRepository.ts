import { db } from './DrawliDatabase'
import type { ChildPhoto } from './types'

/** Same listener pattern as DrawingRepository: the gallery re-reads on write. */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribePhotos(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  for (const listener of listeners) listener()
}

export async function getPhoto(id: string): Promise<ChildPhoto | undefined> {
  return db.photos.get(id)
}

export async function listPhotos(): Promise<ChildPhoto[]> {
  const rows = await db.photos.toArray()
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function savePhoto(photo: ChildPhoto): Promise<void> {
  await db.photos.put(photo)
  notify()
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photos.delete(id)
  notify()
}

export async function clearPhotos(): Promise<void> {
  await db.photos.clear()
  notify()
}
