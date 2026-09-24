import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/Icon'
import { GameShell } from '../games/GameShell'
import { useGameSession } from '../games/useGameSession'
import { randomSeed, shuffle } from '../games/shuffle'
import { assetUrl, loadArticles, loadIndex, loadWords } from '../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../exercise/Exercise'
import '../styles/ui.css'
import './ArticleGamePage.css'

const ROUNDS = 5
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

interface Round {
  exercise: ExerciseSummary
  word: string
  article: string
}

export function ArticleGamePage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()

  const language: ArticleLanguage = search.get('lang') === 'es' ? 'es' : 'en'

  const [pool, setPool] = useState<ExerciseSummary[]>([])
  const [words, setWords] = useState<Record<string, string>>({})
  const [articles, setArticles] = useState<Record<string, string>>({})
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])

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

  const rounds = useMemo<Round[]>(() => {
    if (pool.length === 0 || Object.keys(articles).length === 0) return []

    // Plurals carry "los" / "las", which are not on offer here.
    const usable = pool.filter((e) => words[e.id] && OPTIONS[language].includes(articles[e.id]))

    return shuffle(usable, seed)
      .slice(0, ROUNDS)
      .map((exercise) => ({ exercise, word: words[exercise.id], article: articles[exercise.id] }))
  }, [pool, words, articles, language, seed])

  const game = useGameSession(rounds)
  const current = game.current

  // Wrong picks belong to the round they were made in; the auto-advance does
  // not run the Next handler, so clearing them there was not enough.
  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(option: string) {
    if (!current || game.solved || wrong.includes(option)) return
    if (option === current.article) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, option])
  }

  return (
    <GameShell
      title={t('play.article')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 89); game.restart() }}
    >
      {current ? (
        <div className="article-board">
          <div className="article-picture card">
            <img src={assetUrl(current.exercise.thumbnail)} alt="" />
          </div>

          <div className="article-phrase">
            <span className={`article-slot ${game.solved ? 'article-slot--ok' : ''}`}>
              {game.solved ? current.article : '?'}
            </span>
            <span className="article-word">{current.word.toLowerCase()}</span>
          </div>

          <div className="article-options">
            {OPTIONS[language].map((option) => (
              <button
                key={option}
                className={`article-option ${
                  game.solved && option === current.article ? 'article-option--ok' : ''
                } ${wrong.includes(option) ? 'article-option--off' : ''}`}
                onClick={() => pick(option)}
                disabled={game.solved || wrong.includes(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {game.solved ? (
            <button className="btn btn--primary btn--hero article-next" onClick={game.next}>
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
    </GameShell>
  )
}
