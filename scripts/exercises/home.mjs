// Дім і речі — everyday objects a child can name before drawing them.
const CATEGORY = 'home'

export const HOME = [
  {
    id: 'house', title: { uk: 'Будинок', en: 'House' }, difficulty: 'EASY',
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
    id: 'castle', title: { uk: 'Замок', en: 'Castle' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'towers', shapes: ['<rect x="50" y="150" width="80" height="210"/>', '<rect x="270" y="150" width="80" height="210"/>'] },
      { id: 'wall', shapes: ['<rect x="130" y="210" width="140" height="150"/>'] },
      { id: 'battlements', shapes: ['<path d="M50 150 v-30 h20 v30 M90 150 v-30 h20 v30"/>', '<path d="M270 150 v-30 h20 v30 M310 150 v-30 h20 v30"/>', '<path d="M140 210 v-24 h22 v24 M188 210 v-24 h22 v24 M236 210 v-24 h22 v24"/>'] },
      { id: 'roofs', shapes: ['<path d="M40 120 L90 50 L140 120 Z"/>', '<path d="M260 120 L310 50 L360 120 Z"/>'] },
      { id: 'gate', shapes: ['<path d="M172 360 v-70 a28 28 0 0 1 56 0 v70 z"/>'] },
    ],
    regions: [
      { id: 'stone', shape: '<g><rect x="50" y="150" width="80" height="210"/><rect x="270" y="150" width="80" height="210"/><rect x="130" y="210" width="140" height="150"/></g>', color: '#C4C9D6' },
      { id: 'roofs', shape: '<g><path d="M40 120 L90 50 L140 120 Z"/><path d="M260 120 L310 50 L360 120 Z"/></g>', color: '#9B5CE0' },
      { id: 'gate', shape: '<path d="M172 360 v-70 a28 28 0 0 1 56 0 v70 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'umbrella', title: { uk: 'Парасолька', en: 'Umbrella' }, difficulty: 'EASY',
    steps: [
      { id: 'canopy', shapes: ['<path d="M40 200 a160 160 0 0 1 320 0 z"/>'] },
      { id: 'scallops', shapes: ['<path d="M40 200 q40 -46 80 0 q40 -46 80 0 q40 -46 80 0 q40 -46 80 0"/>'] },
      { id: 'handle', shapes: ['<path d="M200 200 L200 330 q0 34 -34 34 q-30 0 -32 -26"/>'] },
      { id: 'ribs', shapes: ['<path d="M200 44 L120 200"/>', '<path d="M200 44 L280 200"/>'] },
    ],
    regions: [
      { id: 'canopy', shape: '<path d="M40 200 a160 160 0 0 1 320 0 z"/>', color: '#E4443B' },
      { id: 'handle', shape: '<path d="M196 200 h8 v130 q0 34 -34 34 q-30 0 -32 -26 h8 q4 18 24 18 q26 0 26 -26 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'cup', title: { uk: 'Чашка', en: 'Cup' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M100 130 L124 320 q4 26 30 26 h92 q26 0 30 -26 L300 130 Z"/>'] },
      { id: 'handle', shapes: ['<path d="M296 160 q66 -6 62 50 q-6 50 -70 44"/>'] },
      { id: 'steam', shapes: ['<path d="M170 100 q-16 -40 8 -66"/>', '<path d="M230 100 q16 -40 -8 -66"/>'] },
    ],
    regions: [
      { id: 'cup', shape: '<g><path d="M100 130 L124 320 q4 26 30 26 h92 q26 0 30 -26 L300 130 Z"/><path d="M296 160 q66 -6 62 50 q-6 50 -70 44 v-20 q46 6 50 -26 q4 -34 -46 -28 z"/></g>', color: '#4E86E8' },
      { id: 'drink', shape: '<path d="M104 156 h192 l-6 44 h-180 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'teapot', title: { uk: 'Чайник', en: 'Teapot' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<path d="M110 190 q90 -40 180 0 q20 100 -30 140 h-120 q-50 -40 -30 -140 z"/>'] },
      { id: 'spout', shapes: ['<path d="M110 210 q-60 -6 -70 -70 q28 -6 40 20 q10 26 40 30"/>'] },
      { id: 'handle', shapes: ['<path d="M290 200 q60 10 46 66 q-12 40 -46 40"/>'] },
      { id: 'lid', shapes: ['<path d="M148 176 q52 -34 106 0"/>', '<circle cx="200" cy="140" r="16"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M110 190 q90 -40 180 0 q20 100 -30 140 h-120 q-50 -40 -30 -140 z"/>', color: '#F08BB4' },
      { id: 'lid', shape: '<g><path d="M148 176 q52 -34 106 0 z"/><circle cx="200" cy="140" r="16"/></g>', color: '#E77CA5' },
    ],
  },
  {
    id: 'clock', title: { uk: 'Годинник', en: 'Clock' }, difficulty: 'EASY',
    steps: [
      { id: 'case', shapes: ['<circle cx="200" cy="210" r="130"/>', '<circle cx="200" cy="210" r="108"/>'] },
      { id: 'hands', shapes: ['<path d="M200 210 L200 130"/>', '<path d="M200 210 L256 240"/>', '<circle cx="200" cy="210" r="10"/>'] },
      { id: 'bells', shapes: ['<circle cx="112" cy="98" r="34"/>', '<circle cx="288" cy="98" r="34"/>', '<path d="M180 88 q20 -22 40 0"/>'] },
      { id: 'feet', shapes: ['<path d="M124 328 L100 372"/>', '<path d="M276 328 L300 372"/>'] },
    ],
    regions: [
      { id: 'case', shape: '<g><circle cx="200" cy="210" r="130"/><circle cx="112" cy="98" r="34"/><circle cx="288" cy="98" r="34"/></g>', color: '#E4443B' },
      { id: 'face', shape: '<circle cx="200" cy="210" r="108"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'key', title: { uk: 'Ключик', en: 'Key' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="120" cy="200" r="76"/>', '<circle cx="120" cy="200" r="30"/>'] },
      { id: 'shaft', shapes: ['<rect x="192" y="180" width="176" height="40" rx="14"/>'] },
      { id: 'teeth', shapes: ['<path d="M300 220 L300 268"/>', '<path d="M344 220 L344 260"/>'] },
    ],
    regions: [
      { id: 'key', shape: '<g><circle cx="120" cy="200" r="76"/><rect x="192" y="180" width="176" height="40" rx="14"/><rect x="292" y="220" width="16" height="48"/><rect x="336" y="220" width="16" height="40"/></g>', color: '#FFC53D' },
      { id: 'hole', shape: '<circle cx="120" cy="200" r="30"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'lamp', title: { uk: 'Ліхтарик', en: 'Lamp' }, difficulty: 'EASY',
    steps: [
      { id: 'shade', shapes: ['<path d="M110 190 L150 90 L250 90 L290 190 Z"/>'] },
      { id: 'stand', shapes: ['<path d="M200 190 L200 330"/>', '<path d="M140 350 q60 -30 120 0 q-60 22 -120 0 z"/>'] },
      { id: 'rays', shapes: ['<path d="M96 230 L60 264"/>', '<path d="M304 230 L340 264"/>', '<path d="M200 226 L200 268"/>'] },
    ],
    regions: [
      { id: 'shade', shape: '<path d="M110 190 L150 90 L250 90 L290 190 Z"/>', color: '#FFC53D' },
      { id: 'stand', shape: '<g><rect x="192" y="190" width="16" height="140"/><path d="M140 350 q60 -30 120 0 q-60 22 -120 0 z"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'bed', title: { uk: 'Ліжко', en: 'Bed' }, difficulty: 'EASY',
    steps: [
      { id: 'frame', shapes: ['<rect x="60" y="200" width="280" height="90" rx="12"/>'] },
      { id: 'headboard', shapes: ['<path d="M60 200 v-90 a30 30 0 0 1 30 -30 h20 a30 30 0 0 1 30 30 v90"/>'] },
      { id: 'pillow', shapes: ['<rect x="82" y="160" width="80" height="46" rx="16"/>'] },
      { id: 'blanket', shapes: ['<path d="M170 200 h170 v90 h-170 z"/>', '<path d="M170 230 h170"/>'] },
      { id: 'legs', shapes: ['<path d="M76 290 L76 340"/>', '<path d="M324 290 L324 340"/>'] },
    ],
    regions: [
      { id: 'frame', shape: '<g><rect x="60" y="200" width="280" height="90" rx="12"/><path d="M60 200 v-90 a30 30 0 0 1 30 -30 h20 a30 30 0 0 1 30 30 v90 z"/></g>', color: '#8B5E3C' },
      { id: 'blanket', shape: '<rect x="170" y="200" width="170" height="90"/>', color: '#4E86E8' },
      { id: 'pillow', shape: '<rect x="82" y="160" width="80" height="46" rx="16"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'chair', title: { uk: 'Стільчик', en: 'Chair' }, difficulty: 'EASY',
    steps: [
      { id: 'seat', shapes: ['<rect x="100" y="200" width="200" height="36" rx="10"/>'] },
      { id: 'back', shapes: ['<rect x="100" y="70" width="36" height="130" rx="10"/>', '<rect x="264" y="70" width="36" height="130" rx="10"/>', '<rect x="100" y="96" width="200" height="26" rx="10"/>'] },
      { id: 'legs', shapes: ['<rect x="110" y="236" width="26" height="120" rx="8"/>', '<rect x="264" y="236" width="26" height="120" rx="8"/>'] },
    ],
    regions: [
      { id: 'chair', shape: '<g><rect x="100" y="200" width="200" height="36" rx="10"/><rect x="100" y="70" width="36" height="130" rx="10"/><rect x="264" y="70" width="36" height="130" rx="10"/><rect x="100" y="96" width="200" height="26" rx="10"/><rect x="110" y="236" width="26" height="120" rx="8"/><rect x="264" y="236" width="26" height="120" rx="8"/></g>', color: '#C98A4B' },
    ],
  },
  {
    id: 'door', title: { uk: 'Двері', en: 'Door' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'frame', shapes: ['<rect x="110" y="50" width="180" height="310" rx="14"/>'] },
      { id: 'panels', shapes: ['<rect x="136" y="80" width="128" height="110" rx="8"/>', '<rect x="136" y="212" width="128" height="120" rx="8"/>'] },
      { id: 'handle', shapes: ['<circle cx="262" cy="206" r="12"/>'] },
    ],
    regions: [
      { id: 'door', shape: '<rect x="110" y="50" width="180" height="310" rx="14"/>', color: '#8B5E3C' },
      { id: 'panels', shape: '<g><rect x="136" y="80" width="128" height="110" rx="8"/><rect x="136" y="212" width="128" height="120" rx="8"/></g>', color: '#C98A4B' },
      { id: 'handle', shape: '<circle cx="262" cy="206" r="12"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'window', title: { uk: 'Віконце', en: 'Window' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'frame', shapes: ['<rect x="70" y="80" width="260" height="240" rx="12"/>'] },
      { id: 'cross', shapes: ['<path d="M200 80 L200 320"/>', '<path d="M70 200 L330 200"/>'] },
      { id: 'sill', shapes: ['<rect x="50" y="320" width="300" height="26" rx="8"/>'] },
      { id: 'flower', shapes: ['<circle cx="120" cy="300" r="18"/>', '<path d="M120 318 L120 344"/>'] },
    ],
    regions: [
      { id: 'glass', shape: '<rect x="70" y="80" width="260" height="240" rx="12"/>', color: '#D7EAF7' },
      { id: 'frame', shape: '<g><rect x="192" y="80" width="16" height="240"/><rect x="70" y="192" width="260" height="16"/><rect x="50" y="320" width="300" height="26" rx="8"/></g>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'book', title: { uk: 'Книжка', en: 'Book' }, difficulty: 'EASY',
    steps: [
      { id: 'pages', shapes: ['<path d="M200 120 q-70 -40 -140 -14 v200 q70 -26 140 14 z"/>', '<path d="M200 120 q70 -40 140 -14 v200 q-70 -26 -140 14 z"/>'] },
      { id: 'spine', shapes: ['<path d="M200 120 L200 320"/>'] },
      { id: 'lines', shapes: ['<path d="M96 160 h74"/>', '<path d="M96 200 h74"/>', '<path d="M230 160 h74"/>', '<path d="M230 200 h74"/>'] },
    ],
    regions: [
      { id: 'pages', shape: '<g><path d="M200 120 q-70 -40 -140 -14 v200 q70 -26 140 14 z"/><path d="M200 120 q70 -40 140 -14 v200 q-70 -26 -140 14 z"/></g>', color: '#FFFFFF' },
      { id: 'cover', shape: '<path d="M60 106 v200 l-14 14 v-200 z"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'backpack', title: { uk: 'Рюкзак', en: 'Backpack' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="90" y="130" width="220" height="230" rx="50"/>'] },
      { id: 'flap', shapes: ['<path d="M90 200 q110 -120 220 0"/>'] },
      { id: 'pocket', shapes: ['<rect x="140" y="240" width="120" height="80" rx="20"/>'] },
      { id: 'straps', shapes: ['<path d="M150 130 q-4 -60 50 -60 q54 0 50 60"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="90" y="130" width="220" height="230" rx="50"/>', color: '#4E86E8' },
      { id: 'pocket', shape: '<rect x="140" y="240" width="120" height="80" rx="20"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'ball', title: { uk: 'Мʼячик', en: 'Ball' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<circle cx="200" cy="200" r="140"/>'] },
      { id: 'seams', shapes: ['<path d="M60 200 q140 -70 280 0"/>', '<path d="M60 200 q140 70 280 0"/>'] },
      { id: 'stripe', shapes: ['<path d="M200 60 L200 340"/>'] },
    ],
    regions: [
      { id: 'ball', shape: '<circle cx="200" cy="200" r="140"/>', color: '#E4443B' },
      { id: 'stripe', shape: '<path d="M60 200 q140 -70 280 0 q-140 70 -280 0 z"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'kite', title: { uk: 'Повітряний змій', en: 'Kite' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 40 L310 170 L200 300 L90 170 Z"/>'] },
      { id: 'cross', shapes: ['<path d="M200 40 L200 300"/>', '<path d="M90 170 L310 170"/>'] },
      { id: 'tail', shapes: ['<path d="M200 300 q-30 40 0 60 q30 24 0 60"/>'] },
      { id: 'bows', shapes: ['<path d="M186 330 h28"/>', '<path d="M186 384 h28"/>'] },
    ],
    regions: [
      { id: 'top', shape: '<path d="M200 40 L310 170 L200 170 Z"/>', color: '#E4443B' },
      { id: 'right', shape: '<path d="M310 170 L200 300 L200 170 Z"/>', color: '#FFC53D' },
      { id: 'left', shape: '<path d="M90 170 L200 40 L200 170 Z"/>', color: '#4E86E8' },
      { id: 'bottom', shape: '<path d="M90 170 L200 170 L200 300 Z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'balloon', title: { uk: 'Кулька', en: 'Balloon' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="170" rx="110" ry="130"/>'] },
      { id: 'knot', shapes: ['<path d="M186 300 L200 320 L214 300 Z"/>'] },
      { id: 'string', shapes: ['<path d="M200 320 q30 30 0 60 q-30 30 0 40"/>'] },
    ],
    regions: [
      { id: 'balloon', shape: '<ellipse cx="200" cy="170" rx="110" ry="130"/>', color: '#E4443B' },
      { id: 'knot', shape: '<path d="M186 300 L200 320 L214 300 Z"/>', color: '#C0342C' },
    ],
  },
  {
    id: 'gift', title: { uk: 'Подарунок', en: 'Gift' }, difficulty: 'EASY',
    steps: [
      { id: 'box', shapes: ['<rect x="80" y="170" width="240" height="190" rx="10"/>'] },
      { id: 'lid', shapes: ['<rect x="60" y="120" width="280" height="56" rx="10"/>'] },
      { id: 'ribbon', shapes: ['<path d="M200 120 L200 360"/>'] },
      { id: 'bow', shapes: ['<path d="M200 120 q-56 -60 -76 -20 q-16 34 76 20 z"/>', '<path d="M200 120 q56 -60 76 -20 q16 34 -76 20 z"/>'] },
    ],
    regions: [
      { id: 'box', shape: '<g><rect x="80" y="170" width="240" height="190" rx="10"/><rect x="60" y="120" width="280" height="56" rx="10"/></g>', color: '#4E86E8' },
      { id: 'ribbon', shape: '<g><rect x="186" y="120" width="28" height="240"/><path d="M200 120 q-56 -60 -76 -20 q-16 34 76 20 z"/><path d="M200 120 q56 -60 76 -20 q16 34 -76 20 z"/></g>', color: '#FFC53D' },
    ],
  },
  {
    id: 'candle', title: { uk: 'Свічка', en: 'Candle' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="150" y="150" width="100" height="200" rx="16"/>'] },
      { id: 'wick', shapes: ['<path d="M200 150 L200 120"/>'] },
      { id: 'flame', shapes: ['<path d="M200 120 q-34 -34 0 -76 q34 42 0 76 z"/>'] },
      { id: 'glow', shapes: ['<path d="M148 80 L128 66"/>', '<path d="M252 80 L272 66"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="150" y="150" width="100" height="200" rx="16"/>', color: '#F08BB4' },
      { id: 'flame', shape: '<path d="M200 120 q-34 -34 0 -76 q34 42 0 76 z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'vase', title: { uk: 'Ваза', en: 'Vase' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M150 130 q-70 90 -20 160 q40 56 140 0 q50 -70 -20 -160 z"/>'] },
      { id: 'neck', shapes: ['<path d="M150 130 L150 96"/>', '<path d="M250 130 L250 96"/>', '<path d="M142 96 h116"/>'] },
      { id: 'pattern', shapes: ['<path d="M126 240 q74 34 148 0"/>', '<circle cx="200" cy="200" r="18"/>'] },
    ],
    regions: [
      { id: 'vase', shape: '<path d="M150 130 q-70 90 -20 160 q40 56 140 0 q50 -70 -20 -160 z"/>', color: '#5FC7C0' },
      { id: 'pattern', shape: '<circle cx="200" cy="200" r="18"/>', color: '#FFC53D' },
    ],
  },
].map((e) => ({ ...e, category: CATEGORY }))
