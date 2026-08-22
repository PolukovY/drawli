import { db } from './DrawliDatabase'
import type { AppSettings, Language } from './types'

const SETTINGS_ID = 'app' as const

/** uk-* browsers get Ukrainian; everyone else English. */
export function detectLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith('uk') ? 'uk' : 'en'
}

export async function loadSettings(): Promise<AppSettings | undefined> {
  return db.settings.get(SETTINGS_ID)
}

export async function createSettings(childName: string, language: Language): Promise<AppSettings> {
  const settings: AppSettings = {
    id: SETTINGS_ID,
    childName: childName.trim().slice(0, 20),
    language,
    soundEnabled: true,
    stars: 0,
    onboardedAt: new Date().toISOString(),
    tutorialHomeDone: false,
    tutorialDrawDone: false,
  }
  await db.settings.put(settings)
  return settings
}

export async function updateSettings(patch: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  await db.settings.update(SETTINGS_ID, patch)
}

export async function addStars(amount: number): Promise<number> {
  return db.transaction('rw', db.settings, async () => {
    const current = await db.settings.get(SETTINGS_ID)
    if (!current) return 0
    const stars = current.stars + amount
    await db.settings.update(SETTINGS_ID, { stars })
    return stars
  })
}
