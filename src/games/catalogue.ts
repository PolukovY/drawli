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
]

export function gamesFor(language: WordLanguage): GameEntry[] {
  return GAMES
    .filter((game) => game.languages === 'all' || game.languages.includes(language))
    .sort((a, b) => a.order - b.order)
}
