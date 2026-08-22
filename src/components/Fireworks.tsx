import { useMemo } from 'react'
import './Fireworks.css'

const COLORS = ['#FFC53D', '#E4443B', '#4E86E8', '#34C77B', '#9B5CE0', '#F08BB4', '#F5893B']

interface Props {
  /** 'burst' celebrates one right answer, 'finale' ends the whole game. */
  variant?: 'burst' | 'finale'
}

interface Spark {
  key: string
  left: string
  top: string
  color: string
  dx: string
  dy: string
  delay: string
  size: number
}

/**
 * Full-screen fireworks. Purely decorative, so it never takes pointer events —
 * the child can keep tapping while it plays.
 */
export function Fireworks({ variant = 'burst' }: Props) {
  const bursts = variant === 'finale' ? 6 : 3
  const sparksPerBurst = 14

  const sparks = useMemo<Spark[]>(() => {
    const out: Spark[] = []
    for (let b = 0; b < bursts; b += 1) {
      // Spread the bursts across the top two thirds, away from the buttons.
      const cx = 12 + ((b * 37) % 76)
      const cy = 12 + ((b * 23) % 46)
      const radius = variant === 'finale' ? 190 : 150
      for (let i = 0; i < sparksPerBurst; i += 1) {
        const angle = (i / sparksPerBurst) * Math.PI * 2
        out.push({
          key: `${b}-${i}`,
          left: `${cx}%`,
          top: `${cy}%`,
          color: COLORS[(b * sparksPerBurst + i) % COLORS.length],
          dx: `${Math.cos(angle) * radius}px`,
          dy: `${Math.sin(angle) * radius}px`,
          delay: `${b * 0.28}s`,
          size: i % 3 === 0 ? 12 : 8,
        })
      }
    }
    return out
  }, [bursts, variant])

  return (
    <div className={`fireworks fireworks--${variant}`} aria-hidden="true">
      {sparks.map((spark) => (
        <span
          key={spark.key}
          style={{
            left: spark.left,
            top: spark.top,
            width: spark.size,
            height: spark.size,
            background: spark.color,
            animationDelay: spark.delay,
            // Consumed by the keyframes below.
            ['--dx' as string]: spark.dx,
            ['--dy' as string]: spark.dy,
          }}
        />
      ))}
    </div>
  )
}
