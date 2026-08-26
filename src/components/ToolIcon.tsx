import type { ToolId } from '../storage/types'

/**
 * The tools drawn as the things they are — a yellow pencil, a brush with a
 * loaded tip, a tipping paint bucket, a rubber. A four-year-old picks a tool
 * by recognising the object, not by decoding a line symbol.
 */
export function ToolIcon({ tool, size = 34 }: { tool: ToolId; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SHAPES[tool]}
    </svg>
  )
}

const SHAPES: Record<ToolId, React.ReactNode> = {
  PENCIL: (
    <>
      <path d="M20.5 3.6l7.9 7.9-13.6 13.6-9.8 1.9 1.9-9.8z" fill="#FFC53D" stroke="#C98A0F" strokeWidth="1.6" />
      <path d="M24.4 7.5l-13.6 13.6" stroke="#C98A0F" strokeWidth="1.4" opacity=".7" />
      <path d="M20.5 3.6l7.9 7.9 1.6-1.6a2.6 2.6 0 000-3.7l-4.2-4.2a2.6 2.6 0 00-3.7 0z" fill="#F08BB4" stroke="#C05C82" strokeWidth="1.6" />
      <path d="M6.9 17.2l7.9 7.9-9.8 1.9z" fill="#F6EFDC" stroke="#C98A0F" strokeWidth="1.6" />
      <path d="M5 27l2.6-.5-2.1-2.1z" fill="#2A2340" />
    </>
  ),
  BRUSH: (
    <>
      <path d="M21 2.8l8.2 8.2-9.4 9.4-8.2-8.2z" fill="#8B5E3C" stroke="#5E3D26" strokeWidth="1.6" />
      <path d="M11.6 12.2l8.2 8.2-2.4 2.4-8.2-8.2z" fill="#C8C2DA" stroke="#8B84A3" strokeWidth="1.6" />
      <path
        d="M9.2 14.6l8.2 8.2-3.2 3.6c-2.2 2.5-5.6 3.4-8.8 3.4.2-3.4 1.1-6.6 3.2-8.9z"
        fill="#4E86E8"
        stroke="#2E5AAE"
        strokeWidth="1.6"
      />
      <path d="M5.4 29.8c1.7-1.5 2.1-3.5 1-5" stroke="#2E5AAE" strokeWidth="1.5" />
    </>
  ),
  FILL: (
    <>
      <path
        d="M13.6 2.6l2.6 2.6-9 9a2.2 2.2 0 000 3.1l6.7 6.7a2.2 2.2 0 003.1 0l8.2-8.2-11-11z"
        fill="#9B5CE0"
        stroke="#6B36A8"
        strokeWidth="1.6"
      />
      <path d="M8.4 12.6h15.6l-6.5 6.5a2.2 2.2 0 01-3.1 0z" fill="#C9A7F2" opacity=".85" />
      <path
        d="M27.6 18.4c1.7 2.3 2.6 3.9 2.6 4.9a2.6 2.6 0 11-5.2 0c0-1 .9-2.6 2.6-4.9z"
        fill="#4EA55F"
        stroke="#2F7440"
        strokeWidth="1.5"
      />
    </>
  ),
  ERASER: (
    <>
      <path
        d="M13.4 3.9a3 3 0 014.2 0l10.5 10.5a3 3 0 010 4.2l-5.6 5.6H12.9L3.5 14.8a3 3 0 010-4.2z"
        fill="#F08BB4"
        stroke="#C05C82"
        strokeWidth="1.6"
      />
      <path d="M9.4 8l11.9 11.9-4.7 4.3H12.9L7.6 18.9z" fill="#FBFAFF" stroke="#C05C82" strokeWidth="1.5" />
      <path d="M6 28.4h20" stroke="#8B84A3" strokeWidth="2.2" />
    </>
  ),
}
