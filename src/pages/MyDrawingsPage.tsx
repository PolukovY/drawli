import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { assetUrl, loadIndex } from '../exercise/ExerciseLoader'
import type { ExerciseIndex } from '../exercise/Exercise'
import { deleteDrawing, listDrawings } from '../storage/DrawingRepository'
import type { SavedDrawing } from '../storage/types'
import { useAppStore } from '../app/store'
import '../styles/ui.css'
import './MyDrawingsPage.css'

function useThumbnails(drawings: SavedDrawing[]) {
  return useMemo(() => {
    const map: Record<string, string> = {}
    for (const drawing of drawings) {
      if (drawing.thumbnail) map[drawing.id] = URL.createObjectURL(drawing.thumbnail)
    }
    return map
  }, [drawings])
}

export function MyDrawingsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [drawings, setDrawings] = useState<SavedDrawing[]>([])
  const [index, setIndex] = useState<ExerciseIndex | null>(null)
  const [selected, setSelected] = useState<SavedDrawing | null>(null)

  const thumbnails = useThumbnails(drawings)

  useEffect(() => {
    void listDrawings().then(setDrawings)
    void loadIndex().then(setIndex).catch(() => undefined)
  }, [])

  // Blob URLs leak if the list is replaced without revoking them.
  useEffect(() => () => {
    for (const url of Object.values(thumbnails)) URL.revokeObjectURL(url)
  }, [thumbnails])

  function summaryFor(drawing: SavedDrawing) {
    return index?.exercises.find((e) => e.id === drawing.exerciseId)
  }

  /** Free-hand sheets have no exercise behind them, so they name themselves. */
  function titleFor(drawing: SavedDrawing) {
    const summary = summaryFor(drawing)
    if (summary) return t(summary.titleKey)
    return drawing.exerciseId === 'free' ? t('free.title') : drawing.exerciseId
  }

  function whenLabel(iso: string) {
    const date = new Date(iso)
    const today = new Date()
    const sameDay = date.toDateString() === today.toDateString()
    if (sameDay) return t('gallery.today')
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return t('gallery.yesterday')
    return date.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })
  }

  async function remove(id: string) {
    await deleteDrawing(id)
    setDrawings(await listDrawings())
    setSelected(null)
  }

  return (
    <div className="screen">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('gallery.title')}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      <div className="gallery-grid">
        {drawings.map((drawing) => {
          const summary = summaryFor(drawing)
          const inProgress = drawing.status === 'IN_PROGRESS'
          return (
            <button
              key={drawing.id}
              className={`drawing-card ${inProgress ? 'drawing-card--wip' : ''}`}
              onClick={() => setSelected(drawing)}
            >
              <span className="drawing-card__art">
                {thumbnails[drawing.id] ? (
                  <img src={thumbnails[drawing.id]} alt="" />
                ) : summary ? (
                  <img src={assetUrl(summary.thumbnail)} alt="" className="drawing-card__ghost" />
                ) : null}
              </span>
              <span className="drawing-card__meta">
                <span className="drawing-card__title">{titleFor(drawing)}</span>
                <span className="muted" style={{ fontSize: 14 }}>
                  {inProgress && summary
                    ? t('gallery.stepShort', { step: Math.min(drawing.currentStep + 1, summary.steps), total: summary.steps })
                    : whenLabel(drawing.updatedAt)}
                </span>
              </span>
              <span className={`drawing-card__badge ${inProgress ? 'drawing-card__badge--wip' : ''}`}>
                {inProgress ? t('gallery.inProgress') : <Icon name="check" size={16} color="#fff" width={3.4} />}
              </span>
            </button>
          )
        })}

        <button className="drawing-card drawing-card--new" onClick={() => navigate('/')}>
          <span className="drawing-card__plus">
            <Icon name="plus" size={30} color="#fff" width={2.8} />
          </span>
          {t('gallery.new')}
        </button>
      </div>

      {drawings.length === 0 ? <div className="subtitle">{t('gallery.empty')}</div> : null}

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="title">{titleFor(selected)}</div>
            {thumbnails[selected.id] ? (
              <img src={thumbnails[selected.id]} alt="" style={{ maxWidth: '100%', borderRadius: 20 }} />
            ) : null}
            <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
              {selected.exerciseId === 'free' ? (
                <button className="btn btn--primary" onClick={() => navigate('/free')}>
                  <Icon name="pencil" size={22} color="#fff" width={2.2} />
                  {t('free.newSheet')}
                </button>
              ) : (
                <>
                  {selected.status === 'IN_PROGRESS' ? (
                    <button className="btn btn--primary" onClick={() => navigate(`/draw/${selected.exerciseId}`)}>
                      <Icon name="play" size={20} color="#fff" filled />
                      {t('home.continue')}
                    </button>
                  ) : null}
                  <button className="btn" onClick={() => navigate(`/draw/${selected.exerciseId}?new=1`)}>
                    <Icon name="again" size={22} color="var(--c-text-soft)" width={2.4} />
                    {t('complete.again')}
                  </button>
                </>
              )}
            </div>
            <button className="btn btn--danger" onClick={() => void remove(selected.id)}>
              <Icon name="trash" size={22} color="var(--c-danger)" width={2.2} />
              {t('gallery.delete')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
