import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { useGameContent } from '../../games/useGameContent'
import { randomSeed, shuffle } from '../../games/shuffle'
import { DrawingCanvas } from '../../components/DrawingCanvas'
import { GuideLayer } from '../../components/GuideLayer'
import { assetUrl, loadExercise, loadIndex, type WordLanguage } from '../../exercise/ExerciseLoader'
import type { ExerciseStep } from '../../exercise/Exercise'
import { useAppStore } from '../../app/store'
import { speakWord } from '../../audio/speech'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './WriteWithMePage.css'

const ROUNDS = 5
const MIN_LEN = 3
const MAX_LEN = 6

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  word: string
  thumbnail: string
}

/** Bridges single-letter tracing to whole-word writing: one guided letter at
 * a time, then the finished word is revealed with its picture and sound. */
export function WriteWithMePage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const color = useAppStore((s) => s.color)
  const [seed, setSeed] = useState(randomSeed)
  const [letterIndex, setLetterIndex] = useState(0)
  const [steps, setSteps] = useState<ExerciseStep[] | null>(null)
  // Glyph -> exercise id: mostly `${language}-${letter.toLowerCase()}`, but
  // not always (Spanish Ñ is `es-enye`), so this is read from the real data.
  const [letterIds, setLetterIds] = useState<Record<string, string>>({})

  useEffect(() => {
    void loadIndex()
      .then((index) => {
        const map: Record<string, string> = {}
        for (const e of index.exercises) {
          if (e.category === `letters_${language}` && e.glyph) map[e.glyph] = e.id
        }
        setLetterIds(map)
      })
      .catch(() => undefined)
  }, [language])

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready || content.letters.length === 0) return []
    const letterSet = new Set(content.letters)
    const candidates = content.pictures
      .map((picture) => ({ picture, word: (content.words[picture.id] ?? '').toUpperCase() }))
      .filter(({ word }) => /^[^\s·]+$/u.test(word) && word.length >= MIN_LEN && word.length <= MAX_LEN)
      .filter(({ word }) => [...word].every((letter) => letterSet.has(letter)))

    const shortWords = candidates.filter(({ word }) => word.length === MIN_LEN)
    const longerWords = candidates.filter(({ word }) => word.length > MIN_LEN)

    // Short words first, longer ones once that feels steady.
    const shortPicks = shuffle(shortWords, seed + 11).slice(0, 2)
    const longPool = longerWords.length > 0 ? longerWords : candidates
    const longPicks = shuffle(longPool, seed + 13).slice(0, ROUNDS - shortPicks.length)

    return [...shortPicks, ...longPicks].map(({ picture, word }) => ({ word, thumbnail: picture.thumbnail }))
  }, [content.ready, content.pictures, content.words, content.letters, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setLetterIndex(0); setSteps(null) }, [game.round, rounds])

  useEffect(() => {
    if (!current || game.solved) return
    const letter = current.word[letterIndex]
    const exerciseId = letter ? letterIds[letter] : undefined
    if (!exerciseId) return
    let cancelled = false
    void loadExercise(exerciseId)
      .then((exercise) => { if (!cancelled) setSteps(exercise.steps) })
      .catch(() => { if (!cancelled) setSteps([]) })
    return () => { cancelled = true }
  }, [current, letterIndex, letterIds, game.solved])

  function letterTraced() {
    if (!current) return
    if (letterIndex + 1 >= current.word.length) {
      playSound('tap')
      void game.solve()
      speakWord(current.word.toLowerCase(), language, 0.8)
    } else {
      playSound('tap')
      setLetterIndex((i) => i + 1)
    }
  }

  const currentLetterId = current ? letterIds[current.word[letterIndex]] : undefined

  return (
    <GameShell
      title={t('play.writeWithMe')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 41); game.restart() }}
    >
      {current ? (
        <div className="game-board write-with-me">
          <div className="write-with-me__progress">
            {current.word.split('').map((letter, i) => (
              <span
                key={i}
                className={`write-with-me__letter ${
                  game.solved || i < letterIndex ? 'write-with-me__letter--done' : ''
                } ${i === letterIndex && !game.solved ? 'write-with-me__letter--current' : ''}`}
              >
                {game.solved || i <= letterIndex ? letter : ''}
              </span>
            ))}
          </div>

          {game.solved ? (
            <div className="write-with-me__reveal">
              <div className="write-with-me__picture card">
                <img src={assetUrl(current.thumbnail)} alt="" />
              </div>
              <button
                className="btn btn--hero"
                onClick={() => speakWord(current.word.toLowerCase(), language, 0.8)}
              >
                <Icon name="sound" size={22} color="var(--c-text)" width={2.2} />
                {t('play.writeWithMeSay')}
              </button>
            </div>
          ) : (
            <div className="canvas-card card write-with-me__stage">
              {steps && steps.length > 0 && currentLetterId ? (
                <GuideLayer exerciseId={currentLetterId} steps={steps} currentIndex={steps.length - 1} showTrace />
              ) : null}
              <div className="canvas-holder">
                <DrawingCanvas
                  key={`${game.round}-${letterIndex}`}
                  tool="PENCIL"
                  color={color}
                  onFirstAction={letterTraced}
                />
              </div>
            </div>
          )}

          {game.solved ? (
            <button className="btn btn--primary btn--hero game-next" onClick={game.next}>
              <span className="game-next__fill" />
              <span className="game-next__label">
                {t('play.next')}
                <Icon name="arrow" size={24} color="#fff" width={2.6} />
              </span>
            </button>
          ) : (
            <div className="muted game-hint">{t('play.writeWithMeHint')}</div>
          )}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
