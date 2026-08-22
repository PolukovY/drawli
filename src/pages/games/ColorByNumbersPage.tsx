import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadIndex, loadRegions, loadSvg, type PaintRegion } from '../../exercise/ExerciseLoader'
import { shuffle } from '../../games/shuffle'
import { STARS_PER_ROUND } from '../../games/useGameSession'
import { useAppStore } from '../../app/store'
import { playSound } from '../../audio/sounds'
import { Fireworks } from '../../components/Fireworks'
import { Icon } from '../../components/Icon'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './ColorByNumbersPage.css'

const ROUNDS = 3
/**
 * Unpainted regions are tinted rather than white: some pictures are meant to be
 * painted white, and on a white sheet that reads as "still not done".
 */
const UNPAINTED = '#EFEBF6'

interface Round {
  exerciseId: string
  regions: PaintRegion[]
}

/**
 * The picture is numbered; each number has a colour. Fill every region with the
 * colour its number asks for — matching, counting and colouring in one.
 */
/** Rough perceptual lightness — enough to pick a readable label colour. */
function isLight(hex: string): boolean {
  const value = hex.replace('#', '')
  if (value.length !== 6) return false
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 186
}

export function ColorByNumbersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [rounds, setRounds] = useState<Round[]>([])
  const [round, setRound] = useState(0)
  const roundRef = useRef(0)
  roundRef.current = round
  const [seed, setSeed] = useState(1)
  const [markup, setMarkup] = useState('')
  const [filled, setFilled] = useState<Record<string, string>>({})
  const [picked, setPicked] = useState<PaintRegion | null>(null)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void Promise.all([loadIndex(), loadRegions()])
      .then(([index, regions]) => {
        // Three or four regions is the sweet spot: enough to match, not a chore.
        const usable = index.exercises.filter((e) => {
          const list = regions[e.id]
          return list && list.length >= 3 && list.length <= 4
        })
        setRounds(
          shuffle(usable, seed).slice(0, ROUNDS).map((e) => ({ exerciseId: e.id, regions: regions[e.id] })),
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
    setFilled({})
    setPicked(null)
    void loadSvg(current.exerciseId, 'final.svg').then(setMarkup).catch(() => undefined)
  }, [current])

  // Paint the chosen colours onto the inlined SVG.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    for (const region of Array.from(container.querySelectorAll<SVGGElement>('[data-region]'))) {
      const id = region.dataset.region
      if (!id) continue
      region.setAttribute('fill', filled[id] ?? UNPAINTED)
    }
  }, [filled, markup])

  const done = useMemo(
    () => Boolean(current) && current.regions.every((r) => filled[r.id] === r.color),
    [current, filled],
  )

  const next = useCallback(() => {
    // Never call setState from inside an updater: React may re-run it and drop
    // the call, which used to leave the game running past its last round.
    if (roundRef.current + 1 < rounds.length) setRound(roundRef.current + 1)
    else setFinished(true)
  }, [rounds.length])

  useEffect(() => {
    if (!done) return
    playSound('correct')
    setEarned((value) => value + STARS_PER_ROUND)
    void awardStars(STARS_PER_ROUND)
    const timer = window.setTimeout(next, 3000)
    return () => window.clearTimeout(timer)
  }, [done, awardStars, next])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  /**
   * One listener on the container, not one per region: React recreates the
   * inlined SVG nodes on re-render and per-node listeners die with them.
   */
  const pickedRef = useRef<PaintRegion | null>(null)
  pickedRef.current = picked
  const currentRef = useRef<Round | undefined>(undefined)
  currentRef.current = current

  useEffect(() => {
    const container = containerRef.current
    if (!container || !markup) return

    const handler = (event: PointerEvent) => {
      const group = (event.target as Element | null)?.closest?.('[data-region]') as SVGGElement | null
      const id = group?.dataset.region
      if (!id) return

      const held = pickedRef.current
      if (!held) { playSound('soft'); return }

      const target = currentRef.current?.regions.find((r) => r.id === id)
      if (!target) return
      if (target.color !== held.color) { playSound('soft'); return }

      playSound('tap')
      setFilled((prev) => ({ ...prev, [id]: held.color }))
    }

    container.addEventListener('pointerup', handler)
    container.style.cursor = 'pointer'
    return () => container.removeEventListener('pointerup', handler)
  }, [markup])

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
          <button className="btn btn--primary btn--hero" onClick={() => setSeed((s) => s + 11)}>
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
      {done ? <Fireworks /> : null}

      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.colorNumbers')}</div>
        <div className="muted game-round">{round + 1} / {rounds.length || ROUNDS}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {current ? (
        <div className="paint-board">
          <div className="paint-picture card" ref={containerRef} dangerouslySetInnerHTML={{ __html: markup }} />

          <div className="paint-palette">
            {current.regions.map((region) => (
              <button
                key={region.id}
                className={`paint-chip ${picked?.id === region.id ? 'paint-chip--on' : ''} ${
                  filled[region.id] ? 'paint-chip--used' : ''
                }`}
                // A white or pale chip needs dark digits to be readable.
                style={{ background: region.color, color: isLight(region.color) ? 'var(--c-text)' : '#fff' }}
                onClick={() => { playSound('tap'); setPicked(region) }}
              >
                {region.number}
              </button>
            ))}
          </div>

          <div className="muted game-hint">{t('play.colorNumbersHint')}</div>
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
