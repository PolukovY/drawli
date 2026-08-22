import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, EXERCISES } from './exercise-data.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/exercises')

const VIEWBOX = '0 0 400 400'

const guideSvg = (shapes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">\n  ${shapes.join('\n  ')}\n</svg>\n`

const regionSvg = (regions, { colored }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">\n` +
  regions
    .map((r) => {
      const fill = colored ? r.color : '#FFFFFF'
      return `  <g id="${r.id}" data-region="${r.id}" data-default-color="${r.color}" fill="${fill}" stroke="#2A2340" stroke-width="4" stroke-linejoin="round">${r.shape}</g>`
    })
    .join('\n') +
  '\n</svg>\n'

/** Thumbnail: colored regions when the exercise has them, outline otherwise. */
const thumbnailSvg = (exercise) => {
  if (exercise.regions?.length) return regionSvg(exercise.regions, { colored: true })
  return guideSvg(exercise.steps.flatMap((s) => s.shapes))
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const index = { version: 1, categories: [], exercises: [] }

index.categories = CATEGORIES.map((c) => ({
  id: c.id,
  titleKey: `category.${c.id}`,
  color: c.color,
  order: c.order,
}))

for (const exercise of EXERCISES) {
  const dir = resolve(outDir, exercise.id)
  await mkdir(dir, { recursive: true })

  const steps = []
  for (const [i, step] of exercise.steps.entries()) {
    const file = `step-${String(i + 1).padStart(2, '0')}.svg`
    await writeFile(resolve(dir, file), guideSvg(step.shapes))
    steps.push({ id: step.id, guide: file, defaultTool: 'PENCIL' })
  }

  const hasColoring = Boolean(exercise.regions?.length)
  if (hasColoring) {
    await writeFile(resolve(dir, 'final.svg'), regionSvg(exercise.regions, { colored: false }))
    steps.push({ id: 'color', mode: 'COLORING', guide: 'final.svg', defaultTool: 'FILL' })
  }

  await writeFile(resolve(dir, 'thumbnail.svg'), thumbnailSvg(exercise))

  const json = {
    id: exercise.id,
    titleKey: `exercise.${exercise.id}`,
    category: exercise.category,
    difficulty: exercise.difficulty,
    thumbnail: 'thumbnail.svg',
    steps,
  }
  await writeFile(resolve(dir, 'exercise.json'), `${JSON.stringify(json, null, 2)}\n`)

  index.exercises.push({
    id: exercise.id,
    titleKey: json.titleKey,
    category: exercise.category,
    difficulty: exercise.difficulty,
    thumbnail: `${exercise.id}/thumbnail.svg`,
    steps: steps.length,
  })
}

await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)

console.log(`generated ${index.exercises.length} exercises in public/exercises`)
