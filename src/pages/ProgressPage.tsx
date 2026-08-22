import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { assetUrl, loadIndex } from '../exercise/ExerciseLoader'
import type { ExerciseIndex } from '../exercise/Exercise'
import { listProgress } from '../storage/ProgressRepository'
import type { ExerciseProgress } from '../storage/types'
import { useAppStore } from '../app/store'
import '../styles/ui.css'
import './ProgressPage.css'

export function ProgressPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [index, setIndex] = useState<ExerciseIndex | null>(null)
  const [progress, setProgress] = useState<ExerciseProgress[]>([])

  useEffect(() => {
    void loadIndex().then(setIndex).catch(() => undefined)
    void listProgress().then(setProgress)
  }, [])

  const completed = useMemo(
    () => new Set(progress.filter((p) => p.status === 'COMPLETED').map((p) => p.exerciseId)),
    [progress],
  )

  const categories = useMemo(
    () => (index?.categories ?? []).slice().sort((a, b) => a.order - b.order),
    [index],
  )

  const total = index?.exercises.length ?? 0

  return (
    <div className="screen">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('progress.title')}</div>
      </header>

      <div className="stat-row">
        <div className="stat stat--accent">
          <Icon name="star" size={46} color="#fff" filled />
          <div>
            <div className="stat__value">{stars}</div>
            <div className="stat__label">{t('progress.stars')}</div>
          </div>
        </div>
        <div className="stat card">
          <span className="stat__icon"><Icon name="check" size={26} color="var(--c-success)" width={3} /></span>
          <div>
            <div className="stat__value">
              {completed.size} <span style={{ fontSize: 22, color: 'var(--c-text-muted)' }}>/ {total}</span>
            </div>
            <div className="stat__label" style={{ color: 'var(--c-text-muted)' }}>{t('progress.completed')}</div>
          </div>
        </div>
      </div>

      <div className="category-list">
        {categories.map((category) => {
          const items = index?.exercises.filter((e) => e.category === category.id) ?? []
          if (items.length === 0) return null
          const done = items.filter((e) => completed.has(e.id)).length
          return (
            <section key={category.id} className="card category">
              <div className="row" style={{ paddingBottom: 14 }}>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{t(category.titleKey)}</div>
                <div className="muted" style={{ fontSize: 16 }}>
                  {t('progress.ofTotal', { done, total: items.length })}
                </div>
                <div className="bar grow">
                  <span style={{ width: `${(done / items.length) * 100}%` }} />
                </div>
              </div>
              <div className="category__items">
                {items.map((exercise) => (
                  <button
                    key={exercise.id}
                    className={`tile ${completed.has(exercise.id) ? 'tile--done' : ''}`}
                    onClick={() => navigate(`/draw/${exercise.id}`)}
                    title={t(exercise.titleKey)}
                  >
                    <img src={assetUrl(exercise.thumbnail)} alt={t(exercise.titleKey)} />
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
