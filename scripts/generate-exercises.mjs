import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, EXERCISES } from './exercise-data.mjs'
import { ES_WORDS } from './exercises/es-words.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/exercises')
const i18nDir = resolve(root, 'src/i18n')

const VIEWBOX = '0 0 400 400'

const guideSvg = (shapes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">\n  ${shapes.join('\n  ')}\n</svg>\n`

/**
 * Colouring sheet: flat fillable regions, then the complete line drawing on
 * top. Without the ink layer a coloured shape loses its face and reads as a
 * blob — regions carry silhouette, the outline carries recognition.
 */
const regionSvg = (regions, steps, { colored }) => {
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

const thumbnailSvg = (exercise) =>
  exercise.regions?.length
    ? regionSvg(exercise.regions, exercise.steps, { colored: true })
    : guideSvg(exercise.steps.flatMap((s) => s.shapes))

const seenIds = new Set()
for (const exercise of EXERCISES) {
  if (seenIds.has(exercise.id)) throw new Error(`duplicate exercise id: ${exercise.id}`)
  if (!exercise.title?.uk || !exercise.title?.en) throw new Error(`missing title: ${exercise.id}`)
  if (!CATEGORIES.some((c) => c.id === exercise.category)) {
    throw new Error(`unknown category "${exercise.category}" on ${exercise.id}`)
  }
  seenIds.add(exercise.id)
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const index = {
  version: 1,
  categories: CATEGORIES.map((c) => ({
    id: c.id,
    titleKey: `category.${c.id}`,
    color: c.color,
    order: c.order,
    kind: c.kind ?? 'draw',
  })),
  exercises: [],
}

const titles = { uk: {}, en: {} }
const wordList = { uk: {}, en: {}, es: {} }
/**
 * Articles ride in their own file: the word games read plain words, the article
 * game reads these. English follows the vowel rule; Spanish gender is data.
 */
const articleList = { en: {}, es: {} }
const paintByNumber = {}
const englishArticle = (word) => ('AEIOU'.includes(word.trim()[0]?.toUpperCase()) ? 'an' : 'a')

for (const exercise of EXERCISES) {
  const dir = resolve(outDir, exercise.id)
  await mkdir(dir, { recursive: true })

  const steps = []
  for (const [i, step] of exercise.steps.entries()) {
    const file = `step-${String(i + 1).padStart(2, '0')}.svg`
    await writeFile(resolve(dir, file), guideSvg(step.shapes))
    steps.push({ id: step.id, guide: file, defaultTool: 'PENCIL' })
  }

  if (exercise.regions?.length) {
    await writeFile(resolve(dir, 'final.svg'), regionSvg(exercise.regions, exercise.steps, { colored: false }))
    steps.push({ id: 'color', mode: 'COLORING', guide: 'final.svg', defaultTool: 'FILL' })
  }

  await writeFile(resolve(dir, 'thumbnail.svg'), thumbnailSvg(exercise))

  const titleKey = `exercise.${exercise.id}`
  const json = {
    id: exercise.id,
    titleKey,
    ...(exercise.glyph ? { glyph: exercise.glyph } : {}),
    category: exercise.category,
    difficulty: exercise.difficulty,
    thumbnail: 'thumbnail.svg',
    steps,
  }
  await writeFile(resolve(dir, 'exercise.json'), `${JSON.stringify(json, null, 2)}\n`)

  if (exercise.regions?.length) {
    // The colour-by-numbers game needs to know which colour belongs where.
    paintByNumber[exercise.id] = exercise.regions.map((r, i) => ({
      id: r.id,
      color: r.color,
      number: i + 1,
    }))
  }

  index.exercises.push({
    id: exercise.id,
    titleKey,
    category: exercise.category,
    difficulty: exercise.difficulty,
    thumbnail: `${exercise.id}/thumbnail.svg`,
    steps: steps.length,
    ...(exercise.glyph ? { glyph: exercise.glyph } : {}),
  })

  titles.uk[exercise.id] = exercise.title.uk
  titles.en[exercise.id] = exercise.title.en

  // The spelling game reads words from here, so it can run in a language the
  // interface is not translated into (Spanish).
  if (!exercise.glyph) {
    wordList.uk[exercise.id] = exercise.title.uk
    wordList.en[exercise.id] = exercise.title.en
    articleList.en[exercise.id] = englishArticle(exercise.title.en)

    const spanish = ES_WORDS[exercise.id]
    if (spanish) {
      wordList.es[exercise.id] = spanish.word
      articleList.es[exercise.id] = spanish.article
    }
  }
}

await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)
await writeFile(resolve(outDir, 'words.json'), `${JSON.stringify(wordList, null, 2)}\n`)
await writeFile(resolve(outDir, 'articles.json'), `${JSON.stringify(articleList, null, 2)}\n`)
await writeFile(resolve(outDir, 'regions.json'), `${JSON.stringify(paintByNumber, null, 2)}\n`)

const missingEs = index.exercises.filter(
  (e) => !e.glyph && !wordList.es[e.id] && ['animals', 'nature', 'food', 'home', 'transport', 'shapes'].includes(e.category),
)
if (missingEs.length) console.warn(`no Spanish word for: ${missingEs.map((e) => e.id).join(', ')}`)

// Exercise names live beside their geometry; the translation files are generated
// so a new exercise can never ship with a missing title in one language.
for (const lang of ['uk', 'en']) {
  const file = resolve(i18nDir, `${lang}.json`)
  const messages = JSON.parse(await readFile(file, 'utf8'))
  messages.exercise = titles[lang]
  await writeFile(file, `${JSON.stringify(messages, null, 2)}\n`)
}

const perCategory = CATEGORIES.map(
  (c) => `${c.id}=${index.exercises.filter((e) => e.category === c.id).length}`,
).join(' ')
console.log(`generated ${index.exercises.length} exercises (${perCategory})`)
