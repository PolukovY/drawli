/**
 * The finished picture is two layers: coloured SVG regions plus the child's
 * canvas strokes. A thumbnail of the canvas alone loses the colouring, so both
 * are composed here.
 */
export async function composeThumbnail(
  canvas: HTMLCanvasElement,
  overlaySvg: SVGSVGElement | null,
  width = 300,
  height = 225,
  background = '#FFFFFF',
): Promise<Blob | undefined> {
  const out = document.createElement('canvas')
  out.width = width
  out.height = height
  const ctx = out.getContext('2d')
  if (!ctx) return undefined

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  if (overlaySvg) {
    const image = await svgToImage(overlaySvg)
    if (image) drawContained(ctx, image, image.width, image.height, width, height)
  }

  drawContained(ctx, canvas, canvas.width, canvas.height, width, height)

  return new Promise((resolve) => {
    out.toBlob((blob) => resolve(blob ?? undefined), 'image/webp', 0.85)
  })
}

function drawContained(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
) {
  if (!sourceWidth || !sourceHeight) return
  const scale = Math.min(width / sourceWidth, height / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  ctx.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
}

/** Serialize the live SVG so the fills the child chose are what gets captured. */
function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement | null> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const box = svg.getBoundingClientRect()
  clone.setAttribute('width', String(Math.max(1, Math.round(box.width))))
  clone.setAttribute('height', String(Math.max(1, Math.round(box.height))))

  const markup = new XMLSerializer().serializeToString(clone)
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`

  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}
