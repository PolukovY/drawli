/**
 * The shared renderer behind every piece of generated art in the app: guide
 * outlines, colouring sheets, and the glossy shaded "art" picture — built
 * from nothing but a list of coloured regions and the ink steps that outline
 * them. `scripts/generate-exercises.mjs` and `scripts/generate-vocabulary.mjs`
 * both draw on this, so a new picture in either pipeline gets the same toy-like
 * shading for free.
 */

export const VIEWBOX = '0 0 400 400'

export const guideSvg = (shapes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">\n  ${shapes.join('\n  ')}\n</svg>\n`

/**
 * Colouring sheet: flat fillable regions, then the complete line drawing on
 * top. Without the ink layer a coloured shape loses its face and reads as a
 * blob — regions carry silhouette, the outline carries recognition.
 */
export const regionSvg = (regions, steps, { colored }) => {
  const ink = steps.flatMap((s) => s.shapes)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">\n` +
    regions
      .map((r) => {
        const fill = colored ? r.color : '#FFFFFF'
        return `  <g id="${r.id}" data-region="${r.id}" data-default-color="${r.color}" fill="${fill}" stroke="none">${r.shape}</g>`
      })
      .join('\n') +
    `\n  <g data-ink="1" fill="none" stroke="#2A2340" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">\n    ${ink.join('\n    ')}\n  </g>\n</svg>\n`
  )
}


/** #RRGGBB -> {r,g,b}; the exercise palette is all six-digit hex. */
export const rgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})

export const hex = ({ r, g, b }) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`

export const lighten = (color, amount) => {
  const c = rgb(color)
  return hex({ r: c.r + (255 - c.r) * amount, g: c.g + (255 - c.g) * amount, b: c.b + (255 - c.b) * amount })
}

export const darken = (color, amount) => {
  const c = rgb(color)
  return hex({ r: c.r * (1 - amount), g: c.g * (1 - amount), b: c.b * (1 - amount) })
}

/**
 * The picture the child is working towards, with volume: every region is lit
 * from the top left and darkened at the bottom, and the whole thing stands on
 * a soft shadow. Derived from the same flat colours the colouring sheet uses,
 * so a new exercise gets its shaded version for free — no second drawing to
 * keep in sync.
 */
export const artSvg = (regions, steps) => {
  const ink = steps.flatMap((s) => s.shapes)
  const gradients = regions
    .map((r, i) => {
      const id = `vol-${i}`
      return (
        `    <radialGradient id="${id}" cx="34%" cy="26%" r="82%">\n` +
        `      <stop offset="0%" stop-color="${lighten(r.color, 0.26)}"/>\n` +
        `      <stop offset="46%" stop-color="${r.color}"/>\n` +
        `      <stop offset="100%" stop-color="${darken(r.color, 0.38)}"/>\n` +
        `    </radialGradient>`
      )
    })
    .join('\n')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">\n` +
    `  <defs>\n${gradients}\n` +
    // One shared wash gives every shape the same light direction; without it
    // each region reads as a separate sticker rather than one solid object.
    `    <linearGradient id="depth" x1="0" y1="0" x2="0.35" y2="1">\n` +
    `      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.16"/>\n` +
    `      <stop offset="38%" stop-color="#FFFFFF" stop-opacity="0"/>\n` +
    `      <stop offset="100%" stop-color="#2A2340" stop-opacity="0.3"/>\n` +
    `    </linearGradient>\n` +
    `    <radialGradient id="floor">\n` +
    `      <stop offset="0%" stop-color="#2A2340" stop-opacity="0.3"/>\n` +
    `      <stop offset="100%" stop-color="#2A2340" stop-opacity="0"/>\n` +
    `    </radialGradient>\n` +
    `  </defs>\n` +
    `  <ellipse cx="200" cy="368" rx="150" ry="22" fill="url(#floor)"/>\n` +
    regions
      .map((r, i) => `  <g fill="url(#vol-${i})" stroke="none">${r.shape}</g>`)
      .join('\n') +
    `\n` +
    regions
      .map((r) => `  <g fill="url(#depth)" stroke="none">${r.shape}</g>`)
      .join('\n') +
    `\n  <g fill="none" stroke="#2A2340" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">\n    ${ink.join('\n    ')}\n  </g>\n</svg>\n`
  )
}

export const thumbnailSvg = (exercise) =>
  exercise.regions?.length
    ? artSvg(exercise.regions, exercise.steps)
    : guideSvg(exercise.steps.flatMap((s) => s.shapes))
