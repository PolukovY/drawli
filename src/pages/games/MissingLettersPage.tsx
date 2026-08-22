import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl, type WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { shuffle } from '../../games/shuffle'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import './MissingLettersPage.css'

const ROUNDS = 5
const MAX_WORD = 8

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  word: string
  thumbnail: string
  /** Positions punched out of the word, left to right. */
  gaps: number[]
  choices: string[]
}

/** A word with holes in it: the picture says which word, the child restores it. */
export function MissingLettersPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage =
    requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(1)
  const [filled, setFilled] = useState<Record<number, string>>({})
  const [used, setUsed] = useState<number[]>([])

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready) return []
    const candidates = content.pictures
      .map((picture) => ({ picture, word: (content.words[picture.id] ?? '').toUpperCase() }))
      .filter(({ word }) => /^[^\s·]+$/u.test(word) && word.length >= 4 && word.length <= MAX_WORD)

    return shuffle(candidates, seed).slice(0, ROUNDS).map(({ picture, word }, i) => {
      // Two holes for short words, three once there is room to guess from.
      const holes = word.length >= 6 ? 3 : 2
      const positions = word.split('').map((_, index) => index)
      const gaps = shuffle(positions, seed + i * 17).slice(0, holes).sort((a, b) => a - b)
      const missing = gaps.map((index) => word[index])
      const spare = shuffle(
        content.letters.filter((letter) => !missing.includes(letter)),
        seed + i * 29,
      ).slice(0, 3)
      return {
        word,
        thumbnail: picture.thumbnail,
        gaps,
        choices: shuffle([...missing, ...spare], seed + i * 41),
      }
    })
  }, [content.ready, content.pictures, content.words, content.letters, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => {
    setFilled({})
    setUsed([])
  }, [game.round, rounds])

  // The round is won once every hole holds its own letter.
  const solved = game.solved
  const solve = game.solve
  useEffect(() => {
    if (!current || solved) return
    const done = current.gaps.length > 0 && current.gaps.every((gap) => filled[gap] === current.word[gap])
    if (done) void solve()
  }, [filled, current, solved, solve])

  function pick(letter: string, choiceIndex: number) {
    if (!current || game.solved || used.includes(choiceIndex)) return

    const gap = current.gaps.find((index) => !filled[index])
    if (gap === undefined) return

    if (current.word[gap] !== letter) {
      game.miss()
      return
    }

    playSound('tap')
    setFilled((prev) => ({ ...prev, [gap]: letter }))
    setUsed((prev) => [...prev, choiceIndex])
  }

  return (
    <GameShell
      title={t('play.missing')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 53); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="missing__picture card">
            <img src={assetUrl(current.thumbnail)} alt="" />
          </div>

          <div className="missing__word">
            {current.word.split('').map((letter, index) => {
              const isGap = current.gaps.includes(index)
              if (!isGap) return <span key={index} className="missing__letter">{letter}</span>
              return (
                <span
                  key={index}
                  className={`missing__gap ${filled[index] ? 'missing__gap--filled' : ''}`}
                >
                  {filled[index] ?? ''}
                </span>
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
          ) : (
            <>
              <div className="missing__choices">
                {current.choices.map((letter, index) => (
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
              <div className="muted game-hint">{t('play.missingHint')}</div>
            </>
          )}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
