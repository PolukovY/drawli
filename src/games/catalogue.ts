import type { WordLanguage } from '../exercise/ExerciseLoader'

export interface GameEntry {
  id: string
  path: string
  titleKey: string
  art: string
  /** Which play languages the game makes sense in. */
  languages: WordLanguage[] | 'all'
  /** Games that teach reading sit above the ones that only need eyes. */
  order: number
}

/** One list so the Games screen and the router never drift apart. */
export const GAMES: GameEntry[] = [
  { id: 'spell', path: '/spell', titleKey: 'play.spell', art: '🔡', languages: 'all', order: 1 },
  { id: 'missing', path: '/missing', titleKey: 'play.missing', art: '🧩', languages: 'all', order: 2 },
  { id: 'guess', path: '/guess', titleKey: 'play.guess', art: '🔍', languages: 'all', order: 3 },
  { id: 'firstletter', path: '/first-letter', titleKey: 'play.firstLetter', art: '🅰️', languages: 'all', order: 4 },
  { id: 'articles', path: '/articles', titleKey: 'play.article', art: '🔤', languages: ['en', 'es'], order: 5 },
  { id: 'findletter', path: '/find-letter', titleKey: 'play.findLetter', art: '👀', languages: 'all', order: 6 },
  { id: 'count', path: '/count', titleKey: 'play.count', art: '🔢', languages: 'all', order: 7 },
  { id: 'bigger', path: '/bigger', titleKey: 'play.bigger', art: '⚖️', languages: 'all', order: 8 },
  { id: 'odd', path: '/odd-one-out', titleKey: 'play.odd', art: '🙃', languages: 'all', order: 9 },
  { id: 'memory', path: '/memory', titleKey: 'play.memory', art: '🃏', languages: 'all', order: 10 },
  { id: 'colornumbers', path: '/color-by-numbers', titleKey: 'play.colorNumbers', art: '🎨', languages: 'all', order: 11 },
  { id: 'puzzle', path: '/puzzle', titleKey: 'play.puzzle', art: '🧷', languages: 'all', order: 12 },
  { id: 'countthings', path: '/count-things', titleKey: 'play.countThings', art: '🍎', languages: 'all', order: 13 },
  { id: 'symmetry', path: '/symmetry', titleKey: 'play.symmetry', art: '🦋', languages: 'all', order: 14 },
  { id: 'memorytrace', path: '/memory-trace', titleKey: 'play.memoryTrace', art: '💭', languages: 'all', order: 15 },
  { id: 'listen', path: '/listen', titleKey: 'play.listen', art: '🔊', languages: 'all', order: 16 },
  { id: 'tictactoe', path: '/tic-tac-toe', titleKey: 'play.ticTacToe', art: '⭕', languages: 'all', order: 17 },
  { id: 'snake', path: '/snake', titleKey: 'play.snake', art: '🐍', languages: 'all', order: 18 },
  { id: 'seabattle', path: '/sea-battle', titleKey: 'play.seaBattle', art: '🚢', languages: 'all', order: 19 },
  { id: 'patterns', path: '/patterns', titleKey: 'play.patterns', art: '🔁', languages: 'all', order: 20 },
  { id: 'dots', path: '/connect-dots', titleKey: 'play.dots', art: '🔢', languages: 'all', order: 21 },
  { id: 'shadow', path: '/shadow', titleKey: 'play.shadow', art: '🌑', languages: 'all', order: 22 },
  { id: 'whatsgone', path: '/whats-gone', titleKey: 'play.whatsGone', art: '🫥', languages: 'all', order: 23 },
  { id: 'sizeorder', path: '/size-order', titleKey: 'play.sizeOrder', art: '📏', languages: 'all', order: 24 },
  { id: 'sorting', path: '/sorting', titleKey: 'play.sorting', art: '🧺', languages: 'all', order: 25 },
  { id: 'maze', path: '/maze', titleKey: 'play.maze', art: '🧭', languages: 'all', order: 26 },
  { id: 'plusminus', path: '/plus-minus', titleKey: 'play.plusMinus', art: '➕', languages: 'all', order: 27 },
  { id: 'sudoku', path: '/picture-sudoku', titleKey: 'play.sudoku', art: '🧠', languages: 'all', order: 28 },
  { id: 'differences', path: '/differences', titleKey: 'play.differences', art: '🔍', languages: 'all', order: 29 },
  { id: 'syllables', path: '/syllables', titleKey: 'play.syllables', art: '👏', languages: 'all', order: 30 },
  { id: 'oddword', path: '/odd-word', titleKey: 'play.oddWord', art: '🎧', languages: 'all', order: 31 },
  { id: 'rps', path: '/rock-paper-scissors', titleKey: 'play.rps', art: '✊', languages: 'all', order: 32 },
  { id: 'vocabulary', path: '/vocabulary', titleKey: 'play.vocabulary', art: '🗣️', languages: 'all', order: 33 },
]

export function gamesFor(language: WordLanguage): GameEntry[] {
  return GAMES
    .filter((game) => game.languages === 'all' || game.languages.includes(language))
    .sort((a, b) => a.order - b.order)
}
