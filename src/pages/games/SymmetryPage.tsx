import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DrawingCanvas } from '../../components/DrawingCanvas'
import { Fireworks } from '../../components/Fireworks'
import { Icon } from '../../components/Icon'
import type { DrawingEngine } from '../../drawing/DrawingEngine'
import type { DrawingAction } from '../../storage/types'
import { loadIndex, loadSvg } from '../../exercise/ExerciseLoader'
import { randomSeed, shuffle } from '../../games/shuffle'
import { STARS_PER_ROUND } from '../../games/useGameSession'
import { useAppStore } from '../../app/store'
import { playSound } from '../../audio/sounds'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './SymmetryPage.css'

const ROUNDS = 3
/** Symmetrical enough that half of it is a fair prompt. */
const SUBJECTS = ['butterfly', 'ladybug', 'heart', 'star', 'flower', 'sun', 'tree', 'firtree', 'balloon', 'apple']

interface Round {
  id: string
  thumbnail: string
  markup: string
}

/** Half the picture is given; the child draws its mirror image. */
export function SymmetryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)
  const color = useAppStore((s) => s.color)

  const [seed, setSeed] = useState(randomSeed)
  const [rounds, setRounds] = useState<Round[]>([])
  const [round, setRound] = useState(0)
  const roundRef = useRef(0)
  roundRef.current = round
  const [drawn, setDrawn] = useState(0)
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const engineRef = useRef<DrawingEngine | null>(null)

  useEffect(() => {
    void loadIndex()
      .then(async (index) => {
        const usable = index.exercises.filter((e) => SUBJECTS.includes(e.id))
        const picked = shuffle(usable, seed).slice(0, ROUNDS)
        const loaded = await Promise.all(
          picked.map(async (e) => ({
            id: e.id,
            thumbnail: e.thumbnail,
            markup: await loadSvg(e.id, 'thumbnail.svg').catch(() => ''),
          })),
        )
        setRounds(loaded)
        setRound(0)
        setFinished(false)
        setEarned(0)
      })
      .catch(() => undefined)
  }, [seed])

  const current = rounds[round]

  const handleActions = useCallback((actions: DrawingAction[]) => {
    setDrawn(actions.length)
  }, [])

  const next = useCallback(() => {
    setSolved(false)
    setDrawn(0)
    engineRef.current?.clear()
    // Never call setState from inside an updater: React may re-run it and drop
    // the call, which used to leave the game running past its last round.
    if (roundRef.current + 1 < rounds.length) setRound(roundRef.current + 1)
    else setFinished(true)
  }, [rounds.length])

  /**
   * Accuracy is never judged in this app, so the round is won by having drawn
   * on the empty half at all — the reward is seeing both halves together.
   */
  function done() {
    if (solved || drawn === 0) return
    playSound('correct')
    setSolved(true)
    setEarned((value) => value + STARS_PER_ROUND)
    void awardStars(STARS_PER_ROUND)
  }

  useEffect(() => {
    if (!solved) return
    const timer = window.setTimeout(next, 3000)
    return () => window.clearTimeout(timer)
  }, [solved, next])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  const halfMarkup = useMemo(() => current?.markup ?? '', [current])

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
          <button className="btn btn--primary btn--hero" onClick={() => setSeed((s) => s + 7)}>
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
        <div className="title grow">{t('play.symmetry')}</div>
        <div className="muted game-round">{round + 1} / {rounds.length || ROUNDS}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {current ? (
        <div className="symmetry">
          <div className="canvas-card card symmetry__stage">
            {/* The left half is shown, the right is clipped away for the child. */}
            <div className="symmetry__half" dangerouslySetInnerHTML={{ __html: halfMarkup }} />
            <div className="symmetry__axis" />
            {solved ? (
              <div className="symmetry__ghost" dangerouslySetInnerHTML={{ __html: halfMarkup }} />
            ) : null}
            <div className="canvas-holder">
              <DrawingCanvas
                tool="PENCIL"
                color={color}
                onEngineReady={(engine) => { engineRef.current = engine }}
                onActionCommitted={handleActions}
              />
            </div>
          </div>

          <div className="row symmetry__actions">
            <span className="muted game-hint">{t('play.symmetryHint')}</span>
            <button className="btn" onClick={() => { engineRef.current?.clear(); setDrawn(0) }}>
              <Icon name="trash" size={22} color="var(--c-danger)" width={2.2} />
              {t('drawing.tool.clear')}
            </button>
            <button className="btn btn--primary" onClick={solved ? next : done} disabled={drawn === 0}>
              <Icon name={solved ? 'arrow' : 'check'} size={22} color="#fff" width={2.6} />
              {solved ? t('play.next') : t('drawing.done')}
            </button>
          </div>
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
