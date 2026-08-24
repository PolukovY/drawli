import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl, loadIndex } from '../../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../../exercise/Exercise'
import { randomSeed, shuffle } from '../../games/shuffle'
import { STARS_PER_ROUND } from '../../games/useGameSession'
import { useAppStore } from '../../app/store'
import { playSound } from '../../audio/sounds'
import { Fireworks } from '../../components/Fireworks'
import { Icon } from '../../components/Icon'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './PuzzlePage.css'

const ROUNDS = 3
const PIECES = 4

/**
 * A picture cut into four. Pieces are placed by tapping — a piece, then its
 * slot — because dragging on a tablet fights with palm rejection.
 */
export function PuzzlePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [seed, setSeed] = useState(randomSeed)
  const [pictures, setPictures] = useState<ExerciseSummary[]>([])
  const [round, setRound] = useState(0)
  const roundRef = useRef(0)
  roundRef.current = round
  const [placed, setPlaced] = useState<Record<number, number>>({})
  const [held, setHeld] = useState<number | null>(null)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    void loadIndex()
      .then((index) => {
        const drawing = index.categories.filter((c) => c.kind === 'draw').map((c) => c.id)
        const usable = index.exercises.filter((e) => drawing.includes(e.category))
        setPictures(shuffle(usable, seed).slice(0, ROUNDS))
        setRound(0)
        setFinished(false)
        setEarned(0)
      })
      .catch(() => undefined)
  }, [seed])

  const current = pictures[round]
  const order = useMemo(
    () => shuffle([0, 1, 2, 3], seed + round * 13),
    [seed, round],
  )

  useEffect(() => {
    setPlaced({})
    setHeld(null)
  }, [current])

  const solved = Object.keys(placed).length === PIECES

  const next = useCallback(() => {
    // Never call setState from inside an updater: React may re-run it and drop
    // the call, which used to leave the game running past its last round.
    if (roundRef.current + 1 < pictures.length) setRound(roundRef.current + 1)
    else setFinished(true)
  }, [pictures.length])

  useEffect(() => {
    if (!solved) return
    playSound('correct')
    setEarned((value) => value + STARS_PER_ROUND)
    void awardStars(STARS_PER_ROUND)
    const timer = window.setTimeout(next, 3000)
    return () => window.clearTimeout(timer)
  }, [solved, awardStars, next])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  function drop(slot: number) {
    if (held === null || placed[slot] !== undefined) return
    if (held !== slot) { playSound('soft'); setHeld(null); return }
    playSound('tap')
    setPlaced((prev) => ({ ...prev, [slot]: held }))
    setHeld(null)
  }

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
          <button className="btn btn--primary btn--hero" onClick={() => setSeed((s) => s + 3)}>
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
        <div className="title grow">{t('play.puzzle')}</div>
        <div className="muted game-round">{round + 1} / {pictures.length || ROUNDS}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {current ? (
        <div className="puzzle">
          <div className="puzzle__frame card">
            {[0, 1, 2, 3].map((slot) => (
              <button
                key={slot}
                className={`puzzle__slot ${placed[slot] !== undefined ? 'puzzle__slot--filled' : ''}`}
                onClick={() => drop(slot)}
                aria-label={`${slot + 1}`}
              >
                {placed[slot] !== undefined ? (
                  <span className="puzzle__piece" data-piece={slot}>
                    <img src={assetUrl(current.thumbnail)} alt="" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="puzzle__tray">
            {order.map((piece) => {
              const used = Object.values(placed).includes(piece)
              return (
                <button
                  key={piece}
                  className={`puzzle__loose ${held === piece ? 'puzzle__loose--held' : ''} ${
                    used ? 'puzzle__loose--used' : ''
                  }`}
                  onClick={() => { if (!used) { playSound('tap'); setHeld(piece) } }}
                  disabled={used}
                >
                  <span className="puzzle__piece" data-piece={piece}>
                    <img src={assetUrl(current.thumbnail)} alt="" />
                  </span>
                </button>
              )
            })}
          </div>

          <div className="muted game-hint">{t('play.puzzleHint')}</div>
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
