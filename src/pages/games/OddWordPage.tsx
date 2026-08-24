import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { type WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './OddWordPage.css'

const ROUNDS = 5
const GROUP = 3

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}
const VOICE_LOCALE: Record<WordLanguage, string> = {
  uk: 'uk-UA', en: 'en-US', es: 'es-ES',
}

interface Round {
  words: string[]
  odd: string
}

/**
 * The same idea as the picture version, by ear: three words from one family
 * and a fourth from another, with nothing to look at.
 */
export function OddWordPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])

  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready) return []
    const byCategory = new Map<string, string[]>()
    for (const picture of content.pictures) {
      const word = content.words[picture.id]
      if (!word || /[\s·]/u.test(word)) continue
      const list = byCategory.get(picture.category) ?? []
      list.push(word)
      byCategory.set(picture.category, list)
    }
    const usable = [...byCategory.entries()].filter(([, list]) => list.length >= GROUP)
    if (usable.length < 2) return []

    return Array.from({ length: ROUNDS }, (_, i) => {
      const [family, other] = shuffle(usable, seed + i * 31).slice(0, 2)
      const same = shuffle(family[1], seed + i * 37).slice(0, GROUP)
      const odd = shuffle(other[1], seed + i * 41)[0]
      return { words: shuffle([...same, odd], seed + i * 43), odd }
    })
  }, [content.ready, content.pictures, content.words, seed])

  const game = useGameSession(rounds)
  const current = game.current

  const say = useCallback((word: string) => {
    if (!speech || !word) return
    const utterance = new SpeechSynthesisUtterance(word.toLowerCase())
    utterance.lang = VOICE_LOCALE[language]
    utterance.rate = 0.8
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [language, speech])

  const sayAll = useCallback((words: string[]) => {
    if (!speech) return
    window.speechSynthesis.cancel()
    // Queued one after another, with the pause the engine puts between
    // utterances doing the work of "and now the next one".
    for (const word of words) {
      const utterance = new SpeechSynthesisUtterance(word.toLowerCase())
      utterance.lang = VOICE_LOCALE[language]
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }, [language, speech])

  useEffect(() => {
    setWrong([])
    if (current) sayAll(current.words)
  }, [current, sayAll])

  useEffect(() => () => { if (speech) window.speechSynthesis.cancel() }, [speech])

  function pick(word: string) {
    if (!current || game.solved || wrong.includes(word)) return
    if (word === current.odd) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, word])
  }

  return (
    <GameShell
      title={t('play.oddWord')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 83); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">
            {speech ? t('play.oddWordHint') : t('play.listenNoVoice')}
          </div>

          <button className="btn btn--hero" onClick={() => sayAll(current.words)} disabled={!speech}>
            <Icon name="sound" size={24} color="var(--c-text)" width={2.2} />
            {t('play.oddWordAgain')}
          </button>

          <div className="oddword__list">
            {current.words.map((word) => (
              <button
                key={word}
                className={`oddword__card ${game.solved && word === current.odd ? 'oddword__card--ok' : ''} ${
                  wrong.includes(word) ? 'oddword__card--off' : ''
                }`}
                onClick={() => pick(word)}
                onDoubleClick={() => say(word)}
                disabled={game.solved || wrong.includes(word)}
              >
                <span className="oddword__text">{word}</span>
                <span
                  className="oddword__say"
                  role="button"
                  tabIndex={-1}
                  aria-label={t('play.oddWordSay')}
                  onClick={(event) => { event.stopPropagation(); say(word) }}
                >
                  <Icon name="sound" size={20} color="var(--c-text-soft)" width={2.2} />
                </span>
              </button>
            ))}
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
