import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { createRoller, randomSeed, shuffle } from '../../games/shuffle'
import { difficultyTier } from '../../games/difficultyTier'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import './FeedMonsterPage.css'

const ROUNDS = 5
const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑']

interface Round {
  start: number
  addend: number
  sum: number
  fruit: string
}

/**
 * Addition as a physical act before it is a fact: the monster already has a
 * few pieces of fruit, the child taps to give it more one at a time, and only
 * once the giving is done does the equation appear.
 */
export function FeedMonsterPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)
  const [given, setGiven] = useState(0)

  const rounds = useMemo<Round[]>(() => {
    const out: Round[] = []
    const roll = createRoller(seed)

    for (let i = 0; i < ROUNDS; i += 1) {
      // Sums to 5 first, then to 9, same shape as Count/CountThings.
      const ceiling = difficultyTier(i, [{ from: 0, value: 5 }, { from: 2, value: 9 }])
      const sum = 2 + roll(ceiling - 1)
      const start = 1 + roll(sum - 1)
      const addend = sum - start
      const fruit = shuffle(FRUIT, seed + i * 13)[0]
      out.push({ start, addend, sum, fruit })
    }
    return out
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setGiven(0) }, [game.round, rounds])

  function giveOne() {
    if (!current || game.solved || given >= current.addend) return
    playSound('tap')
    const next = given + 1
    setGiven(next)
    if (next >= current.addend) void game.solve()
  }

  return (
    <GameShell
      title={t('play.feedMonster')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 59); game.restart() }}
    >
      {current ? (
        <div className="game-board feed-monster">
          <div className="feed-monster__monster">{game.solved ? '🤩' : '👹'}</div>

          <div className="feed-monster__plate card">
            {Array.from({ length: current.start + given }, (_, i) => (
              <span key={i} className="feed-monster__fruit">{current.fruit}</span>
            ))}
          </div>

          {game.solved ? (
            <div className="feed-monster__equation">
              {current.start} + {current.addend} = {current.sum}
            </div>
          ) : (
            <>
              <div className="muted game-hint">
                {t('play.feedMonsterHint', { count: current.addend })}
              </div>
              <button className="btn btn--primary btn--hero" onClick={giveOne}>
                <Icon name="plus" size={22} color="#fff" width={2.6} />
                {t('play.feedMonsterGive')}
              </button>
              <div className="muted feed-monster__progress">{given} / {current.addend}</div>
            </>
          )}

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
