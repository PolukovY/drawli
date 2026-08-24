import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { Fireworks } from '../components/Fireworks'
import { playSound } from '../audio/sounds'
import { useAppStore } from '../app/store'
import { randomSeed } from '../games/shuffle'
import { assetUrl, loadIndex, loadWords, type WordLanguage } from '../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../exercise/Exercise'
import '../styles/ui.css'
import './SpellGamePage.css'

const ALPHABETS: Record<WordLanguage, string> = {
  uk: 'АБВГДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЮЯ',
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  es: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
}

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська',
  en: 'English',
  es: 'Español',
}

const ROUNDS = 5
const MAX_WORD_LENGTH = 6
const STARS_PER_WORD = 2
/** A right word moves the game on by itself after this pause. */
const NEXT_DELAY = 3000
/** Lines, waves and polygons make no sense as a "name this picture" prompt. */
const ABSTRACT_CATEGORIES = new Set(['motor', 'shapes'])

interface Slot {
  letter: string
  /** Index into the tile row, so returning a letter puts the same tile back. */
  from: number | null
}

function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let random = seed
  for (let i = out.length - 1; i > 0; i -= 1) {
    random = (random * 1103515245 + 12345) % 2147483648
    const j = random % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function SpellGamePage() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const { t } = useTranslation()

  const requested = search.get('lang')
  const language: WordLanguage =
    requested === 'en' || requested === 'es' || requested === 'uk' ? requested : 'uk'
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const [pool, setPool] = useState<ExerciseSummary[]>([])
  const [dictionary, setDictionary] = useState<Record<string, string>>({})
  const [round, setRound] = useState(0)
  const [seed, setSeed] = useState(randomSeed)
  // Slots and the used-tile set move together: keeping them in two states meant
  // one updater had to call the other, and React re-invokes updaters (StrictMode),
  // which placed the same tile twice.
  const [board, setBoard] = useState<{ slots: Slot[]; used: Set<number> }>({ slots: [], used: new Set() })
  const { slots, used } = board
  const [state, setState] = useState<'playing' | 'correct' | 'retry' | 'done'>('playing')
  const [hintShown, setHintShown] = useState(false)
  const [earned, setEarned] = useState(0)

  const alphabet = ALPHABETS[language]

  useEffect(() => {
    void loadWords()
      .then((words) => setDictionary(words[language] ?? {}))
      .catch(() => undefined)
  }, [language])

  useEffect(() => {
    void loadIndex()
      .then((index) => {
        const drawCategories = new Set(
          index.categories
            .filter((c) => c.kind === 'draw' && !ABSTRACT_CATEGORIES.has(c.id))
            .map((c) => c.id),
        )
        setPool(index.exercises.filter((e) => drawCategories.has(e.category)))
      })
      .catch(() => undefined)
  }, [])

  /**
   * The round list is state, not a memo: recomputing it (the `t` binding changes
   * identity as i18n settles) reshuffled the word mid-round, so the answer was
   * checked against a word the child was never shown.
   * Only single short words — a five-year-old should not face "Повітряна куля".
   */
  const [words, setWords] = useState<Array<{ exercise: ExerciseSummary; word: string }>>([])

  useEffect(() => {
    if (pool.length === 0 || Object.keys(dictionary).length === 0) return
    const candidates = pool
      .map((exercise) => ({ exercise, word: (dictionary[exercise.id] ?? '').toUpperCase() }))
      .filter(({ word }) => /^[^\s·]+$/u.test(word) && word.length >= 3 && word.length <= MAX_WORD_LENGTH)
    setWords(shuffle(candidates, seed).slice(0, ROUNDS))
    setRound(0)
  }, [pool, dictionary, seed])

  const current = words[round]
  const word = current?.word ?? ''

  const tiles = useMemo(() => {
    if (!word) return []
    // Distractors come from a shuffled alphabet: stepping by a fixed stride
    // collapses whenever the stride shares a factor with the alphabet length.
    const wanted = Math.min(4, Math.max(2, 9 - word.length))
    const extras = shuffle(
      alphabet.split('').filter((letter) => !word.includes(letter)),
      seed + round * 7 + word.length,
    ).slice(0, wanted)
    return shuffle([...word.split(''), ...extras], seed + round * 17)
  }, [word, alphabet, seed, round])

  const resetRound = useCallback(() => {
    setBoard({ slots: word.split('').map(() => ({ letter: '', from: null })), used: new Set() })
    setHintShown(false)
    setState('playing')
  }, [word])

  useEffect(() => { resetRound() }, [resetRound])

  /**
   * Functional updates only: a child taps tiles faster than React commits, and
   * reading `slots` from the closure made every tap in the same tick land in
   * the first empty slot, silently dropping letters.
   */
  function placeTile(tileIndex: number) {
    if (state === 'correct') return
    playSound('tap')
    setBoard((prev) => {
      if (prev.used.has(tileIndex)) return prev
      const target = prev.slots.findIndex((s) => !s.letter)
      if (target === -1) return prev
      return {
        slots: prev.slots.map((slot, i) =>
          i === target ? { letter: tiles[tileIndex], from: tileIndex } : slot,
        ),
        used: new Set([...prev.used, tileIndex]),
      }
    })
  }

  function takeBack(slotIndex: number) {
    if (state === 'correct') return
    setBoard((prev) => {
      const slot = prev.slots[slotIndex]
      if (!slot?.letter) return prev
      const used = new Set(prev.used)
      if (slot.from !== null) used.delete(slot.from)
      return {
        slots: prev.slots.map((s, i) => (i === slotIndex ? { letter: '', from: null } : s)),
        used,
      }
    })
  }

  // The answer is checked once the row fills up, whichever tap completed it.
  useEffect(() => {
    if (state !== 'playing') return
    if (slots.length === 0 || !slots.every((s) => s.letter)) return
    void check(slots)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, state])

  async function check(filled: Slot[]) {
    if (filled.map((s) => s.letter).join('') === word) {
      playSound('correct')
      setState('correct')
      setEarned((e) => e + STARS_PER_WORD)
      await awardStars(STARS_PER_WORD)
      return
    }

    // Never say "wrong": keep the letters that already match, hand the rest back.
    playSound('soft')
    setState('retry')
    const kept = filled.map((slot, i) => (slot.letter === word[i] ? slot : { letter: '', from: null }))
    const keptTiles = new Set(kept.filter((s) => s.from !== null).map((s) => s.from as number))
    setTimeout(() => {
      setBoard({ slots: kept, used: keptTiles })
      setHintShown(true)
      setState('playing')
    }, 700)
  }

  const nextRound = useCallback(() => {
    setRound((prev) => {
      if (prev + 1 < words.length) return prev + 1
      setState('done')
      return prev
    })
  }, [words.length])

  useEffect(() => {
    if (state === 'done') playSound('fanfare')
  }, [state])

  useEffect(() => {
    if (state !== 'correct') return
    const timer = window.setTimeout(nextRound, NEXT_DELAY)
    return () => window.clearTimeout(timer)
  }, [state, nextRound])

  function playAgain() {
    setSeed((s) => s + 101)
    setRound(0)
    setEarned(0)
    setState('playing')
  }

  if (state === 'done') {
    return (
      <div className="center-screen">
        <Fireworks variant="finale" />
        <div style={{ fontSize: 40, fontWeight: 800 }}>{t('play.finished')}</div>
        <div className="completion__stars">
          <Icon name="star" size={34} color="var(--c-star)" filled />
          {t('complete.stars', { count: earned })}
        </div>
        <div className="row" style={{ gap: 14 }}>
          <button className="btn btn--primary btn--hero" onClick={playAgain}>
            <Icon name="again" size={26} color="#fff" width={2.4} />
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
    <div className="screen spell">
      {state === 'correct' ? <Fireworks /> : null}
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.spell')}</div>
        <div className="chip">{LANGUAGE_LABELS[language]}</div>
        <div className="muted" style={{ fontSize: 17 }}>
          {round + 1} / {words.length || ROUNDS}
        </div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {current ? (
        <div className="spell__board">
          <div className="spell__picture card">
            <img src={assetUrl(current.exercise.thumbnail)} alt="" />
          </div>

          <div className="spell__right">
            <div className={`spell__slots ${state === 'retry' ? 'spell__slots--retry' : ''}`}>
              {slots.map((slot, i) => (
                <button
                  key={i}
                  className={`slot ${slot.letter ? 'slot--filled' : ''} ${state === 'correct' ? 'slot--ok' : ''}`}
                  onClick={() => takeBack(i)}
                  aria-label={slot.letter || '_'}
                >
                  {slot.letter || (hintShown && i === 0 ? <span className="slot__hint">{word[0]}</span> : '')}
                </button>
              ))}
            </div>

            {state === 'correct' ? (
              <div className="spell__win">
                <div className="spell__word">{word}</div>
                <button className="btn btn--primary btn--hero spell__next" onClick={nextRound}>
                  <span className="spell__next-fill" />
                  <span className="spell__next-label">
                    {t('play.next')}
                    <Icon name="arrow" size={26} color="#fff" width={2.6} />
                  </span>
                </button>
              </div>
            ) : (
              <div className="spell__tiles">
                {tiles.map((letter, i) => (
                  <button
                    key={`${letter}-${i}`}
                    className={`tile-letter ${used.has(i) ? 'tile-letter--used' : ''}`}
                    onClick={() => placeTile(i)}
                    disabled={used.has(i)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
