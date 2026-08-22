// Compact geometry source for every exercise. `npm run exercises` turns this
// into public/exercises/<id>/{exercise.json,step-NN.svg,final.svg,thumbnail.svg}
// plus public/exercises/index.json. Guides are plain outlines: the player styles
// the current step dashed and earlier steps as a thin trace.

export const CATEGORIES = [
  { id: 'motor', color: '#8FA9F0', order: 1 },
  { id: 'shapes', color: '#9B5CE0', order: 2 },
  { id: 'nature', color: '#4EA55F', order: 3 },
  { id: 'animals', color: '#5FC7C0', order: 4 },
  { id: 'food', color: '#E4685B', order: 5 },
  { id: 'home', color: '#F5893B', order: 6 },
  { id: 'transport', color: '#4E86E8', order: 7 },
]

const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}"/>`

const wave = (y) =>
  `<path d="M50 ${y} q37.5 -45 75 0 t75 0 t75 0 t75 0"/>`

const zig = (y) =>
  `<path d="M50 ${y} l50 -45 l50 45 l50 -45 l50 45 l50 -45 l50 45"/>`

const loops = (y) =>
  `<path d="M50 ${y} c20 -55 55 -55 60 -5 c3 30 -35 32 -30 -2 c6 -42 50 -46 65 3 c14 46 52 40 60 -4 c5 -28 -32 -30 -28 2 c5 40 55 44 73 4"/>`

export const EXERCISES = [
  {
    id: 'lines', category: 'motor', difficulty: 'VERY_EASY',
    steps: [
      { id: 'horizontal', shapes: [line(60, 110, 340, 110), line(60, 200, 340, 200), line(60, 290, 340, 290)] },
      { id: 'vertical', shapes: [line(110, 60, 110, 340), line(200, 60, 200, 340), line(290, 60, 290, 340)] },
      { id: 'diagonal', shapes: [line(70, 70, 330, 330), line(330, 70, 70, 330)] },
    ],
  },
  {
    id: 'waves', category: 'motor', difficulty: 'VERY_EASY',
    steps: [
      { id: 'wave-1', shapes: [wave(120)] },
      { id: 'wave-2', shapes: [wave(210)] },
      { id: 'wave-3', shapes: [wave(300)] },
    ],
  },
  {
    id: 'zigzag', category: 'motor', difficulty: 'VERY_EASY',
    steps: [
      { id: 'zig-1', shapes: [zig(140)] },
      { id: 'zig-2', shapes: [zig(230)] },
      { id: 'zig-3', shapes: [zig(320)] },
    ],
  },
  {
    id: 'loops', category: 'motor', difficulty: 'EASY',
    steps: [
      { id: 'loop-1', shapes: [loops(150)] },
      { id: 'loop-2', shapes: [loops(280)] },
    ],
  },
  {
    id: 'circle', category: 'shapes', difficulty: 'VERY_EASY',
    steps: [
      { id: 'big', shapes: ['<circle cx="200" cy="200" r="140"/>'] },
      { id: 'medium', shapes: ['<circle cx="200" cy="200" r="90"/>'] },
      { id: 'small', shapes: ['<circle cx="200" cy="200" r="42"/>'] },
    ],
    regions: [
      { id: 'ring-outer', shape: '<circle cx="200" cy="200" r="140"/>', color: '#FFC53D' },
      { id: 'ring-inner', shape: '<circle cx="200" cy="200" r="90"/>', color: '#F5893B' },
      { id: 'core', shape: '<circle cx="200" cy="200" r="42"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'square', category: 'shapes', difficulty: 'VERY_EASY',
    steps: [
      { id: 'big', shapes: ['<rect x="60" y="60" width="280" height="280" rx="6"/>'] },
      { id: 'small', shapes: ['<rect x="140" y="140" width="120" height="120" rx="4"/>'] },
    ],
    regions: [
      { id: 'outer', shape: '<rect x="60" y="60" width="280" height="280" rx="6"/>', color: '#4E86E8' },
      { id: 'inner', shape: '<rect x="140" y="140" width="120" height="120" rx="4"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'triangle', category: 'shapes', difficulty: 'EASY',
    steps: [
      { id: 'left', shapes: ['<path d="M200 60 L60 330"/>'] },
      { id: 'right', shapes: ['<path d="M200 60 L340 330"/>'] },
      { id: 'base', shapes: ['<path d="M60 330 L340 330"/>'] },
    ],
    regions: [{ id: 'body', shape: '<path d="M200 60 L340 330 L60 330 Z"/>', color: '#4EA55F' }],
  },
  {
    id: 'star', category: 'shapes', difficulty: 'EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M200 50 L243 148 L348 160"/>'] },
      { id: 'right', shapes: ['<path d="M348 160 L270 232 L291 336"/>'] },
      { id: 'bottom', shapes: ['<path d="M291 336 L200 285 L109 336"/>'] },
      { id: 'left', shapes: ['<path d="M109 336 L130 232 L52 160 L157 148 Z"/>'] },
    ],
    regions: [{
      id: 'body',
      shape: '<path d="M200 50 L243 148 L348 160 L270 232 L291 336 L200 285 L109 336 L130 232 L52 160 L157 148 Z"/>',
      color: '#FFC53D',
    }],
  },
  {
    id: 'sun', category: 'nature', difficulty: 'EASY',
    steps: [
      { id: 'disc', shapes: ['<circle cx="200" cy="200" r="95"/>'] },
      {
        id: 'rays',
        shapes: [
          line(200, 60, 200, 20), line(200, 380, 200, 340), line(60, 200, 20, 200), line(380, 200, 340, 200),
          line(101, 101, 73, 73), line(299, 299, 327, 327), line(299, 101, 327, 73), line(101, 299, 73, 327),
        ],
      },
      { id: 'face', shapes: ['<circle cx="170" cy="180" r="10"/>', '<circle cx="230" cy="180" r="10"/>', '<path d="M162 230 q38 34 76 0"/>'] },
    ],
    regions: [{ id: 'disc', shape: '<circle cx="200" cy="200" r="95"/>', color: '#FFC53D' }],
  },
  {
    id: 'flower', category: 'nature', difficulty: 'EASY',
    steps: [
      { id: 'center', shapes: ['<circle cx="200" cy="150" r="42"/>'] },
      {
        id: 'petals',
        shapes: [
          '<circle cx="200" cy="72" r="42"/>', '<circle cx="278" cy="150" r="42"/>',
          '<circle cx="200" cy="228" r="42"/>', '<circle cx="122" cy="150" r="42"/>',
        ],
      },
      { id: 'stem', shapes: ['<path d="M200 270 L200 360"/>'] },
      { id: 'leaves', shapes: ['<path d="M200 305 q-55 -35 -75 15 q50 26 75 -15"/>', '<path d="M200 330 q55 -30 72 18 q-48 24 -72 -18"/>'] },
    ],
    regions: [
      { id: 'petals', shape: '<g><circle cx="200" cy="72" r="42"/><circle cx="278" cy="150" r="42"/><circle cx="200" cy="228" r="42"/><circle cx="122" cy="150" r="42"/></g>', color: '#F08BB4' },
      { id: 'center', shape: '<circle cx="200" cy="150" r="42"/>', color: '#FFC53D' },
      { id: 'leaves', shape: '<g><path d="M200 305 q-55 -35 -75 15 q50 26 75 -15"/><path d="M200 330 q55 -30 72 18 q-48 24 -72 -18"/></g>', color: '#4EA55F' },
    ],
  },
  {
    id: 'apple', category: 'food', difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 130 c40 -50 150 -30 150 80 c0 90 -70 150 -100 150 c-20 0 -30 -10 -50 -10 s-30 10 -50 10 c-30 0 -100 -60 -100 -150 c0 -110 110 -130 150 -80 z"/>'] },
      { id: 'stalk', shapes: ['<path d="M200 130 q6 -46 -18 -66"/>'] },
      { id: 'leaf', shapes: ['<path d="M204 108 q40 -52 84 -30 q-16 54 -84 30 z"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 130 c40 -50 150 -30 150 80 c0 90 -70 150 -100 150 c-20 0 -30 -10 -50 -10 s-30 10 -50 10 c-30 0 -100 -60 -100 -150 c0 -110 110 -130 150 -80 z"/>', color: '#E4443B' },
      { id: 'leaf', shape: '<path d="M204 108 q40 -52 84 -30 q-16 54 -84 30 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'ladybug', category: 'animals', difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="220" rx="130" ry="124"/>'] },
      { id: 'head', shapes: ['<circle cx="200" cy="105" r="52"/>'] },
      { id: 'wings', shapes: ['<path d="M200 97 L200 343"/>'] },
      { id: 'spots', shapes: ['<circle cx="145" cy="170" r="20"/>', '<circle cx="108" cy="237" r="17"/>', '<circle cx="160" cy="267" r="18"/>', '<circle cx="255" cy="170" r="20"/>', '<circle cx="292" cy="237" r="17"/>', '<circle cx="240" cy="267" r="18"/>'] },
      {
        id: 'legs',
        shapes: [
          '<path d="M178 65 L152 33"/>', '<circle cx="149" cy="29" r="9"/>',
          '<path d="M222 65 L248 33"/>', '<circle cx="251" cy="29" r="9"/>',
          line(78, 165, 36, 143), line(72, 220, 26, 220), line(80, 277, 38, 301),
          line(322, 165, 364, 143), line(328, 220, 374, 220), line(320, 277, 362, 301),
        ],
      },
    ],
    regions: [
      { id: 'shell', shape: '<ellipse cx="200" cy="220" rx="130" ry="124"/>', color: '#E4443B' },
      { id: 'head', shape: '<circle cx="200" cy="105" r="52"/>', color: '#2A2340' },
      { id: 'spots', shape: '<g><circle cx="145" cy="170" r="20"/><circle cx="108" cy="237" r="17"/><circle cx="160" cy="267" r="18"/><circle cx="255" cy="170" r="20"/><circle cx="292" cy="237" r="17"/><circle cx="240" cy="267" r="18"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'fish', category: 'animals', difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="185" cy="200" rx="130" ry="90"/>'] },
      { id: 'tail', shapes: ['<path d="M315 200 L385 145 L385 255 Z"/>'] },
      { id: 'fin', shapes: ['<path d="M170 110 q40 -55 78 -6"/>', '<path d="M170 290 q40 55 78 6"/>'] },
      { id: 'face', shapes: ['<circle cx="110" cy="175" r="12"/>', '<path d="M62 210 q22 22 46 6"/>'] },
      { id: 'bubbles', shapes: ['<circle cx="60" cy="120" r="14"/>', '<circle cx="34" cy="82" r="9"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="185" cy="200" rx="130" ry="90"/>', color: '#5FC7C0' },
      { id: 'tail', shape: '<path d="M315 200 L385 145 L385 255 Z"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'butterfly', category: 'animals', difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="210" rx="18" ry="88"/>', '<circle cx="200" cy="108" r="22"/>'] },
      { id: 'wings-top', shapes: ['<path d="M186 150 q-120 -100 -150 -20 q-24 66 60 88 q52 14 90 -30 z"/>', '<path d="M214 150 q120 -100 150 -20 q24 66 -60 88 q-52 14 -90 -30 z"/>'] },
      { id: 'wings-bottom', shapes: ['<path d="M186 235 q-100 -6 -110 62 q-6 54 62 46 q52 -8 62 -70 z"/>', '<path d="M214 235 q100 -6 110 62 q6 54 -62 46 q-52 -8 -62 -70 z"/>'] },
      { id: 'antennae', shapes: ['<path d="M188 92 q-26 -40 -56 -50"/>', '<path d="M212 92 q26 -40 56 -50"/>'] },
      { id: 'dots', shapes: ['<circle cx="112" cy="152" r="18"/>', '<circle cx="288" cy="152" r="18"/>', '<circle cx="128" cy="292" r="13"/>', '<circle cx="272" cy="292" r="13"/>'] },
    ],
    regions: [
      { id: 'wings-top', shape: '<g><path d="M186 150 q-120 -100 -150 -20 q-24 66 60 88 q52 14 90 -30 z"/><path d="M214 150 q120 -100 150 -20 q24 66 -60 88 q-52 14 -90 -30 z"/></g>', color: '#9B5CE0' },
      { id: 'wings-bottom', shape: '<g><path d="M186 235 q-100 -6 -110 62 q-6 54 62 46 q52 -8 62 -70 z"/><path d="M214 235 q100 -6 110 62 q6 54 -62 46 q-52 -8 -62 -70 z"/></g>', color: '#F08BB4' },
      { id: 'body', shape: '<g><ellipse cx="200" cy="210" rx="18" ry="88"/><circle cx="200" cy="108" r="22"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'house', category: 'home', difficulty: 'EASY',
    steps: [
      { id: 'walls', shapes: ['<rect x="80" y="180" width="240" height="180" rx="4"/>'] },
      { id: 'roof', shapes: ['<path d="M60 180 L200 60 L340 180 Z"/>'] },
      { id: 'door', shapes: ['<rect x="170" y="260" width="60" height="100" rx="6"/>'] },
      { id: 'windows', shapes: ['<rect x="105" y="212" width="52" height="52" rx="4"/>', '<rect x="243" y="212" width="52" height="52" rx="4"/>'] },
    ],
    regions: [
      { id: 'walls', shape: '<rect x="80" y="180" width="240" height="180" rx="4"/>', color: '#FFC53D' },
      { id: 'roof', shape: '<path d="M60 180 L200 60 L340 180 Z"/>', color: '#E4443B' },
      { id: 'door', shape: '<rect x="170" y="260" width="60" height="100" rx="6"/>', color: '#8B5E3C' },
      { id: 'windows', shape: '<g><rect x="105" y="212" width="52" height="52" rx="4"/><rect x="243" y="212" width="52" height="52" rx="4"/></g>', color: '#4E86E8' },
    ],
  },
  {
    id: 'car', category: 'transport', difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="40" y="200" width="320" height="90" rx="34"/>'] },
      { id: 'cabin', shapes: ['<path d="M110 200 L150 130 L260 130 L300 200 Z"/>'] },
      { id: 'wheels', shapes: ['<circle cx="120" cy="295" r="42"/>', '<circle cx="285" cy="295" r="42"/>'] },
      { id: 'details', shapes: ['<circle cx="345" cy="228" r="14"/>', '<path d="M205 130 L205 200"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="40" y="200" width="320" height="90" rx="34"/>', color: '#4E86E8' },
      { id: 'cabin', shape: '<path d="M110 200 L150 130 L260 130 L300 200 Z"/>', color: '#8FC0FA' },
      { id: 'wheels', shape: '<g><circle cx="120" cy="295" r="42"/><circle cx="285" cy="295" r="42"/></g>', color: '#2A2340' },
    ],
  },
]
