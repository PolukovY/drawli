import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import './WhatsGonePage.css'

const ROUNDS = 5
/** Long enough to look at every card once, short enough to still be a memory. */
const LOOK_MS = 4000
const THINGS = ['🍎', '🐞', '⭐', '🌸', '🐟', '🦋', '🍄', '🐝', '🍋', '🌙', '🍓', '🐢', '🚗', '🎈', '🐸', '🍌']

interface Round {
  shown: string[]
  gone: string
  choices: string[]
}

/** Look at the row, watch one thing disappear, and say which it was. */
export function WhatsGonePage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)
  const [looking, setLooking] = useState(true)
  const [wrong, setWrong] = useState<string[]>([])

  const rounds = useMemo<Round[]>(() => {
    const out: Round[] = []
    for (let i = 0; i < ROUNDS; i += 1) {
      // Four cards to start, six by the end.
      const count = i < 2 ? 4 : i < 4 ? 5 : 6
      const picked = shuffle(THINGS, seed + i * 19).slice(0, count)
      const gone = picked[(seed + i) % picked.length]
      const others = shuffle(picked.filter((thing) => thing !== gone), seed + i * 7).slice(0, 2)
      out.push({ shown: picked, gone, choices: shuffle([gone, ...others], seed + i * 11) })
    }
    return out
  }, [seed])

  const game = useGameSession(rounds)
  const current = game.current

  const startLooking = useCallback(() => {
    setLooking(true)
    setWrong([])
  }, [])

  useEffect(() => { startLooking() }, [game.round, rounds, startLooking])

  // The cards stay up on their own, then one quietly leaves.
  useEffect(() => {
    if (!looking || !current) return
    const timer = window.setTimeout(() => {
      setLooking(false)
      playSound('soft')
    }, LOOK_MS)
    return () => window.clearTimeout(timer)
  }, [looking, current])

  function pick(thing: string) {
    if (!current || looking || game.solved || wrong.includes(thing)) return
    if (thing === current.gone) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, thing])
  }

  const visible = current
    ? looking ? current.shown : current.shown.filter((thing) => thing !== current.gone)
    : []

  return (
    <GameShell
      title={t('play.whatsGone')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 53); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">
            {looking ? t('play.whatsGoneLook') : t('play.whatsGoneHint')}
          </div>

          <div className="gone__row card">
            {visible.map((thing, i) => (
              <span key={`${thing}-${i}`} className="gone__cell">{thing}</span>
            ))}
          </div>

          {looking ? (
            <button className="btn btn--hero" onClick={() => { setLooking(false); playSound('soft') }}>
              {t('play.whatsGoneReady')}
            </button>
          ) : (
            <div className="gone__choices">
              {current.choices.map((thing) => (
                <button
                  key={thing}
                  className={`gone__choice ${game.solved && thing === current.gone ? 'gone__choice--ok' : ''} ${
                    wrong.includes(thing) ? 'gone__choice--off' : ''
                  }`}
                  onClick={() => pick(thing)}
                  disabled={game.solved || wrong.includes(thing)}
                >
                  {thing}
                </button>
              ))}
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
          ) : null}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
