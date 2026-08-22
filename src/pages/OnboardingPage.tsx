import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../app/store'
import { detectLanguage } from '../storage/SettingsRepository'
import type { Language } from '../storage/types'
import { Icon } from '../components/Icon'
import '../styles/ui.css'

export function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<Language>(detectLanguage())

  function pickLanguage(next: Language) {
    setLanguage(next)
    void i18n.changeLanguage(next)
  }

  const canStart = name.trim().length > 0

  return (
    <div className="center-screen">
      <div style={{
        width: 96, height: 96, borderRadius: 30, background: 'var(--c-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 14px 30px rgba(124,92,255,.35)',
      }}>
        <Icon name="pencil" size={52} color="#fff" width={2} />
      </div>

      <div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px' }}>{t('onboarding.hello')}</div>
        <div className="subtitle" style={{ paddingTop: 8 }}>{t('onboarding.askName')}</div>
      </div>

      <input
        className="name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && canStart) void completeOnboarding(name, language) }}
        placeholder={t('onboarding.placeholder')}
        maxLength={20}
        autoFocus
        autoComplete="off"
        aria-label={t('onboarding.askName')}
      />

      <button
        className="btn btn--primary btn--hero"
        disabled={!canStart}
        onClick={() => void completeOnboarding(name, language)}
      >
        {t('onboarding.start')}
        <Icon name="arrow" size={28} color="#fff" width={2.6} />
      </button>

      <div className="pill-note">
        <Icon name="shield" size={20} color="var(--c-text-muted)" />
        {t('onboarding.privacy')}
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className={`chip ${language === 'uk' ? 'chip--on' : ''}`} onClick={() => pickLanguage('uk')}>Українська</button>
        <button className={`chip ${language === 'en' ? 'chip--on' : ''}`} onClick={() => pickLanguage('en')}>English</button>
      </div>
    </div>
  )
}
