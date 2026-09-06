import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { EFFECT_COLLECTIONS, PHOTO_EFFECTS, effectById, type EffectParticle } from './effects'
import { MAX_DECORATIONS, STICKERS } from './stickers'
import { PHOTO_SCENES, SCENE_SIZE, sceneById } from './scenes'
import { ANIMAL_MASKS, MASK_SCALE } from './masks'
import { imageDisplayRect, type DisplayRect } from './photoUtils'
import { Sticker } from './Sticker'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './PhotoStudioPage.css'

type Step = 'home' | 'camera' | 'preview' | 'decorations' | 'done'
type Tool = 'effects' | 'scenes' | 'masks' | 'stickers'

/** An effect's baked-in emoji, positioned as % children of whatever box represents the photo right now. */
function EffectParticles({ particles, basisPx }: { particles: EffectParticle[]; basisPx: number }) {
  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="ps-scene-prop"
          aria-hidden="true"
          style={{
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            fontSize: p.size * basisPx,
            transform: `translate(-50%, -50%) rotate(${p.rotation ?? 0}deg)`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </>
  )
}

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

  const [step, setStep] = useState<Step>(editId ? 'decorations' : 'home')
  const [tool, setTool] = useState<Tool>('effects')
  const [shot, setShot] = useState<Shot | null>(null)
  const [effectId, setEffectId] = useState<string>('none')
  const [sceneId, setSceneId] = useState<string | null>(null)
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
  const [stageRect, setStageRect] = useState<DisplayRect>({ offsetX: 0, offsetY: 0, width: 0, height: 0 })

  // Recomputed on every resize (rotation, split-view) so a placed sticker
  // stays under the same point on the photo, not the same point on screen.
  // Depends on `step` too, not just `shot`: the stage <div> this measures
  // doesn't exist in the DOM until the decorations step actually renders,
  // so an effect keyed on `shot` alone fires once too early (ref still
  // null), never reruns once the div mounts, and every sticker is left
  // pinned at the zero-rect default — stuck in the top-left corner. Also
  // depends on `sceneId`: a scene replaces the photo's own aspect ratio with
  // the scene's fixed square, so stickers (and the scene layer itself) need
  // to be measured against that square instead once one is picked.
  useLayoutEffect(() => {
    if (step !== 'decorations') return
    const el = stageRef.current
    if (!el || !shot) return
    const aspect = sceneId ? 1 : shot.width / shot.height
    const update = () => setStageRect(imageDisplayRect(el.clientWidth, el.clientHeight, aspect))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [shot, step, sceneId])

  useEffect(() => {
    if (!editId) return
    let cancelled = false
    void getPhoto(editId).then((photo) => {
      if (cancelled) return
      if (!photo) { setNotFound(true); return }
      editingRef.current = { id: photo.id, createdAt: photo.createdAt }
      setShot({ blob: photo.originalImage, url: URL.createObjectURL(photo.originalImage), width: photo.width, height: photo.height })
      setEffectId(photo.selectedEffect ?? 'none')
      setSceneId(photo.selectedScene ?? null)
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
    setSceneId(null)
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

  // An animal mask starts big and roughly where a face already is, since it's
  // meant to be dragged straight onto the child's own face rather than fanned
  // out to an empty corner the way a small sticker is.
  function addMask(sticker: string) {
    if (decorations.length >= MAX_DECORATIONS) return
    playSound('tap')
    const id = crypto.randomUUID()
    const deco: PhotoDecoration = { id, sticker, x: 0.5, y: 0.42, scale: MASK_SCALE, rotation: 0 }
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
      const { processed, thumbnail } = await composePhoto(shot.blob, effectId, decorations, sceneId)
      await savePhoto({
        id: editing?.id ?? crypto.randomUUID(),
        createdAt: editing?.createdAt ?? new Date().toISOString(),
        originalImage: shot.blob,
        processedImage: processed,
        thumbnail,
        width: shot.width,
        height: shot.height,
        selectedEffect: effectId === 'none' ? null : effectId,
        selectedScene: sceneId,
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
          <button className="btn btn--primary grow" onClick={() => setStep('decorations')}>
            <Icon name="check" size={20} color="#fff" width={2.6} />
            {t('photo.likeIt')}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'decorations' && shot) {
    const backFromDecorations = editingRef.current
      ? () => navigate('/photo-studio/gallery')
      : () => setStep('preview')
    const scene = sceneById(sceneId)
    const effect = effectById(effectId)
    return (
      <div className="screen game-screen">
        <header className="row">
          <button className="icon-btn" onClick={backFromDecorations} aria-label={t('nav.home')}>
            <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
          </button>
          <div className="title grow">{t('photo.decorationsTitle')}</div>
          <button className="icon-btn" onClick={undoLastSticker} aria-label={t('photo.undo')} disabled={decorations.length === 0}>
            <Icon name="undo" size={22} color="var(--c-text-muted)" />
          </button>
        </header>

        <div
          ref={stageRef}
          className="ps-photo-frame ps-stage"
          style={{ aspectRatio: scene ? '1 / 1' : `${shot.width} / ${shot.height}` }}
          onPointerDown={() => setSelectedDeco(null)}
        >
          {scene ? (
            <div
              className="ps-scene-layer"
              style={{
                left: stageRect.offsetX,
                top: stageRect.offsetY,
                width: stageRect.width,
                height: stageRect.height,
                background: `linear-gradient(${scene.skyTop}, ${scene.skyBottom})`,
              }}
            >
              {scene.groundColor && scene.groundHeight ? (
                <div className="ps-scene-ground" style={{ height: `${scene.groundHeight * 100}%`, background: scene.groundColor }} />
              ) : null}
              {scene.props.map((prop, i) => (
                <span
                  key={i}
                  className="ps-scene-prop"
                  aria-hidden="true"
                  style={{
                    left: `${prop.x * 100}%`,
                    top: `${prop.y * 100}%`,
                    fontSize: (prop.size / SCENE_SIZE) * stageRect.width,
                    transform: `translate(-50%, -50%) rotate(${prop.rotation ?? 0}deg)`,
                  }}
                >
                  {prop.emoji}
                </span>
              ))}
              <div
                className="ps-scene-slot"
                style={{
                  left: `${scene.slot.x * 100}%`,
                  top: `${scene.slot.y * 100}%`,
                  width: `${scene.slot.w * 100}%`,
                  height: `${scene.slot.h * 100}%`,
                }}
              >
                <img src={shot.url} alt="" className="ps-scene-slot__img" style={{ filter: effect.filter }} />
                {effect.overlay ? (
                  <div className="ps-effect-overlay" style={{ background: effect.overlay.color, opacity: effect.overlay.alpha }} />
                ) : null}
                {effect.particles ? (
                  <EffectParticles particles={effect.particles} basisPx={Math.min(scene.slot.w * stageRect.width, scene.slot.h * stageRect.height)} />
                ) : null}
              </div>
            </div>
          ) : (
            <div
              className="ps-frame-inner"
              style={{ left: stageRect.offsetX, top: stageRect.offsetY, width: stageRect.width, height: stageRect.height }}
            >
              <img src={shot.url} alt="" className="ps-photo-frame__img" style={{ filter: effect.filter }} />
              {effect.overlay ? (
                <div className="ps-effect-overlay" style={{ background: effect.overlay.color, opacity: effect.overlay.alpha }} />
              ) : null}
              {effect.particles ? (
                <EffectParticles particles={effect.particles} basisPx={Math.min(stageRect.width, stageRect.height)} />
              ) : null}
            </div>
          )}
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
              imageRect={stageRect}
            />
          ))}
        </div>

        {/* Effects, scenes, masks, and stickers share one screen now — a
            child switches tools instead of being marched through a fixed
            order of steps. */}
        <div className="ps-tool-tabs">
          <button className={`ps-tool-tab ${tool === 'effects' ? 'ps-tool-tab--on' : ''}`} onClick={() => setTool('effects')}>
            <span aria-hidden="true">🎨</span>
            {t('photo.toolEffects')}
          </button>
          <button className={`ps-tool-tab ${tool === 'scenes' ? 'ps-tool-tab--on' : ''}`} onClick={() => setTool('scenes')}>
            <span aria-hidden="true">🏠</span>
            {t('photo.toolScenes')}
          </button>
          <button className={`ps-tool-tab ${tool === 'masks' ? 'ps-tool-tab--on' : ''}`} onClick={() => setTool('masks')}>
            <span aria-hidden="true">🐾</span>
            {t('photo.toolMasks')}
          </button>
          <button className={`ps-tool-tab ${tool === 'stickers' ? 'ps-tool-tab--on' : ''}`} onClick={() => setTool('stickers')}>
            <span aria-hidden="true">😊</span>
            {t('photo.toolStickers')}
          </button>
        </div>

        <div className="ps-tool-panel">
          {tool === 'effects' ? (
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
          ) : tool === 'scenes' ? (
            <div className="ps-effect-row">
              <button
                className={`ps-scene-card ${sceneId === null ? 'ps-scene-card--on' : ''}`}
                onClick={() => { playSound('tap'); setSceneId(null) }}
                aria-pressed={sceneId === null}
              >
                <span className="ps-scene-card__swatch" style={{ background: 'var(--c-surface)' }}>
                  <span aria-hidden="true">🚫</span>
                  {sceneId === null ? (
                    <span className="ps-effect-card__check">
                      <Icon name="check" size={13} color="#fff" width={3} />
                    </span>
                  ) : null}
                </span>
                <span className="ps-effect-card__label">{t('photo.sceneNone')}</span>
              </button>
              {PHOTO_SCENES.map((s) => (
                <button
                  key={s.id}
                  className={`ps-scene-card ${sceneId === s.id ? 'ps-scene-card--on' : ''}`}
                  onClick={() => { playSound('tap'); setSceneId(s.id) }}
                  aria-pressed={sceneId === s.id}
                >
                  <span className="ps-scene-card__swatch" style={{ background: `linear-gradient(${s.skyTop}, ${s.groundColor ?? s.skyBottom})` }}>
                    <span aria-hidden="true">{s.previewEmoji}</span>
                    {sceneId === s.id ? (
                      <span className="ps-effect-card__check">
                        <Icon name="check" size={13} color="#fff" width={3} />
                      </span>
                    ) : null}
                  </span>
                  <span className="ps-effect-card__label">{t(s.titleKey)}</span>
                </button>
              ))}
            </div>
          ) : tool === 'masks' ? (
            <div className="ps-sticker-tray">
              {ANIMAL_MASKS.map((mask) => (
                <button key={mask} className="ps-sticker-btn ps-sticker-btn--mask" onClick={() => addMask(mask)} disabled={decorations.length >= MAX_DECORATIONS}>
                  {mask}
                </button>
              ))}
            </div>
          ) : (
            <div className="ps-sticker-tray">
              {STICKERS.map((sticker) => (
                <button key={sticker} className="ps-sticker-btn" onClick={() => addSticker(sticker)} disabled={decorations.length >= MAX_DECORATIONS}>
                  {sticker}
                </button>
              ))}
            </div>
          )}
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
