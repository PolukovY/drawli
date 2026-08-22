import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'

const ROUNDS = 5
const CHOICES = 4

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  letter: string
  choices: string[]
}

/** Match the letter: recognition before reading. */
export function FindLetterPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(1)
  const [wrong, setWrong] = useState<string[]>([])

  const rounds = useMemo<Round[]>(() => {
    if (content.letters.length < CHOICES) return []
    return shuffle(content.letters, seed).slice(0, ROUNDS).map((letter, i) => {
      const others = shuffle(content.letters.filter((l) => l !== letter), seed + i * 17)
        .slice(0, CHOICES - 1)
      return { letter, choices: shuffle([letter, ...others], seed + i * 29) }
    })
  }, [content.letters, seed])

  const game = useGameSession(rounds)
  const current = game.current

  function pick(letter: string) {
    if (!current || game.solved || wrong.includes(letter)) return
    if (letter === current.letter) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, letter])
  }

  return (
    <GameShell
      title={t('play.findLetter')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 71); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="game-prompt">{current.letter}</div>
          <div className="muted game-hint">{t('play.findLetterHint')}</div>

          <div className="game-choices">
            {current.choices.map((letter) => (
              <button
                key={letter}
                className={`choice-card ${
                  game.solved && letter === current.letter ? 'choice-card--ok' : ''
                } ${wrong.includes(letter) ? 'choice-card--off' : ''}`}
                onClick={() => pick(letter)}
                disabled={game.solved || wrong.includes(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          {game.solved ? (
            <button className="btn btn--primary btn--hero game-next" onClick={() => { setWrong([]); game.next() }}>
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
