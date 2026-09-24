import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { listGameStats } from '../storage/GameStatsRepository'
import type { GameStats } from '../storage/types'
import { buildAuditRows, lastPlayedLabel } from './audit/auditUtils'
import '../styles/ui.css'
import './ProgressPage.css'
import './AuditPage.css'

/** "Which games get played most, and how much progress has each earned" — a parent-facing report. */
export function AuditPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [stats, setStats] = useState<GameStats[] | null>(null)

  useEffect(() => {
    void listGameStats().then(setStats)
  }, [])

  const rows = stats ? buildAuditRows(stats) : []
  const played = rows.filter((row) => row.playCount > 0)
  const totalPlays = rows.reduce((sum, row) => sum + row.playCount, 0)
  const totalStars = rows.reduce((sum, row) => sum + row.starsEarned, 0)

  function lastPlayedText(row: (typeof rows)[number]): string {
    const label = lastPlayedLabel(row.lastPlayedAt)
    if (label === 'today') return t('audit.playedToday')
    if (label === 'yesterday') return t('audit.playedYesterday')
    if (label === 'earlier' && row.lastPlayedAt) return new Date(row.lastPlayedAt).toLocaleDateString()
    return ''
  }

  return (
    <div className="screen">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/settings')} aria-label={t('nav.settings')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('audit.title')}</div>
      </header>

      <div className="stat-row">
        <div className="stat stat--accent">
          <Icon name="play" size={40} color="#fff" filled />
          <div>
            <div className="stat__value">{totalPlays}</div>
            <div className="stat__label">{t('audit.totalPlays')}</div>
          </div>
        </div>
        <div className="stat card">
          <span className="stat__icon"><Icon name="star" size={26} color="var(--c-star)" filled /></span>
          <div>
            <div className="stat__value">{totalStars}</div>
            <div className="stat__label" style={{ color: 'var(--c-text-muted)' }}>{t('audit.totalStars')}</div>
          </div>
        </div>
      </div>

      {stats === null ? (
        <div className="subtitle">{t('play.loading')}</div>
      ) : played.length === 0 ? (
        <div className="center-screen">
          <div className="subtitle">{t('audit.empty')}</div>
        </div>
      ) : (
        <div className="category-list">
          {played.map((row, index) => (
            <section key={row.game.id} className="card audit-row">
              <span className="audit-row__rank">{index + 1}</span>
              <span className="audit-row__art" aria-hidden="true">{row.game.art}</span>
              <div className="grow">
                <div className="audit-row__title">{t(row.game.titleKey)}</div>
                <div className="muted audit-row__meta">
                  {t('audit.playCount', { count: row.playCount })}
                  {lastPlayedText(row) ? ` · ${lastPlayedText(row)}` : ''}
                </div>
              </div>
              <div className="audit-row__stars">
                <Icon name="star" size={18} color="var(--c-star)" filled />
                {row.starsEarned}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
