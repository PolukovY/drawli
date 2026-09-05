/**
 * Words new to the app, drawn in the same front-facing, three-shape style as
 * the exercise library — so `artSvg` gives them the same glossy shading for
 * free. `generate-vocabulary.mjs` renders these; it never touches the
 * drawing exercises themselves.
 *
 * difficulty: 1 easiest, 3 hardest — decides how early a word turns up and
 * how many pictures it competes against.
 */
export const FARM = [
  {
    id: 'rooster', difficulty: 1, title: { uk: 'Півень', en: 'Rooster', es: 'Gallo' },
    steps: [
      { id: 'comb', shapes: ['<path d="M150 108 q10 -34 30 -10 q10 -30 30 0 q10 -30 30 10 q6 20 -18 30 h-54 q-24 -10 -18 -30"/>'] },
      { id: 'face', shapes: ['<circle cx="220" cy="176" r="9"/>'] },
      { id: 'wattle', shapes: ['<path d="M182 210 q-4 26 10 34 q14 -8 10 -34"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="196" cy="240" rx="96" ry="92"/>', color: '#E4443B' },
      { id: 'head', shape: '<circle cx="200" cy="168" r="66"/>', color: '#F5893B' },
      { id: 'comb', shape: '<path d="M150 108 q10 -34 30 -10 q10 -30 30 0 q10 -30 30 10 q6 20 -18 30 h-54 q-24 -10 -18 -30"/>', color: '#E4443B' },
      { id: 'beak', shape: '<path d="M258 176 q34 -4 34 14 q-2 16 -34 8 z"/>', color: '#FFC53D' },
      { id: 'tail', shape: '<path d="M108 236 q-70 -50 -60 -110 q56 6 76 68 q10 -46 54 -60 q10 56 -30 92 z"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'hen', difficulty: 1, title: { uk: 'Курка', en: 'Hen', es: 'Gallina' },
    steps: [
      { id: 'comb', shapes: ['<path d="M188 118 q0 -26 20 -26 q20 0 20 26 z"/>'] },
      { id: 'face', shapes: ['<circle cx="228" cy="172" r="9"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="192" cy="246" rx="98" ry="90"/>', color: '#FFFFFF' },
      { id: 'head', shape: '<circle cx="208" cy="170" r="60"/>', color: '#FFFFFF' },
      { id: 'comb', shape: '<path d="M188 118 q0 -26 20 -26 q20 0 20 26 z"/>', color: '#E4443B' },
      { id: 'beak', shape: '<path d="M264 176 q30 -2 30 12 q-2 14 -30 6 z"/>', color: '#FFC53D' },
      { id: 'wing', shape: '<path d="M130 236 q-30 10 -20 56 q40 4 48 -40 z"/>', color: '#EDE6F5' },
    ],
  },
  {
    id: 'horse', difficulty: 1, title: { uk: 'Кінь', en: 'Horse', es: 'Caballo' },
    steps: [
      { id: 'face', shapes: ['<circle cx="180" cy="196" r="9"/>', '<path d="M158 118 q-4 -44 -34 -50 q0 34 22 54"/>'] },
      { id: 'nostril', shapes: ['<circle cx="150" cy="272" r="7"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<path d="M120 130 q10 -40 70 -40 q60 0 62 60 q2 40 -20 70 q-6 46 -46 60 q-46 -8 -56 -56 q-30 -18 -22 -54 q-4 -20 12 -40"/>', color: '#8B5E3C' },
      { id: 'mane', shape: '<path d="M158 118 q-4 -44 -34 -50 q0 34 22 54 z"/>', color: '#2A2340' },
      { id: 'muzzle', shape: '<ellipse cx="150" cy="262" rx="42" ry="34"/>', color: '#C98A4B' },
      { id: 'ear', shape: '<path d="M244 108 q-4 -30 24 -34 q0 26 -10 40 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'goat', difficulty: 1, title: { uk: 'Коза', en: 'Goat', es: 'Cabra' },
    steps: [
      { id: 'face', shapes: ['<circle cx="176" cy="188" r="9"/>', '<circle cx="230" cy="188" r="9"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<ellipse cx="200" cy="196" rx="88" ry="76"/>', color: '#FBFAFF' },
      { id: 'muzzle', shape: '<ellipse cx="200" cy="252" rx="46" ry="34"/>', color: '#F4F1FA' },
      { id: 'beard', shape: '<path d="M186 282 q14 30 14 46 q14 -16 14 -46 z"/>', color: '#EDE6F5' },
      { id: 'ear', shape: '<path d="M118 176 q-30 6 -34 34 q30 6 44 -18 z"/>', color: '#EDE6F5' },
      { id: 'hornL', shape: '<path d="M172 120 q-20 -34 -2 -58 q22 4 22 34 q0 14 -20 24"/>', color: '#F4F1FA' },
      { id: 'hornR', shape: '<path d="M228 120 q20 -34 2 -58 q-22 4 -22 34 q0 14 20 24"/>', color: '#F4F1FA' },
    ],
  },
  {
    id: 'donkey', difficulty: 2, title: { uk: 'Ослик', en: 'Donkey', es: 'Burro' },
    steps: [
      { id: 'face', shapes: ['<circle cx="182" cy="196" r="9"/>'] },
      { id: 'mane', shapes: ['<path d="M160 122 L160 176"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<path d="M120 150 q10 -50 76 -50 q60 0 58 56 q-2 44 -30 66 q-10 40 -48 46 q-40 -10 -46 -54 q-22 -20 -10 -64"/>', color: '#8B84A3' },
      { id: 'muzzle', shape: '<ellipse cx="148" cy="256" rx="40" ry="32"/>', color: '#D8D3E8' },
      { id: 'ear', shape: '<ellipse cx="252" cy="96" rx="24" ry="56" transform="rotate(18 252 96)"/>', color: '#8B84A3' },
      { id: 'earinner', shape: '<ellipse cx="252" cy="96" rx="12" ry="40" transform="rotate(18 252 96)"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'egg', difficulty: 1, title: { uk: 'Яйце', en: 'Egg', es: 'Huevo' },
    steps: [],
    regions: [
      { id: 'shell', shape: '<path d="M200 90 q90 40 90 160 a90 90 0 0 1 -180 0 q0 -120 90 -160"/>', color: '#FFF6DC' },
      { id: 'shine', shape: '<ellipse cx="164" cy="180" rx="20" ry="34"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'barn', difficulty: 2, title: { uk: 'Сарай', en: 'Barn', es: 'Granero' },
    steps: [
      { id: 'loft', shapes: ['<circle cx="200" cy="150" r="16"/>'] },
      { id: 'planks', shapes: ['<path d="M140 220 L140 340"/>', '<path d="M260 220 L260 340"/>'] },
    ],
    regions: [
      { id: 'roof', shape: '<path d="M90 226 L200 100 L310 226 Z"/>', color: '#8B5E3C' },
      { id: 'wall', shape: '<rect x="112" y="222" width="176" height="118" rx="6"/>', color: '#E4443B' },
      { id: 'door', shape: '<path d="M170 340 L170 262 q30 -20 60 0 l0 78 z"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'haystack', difficulty: 2, title: { uk: 'Скирта сіна', en: 'Haystack', es: 'Almiar' },
    steps: [
      { id: 'wisps', shapes: ['<path d="M150 210 L140 176"/>', '<path d="M200 200 L200 162"/>', '<path d="M250 210 L260 176"/>'] },
    ],
    regions: [
      { id: 'stack', shape: '<path d="M120 320 q-14 -70 80 -100 q94 30 80 100 q0 20 -160 0"/>', color: '#FFC53D' },
      { id: 'band', shape: '<path d="M124 288 q76 22 152 0 l0 20 q-76 22 -152 0 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'scarecrow', difficulty: 2, title: { uk: 'Опудало', en: 'Scarecrow', es: 'Espantapájaros' },
    steps: [
      { id: 'face', shapes: ['<path d="M180 172 L188 180 M220 172 L212 180"/>', '<path d="M182 206 q18 12 36 0"/>'] },
      { id: 'post', shapes: ['<path d="M200 340 L200 270"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<circle cx="200" cy="164" r="52"/>', color: '#FFC53D' },
      { id: 'hat', shape: '<path d="M140 138 q60 -46 120 0 q-60 20 -120 0 z"/>', color: '#8B5E3C' },
      { id: 'body', shape: '<path d="M148 220 q52 -26 104 0 l-10 90 q-42 20 -84 0 z"/>', color: '#4E86E8' },
      { id: 'arms', shape: '<path d="M96 236 L304 236"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'fence', difficulty: 1, title: { uk: 'Паркан', en: 'Fence', es: 'Cerca' },
    steps: [],
    regions: [
      { id: 'post1', shape: '<rect x="80" y="150" width="30" height="180" rx="6"/>', color: '#C98A4B' },
      { id: 'post2', shape: '<rect x="185" y="150" width="30" height="180" rx="6"/>', color: '#C98A4B' },
      { id: 'post3', shape: '<rect x="290" y="150" width="30" height="180" rx="6"/>', color: '#C98A4B' },
      { id: 'rail1', shape: '<rect x="70" y="190" width="260" height="26" rx="8"/>', color: '#8B5E3C' },
      { id: 'rail2', shape: '<rect x="70" y="270" width="260" height="26" rx="8"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'wheelbarrow', difficulty: 2, title: { uk: 'Тачка', en: 'Wheelbarrow', es: 'Carretilla' },
    steps: [
      { id: 'spoke', shapes: ['<path d="M200 310 L200 280"/>'] },
      { id: 'handles', shapes: ['<path d="M290 220 L340 200"/>', '<path d="M290 260 L340 250"/>'] },
    ],
    regions: [
      { id: 'tray', shape: '<path d="M110 210 L290 210 L262 280 L138 280 Z"/>', color: '#F5893B' },
      { id: 'wheel', shape: '<circle cx="200" cy="310" r="34"/>', color: '#2A2340' },
      { id: 'leg', shape: '<path d="M150 280 L134 320 M250 280 L266 320"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'beehive', difficulty: 2, title: { uk: 'Вулик', en: 'Beehive', es: 'Colmena' },
    steps: [
      { id: 'entrance', shapes: ['<circle cx="200" cy="300" r="12"/>'] },
    ],
    regions: [
      { id: 'top', shape: '<path d="M150 150 q50 -30 100 0 q-8 20 -100 0"/>', color: '#8B5E3C' },
      { id: 'ring1', shape: '<path d="M140 150 q60 24 120 0 l-6 46 q-54 22 -108 0 z"/>', color: '#FFC53D' },
      { id: 'ring2', shape: '<path d="M134 196 q66 22 132 0 l-8 52 q-58 22 -116 0 z"/>', color: '#F5893B' },
      { id: 'ring3', shape: '<path d="M126 248 q74 22 148 0 l-10 60 q-64 24 -128 0 z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'windmill', difficulty: 2, title: { uk: 'Вітряк', en: 'Windmill', es: 'Molino' },
    steps: [
      { id: 'hub', shapes: ['<circle cx="220" cy="130" r="10"/>'] },
    ],
    regions: [
      { id: 'tower', shape: '<path d="M180 340 L192 150 L248 150 L268 340 Z"/>', color: '#FBFAFF' },
      { id: 'roof', shape: '<path d="M186 150 L220 108 L254 150 Z"/>', color: '#E4443B' },
      { id: 'blade1', shape: '<ellipse cx="220" cy="72" rx="14" ry="50"/>', color: '#4E86E8' },
      { id: 'blade2', shape: '<ellipse cx="220" cy="72" rx="14" ry="50" transform="rotate(90 220 72)"/>', color: '#4E86E8' },
      { id: 'blade3', shape: '<ellipse cx="220" cy="72" rx="14" ry="50" transform="rotate(45 220 72)"/>', color: '#7C9FF0' },
      { id: 'blade4', shape: '<ellipse cx="220" cy="72" rx="14" ry="50" transform="rotate(135 220 72)"/>', color: '#7C9FF0' },
    ],
  },
  {
    id: 'farmer', difficulty: 2, title: { uk: 'Фермер', en: 'Farmer', es: 'Granjero' },
    steps: [
      { id: 'face', shapes: ['<circle cx="182" cy="156" r="6"/>', '<circle cx="218" cy="156" r="6"/>', '<path d="M186 178 q14 10 28 0"/>'] },
    ],
    regions: [
      { id: 'hat', shape: '<path d="M120 128 q80 -50 160 0 q-10 18 -160 0"/>', color: '#FFC53D' },
      { id: 'head', shape: '<circle cx="200" cy="158" r="50"/>', color: '#F2C39A' },
      { id: 'body', shape: '<path d="M144 300 q56 -30 112 0 l-8 40 q-48 16 -96 0 z"/>', color: '#4E86E8' },
      { id: 'strap', shape: '<path d="M170 220 L170 300 M230 220 L230 300"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'cart', difficulty: 1, title: { uk: 'Візок', en: 'Cart', es: 'Carro' },
    steps: [],
    regions: [
      { id: 'body', shape: '<path d="M116 200 L284 200 L268 280 L132 280 Z"/>', color: '#8B5E3C' },
      { id: 'wheel1', shape: '<circle cx="156" cy="300" r="30"/>', color: '#2A2340' },
      { id: 'wheel2', shape: '<circle cx="244" cy="300" r="30"/>', color: '#2A2340' },
      { id: 'rim1', shape: '<circle cx="156" cy="300" r="12"/>', color: '#8B84A3' },
      { id: 'rim2', shape: '<circle cx="244" cy="300" r="12"/>', color: '#8B84A3' },
    ],
  },
  {
    id: 'well', difficulty: 1, title: { uk: 'Криниця', en: 'Water well', es: 'Pozo' },
    steps: [
      { id: 'rope', shapes: ['<path d="M200 210 L200 260"/>'] },
    ],
    regions: [
      { id: 'roof', shape: '<path d="M126 150 L200 100 L274 150 Z"/>', color: '#8B5E3C' },
      { id: 'post1', shape: '<rect x="122" y="150" width="18" height="120" rx="4"/>', color: '#C98A4B' },
      { id: 'post2', shape: '<rect x="260" y="150" width="18" height="120" rx="4"/>', color: '#C98A4B' },
      { id: 'wall', shape: '<path d="M110 340 a90 34 0 0 1 180 0 a90 34 0 0 1 -180 0"/>', color: '#5FC7C0' },
      { id: 'bucket', shape: '<path d="M182 258 L218 258 L212 292 L188 292 Z"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'turkey', difficulty: 2, title: { uk: 'Індик', en: 'Turkey', es: 'Pavo' },
    steps: [
      { id: 'face', shapes: ['<circle cx="222" cy="180" r="8"/>'] },
      { id: 'wattle', shapes: ['<path d="M198 200 q-2 24 14 30 q10 -14 0 -30"/>'] },
    ],
    regions: [
      { id: 'tail1', shape: '<path d="M110 250 q-80 -30 -80 -110 q60 0 90 60 z"/>', color: '#E4443B' },
      { id: 'tail2', shape: '<path d="M124 236 q-56 -50 -30 -120 q60 16 74 84 z"/>', color: '#F5893B' },
      { id: 'tail3', shape: '<path d="M150 226 q-30 -66 20 -120 q46 34 32 100 z"/>', color: '#FFC53D' },
      { id: 'body', shape: '<ellipse cx="196" cy="256" rx="80" ry="76"/>', color: '#8B5E3C' },
      { id: 'head', shape: '<circle cx="216" cy="176" r="46"/>', color: '#9B5CE0' },
      { id: 'beak', shape: '<path d="M258 182 q22 -2 22 10 q-2 12 -22 4 z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'goose', difficulty: 1, title: { uk: 'Гусак', en: 'Goose', es: 'Ganso' },
    steps: [
      { id: 'face', shapes: ['<circle cx="270" cy="146" r="7"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="180" cy="264" rx="94" ry="80"/>', color: '#FBFAFF' },
      { id: 'neck', shape: '<path d="M220 240 q10 -90 60 -120 q30 20 6 60 q30 4 24 40 q-40 20 -70 30 z"/>', color: '#FBFAFF' },
      { id: 'beak', shape: '<path d="M296 132 q30 -6 30 10 q-2 14 -30 6 z"/>', color: '#F5893B' },
      { id: 'wing', shape: '<path d="M120 250 q-30 10 -22 60 q44 2 50 -44 z"/>', color: '#E8E4F0' },
    ],
  },
  {
    id: 'wheat', difficulty: 1, title: { uk: 'Пшениця', en: 'Wheat', es: 'Trigo' },
    steps: [
      { id: 'lines', shapes: ['<path d="M200 260 L200 140"/>'] },
    ],
    regions: [
      { id: 'stalk', shape: '<rect x="192" y="200" width="16" height="150" rx="6"/>', color: '#4EA55F' },
      { id: 'head', shape: '<path d="M164 90 q36 -30 72 0 q-8 26 -36 34 q-28 -8 -36 -34"/>', color: '#FFC53D' },
      { id: 'grain1', shape: '<ellipse cx="150" cy="120" rx="14" ry="26" transform="rotate(-30 150 120)"/>', color: '#F5893B' },
      { id: 'grain2', shape: '<ellipse cx="250" cy="120" rx="14" ry="26" transform="rotate(30 250 120)"/>', color: '#F5893B' },
      { id: 'grain3', shape: '<ellipse cx="150" cy="170" rx="14" ry="26" transform="rotate(-24 150 170)"/>', color: '#FFC53D' },
      { id: 'grain4', shape: '<ellipse cx="250" cy="170" rx="14" ry="26" transform="rotate(24 250 170)"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'pumpkin', difficulty: 1, title: { uk: 'Гарбуз', en: 'Pumpkin', es: 'Calabaza' },
    steps: [
      { id: 'lines', shapes: ['<path d="M200 150 L200 320"/>', '<path d="M148 170 Q140 250 158 316"/>', '<path d="M252 170 Q260 250 242 316"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="200" cy="248" rx="110" ry="88"/>', color: '#F5893B' },
      { id: 'stem', shape: '<path d="M188 158 q0 -34 24 -40 q6 20 -8 40 z"/>', color: '#4EA55F' },
    ],
  },
]
