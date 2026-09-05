import { create } from 'zustand'
import type { AppSettings, Language, ToolId, VoiceLanguage } from '../storage/types'
import { addStars, createSettings, defaultVoiceLanguage, detectLanguage, loadSettings, updateSettings } from '../storage/SettingsRepository'
import { initI18n } from '../i18n'
import { setSoundEnabled } from '../audio/sounds'
import { setVoiceChoice, setVoiceEnabled, setVoiceLang } from '../audio/speech'

export const PAINT_COLORS = [
  '#E4443B', '#F5893B', '#FFC53D', '#4EA55F', '#4E86E8',
  '#9B5CE0', '#F08BB4', '#8B5E3C', '#2A2340', '#FFFFFF',
] as const

type BootState = 'loading' | 'onboarding' | 'ready'

/**
 * Settings written before the tutors had switches carry neither field. They are
 * off, which is what a fresh install now does; the language still falls back to
 * the app's own.
 */
function applyVoice(settings: AppSettings) {
  setVoiceEnabled(settings.voiceEnabled ?? false)
  setVoiceLang(settings.voiceLanguage ?? defaultVoiceLanguage(settings.language))
  setVoiceChoice(settings.voiceChoice)
}

interface AppStore {
  boot: BootState
  settings: AppSettings | null
  tool: ToolId
  color: string

  init: () => Promise<void>
  completeOnboarding: (name: string, language: Language) => Promise<void>
  setLanguage: (language: Language) => Promise<void>
  setName: (name: string) => Promise<void>
  setSoundEnabled: (enabled: boolean) => Promise<void>
  setVoiceEnabled: (enabled: boolean) => Promise<void>
  setDemoEnabled: (enabled: boolean) => Promise<void>
  setVoiceLanguage: (language: VoiceLanguage) => Promise<void>
  setVoiceChoice: (choice: string) => Promise<void>
  awardStars: (amount: number) => Promise<void>
  markTutorialDone: (screen: 'home' | 'draw') => Promise<void>
  setTool: (tool: ToolId) => void
  setColor: (color: string) => void
  reloadSettings: () => Promise<void>
}

export const useAppStore = create<AppStore>((set, get) => ({
  boot: 'loading',
  settings: null,
  tool: 'PENCIL',
  color: PAINT_COLORS[0],

  /** Data in IndexedDB -> straight into the app. Nothing there -> onboarding. */
  async init() {
    const settings = await loadSettings()
    if (settings) {
      initI18n(settings.language)
      setSoundEnabled(settings.soundEnabled)
      applyVoice(settings)
      set({ settings, boot: 'ready' })
    } else {
      initI18n(detectLanguage())
      set({ settings: null, boot: 'onboarding' })
    }
  },

  async completeOnboarding(name, language) {
    const settings = await createSettings(name, language)
    setSoundEnabled(settings.soundEnabled)
    applyVoice(settings)
    initI18n(language)
    set({ settings, boot: 'ready' })
  },

  async setLanguage(language) {
    // A child switching the app to English expects the voice to follow. Once
    // the voice has been set apart on purpose, it stays where it was put.
    const current = get().settings
    const follows = !current || current.voiceLanguage === current.language
    const patch = follows ? { language, voiceLanguage: defaultVoiceLanguage(language) } : { language }

    await updateSettings(patch)
    initI18n(language)
    set((s) => ({ settings: s.settings ? { ...s.settings, ...patch } : null }))
    if (follows) setVoiceLang(defaultVoiceLanguage(language))
  },

  async setName(childName) {
    const name = childName.trim().slice(0, 20)
    await updateSettings({ childName: name })
    set((s) => ({ settings: s.settings ? { ...s.settings, childName: name } : null }))
  },

  async setSoundEnabled(soundEnabled) {
    await updateSettings({ soundEnabled })
    setSoundEnabled(soundEnabled)
    set((s) => ({ settings: s.settings ? { ...s.settings, soundEnabled } : null }))
  },

  async setVoiceEnabled(voiceEnabled) {
    await updateSettings({ voiceEnabled })
    setVoiceEnabled(voiceEnabled)
    set((s) => ({ settings: s.settings ? { ...s.settings, voiceEnabled } : null }))
  },

  async setDemoEnabled(demoEnabled) {
    await updateSettings({ demoEnabled })
    set((s) => ({ settings: s.settings ? { ...s.settings, demoEnabled } : null }))
  },

  async setVoiceLanguage(voiceLanguage) {
    // Each language has its own voices, so the old pick means nothing here.
    await updateSettings({ voiceLanguage, voiceChoice: undefined })
    setVoiceLang(voiceLanguage)
    setVoiceChoice(undefined)
    set((s) => ({ settings: s.settings ? { ...s.settings, voiceLanguage, voiceChoice: undefined } : null }))
  },

  async setVoiceChoice(voiceChoice) {
    await updateSettings({ voiceChoice })
    setVoiceChoice(voiceChoice)
    set((s) => ({ settings: s.settings ? { ...s.settings, voiceChoice } : null }))
  },

  async awardStars(amount) {
    const stars = await addStars(amount)
    set((s) => ({ settings: s.settings ? { ...s.settings, stars } : null }))
  },

  async markTutorialDone(screen) {
    const patch = screen === 'home' ? { tutorialHomeDone: true } : { tutorialDrawDone: true }
    await updateSettings(patch)
    set((s) => ({ settings: s.settings ? { ...s.settings, ...patch } : null }))
  },

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),

  async reloadSettings() {
    const settings = await loadSettings()
    set({ settings: settings ?? null, boot: settings ? 'ready' : 'onboarding' })
    if (settings) {
      initI18n(settings.language)
      setSoundEnabled(settings.soundEnabled)
      applyVoice(settings)
    }
  },
}))
