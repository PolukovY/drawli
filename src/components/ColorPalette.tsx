import { PAINT_COLORS } from '../app/store'
import './ColorPalette.css'

export function ColorPalette({ color, onPick }: { color: string; onPick: (color: string) => void }) {
  return (
    <div className="palette card">
      {PAINT_COLORS.map((paint) => (
        <button
          key={paint}
          className={`paint ${color === paint ? 'paint--on' : ''}`}
          style={{ background: paint, color: paint }}
          onClick={() => onPick(paint)}
          aria-label={paint}
          aria-pressed={color === paint}
        />
      ))}
    </div>
  )
}
