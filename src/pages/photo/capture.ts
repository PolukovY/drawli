import type { PhotoDecoration } from '../../storage/types'
import { effectById } from './effects'

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

/**
 * Bakes the chosen effect and every placed sticker into one flat image, plus
 * a small thumbnail for the gallery grid. The original blob is never touched
 * by this — it's what lets the effect be changed later without re-shooting.
 */
export async function composePhoto(
  originalBlob: Blob,
  effectId: string | null,
  decorations: PhotoDecoration[],
): Promise<{ processed: Blob; thumbnail: Blob }> {
  const url = URL.createObjectURL(originalBlob)
  let img: HTMLImageElement
  try {
    img = await loadImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }

  const effect = effectById(effectId)
  const draw = (canvas: HTMLCanvasElement) => {
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
  full.width = img.naturalWidth
  full.height = img.naturalHeight
  draw(full)

  const thumbScale = Math.min(1, THUMB_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const thumb = document.createElement('canvas')
  thumb.width = Math.round(img.naturalWidth * thumbScale)
  thumb.height = Math.round(img.naturalHeight * thumbScale)
  draw(thumb)

  const [processed, thumbnail] = await Promise.all([toBlob(full), toBlob(thumb, 0.85)])
  return { processed, thumbnail }
}
