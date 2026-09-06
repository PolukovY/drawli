import type { PhotoDecoration } from '../../storage/types'
import { effectById, type EffectParticle, type PhotoEffect } from './effects'
import { sceneById, SCENE_SIZE, type PhotoScene } from './scenes'

const MAX_SIDE = 960
const THUMB_SIDE = 320

function toBlob(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  })
}

/**
 * Grabs the current video frame, capped to a sane size (a raw camera frame
 * can be several megapixels — more than a hand-drawn sticker photo ever
 * needs, and more than IndexedDB should hold thousands of). A front-camera
 * shot is saved mirrored, matching the "mirror" the child was just smiling
 * into rather than the flipped version only the sensor sees.
 */
export async function captureFrame(
  video: HTMLVideoElement,
  mirrored: boolean,
): Promise<{ blob: Blob; width: number; height: number }> {
  const vw = video.videoWidth || 640
  const vh = video.videoHeight || 480
  const scale = Math.min(1, MAX_SIDE / Math.max(vw, vh))
  const width = Math.round(vw * scale)
  const height = Math.round(vh * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')

  if (mirrored) {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(video, 0, 0, width, height)

  const blob = await toBlob(canvas)
  return { blob, width, height }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = url
  })
}

/** The source rect that `object-fit: cover` would crop, for a canvas draw. */
function coverRect(srcWidth: number, srcHeight: number, dstWidth: number, dstHeight: number) {
  const srcAspect = srcWidth / srcHeight
  const dstAspect = dstWidth / dstHeight
  let sw = srcWidth
  let sh = srcHeight
  if (srcAspect > dstAspect) {
    sw = srcHeight * dstAspect
  } else {
    sh = srcWidth / dstAspect
  }
  return { sx: (srcWidth - sw) / 2, sy: (srcHeight - sh) / 2, sw, sh }
}

/** Draws an effect's baked-in emoji within a given rect (the whole photo, or just its scene slot). */
function drawParticles(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, particles: EffectParticle[]) {
  const base = Math.min(w, h)
  for (const p of particles) {
    ctx.save()
    ctx.translate(x + p.x * w, y + p.y * h)
    if (p.rotation) ctx.rotate((p.rotation * Math.PI) / 180)
    ctx.font = `${p.size * base}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(p.emoji, 0, 0)
    ctx.restore()
  }
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Draws the illustrated background, then the child's photo cover-cropped and
 * clipped into the scene's rounded "slot" — like a framed picture standing
 * inside the room, rather than the photo filling the whole square.
 */
function drawScene(ctx: CanvasRenderingContext2D, size: number, scene: PhotoScene, img: HTMLImageElement, effect: PhotoEffect) {
  const sky = ctx.createLinearGradient(0, 0, 0, size)
  sky.addColorStop(0, scene.skyTop)
  sky.addColorStop(1, scene.skyBottom)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, size, size)

  if (scene.groundColor && scene.groundHeight) {
    ctx.fillStyle = scene.groundColor
    ctx.fillRect(0, size * (1 - scene.groundHeight), size, size * scene.groundHeight)
  }

  for (const prop of scene.props) {
    ctx.save()
    ctx.translate(prop.x * size, prop.y * size)
    if (prop.rotation) ctx.rotate((prop.rotation * Math.PI) / 180)
    ctx.font = `${prop.size}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(prop.emoji, 0, 0)
    ctx.restore()
  }

  const slotX = scene.slot.x * size
  const slotY = scene.slot.y * size
  const slotW = scene.slot.w * size
  const slotH = scene.slot.h * size
  const radius = slotW * 0.06

  ctx.save()
  roundedRectPath(ctx, slotX, slotY, slotW, slotH, radius)
  ctx.clip()
  const { sx, sy, sw, sh } = coverRect(img.naturalWidth, img.naturalHeight, slotW, slotH)
  ctx.filter = effect.filter
  ctx.drawImage(img, sx, sy, sw, sh, slotX, slotY, slotW, slotH)
  ctx.filter = 'none'
  if (effect.overlay) {
    ctx.globalAlpha = effect.overlay.alpha
    ctx.fillStyle = effect.overlay.color
    ctx.fillRect(slotX, slotY, slotW, slotH)
    ctx.globalAlpha = 1
  }
  if (effect.particles) drawParticles(ctx, slotX, slotY, slotW, slotH, effect.particles)
  ctx.restore()

  ctx.save()
  roundedRectPath(ctx, slotX, slotY, slotW, slotH, radius)
  ctx.lineWidth = size * 0.012
  ctx.strokeStyle = '#fff'
  ctx.stroke()
  ctx.restore()
}

/**
 * Bakes the chosen effect, scene, and every placed sticker into one flat
 * image, plus a small thumbnail for the gallery grid. The original blob is
 * never touched by this — it's what lets the effect or scene to be changed
 * later without re-shooting. With a scene, the canvas is a fixed square
 * (the scene's own size) instead of the photo's own dimensions, since the
 * photo is now just one framed element inside a larger illustration.
 */
export async function composePhoto(
  originalBlob: Blob,
  effectId: string | null,
  decorations: PhotoDecoration[],
  sceneId: string | null = null,
): Promise<{ processed: Blob; thumbnail: Blob }> {
  const url = URL.createObjectURL(originalBlob)
  let img: HTMLImageElement
  try {
    img = await loadImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }

  const effect = effectById(effectId)
  const scene = sceneById(sceneId)

  const draw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas unavailable')

    if (scene) {
      drawScene(ctx, canvas.width, scene, img, effect)
    } else {
      ctx.filter = effect.filter
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.filter = 'none'

      if (effect.overlay) {
        ctx.globalAlpha = effect.overlay.alpha
        ctx.fillStyle = effect.overlay.color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
      }
      if (effect.particles) drawParticles(ctx, 0, 0, canvas.width, canvas.height, effect.particles)
    }

    for (const deco of decorations) {
      ctx.save()
      ctx.translate(deco.x * canvas.width, deco.y * canvas.height)
      ctx.rotate((deco.rotation * Math.PI) / 180)
      ctx.font = `${64 * deco.scale}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(deco.sticker, 0, 0)
      ctx.restore()
    }
  }

  const full = document.createElement('canvas')
  full.width = scene ? SCENE_SIZE : img.naturalWidth
  full.height = scene ? SCENE_SIZE : img.naturalHeight
  draw(full)

  const thumbScale = Math.min(1, THUMB_SIDE / Math.max(full.width, full.height))
  const thumb = document.createElement('canvas')
  thumb.width = Math.round(full.width * thumbScale)
  thumb.height = Math.round(full.height * thumbScale)
  draw(thumb)

  const [processed, thumbnail] = await Promise.all([toBlob(full), toBlob(thumb, 0.85)])
  return { processed, thumbnail }
}
