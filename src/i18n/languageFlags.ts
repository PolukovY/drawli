/**
 * A flag standing in for a language's name everywhere a child or a parent
 * picks one: the home screen's Play tab, and both language choices in
 * Settings. A flag reads at a glance and takes a fraction of the width a
 * word does — the same reason this app already draws every game and category
 * as an emoji rather than a label.
 *
 * English is the Union Jack, not the Stars and Stripes, to match the accent
 * this app already prefers (`en-GB` before `en-US` in `audio/speech.ts`).
 *
 * Russian gets a plain "RU" instead of a flag: a flag names a state, not a
 * language, and a state flag is not something this app shows.
 */
export const LANGUAGE_FLAG: Record<'uk' | 'en' | 'es' | 'ru', string> = {
  uk: '🇺🇦',
  en: '🇬🇧',
  es: '🇪🇸',
  ru: 'RU',
}
