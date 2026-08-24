import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { Fireworks } from '../components/Fireworks'
import { playSound } from '../audio/sounds'
import { useAppStore } from '../app/store'
import { randomSeed } from '../games/shuffle'
import { assetUrl, loadArticles, loadIndex, loadWords } from '../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../exercise/Exercise'
import '../styles/ui.css'
import './ArticleGamePage.css'

const ROUNDS = 5
const STARS_PER_ROUND = 2
const NEXT_DELAY = 3000
const ABSTRACT_CATEGORIES = new Set(['motor', 'shapes'])

/** Only languages that have articles; Ukrainian has none to practise. */
type ArticleLanguage = 'en' | 'es'

const OPTIONS: Record<ArticleLanguage, string[]> = {
  en: ['a', 'an'],
  es: ['el', 'la'],
}

const LANGUAGE_LABELS: Record<ArticleLanguage, string> = {
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
  exercise: ExerciseSummary
  word: string
  article: string
}

export function ArticleGamePage() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const awardStars = useAppStore((s) => s.awardStars)
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const language: ArticleLanguage = search.get('lang') === 'es' ? 'es' : 'en'

  const [pool, setPool] = useState<ExerciseSummary[]>([])
  const [words, setWords] = useState<Record<string, string>>({})
  const [articles, setArticles] = useState<Record<string, string>>({})
  const [rounds, setRounds] = useState<Round[]>([])
  const [round, setRound] = useState(0)
  const roundRef = useRef(0)
  roundRef.current = round
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    void loadWords().then((all) => setWords(all[language] ?? {})).catch(() => undefined)
    void loadArticles().then((all) => setArticles(all[language] ?? {})).catch(() => undefined)
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
    if (pool.length === 0 || Object.keys(articles).length === 0) return

    // Plurals carry "los" / "las", which are not on offer here.
    const usable = pool.filter((e) => words[e.id] && OPTIONS[language].includes(articles[e.id]))

    setRounds(
      shuffle(usable, seed)
        .slice(0, ROUNDS)
        .map((exercise) => ({ exercise, word: words[exercise.id], article: articles[exercise.id] })),
    )
    setRound(0)
    setFinished(false)
  }, [pool, words, articles, language, seed])

  const current = rounds[round]

  const next = useCallback(() => {
    // Never call setState from inside an updater: React may re-run it and drop
    // the call, which used to leave the game running past its last round.
    if (roundRef.current + 1 < rounds.length) setRound(roundRef.current + 1)
    else setFinished(true)
  }, [rounds.length])

  useEffect(() => {
    setWrong([])
    setSolved(false)
  }, [round])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  useEffect(() => {
    if (!solved) return
    const timer = window.setTimeout(next, NEXT_DELAY)
    return () => window.clearTimeout(timer)
  }, [solved, next])

  async function pick(option: string) {
    if (!current || solved || wrong.includes(option)) return
    if (option === current.article) {
      playSound('correct')
      setSolved(true)
      setEarned((e) => e + STARS_PER_ROUND)
      await awardStars(STARS_PER_ROUND)
      return
    }
    playSound('soft')
    setWrong((prev) => [...prev, option])
  }

  if (finished) {
    return (
      <div className="center-screen">
        <Fireworks variant="finale" />
        <div style={{ fontSize: 36, fontWeight: 800 }}>{t('play.finished')}</div>
        <div className="completion__stars">
          <Icon name="star" size={30} color="var(--c-star)" filled />
          {t('complete.stars', { count: earned })}
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn btn--primary btn--hero"
            onClick={() => { setSeed((s) => s + 89); setEarned(0) }}
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
    <div className="screen article-game">
      {solved ? <Fireworks /> : null}

      <header className="row">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
          <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
        </button>
        <div className="title grow">{t('play.article')}</div>
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
        <div className="article-board">
          <div className="article-picture card">
            <img src={assetUrl(current.exercise.thumbnail)} alt="" />
          </div>

          <div className="article-phrase">
            <span className={`article-slot ${solved ? 'article-slot--ok' : ''}`}>
              {solved ? current.article : '?'}
            </span>
            <span className="article-word">{current.word.toLowerCase()}</span>
          </div>

          <div className="article-options">
            {OPTIONS[language].map((option) => (
              <button
                key={option}
                className={`article-option ${
                  solved && option === current.article ? 'article-option--ok' : ''
                } ${wrong.includes(option) ? 'article-option--off' : ''}`}
                onClick={() => void pick(option)}
                disabled={solved || wrong.includes(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {solved ? (
            <button className="btn btn--primary btn--hero article-next" onClick={next}>
              <span className="article-next__fill" />
              <span className="article-next__label">
                {t('play.next')}
                <Icon name="arrow" size={24} color="#fff" width={2.6} />
              </span>
            </button>
          ) : (
            <div className="muted article-hint">{t('play.articleHint')}</div>
          )}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </div>
  )
}
