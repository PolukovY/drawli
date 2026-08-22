// Моторика. Pure hand control: no picture to get right, just a path to follow.
const CATEGORY = 'motor'

const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}"/>`
const wave = (y, amp = 45) => `<path d="M50 ${y} q37.5 ${-amp} 75 0 t75 0 t75 0 t75 0"/>`
const zig = (y, h = 45) => `<path d="M50 ${y} l50 ${-h} l50 ${h} l50 ${-h} l50 ${h} l50 ${-h} l50 ${h}"/>`
const loop = (y) =>
  `<path d="M50 ${y} c20 -55 55 -55 60 -5 c3 30 -35 32 -30 -2 c6 -42 50 -46 65 3 c14 46 52 40 60 -4 c5 -28 -32 -30 -28 2 c5 40 55 44 73 4"/>`
const arc = (y, r) => `<path d="M60 ${y} a${r} ${r} 0 0 1 280 0"/>`

export const MOTOR = [
  {
    id: 'lines', title: { uk: 'Лінії', en: 'Lines' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'horizontal', shapes: [line(60, 110, 340, 110), line(60, 200, 340, 200), line(60, 290, 340, 290)] },
      { id: 'vertical', shapes: [line(110, 60, 110, 340), line(200, 60, 200, 340), line(290, 60, 290, 340)] },
      { id: 'diagonal', shapes: [line(70, 70, 330, 330), line(330, 70, 70, 330)] },
    ],
  },
  {
    id: 'longlines', title: { uk: 'Довгі лінії', en: 'Long lines' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'first', shapes: [line(40, 90, 360, 90), line(40, 170, 360, 170)] },
      { id: 'second', shapes: [line(40, 250, 360, 250), line(40, 330, 360, 330)] },
    ],
  },
  {
    id: 'waves', title: { uk: 'Хвилі', en: 'Waves' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'wave-1', shapes: [wave(120)] },
      { id: 'wave-2', shapes: [wave(210)] },
      { id: 'wave-3', shapes: [wave(300)] },
    ],
  },
  {
    id: 'bigwaves', title: { uk: 'Великі хвилі', en: 'Big waves' }, difficulty: 'EASY',
    steps: [
      { id: 'wave-1', shapes: [wave(150, 90)] },
      { id: 'wave-2', shapes: [wave(300, 90)] },
    ],
  },
  {
    id: 'zigzag', title: { uk: 'Зигзаг', en: 'Zigzag' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'zig-1', shapes: [zig(140)] },
      { id: 'zig-2', shapes: [zig(230)] },
      { id: 'zig-3', shapes: [zig(320)] },
    ],
  },
  {
    id: 'sharpzigzag', title: { uk: 'Гострий зигзаг', en: 'Sharp zigzag' }, difficulty: 'EASY',
    steps: [
      { id: 'zig-1', shapes: [zig(180, 100)] },
      { id: 'zig-2', shapes: [zig(330, 100)] },
    ],
  },
  {
    id: 'loops', title: { uk: 'Петельки', en: 'Loops' }, difficulty: 'EASY',
    steps: [
      { id: 'loop-1', shapes: [loop(150)] },
      { id: 'loop-2', shapes: [loop(280)] },
    ],
  },
  {
    id: 'spiral', title: { uk: 'Равлики', en: 'Spirals' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'left', shapes: ['<path d="M120 200 m0 -16 a16 16 0 1 1 -16 16 a36 36 0 1 1 36 36 a58 58 0 1 1 -58 -58 a80 80 0 1 1 80 80"/>'] },
      { id: 'right', shapes: ['<path d="M290 220 m0 -12 a12 12 0 1 1 -12 12 a28 28 0 1 1 28 28 a46 46 0 1 1 -46 -46"/>'] },
    ],
  },
  {
    id: 'arcs', title: { uk: 'Дуги', en: 'Arcs' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'arc-1', shapes: [arc(180, 140)] },
      { id: 'arc-2', shapes: [arc(260, 140)] },
      { id: 'arc-3', shapes: [arc(340, 140)] },
    ],
  },
  {
    id: 'hills', title: { uk: 'Пагорби', en: 'Hills' }, difficulty: 'EASY',
    steps: [
      { id: 'hills', shapes: ['<path d="M40 300 q50 -120 100 0 q50 -120 100 0 q50 -120 100 0"/>'] },
      { id: 'ground', shapes: [line(30, 300, 370, 300)] },
    ],
  },
  {
    id: 'circles', title: { uk: 'Кружечки', en: 'Circles' }, difficulty: 'EASY',
    steps: [
      { id: 'row-1', shapes: ['<circle cx="110" cy="130" r="55"/>', '<circle cx="290" cy="130" r="55"/>'] },
      { id: 'row-2', shapes: ['<circle cx="110" cy="280" r="55"/>', '<circle cx="290" cy="280" r="55"/>'] },
    ],
  },
  {
    id: 'eights', title: { uk: 'Вісімки', en: 'Figure eights' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'eight-1', shapes: ['<path d="M130 120 a50 50 0 1 1 0 100 a50 50 0 1 0 0 100 a50 50 0 1 1 0 -100 a50 50 0 1 0 0 -100 z"/>'] },
      { id: 'eight-2', shapes: ['<path d="M280 150 a38 38 0 1 1 0 76 a38 38 0 1 0 0 76 a38 38 0 1 1 0 -76 a38 38 0 1 0 0 -76 z"/>'] },
    ],
  },
  {
    id: 'stairs', title: { uk: 'Сходинки', en: 'Stairs' }, difficulty: 'EASY',
    steps: [
      { id: 'up', shapes: ['<path d="M50 330 v-50 h60 v-50 h60 v-50 h60 v-50 h60 v-50 h60"/>'] },
    ],
  },
  {
    id: 'fence', title: { uk: 'Парканчик', en: 'Fence' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'posts', shapes: [line(80, 90, 80, 330), line(160, 90, 160, 330), line(240, 90, 240, 330), line(320, 90, 320, 330)] },
      { id: 'rails', shapes: [line(50, 160, 350, 160), line(50, 260, 350, 260)] },
    ],
  },
  {
    id: 'ladder', title: { uk: 'Драбинка', en: 'Ladder' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'rails', shapes: [line(130, 50, 130, 350), line(270, 50, 270, 350)] },
      { id: 'steps', shapes: [line(130, 110, 270, 110), line(130, 180, 270, 180), line(130, 250, 270, 250), line(130, 320, 270, 320)] },
    ],
  },
  {
    id: 'rain', title: { uk: 'Дощик', en: 'Rain' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'cloud', shapes: ['<path d="M110 130 a44 44 0 0 1 10 -84 a58 58 0 0 1 106 -16 a48 48 0 0 1 52 100 z"/>'] },
      { id: 'drops', shapes: [line(130, 170, 116, 230), line(190, 170, 176, 230), line(250, 170, 236, 230), line(160, 250, 146, 310), line(220, 250, 206, 310)] },
    ],
  },
  {
    id: 'coil', title: { uk: 'Пружинка', en: 'Coil' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'coil', shapes: ['<path d="M60 200 q20 -70 45 0 q20 70 45 0 q20 -70 45 0 q20 70 45 0 q20 -70 45 0 q20 70 45 0"/>'] },
    ],
  },
  {
    id: 'snake', title: { uk: 'Змійка', en: 'Snake path' }, difficulty: 'EASY',
    steps: [
      { id: 'path', shapes: ['<path d="M50 90 h250 a40 40 0 0 1 0 80 h-200 a40 40 0 0 0 0 80 h200 a40 40 0 0 1 0 80 h-250"/>'] },
    ],
  },
  {
    id: 'dots', title: { uk: 'Крапочки', en: 'Dots' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'row-1', shapes: ['<circle cx="80" cy="120" r="14"/>', '<circle cx="160" cy="120" r="14"/>', '<circle cx="240" cy="120" r="14"/>', '<circle cx="320" cy="120" r="14"/>'] },
      { id: 'row-2', shapes: ['<circle cx="80" cy="240" r="14"/>', '<circle cx="160" cy="240" r="14"/>', '<circle cx="240" cy="240" r="14"/>', '<circle cx="320" cy="240" r="14"/>'] },
    ],
  },
  {
    id: 'maze', title: { uk: 'Доріжка', en: 'Path' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'path', shapes: ['<path d="M60 60 v90 h90 v-60 h90 v120 h-150 v90 h240"/>'] },
      { id: 'goal', shapes: ['<circle cx="60" cy="60" r="18"/>', '<circle cx="330" cy="300" r="18"/>'] },
    ],
  },
].map((e) => ({ ...e, category: CATEGORY }))
