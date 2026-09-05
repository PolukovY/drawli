import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/Icon'
import { deletePhoto, clearPhotos, listPhotos, subscribePhotos } from '../../storage/PhotoRepository'
import type { ChildPhoto } from '../../storage/types'
import { groupPhotosByDay } from './photoUtils'
import { ParentalGate } from './ParentalGate'
import '../../styles/ui.css'
import './PhotoGalleryPage.css'

const DAY_LABEL_KEY = { today: 'photo.galleryToday', yesterday: 'photo.galleryYesterday', earlier: 'photo.galleryEarlier' } as const

type GateAction = { kind: 'delete' | 'download' | 'share' | 'clear'; photoId?: string }

export function PhotoGalleryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<ChildPhoto[]>([])
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [gate, setGate] = useState<GateAction | null>(null)
  const [slideshow, setSlideshow] = useState(false)

  useEffect(() => {
    const refresh = () => { void listPhotos().then(setPhotos) }
    refresh()
    return subscribePhotos(refresh)
  }, [])

  const urls = useMemo(() => {
    const map = new Map<string, { thumb: string; full: string }>()
    for (const photo of photos) {
      map.set(photo.id, {
        thumb: URL.createObjectURL(photo.thumbnail),
        full: URL.createObjectURL(photo.processedImage),
      })
    }
    return map
  }, [photos])

  useEffect(() => {
    return () => { for (const { thumb, full } of urls.values()) { URL.revokeObjectURL(thumb); URL.revokeObjectURL(full) } }
  }, [urls])

  const groups = groupPhotosByDay(photos)
  const viewing = photos.find((p) => p.id === viewingId) ?? null

  // Slideshow steps through the same order the grid shows, oldest group last.
  useEffect(() => {
    if (!slideshow || photos.length === 0) return
    const timer = window.setInterval(() => {
      setViewingId((cur) => {
        const idx = photos.findIndex((p) => p.id === cur)
        const next = photos[(idx + 1) % photos.length]
        return next?.id ?? null
      })
    }, 2200)
    return () => window.clearInterval(timer)
  }, [slideshow, photos])

  function startSlideshow() {
    if (photos.length === 0) return
    setViewingId(photos[0].id)
    setSlideshow(true)
  }

  function closeViewer() {
    setViewingId(null)
    setSlideshow(false)
  }

  async function runGated(action: GateAction) {
    if (action.kind === 'delete' && action.photoId) {
      await deletePhoto(action.photoId)
      if (viewingId === action.photoId) closeViewer()
    } else if (action.kind === 'clear') {
      await clearPhotos()
      closeViewer()
    } else if (action.kind === 'download' && viewing) {
      await downloadOrShare(viewing, 'download')
    } else if (action.kind === 'share' && viewing) {
      await downloadOrShare(viewing, 'share')
    }
    setGate(null)
  }

  async function downloadOrShare(photo: ChildPhoto, mode: 'download' | 'share') {
    const file = new File([photo.processedImage], `drawli-photo-${photo.id}.jpg`, { type: 'image/jpeg' })
    if (mode === 'share' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch {
        // The child (or parent) cancelled the share sheet — nothing to recover from.
        return
      }
    }
    // Desktop browsers, or no Web Share API: a plain download link.
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="screen">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/photo-studio')} aria-label={t('nav.home')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('photo.galleryTitle')}</div>
        {photos.length > 0 ? (
          <button className="icon-btn" onClick={() => setGate({ kind: 'clear' })} aria-label={t('photo.clearAll')}>
            <Icon name="trash" size={22} color="var(--c-text-muted)" />
          </button>
        ) : null}
      </header>

      {photos.length === 0 ? (
        <div className="center-screen">
          <div style={{ fontSize: 64 }} aria-hidden="true">📸</div>
          <div className="muted">{t('photo.galleryEmpty')}</div>
          <button className="btn btn--primary btn--hero" onClick={() => navigate('/photo-studio')}>
            {t('photo.takePhoto')}
          </button>
        </div>
      ) : (
        <div className="ps-gallery-scroll">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="ps-gallery-heading">{t(DAY_LABEL_KEY[group.key])}</div>
              <div className="ps-gallery-grid">
                {group.photos.map((photo) => (
                  <button key={photo.id} className="ps-gallery-thumb" onClick={() => setViewingId(photo.id)}>
                    <img src={urls.get(photo.id)?.thumb} alt="" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 ? (
        <div className="row" style={{ justifyContent: 'center', gap: 14 }}>
          <button className="icon-btn" onClick={startSlideshow} aria-label={t('photo.slideshow')}>
            <Icon name="play" size={24} color="var(--c-text-muted)" filled />
          </button>
          <button className="icon-btn icon-btn--primary" onClick={() => navigate('/photo-studio')} aria-label={t('photo.takePhoto')}>
            <Icon name="camera" size={24} color="#fff" width={2.2} />
          </button>
        </div>
      ) : null}

      {viewing ? (
        <div className="ps-viewer">
          <img src={urls.get(viewing.id)?.full} alt="" className="ps-viewer__img" />
          <button className="ps-camera__btn ps-viewer__close" onClick={closeViewer} aria-label={t('settings.cancel')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
          </button>

          {!slideshow ? (
            <div className="ps-viewer__actions">
              <button className="ps-viewer__btn" onClick={() => navigate(`/photo-studio/edit/${viewing.id}`)}>
                <Icon name="brush" size={20} color="#fff" />
                {t('photo.reEdit')}
              </button>
              <button className="ps-viewer__btn" onClick={() => setGate({ kind: 'download' })}>
                <Icon name="download" size={20} color="#fff" />
                {t('photo.download')}
              </button>
              {typeof navigator.share === 'function' ? (
                <button className="ps-viewer__btn" onClick={() => setGate({ kind: 'share' })}>
                  <Icon name="share" size={20} color="#fff" />
                  {t('photo.share')}
                </button>
              ) : null}
              <button className="ps-viewer__btn ps-viewer__btn--danger" onClick={() => setGate({ kind: 'delete', photoId: viewing.id })}>
                <Icon name="trash" size={20} color="#fff" />
                {t('photo.delete')}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {gate ? (
        <ParentalGate onCancel={() => setGate(null)} onSuccess={() => void runGated(gate)} />
      ) : null}
    </div>
  )
}
