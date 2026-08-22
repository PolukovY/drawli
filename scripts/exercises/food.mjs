// Смаколики. Every exercise: 2–4 traceable steps, then colouring regions.
const CATEGORY = 'food'

export const FOOD = [
  {
    id: 'apple', title: { uk: 'Яблуко', en: 'Apple' }, difficulty: 'EASY',
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
    id: 'pear', title: { uk: 'Груша', en: 'Pear' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 120 c46 0 62 44 44 78 c-16 30 -4 44 10 66 c22 34 6 96 -54 96 s-76 -62 -54 -96 c14 -22 26 -36 10 -66 c-18 -34 -2 -78 44 -78 z"/>'] },
      { id: 'stalk', shapes: ['<path d="M200 120 q0 -40 -14 -54"/>'] },
      { id: 'leaf', shapes: ['<path d="M198 96 q44 -44 80 -18 q-24 48 -80 18 z"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 120 c46 0 62 44 44 78 c-16 30 -4 44 10 66 c22 34 6 96 -54 96 s-76 -62 -54 -96 c14 -22 26 -36 10 -66 c-18 -34 -2 -78 44 -78 z"/>', color: '#B7D24A' },
      { id: 'leaf', shape: '<path d="M198 96 q44 -44 80 -18 q-24 48 -80 18 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'banana', title: { uk: 'Банан', en: 'Banana' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M74 130 c0 120 76 190 190 190 c30 0 54 -12 62 -30 c-90 -6 -160 -74 -166 -166 c-16 -12 -60 -18 -86 6 z"/>'] },
      { id: 'tips', shapes: ['<path d="M74 130 q-16 -22 -6 -38"/>', '<path d="M326 290 q22 4 30 20"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M74 130 c0 120 76 190 190 190 c30 0 54 -12 62 -30 c-90 -6 -160 -74 -166 -166 c-16 -12 -60 -18 -86 6 z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'cherries', title: { uk: 'Вишеньки', en: 'Cherries' }, difficulty: 'EASY',
    steps: [
      { id: 'stems', shapes: ['<path d="M200 70 q-60 60 -60 140"/>', '<path d="M200 70 q56 70 62 130"/>'] },
      { id: 'berries', shapes: ['<circle cx="138" cy="262" r="58"/>', '<circle cx="266" cy="252" r="52"/>'] },
      { id: 'leaf', shapes: ['<path d="M200 74 q52 -48 88 -20 q-26 50 -88 20 z"/>'] },
    ],
    regions: [
      { id: 'berries', shape: '<g><circle cx="138" cy="262" r="58"/><circle cx="266" cy="252" r="52"/></g>', color: '#E4443B' },
      { id: 'leaf', shape: '<path d="M200 74 q52 -48 88 -20 q-26 50 -88 20 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'watermelon', title: { uk: 'Кавун', en: 'Watermelon' }, difficulty: 'EASY',
    steps: [
      { id: 'slice', shapes: ['<path d="M40 110 L360 110 A160 160 0 0 1 40 110 Z"/>'] },
      { id: 'rind', shapes: ['<path d="M40 150 L360 150"/>'] },
      { id: 'seeds', shapes: ['<ellipse cx="150" cy="200" rx="9" ry="14"/>', '<ellipse cx="250" cy="200" rx="9" ry="14"/>', '<ellipse cx="200" cy="240" rx="9" ry="14"/>'] },
    ],
    regions: [
      { id: 'rind', shape: '<path d="M40 110 L360 110 A160 160 0 0 1 40 110 Z"/>', color: '#4EA55F' },
      { id: 'flesh', shape: '<path d="M40 150 L360 150 A160 160 0 0 1 40 150 Z"/>', color: '#E4443B' },
      { id: 'seeds', shape: '<g><ellipse cx="150" cy="200" rx="9" ry="14"/><ellipse cx="250" cy="200" rx="9" ry="14"/><ellipse cx="200" cy="240" rx="9" ry="14"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'strawberry', title: { uk: 'Полуниця', en: 'Strawberry' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 130 c70 0 120 40 120 90 c0 70 -70 130 -120 130 s-120 -60 -120 -130 c0 -50 50 -90 120 -90 z"/>'] },
      { id: 'leaves', shapes: ['<path d="M200 130 l-58 -34 l30 40 l-46 6 l52 22 l22 -18 l22 18 l52 -22 l-46 -6 l30 -40 z"/>'] },
      { id: 'seeds', shapes: ['<circle cx="164" cy="196" r="6"/>', '<circle cx="236" cy="196" r="6"/>', '<circle cx="200" cy="238" r="6"/>', '<circle cx="150" cy="252" r="6"/>', '<circle cx="250" cy="252" r="6"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 130 c70 0 120 40 120 90 c0 70 -70 130 -120 130 s-120 -60 -120 -130 c0 -50 50 -90 120 -90 z"/>', color: '#E4443B' },
      { id: 'leaves', shape: '<path d="M200 130 l-58 -34 l30 40 l-46 6 l52 22 l22 -18 l22 18 l52 -22 l-46 -6 l30 -40 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'grapes', title: { uk: 'Виноград', en: 'Grapes' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'stem', shapes: ['<path d="M200 60 L200 118"/>'] },
      { id: 'leaf', shapes: ['<path d="M200 76 q52 -46 90 -16 q-28 50 -90 16 z"/>'] },
      { id: 'top-berries', shapes: ['<circle cx="160" cy="150" r="34"/>', '<circle cx="240" cy="150" r="34"/>', '<circle cx="200" cy="196" r="34"/>'] },
      { id: 'bottom-berries', shapes: ['<circle cx="128" cy="212" r="32"/>', '<circle cx="272" cy="212" r="32"/>', '<circle cx="162" cy="266" r="32"/>', '<circle cx="238" cy="266" r="32"/>', '<circle cx="200" cy="318" r="30"/>'] },
    ],
    regions: [
      { id: 'berries', shape: '<g><circle cx="160" cy="150" r="34"/><circle cx="240" cy="150" r="34"/><circle cx="200" cy="196" r="34"/><circle cx="128" cy="212" r="32"/><circle cx="272" cy="212" r="32"/><circle cx="162" cy="266" r="32"/><circle cx="238" cy="266" r="32"/><circle cx="200" cy="318" r="30"/></g>', color: '#9B5CE0' },
      { id: 'leaf', shape: '<path d="M200 76 q52 -46 90 -16 q-28 50 -90 16 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'orange', title: { uk: 'Апельсин', en: 'Orange' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<circle cx="200" cy="220" r="130"/>'] },
      { id: 'leaf', shapes: ['<path d="M200 90 q46 -44 84 -18 q-26 48 -84 18 z"/>', '<path d="M200 90 L200 66"/>'] },
      { id: 'shine', shapes: ['<path d="M132 168 q26 -26 56 -32"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<circle cx="200" cy="220" r="130"/>', color: '#F5893B' },
      { id: 'leaf', shape: '<path d="M200 90 q46 -44 84 -18 q-26 48 -84 18 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'lemon', title: { uk: 'Лимон', en: 'Lemon' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="210" rx="130" ry="96"/>'] },
      { id: 'tips', shapes: ['<path d="M70 210 q-26 0 -32 -14"/>', '<path d="M330 210 q26 0 32 14"/>'] },
      { id: 'leaf', shapes: ['<path d="M214 118 q44 -46 82 -20 q-26 50 -82 20 z"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="200" cy="210" rx="130" ry="96"/>', color: '#FFC53D' },
      { id: 'leaf', shape: '<path d="M214 118 q44 -46 82 -20 q-26 50 -82 20 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'icecream', title: { uk: 'Морозиво', en: 'Ice cream' }, difficulty: 'EASY',
    steps: [
      { id: 'cone', shapes: ['<path d="M124 210 L200 372 L276 210 Z"/>'] },
      { id: 'waffle', shapes: ['<path d="M146 262 L226 262"/>', '<path d="M164 300 L238 300"/>'] },
      { id: 'scoops', shapes: ['<circle cx="160" cy="176" r="50"/>', '<circle cx="240" cy="176" r="50"/>', '<circle cx="200" cy="118" r="50"/>'] },
      { id: 'cherry', shapes: ['<circle cx="200" cy="52" r="18"/>', '<path d="M200 34 q10 -18 26 -20"/>'] },
    ],
    regions: [
      { id: 'cone', shape: '<path d="M124 210 L200 372 L276 210 Z"/>', color: '#C98A4B' },
      { id: 'scoops', shape: '<g><circle cx="160" cy="176" r="50"/><circle cx="240" cy="176" r="50"/><circle cx="200" cy="118" r="50"/></g>', color: '#F08BB4' },
      { id: 'cherry', shape: '<circle cx="200" cy="52" r="18"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'popsicle', title: { uk: 'Ескімо', en: 'Popsicle' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="120" y="60" width="160" height="220" rx="60"/>'] },
      { id: 'stick', shapes: ['<rect x="180" y="278" width="40" height="80" rx="14"/>'] },
      { id: 'drips', shapes: ['<path d="M120 200 q26 26 54 6 q30 -22 56 6 q26 24 50 -6"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="120" y="60" width="160" height="220" rx="60"/>', color: '#F08BB4' },
      { id: 'stick', shape: '<rect x="180" y="278" width="40" height="80" rx="14"/>', color: '#C98A4B' },
    ],
  },
  {
    id: 'cupcake', title: { uk: 'Капкейк', en: 'Cupcake' }, difficulty: 'EASY',
    steps: [
      { id: 'cup', shapes: ['<path d="M110 200 L140 350 L260 350 L290 200 Z"/>'] },
      { id: 'lines', shapes: ['<path d="M158 200 L172 350"/>', '<path d="M200 200 L200 350"/>', '<path d="M242 200 L228 350"/>'] },
      { id: 'cream', shapes: ['<path d="M110 200 q0 -60 46 -70 q10 -50 60 -44 q46 6 50 50 q40 12 34 64 z"/>'] },
      { id: 'cherry', shapes: ['<circle cx="200" cy="62" r="20"/>'] },
    ],
    regions: [
      { id: 'cup', shape: '<path d="M110 200 L140 350 L260 350 L290 200 Z"/>', color: '#F5893B' },
      { id: 'cream', shape: '<path d="M110 200 q0 -60 46 -70 q10 -50 60 -44 q46 6 50 50 q40 12 34 64 z"/>', color: '#F08BB4' },
      { id: 'cherry', shape: '<circle cx="200" cy="62" r="20"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'donut', title: { uk: 'Пончик', en: 'Donut' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'ring', shapes: ['<circle cx="200" cy="200" r="140"/>', '<circle cx="200" cy="200" r="48"/>'] },
      { id: 'glaze', shapes: ['<path d="M62 190 q30 40 62 6 q34 -34 66 4 q30 34 62 -4 q30 -34 48 6"/>'] },
      { id: 'sprinkles', shapes: ['<path d="M140 120 l16 12"/>', '<path d="M250 118 l14 -14"/>', '<path d="M300 190 l4 18"/>', '<path d="M110 220 l-16 8"/>', '<path d="M200 92 l0 18"/>'] },
    ],
    regions: [
      { id: 'dough', shape: '<path d="M200 60 a140 140 0 1 0 0.1 0 z m0 92 a48 48 0 1 1 -0.1 0 z"/>', color: '#C98A4B' },
      { id: 'glaze', shape: '<path d="M62 190 q30 40 62 6 q34 -34 66 4 q30 34 62 -4 q30 -34 48 6 q6 60 -38 96 q-40 34 -100 34 q-56 0 -92 -40 q-32 -38 -8 -96 z"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'cookie', title: { uk: 'Печиво', en: 'Cookie' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<circle cx="200" cy="200" r="140"/>'] },
      { id: 'chips', shapes: ['<circle cx="150" cy="150" r="20"/>', '<circle cx="252" cy="164" r="18"/>', '<circle cx="196" cy="228" r="20"/>', '<circle cx="132" cy="248" r="16"/>', '<circle cx="264" cy="256" r="16"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<circle cx="200" cy="200" r="140"/>', color: '#E0A860' },
      { id: 'chips', shape: '<g><circle cx="150" cy="150" r="20"/><circle cx="252" cy="164" r="18"/><circle cx="196" cy="228" r="20"/><circle cx="132" cy="248" r="16"/><circle cx="264" cy="256" r="16"/></g>', color: '#6B4423' },
    ],
  },
  {
    id: 'candy', title: { uk: 'Цукерка', en: 'Candy' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="120" y="150" width="160" height="100" rx="40"/>'] },
      { id: 'wrappers', shapes: ['<path d="M120 200 L40 140 L58 200 L40 260 Z"/>', '<path d="M280 200 L360 140 L342 200 L360 260 Z"/>'] },
      { id: 'stripes', shapes: ['<path d="M168 156 L152 244"/>', '<path d="M212 152 L196 248"/>', '<path d="M256 158 L242 242"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="120" y="150" width="160" height="100" rx="40"/>', color: '#E4443B' },
      { id: 'wrappers', shape: '<g><path d="M120 200 L40 140 L58 200 L40 260 Z"/><path d="M280 200 L360 140 L342 200 L360 260 Z"/></g>', color: '#F08BB4' },
    ],
  },
  {
    id: 'lollipop', title: { uk: 'Льодяник', en: 'Lollipop' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="150" r="110"/>'] },
      { id: 'spiral', shapes: ['<path d="M200 150 m0 -18 a18 18 0 1 1 -18 18 a36 36 0 1 1 36 36 a54 54 0 1 1 -54 -54 a72 72 0 1 1 72 72"/>'] },
      { id: 'stick', shapes: ['<rect x="186" y="258" width="28" height="110" rx="12"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<circle cx="200" cy="150" r="110"/>', color: '#F08BB4' },
      { id: 'stick', shape: '<rect x="186" y="258" width="28" height="110" rx="12"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'pizza', title: { uk: 'Піца', en: 'Pizza' }, difficulty: 'EASY',
    steps: [
      { id: 'slice', shapes: ['<path d="M200 40 L340 330 L60 330 Z"/>'] },
      { id: 'crust', shapes: ['<path d="M74 300 L326 300"/>'] },
      { id: 'toppings', shapes: ['<circle cx="200" cy="160" r="20"/>', '<circle cx="150" cy="250" r="20"/>', '<circle cx="252" cy="250" r="20"/>'] },
    ],
    regions: [
      { id: 'crust', shape: '<path d="M200 40 L340 330 L60 330 Z"/>', color: '#E0A860' },
      { id: 'cheese', shape: '<path d="M200 40 L326 300 L74 300 Z"/>', color: '#FFC53D' },
      { id: 'toppings', shape: '<g><circle cx="200" cy="160" r="20"/><circle cx="150" cy="250" r="20"/><circle cx="252" cy="250" r="20"/></g>', color: '#E4443B' },
    ],
  },
  {
    id: 'cake', title: { uk: 'Тортик', en: 'Cake' }, difficulty: 'EASY',
    steps: [
      { id: 'base', shapes: ['<rect x="70" y="230" width="260" height="110" rx="12"/>'] },
      { id: 'top-layer', shapes: ['<rect x="106" y="150" width="188" height="80" rx="12"/>'] },
      { id: 'cream', shapes: ['<path d="M106 150 q24 -30 48 0 q24 -30 46 0 q24 -30 46 0 q24 -30 48 0"/>'] },
      { id: 'candle', shapes: ['<rect x="192" y="72" width="16" height="52" rx="6"/>', '<path d="M200 72 q-16 -18 0 -34 q16 16 0 34 z"/>'] },
    ],
    regions: [
      { id: 'base', shape: '<rect x="70" y="230" width="260" height="110" rx="12"/>', color: '#F08BB4' },
      { id: 'top', shape: '<rect x="106" y="150" width="188" height="80" rx="12"/>', color: '#FFC53D' },
      { id: 'flame', shape: '<path d="M200 72 q-16 -18 0 -34 q16 16 0 34 z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'croissant', title: { uk: 'Круасан', en: 'Croissant' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<path d="M70 260 q30 -140 130 -140 q100 0 130 140 q-40 -20 -50 10 q-30 -34 -54 -6 q-26 -30 -52 0 q-24 -30 -52 6 q-14 -30 -52 -10 z"/>'] },
      { id: 'tips', shapes: ['<path d="M70 260 q-24 12 -30 40 q40 4 48 -22"/>', '<path d="M330 260 q24 12 30 40 q-40 4 -48 -22"/>'] },
      { id: 'folds', shapes: ['<path d="M148 140 q10 60 4 100"/>', '<path d="M200 122 q0 62 0 116"/>', '<path d="M252 140 q-10 60 -4 100"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M70 260 q30 -140 130 -140 q100 0 130 140 q-40 -20 -50 10 q-30 -34 -54 -6 q-26 -30 -52 0 q-24 -30 -52 6 q-14 -30 -52 -10 z"/>', color: '#E0A860' },
    ],
  },
  {
    id: 'carrot', title: { uk: 'Морквина', en: 'Carrot' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M148 140 L200 350 L252 140 Z"/>'] },
      { id: 'rings', shapes: ['<path d="M162 190 L238 190"/>', '<path d="M176 244 L224 244"/>'] },
      { id: 'leaves', shapes: ['<path d="M200 140 q-16 -60 -60 -74 q14 46 44 74"/>', '<path d="M200 140 q0 -66 0 -86 q22 40 22 86"/>', '<path d="M200 140 q26 -54 70 -66 q-16 44 -46 66"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M148 140 L200 350 L252 140 Z"/>', color: '#F5893B' },
      { id: 'leaves', shape: '<g><path d="M200 140 q-16 -60 -60 -74 q14 46 44 74"/><path d="M200 140 q0 -66 0 -86 q22 40 22 86"/><path d="M200 140 q26 -54 70 -66 q-16 44 -46 66"/></g>', color: '#4EA55F' },
    ],
  },
  {
    id: 'corn', title: { uk: 'Кукурудза', en: 'Corn' }, difficulty: 'EASY',
    steps: [
      { id: 'cob', shapes: ['<ellipse cx="200" cy="200" rx="72" ry="140"/>'] },
      { id: 'kernels', shapes: ['<path d="M164 76 L164 324"/>', '<path d="M200 62 L200 338"/>', '<path d="M236 76 L236 324"/>', '<path d="M132 140 L268 140"/>', '<path d="M128 200 L272 200"/>', '<path d="M132 260 L268 260"/>'] },
      { id: 'husk', shapes: ['<path d="M128 240 q-70 26 -78 100 q66 6 88 -66"/>', '<path d="M272 240 q70 26 78 100 q-66 6 -88 -66"/>'] },
    ],
    regions: [
      { id: 'cob', shape: '<ellipse cx="200" cy="200" rx="72" ry="140"/>', color: '#FFC53D' },
      { id: 'husk', shape: '<g><path d="M128 240 q-70 26 -78 100 q66 6 88 -66"/><path d="M272 240 q70 26 78 100 q-66 6 -88 -66"/></g>', color: '#4EA55F' },
    ],
  },
  {
    id: 'juice', title: { uk: 'Сік', en: 'Juice' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'box', shapes: ['<rect x="120" y="120" width="160" height="230" rx="14"/>'] },
      { id: 'straw', shapes: ['<path d="M250 120 L286 50"/>', '<path d="M286 50 L322 60"/>'] },
      { id: 'label', shapes: ['<rect x="146" y="184" width="108" height="86" rx="10"/>', '<circle cx="200" cy="227" r="26"/>'] },
    ],
    regions: [
      { id: 'box', shape: '<rect x="120" y="120" width="160" height="230" rx="14"/>', color: '#F5893B' },
      { id: 'label', shape: '<rect x="146" y="184" width="108" height="86" rx="10"/>', color: '#FFFFFF' },
      { id: 'fruit', shape: '<circle cx="200" cy="227" r="26"/>', color: '#FFC53D' },
    ],
  },
].map((e) => ({ ...e, category: CATEGORY }))
