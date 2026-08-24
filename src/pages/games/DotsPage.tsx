import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { playSound } from '../../audio/sounds'
import { Icon } from '../../components/Icon'
import './DotsPage.css'

const ROUNDS = 3

interface Shape {
  nameKey: string
  /** Outline points in drawing order, on a 100x100 field. */
  points: Array<[number, number]>
}

const SHAPES: Shape[] = [
  {
    nameKey: 'play.dotsHouse',
    points: [[20, 55], [50, 25], [80, 55], [80, 86], [58, 86], [58, 64], [42, 64], [42, 86], [20, 86]],
  },
  {
    nameKey: 'play.dotsStar',
    points: [[50, 10], [61, 38], [90, 40], [67, 58], [75, 88], [50, 71], [25, 88], [33, 58], [10, 40], [39, 38]],
  },
  {
    nameKey: 'play.dotsFish',
    points: [[16, 50], [42, 26], [70, 34], [88, 18], [88, 82], [70, 66], [42, 74]],
  },
  {
    nameKey: 'play.dotsTree',
    points: [[50, 10], [72, 40], [61, 40], [82, 68], [57, 68], [57, 90], [43, 90], [43, 68], [18, 68], [39, 40], [28, 40]],
  },
  {
    nameKey: 'play.dotsBoat',
    points: [[12, 62], [88, 62], [74, 88], [26, 88]],
  },
  {
    nameKey: 'play.dotsHeart',
    points: [[50, 30], [66, 14], [86, 26], [84, 50], [50, 88], [16, 50], [14, 26], [34, 14]],
  },
]


/** Numbers in order, drawing a picture as they go — counting with a payoff. */
export function DotsPage() {
  const { t } = useTranslation()
  const [seed, setSeed] = useState(randomSeed)

  const rounds = useMemo(() => shuffle(SHAPES, seed).slice(0, ROUNDS), [seed])
  const game = useGameSession(rounds)
  const shape = game.current

  const [joined, setJoined] = useState(1)

  // Dot 1 is where the pencil starts, so a fresh shape starts at one.
  useEffect(() => { setJoined(1) }, [game.round, rounds])

  function tap(index: number) {
    if (!shape || game.solved) return
    if (index !== joined) { game.miss(); return }

    const next = joined + 1
    setJoined(next)
    if (next >= shape.points.length) void game.solve()
    else playSound('tap')
  }

  // Only the dots already joined are on the line — drawing one segment ahead
  // gave the next dot away.
  const line = shape
    ? shape.points.slice(0, joined).map(([x, y]) => `${x},${y}`).join(' ')
    : ''

  return (
    <GameShell
      title={t('play.dots')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 91); game.restart() }}
    >
      {shape ? (
        <div className="game-board">
          <div className="muted game-hint">
            {game.solved ? t(shape.nameKey) : t('play.dotsHint', { number: joined + 1 })}
          </div>

          <div className="dots__board card">
            <svg viewBox="-6 -6 112 112" className="dots__svg">
              {/* Drawn as one open line while it is being built, closed only
                  when the last dot joins back to the first. */}
              <polyline
                className="dots__line"
                points={game.solved ? `${line} ${shape.points[0][0]},${shape.points[0][1]}` : line}
                fill={game.solved ? 'var(--c-success-bg)' : 'none'}
              />
              {shape.points.map(([x, y], i) => (
                <g key={i} className={`dots__dot ${i < joined ? 'dots__dot--done' : ''}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={5.5}
                    onClick={() => tap(i)}
                    onPointerDown={() => tap(i)}
                  />
                  <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central">{i + 1}</text>
                </g>
              ))}
            </svg>
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
