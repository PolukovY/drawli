import { describe, expect, it } from 'vitest'
import en from './en.json'
import uk from './uk.json'
import ru from './ru.json'

type Tree = { [key: string]: string | Tree }

function leaves(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out[path] = value
    else Object.assign(out, leaves(value, path))
  }
  return out
}

const placeholders = (text: string) => (text.match(/\{\{\w+\}\}/g) ?? []).sort()
// English plurals are _one/_other; Ukrainian and Russian are _one/_few/_many.
const withoutPlural = (key: string) => key.replace(/_(one|few|many|other)$/, '')
// Letter glyphs, digits and numbers are the same in every language.
const SHARED = /^exercise\.(uk-|en-|es-|digit-|number-)/

const ukLeaves = leaves(uk)
const ruLeaves = leaves(ru)
const enLeaves = leaves(en)

describe('locales', () => {
  it('Russian has exactly the Ukrainian keys, plural forms included', () => {
    expect(Object.keys(ruLeaves)).toEqual(Object.keys(ukLeaves))
  })

  it('English covers the same strings, allowing for its own plural forms', () => {
    const base = (tree: Record<string, string>) => [...new Set(Object.keys(tree).map(withoutPlural))].sort()
    expect(base(enLeaves)).toEqual(base(ukLeaves))
  })

  it('every translation keeps the same {{placeholders}}', () => {
    for (const [key, value] of Object.entries(ukLeaves)) {
      expect(placeholders(ruLeaves[key]), key).toEqual(placeholders(value))
    }
  })

  it('no Ukrainian-only letters are left untranslated in Russian', () => {
    const leftovers = Object.entries(ruLeaves)
      .filter(([key, value]) => !SHARED.test(key) && /[іїєґІЇЄҐ’ʼ]/.test(value))
      .map(([key]) => key)
    expect(leftovers).toEqual([])
  })
})
