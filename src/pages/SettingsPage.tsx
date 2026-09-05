import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { useAppStore } from '../app/store'
import { currentVoiceOption, hasVoiceFor, listVoiceOptions, speak, voiceQuality } from '../audio/speech'
import { praiseLine } from '../audio/phrases'
import type { VoiceLanguage } from '../storage/types'
import { BUILD_ID, refreshApp } from '../app/serviceWorker'
import {
  downloadBackup, exportBackup, parseBackup, resetEverything, restoreBackup,
  type BackupFile,
} from '../backup/BackupService'
import '../styles/ui.css'
import './SettingsPage.css'

/** Each label is written in its own language: a child picks by sound, not by translation. */
const VOICE_LANGUAGES: { id: VoiceLanguage; label: string }[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const settings = useAppStore((s) => s.settings)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setName = useAppStore((s) => s.setName)
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled)
  const setVoiceEnabled = useAppStore((s) => s.setVoiceEnabled)
  const setDemoEnabled = useAppStore((s) => s.setDemoEnabled)
  const setVoiceLanguage = useAppStore((s) => s.setVoiceLanguage)
  const setVoiceChoice = useAppStore((s) => s.setVoiceChoice)
  const reloadSettings = useAppStore((s) => s.reloadSettings)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null)
  const [importError, setImportError] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const voiceOn = settings?.voiceEnabled ?? false
  const demoOn = settings?.demoEnabled ?? false
  const voiceLang: VoiceLanguage = settings?.voiceLanguage ?? settings?.language ?? 'uk'
  // Read straight from the browser: the list changes with the device, not with
  // anything this app stores.
  const voiceOptions = voiceOn ? listVoiceOptions(voiceLang) : []
  const chosenVoiceId = settings?.voiceChoice?.[voiceLang] ?? currentVoiceOption(voiceLang)?.id

  async function handleFile(file: File) {
    const parsed = parseBackup(await file.text())
    if (!parsed) {
      setImportError(true)
      return
    }
    setImportError(false)
    setPendingImport(parsed)
  }

  async function applyImport() {
    if (!pendingImport) return
    await restoreBackup(pendingImport)
    setPendingImport(null)
    await reloadSettings()
    navigate('/')
  }

  async function applyReset() {
    await resetEverything()
    setConfirmReset(false)
    await reloadSettings()
  }

  return (
    <div className="screen">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('settings.title')}</div>
      </header>

      <div className="settings-list">
        <section className="card setting">
          <span className="setting__icon"><Icon name="user" size={28} color="var(--c-accent)" /></span>
          <div className="grow">
            <div className="setting__title">{t('settings.name')}</div>
            <div className="muted" style={{ fontSize: 16 }}>{t('settings.nameHint')}</div>
          </div>
          <input
            className="setting__input"
            value={settings?.childName ?? ''}
            onChange={(e) => void setName(e.target.value)}
            maxLength={20}
            aria-label={t('settings.name')}
          />
        </section>

        <section className="card setting">
          <span className="setting__icon"><Icon name="globe" size={28} color="var(--c-accent)" /></span>
          <div className="setting__title grow">{t('settings.language')}</div>
          <div className="row" style={{ gap: 10 }}>
            <button
              className={`btn ${settings?.language === 'uk' ? 'btn--primary' : ''}`}
              onClick={() => void setLanguage('uk')}
            >
              Українська
            </button>
            <button
              className={`btn ${settings?.language === 'en' ? 'btn--primary' : ''}`}
              onClick={() => void setLanguage('en')}
            >
              English
            </button>
          </div>
        </section>

        <section className="card setting">
          <span className="setting__icon"><Icon name="sound" size={28} color="var(--c-accent)" /></span>
          <div className="setting__title grow">{t('settings.sound')}</div>
          <button
            className={`switch ${settings?.soundEnabled ? 'switch--on' : ''}`}
            onClick={() => void setSoundEnabled(!settings?.soundEnabled)}
            role="switch"
            aria-checked={settings?.soundEnabled ?? false}
            aria-label={t('settings.sound')}
          >
            <span />
          </button>
        </section>

        <section className="card setting">
          <span className="setting__icon"><Icon name="play" size={28} color="var(--c-accent)" filled /></span>
          <div className="grow">
            <div className="setting__title">{t('settings.demo')}</div>
            <div className="muted" style={{ fontSize: 16 }}>{t('settings.demoHint')}</div>
          </div>
          <button
            className={`switch ${demoOn ? 'switch--on' : ''}`}
            onClick={() => void setDemoEnabled(!demoOn)}
            role="switch"
            aria-checked={demoOn}
            aria-label={t('settings.demo')}
          >
            <span />
          </button>
        </section>

        <section className="card setting">
          <span className="setting__icon"><Icon name="sound" size={28} color="var(--c-accent)" /></span>
          <div className="grow">
            <div className="setting__title">{t('settings.voice')}</div>
            <div className="muted" style={{ fontSize: 16 }}>{t('settings.voiceHint')}</div>
          </div>
          <button
            className={`switch ${voiceOn ? 'switch--on' : ''}`}
            onClick={() => void setVoiceEnabled(!voiceOn)}
            role="switch"
            aria-checked={voiceOn}
            aria-label={t('settings.voice')}
          >
            <span />
          </button>
        </section>

        {voiceOn ? (
          <section className="card setting">
            <span className="setting__icon"><Icon name="globe" size={28} color="var(--c-accent)" /></span>
            <div className="grow">
              <div className="setting__title">{t('settings.voiceLanguage')}</div>
              <div className="muted" style={{ fontSize: 16 }}>
                {!hasVoiceFor(voiceLang)
                  ? t('settings.voiceMissing')
                  : voiceQuality(voiceLang) === 'basic'
                    ? t('settings.voiceBasic')
                    : t('settings.voiceTryHint')}
              </div>
            </div>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {VOICE_LANGUAGES.map(({ id, label }) => (
                <button
                  key={id}
                  className={`btn ${voiceLang === id ? 'btn--primary' : ''}`}
                  onClick={() => {
                    void setVoiceLanguage(id)
                    // Hearing it is the only way to judge it.
                    speak(praiseLine(id, settings?.childName), { lang: id })
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {voiceOn && voiceOptions.length > 0 ? (
          <section className="card setting setting--stack">
            <div className="setting__row">
              <span className="setting__icon"><Icon name="user" size={28} color="var(--c-accent)" /></span>
              <div className="grow">
                <div className="setting__title">{t('settings.voicePick')}</div>
                <div className="muted" style={{ fontSize: 16 }}>{t('settings.voicePickHint')}</div>
              </div>
            </div>

            <div className="voice-grid">
              {voiceOptions.map((option) => (
                <button
                  key={option.id}
                  className={`voice-card ${option.id === chosenVoiceId ? 'voice-card--on' : ''}`}
                  onClick={() => {
                    void setVoiceChoice(voiceLang, option.id)
                    speak(praiseLine(voiceLang, settings?.childName), { lang: voiceLang, option })
                  }}
                  aria-pressed={option.id === chosenVoiceId}
                >
                  <span className="voice-card__name">{t(`settings.character.${option.characterId}`)}</span>
                  <span className="voice-card__voice">{option.voiceName}</span>
                  <span className="voice-card__play">
                    <Icon name="play" size={18} color="var(--c-accent)" width={2.4} />
                    {t('settings.voiceTry')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="card setting">
          <span className="setting__icon"><Icon name="star" size={28} color="var(--c-star)" filled /></span>
          <div className="grow">
            <div className="setting__title">{t('nav.progress')}</div>
            <div className="muted" style={{ fontSize: 16 }}>{t('settings.progressHint')}</div>
          </div>
          <button className="btn btn--primary" onClick={() => navigate('/progress')}>
            {t('settings.progressOpen')}
          </button>
        </section>

        <section className="card setting">
          <span className="setting__icon"><Icon name="download" size={28} color="var(--c-accent)" /></span>
          <div className="grow">
            <div className="setting__title">{t('settings.backup')}</div>
            <div className="muted" style={{ fontSize: 16 }}>
              {importError ? t('settings.importBadFile') : t('settings.backupHint')}
            </div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn--primary" onClick={() => void exportBackup().then(downloadBackup)}>
              {t('settings.export')}
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              {t('settings.import')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFile(file)
                e.target.value = ''
              }}
            />
          </div>
        </section>

        <section className="card setting">
          <span className="setting__icon"><Icon name="again" size={28} color="var(--c-accent)" /></span>
          <div className="grow">
            <div className="setting__title">{t('settings.refresh')}</div>
            <div className="muted" style={{ fontSize: 16 }}>{t('settings.refreshHint')}</div>
            <div className="muted" style={{ fontSize: 14 }}>{t('settings.build', { id: BUILD_ID })}</div>
          </div>
          <button
            className="btn btn--primary"
            disabled={refreshing}
            onClick={() => { setRefreshing(true); void refreshApp() }}
          >
            {refreshing ? t('settings.refreshing') : t('settings.refreshDo')}
          </button>
        </section>

        <section className="card setting">
          <span className="setting__icon setting__icon--danger">
            <Icon name="trash" size={28} color="var(--c-danger)" />
          </span>
          <div className="grow">
            <div className="setting__title">{t('settings.reset')}</div>
            <div className="muted" style={{ fontSize: 16 }}>{t('settings.resetHint')}</div>
          </div>
          <button className="btn btn--danger" onClick={() => setConfirmReset(true)}>
            {t('settings.resetDo')}
          </button>
        </section>
      </div>

      <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
        <Icon name="shield" size={20} color="var(--c-text-muted)" />
        <span className="muted" style={{ fontSize: 16 }}>{t('settings.privacy')}</span>
      </div>

      {pendingImport ? (
        <div className="modal-backdrop" onClick={() => setPendingImport(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="title">{t('settings.importConfirm')}</div>
            <div className="subtitle">
              {t('settings.importDrawings', { count: pendingImport.drawings.length })}
              {' · '}
              {t('settings.importStars', { count: pendingImport.settings?.stars ?? 0 })}
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn" onClick={() => setPendingImport(null)}>{t('settings.cancel')}</button>
              <button className="btn btn--primary" onClick={() => void applyImport()}>{t('settings.importDo')}</button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmReset ? (
        <div className="modal-backdrop" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="title">{t('settings.resetConfirm')}</div>
            <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn" onClick={() => setConfirmReset(false)}>{t('settings.cancel')}</button>
              <button className="btn btn--danger" onClick={() => void applyReset()}>{t('settings.resetDo')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
