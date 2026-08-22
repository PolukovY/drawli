import { useEffect, useRef, useState } from 'react'
import { loadSvg } from '../exercise/ExerciseLoader'
import './ColoringLayer.css'

interface Props {
  exerciseId: string
  file: string
  fills: Record<string, string>
  onFill: (regionId: string) => void
}

/**
 * SVG-region colouring instead of canvas flood fill: a tap can only ever land
 * inside a shape the illustration already defines, which is what makes it
 * predictable for a four-year-old.
 */
export function ColoringLayer({ exerciseId, file, fills, onFill }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [markup, setMarkup] = useState<string>('')
  const onFillRef = useRef(onFill)
  onFillRef.current = onFill

  useEffect(() => {
    let cancelled = false
    loadSvg(exerciseId, file)
      .then((svg) => { if (!cancelled) setMarkup(svg) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [exerciseId, file])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !markup) return

    const regions = Array.from(container.querySelectorAll<SVGGElement>('[data-region]'))
    const listeners: Array<() => void> = []

    for (const region of regions) {
      const id = region.dataset.region
      if (!id) continue
      const handler = () => onFillRef.current(id)
      region.addEventListener('pointerup', handler)
      region.style.cursor = 'pointer'
      listeners.push(() => region.removeEventListener('pointerup', handler))
    }

    return () => { for (const off of listeners) off() }
  }, [markup])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    for (const region of Array.from(container.querySelectorAll<SVGGElement>('[data-region]'))) {
      const id = region.dataset.region
      if (!id) continue
      region.setAttribute('fill', fills[id] ?? '#FFFFFF')
    }
  }, [fills, markup])

  return (
    <div
      ref={containerRef}
      className="coloring-layer"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
