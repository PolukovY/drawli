import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/Icon'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { loadVocabularyIndex, loadVocabularyTheme, vocabularyMediaUrl } from '../../vocabulary/VocabularyLoader'
import type { VocabTheme, VocabWord } from '../../vocabulary/Vocabulary'
import type { WordLanguage } from '../../exercise/ExerciseLoader'
import { useAppStore } from '../../app/store'
import '../../styles/ui.css'
import './VocabularyGamePage.css'

const ROUNDS = 10

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

const VOICE_LOCALE: Record<WordLanguage, string> = {
  uk: 'uk-UA', en: 'en-US', es: 'es-ES',
}

/**
 * What a wrong tap hears and reads, in the language of the word itself — a
 * child learning Spanish is told the mistake in Spanish, not in whatever the
 * app's own menus are written in.
 */
const CORRECTION: Record<WordLanguage, (picked: string, target: string) => string> = {
  uk: (picked, target) => `Це ${picked}. А нам потрібно: ${target}. Спробуй ще!`,
  en: (picked, target) => `That's ${picked}. We need: ${target}. Try again!`,
  es: (picked, target) => `Eso es ${picked}. Necesitamos: ${target}. ¡Inténtalo otra vez!`,
}

/**
 * How many pictures compete for the tap, round by round. Early rounds are two
 * pictures that share nothing; by the end it is five, all from the same
 * theme — the ramp from easy to hard the words themselves cannot carry alone,
 * since every word in a theme is, by definition, related to every other.
 */
function choiceCountFor(round: number): number {
  if (round < 2) return 2
  if (round < 5) return 3
  if (round < 8) return 4
  return 5
}

interface Round {
  word: VocabWord
  choices: VocabWord[]
}

/**
 * Say the word, show pictures, wait for the right one. A wrong tap never
 * ends the round: it is told apart from the answer by name and dims out of
 * the way, and the question is asked again until only the right picture is
 * left standing.
 */
export function VocabularyGamePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParams()
  const { t } = useTranslation()
  const stars = useAppStore((s) => s.settings?.stars ?? 0)

  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'
  const themeId = search.get('theme')

  const [themes, setThemes] = useState<VocabTheme[]>([])
  const [pool, setPool] = useState<VocabWord[]>([])
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])
  const [correction, setCorrection] = useState('')

  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    void loadVocabularyIndex().then((idx) => setThemes(idx.themes)).catch(() => undefined)
  }, [])

  useEffect(() => {
    setPool([])
    if (!themeId) return
    let cancelled = false
    void loadVocabularyTheme(themeId).then((words) => { if (!cancelled) setPool(words) }).catch(() => undefined)
    return () => { cancelled = true }
  }, [themeId])

  const rounds = useMemo<Round[]>(() => {
    if (pool.length === 0) return []

    // Easiest tier first, each tier shuffled on its own so a replay varies
    // without losing the climb from easy to hard.
    const byTier = [1, 2, 3].flatMap((tier) => shuffle(pool.filter((w) => w.difficulty === tier), seed + tier * 97))
    const chosen = byTier.slice(0, Math.min(ROUNDS, byTier.length))

    return chosen.map((word, i) => {
      const count = Math.min(choiceCountFor(i), pool.length)
      const others = shuffle(pool.filter((w) => w.id !== word.id), seed + i * 31 + 7).slice(0, count - 1)
      return { word, choices: shuffle([word, ...others], seed + i * 13 + 3) }
    })
  }, [pool, seed])

  const game = useGameSession(rounds)
  const current = game.current

  /**
   * Its own small speaker, not the tutor's voice: this game's whole premise
   * is the spoken word, and the tutor is off for most children by default.
   * ListenPage takes the same approach for the same reason.
   */
  const say = useCallback((text: string) => {
    if (!speech || !text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = VOICE_LOCALE[language]
    utterance.rate = 0.85
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [language, speech])

  useEffect(() => {
    setWrong([])
    setCorrection('')
    if (current) say(current.word.text[language])
  }, [current, language, say])

  useEffect(() => () => { if (speech) window.speechSynthesis.cancel() }, [speech])

  function pick(word: VocabWord) {
    if (!current || game.solved || wrong.includes(word.id)) return

    if (word.id === current.word.id) {
      setCorrection('')
      void game.solve()
      return
    }

    game.miss()
    setWrong((prev) => [...prev, word.id])
    const line = CORRECTION[language](word.text[language], current.word.text[language])
    setCorrection(line)
    say(line)
  }

  const theme = themes.find((th) => th.id === themeId)

  function chooseTheme(id: string) {
    setSearch({ lang: language, theme: id })
    setSeed(randomSeed())
  }

  // --- no theme chosen yet: pick one -----------------------------------
  if (!themeId) {
    return (
      <div className="screen">
        <header className="row">
          <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('nav.draw')}>
            <Icon name="back" size={26} color="var(--c-text)" width={2.6} />
          </button>
          <div className="title grow">{t('play.vocabulary')}</div>
          <div className="star-badge">
            <Icon name="star" size={22} color="var(--c-star)" filled />
            {stars}
          </div>
        </header>

        <div className="subtitle">{t('vocabulary.pickTheme')}</div>

        <div className="row" style={{ gap: 10 }}>
          {(Object.keys(LANGUAGE_LABELS) as WordLanguage[]).map((id) => (
            <button
              key={id}
              className={`chip ${language === id ? 'chip--on' : ''}`}
              onClick={() => setSearch({ lang: id })}
            >
              {LANGUAGE_LABELS[id]}
            </button>
          ))}
        </div>

        <div className="home__grid">
          {themes.map((th) => (
            <button key={th.id} className="exercise-card game-card" onClick={() => chooseTheme(th.id)}>
              <span className="game-card__art">{th.art}</span>
              <span>{t(th.titleKey)}</span>
            </button>
          ))}
        </div>

        {themes.length === 0 ? <div className="subtitle">{t('play.loading')}</div> : null}
      </div>
    )
  }

  // --- the round itself --------------------------------------------------
  return (
    <GameShell
      title={theme ? t(theme.titleKey) : t('play.vocabulary')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed(randomSeed()); setWrong([]); setCorrection(''); game.restart() }}
    >
      {current ? (
        <div className="game-board vocab">
          <button
            className="vocab__speaker"
            onClick={() => say(current.word.text[language])}
            aria-label={t('vocabulary.hear')}
          >
            <Icon name="mic" size={40} color="#fff" width={2} />
          </button>

          {correction ? (
            <div className="vocab__correction" role="status">{correction}</div>
          ) : (
            <div className="muted game-hint">{t('vocabulary.hint')}</div>
          )}

          <div className="game-choices" style={{ gridTemplateColumns: `repeat(${Math.min(current.choices.length, 5)}, minmax(0, 1fr))` }}>
            {current.choices.map((choice) => {
              const isAnswer = choice.id === current.word.id
              const state = game.solved && isAnswer ? 'ok' : wrong.includes(choice.id) ? 'off' : ''
              return (
                <button
                  key={choice.id}
                  className={`choice-card ${state ? `choice-card--${state}` : ''}`}
                  onClick={() => pick(choice)}
                  disabled={wrong.includes(choice.id) || game.solved}
                >
                  <img src={vocabularyMediaUrl(choice.image)} alt="" />
                </button>
              )
            })}
          </div>

          {game.solved ? (
            <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
              <span className="game-next__fill" />
              <span className="game-next__label">
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
