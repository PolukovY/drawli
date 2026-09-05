import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAppStore } from './store'
import { OnboardingPage } from '../pages/OnboardingPage'
import { UpdateBanner } from '../components/UpdateBanner'

export function App() {
  const boot = useAppStore((s) => s.boot)
  const init = useAppStore((s) => s.init)

  useEffect(() => { void init() }, [init])

  if (boot === 'loading') return <div className="center-screen" />

  // The banner sits outside the router: a new version is news on every screen.
  return (
    <>
      {boot === 'onboarding' ? <OnboardingPage /> : <RouterProvider router={router} />}
      <UpdateBanner />
    </>
  )
}
