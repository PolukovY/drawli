import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../app/store'
import { Icon } from '../../components/Icon'
import { Fireworks } from '../../components/Fireworks'
import { playSound } from '../../audio/sounds'
import { speak, stopSpeaking } from '../../audio/speech'
import { getPhoto, savePhoto } from '../../storage/PhotoRepository'
import type { PhotoDecoration } from '../../storage/types'
import { useCamera } from './useCamera'
import { captureFrame, composePhoto } from './capture'
import { EFFECT_COLLECTIONS, PHOTO_EFFECTS, effectById } from './effects'
import { MAX_DECORATIONS, STICKERS } from './stickers'
import { Sticker } from './Sticker'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './PhotoStudioPage.css'

type Step = 'home' | 'camera' | 'preview' | 'effects' | 'decorations' | 'done'

interface Shot {
  blob: Blob
  url: string
  width: number
  height: number
}

export function PhotoStudioPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [step, setStep] = useState<Step>(editId ? 'effects' : 'home')
  const [shot, setShot] = useState<Shot | null>(null)
  const [effectId, setEffectId] = useState<string>('none')
  const [decorations, setDecorations] = useState<PhotoDecoration[]>([])
  const [selectedDeco, setSelectedDeco] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedThumbUrl, setSavedThumbUrl] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Set only when reopening a saved photo to decorate again: `finish` then
  // overwrites that same record instead of creating a new one.
  const editingRef = useRef<{ id: string; createdAt: string } | null>(null)

  const camera = useCamera(step === 'camera')
  const stageRef = useRef<HTMLDivElement>(null)
  const shotUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!editId) return
    let cancelled = false
    void getPhoto(editId).then((photo) => {
      if (cancelled) return
      if (!photo) { setNotFound(true); return }
      editingRef.current = { id: photo.id, createdAt: photo.createdAt }
      setShot({ blob: photo.originalImage, url: URL.createObjectURL(photo.originalImage), width: photo.width, height: photo.height })
      setEffectId(photo.selectedEffect ?? 'none')
      setDecorations(photo.decorations)
    })
    return () => { cancelled = true }
  }, [editId])

  useEffect(() => {
    if (step === 'home') speak(t('photo.homeHint'))
    return () => stopSpeaking()
  }, [step, t])

  // Revoke the previous object URL whenever a new one replaces it, and on unmount.
  useEffect(() => {
    shotUrlRef.current = shot?.url ?? null
    return () => { if (shotUrlRef.current) URL.revokeObjectURL(shotUrlRef.current) }
  }, [shot])

  useEffect(() => {
    return () => { if (savedThumbUrl) URL.revokeObjectURL(savedThumbUrl) }
  }, [savedThumbUrl])

  function resetForNewPhoto() {
    editingRef.current = null
    setShot(null)
    setEffectId('none')
    setDecorations([])
    setSelectedDeco(null)
    setStep('camera')
  }

  async function takeShot() {
    const video = camera.videoRef.current
    if (!video || !camera.ready) return
    playSound('tap')
    if (navigator.vibrate) navigator.vibrate(30)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 180)

    const { blob, width, height } = await captureFrame(video, camera.facing === 'user')
    setShot({ blob, url: URL.createObjectURL(blob), width, height })
    setStep('preview')
  }

  function addSticker(sticker: string) {
    if (decorations.length >= MAX_DECORATIONS) return
    playSound('tap')
    const id = crypto.randomUUID()
    // Fan new stickers out across a loose 3x2 grid instead of dropping every
    // one near the middle — otherwise the second sticker lands right on top
    // of the first and looks like nothing happened.
    const slot = decorations.length % 6
    const deco: PhotoDecoration = {
      id,
      sticker,
      x: 0.28 + (slot % 3) * 0.22 + (Math.random() * 0.08 - 0.04),
      y: 0.28 + Math.floor(slot / 3) * 0.3 + (Math.random() * 0.08 - 0.04),
      scale: 1,
      rotation: Math.round(Math.random() * 16 - 8),
    }
    setDecorations((prev) => [...prev, deco])
    setSelectedDeco(id)
  }

  function moveSticker(id: string, x: number, y: number) {
    setDecorations((prev) => prev.map((d) => (d.id === id ? { ...d, x, y } : d)))
  }

  function resizeSticker(id: string, scale: number) {
    setDecorations((prev) => prev.map((d) => (d.id === id ? { ...d, scale } : d)))
  }

  function removeSticker(id: string) {
    playSound('soft')
    setDecorations((prev) => prev.filter((d) => d.id !== id))
    setSelectedDeco((cur) => (cur === id ? null : cur))
  }

  function undoLastSticker() {
    setDecorations((prev) => prev.slice(0, -1))
  }

  async function finish() {
    if (!shot || saving) return
    setSaving(true)
    try {
      const editing = editingRef.current
      const { processed, thumbnail } = await composePhoto(shot.blob, effectId, decorations)
      await savePhoto({
        id: editing?.id ?? crypto.randomUUID(),
        createdAt: editing?.createdAt ?? new Date().toISOString(),
        originalImage: shot.blob,
        processedImage: processed,
        thumbnail,
        width: shot.width,
        height: shot.height,
        selectedEffect: effectId === 'none' ? null : effectId,
        decorations,
      })
      // A re-edit already earned its star the first time it was saved.
      if (!editing) await awardStars(1)
      playSound('fanfare')
      speak(t('photo.doneCheer'))
      setSavedThumbUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(thumbnail) })
      setStep('done')
    } finally {
      setSaving(false)
    }
  }

  const header = (title: string, onBack: () => void) => (
    <header className="row">
      <button className="icon-btn" onClick={onBack} aria-label={t('nav.home')}>
        <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
      </button>
      <div className="title grow">{title}</div>
      <div className="star-badge">
        <Icon name="star" size={22} color="var(--c-star)" filled />
        {stars}
      </div>
    </header>
  )

  if (notFound) {
    return (
      <div className="center-screen">
        <div className="title">{t('photo.galleryEmpty')}</div>
        <button className="btn btn--primary btn--hero" onClick={() => navigate('/photo-studio/gallery')}>
          {t('nav.gallery')}
        </button>
      </div>
    )
  }

  if (step === 'home') {
    return (
      <div className="screen game-screen">
        {header(t('photo.title'), () => navigate('/'))}
        <div className="ps-home">
          <div className="ps-mascot" aria-hidden="true">📸</div>
          <div className="ps-bubble">{t('photo.homeHint')}</div>
          <button className="ps-shutter-cta" onClick={() => setStep('camera')} aria-label={t('photo.takePhoto')}>
            <Icon name="camera" size={56} color="#fff" width={1.8} />
          </button>
          <div className="title" style={{ fontSize: 21 }}>{t('photo.takePhoto')}</div>
          <button className="pill-note" onClick={() => navigate('/photo-studio/gallery')}>
            <Icon name="gallery" size={20} color="var(--c-accent)" />
            {t('nav.gallery')}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'camera') {
    return (
      <div className="ps-camera">
        <video ref={camera.videoRef} className="ps-video" playsInline muted style={{ transform: camera.facing === 'user' ? 'scaleX(-1)' : 'none' }} />
        {flash ? <div className="ps-flash" /> : null}

        <div className="ps-camera__top">
          <button className="ps-camera__btn" onClick={() => setStep('home')} aria-label={t('nav.home')}>
            <Icon name="back" size={22} color="#fff" width={2.4} />
          </button>
          <button className="ps-camera__btn" onClick={camera.flip} aria-label={t('photo.flipCamera')}>
            <Icon name="again" size={22} color="#fff" width={2.2} />
          </button>
        </div>

        {camera.error ? (
          <div className="ps-camera__error">
            <div className="title" style={{ fontSize: 19, color: '#fff' }}>
              {t(camera.error === 'denied' ? 'photo.cameraDenied' : 'photo.cameraUnavailable')}
            </div>
            <button className="btn btn--primary" onClick={camera.retry}>{t('photo.tryAgain')}</button>
          </div>
        ) : (
          <>
            <div className="ps-camera__hint">{t('photo.smile')}</div>
            <div className="ps-camera__bottom">
              <button className="ps-shutter" onClick={() => void takeShot()} disabled={!camera.ready} aria-label={t('photo.takePhoto')}>
                <span />
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  if (step === 'preview' && shot) {
    return (
      <div className="screen game-screen">
        {header(t('photo.previewTitle'), () => setStep('home'))}
        <div className="ps-photo-frame" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
          <img src={shot.url} alt="" className="ps-photo-frame__img" />
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button className="btn grow" onClick={resetForNewPhoto}>
            <Icon name="again" size={22} color="var(--c-text-soft)" />
            {t('photo.retake')}
          </button>
          <button className="btn btn--primary grow" onClick={() => setStep('effects')}>
            <Icon name="check" size={20} color="#fff" width={2.6} />
            {t('photo.likeIt')}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'effects' && shot) {
    const backFromEffects = editingRef.current
      ? () => navigate('/photo-studio/gallery')
      : () => setStep('preview')
    return (
      <div className="screen game-screen">
        {header(t('photo.effectsTitle'), backFromEffects)}
        <div className="ps-photo-frame ps-photo-frame--small" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
          <img src={shot.url} alt="" className="ps-photo-frame__img" style={{ filter: effectById(effectId).filter }} />
          {effectById(effectId).overlay ? (
            <div className="ps-effect-overlay" style={{ background: effectById(effectId).overlay!.color, opacity: effectById(effectId).overlay!.alpha }} />
          ) : null}
        </div>

        <div className="ps-effect-list">
          {EFFECT_COLLECTIONS.map((collection) => (
            <div key={collection.id}>
              <div className="ps-effect-heading">{t(collection.titleKey)}</div>
              <div className="ps-effect-row">
                {PHOTO_EFFECTS.filter((e) => e.collection === collection.id).map((effect) => (
                  <button
                    key={effect.id}
                    className={`ps-effect-card ${effectId === effect.id ? 'ps-effect-card--on' : ''}`}
                    onClick={() => { playSound('tap'); setEffectId(effect.id) }}
                    aria-pressed={effectId === effect.id}
                  >
                    <span className="ps-effect-card__swatch">
                      <img src={shot.url} alt="" style={{ filter: effect.filter }} />
                      {effect.overlay ? (
                        <span className="ps-effect-overlay" style={{ background: effect.overlay.color, opacity: effect.overlay.alpha }} />
                      ) : null}
                      {effectId === effect.id ? (
                        <span className="ps-effect-card__check">
                          <Icon name="check" size={13} color="#fff" width={3} />
                        </span>
                      ) : null}
                    </span>
                    <span className="ps-effect-card__label">{t(effect.titleKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn--primary btn--hero" onClick={() => setStep('decorations')}>
          {t('photo.next')}
          <Icon name="arrow" size={20} color="#fff" />
        </button>
      </div>
    )
  }

  if (step === 'decorations' && shot) {
    return (
      <div className="screen game-screen">
        <header className="row">
          <button className="icon-btn" onClick={() => setStep('effects')} aria-label={t('nav.home')}>
            <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
          </button>
          <div className="title grow">{t('photo.decorationsTitle')}</div>
          <button className="icon-btn" onClick={undoLastSticker} aria-label={t('photo.undo')} disabled={decorations.length === 0}>
            <Icon name="undo" size={22} color="var(--c-text-muted)" />
          </button>
        </header>

        <div ref={stageRef} className="ps-photo-frame ps-stage" style={{ aspectRatio: `${shot.width} / ${shot.height}` }} onPointerDown={() => setSelectedDeco(null)}>
          <img src={shot.url} alt="" className="ps-photo-frame__img" style={{ filter: effectById(effectId).filter }} />
          {effectById(effectId).overlay ? (
            <div className="ps-effect-overlay" style={{ background: effectById(effectId).overlay!.color, opacity: effectById(effectId).overlay!.alpha }} />
          ) : null}
          {decorations.map((deco) => (
            <Sticker
              key={deco.id}
              decoration={deco}
              selected={selectedDeco === deco.id}
              onSelect={setSelectedDeco}
              onMove={moveSticker}
              onResize={resizeSticker}
              onRemove={removeSticker}
              containerRef={stageRef}
            />
          ))}
        </div>

        <div className="ps-sticker-tray">
          {STICKERS.map((sticker) => (
            <button key={sticker} className="ps-sticker-btn" onClick={() => addSticker(sticker)} disabled={decorations.length >= MAX_DECORATIONS}>
              {sticker}
            </button>
          ))}
        </div>

        <button className="btn btn--primary btn--hero" onClick={() => void finish()} disabled={saving}>
          {t('photo.done')}
          <Icon name="check" size={22} color="#fff" width={2.6} />
        </button>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="center-screen">
        <Fireworks variant="burst" />
        <div className="ps-mascot" aria-hidden="true">📸</div>
        <div className="title" style={{ fontSize: 26 }}>{t('photo.doneCheer')}</div>
        {savedThumbUrl ? (
          <div className="ps-done-thumb">
            <img src={savedThumbUrl} alt="" />
            <div className="ps-done-thumb__star">
              <Icon name="star" size={14} color="var(--c-star)" filled />
              +1
            </div>
          </div>
        ) : null}
        <div className="row" style={{ gap: 12 }}>
          <button className="btn btn--hero" onClick={resetForNewPhoto}>
            <Icon name="again" size={22} color="var(--c-text-soft)" />
            {t('photo.retake')}
          </button>
          <button className="btn btn--primary btn--hero" onClick={() => navigate('/photo-studio/gallery')}>
            <Icon name="gallery" size={20} color="#fff" />
            {t('nav.gallery')}
          </button>
        </div>
      </div>
    )
  }

  return null
}
