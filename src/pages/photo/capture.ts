import type { PhotoDecoration } from '../../storage/types'
import { effectById } from './effects'
import { SCENE_SIZE, sceneById } from './scenes'

const MAX_SIDE = 960
const THUMB_SIDE = 320
const SLOT_FRAME = 14
const SLOT_RADIUS = 28

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

/** The source rect that, drawn into a `dstW x dstH` box, covers it exactly — same idea as CSS `object-fit: cover`. */
function coverRect(imgW: number, imgH: number, dstW: number, dstH: number) {
  const imgRatio = imgW / imgH
  const dstRatio = dstW / dstH
  if (imgRatio > dstRatio) {
    const sw = imgH * dstRatio
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh: imgH }
  }
  const sh = imgW / dstRatio
  return { sx: 0, sy: (imgH - sh) / 2, sw: imgW, sh }
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    return
  }
  // Safari < 16 fallback: a plain rect is a fine degradation, just square corners.
  ctx.beginPath()
  ctx.rect(x, y, w, h)
}

function drawDecorations(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, decorations: PhotoDecoration[]) {
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

/**
 * Bakes the chosen effect, scene and every placed sticker into one flat
 * image, plus a small thumbnail for the gallery grid. The original blob is
 * never touched by this — it's what lets the effect or scene be changed
 * later without re-shooting.
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

  const drawPlain = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas unavailable')

    ctx.filter = effect.filter
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.filter = 'none'

    if (effect.overlay) {
      ctx.globalAlpha = effect.overlay.alpha
      ctx.fillStyle = effect.overlay.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
    }

    drawDecorations(ctx, canvas, decorations)
  }

  const drawScene = (canvas: HTMLCanvasElement, activeScene: NonNullable<typeof scene>) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas unavailable')
    const { width: w, height: h } = canvas

    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, activeScene.skyTop)
    sky.addColorStop(1, activeScene.skyBottom)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    if (activeScene.groundColor && activeScene.groundHeight) {
      ctx.fillStyle = activeScene.groundColor
      ctx.fillRect(0, h * (1 - activeScene.groundHeight), w, h * activeScene.groundHeight)
    }

    for (const prop of activeScene.props) {
      ctx.save()
      ctx.translate(prop.x * w, prop.y * h)
      if (prop.rotation) ctx.rotate((prop.rotation * Math.PI) / 180)
      ctx.font = `${prop.size}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(prop.emoji, 0, 0)
      ctx.restore()
    }

    // The photo, framed: a white mat behind it, cover-cropped and clipped
    // to rounded corners inside, like a picture actually sitting in the scene.
    const slotX = activeScene.slot.x * w
    const slotY = activeScene.slot.y * h
    const slotW = activeScene.slot.w * w
    const slotH = activeScene.slot.h * h

    ctx.save()
    roundedRectPath(ctx, slotX - SLOT_FRAME, slotY - SLOT_FRAME, slotW + SLOT_FRAME * 2, slotH + SLOT_FRAME * 2, SLOT_RADIUS)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(42, 35, 64, 0.25)'
    ctx.shadowBlur = 20
    ctx.fill()
    ctx.restore()

    ctx.save()
    roundedRectPath(ctx, slotX, slotY, slotW, slotH, SLOT_RADIUS * 0.7)
    ctx.clip()
    ctx.filter = effect.filter
    const { sx, sy, sw, sh } = coverRect(img.naturalWidth, img.naturalHeight, slotW, slotH)
    ctx.drawImage(img, sx, sy, sw, sh, slotX, slotY, slotW, slotH)
    ctx.filter = 'none'
    if (effect.overlay) {
      ctx.globalAlpha = effect.overlay.alpha
      ctx.fillStyle = effect.overlay.color
      ctx.fillRect(slotX, slotY, slotW, slotH)
      ctx.globalAlpha = 1
    }
    ctx.restore()

    drawDecorations(ctx, canvas, decorations)
  }

  const draw = (canvas: HTMLCanvasElement) => (scene ? drawScene(canvas, scene) : drawPlain(canvas))

  const fullW = scene ? SCENE_SIZE : img.naturalWidth
  const fullH = scene ? SCENE_SIZE : img.naturalHeight

  const full = document.createElement('canvas')
  full.width = fullW
  full.height = fullH
  draw(full)

  const thumbScale = Math.min(1, THUMB_SIDE / Math.max(fullW, fullH))
  const thumb = document.createElement('canvas')
  thumb.width = Math.round(fullW * thumbScale)
  thumb.height = Math.round(fullH * thumbScale)
  draw(thumb)

  const [processed, thumbnail] = await Promise.all([toBlob(full), toBlob(thumb, 0.85)])
  return { processed, thumbnail }
}
