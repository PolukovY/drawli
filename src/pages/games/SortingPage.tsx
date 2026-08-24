import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { assetUrl } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { Icon } from '../../components/Icon'
import './SortingPage.css'

const ROUNDS = 4
const PER_BASKET = 3

interface Item {
  id: string
  thumbnail: string
  category: string
}

interface Round {
  baskets: string[]
  items: Item[]
}

/** Two baskets, one pile: sorting is naming what things have in common. */
export function SortingPage() {
  const { t } = useTranslation()
  const content = useGameContent('uk')
  const [seed, setSeed] = useState(randomSeed)
  const [sorted, setSorted] = useState<Record<string, string>>({})

  const rounds = useMemo<Round[]>(() => {
    const byCategory = new Map<string, Item[]>()
    for (const picture of content.pictures) {
      const list = byCategory.get(picture.category) ?? []
      list.push({ id: picture.id, thumbnail: picture.thumbnail, category: picture.category })
      byCategory.set(picture.category, list)
    }
    const usable = [...byCategory.entries()].filter(([, list]) => list.length >= PER_BASKET)
    if (usable.length < 2) return []

    return Array.from({ length: ROUNDS }, (_, i) => {
      const [first, second] = shuffle(usable, seed + i * 13).slice(0, 2)
      const items = [
        ...shuffle(first[1], seed + i * 17).slice(0, PER_BASKET),
        ...shuffle(second[1], seed + i * 19).slice(0, PER_BASKET),
      ]
      return {
        baskets: shuffle([first[0], second[0]], seed + i * 23),
        items: shuffle(items, seed + i * 29),
      }
    })
  }, [content.pictures, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => { setSorted({}) }, [game.round, rounds])

  const [held, setHeld] = useState<Item | null>(null)
  useEffect(() => { setHeld(null) }, [game.round, rounds])

  function drop(basket: string) {
    if (!current || !held || game.solved) return
    if (held.category !== basket) { game.miss(); return }

    const next = { ...sorted, [held.id]: basket }
    setSorted(next)
    setHeld(null)
    if (Object.keys(next).length === current.items.length) void game.solve()
  }

  const categoryTitle = (id: string) => {
    const category = content.categories.find((c) => c.id === id)
    return category ? t(category.titleKey) : id
  }

  return (
    <GameShell
      title={t('play.sorting')}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 61); setSorted({}); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="muted game-hint">
            {held ? t('play.sortingDrop') : t('play.sortingHint')}
          </div>

          <div className="sort__pile card">
            {current.items.filter((item) => !sorted[item.id]).map((item) => (
              <button
                key={item.id}
                className={`sort__item ${held?.id === item.id ? 'sort__item--held' : ''}`}
                onClick={() => setHeld(item)}
                disabled={game.solved}
              >
                <img src={assetUrl(item.thumbnail)} alt="" />
              </button>
            ))}
            {current.items.every((item) => sorted[item.id]) ? (
              <span className="muted sort__empty">{t('play.sortingDone')}</span>
            ) : null}
          </div>

          <div className="sort__baskets">
            {current.baskets.map((basket) => (
              <button
                key={basket}
                className={`sort__basket ${held ? 'sort__basket--ready' : ''}`}
                onClick={() => drop(basket)}
                disabled={!held || game.solved}
              >
                <span className="sort__basket-title">{categoryTitle(basket)}</span>
                <span className="sort__basket-items">
                  {current.items
                    .filter((item) => sorted[item.id] === basket)
                    .map((item) => <img key={item.id} src={assetUrl(item.thumbnail)} alt="" />)}
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
