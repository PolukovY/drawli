import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assetUrl, type WordLanguage } from '../../exercise/ExerciseLoader'
import { GameShell } from '../../games/GameShell'
import { useGameContent } from '../../games/useGameContent'
import { useGameSession } from '../../games/useGameSession'
import { randomSeed, shuffle } from '../../games/shuffle'
import { findSoundPosition, type SoundPosition } from '../../games/soundPosition'
import { splitIntoSyllables } from '../../games/syllableSplit'
import { playSound } from '../../audio/sounds'
import { speakWord, stopSpeaking } from '../../audio/speech'
import { Icon } from '../../components/Icon'
import './SyllableReadingPage.css'
import './SoundPositionPage.css'

const ROUNDS_PER_GROUP = 2
// Easiest first: a sound at the very start of a word is the one most kids
// can point to; the end comes next; a sound buried in the middle is hardest.
const GROUP_ORDER: SoundPosition[] = ['start', 'end', 'middle']
const ZONES: SoundPosition[] = ['start', 'middle', 'end']

const LANGUAGE_LABELS: Record<WordLanguage, string> = {
  uk: 'Українська', en: 'English', es: 'Español',
}

interface Round {
  letter: string
  word: string
  thumbnail: string
  position: SoundPosition
  parts: string[]
}

/** A syllable, with every occurrence of the target letter picked out. */
function HighlightedPart({ text, letter }: { text: string; letter: string }) {
  const upperLetter = letter.toUpperCase()
  const nodes: ReactNode[] = []
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    nodes.push(ch.toUpperCase() === upperLetter ? <mark key={i} className="soundpos__hit">{ch}</mark> : ch)
  }
  return <>{nodes}</>
}

/**
 * Listen for a letter's sound and say whether it opens the word, closes it,
 * or sits somewhere in between. A wrong guess reveals the word broken into
 * syllables — the same scaffold the syllable-reading game uses — so a child
 * stuck on "where" can sound the word out and try again instead of guessing.
 */
export function SoundPositionPage() {
  const [search] = useSearchParams()
  const { t } = useTranslation()
  const requested = search.get('lang')
  const language: WordLanguage = requested === 'en' || requested === 'es' ? requested : 'uk'

  const content = useGameContent(language)
  const [seed, setSeed] = useState(randomSeed)
  const [wrong, setWrong] = useState<SoundPosition[]>([])
  const [revealed, setRevealed] = useState(false)

  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window
  const say = useCallback((word: string) => speakWord(word.toLowerCase(), language, 0.75), [language])
  const sayPart = useCallback((part: string) => speakWord(part.toLowerCase(), language, 0.55), [language])

  const rounds = useMemo<Round[]>(() => {
    if (!content.ready || content.letters.length === 0) return []

    const words = content.pictures
      .map((picture) => ({ picture, word: content.words[picture.id] ?? '' }))
      .filter(({ word }) => /^[^\s·]{3,12}$/u.test(word))

    const byPosition: Record<SoundPosition, { picture: (typeof words)[number]['picture']; word: string; letter: string }[]> = {
      start: [], middle: [], end: [],
    }
    for (const { picture, word } of words) {
      for (const letter of content.letters) {
        const position = findSoundPosition(word, letter)
        if (position) byPosition[position].push({ picture, word, letter })
      }
    }

    const used = new Set<string>()
    const selected: Round[] = []
    GROUP_ORDER.forEach((position, groupIndex) => {
      const pool = shuffle(byPosition[position], seed + groupIndex * 101)
      for (const item of pool) {
        if (selected.filter((r) => r.position === position).length >= ROUNDS_PER_GROUP) break
        if (used.has(item.picture.id)) continue
        used.add(item.picture.id)
        selected.push({
          letter: item.letter,
          word: item.word,
          thumbnail: item.picture.thumbnail,
          position,
          parts: splitIntoSyllables(item.word, language),
        })
      }
    })
    return selected
  }, [content.ready, content.pictures, content.words, content.letters, language, seed])

  const game = useGameSession(rounds)
  const current = game.current

  useEffect(() => {
    setWrong([])
    setRevealed(false)
    if (current) say(current.word)
  }, [current, say])

  // Leaving the screen mid-word should not follow the child to the next one.
  useEffect(() => stopSpeaking, [])

  function pick(position: SoundPosition) {
    if (!current || game.solved || wrong.includes(position)) return
    if (position === current.position) { void game.solve(); return }
    game.miss()
    setWrong((prev) => [...prev, position])
    setRevealed(true)
  }

  return (
    <GameShell
      title={t('play.soundPosition')}
      language={LANGUAGE_LABELS[language]}
      round={game.round}
      total={game.total}
      solved={game.solved}
      finished={game.finished}
      earned={game.earned}
      onPlayAgain={() => { setSeed((s) => s + 97); game.restart() }}
    >
      {current ? (
        <div className="game-board">
          <div className="soundpos__prompt">
            <span className="muted game-hint">{t('play.soundPositionHint')}</span>
            <span className="game-prompt soundpos__letter">{current.letter}</span>
          </div>

          <div className="soundpos__card card">
            <img src={assetUrl(current.thumbnail)} alt="" />
            <button className="icon-btn" onClick={() => say(current.word)} disabled={!speech} aria-label={t('play.soundPositionListen')}>
              <Icon name="sound" size={24} color="var(--c-text)" width={2.2} />
            </button>
          </div>

          <div className="soundpos__zones">
            {ZONES.map((zone) => (
              <button
                key={zone}
                className={`soundpos__zone ${game.solved && zone === current.position ? 'soundpos__zone--ok' : ''} ${wrong.includes(zone) ? 'soundpos__zone--off' : ''}`}
                onClick={() => pick(zone)}
                disabled={game.solved || wrong.includes(zone)}
              >
                {t(`play.soundPosition${zone === 'start' ? 'Start' : zone === 'middle' ? 'Middle' : 'End'}`)}
              </button>
            ))}
          </div>

          {revealed ? (
            <div className="sylread__parts">
              {current.parts.map((part, index) => (
                <button key={index} className={`sylread__part ${index % 2 === 0 ? 'sylread__part--a' : 'sylread__part--b'}`} onClick={() => { playSound('tap'); sayPart(part) }}>
                  <HighlightedPart text={part} letter={current.letter} />
                </button>
              ))}
            </div>
          ) : null}

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
