import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { useAppStore } from '../app/store'
import {
  downloadBackup, exportBackup, parseBackup, resetEverything, restoreBackup,
  type BackupFile,
} from '../backup/BackupService'
import '../styles/ui.css'
import './SettingsPage.css'

export function SettingsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const settings = useAppStore((s) => s.settings)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setName = useAppStore((s) => s.setName)
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled)
  const reloadSettings = useAppStore((s) => s.reloadSettings)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null)
  const [importError, setImportError] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

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
              {t('settings.importSummary', {
                drawings: pendingImport.drawings.length,
                stars: pendingImport.settings?.stars ?? 0,
              })}
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
