// Природа. Shapes stay big and symmetrical — easier for a small hand to trace.
const CATEGORY = 'nature'

export const NATURE = [
  {
    id: 'sun', title: { uk: 'Сонце', en: 'Sun' }, difficulty: 'EASY',
    steps: [
      { id: 'disc', shapes: ['<circle cx="200" cy="200" r="95"/>'] },
      { id: 'rays', shapes: ['<path d="M200 60 L200 20"/>', '<path d="M200 380 L200 340"/>', '<path d="M60 200 L20 200"/>', '<path d="M380 200 L340 200"/>', '<path d="M101 101 L73 73"/>', '<path d="M299 299 L327 327"/>', '<path d="M299 101 L327 73"/>', '<path d="M101 299 L73 327"/>'] },
      { id: 'face', shapes: ['<circle cx="170" cy="180" r="10"/>', '<circle cx="230" cy="180" r="10"/>', '<path d="M162 230 q38 34 76 0"/>'] },
    ],
    regions: [{ id: 'disc', shape: '<circle cx="200" cy="200" r="95"/>', color: '#FFC53D' }],
  },
  {
    id: 'cloud', title: { uk: 'Хмаринка', en: 'Cloud' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'puffs', shapes: ['<path d="M96 260 a56 56 0 0 1 12 -110 a76 76 0 0 1 140 -20 a62 62 0 0 1 66 130 z"/>'] },
      { id: 'face', shapes: ['<circle cx="168" cy="196" r="9"/>', '<circle cx="234" cy="196" r="9"/>', '<path d="M172 226 q30 24 58 0"/>'] },
    ],
    regions: [{ id: 'cloud', shape: '<path d="M96 260 a56 56 0 0 1 12 -110 a76 76 0 0 1 140 -20 a62 62 0 0 1 66 130 z"/>', color: '#D7EAF7' }],
  },
  {
    id: 'rainbow', title: { uk: 'Веселка', en: 'Rainbow' }, difficulty: 'EASY',
    steps: [
      { id: 'arc-1', shapes: ['<path d="M40 300 a160 160 0 0 1 320 0"/>'] },
      { id: 'arc-2', shapes: ['<path d="M80 300 a120 120 0 0 1 240 0"/>'] },
      { id: 'arc-3', shapes: ['<path d="M120 300 a80 80 0 0 1 160 0"/>'] },
      { id: 'clouds', shapes: ['<path d="M20 300 a34 34 0 0 1 30 -32 a38 38 0 0 1 62 12 a30 30 0 0 1 -4 20 z"/>', '<path d="M288 300 a34 34 0 0 1 30 -32 a38 38 0 0 1 62 12 a30 30 0 0 1 -4 20 z"/>'] },
    ],
    regions: [
      { id: 'outer', shape: '<path d="M40 300 a160 160 0 0 1 320 0 h-40 a120 120 0 0 0 -240 0 z"/>', color: '#E4443B' },
      { id: 'middle', shape: '<path d="M80 300 a120 120 0 0 1 240 0 h-40 a80 80 0 0 0 -160 0 z"/>', color: '#FFC53D' },
      { id: 'inner', shape: '<path d="M120 300 a80 80 0 0 1 160 0 h-40 a40 40 0 0 0 -80 0 z"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'raindrop', title: { uk: 'Крапелька', en: 'Raindrop' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'drop', shapes: ['<path d="M200 60 q100 130 100 180 a100 100 0 0 1 -200 0 q0 -50 100 -180 z"/>'] },
      { id: 'face', shapes: ['<circle cx="172" cy="230" r="10"/>', '<circle cx="228" cy="230" r="10"/>', '<path d="M176 268 q24 22 48 0"/>'] },
    ],
    regions: [{ id: 'drop', shape: '<path d="M200 60 q100 130 100 180 a100 100 0 0 1 -200 0 q0 -50 100 -180 z"/>', color: '#4E86E8' }],
  },
  {
    id: 'snowflake', title: { uk: 'Сніжинка', en: 'Snowflake' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'cross', shapes: ['<path d="M200 40 L200 360"/>', '<path d="M60 200 L340 200"/>'] },
      { id: 'diagonals', shapes: ['<path d="M100 100 L300 300"/>', '<path d="M300 100 L100 300"/>'] },
      { id: 'tips', shapes: ['<path d="M200 80 l-26 -26"/>', '<path d="M200 80 l26 -26"/>', '<path d="M200 320 l-26 26"/>', '<path d="M200 320 l26 26"/>', '<path d="M100 200 l-26 -26"/>', '<path d="M100 200 l-26 26"/>', '<path d="M300 200 l26 -26"/>', '<path d="M300 200 l26 26"/>'] },
    ],
    regions: [],
  },
  {
    id: 'moon', title: { uk: 'Місяць', en: 'Moon' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'crescent', shapes: ['<path d="M250 50 a160 160 0 1 0 0 300 a130 130 0 1 1 0 -300 z"/>'] },
      { id: 'face', shapes: ['<circle cx="196" cy="170" r="10"/>', '<path d="M186 230 q28 20 50 -6"/>'] },
      { id: 'stars', shapes: ['<path d="M330 120 l8 18 l18 8 l-18 8 l-8 18 l-8 -18 l-18 -8 l18 -8 z"/>', '<path d="M320 280 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 z"/>'] },
    ],
    regions: [
      { id: 'moon', shape: '<path d="M250 50 a160 160 0 1 0 0 300 a130 130 0 1 1 0 -300 z"/>', color: '#FFC53D' },
      { id: 'stars', shape: '<g><path d="M330 120 l8 18 l18 8 l-18 8 l-8 18 l-8 -18 l-18 -8 l18 -8 z"/><path d="M320 280 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 z"/></g>', color: '#F0B429' },
    ],
  },
  {
    id: 'tree', title: { uk: 'Дерево', en: 'Tree' }, difficulty: 'EASY',
    steps: [
      { id: 'trunk', shapes: ['<path d="M172 360 L172 230"/>', '<path d="M228 360 L228 230"/>'] },
      { id: 'crown', shapes: ['<circle cx="200" cy="160" r="120"/>'] },
      { id: 'branches', shapes: ['<path d="M200 250 L150 200"/>', '<path d="M200 280 L252 224"/>'] },
      { id: 'apples', shapes: ['<circle cx="150" cy="130" r="16"/>', '<circle cx="240" cy="110" r="16"/>', '<circle cx="216" cy="196" r="16"/>'] },
    ],
    regions: [
      { id: 'crown', shape: '<circle cx="200" cy="160" r="120"/>', color: '#4EA55F' },
      { id: 'trunk', shape: '<rect x="172" y="230" width="56" height="130"/>', color: '#8B5E3C' },
      { id: 'apples', shape: '<g><circle cx="150" cy="130" r="16"/><circle cx="240" cy="110" r="16"/><circle cx="216" cy="196" r="16"/></g>', color: '#E4443B' },
    ],
  },
  {
    id: 'firtree', title: { uk: 'Ялинка', en: 'Fir tree' }, difficulty: 'EASY',
    steps: [
      { id: 'top', shapes: ['<path d="M200 40 L146 140 L254 140 Z"/>'] },
      { id: 'middle', shapes: ['<path d="M200 110 L120 230 L280 230 Z"/>'] },
      { id: 'bottom', shapes: ['<path d="M200 190 L94 320 L306 320 Z"/>'] },
      { id: 'trunk', shapes: ['<rect x="176" y="320" width="48" height="50"/>'] },
      { id: 'star', shapes: ['<path d="M200 12 l10 22 l24 4 l-18 16 l4 24 l-20 -12 l-20 12 l4 -24 l-18 -16 l24 -4 z"/>'] },
    ],
    regions: [
      { id: 'tree', shape: '<g><path d="M200 40 L146 140 L254 140 Z"/><path d="M200 110 L120 230 L280 230 Z"/><path d="M200 190 L94 320 L306 320 Z"/></g>', color: '#4EA55F' },
      { id: 'trunk', shape: '<rect x="176" y="320" width="48" height="50"/>', color: '#8B5E3C' },
      { id: 'star', shape: '<path d="M200 12 l10 22 l24 4 l-18 16 l4 24 l-20 -12 l-20 12 l4 -24 l-18 -16 l24 -4 z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'palm', title: { uk: 'Пальма', en: 'Palm' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'trunk', shapes: ['<path d="M170 360 q10 -140 40 -200"/>', '<path d="M214 360 q14 -140 40 -196"/>'] },
      { id: 'leaves-left', shapes: ['<path d="M226 152 q-90 -60 -140 0 q80 -22 140 0 z"/>', '<path d="M226 152 q-96 20 -96 84 q60 -60 96 -84 z"/>'] },
      { id: 'leaves-right', shapes: ['<path d="M226 152 q90 -60 140 0 q-80 -22 -140 0 z"/>', '<path d="M226 152 q96 20 96 84 q-60 -60 -96 -84 z"/>'] },
      { id: 'coconuts', shapes: ['<circle cx="204" cy="176" r="16"/>', '<circle cx="242" cy="180" r="14"/>'] },
    ],
    regions: [
      { id: 'leaves', shape: '<g><path d="M226 152 q-90 -60 -140 0 q80 -22 140 0 z"/><path d="M226 152 q-96 20 -96 84 q60 -60 96 -84 z"/><path d="M226 152 q90 -60 140 0 q-80 -22 -140 0 z"/><path d="M226 152 q96 20 96 84 q-60 -60 -96 -84 z"/></g>', color: '#4EA55F' },
      { id: 'coconuts', shape: '<g><circle cx="204" cy="176" r="16"/><circle cx="242" cy="180" r="14"/></g>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'flower', title: { uk: 'Квітка', en: 'Flower' }, difficulty: 'EASY',
    steps: [
      { id: 'center', shapes: ['<circle cx="200" cy="150" r="42"/>'] },
      { id: 'petals', shapes: ['<circle cx="200" cy="72" r="42"/>', '<circle cx="278" cy="150" r="42"/>', '<circle cx="200" cy="228" r="42"/>', '<circle cx="122" cy="150" r="42"/>'] },
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
    id: 'tulip', title: { uk: 'Тюльпан', en: 'Tulip' }, difficulty: 'EASY',
    steps: [
      { id: 'cup', shapes: ['<path d="M124 120 q0 130 76 130 q76 0 76 -130 q-30 40 -46 -6 q-30 46 -60 0 q-16 46 -46 6 z"/>'] },
      { id: 'stem', shapes: ['<path d="M200 250 L200 366"/>'] },
      { id: 'leaves', shapes: ['<path d="M200 300 q-70 -30 -86 26 q56 26 86 -26"/>', '<path d="M200 330 q70 -26 84 30 q-56 22 -84 -30"/>'] },
    ],
    regions: [
      { id: 'cup', shape: '<path d="M124 120 q0 130 76 130 q76 0 76 -130 q-30 40 -46 -6 q-30 46 -60 0 q-16 46 -46 6 z"/>', color: '#E4443B' },
      { id: 'leaves', shape: '<g><path d="M200 300 q-70 -30 -86 26 q56 26 86 -26"/><path d="M200 330 q70 -26 84 30 q-56 22 -84 -30"/></g>', color: '#4EA55F' },
    ],
  },
  {
    id: 'sunflower', title: { uk: 'Соняшник', en: 'Sunflower' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'center', shapes: ['<circle cx="200" cy="140" r="56"/>'] },
      { id: 'petals-1', shapes: ['<ellipse cx="200" cy="52" rx="22" ry="38"/>', '<ellipse cx="288" cy="140" rx="38" ry="22"/>', '<ellipse cx="200" cy="228" rx="22" ry="38"/>', '<ellipse cx="112" cy="140" rx="38" ry="22"/>'] },
      { id: 'petals-2', shapes: ['<ellipse cx="262" cy="78" rx="22" ry="38" transform="rotate(45 262 78)"/>', '<ellipse cx="262" cy="202" rx="38" ry="22" transform="rotate(45 262 202)"/>', '<ellipse cx="138" cy="202" rx="22" ry="38" transform="rotate(45 138 202)"/>', '<ellipse cx="138" cy="78" rx="38" ry="22" transform="rotate(45 138 78)"/>'] },
      { id: 'stem', shapes: ['<path d="M200 266 L200 372"/>', '<path d="M200 310 q-64 -26 -80 22 q52 24 80 -22"/>'] },
    ],
    regions: [
      { id: 'petals', shape: '<g><ellipse cx="200" cy="52" rx="22" ry="38"/><ellipse cx="288" cy="140" rx="38" ry="22"/><ellipse cx="200" cy="228" rx="22" ry="38"/><ellipse cx="112" cy="140" rx="38" ry="22"/><ellipse cx="262" cy="78" rx="22" ry="38" transform="rotate(45 262 78)"/><ellipse cx="262" cy="202" rx="38" ry="22" transform="rotate(45 262 202)"/><ellipse cx="138" cy="202" rx="22" ry="38" transform="rotate(45 138 202)"/><ellipse cx="138" cy="78" rx="38" ry="22" transform="rotate(45 138 78)"/></g>', color: '#FFC53D' },
      { id: 'center', shape: '<circle cx="200" cy="140" r="56"/>', color: '#8B5E3C' },
      { id: 'leaf', shape: '<path d="M200 310 q-64 -26 -80 22 q52 24 80 -22"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'mushroom', title: { uk: 'Грибочок', en: 'Mushroom' }, difficulty: 'EASY',
    steps: [
      { id: 'cap', shapes: ['<path d="M60 210 a140 110 0 0 1 280 0 z"/>'] },
      { id: 'stem', shapes: ['<path d="M150 210 q-6 130 50 130 q56 0 50 -130"/>'] },
      { id: 'dots', shapes: ['<circle cx="140" cy="150" r="22"/>', '<circle cx="228" cy="128" r="18"/>', '<circle cx="278" cy="176" r="16"/>'] },
      { id: 'face', shapes: ['<circle cx="176" cy="262" r="9"/>', '<circle cx="224" cy="262" r="9"/>', '<path d="M180 292 q20 18 40 0"/>'] },
    ],
    regions: [
      { id: 'cap', shape: '<path d="M60 210 a140 110 0 0 1 280 0 z"/>', color: '#E4443B' },
      { id: 'stem', shape: '<path d="M150 210 q-6 130 50 130 q56 0 50 -130 z"/>', color: '#EDE6F5' },
      { id: 'dots', shape: '<g><circle cx="140" cy="150" r="22"/><circle cx="228" cy="128" r="18"/><circle cx="278" cy="176" r="16"/></g>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'leaf', title: { uk: 'Листочок', en: 'Leaf' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'blade', shapes: ['<path d="M200 50 q130 70 130 160 q0 90 -130 130 q-130 -40 -130 -130 q0 -90 130 -160 z"/>'] },
      { id: 'vein', shapes: ['<path d="M200 60 L200 336"/>'] },
      { id: 'veins', shapes: ['<path d="M200 140 L120 180"/>', '<path d="M200 140 L280 180"/>', '<path d="M200 210 L128 250"/>', '<path d="M200 210 L272 250"/>'] },
    ],
    regions: [{ id: 'leaf', shape: '<path d="M200 50 q130 70 130 160 q0 90 -130 130 q-130 -40 -130 -130 q0 -90 130 -160 z"/>', color: '#4EA55F' }],
  },
  {
    id: 'acorn', title: { uk: 'Жолудь', en: 'Acorn' }, difficulty: 'EASY',
    steps: [
      { id: 'nut', shapes: ['<path d="M96 170 q0 190 104 190 q104 0 104 -190 z"/>'] },
      { id: 'cap', shapes: ['<path d="M88 170 a112 66 0 0 1 224 0 z"/>'] },
      { id: 'stalk', shapes: ['<path d="M200 104 L200 62"/>'] },
    ],
    regions: [
      { id: 'nut', shape: '<path d="M96 170 q0 190 104 190 q104 0 104 -190 z"/>', color: '#E0A860' },
      { id: 'cap', shape: '<path d="M88 170 a112 66 0 0 1 224 0 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'cactus', title: { uk: 'Кактус', en: 'Cactus' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="158" y="80" width="84" height="230" rx="42"/>'] },
      { id: 'arms', shapes: ['<path d="M158 190 h-40 a30 30 0 0 0 -30 30 v40 a30 30 0 0 0 30 30 h10"/>', '<path d="M242 160 h40 a30 30 0 0 1 30 30 v30 a30 30 0 0 1 -30 30 h-10"/>'] },
      { id: 'pot', shapes: ['<path d="M124 310 L146 372 L254 372 L276 310 Z"/>'] },
      { id: 'flower', shapes: ['<circle cx="200" cy="66" r="20"/>'] },
    ],
    regions: [
      { id: 'cactus', shape: '<g><rect x="158" y="80" width="84" height="230" rx="42"/><path d="M118 190 h40 v100 h-10 a30 30 0 0 1 -30 -30 v-40 a30 30 0 0 1 0 -30 z"/><path d="M242 160 h40 a30 30 0 0 1 30 30 v30 a30 30 0 0 1 -30 30 h-40 z"/></g>', color: '#4EA55F' },
      { id: 'pot', shape: '<path d="M124 310 L146 372 L254 372 L276 310 Z"/>', color: '#F5893B' },
      { id: 'flower', shape: '<circle cx="200" cy="66" r="20"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'mountain', title: { uk: 'Гора', en: 'Mountain' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'peak', shapes: ['<path d="M200 60 L340 320 L60 320 Z"/>'] },
      { id: 'snow', shapes: ['<path d="M144 164 q22 22 32 0 q18 24 36 -2 q20 26 44 4"/>'] },
      { id: 'small-peak', shapes: ['<path d="M300 160 L390 320 L246 320 Z"/>'] },
    ],
    regions: [
      { id: 'mountain', shape: '<g><path d="M200 60 L340 320 L60 320 Z"/><path d="M300 160 L390 320 L246 320 Z"/></g>', color: '#A9AFC0' },
      { id: 'snow', shape: '<path d="M200 60 L256 164 q-24 22 -44 -4 q-18 26 -36 2 q-10 22 -32 0 z"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'shell', title: { uk: 'Мушля', en: 'Seashell' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 60 a150 150 0 0 1 150 260 h-300 a150 150 0 0 1 150 -260 z"/>'] },
      { id: 'ribs', shapes: ['<path d="M200 62 L200 320"/>', '<path d="M200 62 L96 300"/>', '<path d="M200 62 L304 300"/>', '<path d="M200 62 L54 250"/>', '<path d="M200 62 L346 250"/>'] },
      { id: 'base', shapes: ['<path d="M170 60 q30 -26 60 0"/>'] },
    ],
    regions: [{ id: 'shell', shape: '<path d="M200 60 a150 150 0 0 1 150 260 h-300 a150 150 0 0 1 150 -260 z"/>', color: '#F08BB4' }],
  },
  {
    id: 'skystars', title: { uk: 'Зоряне небо', en: 'Starry sky' }, difficulty: 'EASY',
    steps: [
      { id: 'big', shapes: ['<path d="M150 60 l24 54 l58 8 l-42 40 l10 58 l-50 -28 l-50 28 l10 -58 l-42 -40 l58 -8 z"/>'] },
      { id: 'medium', shapes: ['<path d="M290 170 l16 36 l40 6 l-28 27 l7 39 l-35 -19 l-35 19 l7 -39 l-28 -27 l40 -6 z"/>'] },
      { id: 'small', shapes: ['<path d="M170 280 l12 26 l28 4 l-20 19 l5 28 l-25 -14 l-25 14 l5 -28 l-20 -19 l28 -4 z"/>'] },
    ],
    regions: [{ id: 'stars', shape: '<g><path d="M150 60 l24 54 l58 8 l-42 40 l10 58 l-50 -28 l-50 28 l10 -58 l-42 -40 l58 -8 z"/><path d="M290 170 l16 36 l40 6 l-28 27 l7 39 l-35 -19 l-35 19 l7 -39 l-28 -27 l40 -6 z"/><path d="M170 280 l12 26 l28 4 l-20 19 l5 28 l-25 -14 l-25 14 l5 -28 l-20 -19 l28 -4 z"/></g>', color: '#FFC53D' }],
  },
  {
    id: 'lightning', title: { uk: 'Блискавка', en: 'Lightning' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'bolt', shapes: ['<path d="M232 40 L110 220 L186 220 L154 360 L292 168 L214 168 Z"/>'] },
      { id: 'cloud', shapes: ['<path d="M96 60 a40 40 0 0 1 40 -36 a52 52 0 0 1 92 -6 a38 38 0 0 1 30 42 z"/>'] },
    ],
    regions: [
      { id: 'bolt', shape: '<path d="M232 40 L110 220 L186 220 L154 360 L292 168 L214 168 Z"/>', color: '#FFC53D' },
      { id: 'cloud', shape: '<path d="M96 60 a40 40 0 0 1 40 -36 a52 52 0 0 1 92 -6 a38 38 0 0 1 30 42 z"/>', color: '#A9AFC0' },
    ],
  },
  {
    id: 'planet', title: { uk: 'Планета', en: 'Planet' }, difficulty: 'EASY',
    steps: [
      { id: 'globe', shapes: ['<circle cx="200" cy="200" r="110"/>'] },
      { id: 'ring', shapes: ['<ellipse cx="200" cy="212" rx="180" ry="46" transform="rotate(-18 200 212)"/>'] },
      { id: 'craters', shapes: ['<circle cx="164" cy="164" r="22"/>', '<circle cx="238" cy="216" r="16"/>', '<circle cx="182" cy="252" r="13"/>'] },
    ],
    regions: [
      { id: 'globe', shape: '<circle cx="200" cy="200" r="110"/>', color: '#9B5CE0' },
      { id: 'ring', shape: '<ellipse cx="200" cy="212" rx="180" ry="46" transform="rotate(-18 200 212)"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'anthill', title: { uk: 'Камінець', en: 'Pebble' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'stone', shapes: ['<path d="M70 300 q-20 -110 90 -140 q120 -34 168 60 q34 66 -28 100 z"/>'] },
      { id: 'lines', shapes: ['<path d="M120 240 q60 -30 130 -6"/>', '<path d="M140 286 q70 -22 140 -2"/>'] },
    ],
    regions: [{ id: 'stone', shape: '<path d="M70 300 q-20 -110 90 -140 q120 -34 168 60 q34 66 -28 100 z"/>', color: '#A9AFC0' }],
  },
].map((e) => ({ ...e, category: CATEGORY }))
