import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GameShell } from '../../games/GameShell'
import { useGameSession } from '../../games/useGameSession'
import { useGameContent } from '../../games/useGameContent'
import { randomSeed } from '../../games/shuffle'
import { difficultyTier, type DifficultyTier } from '../../games/difficultyTier'
import { FIND_IT_ITEMS, FIND_IT_COLOR_HEX } from '../../games/findItAttributes'
import { buildFindItRound } from '../../games/findItRounds'
import { assetUrl, type WordLanguage } from '../../exercise/ExerciseLoader'
import { Icon } from '../../components/Icon'
import '../../styles/ui.css'
import '../../games/GameShell.css'
import './FindItPage.css'

const ROUNDS = 5
// Word only, then word + color, then word + color + size.
const TIERS: DifficultyTier<0 | 1 | 2>[] = [{ from: 0, value: 0 }, { from: 2, value: 1 }, { from: 4, value: 2 }]

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  targetId: string
  word: string
  color: (typeof FIND_IT_ITEMS)[number]['color']
  size: (typeof FIND_IT_ITEMS)[number]['size']
  tier: 0 | 1 | 2
  choices: { id: string; thumbnail: string }[]
}

/** Word recognition escalating into attribute reading: first just the
 * picture, then "this color", then "this color and this size". */
export function FindItPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage =
    requested === 'en' || requested === 'es' || requested === 'uk' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<string[]>([])

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready) return []
    const pool = FIND_IT_ITEMS
      .map((item) => {
        const picture = content.pictures.find((p) => p.id === item.id)
        const word = picture ? content.words[picture.id] : undefined
        return picture && word ? { ...item, picture, word: word.toUpperCase() } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    if (pool.length < 4) return []

    const out: Round[] = []
    for (let i = 0; i < ROUNDS; i += 1) {
      const tier = difficultyTier(i, TIERS)
      const round = buildFindItRound(pool, seed + i * 97, tier)
      if (!round) continue
      const target = pool.find((item) => item.id === round.target.id)
      if (!target) continue
      out.push({
        targetId: target.id,
        word: target.word,
        color: target.color,
        size: target.size,
        tier,
        choices: round.choices.map((c) => {
          const picture = pool.find((item) => item.id === c.id)?.picture
          return { id: c.id, thumbnail: picture?.thumbnail ?? '' }
        }),
      })
    }
    return out
  }, [content.ready, content.pictures, content.words, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setWrong([]) }, [game.round, rounds])

  function pick(id: string) {
    if (!current || game.solved || wrong.includes(id)) return
    if (id === current.targetId) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, id])
  }

  return (
    <GameShell
      title={t('play.findIt')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 89); game.restart() }}
    >
      {current ? (
        <div className="game-board find-it">
          <div className="muted game-hint">
            {t(current.tier === 0 ? 'play.findItHint' : current.tier === 1 ? 'play.findItHintColor' : 'play.findItHintColorSize')}
          </div>

          <div className="find-it__target card">
            <div className="find-it__word">{current.word}</div>
            {current.tier >= 1 ? (
              <span
                className="find-it__swatch"
                style={{ background: FIND_IT_COLOR_HEX[current.color] }}
                aria-hidden="true"
              />
            ) : null}
            {current.tier >= 2 ? (
              <span className="find-it__size-badge">
                {t(current.size === 'small' ? 'play.findItSmall' : 'play.findItBig')}
              </span>
            ) : null}
          </div>

          <div className="find-it__choices">
            {current.choices.map((choice) => {
              const isAnswer = choice.id === current.targetId
              const state = game.solved && isAnswer ? 'ok' : wrong.includes(choice.id) ? 'off' : ''
              return (
                <button
                  key={choice.id}
                  className={`find-it__card ${state ? `find-it__card--${state}` : ''}`}
                  onClick={() => pick(choice.id)}
                  disabled={wrong.includes(choice.id) || game.solved}
                >
                  <img src={assetUrl(choice.thumbnail)} alt="" />
                </button>
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
          ) : null}
        </div>
      ) : (
        <div className="subtitle">{t('play.loading')}</div>
      )}
    </GameShell>
  )
}
