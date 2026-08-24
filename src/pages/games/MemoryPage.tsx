import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl } from '../../exercise/ExerciseLoader'
import { useGameContent } from '../../games/useGameContent'
import { randomSeed, shuffle } from '../../games/shuffle'
import { STARS_PER_ROUND } from '../../games/useGameSession'
import { useAppStore } from '../../app/store'
import { playSound } from '../../audio/sounds'
import { Fireworks } from '../../components/Fireworks'
import { Icon } from '../../components/Icon'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './MemoryPage.css'

const PAIRS = 6
const PEEK = 900

interface Card {
  key: string
  id: string
  thumbnail: string
}

/**
 * Memory does not fit the one-round-per-answer shell: the whole board is the
 * round, so it keeps its own state and awards a star per pair found.
 */
export function MemoryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)
  const content = useGameContent('uk')

  // Random on every visit: a fixed seed dealt the same six pictures in the
  // same squares each time the game was opened, so it stopped being memory.
  const [seed, setSeed] = useState(randomSeed)
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [earned, setEarned] = useState(0)

  const cards = useMemo<Card[]>(() => {
    if (content.allPictures.length < PAIRS) return []
    const picked = shuffle(content.allPictures, seed).slice(0, PAIRS)
    const deck = picked.flatMap((picture) => [
      { key: `${picture.id}-a`, id: picture.id, thumbnail: picture.thumbnail },
      { key: `${picture.id}-b`, id: picture.id, thumbnail: picture.thumbnail },
    ])
    return shuffle(deck, seed + 7)
  }, [content.allPictures, seed])

  const finished = cards.length > 0 && matched.length === cards.length

  useEffect(() => {
    setFlipped([])
    setMatched([])
    setEarned(0)
  }, [cards])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  const flip = useCallback(async (card: Card) => {
    if (busy || matched.includes(card.key) || flipped.includes(card.key)) return

    const next = [...flipped, card.key]
    playSound('tap')
    setFlipped(next)
    if (next.length < 2) return

    const [firstKey, secondKey] = next
    const first = cards.find((c) => c.key === firstKey)
    const second = cards.find((c) => c.key === secondKey)

    if (first && second && first.id === second.id) {
      playSound('correct')
      setMatched((prev) => [...prev, firstKey, secondKey])
      setFlipped([])
      setEarned((value) => value + STARS_PER_ROUND)
      await awardStars(STARS_PER_ROUND)
      return
    }

    // Hold the mismatch on screen long enough to be remembered.
    setBusy(true)
    playSound('soft')
    window.setTimeout(() => {
      setFlipped([])
      setBusy(false)
    }, PEEK)
  }, [busy, cards, flipped, matched, awardStars])

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
          <button className="btn btn--primary btn--hero" onClick={() => setSeed((s) => s + 17)}>
            <Icon name="again" size={24} color="#fff" width={2.4} />
            {t('play.again')}
          </button>
          <button className="btn btn--hero" onClick={() => navigate('/')}>
            {t('complete.another')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen game-screen">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.memory')}</div>
        <div className="muted game-round">{matched.length / 2} / {PAIRS}</div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      <div className="memory__board">
        {cards.map((card) => {
          const open = flipped.includes(card.key) || matched.includes(card.key)
          return (
            <button
              key={card.key}
              className={`memory__card ${open ? 'memory__card--open' : ''} ${
                matched.includes(card.key) ? 'memory__card--done' : ''
              }`}
              onClick={() => void flip(card)}
              aria-label={open ? card.id : '?'}
            >
              {open ? <img src={assetUrl(card.thumbnail)} alt="" /> : <span>?</span>}
            </button>
          )
        })}
      </div>

      <div className="muted game-hint" style={{ textAlign: 'center' }}>{t('play.memoryHint')}</div>
    </div>
  )
}
