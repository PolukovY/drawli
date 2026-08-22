import { createHashRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { DrawingPage } from '../pages/DrawingPage'
import { MyDrawingsPage } from '../pages/MyDrawingsPage'
import { ProgressPage } from '../pages/ProgressPage'
import { SettingsPage } from '../pages/SettingsPage'

// HashRouter, not BrowserRouter: GitHub Pages serves no SPA fallback,
// so a deep link like /drawli/draw/ladybug would 404 on reload.
export const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/hello', element: <OnboardingPage /> },
  { path: '/draw/:exerciseId', element: <DrawingPage /> },
  { path: '/drawings', element: <MyDrawingsPage /> },
  { path: '/progress', element: <ProgressPage /> },
  { path: '/settings', element: <SettingsPage /> },
])
