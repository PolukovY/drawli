import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../games/GameShell'
import { useGameSession } from '../games/useGameSession'
import { randomSeed, shuffle } from '../games/shuffle'
import { biasByLearningStats, type LearningStat } from '../games/learningBias'
import { listLearningStats, recordItemMissed, recordItemSeen } from '../storage/LearningStatsRepository'
import { Icon } from '../components/Icon'
import { assetUrl, loadArticles, loadIndex, loadWords, type WordLanguage } from '../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../exercise/Exercise'
import '../styles/ui.css'
import './GuessGamePage.css'

const ROUNDS = 5
const CHOICES = 4
const ABSTRACT_CATEGORIES = new Set(['motor', 'shapes'])
const GAME_ID = 'guess'

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська',
  en: 'English',
  es: 'Español',
}

interface Round {
  word: string
  answer: ExerciseSummary
  choices: ExerciseSummary[]
  article: string
}

/** The mirror of the spelling game: the word is given, the picture is the answer. */
export function GuessGamePage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()

  const requested = search.get('lang')
  const language: WordLanguage =
    requested === 'en' || requested === 'es' || requested === 'uk' ? requested : 'uk'

  const [pool, setPool] = useState<ExerciseSummary[]>([])
  const [dictionary, setDictionary] = useState<Record<string, string>>({})
  const [articles, setArticles] = useState<Record<string, string>>({})
  const [seed, setSeed] = useState(randomSeed)
  const [picked, setPicked] = useState<string[]>([])
  const [stats, setStats] = useState<Record<string, LearningStat>>({})

  useEffect(() => { void listLearningStats(GAME_ID).then(setStats) }, [])

  useEffect(() => {
    void loadWords().then((words) => setDictionary(words[language] ?? {})).catch(() => undefined)
    // Ukrainian has none; for the other two the article belongs with the word.
    if (language === 'uk') { setArticles({}); return }
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
    if (pool.length === 0 || Object.keys(dictionary).length === 0) return []

    const named = pool.filter((e) => dictionary[e.id])
    // Words never seen, or seen and missed, come up before ones already mastered.
    const picks = biasByLearningStats(named, seed, (e) => stats[e.id]).slice(0, ROUNDS)

    return picks.map((answer, i) => {
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
        article: articles[answer.id] ?? '',
      }
    })
  }, [pool, dictionary, articles, stats, seed])

  const game = useGameSession(rounds)
  const current = game.current

  // Wrong picks belong to the round they were made in; the auto-advance does
  // not run the Next handler, so clearing them there was not enough.
  useEffect(() => { setPicked([]) }, [game.round, rounds])

  // Recorded once per round, not once per stats reload above.
  useEffect(() => {
    if (current) void recordItemSeen(GAME_ID, current.answer.id)
  }, [current?.answer.id])

  function pick(id: string) {
    if (!current || game.solved || picked.includes(id)) return
    if (id === current.answer.id) { void game.solve(); return }
    // A wrong card simply steps aside; the child keeps looking.
    game.miss()
    void recordItemMissed(GAME_ID, current.answer.id)
    setPicked((prev) => [...prev, id])
  }

  return (
    <GameShell
      title={t('play.guess')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 97); game.restart() }}
    >
      {current ? (
        <div className="guess__board">
          <div className="guess__word">
            {current.article ? <span className="guess__article">{current.article} </span> : null}
            {current.word}
          </div>
          <div className="guess__hint muted">{t('play.guessHint')}</div>

          <div className="guess__choices">
            {current.choices.map((choice) => {
              const isAnswer = choice.id === current.answer.id
              const state = game.solved && isAnswer ? 'ok' : picked.includes(choice.id) ? 'off' : ''
              return (
                <button
                  key={choice.id}
                  className={`guess-card ${state ? `guess-card--${state}` : ''}`}
                  onClick={() => pick(choice.id)}
                  disabled={picked.includes(choice.id) || game.solved}
                >
                  <img src={assetUrl(choice.thumbnail)} alt="" />
                </button>
              )
            })}
          </div>

          {game.solved ? (
            <button className="btn btn--primary btn--hero guess__next" onClick={game.next}>
              <span className="guess__next-fill" />
              <span className="guess__next-label">
                {t('play.next')}
                <Icon name="arrow" size={24} color="#fff" width={2.6} />
              </span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
