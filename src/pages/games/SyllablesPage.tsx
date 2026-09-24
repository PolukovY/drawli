import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl, type WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed } from '../../games/shuffle'
import { biasByLearningStats, type LearningStat } from '../../games/learningBias'
import { listLearningStats, recordItemMissed, recordItemSeen } from '../../storage/LearningStatsRepository'
import { speakWord, stopSpeaking } from '../../audio/speech'
import { Icon } from '../../components/Icon'
import './SyllablesPage.css'

const ROUNDS = 5
const CHOICES = [1, 2, 3, 4]
const GAME_ID = 'syllables'

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}
/**
 * One syllable per vowel sound. True for Ukrainian and Spanish; English spells
 * more vowels than it says, so its silent trailing "e" is dropped and runs of
 * vowels count once.
 */
const VOWELS: Record<WordLanguage, RegExp> = {
  uk: /[АЕЄИІЇОУЮЯ]/gu,
  es: /[AEIOUÁÉÍÓÚÜ]+/gu,
  en: /[AEIOUY]+/gu,
}

function syllables(word: string, language: WordLanguage): number {
  const upper = word.toUpperCase()
  const trimmed = language === 'en' ? upper.replace(/E$/u, '') : upper
  return (trimmed.match(VOWELS[language]) ?? []).length
}

interface Round {
  itemId: string
  word: string
  thumbnail: string
  count: number
}

/** Hear a word, clap out its parts, pick how many there were. */
export function SyllablesPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<number[]>([])
  const [claps, setClaps] = useState(0)
  const [stats, setStats] = useState<Record<string, LearningStat>>({})

  useEffect(() => { void listLearningStats(GAME_ID).then(setStats) }, [])

  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready) return []
    const candidates = content.pictures
      .map((picture) => ({ picture, word: content.words[picture.id] ?? '' }))
      .filter(({ word }) => /^[^\s·]{3,12}$/u.test(word))
      .map(({ picture, word }) => ({ picture, word, count: syllables(word, language) }))
      // Words whose spelling does not answer the question are left out.
      .filter(({ count }) => count >= 1 && count <= 4)

    // Words never seen, or seen and missed, come up before ones already mastered.
    const picks = biasByLearningStats(candidates, seed, (c) => stats[`${language}:${c.picture.id}`])
      .slice(0, ROUNDS)

    return picks.map(({ picture, word, count }) => ({
      itemId: `${language}:${picture.id}`,
      word,
      thumbnail: picture.thumbnail,
      count,
    }))
  }, [content.ready, content.pictures, content.words, language, stats, seed])

  const game = useGameSession(rounds)
  const current = game.current

  const say = useCallback((word: string) => speakWord(word.toLowerCase(), language, 0.7), [language])

  useEffect(() => {
    setWrong([])
    setClaps(0)
    if (current) { say(current.word); void recordItemSeen(GAME_ID, current.itemId) }
  }, [current, say])

  // Leaving the screen mid-word should not follow the child to the next one.
  useEffect(() => stopSpeaking, [])

  function pick(value: number) {
    if (!current || game.solved || wrong.includes(value)) return
    if (value === current.count) { void game.solve(); return }
    game.miss()
    void recordItemMissed(GAME_ID, current.itemId)
    setWrong((prev) => [...prev, value])
  }

  return (
    <GameShell
      title={t('play.syllables')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 73); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.syllablesHint')}</div>

          <div className="syllable__word card">
            <img src={assetUrl(current.thumbnail)} alt="" />
            <span className="syllable__text">{current.word}</span>
          </div>

          <div className="row syllable__actions">
            <button className="btn btn--hero" onClick={() => say(current.word)} disabled={!speech}>
              <Icon name="sound" size={24} color="var(--c-text)" width={2.2} />
              {t('play.syllablesSay')}
            </button>
            {/* Clapping is how this is taught away from a screen, so the button
                counts along with the child instead of scoring anything. */}
            <button className="btn btn--hero" onClick={() => setClaps((n) => n + 1)}>
              👏 {claps}
            </button>
            {claps > 0 ? (
              <button className="btn" onClick={() => setClaps(0)}>{t('play.syllablesReset')}</button>
            ) : null}
          </div>

          <div className="syllable__choices">
            {CHOICES.map((value) => (
              <button
                key={value}
                className={`syllable__choice ${game.solved && value === current.count ? 'syllable__choice--ok' : ''} ${
                  wrong.includes(value) ? 'syllable__choice--off' : ''
                }`}
                onClick={() => pick(value)}
                disabled={game.solved || wrong.includes(value)}
              >
                {value}
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
