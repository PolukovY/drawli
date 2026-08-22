import { createHashRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { DrawingPage } from '../pages/DrawingPage'
import { MyDrawingsPage } from '../pages/MyDrawingsPage'
import { ProgressPage } from '../pages/ProgressPage'
import { SettingsPage } from '../pages/SettingsPage'
import { SpellGamePage } from '../pages/SpellGamePage'
import { FreeDrawPage } from '../pages/FreeDrawPage'

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
])
