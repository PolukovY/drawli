import { db } from './DrawliDatabase'
import type { AppSettings, Language, VoiceLanguage } from './types'

const SETTINGS_ID = 'app' as const

/**
 * Bumped when a default changes in a way an existing install should pick up.
 *
 * 2: both tutors start off. The hand demonstration and the spoken tutor are
 *    for a child meeting a shape for the first time; by the tenth picture they
 *    are something to sit through, and each one costs the tablet work on every
 *    step. Both are a switch away in Settings.
 */
const SETTINGS_VERSION = 2

/** uk-* browsers get Ukrainian; everyone else English. */
export function detectLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith('uk') ? 'uk' : 'en'
}

/** The voice starts in the language the app is in; Settings can split them. */
export function defaultVoiceLanguage(language: Language): VoiceLanguage {
  return language
}

export async function loadSettings(): Promise<AppSettings | undefined> {
  const settings = await db.settings.get(SETTINGS_ID)
  if (!settings) return undefined
  return migrate(settings)
}

/**
 * A changed default reaches a tablet that already has settings, once. A parent
 * who turns a tutor back on keeps it: the version is stamped either way, so
 * this never runs against the same install twice.
 */
async function migrate(settings: AppSettings): Promise<AppSettings> {
  if ((settings.settingsVersion ?? 1) >= SETTINGS_VERSION) return settings

  const patch: Partial<AppSettings> = {
    voiceEnabled: false,
    demoEnabled: false,
    settingsVersion: SETTINGS_VERSION,
  }
  await db.settings.update(SETTINGS_ID, patch)
  return { ...settings, ...patch }
}

export async function createSettings(childName: string, language: Language): Promise<AppSettings> {
  const settings: AppSettings = {
    id: SETTINGS_ID,
    childName: childName.trim().slice(0, 20),
    language,
    soundEnabled: true,
    // Both tutors start off; the child finds them in Settings when they want
    // to be shown a step rather than get on with it.
    voiceEnabled: false,
    demoEnabled: false,
    voiceLanguage: defaultVoiceLanguage(language),
    stars: 0,
    onboardedAt: new Date().toISOString(),
    tutorialHomeDone: false,
    tutorialDrawDone: false,
    settingsVersion: SETTINGS_VERSION,
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
