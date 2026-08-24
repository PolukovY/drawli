import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { assetUrl } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './CountPage.css'

const ROUNDS = 5
const MAX_COUNT = 9

interface Round {
  thumbnail: string
  count: number
  choices: number[]
}

/** Counting, the first maths a child does: how many are on the table? */
export function CountPage() {
  const { t } = useTranslation()
  const content = useGameContent('uk')
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<number[]>([])

  const rounds = useMemo<Round[]>(() => {
    if (content.allPictures.length === 0) return []
    return shuffle(content.allPictures, seed).slice(0, ROUNDS).map((picture, i) => {
      const count = 1 + ((seed * (i + 3) * 7 + i * 5) % MAX_COUNT)
      const others = shuffle(
        Array.from({ length: MAX_COUNT }, (_, n) => n + 1).filter((n) => n !== count),
        seed + i * 13,
      ).slice(0, 3)
      return { thumbnail: picture.thumbnail, count, choices: shuffle([count, ...others], seed + i * 19) }
    })
  }, [content.allPictures, seed])

  const game = useGameSession(rounds)
  const current = game.current

  // Wrong picks belong to the round they were made in; the auto-advance does
  // not run the Next handler, so clearing them there was not enough.
  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(value: number) {
    if (!current || game.solved || wrong.includes(value)) return
    if (value === current.count) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, value])
  }

  return (
    <GameShell
      title={t('play.count')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 31); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="count__stage card">
            {Array.from({ length: current.count }, (_, i) => (
              <img key={i} src={assetUrl(current.thumbnail)} alt="" />
            ))}
          </div>

          <div className="muted game-hint">{t('play.countHint')}</div>

          <div className="count__choices">
            {current.choices.map((value) => (
              <button
                key={value}
                className={`count__number ${
                  game.solved && value === current.count ? 'count__number--ok' : ''
                } ${wrong.includes(value) ? 'count__number--off' : ''}`}
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
