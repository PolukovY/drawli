import type { VoiceLang } from './speech'

/**
 * What the tutor says. Three languages side by side so a phrase is never
 * translated by machine at runtime and never half-missing: if a line exists in
 * one language it exists in all three.
 *
 * Everything is short. A child who is drawing stops listening after about a
 * second and a half, so praise is two or three words and an instruction is one
 * sentence.
 */

type Bank = Record<VoiceLang, string[]>

/** After a finished step. {name} is dropped when the child has no name saved. */
const PRAISE: Bank = {
  uk: [
    'Гарно вийшло!',
    'Молодець!',
    'Дуже добре!',
    'Ось так, чудово!',
    'У тебе виходить!',
    'Клас! Далі буде ще краще.',
    'Яка рівна лінія!',
  ],
  en: [
    'Nicely done!',
    'Good job!',
    'That looks great!',
    "You've got it!",
    'Lovely line!',
    'Well done, keep going!',
    'That is really good!',
  ],
  es: [
    '¡Muy bien!',
    '¡Qué bonito!',
    '¡Lo estás haciendo genial!',
    '¡Buen trabajo!',
    '¡Qué línea tan bonita!',
    '¡Sigue así!',
    '¡Excelente!',
  ],
}

/** Same, but with the child's name — used every third time or so. */
const PRAISE_NAMED: Bank = {
  uk: ['Молодець, {name}!', '{name}, гарно вийшло!', 'Чудово, {name}!'],
  en: ['Well done, {name}!', 'Great work, {name}!', 'That is lovely, {name}!'],
  es: ['¡Muy bien, {name}!', '¡Genial, {name}!', '¡Qué bien lo haces, {name}!'],
}

/** The finished picture. Bigger than a step, still one breath long. */
const CHEER: Bank = {
  uk: [
    'Малюнок готовий! Ти справжній художник.',
    'Вау! Подивись, який гарний малюнок.',
    'Готово! Це чудова робота.',
  ],
  en: [
    'Your picture is finished! You are a real artist.',
    'Wow! Look what a lovely drawing.',
    'All done! That is wonderful work.',
  ],
  es: [
    '¡Tu dibujo está listo! Eres un artista de verdad.',
    '¡Guau! Mira qué dibujo tan bonito.',
    '¡Terminado! Es un trabajo precioso.',
  ],
}

/** A right answer in a game: quicker and lighter than drawing praise. */
const GAME_CORRECT: Bank = {
  uk: ['Правильно!', 'Так, саме так!', 'Точно!', 'Влучила!'],
  en: ['Correct!', "That's it!", 'Exactly right!', 'Spot on!'],
  es: ['¡Correcto!', '¡Eso es!', '¡Exacto!', '¡Muy bien!'],
}

const GAME_DONE: Bank = {
  uk: ['Гра пройдена! Молодець.', 'Усі завдання зроблені. Чудово!'],
  en: ['Game finished! Well done.', 'All done. That was great!'],
  es: ['¡Juego terminado! Muy bien.', '¡Todo hecho! ¡Genial!'],
}

/**
 * What this step is. Keyed by the step ids the exercise data already uses, so
 * a new exercise built from the usual parts speaks without any extra writing;
 * anything unusual falls back to the generic line below.
 */
const STEPS: Record<string, Record<VoiceLang, string>> = {
  body: { uk: 'Малюємо тулуб.', en: "Let's draw the body.", es: 'Dibujamos el cuerpo.' },
  head: { uk: 'Тепер голова — велике коло.', en: 'Now the head — a big circle.', es: 'Ahora la cabeza, un círculo grande.' },
  face: { uk: 'Оченята, носик і усмішка.', en: 'Eyes, a nose and a smile.', es: 'Los ojos, la nariz y una sonrisa.' },
  eyes: { uk: 'Малюємо оченята.', en: "Let's draw the eyes.", es: 'Dibujamos los ojos.' },
  ears: { uk: 'Два вушка зверху.', en: 'Two ears on top.', es: 'Dos orejas arriba.' },
  whiskers: { uk: 'Довгі вусики в обидва боки.', en: 'Long whiskers on both sides.', es: 'Bigotes largos a los dos lados.' },
  tail: { uk: 'І хвостик.', en: 'And the tail.', es: 'Y la cola.' },
  legs: { uk: 'Тепер ніжки.', en: 'Now the legs.', es: 'Ahora las patas.' },
  feet: { uk: 'Малюємо лапки.', en: "Let's draw the feet.", es: 'Dibujamos los pies.' },
  wings: { uk: 'Розправляємо крила.', en: 'Now the wings.', es: 'Ahora las alas.' },
  wing: { uk: 'Малюємо крило.', en: "Let's draw the wing.", es: 'Dibujamos el ala.' },
  beak: { uk: 'Гострий дзьобик.', en: 'A pointy beak.', es: 'Un pico puntiagudo.' },
  fins: { uk: 'Плавнички з боків.', en: 'Fins on the sides.', es: 'Las aletas a los lados.' },
  shell: { uk: 'Малюємо панцир.', en: "Let's draw the shell.", es: 'Dibujamos el caparazón.' },
  spots: { uk: 'Ставимо цяточки.', en: 'Now the spots.', es: 'Ahora las manchas.' },
  stripes: { uk: 'Малюємо смужки.', en: 'Now the stripes.', es: 'Ahora las rayas.' },
  antennae: { uk: 'Тонкі вусики-антенки.', en: 'Thin little antennae.', es: 'Unas antenas finas.' },
  wheels: { uk: 'Круглі колеса.', en: 'Round wheels.', es: 'Las ruedas redondas.' },
  windows: { uk: 'Малюємо віконця.', en: "Let's draw the windows.", es: 'Dibujamos las ventanas.' },
  window: { uk: 'Малюємо віконце.', en: "Let's draw the window.", es: 'Dibujamos la ventana.' },
  cabin: { uk: 'Кабіна зверху.', en: 'The cabin on top.', es: 'La cabina arriba.' },
  roof: { uk: 'Дах — як трикутник.', en: 'The roof, like a triangle.', es: 'El tejado, como un triángulo.' },
  door: { uk: 'Двері.', en: 'The door.', es: 'La puerta.' },
  stem: { uk: 'Стебельце вниз.', en: 'A stem going down.', es: 'Un tallo hacia abajo.' },
  stalk: { uk: 'Стебельце.', en: 'The stalk.', es: 'El tallo.' },
  leaf: { uk: 'Один листочок.', en: 'One leaf.', es: 'Una hoja.' },
  leaves: { uk: 'Малюємо листочки.', en: "Let's draw the leaves.", es: 'Dibujamos las hojas.' },
  trunk: { uk: 'Стовбур дерева.', en: 'The tree trunk.', es: 'El tronco del árbol.' },
  petals: { uk: 'Пелюстки навколо.', en: 'Petals all around.', es: 'Los pétalos alrededor.' },
  rays: { uk: 'Промінчики навколо.', en: 'Rays all around.', es: 'Los rayos alrededor.' },
  seeds: { uk: 'Дрібні зернятка.', en: 'Little seeds.', es: 'Unas semillas pequeñas.' },
  handle: { uk: 'Ручка збоку.', en: 'A handle on the side.', es: 'Un asa al lado.' },
  handles: { uk: 'Ручки з боків.', en: 'Handles on the sides.', es: 'Las asas a los lados.' },
  base: { uk: 'Основа внизу.', en: 'The base at the bottom.', es: 'La base abajo.' },
  top: { uk: 'Тепер верхня частина.', en: 'Now the top part.', es: 'Ahora la parte de arriba.' },
  bottom: { uk: 'Тепер нижня частина.', en: 'Now the bottom part.', es: 'Ahora la parte de abajo.' },
  left: { uk: 'Ліва сторона.', en: 'The left side.', es: 'El lado izquierdo.' },
  right: { uk: 'Права сторона.', en: 'The right side.', es: 'El lado derecho.' },
  frame: { uk: 'Малюємо рамку.', en: "Let's draw the frame.", es: 'Dibujamos el marco.' },
  lines: { uk: 'Кілька рівних ліній.', en: 'A few straight lines.', es: 'Unas líneas rectas.' },
  bubbles: { uk: 'І бульбашки.', en: 'And some bubbles.', es: 'Y unas burbujas.' },
}

const STEP_FALLBACK: Record<VoiceLang, string> = {
  uk: 'Обведи сіру лінію.',
  en: 'Trace the grey line.',
  es: 'Repasa la línea gris.',
}

const COLOR_STEP: Record<VoiceLang, string> = {
  uk: 'А тепер розфарбуй малюнок. Обери колір і торкнись картинки.',
  en: 'Now colour the picture in. Pick a colour and tap the drawing.',
  es: 'Ahora colorea el dibujo. Elige un color y toca la imagen.',
}

const FIRST_STEP: Record<VoiceLang, string> = {
  uk: 'Малюємо {title}. Починаємо!',
  en: "Let's draw {title}. Here we go!",
  es: 'Vamos a dibujar: {title}. ¡Empezamos!',
}

/** Remembers the last line of each bank so the same one never lands twice. */
const lastPick: Record<string, number> = {}

function pick(bank: Bank, lang: VoiceLang, key: string): string {
  const lines = bank[lang]
  if (lines.length < 2) return lines[0] ?? ''
  let index = Math.floor(Math.random() * lines.length)
  if (index === lastPick[key]) index = (index + 1) % lines.length
  lastPick[key] = index
  return lines[index]
}

/** Praise after a finished step; every third one uses the child's name. */
export function praiseLine(lang: VoiceLang, name?: string): string {
  const named = Boolean(name?.trim()) && Math.random() < 0.34
  return named
    ? pick(PRAISE_NAMED, lang, 'praise-named').replace('{name}', name!.trim())
    : pick(PRAISE, lang, 'praise')
}

export const cheerLine = (lang: VoiceLang): string => pick(CHEER, lang, 'cheer')
export const gameCorrectLine = (lang: VoiceLang): string => pick(GAME_CORRECT, lang, 'game-correct')
export const gameDoneLine = (lang: VoiceLang): string => pick(GAME_DONE, lang, 'game-done')

interface StepPhraseOptions {
  stepId: string
  lang: VoiceLang
  /** The exercise name, spoken once at the very start. */
  title?: string
  first?: boolean
  coloring?: boolean
}

/** What to say when a step opens. */
export function stepLine({ stepId, lang, title, first, coloring }: StepPhraseOptions): string {
  if (coloring) return COLOR_STEP[lang]

  const known = STEPS[stepId]?.[lang]
  if (first && title) {
    const opening = FIRST_STEP[lang].replace('{title}', title)
    return known ? `${opening} ${known}` : opening
  }
  return known ?? STEP_FALLBACK[lang]
}
