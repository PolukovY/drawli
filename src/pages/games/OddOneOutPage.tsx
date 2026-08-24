import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { assetUrl } from '../../exercise/ExerciseLoader'
import type { ExerciseSummary } from '../../exercise/Exercise'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'

const ROUNDS = 5
const CHOICES = 4

interface Round {
  odd: ExerciseSummary
  choices: ExerciseSummary[]
}

/** Three from one family and one stranger: sorting before words. */
export function OddOneOutPage() {
  const { t } = useTranslation()
  const content = useGameContent('uk')
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])

  const rounds = useMemo<Round[]>(() => {
    if (content.pictures.length === 0) return []

    const byCategory = new Map<string, ExerciseSummary[]>()
    for (const picture of content.pictures) {
      const list = byCategory.get(picture.category) ?? []
      list.push(picture)
      byCategory.set(picture.category, list)
    }

    const categories = shuffle([...byCategory.keys()], seed).filter(
      (id) => (byCategory.get(id)?.length ?? 0) >= CHOICES - 1,
    )

    return categories.slice(0, ROUNDS).map((category, i) => {
      const family = shuffle(byCategory.get(category) ?? [], seed + i * 11).slice(0, CHOICES - 1)
      const strangers = content.pictures.filter((p) => p.category !== category)
      const odd = shuffle(strangers, seed + i * 23)[0]
      return { odd, choices: shuffle([...family, odd], seed + i * 37) }
    })
  }, [content.pictures, seed])

  const game = useGameSession(rounds)
  const current = game.current

  // Wrong picks belong to the round they were made in; the auto-advance does
  // not run the Next handler, so clearing them there was not enough.
  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(id: string) {
    if (!current || game.solved || wrong.includes(id)) return
    if (id === current.odd.id) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, id])
  }

  return (
    <GameShell
      title={t('play.odd')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 43); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.oddHint')}</div>

          <div className="game-choices">
            {current.choices.map((choice) => (
              <button
                key={choice.id}
                className={`choice-card ${
                  game.solved && choice.id === current.odd.id ? 'choice-card--ok' : ''
                } ${wrong.includes(choice.id) ? 'choice-card--off' : ''}`}
                onClick={() => pick(choice.id)}
                disabled={game.solved || wrong.includes(choice.id)}
              >
                <img src={assetUrl(choice.thumbnail)} alt="" />
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
