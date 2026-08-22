import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './BiggerNumberPage.css'

const ROUNDS = 5

interface Round {
  pair: [number, number]
}

/** Which number is bigger — comparison, with nothing to read. */
export function BiggerNumberPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(1)
  const [wrong, setWrong] = useState<number[]>([])

  const rounds = useMemo<Round[]>(() => {
    const out: Round[] = []
    let value = seed
    for (let i = 0; i < ROUNDS; i += 1) {
      value = (value * 1103515245 + 12345) % 2147483648
      // Early rounds stay under ten, later ones go up to twenty.
      const ceiling = i < 2 ? 9 : 20
      const a = 1 + (value % ceiling)
      value = (value * 1103515245 + 12345) % 2147483648
      let b = 1 + (value % ceiling)
      if (b === a) b = a === ceiling ? a - 1 : a + 1
      out.push({ pair: shuffle([a, b], seed + i * 7) as [number, number] })
    }
    return out
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  // Wrong picks belong to the round they were made in; the auto-advance does
  // not run the Next handler, so clearing them there was not enough.
  useEffect(() => { setWrong([]) }, [game.round, rounds])
  const answer = current ? Math.max(...current.pair) : 0

  function pick(value: number) {
    if (!current || game.solved || wrong.includes(value)) return
    if (value === answer) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, value])
  }

  return (
    <GameShell
      title={t('play.bigger')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 61); setWrong([]); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">{t('play.biggerHint')}</div>

          <div className="bigger__pair">
            {current.pair.map((value) => (
              <button
                key={value}
                className={`bigger__card ${game.solved && value === answer ? 'bigger__card--ok' : ''} ${
                  wrong.includes(value) ? 'bigger__card--off' : ''
                }`}
                onClick={() => pick(value)}
                disabled={game.solved || wrong.includes(value)}
              >
                <span className="bigger__value">{value}</span>
                <span className="bigger__dots">
                  {Array.from({ length: value }, (_, i) => <i key={i} />)}
                </span>
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
