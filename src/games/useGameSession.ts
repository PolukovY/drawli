import { useCallback, useEffect, useRef, useState } from 'react'
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

  // Read inside callbacks so no state update has to happen inside an updater.
  const roundRef = useRef(0)
  roundRef.current = round
  const solvedRef = useRef(false)
  solvedRef.current = solved
  const finishedRef = useRef(false)
  finishedRef.current = finished

  // A fresh set of rounds means a fresh game. Keyed by length and identity so
  // a re-created array with the same content does not restart mid-game.
  useEffect(() => {
    roundRef.current = 0
    solvedRef.current = false
    finishedRef.current = false
    setRound(0)
    setSolved(false)
    setEarned(0)
    setFinished(false)
  }, [rounds])

  /**
   * Deciding the last round inside a setState updater looked tidy and was a
   * bug: React may re-run an updater, and a setState called from inside one is
   * not guaranteed to stick. The game then never ended, and the solved round
   * kept re-awarding stars every three seconds.
   */
  const next = useCallback(() => {
    if (finishedRef.current) return
    setSolved(false)
    solvedRef.current = false
    if (roundRef.current + 1 < rounds.length) {
      setRound(roundRef.current + 1)
    } else {
      setFinished(true)
      finishedRef.current = true
    }
  }, [rounds.length])

  const solve = useCallback(async () => {
    // The ref, not the state: two calls in one tick would both see false.
    if (solvedRef.current || finishedRef.current) return
    solvedRef.current = true
    playSound('correct')
    setSolved(true)
    setEarned((value) => value + starsPerRound)
    await awardStars(starsPerRound)
  }, [awardStars, starsPerRound])

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
    roundRef.current = 0
    solvedRef.current = false
    finishedRef.current = false
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
