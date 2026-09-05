import { createHashRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { DrawingPage } from '../pages/DrawingPage'
import { MyDrawingsPage } from '../pages/MyDrawingsPage'
import { ProgressPage } from '../pages/ProgressPage'
import { SettingsPage } from '../pages/SettingsPage'
import { SpellGamePage } from '../pages/SpellGamePage'
import { FreeDrawPage } from '../pages/FreeDrawPage'
import { GuessGamePage } from '../pages/GuessGamePage'
import { ArticleGamePage } from '../pages/ArticleGamePage'
import { MissingLettersPage } from '../pages/games/MissingLettersPage'
import { CountPage } from '../pages/games/CountPage'
import { BiggerNumberPage } from '../pages/games/BiggerNumberPage'
import { OddOneOutPage } from '../pages/games/OddOneOutPage'
import { FindLetterPage } from '../pages/games/FindLetterPage'
import { FirstLetterPage } from '../pages/games/FirstLetterPage'
import { MemoryPage } from '../pages/games/MemoryPage'
import { ColorByNumbersPage } from '../pages/games/ColorByNumbersPage'
import { CountThingsPage } from '../pages/games/CountThingsPage'
import { SymmetryPage } from '../pages/games/SymmetryPage'
import { MemoryTracePage } from '../pages/games/MemoryTracePage'
import { PuzzlePage } from '../pages/games/PuzzlePage'
import { ListenPage } from '../pages/games/ListenPage'
import { TicTacToePage } from '../pages/games/TicTacToePage'
import { SnakePage } from '../pages/games/SnakePage'
import { SeaBattlePage } from '../pages/games/SeaBattlePage'
import { PatternsPage } from '../pages/games/PatternsPage'
import { DotsPage } from '../pages/games/DotsPage'
import { ShadowPage } from '../pages/games/ShadowPage'
import { WhatsGonePage } from '../pages/games/WhatsGonePage'
import { SizeOrderPage } from '../pages/games/SizeOrderPage'
import { SortingPage } from '../pages/games/SortingPage'
import { MazePage } from '../pages/games/MazePage'
import { PlusMinusPage } from '../pages/games/PlusMinusPage'
import { PictureSudokuPage } from '../pages/games/PictureSudokuPage'
import { DifferencesPage } from '../pages/games/DifferencesPage'
import { SyllablesPage } from '../pages/games/SyllablesPage'
import { OddWordPage } from '../pages/games/OddWordPage'
import { RockPaperScissorsPage } from '../pages/games/RockPaperScissorsPage'
import { VocabularyGamePage } from '../pages/games/VocabularyGamePage'

// HashRouter, not BrowserRouter: GitHub Pages serves no SPA fallback,
// so a deep link like /drawli/draw/ladybug would 404 on reload.
export const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/draw/:exerciseId', element: <DrawingPage /> },
  { path: '/drawings', element: <MyDrawingsPage /> },
  { path: '/progress', element: <ProgressPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/spell', element: <SpellGamePage /> },
  { path: '/free', element: <FreeDrawPage /> },
  { path: '/guess', element: <GuessGamePage /> },
  { path: '/articles', element: <ArticleGamePage /> },
  { path: '/missing', element: <MissingLettersPage /> },
  { path: '/count', element: <CountPage /> },
  { path: '/bigger', element: <BiggerNumberPage /> },
  { path: '/odd-one-out', element: <OddOneOutPage /> },
  { path: '/find-letter', element: <FindLetterPage /> },
  { path: '/first-letter', element: <FirstLetterPage /> },
  { path: '/memory', element: <MemoryPage /> },
  { path: '/color-by-numbers', element: <ColorByNumbersPage /> },
  { path: '/count-things', element: <CountThingsPage /> },
  { path: '/symmetry', element: <SymmetryPage /> },
  { path: '/memory-trace', element: <MemoryTracePage /> },
  { path: '/puzzle', element: <PuzzlePage /> },
  { path: '/listen', element: <ListenPage /> },
  { path: '/tic-tac-toe', element: <TicTacToePage /> },
  { path: '/snake', element: <SnakePage /> },
  { path: '/sea-battle', element: <SeaBattlePage /> },
  { path: '/patterns', element: <PatternsPage /> },
  { path: '/connect-dots', element: <DotsPage /> },
  { path: '/shadow', element: <ShadowPage /> },
  { path: '/whats-gone', element: <WhatsGonePage /> },
  { path: '/size-order', element: <SizeOrderPage /> },
  { path: '/sorting', element: <SortingPage /> },
  { path: '/maze', element: <MazePage /> },
  { path: '/plus-minus', element: <PlusMinusPage /> },
  { path: '/picture-sudoku', element: <PictureSudokuPage /> },
  { path: '/differences', element: <DifferencesPage /> },
  { path: '/syllables', element: <SyllablesPage /> },
  { path: '/odd-word', element: <OddWordPage /> },
  { path: '/rock-paper-scissors', element: <RockPaperScissorsPage /> },
  { path: '/vocabulary', element: <VocabularyGamePage /> },
])
