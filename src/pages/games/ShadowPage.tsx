import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { assetUrl } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './ShadowPage.css'

const ROUNDS = 5
const CHOICES = 3

interface Round {
  thumbnail: string
  choices: string[]
}

/** Match a picture to its silhouette: shape alone, with the detail taken away. */
export function ShadowPage() {
  const { t } = useTranslation()
  const content = useGameContent('uk')
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])

  const rounds = useMemo<Round[]>(() => {
    if (content.pictures.length < CHOICES) return []
    return shuffle(content.pictures, seed).slice(0, ROUNDS).map((picture, i) => {
      const others = shuffle(
        content.pictures.filter((other) => other.id !== picture.id),
        seed + i * 23,
      ).slice(0, CHOICES - 1)
      return {
        thumbnail: picture.thumbnail,
        choices: shuffle([picture.thumbnail, ...others.map((o) => o.thumbnail)], seed + i * 31),
      }
    })
  }, [content.pictures, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(thumbnail: string) {
    if (!current || game.solved || wrong.includes(thumbnail)) return
    if (thumbnail === current.thumbnail) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, thumbnail])
  }

  return (
    <GameShell
      title={t('play.shadow')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 47); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.shadowHint')}</div>

          <div className="shadow__subject card">
            <img src={assetUrl(current.thumbnail)} alt="" />
          </div>

          <div className="shadow__choices">
            {current.choices.map((thumbnail) => (
              <button
                key={thumbnail}
                className={`shadow__choice ${
                  game.solved && thumbnail === current.thumbnail ? 'shadow__choice--ok' : ''
                } ${wrong.includes(thumbnail) ? 'shadow__choice--off' : ''}`}
                onClick={() => pick(thumbnail)}
                disabled={game.solved || wrong.includes(thumbnail)}
              >
                {/* The silhouette is the same drawing with everything but its
                    outline taken away — no second set of art to keep in step. */}
                <img className="shadow__silhouette" src={assetUrl(thumbnail)} alt="" />
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
