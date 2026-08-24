type IconName =
  | 'pencil' | 'brush' | 'fill' | 'eraser' | 'undo' | 'redo'
  | 'back' | 'home' | 'star' | 'check' | 'arrow' | 'gallery'
  | 'gear' | 'play' | 'plus' | 'globe' | 'sound' | 'download' | 'trash' | 'user' | 'shield' | 'again'
  | 'eye' | 'eyeOff'

const paths: Record<IconName, React.ReactNode> = {
  pencil: <><path d="M15.5 4.5l4 4L8 20H4v-4z" /><path d="M13.5 6.5l4 4" /></>,
  brush: <><path d="M17 3l4 4-8 8-4-4z" /><path d="M9 11c-3 1-4 4-4 6 2 0 5-1 6-4z" /></>,
  fill: <><path d="M10 3l9 9-7 7-9-9z" /><path d="M20 15c1.2 1.6 1.8 2.7 1.8 3.4A1.9 1.9 0 0120 20.3 1.9 1.9 0 0118.2 18.4c0-.7.6-1.8 1.8-3.4z" /></>,
  eraser: <><path d="M8 20l-4-4 10-10 4 4-8 8z" /><path d="M8 20h11" /></>,
  undo: <><path d="M4 9h10a5 5 0 010 10h-3" /><path d="M8 5L4 9l4 4" /></>,
  redo: <><path d="M20 9H10a5 5 0 000 10h3" /><path d="M16 5l4 4-4 4" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  home: <><path d="M4 11.5L12 4l8 7.5" /><path d="M6.5 10.5V20h11v-9.5" /></>,
  star: <path d="M12 3.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 18.45 6.2 21.4l1.1-6.45-4.7-4.6 6.5-.95z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  arrow: <><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>,
  gallery: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 15l5-4 4 3 3-2 6 4" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.56V21a2 2 0 11-4 0v-.11a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.11a1.7 1.7 0 001.56-1.11 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.56V3a2 2 0 114 0v.11a1.7 1.7 0 001 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.56 1H21a2 2 0 110 4h-.11a1.7 1.7 0 00-1.56 1z" /></>,
  play: <path d="M8 5l12 7-12 7z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></>,
  sound: <><path d="M5 9h3l5-4v14l-5-4H5z" /><path d="M17 9.5a4 4 0 010 5" /></>,
  download: <><path d="M4 15v3.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V15" /><path d="M12 4v11" /><path d="M7.5 10.5L12 15l4.5-4.5" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V4.5h6V7" /><path d="M6.5 7l1 12.5h9L18 7" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6" /></>,
  shield: <path d="M12 3l7 3.5v5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5v-5z" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3.2" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M9.9 5.9A9.7 9.7 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 01-3.3 4" /><path d="M6.6 7.6A16.7 16.7 0 002.5 12S6 18.5 12 18.5c1.4 0 2.6-.3 3.7-.8" /><path d="M9.9 9.9a3.2 3.2 0 004.3 4.3" /></>,
  again: <><path d="M20 11a8 8 0 10-2.3 6" /><path d="M20 4v7h-7" /></>,
}

export function Icon({
  name, size = 26, color = 'currentColor', filled = false, width = 2.2,
}: { name: IconName; size?: number; color?: string; filled?: boolean; width?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export type { IconName }
