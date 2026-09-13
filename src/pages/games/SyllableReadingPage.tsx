import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl, type WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { splitIntoSyllables } from '../../games/syllableSplit'
import { playSound } from '../../audio/sounds'
import { speakSequence, speakWord, stopSpeaking } from '../../audio/speech'
import { Icon } from '../../components/Icon'
import './SyllableReadingPage.css'

const ROUNDS = 5
const MIN_SYLLABLES = 2
const MAX_SYLLABLES = 4
const PART_RATE = 0.55

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  word: string
  thumbnail: string
  parts: string[]
}

/**
 * Tap each syllable to hear it sounded out, then blend them into the whole
 * word — the round completes once every part has been tapped at least once,
 * since reading practice has no wrong answer to fail at.
 */
export function SyllableReadingPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(randomSeed)
  const [read, setRead] = useState<number[]>([])

  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready) return []
    const candidates = content.pictures
      .map((picture) => ({ picture, word: content.words[picture.id] ?? '' }))
      .filter(({ word }) => /^[^\s·]{3,12}$/u.test(word))
      .map(({ picture, word }) => ({ picture, word, parts: splitIntoSyllables(word, language) }))
      // A word that doesn't actually break into a handful of parts is not
      // useful reading-by-syllable practice.
      .filter(({ parts }) => parts.length >= MIN_SYLLABLES && parts.length <= MAX_SYLLABLES)

    return shuffle(candidates, seed).slice(0, ROUNDS).map(({ picture, word, parts }) => ({
      word,
      thumbnail: picture.thumbnail,
      parts,
    }))
  }, [content.ready, content.pictures, content.words, language, seed])

  const game = useGameSession(rounds)
  const current = game.current

  const sayPart = useCallback((part: string) => speakWord(part.toLowerCase(), language, PART_RATE), [language])
  const sayWhole = useCallback((word: string) => speakWord(word.toLowerCase(), language, 0.75), [language])

  useEffect(() => {
    setRead([])
  }, [current])

  // Leaving the screen mid-word should not follow the child to the next one.
  useEffect(() => stopSpeaking, [])

  const solved = game.solved
  const solve = game.solve
  const finished = game.finished
  useEffect(() => {
    if (!current || solved || finished) return
    if (read.length >= current.parts.length) void solve()
  }, [read, current, solved, finished, solve])

  function tapPart(index: number) {
    if (!current || game.solved) return
    playSound('tap')
    sayPart(current.parts[index])
    setRead((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }

  function hearSequence() {
    if (!current) return
    speakSequence(current.parts.map((part) => part.toLowerCase()), language, PART_RATE)
  }

  return (
    <GameShell
      title={t('play.syllableReading')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 89); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.syllableReadingHint')}</div>

          <div className="sylread__card card">
            <img src={assetUrl(current.thumbnail)} alt="" />
          </div>

          <div className="sylread__parts">
            {current.parts.map((part, index) => (
              <button
                key={index}
                className={`sylread__part ${index % 2 === 0 ? 'sylread__part--a' : 'sylread__part--b'} ${read.includes(index) ? 'sylread__part--read' : ''}`}
                onClick={() => tapPart(index)}
              >
                {part}
              </button>
            ))}
          </div>

          <div className="row syllable__actions">
            <button className="btn btn--hero" onClick={hearSequence} disabled={!speech}>
              <Icon name="sound" size={24} color="var(--c-text)" width={2.2} />
              {t('play.syllableReadingHear')}
            </button>
            <button className="btn btn--hero" onClick={() => sayWhole(current.word)} disabled={!speech}>
              <Icon name="sound" size={24} color="var(--c-text)" width={2.2} />
              {t('play.syllableReadingSay')}
            </button>
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
