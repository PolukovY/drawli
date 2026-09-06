import type { PhotoDecoration } from '../../storage/types'
import { effectById, type EffectParticle, type PhotoEffect } from './effects'
import { sceneById, SCENE_SIZE, type PhotoScene } from './scenes'
import { cutoutById, type AnimalCutout } from './animalCutouts'

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

/** One ear, shaped per the cutout's `earShape`, centered at the given point. */
function drawEar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, cutout: AnimalCutout) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = cutout.earColor ?? cutout.bodyColor
  switch (cutout.earShape) {
    case 'pointy':
      ctx.beginPath()
      ctx.moveTo(-r * 0.4, r * 0.3)
      ctx.lineTo(0, -r * 0.9)
      ctx.lineTo(r * 0.4, r * 0.3)
      ctx.closePath()
      ctx.fill()
      break
    case 'tall':
      ctx.beginPath()
      ctx.ellipse(0, -r * 0.3, r * 0.28, r * 0.75, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(0, -r * 0.3, r * 0.14, r * 0.5, 0, 0, Math.PI * 2)
      ctx.fillStyle = cutout.innerEarColor
      ctx.fill()
      break
    case 'floppy':
      ctx.beginPath()
      ctx.ellipse(0, r * 0.5, r * 0.32, r * 0.65, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'round':
    default:
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.42, r * 0.42, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.22, r * 0.22, 0, 0, Math.PI * 2)
      ctx.fillStyle = cutout.innerEarColor
      ctx.fill()
      break
  }
  ctx.restore()
}

/**
 * Draws an illustrated animal body with a round hole where its head would
 * be, then the child's own photo cover-cropped and clipped into that hole —
 * a face-in-the-hole photo prop, not a mask over the child's real face.
 */
function drawCutout(ctx: CanvasRenderingContext2D, size: number, cutout: AnimalCutout, img: HTMLImageElement, effect: PhotoEffect) {
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, cutout.bgTop)
  bg.addColorStop(1, cutout.bgBottom)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  const cx = cutout.faceSlot.cx * size
  const cy = cutout.faceSlot.cy * size
  const r = cutout.faceSlot.r * size

  if (cutout.maneColor) {
    ctx.beginPath()
    ctx.arc(cx, cy, r * 1.55, 0, Math.PI * 2)
    ctx.fillStyle = cutout.maneColor
    ctx.fill()
  }

  const earDx = r * 0.95
  const earY = cy - r * 0.85
  if (cutout.earShape !== 'floppy') {
    drawEar(ctx, cx - earDx, earY, r, cutout)
    drawEar(ctx, cx + earDx, earY, r, cutout)
  }

  const bodyTopY = cy + r * 0.6
  const bodyW = r * 2.6
  const bodyH = size - bodyTopY + r * 0.3
  roundedRectPath(ctx, cx - bodyW / 2, bodyTopY, bodyW, bodyH, r * 0.5)
  ctx.fillStyle = cutout.bodyColor
  ctx.fill()

  if (cutout.bellyColor) {
    const bellyW = bodyW * 0.5
    const bellyH = bodyH * 0.55
    roundedRectPath(ctx, cx - bellyW / 2, bodyTopY + bodyH * 0.35, bellyW, bellyH, r * 0.35)
    ctx.fillStyle = cutout.bellyColor
    ctx.fill()
  }

  if (cutout.earShape === 'floppy') {
    drawEar(ctx, cx - earDx, earY, r, cutout)
    drawEar(ctx, cx + earDx, earY, r, cutout)
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  const { sx, sy, sw, sh } = coverRect(img.naturalWidth, img.naturalHeight, r * 2, r * 2)
  ctx.filter = effect.filter
  ctx.drawImage(img, sx, sy, sw, sh, cx - r, cy - r, r * 2, r * 2)
  ctx.filter = 'none'
  if (effect.overlay) {
    ctx.globalAlpha = effect.overlay.alpha
    ctx.fillStyle = effect.overlay.color
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    ctx.globalAlpha = 1
  }
  if (effect.particles) drawParticles(ctx, cx - r, cy - r, r * 2, r * 2, effect.particles)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.lineWidth = size * 0.012
  ctx.strokeStyle = '#fff'
  ctx.stroke()
}

/**
 * Bakes the chosen effect, scene or cutout, and every placed sticker into
 * one flat image, plus a small thumbnail for the gallery grid. The original
 * blob is never touched by this — it's what lets the effect, scene, or
 * cutout to be changed later without re-shooting. With a scene or cutout,
 * the canvas is a fixed square (their own size) instead of the photo's own
 * dimensions, since the photo is now just one element inside a larger
 * illustration rather than the whole picture. A scene and a cutout are
 * mutually exclusive — the UI never sets both at once.
 */
export async function composePhoto(
  originalBlob: Blob,
  effectId: string | null,
  decorations: PhotoDecoration[],
  sceneId: string | null = null,
  cutoutId: string | null = null,
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
  const cutout = cutoutById(cutoutId)

  const draw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas unavailable')

    if (scene) {
      drawScene(ctx, canvas.width, scene, img, effect)
    } else if (cutout) {
      drawCutout(ctx, canvas.width, cutout, img, effect)
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
  full.width = scene || cutout ? SCENE_SIZE : img.naturalWidth
  full.height = scene || cutout ? SCENE_SIZE : img.naturalHeight
  draw(full)

  const thumbScale = Math.min(1, THUMB_SIDE / Math.max(full.width, full.height))
  const thumb = document.createElement('canvas')
  thumb.width = Math.round(full.width * thumbScale)
  thumb.height = Math.round(full.height * thumbScale)
  draw(thumb)

  const [processed, thumbnail] = await Promise.all([toBlob(full), toBlob(thumb, 0.85)])
  return { processed, thumbnail }
}
