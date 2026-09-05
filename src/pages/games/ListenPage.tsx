import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl, type WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { playSound } from '../../audio/sounds'
import { speakWord, stopSpeaking } from '../../audio/speech'
import { Icon } from '../../components/Icon'
import './ListenPage.css'

const ROUNDS = 5
const MAX_WORD = 7

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  word: string
  thumbnail: string
  tiles: string[]
}

/** Hear the word, then build it. The picture is the safety net, not the prompt. */
export function ListenPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(randomSeed)
  const [typed, setTyped] = useState<string[]>([])
  const [used, setUsed] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)

  // Only used for the "this device cannot speak" hint below — speakWord()
  // already guards every real call itself.
  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window
  const say = useCallback((word: string) => speakWord(word.toLowerCase(), language, 0.8), [language])

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready) return []
    const candidates = content.pictures
      .map((picture) => ({ picture, word: (content.words[picture.id] ?? '').toUpperCase() }))
      .filter(({ word }) => /^[^\s·]+$/u.test(word) && word.length >= 3 && word.length <= MAX_WORD)

    return shuffle(candidates, seed).slice(0, ROUNDS).map(({ picture, word }, i) => {
      const spare = shuffle(
        content.letters.filter((letter) => !word.includes(letter)),
        seed + i * 31,
      ).slice(0, 3)
      return {
        word,
        thumbnail: picture.thumbnail,
        tiles: shuffle([...word.split(''), ...spare], seed + i * 47),
      }
    })
  }, [content.ready, content.pictures, content.words, content.letters, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => {
    setTyped([])
    setUsed([])
    setRevealed(false)
    if (current) say(current.word)
  }, [current, say])

  // Leaving the screen mid-word should not follow the child to the next one.
  useEffect(() => stopSpeaking, [])

  const solved = game.solved
  const solve = game.solve
  const gameOver = game.finished
  useEffect(() => {
    if (!current || solved || gameOver) return
    if (typed.join('') === current.word) void solve()
  }, [typed, current, solved, solve, gameOver])

  /** Same reason as the missing-letters game: read the position from state. */
  function pick(letter: string, index: number) {
    if (!current || game.solved) return

    setTyped((prev) => {
      if (used.includes(index)) return prev
      if (current.word[prev.length] !== letter) { game.miss(); return prev }
      playSound('tap')
      setUsed((usedNow) => (usedNow.includes(index) ? usedNow : [...usedNow, index]))
      return [...prev, letter]
    })
  }

  return (
    <GameShell
      title={t('play.listen')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 67); game.restart() }}
    >
      {current ? (
        <div className="game-board listen">
          {!speech ? (
            <div className="muted game-hint">{t('play.listenNoVoice')}</div>
          ) : null}

          <button className="listen__speaker" onClick={() => say(current.word)}>
            <Icon name="sound" size={44} color="#fff" width={2.2} />
          </button>

          <div className="listen__slots">
            {current.word.split('').map((_letter, index) => (
              <span key={index} className={`listen__slot ${typed[index] ? 'listen__slot--filled' : ''}`}>
                {typed[index] ?? ''}
              </span>
            ))}
          </div>

          {game.solved || revealed ? (
            <div className="listen__picture card">
              <img src={assetUrl(current.thumbnail)} alt="" />
            </div>
          ) : (
            <button className="btn listen__peek" onClick={() => { playSound('tap'); setRevealed(true) }}>
              <Icon name="gallery" size={22} color="var(--c-text-soft)" width={2.2} />
              {t('play.listenPeek')}
            </button>
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
            <div className="listen__tiles">
              {current.tiles.map((letter, index) => (
                <button
                  key={`${letter}-${index}`}
                  className={`tile-letter ${used.includes(index) ? 'tile-letter--used' : ''}`}
                  onClick={() => pick(letter, index)}
                  disabled={used.includes(index)}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
