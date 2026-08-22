import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { useAppStore } from '../app/store'
import { assetUrl, loadIndex, loadWords, type WordLanguage } from '../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../exercise/Exercise'
import '../styles/ui.css'
import './GuessGamePage.css'

const ROUNDS = 5
const CHOICES = 4
const STARS_PER_ROUND = 2
const ABSTRACT_CATEGORIES = new Set(['motor', 'shapes'])

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська',
  en: 'English',
  es: 'Español',
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

interface Round {
  word: string
  answer: ExerciseSummary
  choices: ExerciseSummary[]
}

/** The mirror of the spelling game: the word is given, the picture is the answer. */
export function GuessGamePage() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const requested = search.get('lang')
  const language: WordLanguage =
    requested === 'en' || requested === 'es' || requested === 'uk' ? requested : 'uk'

  const [pool, setPool] = useState<ExerciseSummary[]>([])
  const [dictionary, setDictionary] = useState<Record<string, string>>({})
  const [rounds, setRounds] = useState<Round[]>([])
  const [round, setRound] = useState(0)
  const [seed, setSeed] = useState(1)
  const [picked, setPicked] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    void loadWords().then((words) => setDictionary(words[language] ?? {})).catch(() => undefined)
  }, [language])

  useEffect(() => {
    void loadIndex()
      .then((index) => {
        const usable = new Set(
          index.categories
            .filter((c) => c.kind === 'draw' && !ABSTRACT_CATEGORIES.has(c.id))
            .map((c) => c.id),
        )
        setPool(index.exercises.filter((e) => usable.has(e.category)))
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (pool.length === 0 || Object.keys(dictionary).length === 0) return

    const named = pool.filter((e) => dictionary[e.id])
    const picks = shuffle(named, seed).slice(0, ROUNDS)

    setRounds(
      picks.map((answer, i) => {
        // Wrong options come from other categories too, so the answer is never
        // the odd one out by shape alone.
        const others = shuffle(
          named.filter((e) => e.id !== answer.id),
          seed + i * 31 + 7,
        ).slice(0, CHOICES - 1)
        return {
          word: dictionary[answer.id].toUpperCase(),
          answer,
          choices: shuffle([answer, ...others], seed + i * 13 + 3),
        }
      }),
    )
    setRound(0)
    setFinished(false)
  }, [pool, dictionary, seed])

  const current = rounds[round]

  const reset = useCallback(() => {
    setPicked([])
    setSolved(false)
  }, [])

  useEffect(() => { reset() }, [round, reset])

  async function pick(id: string) {
    if (solved || !current || picked.includes(id)) return

    if (id === current.answer.id) {
      setSolved(true)
      setEarned((e) => e + STARS_PER_ROUND)
      await awardStars(STARS_PER_ROUND)
      return
    }
    // A wrong card simply steps aside; the child keeps looking.
    setPicked((prev) => [...prev, id])
  }

  function next() {
    if (round + 1 < rounds.length) setRound(round + 1)
    else setFinished(true)
  }

  const title = useMemo(() => t('play.guess'), [t])

  if (finished) {
    return (
      <div className="center-screen">
        <div style={{ fontSize: 36, fontWeight: 800 }}>{t('play.finished')}</div>
        <div className="completion__stars">
          <Icon name="star" size={30} color="var(--c-star)" filled />
          {t('complete.stars', { count: earned })}
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn btn--primary btn--hero"
            onClick={() => { setSeed((s) => s + 97); setEarned(0) }}
          >
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
    <div className="screen guess">
      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{title}</div>
        <div className="chip">{LANGUAGE_LABELS[language]}</div>
        <div className="muted" style={{ fontSize: 17 }}>
          {round + 1} / {rounds.length || ROUNDS}
        </div>
        <div className="star-badge">
          <Icon name="star" size={22} color="var(--c-star)" filled />
          {stars}
        </div>
      </header>

      {current ? (
        <div className="guess__board">
          <div className="guess__word">{current.word}</div>
          <div className="guess__hint muted">{t('play.guessHint')}</div>

          <div className="guess__choices">
            {current.choices.map((choice) => {
              const isAnswer = choice.id === current.answer.id
              const state = solved && isAnswer ? 'ok' : picked.includes(choice.id) ? 'off' : ''
              return (
                <button
                  key={choice.id}
                  className={`guess-card ${state ? `guess-card--${state}` : ''}`}
                  onClick={() => void pick(choice.id)}
                  disabled={picked.includes(choice.id) || solved}
                >
                  <img src={assetUrl(choice.thumbnail)} alt="" />
                </button>
              )
            })}
          </div>

          {solved ? (
            <button className="btn btn--primary btn--hero" onClick={next}>
              {t('play.next')}
              <Icon name="arrow" size={24} color="#fff" width={2.6} />
            </button>
          ) : null}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
