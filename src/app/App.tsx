import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAppStore } from './store'
import { OnboardingPage } from '../pages/OnboardingPage'

export function App() {
  const boot = useAppStore((s) => s.boot)
  const init = useAppStore((s) => s.init)

  useEffect(() => { void init() }, [init])

  if (boot === 'loading') return <div className="center-screen" />
  if (boot === 'onboarding') return <OnboardingPage />
  return <RouterProvider router={router} />
}
