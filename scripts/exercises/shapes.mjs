// Фігури. Each shape is traced side by side, so a child sees it being built
// from strokes rather than appearing whole.
const CATEGORY = 'shapes'

const fill = (id, shape, color) => ({ id, shape, color })

export const SHAPES = [
  {
    id: 'circle', title: { uk: 'Коло', en: 'Circle' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'big', shapes: ['<circle cx="200" cy="200" r="140"/>'] },
      { id: 'medium', shapes: ['<circle cx="200" cy="200" r="90"/>'] },
      { id: 'small', shapes: ['<circle cx="200" cy="200" r="42"/>'] },
    ],
    regions: [
      fill('ring-outer', '<circle cx="200" cy="200" r="140"/>', '#FFC53D'),
      fill('ring-inner', '<circle cx="200" cy="200" r="90"/>', '#F5893B'),
      fill('core', '<circle cx="200" cy="200" r="42"/>', '#E4443B'),
    ],
  },
  {
    id: 'square', title: { uk: 'Квадрат', en: 'Square' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'big', shapes: ['<rect x="60" y="60" width="280" height="280" rx="6"/>'] },
      { id: 'small', shapes: ['<rect x="140" y="140" width="120" height="120" rx="4"/>'] },
    ],
    regions: [
      fill('outer', '<rect x="60" y="60" width="280" height="280" rx="6"/>', '#4E86E8'),
      fill('inner', '<rect x="140" y="140" width="120" height="120" rx="4"/>', '#FFC53D'),
    ],
  },
  {
    id: 'triangle', title: { uk: 'Трикутник', en: 'Triangle' }, difficulty: 'EASY',
    steps: [
      { id: 'left', shapes: ['<path d="M200 60 L60 330"/>'] },
      { id: 'right', shapes: ['<path d="M200 60 L340 330"/>'] },
      { id: 'base', shapes: ['<path d="M60 330 L340 330"/>'] },
    ],
    regions: [fill('body', '<path d="M200 60 L340 330 L60 330 Z"/>', '#4EA55F')],
  },
  {
    id: 'rectangle', title: { uk: 'Прямокутник', en: 'Rectangle' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'sides', shapes: ['<path d="M50 120 L50 280"/>', '<path d="M350 120 L350 280"/>'] },
      { id: 'top-bottom', shapes: ['<path d="M50 120 L350 120"/>', '<path d="M50 280 L350 280"/>'] },
    ],
    regions: [fill('body', '<rect x="50" y="120" width="300" height="160" rx="6"/>', '#9B5CE0')],
  },
  {
    id: 'oval', title: { uk: 'Овал', en: 'Oval' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'big', shapes: ['<ellipse cx="200" cy="200" rx="150" ry="100"/>'] },
      { id: 'small', shapes: ['<ellipse cx="200" cy="200" rx="80" ry="52"/>'] },
    ],
    regions: [
      fill('outer', '<ellipse cx="200" cy="200" rx="150" ry="100"/>', '#5FC7C0'),
      fill('inner', '<ellipse cx="200" cy="200" rx="80" ry="52"/>', '#FFFFFF'),
    ],
  },
  {
    id: 'heart', title: { uk: 'Серце', en: 'Heart' }, difficulty: 'EASY',
    steps: [
      { id: 'left', shapes: ['<path d="M200 340 C60 250 40 160 90 110 C130 70 180 90 200 130"/>'] },
      { id: 'right', shapes: ['<path d="M200 340 C340 250 360 160 310 110 C270 70 220 90 200 130"/>'] },
    ],
    regions: [fill('body', '<path d="M200 340 C60 250 40 160 90 110 C130 70 180 90 200 130 C220 90 270 70 310 110 C360 160 340 250 200 340 Z"/>', '#E4443B')],
  },
  {
    id: 'star', title: { uk: 'Зірочка', en: 'Star' }, difficulty: 'EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M200 50 L243 148 L348 160"/>'] },
      { id: 'right', shapes: ['<path d="M348 160 L270 232 L291 336"/>'] },
      { id: 'bottom', shapes: ['<path d="M291 336 L200 285 L109 336"/>'] },
      { id: 'left', shapes: ['<path d="M109 336 L130 232 L52 160 L157 148 Z"/>'] },
    ],
    regions: [fill('body', '<path d="M200 50 L243 148 L348 160 L270 232 L291 336 L200 285 L109 336 L130 232 L52 160 L157 148 Z"/>', '#FFC53D')],
  },
  {
    id: 'diamond', title: { uk: 'Ромб', en: 'Diamond' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M200 50 L340 200"/>', '<path d="M200 50 L60 200"/>'] },
      { id: 'bottom', shapes: ['<path d="M340 200 L200 350"/>', '<path d="M60 200 L200 350"/>'] },
    ],
    regions: [fill('body', '<path d="M200 50 L340 200 L200 350 L60 200 Z"/>', '#4E86E8')],
  },
  {
    id: 'pentagon', title: { uk: 'Пʼятикутник', en: 'Pentagon' }, difficulty: 'EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M200 50 L343 154 L288 322"/>'] },
      { id: 'bottom', shapes: ['<path d="M288 322 L112 322 L57 154 Z"/>'] },
    ],
    regions: [fill('body', '<path d="M200 50 L343 154 L288 322 L112 322 L57 154 Z"/>', '#F5893B')],
  },
  {
    id: 'hexagon', title: { uk: 'Шестикутник', en: 'Hexagon' }, difficulty: 'EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M130 78 L270 78 L340 200"/>'] },
      { id: 'bottom', shapes: ['<path d="M340 200 L270 322 L130 322 L60 200 Z"/>'] },
    ],
    regions: [fill('body', '<path d="M130 78 L270 78 L340 200 L270 322 L130 322 L60 200 Z"/>', '#5FC7C0')],
  },
  {
    id: 'octagon', title: { uk: 'Восьмикутник', en: 'Octagon' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'top', shapes: ['<path d="M144 60 L256 60 L340 144 L340 256"/>'] },
      { id: 'bottom', shapes: ['<path d="M340 256 L256 340 L144 340 L60 256 L60 144 Z"/>'] },
    ],
    regions: [fill('body', '<path d="M144 60 L256 60 L340 144 L340 256 L256 340 L144 340 L60 256 L60 144 Z"/>', '#E4443B')],
  },
  {
    id: 'crescent', title: { uk: 'Півмісяць', en: 'Crescent' }, difficulty: 'EASY',
    steps: [
      { id: 'outer', shapes: ['<path d="M250 50 a160 160 0 1 0 0 300"/>'] },
      { id: 'inner', shapes: ['<path d="M250 50 a130 130 0 1 1 0 300"/>'] },
    ],
    regions: [fill('body', '<path d="M250 50 a160 160 0 1 0 0 300 a130 130 0 1 1 0 -300 z"/>', '#FFC53D')],
  },
  {
    id: 'cross', title: { uk: 'Хрестик', en: 'Cross' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'vertical', shapes: ['<rect x="160" y="60" width="80" height="280" rx="10"/>'] },
      { id: 'horizontal', shapes: ['<rect x="60" y="160" width="280" height="80" rx="10"/>'] },
    ],
    regions: [fill('body', '<path d="M160 60 h80 v100 h100 v80 h-100 v100 h-80 v-100 h-100 v-80 h100 z"/>', '#E4443B')],
  },
  {
    id: 'arrow', title: { uk: 'Стрілка', en: 'Arrow' }, difficulty: 'EASY',
    steps: [
      { id: 'shaft', shapes: ['<rect x="60" y="170" width="180" height="60" rx="8"/>'] },
      { id: 'head', shapes: ['<path d="M240 110 L360 200 L240 290 Z"/>'] },
    ],
    regions: [fill('body', '<path d="M60 170 h180 v-60 l120 90 l-120 90 v-60 h-180 z"/>', '#4EA55F')],
  },
  {
    id: 'semicircle', title: { uk: 'Півколо', en: 'Semicircle' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'arc', shapes: ['<path d="M60 260 a140 140 0 0 1 280 0"/>'] },
      { id: 'base', shapes: ['<path d="M60 260 L340 260"/>'] },
    ],
    regions: [fill('body', '<path d="M60 260 a140 140 0 0 1 280 0 z"/>', '#9B5CE0')],
  },
  {
    id: 'trapezoid', title: { uk: 'Трапеція', en: 'Trapezoid' }, difficulty: 'EASY',
    steps: [
      { id: 'sides', shapes: ['<path d="M130 110 L60 290"/>', '<path d="M270 110 L340 290"/>'] },
      { id: 'top-bottom', shapes: ['<path d="M130 110 L270 110"/>', '<path d="M60 290 L340 290"/>'] },
    ],
    regions: [fill('body', '<path d="M130 110 L270 110 L340 290 L60 290 Z"/>', '#F08BB4')],
  },
  {
    id: 'ring', title: { uk: 'Бублик', en: 'Ring' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'outer', shapes: ['<circle cx="200" cy="200" r="140"/>'] },
      { id: 'inner', shapes: ['<circle cx="200" cy="200" r="64"/>'] },
    ],
    regions: [fill('ring', '<path d="M200 60 a140 140 0 1 0 0.1 0 z m0 76 a64 64 0 1 1 -0.1 0 z"/>', '#5FC7C0')],
  },
  {
    id: 'egg', title: { uk: 'Яйце', en: 'Egg' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'left', shapes: ['<path d="M200 50 q-110 90 -110 190 q0 110 110 110"/>'] },
      { id: 'right', shapes: ['<path d="M200 50 q110 90 110 190 q0 110 -110 110"/>'] },
    ],
    regions: [fill('body', '<path d="M200 50 q-110 90 -110 190 q0 110 110 110 q110 0 110 -110 q0 -100 -110 -190 z"/>', '#FFC53D')],
  },
  {
    id: 'cloudshape', title: { uk: 'Хмарка', en: 'Cloud shape' }, difficulty: 'EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M108 250 a56 56 0 0 1 12 -110 a76 76 0 0 1 140 -20 a62 62 0 0 1 40 20"/>'] },
      { id: 'bottom', shapes: ['<path d="M300 140 a62 62 0 0 1 14 110 z"/>', '<path d="M108 250 h206"/>'] },
    ],
    regions: [fill('body', '<path d="M108 250 a56 56 0 0 1 12 -110 a76 76 0 0 1 140 -20 a62 62 0 0 1 54 130 z"/>', '#D7EAF7')],
  },
  {
    id: 'spiralshape', title: { uk: 'Спіраль', en: 'Spiral' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'spiral', shapes: ['<path d="M200 200 m0 -20 a20 20 0 1 1 -20 20 a44 44 0 1 1 44 44 a70 70 0 1 1 -70 -70 a96 96 0 1 1 96 96 a122 122 0 1 1 -122 -122"/>'] },
    ],
    regions: [],
  },
].map((e) => ({ ...e, category: CATEGORY }))
