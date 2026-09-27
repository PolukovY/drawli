import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { useGameContent } from '../../games/useGameContent'
import { randomSeed, shuffle } from '../../games/shuffle'
import { DrawingCanvas } from '../../components/DrawingCanvas'
import { GuideLayer } from '../../components/GuideLayer'
import { assetUrl, loadExercise, loadIndex, parseWordLanguage, WORD_LANGUAGE_LABELS, type WordLanguage } from '../../exercise/ExerciseLoader'
import type { ExerciseStep } from '../../exercise/Exercise'
import { useAppStore } from '../../app/store'
import { speakWord } from '../../audio/speech'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './WriteWithMePage.css'

const ROUNDS = 5

/**
 * Russian has no tracing exercises of its own, but every Cyrillic letter it
 * shares with Ukrainian is drawn the same way; words that need Ё, Ы, Э or Ъ
 * simply never come up, since those letters have no guide.
 */
const GUIDE_SOURCE: Partial<Record<WordLanguage, WordLanguage>> = { ru: 'uk' }
const MIN_LEN = 3
const MAX_LEN = 6

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
  const language = parseWordLanguage(requested)

  const content = useGameContent(language)
  const color = useAppStore((s) => s.color)
  const [seed, setSeed] = useState(randomSeed)
  const [letterIndex, setLetterIndex] = useState(0)
  const [steps, setSteps] = useState<ExerciseStep[] | null>(null)
  // Letters are written in stages (К: the upright first, then both arms),
  // walked one at a time like the tracing screen, so the guide shows what to
  // draw now and in what order — not the whole letter with most of it marked
  // as already done. Next unlocks once this stage has a stroke of its own.
  const [stepIndex, setStepIndex] = useState(0)
  const [strokes, setStrokes] = useState(0)
  const [stepBaseline, setStepBaseline] = useState(0)
  // Bumped to remount the canvas: a clean sheet for the same letter.
  const [attempt, setAttempt] = useState(0)
  // Glyph -> exercise id: mostly `${language}-${letter.toLowerCase()}`, but
  // not always (Spanish Ñ is `es-enye`), so this is read from the real data.
  const [letterIds, setLetterIds] = useState<Record<string, string>>({})

  useEffect(() => {
    void loadIndex()
      .then((index) => {
        const map: Record<string, string> = {}
        for (const e of index.exercises) {
          if (e.category === `letters_${GUIDE_SOURCE[language] ?? language}` && e.glyph) map[e.glyph] = e.id
        }
        setLetterIds(map)
      })
      .catch(() => undefined)
  }, [language])

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready || Object.keys(letterIds).length === 0) return []
    const candidates = content.pictures
      .map((picture) => ({ picture, word: (content.words[picture.id] ?? '').toUpperCase() }))
      .filter(({ word }) => /^[^\s·]+$/u.test(word) && word.length >= MIN_LEN && word.length <= MAX_LEN)
      // Only words whose every letter has a guide to trace.
      .filter(({ word }) => [...word].every((letter) => letter in letterIds))

    const shortWords = candidates.filter(({ word }) => word.length === MIN_LEN)
    const longerWords = candidates.filter(({ word }) => word.length > MIN_LEN)

    // Short words first, longer ones once that feels steady.
    const shortPicks = shuffle(shortWords, seed + 11).slice(0, 2)
    const longPool = longerWords.length > 0 ? longerWords : candidates
    const longPicks = shuffle(longPool, seed + 13).slice(0, ROUNDS - shortPicks.length)

    return [...shortPicks, ...longPicks].map(({ picture, word }) => ({ word, thumbnail: picture.thumbnail }))
  }, [content.ready, content.pictures, content.words, letterIds, seed])

  const game = useGameSession(rounds)
  const current = game.current

  function resetLetter() {
    setStepIndex(0)
    setStrokes(0)
    setStepBaseline(0)
  }

  useEffect(() => { setLetterIndex(0); setSteps(null); resetLetter() }, [game.round, rounds])

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

  const stepCount = steps?.length ?? 0
  const isLastStep = stepIndex >= stepCount - 1
  const isLastLetter = current ? letterIndex + 1 >= current.word.length : false
  const canProceed = steps !== null && strokes > stepBaseline

  function next() {
    if (!current) return
    playSound('tap')
    if (!isLastStep) {
      setStepBaseline(strokes)
      setStepIndex((i) => i + 1)
    } else if (!isLastLetter) {
      setSteps(null)
      resetLetter()
      setLetterIndex((i) => i + 1)
    } else {
      void game.solve()
      speakWord(current.word.toLowerCase(), language, 0.8)
    }
  }

  function clearLetter() {
    setAttempt((a) => a + 1)
    resetLetter()
  }

  const currentLetterId = current ? letterIds[current.word[letterIndex]] : undefined

  return (
    <GameShell
      title={t('play.writeWithMe')}
      language={WORD_LANGUAGE_LABELS[language]}
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
                <GuideLayer exerciseId={currentLetterId} steps={steps} currentIndex={stepIndex} showTrace />
              ) : null}
              <div className="canvas-holder">
                <DrawingCanvas
                  key={`${game.round}-${letterIndex}-${attempt}`}
                  tool="PENCIL"
                  color={color}
                  onActionCommitted={(actions) => setStrokes(actions.length)}
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
            <div className="write-with-me__actions">
              <div className="muted game-hint">{t('play.writeWithMeHint')}</div>
              <button className="btn btn--hero" onClick={clearLetter} disabled={strokes === 0}>
                <Icon name="eraser" size={24} color="var(--c-text-soft)" width={2.4} />
                {t('drawing.tool.clear')}
              </button>
              <button className="btn btn--primary btn--hero" onClick={next} disabled={!canProceed}>
                {t(isLastLetter && isLastStep ? 'drawing.done' : 'drawing.next')}
                <Icon name={isLastLetter && isLastStep ? 'check' : 'arrow'} size={24} color="#fff" width={2.6} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
