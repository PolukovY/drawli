import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import { applyUpdate, takeJustUpdated, updateStatus, watchUpdate, type UpdateStatus } from '../app/serviceWorker'
import './UpdateBanner.css'

/** How long the "it updated" note stays before it gets out of the way. */
const DONE_MS = 5000

/**
 * What the app says about a new version, and the only place it says it.
 *
 * A new build used to reload the app the moment it was found, which on a
 * tablet means a child's picture vanishing mid-stroke. Now the app says what
 * it has, what it will do about it, and lets the child carry on: the version
 * that is waiting takes over the next time the app is opened, whether the
 * button is pressed or not.
 */
export function UpdateBanner() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<UpdateStatus>(updateStatus)
  /** "Later" hides the banner; the update itself stays waiting. */
  const [hidden, setHidden] = useState(false)
  const [justUpdated, setJustUpdated] = useState(takeJustUpdated)

  useEffect(() => watchUpdate(setStatus), [])

  useEffect(() => {
    if (!justUpdated) return
    const timer = window.setTimeout(() => setJustUpdated(false), DONE_MS)
    return () => window.clearTimeout(timer)
  }, [justUpdated])

  if (justUpdated && status !== 'ready') {
    return (
      <div className="update update--done" role="status">
        <Icon name="check" size={22} color="#fff" width={3} />
        {t('update.done')}
      </div>
    )
  }

  if (status === 'applying') {
    return (
      <div className="update update--busy" role="status">
        <span className="update__spinner" aria-hidden="true" />
        {t('update.applying')}
      </div>
    )
  }

  if (status !== 'ready' || hidden) return null

  return (
    <div className="update" role="status">
      <span className="update__icon"><Icon name="again" size={26} color="var(--c-accent)" width={2.4} /></span>
      <div className="update__text">
        <div className="update__title">{t('update.ready')}</div>
        <div className="update__hint">{t('update.readyHint')}</div>
      </div>
      <button className="btn" onClick={() => setHidden(true)}>{t('update.later')}</button>
      <button className="btn btn--primary" onClick={applyUpdate}>{t('update.now')}</button>
    </div>
  )
}
