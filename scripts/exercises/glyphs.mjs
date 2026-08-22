// Літери та цифри. Every glyph is written the way it is taught: one stroke
// group per step, in writing order, inside a 400×400 box (x 120–280, y 80–330).

const T = 80      // top line
const M = 205     // middle line
const B = 330     // baseline
const L = 120     // left edge
const R = 280     // right edge
const CX = 200    // centre

const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}"/>`
const stem = (x) => line(x, T, x, B)
const bar = (y, x1 = L, x2 = R) => line(x1, y, x2, y)

/** Left-opening bowl, used by B, P, R, Ь, В, Б… */
const bowl = (yTop, yBottom, x = L, right = R) => {
  const rY = (yBottom - yTop) / 2
  return `<path d="M${x} ${yTop} H${right - 40} a${rY} ${rY} 0 0 1 0 ${yBottom - yTop} H${x}"/>`
}

const oval = `<ellipse cx="${CX}" cy="${(T + B) / 2}" rx="80" ry="125"/>`

const arcC = `<path d="M${R} ${T + 40} a80 125 0 1 0 0 ${B - T - 80}"/>`

// Latin capitals — reused by the Spanish and English sets, and by the Cyrillic
// letters that share a shape (А В Е І К М Н О Р С Т Х).
export const LATIN = {
  A: [[line(L, B, CX, T), line(CX, T, R, B)], [bar(255, 148, 252)]],
  B: [[stem(L)], [bowl(T, M)], [bowl(M, B)]],
  C: [[arcC]],
  D: [[stem(L)], [`<path d="M${L} ${T} H210 a95 125 0 0 1 0 250 H${L}"/>`]],
  E: [[stem(L)], [bar(T), bar(M), bar(B)]],
  F: [[stem(L)], [bar(T), bar(M, L, 250)]],
  G: [[arcC], [line(R, M + 20, R, M + 20), line(230, M + 20, R, M + 20), line(R, M + 20, R, 300)]],
  H: [[stem(L), stem(R)], [bar(M)]],
  I: [[stem(CX)], [bar(T, 150, 250), bar(B, 150, 250)]],
  J: [[`<path d="M240 ${T} V270 a60 60 0 0 1 -120 0"/>`], [bar(T, 170, 270)]],
  K: [[stem(L)], [line(R, T, L, M + 5), line(L, M - 5, R, B)]],
  L: [[stem(L)], [bar(B)]],
  M: [[line(L, B, L, T), line(L, T, CX, M)], [line(CX, M, R, T), line(R, T, R, B)]],
  N: [[stem(L)], [line(L, T, R, B), stem(R)]],
  O: [[oval]],
  P: [[stem(L)], [bowl(T, M)]],
  Q: [[oval], [line(230, 280, 290, 350)]],
  R: [[stem(L)], [bowl(T, M)], [line(L, M, R, B)]],
  S: [[`<path d="M260 ${T + 30} a70 60 0 1 0 -60 55 a70 60 0 1 1 -60 55"/>`]],
  T: [[bar(T)], [stem(CX)]],
  U: [[`<path d="M${L} ${T} V250 a80 80 0 0 0 160 0 V${T}"/>`]],
  V: [[line(L, T, CX, B), line(CX, B, R, T)]],
  W: [[line(110, T, 155, B), line(155, B, CX, 190)], [line(CX, 190, 245, B), line(245, B, 290, T)]],
  X: [[line(L, T, R, B)], [line(R, T, L, B)]],
  Y: [[line(L, T, CX, M), line(R, T, CX, M)], [line(CX, M, CX, B)]],
  Z: [[bar(T)], [line(R, T, L, B)], [bar(B)]],
}

const N_TILDE = [...LATIN.N, [`<path d="M150 ${T - 40} q25 -30 50 0 q25 30 50 0"/>`]]

// Cyrillic capitals specific to Ukrainian.
const CYRILLIC = {
  А: LATIN.A,
  Б: [[stem(L)], [bar(T)], [bowl(M, B)]],
  В: LATIN.B,
  Г: [[stem(L)], [bar(T)]],
  Ґ: [[stem(L)], [bar(T)], [line(R, T, R, T - 45)]],
  Д: [[line(150, T, 250, T), line(150, T, 140, 300), line(250, T, 260, 300)], [bar(300, 110, 290), line(130, 300, 130, 350), line(270, 300, 270, 350)]],
  Е: LATIN.E,
  Є: [[`<path d="M${R} ${T + 40} a80 125 0 1 0 0 ${B - T - 80}"/>`], [bar(M, 160, 250)]],
  Ж: [[stem(CX)], [line(L, T, CX, M), line(L, B, CX, M)], [line(R, T, CX, M), line(R, B, CX, M)]],
  З: [[`<path d="M140 ${T + 30} a60 55 0 1 1 45 90 a60 60 0 1 1 -45 95"/>`]],
  И: [[stem(L), stem(R)], [line(L, B, R, T)]],
  І: [[stem(CX)]],
  Ї: [[stem(CX)], [`<circle cx="170" cy="${T - 35}" r="9"/>`, `<circle cx="230" cy="${T - 35}" r="9"/>`]],
  Й: [[stem(L), stem(R)], [line(L, B, R, T)], [`<path d="M160 ${T - 35} q40 34 80 0"/>`]],
  К: LATIN.K,
  Л: [[`<path d="M${L} ${B} q40 0 46 -60 L180 ${T}"/>`], [line(180, T, 250, T), stem(250)]],
  М: LATIN.M,
  Н: LATIN.H,
  О: LATIN.O,
  П: [[stem(L), stem(R)], [bar(T)]],
  Р: LATIN.P,
  С: LATIN.C,
  Т: LATIN.T,
  У: [[line(L, T, 220, B)], [line(R, T, 170, 400 - 40)]],
  Ф: [[stem(CX)], [`<ellipse cx="${CX}" cy="${M}" rx="80" ry="70"/>`]],
  Х: LATIN.X,
  Ц: [[stem(L), stem(R)], [bar(B, L, R + 10)], [line(R + 10, B, R + 10, B + 40)]],
  Ч: [[line(L, T, L, M), bar(M, L, R)], [stem(R)]],
  Ш: [[stem(110), stem(CX), stem(290)], [bar(B, 110, 290)]],
  Щ: [[stem(110), stem(CX), stem(280)], [bar(B, 110, 290)], [line(290, B, 290, B + 40)]],
  Ь: [[stem(L)], [bowl(M, B)]],
  Ю: [[stem(L)], [bar(M, L, 165)], [`<ellipse cx="235" cy="${M}" rx="60" ry="125"/>`]],
  Я: [[`<path d="M${R} ${B} V${T} H170 a60 60 0 0 0 0 120 H${R}"/>`], [line(230, M, L, B)]],
}

const DIGITS = {
  0: [[oval]],
  1: [[line(150, 130, CX, T)], [stem(CX)], [bar(B, 150, 250)]],
  2: [[`<path d="M130 ${T + 50} a70 60 0 1 1 130 40 L130 ${B}"/>`], [bar(B, 130, 270)]],
  3: [[`<path d="M135 ${T + 40} a65 55 0 1 1 55 90"/>`], [`<path d="M190 ${T + 125} a70 62 0 1 1 -60 95"/>`]],
  4: [[line(230, T, 120, 250), bar(250, 120, 280)], [line(230, T, 230, B)]],
  5: [[bar(T, 140, 260), line(140, T, 132, 190)], [`<path d="M132 190 a75 70 0 1 1 20 135"/>`]],
  6: [[`<path d="M250 ${T + 20} q-120 40 -120 160"/>`], [`<ellipse cx="${CX}" cy="265" rx="70" ry="65"/>`]],
  7: [[bar(T, 130, 275)], [line(275, T, 175, B)]],
  8: [[`<ellipse cx="${CX}" cy="145" rx="62" ry="62"/>`], [`<ellipse cx="${CX}" cy="272" rx="75" ry="60"/>`]],
  9: [[`<ellipse cx="${CX}" cy="150" rx="70" ry="65"/>`], [`<path d="M270 150 q0 130 -110 180"/>`]],
}

const ES_NAMES = {
  A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'efe', G: 'ge', H: 'hache', I: 'i',
  J: 'jota', K: 'ka', L: 'ele', M: 'eme', N: 'ene', 'Ñ': 'eñe', O: 'o', P: 'pe',
  Q: 'cu', R: 'erre', S: 'ese', T: 'te', U: 'u', V: 'uve', W: 'uve doble',
  X: 'equis', Y: 'ye', Z: 'zeta',
}

const toExercise = (id, category, glyph, steps, title) => ({
  id,
  category,
  difficulty: steps.length > 2 ? 'EASY' : 'VERY_EASY',
  title: title ?? { uk: glyph, en: glyph },
  glyph,
  steps: steps.map((shapes, i) => ({ id: `stroke-${i + 1}`, shapes })),
})

const latinEntries = Object.entries(LATIN)

export const GLYPHS = [
  ...Object.entries(CYRILLIC).map(([glyph, steps]) =>
    toExercise(`uk-${glyph.toLowerCase()}`, 'letters_uk', glyph, steps)),

  ...latinEntries.map(([glyph, steps]) =>
    toExercise(`en-${glyph.toLowerCase()}`, 'letters_en', glyph, steps)),

  ...latinEntries.map(([glyph, steps]) =>
    toExercise(`es-${glyph.toLowerCase()}`, 'letters_es', glyph, steps, {
      uk: `${glyph} · ${ES_NAMES[glyph]}`,
      en: `${glyph} · ${ES_NAMES[glyph]}`,
    })),
  toExercise('es-enye', 'letters_es', 'Ñ', N_TILDE, { uk: 'Ñ · eñe', en: 'Ñ · eñe' }),

  ...Object.entries(DIGITS).map(([glyph, steps]) =>
    toExercise(`digit-${glyph}`, 'digits', glyph, steps)),
]
