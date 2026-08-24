import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './PatternsPage.css'

const ROUNDS = 5
const THINGS = ['🍎', '🍐', '🐞', '⭐', '🌸', '🐟', '🦋', '🍄', '🐝', '🍋', '🌙', '🍓']

interface Round {
  /** What the child sees, ending just before the answer. */
  shown: string[]
  answer: string
  choices: string[]
}

/**
 * Patterns before numbers: seeing that a run repeats is the same noticing that
 * later makes multiplication and rhythm obvious.
 */
export function PatternsPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])

  const rounds = useMemo<Round[]>(() => {
    const out: Round[] = []
    for (let i = 0; i < ROUNDS; i += 1) {
      const kinds = shuffle(THINGS, seed + i * 13)
      // ABAB first, then ABC and AAB — the run grows with the round.
      const unit = i < 2
        ? [kinds[0], kinds[1]]
        : i < 4
          ? [kinds[0], kinds[1], kinds[2]]
          : [kinds[0], kinds[0], kinds[1]]

      const length = unit.length * 2 + 1
      const full = Array.from({ length: length + 1 }, (_, n) => unit[n % unit.length])
      const answer = full[length]
      const others = shuffle(kinds.filter((thing) => thing !== answer), seed + i * 29).slice(0, 2)
      out.push({
        shown: full.slice(0, length),
        answer,
        choices: shuffle([answer, ...others], seed + i * 37),
      })
    }
    return out
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(thing: string) {
    if (!current || game.solved || wrong.includes(thing)) return
    if (thing === current.answer) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, thing])
  }

  return (
    <GameShell
      title={t('play.patterns')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 43); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.patternsHint')}</div>

          <div className="pattern__row card">
            {current.shown.map((thing, i) => (
              <span key={i} className="pattern__cell">{thing}</span>
            ))}
            <span className={`pattern__cell pattern__cell--blank ${game.solved ? 'pattern__cell--filled' : ''}`}>
              {game.solved ? current.answer : '?'}
            </span>
          </div>

          <div className="pattern__choices">
            {current.choices.map((thing) => (
              <button
                key={thing}
                className={`pattern__choice ${game.solved && thing === current.answer ? 'pattern__choice--ok' : ''} ${
                  wrong.includes(thing) ? 'pattern__choice--off' : ''
                }`}
                onClick={() => pick(thing)}
                disabled={game.solved || wrong.includes(thing)}
              >
                {thing}
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
