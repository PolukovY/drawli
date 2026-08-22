import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DrawingCanvas } from '../../components/DrawingCanvas'
import { Fireworks } from '../../components/Fireworks'
import { Icon } from '../../components/Icon'
import type { DrawingEngine } from '../../drawing/DrawingEngine'
import type { DrawingAction } from '../../storage/types'
import { STARS_PER_ROUND } from '../../games/useGameSession'
import { useAppStore } from '../../app/store'
import { playSound } from '../../audio/sounds'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './CountDrawPage.css'

const ROUNDS = 5

/** Counting with a pencil: draw exactly as many strokes as the number says. */
export function CountDrawPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)
  const color = useAppStore((s) => s.color)

  const [seed, setSeed] = useState(1)
  const [round, setRound] = useState(0)
  const roundRef = useRef(0)
  roundRef.current = round
  const [strokes, setStrokes] = useState(0)
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const engineRef = useRef<DrawingEngine | null>(null)

  const targets = useMemo(() => {
    const out: number[] = []
    let value = seed
    for (let i = 0; i < ROUNDS; i += 1) {
      value = (value * 1103515245 + 12345) % 2147483648
      out.push(1 + (value % 6))
    }
    return out
  }, [seed])

  const target = targets[round]

  const handleActions = useCallback((actions: DrawingAction[]) => {
    setStrokes(actions.filter((a) => a.type === 'STROKE').length)
  }, [])

  const next = useCallback(() => {
    setSolved(false)
    setStrokes(0)
    engineRef.current?.clear()
    // Never call setState from inside an updater: React may re-run it and drop
    // the call, which used to leave the game running past its last round.
    if (roundRef.current + 1 < targets.length) setRound(roundRef.current + 1)
    else setFinished(true)
  }, [targets.length])

  // Counting is the whole exercise, so the check waits for the child to stop.
  useEffect(() => {
    if (solved || strokes === 0) return
    if (strokes !== target) return
    const timer = window.setTimeout(async () => {
      playSound('correct')
      setSolved(true)
      setEarned((value) => value + STARS_PER_ROUND)
      await awardStars(STARS_PER_ROUND)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [strokes, target, solved, awardStars])

  useEffect(() => {
    if (!solved) return
    const timer = window.setTimeout(next, 3000)
    return () => window.clearTimeout(timer)
  }, [solved, next])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  if (finished) {
    return (
      <div className="center-screen">
        <Fireworks variant="finale" />
        <div className="game-done__title">{t('play.finished')}</div>
        <div className="completion__stars">
          <Icon name="star" size={30} color="var(--c-star)" filled />
          {t('complete.stars', { count: earned })}
        </div>
        <div className="row game-done__actions">
          <button className="btn btn--primary btn--hero" onClick={() => { setSeed((s) => s + 13); setRound(0); setEarned(0); setFinished(false) }}>
            <Icon name="again" size={24} color="#fff" width={2.4} />
            {t('play.again')}
          </button>
          <button className="btn btn--hero" onClick={() => navigate('/')}>{t('complete.another')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen game-screen">
      {solved ? <Fireworks /> : null}

      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.countDraw')}</div>
        <div className="muted game-round">{round + 1} / {targets.length}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      <div className="count-draw">
        <div className="count-draw__task">
          <span className="count-draw__number">{target}</span>
          <span className="muted">{t('play.countDrawHint')}</span>
        </div>

        <div className="canvas-card card count-draw__canvas">
          <DrawingCanvas
            tool="PENCIL"
            color={color}
            onEngineReady={(engine) => { engineRef.current = engine }}
            onActionCommitted={handleActions}
          />
          <div className="count-draw__counter">{strokes} / {target}</div>
        </div>

        <div className="row count-draw__actions">
          <button className="btn" onClick={() => { engineRef.current?.clear(); setStrokes(0) }}>
            <Icon name="trash" size={22} color="var(--c-danger)" width={2.2} />
            {t('drawing.tool.clear')}
          </button>
          {solved ? (
            <button className="btn btn--primary game-next" onClick={next}>
              <span className="game-next__fill" />
              <span className="game-next__label">
                {t('play.next')}
                <Icon name="arrow" size={22} color="#fff" width={2.6} />
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
