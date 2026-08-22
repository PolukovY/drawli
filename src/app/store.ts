import { create } from 'zustand'
import type { AppSettings, Language, ToolId } from '../storage/types'
import { addStars, createSettings, detectLanguage, loadSettings, updateSettings } from '../storage/SettingsRepository'
import { initI18n } from '../i18n'
import { setSoundEnabled } from '../audio/sounds'

export const PAINT_COLORS = [
  '#E4443B', '#F5893B', '#FFC53D', '#4EA55F', '#4E86E8',
  '#9B5CE0', '#F08BB4', '#8B5E3C', '#2A2340', '#FFFFFF',
] as const

type BootState = 'loading' | 'onboarding' | 'ready'

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
      set({ settings, boot: 'ready' })
    } else {
      initI18n(detectLanguage())
      set({ settings: null, boot: 'onboarding' })
    }
  },

  async completeOnboarding(name, language) {
    const settings = await createSettings(name, language)
    setSoundEnabled(settings.soundEnabled)
    initI18n(language)
    set({ settings, boot: 'ready' })
  },

  async setLanguage(language) {
    await updateSettings({ language })
    initI18n(language)
    set((s) => ({ settings: s.settings ? { ...s.settings, language } : null }))
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
    if (settings) initI18n(settings.language)
    void get
  },
}))
