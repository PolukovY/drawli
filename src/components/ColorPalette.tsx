import { PAINT_COLORS } from '../app/store'
import { playSound } from '../audio/sounds'
import './ColorPalette.css'

interface Props {
  color: string
  onPick: (color: string) => void
  /** The colour the tutor asked for, pointed out until it is picked. */
  want?: string
}

export function ColorPalette({ color, onPick, want }: Props) {
  return (
    <div className="palette card">
      {PAINT_COLORS.map((paint) => (
        <button
          key={paint}
          className={`paint ${color === paint ? 'paint--on' : ''} ${
            want === paint && color !== paint ? 'paint--want' : ''
          }`}
          style={{ background: paint, color: paint }}
          onClick={() => { playSound('tap'); onPick(paint) }}
          aria-label={paint}
          aria-pressed={color === paint}
        />
      ))}
    </div>
  )
}
