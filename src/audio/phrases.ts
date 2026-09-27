import type { VoiceLang } from './speech'

/**
 * What the tutor says. Every language side by side so a phrase is never
 * translated by machine at runtime and never half-missing: if a line exists in
 * one language it exists in all of them.
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
    'Так тримати!',
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
  ru: [
    'Красиво получилось!',
    'Молодец!',
    'Очень хорошо!',
    'Вот так, чудесно!',
    'У тебя получается!',
    'Так держать!',
    'Какая ровная линия!',
  ],
}

/** Same, but with the child's name — used every third time or so. */
const PRAISE_NAMED: Bank = {
  uk: ['Молодець, {name}!', '{name}, гарно вийшло!', 'Чудово, {name}!'],
  en: ['Well done, {name}!', 'Great work, {name}!', 'That is lovely, {name}!'],
  es: ['¡Muy bien, {name}!', '¡Genial, {name}!', '¡Qué bien lo haces, {name}!'],
  ru: ['Молодец, {name}!', '{name}, красиво получилось!', 'Чудесно, {name}!'],
}

/** The finished picture. Bigger than a step, still one breath long. */
const CHEER: Bank = {
  uk: [
    'Малюнок готовий! Гарна робота.',
    'Ого! Подивись, який гарний малюнок.',
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
  ru: [
    'Рисунок готов! Хорошая работа.',
    'Ого! Посмотри, какой красивый рисунок.',
    'Готово! Это чудесная работа.',
  ],
}

/** A right answer in a game: quicker and lighter than drawing praise. */
const GAME_CORRECT: Bank = {
  uk: ['Правильно!', 'Так, саме так!', 'Точно!', 'У точку!'],
  en: ['Correct!', "That's it!", 'Exactly right!', 'Spot on!'],
  es: ['¡Correcto!', '¡Eso es!', '¡Exacto!', '¡Muy bien!'],
  ru: ['Правильно!', 'Да, именно так!', 'Точно!', 'В точку!'],
}

const GAME_DONE: Bank = {
  uk: ['Гру пройдено! Молодець.', 'Усі завдання зроблено. Чудово!'],
  en: ['Game finished! Well done.', 'All done. That was great!'],
  es: ['¡Juego terminado! Muy bien.', '¡Todo hecho! ¡Genial!'],
  ru: ['Игра пройдена! Молодец.', 'Все задания выполнены. Чудесно!'],
}

/**
 * What this step is. Keyed by the step ids the exercise data already uses, so
 * a new exercise built from the usual parts speaks without any extra writing;
 * anything unusual falls back to the generic line below.
 */
const STEPS: Record<string, Record<VoiceLang, string>> = {
  body: { uk: 'Малюємо тулуб.', en: "Let's draw the body.", es: 'Dibujamos el cuerpo.', ru: 'Рисуем туловище.' },
  head: { uk: 'Тепер голова — велике коло.', en: 'Now the head — a big circle.', es: 'Ahora la cabeza, un círculo grande.', ru: 'Теперь голова — большой круг.' },
  face: { uk: 'Оченята, носик і усмішка.', en: 'Eyes, a nose and a smile.', es: 'Los ojos, la nariz y una sonrisa.', ru: 'Глазки, носик и улыбка.' },
  eyes: { uk: 'Малюємо оченята.', en: "Let's draw the eyes.", es: 'Dibujamos los ojos.', ru: 'Рисуем глазки.' },
  ears: { uk: 'Два вушка зверху.', en: 'Two ears on top.', es: 'Dos orejas arriba.', ru: 'Два ушка сверху.' },
  whiskers: { uk: 'Довгі вусики в обидва боки.', en: 'Long whiskers on both sides.', es: 'Bigotes largos a los dos lados.', ru: 'Длинные усики в обе стороны.' },
  tail: { uk: 'І хвостик.', en: 'And the tail.', es: 'Y la cola.', ru: 'И хвостик.' },
  legs: { uk: 'Тепер ніжки.', en: 'Now the legs.', es: 'Ahora las patas.', ru: 'Теперь ножки.' },
  feet: { uk: 'Малюємо лапки.', en: "Let's draw the feet.", es: 'Dibujamos los pies.', ru: 'Рисуем лапки.' },
  wings: { uk: 'Тепер крила.', en: 'Now the wings.', es: 'Ahora las alas.', ru: 'Теперь крылья.' },
  wing: { uk: 'Малюємо крило.', en: "Let's draw the wing.", es: 'Dibujamos el ala.', ru: 'Рисуем крыло.' },
  beak: { uk: 'Гострий дзьобик.', en: 'A pointy beak.', es: 'Un pico puntiagudo.', ru: 'Острый клювик.' },
  fins: { uk: 'Плавці з боків.', en: 'Fins on the sides.', es: 'Las aletas a los lados.', ru: 'Плавники по бокам.' },
  shell: { uk: 'Малюємо панцир.', en: "Let's draw the shell.", es: 'Dibujamos el caparazón.', ru: 'Рисуем панцирь.' },
  spots: { uk: 'Тепер цяточки.', en: 'Now the spots.', es: 'Ahora las manchas.', ru: 'Теперь пятнышки.' },
  stripes: { uk: 'Малюємо смужки.', en: 'Now the stripes.', es: 'Ahora las rayas.', ru: 'Рисуем полоски.' },
  antennae: { uk: 'Тонкі антенки.', en: 'Thin little antennae.', es: 'Unas antenas finas.', ru: 'Тонкие усики.' },
  wheels: { uk: 'Круглі колеса.', en: 'Round wheels.', es: 'Las ruedas redondas.', ru: 'Круглые колёса.' },
  windows: { uk: 'Малюємо віконця.', en: "Let's draw the windows.", es: 'Dibujamos las ventanas.', ru: 'Рисуем окошки.' },
  window: { uk: 'Малюємо віконце.', en: "Let's draw the window.", es: 'Dibujamos la ventana.', ru: 'Рисуем окошко.' },
  cabin: { uk: 'Кабіна зверху.', en: 'The cabin on top.', es: 'La cabina arriba.', ru: 'Кабина сверху.' },
  roof: { uk: 'Дах — трикутником.', en: 'The roof, like a triangle.', es: 'El tejado, como un triángulo.', ru: 'Крыша — треугольником.' },
  door: { uk: 'Двері.', en: 'The door.', es: 'La puerta.', ru: 'Дверь.' },
  stem: { uk: 'Стебельце вниз.', en: 'A stem going down.', es: 'Un tallo hacia abajo.', ru: 'Стебелёк вниз.' },
  stalk: { uk: 'Стебельце.', en: 'The stalk.', es: 'El tallo.', ru: 'Стебелёк.' },
  leaf: { uk: 'Один листочок.', en: 'One leaf.', es: 'Una hoja.', ru: 'Один листочек.' },
  leaves: { uk: 'Малюємо листочки.', en: "Let's draw the leaves.", es: 'Dibujamos las hojas.', ru: 'Рисуем листочки.' },
  trunk: { uk: 'Стовбур дерева.', en: 'The tree trunk.', es: 'El tronco del árbol.', ru: 'Ствол дерева.' },
  petals: { uk: 'Пелюстки навколо.', en: 'Petals all around.', es: 'Los pétalos alrededor.', ru: 'Лепестки вокруг.' },
  rays: { uk: 'Промінчики навколо.', en: 'Rays all around.', es: 'Los rayos alrededor.', ru: 'Лучики вокруг.' },
  seeds: { uk: 'Дрібні зернятка.', en: 'Little seeds.', es: 'Unas semillas pequeñas.', ru: 'Мелкие зёрнышки.' },
  handle: { uk: 'Ручка збоку.', en: 'A handle on the side.', es: 'Un asa al lado.', ru: 'Ручка сбоку.' },
  handles: { uk: 'Ручки з боків.', en: 'Handles on the sides.', es: 'Las asas a los lados.', ru: 'Ручки по бокам.' },
  base: { uk: 'Основа внизу.', en: 'The base at the bottom.', es: 'La base abajo.', ru: 'Основание внизу.' },
  top: { uk: 'Тепер верхня частина.', en: 'Now the top part.', es: 'Ahora la parte de arriba.', ru: 'Теперь верхняя часть.' },
  bottom: { uk: 'Тепер нижня частина.', en: 'Now the bottom part.', es: 'Ahora la parte de abajo.', ru: 'Теперь нижняя часть.' },
  left: { uk: 'Ліва сторона.', en: 'The left side.', es: 'El lado izquierdo.', ru: 'Левая сторона.' },
  right: { uk: 'Права сторона.', en: 'The right side.', es: 'El lado derecho.', ru: 'Правая сторона.' },
  frame: { uk: 'Малюємо рамку.', en: "Let's draw the frame.", es: 'Dibujamos el marco.', ru: 'Рисуем рамку.' },
  lines: { uk: 'Кілька рівних ліній.', en: 'A few straight lines.', es: 'Unas líneas rectas.', ru: 'Несколько ровных линий.' },
  bubbles: { uk: 'І бульбашки.', en: 'And some bubbles.', es: 'Y unas burbujas.', ru: 'И пузырьки.' },
}

const STEP_FALLBACK: Record<VoiceLang, string> = {
  uk: 'Обведи сіру лінію.',
  en: 'Trace the grey line.',
  es: 'Repasa la línea gris.',
  ru: 'Обведи серую линию.',
}

const COLOR_STEP: Record<VoiceLang, string> = {
  uk: 'А тепер розфарбуй малюнок. Обери колір і торкнись картинки.',
  en: 'Now colour the picture in. Pick a colour and tap the drawing.',
  es: 'Ahora colorea el dibujo. Elige un color y toca la imagen.',
  ru: 'А теперь раскрась рисунок. Выбери цвет и коснись картинки.',
}

const FIRST_STEP: Record<VoiceLang, string> = {
  uk: 'Наш малюнок — {title}. Починаємо!',
  en: "Let's draw {title}. Here we go!",
  es: 'Vamos a dibujar: {title}. ¡Empezamos!',
  ru: 'Наш рисунок — {title}. Начинаем!',
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
