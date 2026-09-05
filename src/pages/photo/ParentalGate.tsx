import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/Icon'
import { checkGateAnswer, makeGateQuestion } from './photoUtils'
import '../../styles/ui.css'
import './ParentalGate.css'

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

/**
 * A one-second question for an adult, not a security wall for a child: it
 * only has to be harder than a four-year-old can solve by mashing digits.
 */
export function ParentalGate({ onSuccess, onCancel }: Props) {
  const { t } = useTranslation()
  const question = useMemo(() => makeGateQuestion(), [])
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)

  function submit() {
    if (checkGateAnswer(question, answer)) {
      onSuccess()
      return
    }
    setWrong(true)
    setAnswer('')
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="gate__icon">
          <Icon name="shield" size={30} color="var(--c-accent)" />
        </div>
        <div>
          <div className="title" style={{ fontSize: 19 }}>{t('photo.gateTitle')}</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{t('photo.gateHint')}</div>
        </div>
        <div className="gate__question">{t('photo.gateQuestion', { a: question.a, b: question.b })}</div>
        <input
          className="gate__input"
          type="tel"
          inputMode="numeric"
          autoFocus
          value={answer}
          onChange={(e) => { setWrong(false); setAnswer(e.target.value.replace(/[^0-9]/g, '').slice(0, 2)) }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          placeholder="?"
        />
        {wrong ? <div className="gate__error">{t('photo.gateWrong')}</div> : null}
        <button className="btn btn--primary btn--hero" style={{ width: '100%' }} onClick={submit}>
          {t('photo.gateCheck')}
        </button>
        <button className="gate__cancel" onClick={onCancel}>{t('settings.cancel')}</button>
      </div>
    </div>
  )
}
