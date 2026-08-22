import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DrawingCanvas } from '../../components/DrawingCanvas'
import { Fireworks } from '../../components/Fireworks'
import { Icon } from '../../components/Icon'
import type { DrawingEngine } from '../../drawing/DrawingEngine'
import type { DrawingAction } from '../../storage/types'
import { loadIndex, loadSvg } from '../../exercise/ExerciseLoader'
import { shuffle } from '../../games/shuffle'
import { STARS_PER_ROUND } from '../../games/useGameSession'
import { useAppStore } from '../../app/store'
import { playSound } from '../../audio/sounds'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './MemoryTracePage.css'

const ROUNDS = 3
const PEEK_SECONDS = 3
/** Simple silhouettes: what a child can hold in their head for three seconds. */
const SUBJECTS = ['circle', 'square', 'triangle', 'heart', 'star', 'moon', 'egg', 'cross', 'arrow', 'house', 'apple', 'balloon']

interface Round {
  id: string
  markup: string
}

type Phase = 'peek' | 'draw' | 'compare'

/** Look, remember, draw from memory — then see both at once. */
export function MemoryTracePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)
  const color = useAppStore((s) => s.color)

  const [seed, setSeed] = useState(1)
  const [rounds, setRounds] = useState<Round[]>([])
  const [round, setRound] = useState(0)
  const roundRef = useRef(0)
  roundRef.current = round
  const [phase, setPhase] = useState<Phase>('peek')
  const [countdown, setCountdown] = useState(PEEK_SECONDS)
  const [drawn, setDrawn] = useState(0)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const engineRef = useRef<DrawingEngine | null>(null)

  useEffect(() => {
    void loadIndex()
      .then(async (index) => {
        const usable = index.exercises.filter((e) => SUBJECTS.includes(e.id))
        const picked = shuffle(usable, seed).slice(0, ROUNDS)
        setRounds(
          await Promise.all(
            picked.map(async (e) => ({ id: e.id, markup: await loadSvg(e.id, 'thumbnail.svg').catch(() => '') })),
          ),
        )
        setRound(0)
        setFinished(false)
        setEarned(0)
      })
      .catch(() => undefined)
  }, [seed])

  const current = rounds[round]

  useEffect(() => {
    if (!current) return
    setPhase('peek')
    setCountdown(PEEK_SECONDS)
    setDrawn(0)
    engineRef.current?.clear()
  }, [current])

  // The picture is only on screen while the countdown runs.
  useEffect(() => {
    if (phase !== 'peek') return
    if (countdown <= 0) { setPhase('draw'); return }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [phase, countdown])

  const handleActions = useCallback((actions: DrawingAction[]) => setDrawn(actions.length), [])

  const next = useCallback(() => {
    // Never call setState from inside an updater: React may re-run it and drop
    // the call, which used to leave the game running past its last round.
    if (roundRef.current + 1 < rounds.length) setRound(roundRef.current + 1)
    else setFinished(true)
  }, [rounds.length])

  async function reveal() {
    if (phase !== 'draw' || drawn === 0) return
    playSound('correct')
    setPhase('compare')
    setEarned((value) => value + STARS_PER_ROUND)
    await awardStars(STARS_PER_ROUND)
  }

  useEffect(() => {
    if (phase !== 'compare') return
    const timer = window.setTimeout(next, 3500)
    return () => window.clearTimeout(timer)
  }, [phase, next])

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
          <button className="btn btn--primary btn--hero" onClick={() => setSeed((s) => s + 5)}>
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
      {phase === 'compare' ? <Fireworks /> : null}

      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.memoryTrace')}</div>
        <div className="muted game-round">{round + 1} / {rounds.length || ROUNDS}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {current ? (
        <div className="trace">
          <div className="canvas-card card trace__stage">
            {phase !== 'draw' ? (
              <div
                className={`trace__picture ${phase === 'compare' ? 'trace__picture--ghost' : ''}`}
                dangerouslySetInnerHTML={{ __html: current.markup }}
              />
            ) : null}

            {phase === 'peek' ? <div className="trace__countdown">{countdown}</div> : null}

            <div className={`canvas-holder ${phase === 'peek' ? 'canvas-holder--passive' : ''}`}>
              <DrawingCanvas
                tool="PENCIL"
                color={color}
                onEngineReady={(engine) => { engineRef.current = engine }}
                onActionCommitted={handleActions}
              />
            </div>
          </div>

          <div className="row trace__actions">
            <span className="muted game-hint">
              {phase === 'peek' ? t('play.memoryTraceLook') : t('play.memoryTraceHint')}
            </span>
            {phase === 'draw' ? (
              <>
                <button className="btn" onClick={() => { engineRef.current?.clear(); setDrawn(0) }}>
                  <Icon name="trash" size={22} color="var(--c-danger)" width={2.2} />
                  {t('drawing.tool.clear')}
                </button>
                <button className="btn btn--primary" onClick={() => void reveal()} disabled={drawn === 0}>
                  <Icon name="check" size={22} color="#fff" width={2.6} />
                  {t('drawing.done')}
                </button>
              </>
            ) : null}
            {phase === 'compare' ? (
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
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
