import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '../app/store'
import { playSound } from '../audio/sounds'

/** Long enough to enjoy being right, short enough not to lose the thread. */
export const NEXT_DELAY = 3000
export const STARS_PER_ROUND = 2

/**
 * The bit every game repeats: which round we are on, whether it is solved,
 * stars, the celebration, and moving on by itself after a correct answer.
 */
export function useGameSession<T>(rounds: T[], starsPerRound = STARS_PER_ROUND) {
  const awardStars = useAppStore((s) => s.awardStars)

  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)

  // A fresh set of rounds means a fresh game. Keyed by length and identity so
  // a re-created array with the same content does not restart mid-game.
  useEffect(() => {
    setRound(0)
    setSolved(false)
    setEarned(0)
    setFinished(false)
  }, [rounds])

  const next = useCallback(() => {
    setSolved(false)
    setRound((prev) => {
      if (prev + 1 < rounds.length) return prev + 1
      setFinished(true)
      return prev
    })
  }, [rounds.length])

  const solve = useCallback(async () => {
    if (solved) return
    playSound('correct')
    setSolved(true)
    setEarned((value) => value + starsPerRound)
    await awardStars(starsPerRound)
  }, [awardStars, solved, starsPerRound])

  /** Never a buzzer: a wrong try is a quiet nudge, nothing is taken away. */
  const miss = useCallback(() => {
    playSound('soft')
  }, [])

  useEffect(() => {
    if (!solved) return
    const timer = window.setTimeout(next, NEXT_DELAY)
    return () => window.clearTimeout(timer)
  }, [solved, next])

  useEffect(() => {
    if (finished) playSound('fanfare')
  }, [finished])

  const restart = useCallback(() => {
    setRound(0)
    setSolved(false)
    setEarned(0)
    setFinished(false)
  }, [])

  return {
    round,
    current: rounds[round] as T | undefined,
    total: rounds.length,
    solved,
    earned,
    finished,
    solve,
    miss,
    next,
    restart,
  }
}
