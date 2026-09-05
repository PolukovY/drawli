/** New school words — see farm.mjs for the authoring convention. */
export const SCHOOL = [
  {
    id: 'pencil', difficulty: 1, title: { uk: 'Олівець', en: 'Pencil', es: 'Lápiz' },
    steps: [
      { id: 'facet', shapes: ['<path d="M138 100 L262 100"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M138 100 L262 100 L262 260 L200 340 L138 260 Z"/>', color: '#FFC53D' },
      { id: 'tip', shape: '<path d="M182 260 L218 260 L200 320 Z"/>', color: '#C98A4B' },
      { id: 'lead', shape: '<path d="M195 300 L205 300 L200 320 Z"/>', color: '#2A2340' },
      { id: 'ferrule', shape: '<rect x="138" y="70" width="124" height="30" rx="4"/>', color: '#8B84A3' },
      { id: 'eraser', shape: '<path d="M138 70 L262 70 L254 40 Q200 24 146 40 Z"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'ruler', difficulty: 1, title: { uk: 'Лінійка', en: 'Ruler', es: 'Regla' },
    steps: [
      { id: 'ticks', shapes: ['<path d="M140 190 L140 210"/>', '<path d="M180 190 L180 220"/>', '<path d="M220 190 L220 210"/>', '<path d="M260 190 L260 220"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="80" y="170" width="240" height="60" rx="8"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'eraser', difficulty: 1, title: { uk: 'Гумка', en: 'Eraser', es: 'Goma de borrar' },
    steps: [],
    regions: [
      { id: 'body', shape: '<rect x="120" y="150" width="160" height="100" rx="16"/>', color: '#F08BB4' },
      { id: 'band', shape: '<rect x="120" y="150" width="160" height="34" rx="10"/>', color: '#E77CA5' },
    ],
  },
  {
    id: 'scissors', difficulty: 2, title: { uk: 'Ножиці', en: 'Scissors', es: 'Tijeras' },
    steps: [
      { id: 'blades', shapes: ['<path d="M200 200 L300 130"/>', '<path d="M200 200 L300 270"/>'] },
    ],
    regions: [
      { id: 'ringL', shape: '<circle cx="140" cy="150" r="34"/>', color: '#E4443B' },
      { id: 'ringR', shape: '<circle cx="140" cy="250" r="34"/>', color: '#4E86E8' },
      { id: 'hingeInnerL', shape: '<circle cx="140" cy="150" r="16"/>', color: '#F4F1FA' },
      { id: 'hingeInnerR', shape: '<circle cx="140" cy="250" r="16"/>', color: '#F4F1FA' },
      { id: 'pivot', shape: '<circle cx="200" cy="200" r="10"/>', color: '#8B84A3' },
    ],
  },
  {
    id: 'glue', difficulty: 1, title: { uk: 'Клей', en: 'Glue stick', es: 'Pegamento' },
    steps: [
      { id: 'line', shapes: ['<path d="M150 190 L250 190"/>'] },
    ],
    regions: [
      { id: 'cap', shape: '<path d="M156 100 L244 100 L244 150 L156 150 Z"/>', color: '#4E86E8' },
      { id: 'body', shape: '<path d="M150 150 L250 150 L250 320 Q200 340 150 320 Z"/>', color: '#9B5CE0' },
      { id: 'label', shape: '<rect x="164" y="200" width="72" height="60" rx="8"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'pencilcase', difficulty: 1, title: { uk: 'Пенал', en: 'Pencil case', es: 'Estuche' },
    steps: [
      { id: 'zip', shapes: ['<path d="M100 160 L300 160"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M90 160 L310 160 L300 260 Q200 290 100 260 Z"/>', color: '#4EA55F' },
      { id: 'pull', shape: '<circle cx="300" cy="160" r="10"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'paintbrush', difficulty: 1, title: { uk: 'Пензлик', en: 'Paintbrush', es: 'Pincel' },
    steps: [],
    regions: [
      { id: 'bristles', shape: '<path d="M180 90 L220 90 L212 150 L188 150 Z"/>', color: '#E4443B' },
      { id: 'ferrule', shape: '<rect x="182" y="150" width="36" height="30" rx="4"/>', color: '#8B84A3' },
      { id: 'handle', shape: '<path d="M188 180 L212 180 L222 320 L178 320 Z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'notebook', difficulty: 1, title: { uk: 'Зошит', en: 'Notebook', es: 'Cuaderno' },
    steps: [
      { id: 'lines', shapes: ['<path d="M150 170 L270 170"/>', '<path d="M150 210 L270 210"/>', '<path d="M150 250 L270 250"/>'] },
      { id: 'spine', shapes: ['<path d="M120 100 L120 320"/>'] },
    ],
    regions: [
      { id: 'cover', shape: '<rect x="110" y="90" width="180" height="240" rx="10"/>', color: '#4E86E8' },
      { id: 'page', shape: '<rect x="130" y="110" width="150" height="200" rx="4"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'chalkboard', difficulty: 2, title: { uk: 'Дошка', en: 'Chalkboard', es: 'Pizarra' },
    steps: [
      { id: 'writing', shapes: ['<path d="M150 190 Q170 160 190 190 Q210 220 230 190"/>'] },
      { id: 'tray', shapes: ['<path d="M120 300 L280 300"/>'] },
    ],
    regions: [
      { id: 'frame', shape: '<rect x="90" y="110" width="220" height="170" rx="10"/>', color: '#8B5E3C' },
      { id: 'board', shape: '<rect x="110" y="128" width="180" height="134" rx="4"/>', color: '#4EA55F' },
      { id: 'chalk', shape: '<rect x="176" y="272" width="24" height="10" rx="3"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'desk', difficulty: 2, title: { uk: 'Парта', en: 'School desk', es: 'Pupitre' },
    steps: [
      { id: 'legLines', shapes: ['<path d="M120 260 L120 320"/>', '<path d="M280 260 L280 320"/>'] },
    ],
    regions: [
      { id: 'top', shape: '<path d="M100 220 L300 220 L300 250 L100 250 Z"/>', color: '#F5893B' },
      { id: 'legL', shape: '<rect x="108" y="250" width="20" height="80" rx="4"/>', color: '#8B5E3C' },
      { id: 'legR', shape: '<rect x="272" y="250" width="20" height="80" rx="4"/>', color: '#8B5E3C' },
      { id: 'seat', shape: '<rect x="150" y="290" width="100" height="18" rx="6"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'bell', difficulty: 1, title: { uk: 'Дзвоник', en: 'School bell', es: 'Campana' },
    steps: [
      { id: 'clapper', shapes: ['<path d="M200 260 L200 288"/>'] },
    ],
    regions: [
      { id: 'handle', shape: '<circle cx="200" cy="110" r="20"/>', color: '#8B84A3' },
      { id: 'body', shape: '<path d="M140 240 Q140 130 200 130 Q260 130 260 240 Z"/>', color: '#FFC53D' },
      { id: 'rim', shape: '<ellipse cx="200" cy="240" rx="70" ry="18"/>', color: '#F5893B' },
      { id: 'ball', shape: '<circle cx="200" cy="288" r="14"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'globe', difficulty: 1, title: { uk: 'Глобус', en: 'Globe', es: 'Globo terráqueo' },
    steps: [
      { id: 'meridians', shapes: ['<path d="M200 130 Q160 200 200 270"/>', '<path d="M200 130 Q240 200 200 270"/>', '<path d="M130 200 L270 200"/>'] },
    ],
    regions: [
      { id: 'stand', shape: '<path d="M170 300 L230 300 L220 330 L180 330 Z"/>', color: '#8B5E3C' },
      { id: 'sphere', shape: '<circle cx="200" cy="200" r="90"/>', color: '#4E86E8' },
      { id: 'land1', shape: '<path d="M150 160 q30 -20 50 10 q-10 30 -40 20 z"/>', color: '#4EA55F' },
      { id: 'land2', shape: '<path d="M210 230 q40 -10 50 20 q-20 20 -50 6 z"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'paintpalette', difficulty: 2, title: { uk: 'Палітра', en: 'Paint palette', es: 'Paleta de pintura' },
    steps: [
      { id: 'hole', shapes: ['<circle cx="200" cy="180" r="16"/>'] },
    ],
    regions: [
      { id: 'board', shape: '<path d="M100 200 Q90 100 220 100 Q320 100 310 210 Q300 280 220 260 Q210 300 160 300 Q170 250 100 200"/>', color: '#8B5E3C' },
      { id: 'dab1', shape: '<circle cx="150" cy="150" r="16"/>', color: '#E4443B' },
      { id: 'dab2', shape: '<circle cx="230" cy="140" r="16"/>', color: '#FFC53D' },
      { id: 'dab3', shape: '<circle cx="270" cy="190" r="16"/>', color: '#4E86E8' },
      { id: 'dab4', shape: '<circle cx="150" cy="230" r="16"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'calculator', difficulty: 2, title: { uk: 'Калькулятор', en: 'Calculator', es: 'Calculadora' },
    steps: [
      { id: 'grid', shapes: ['<path d="M130 220 L270 220"/>', '<path d="M130 260 L270 260"/>', '<path d="M175 190 L175 300"/>', '<path d="M225 190 L225 300"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="120" y="90" width="160" height="220" rx="14"/>', color: '#8B84A3' },
      { id: 'screen', shape: '<rect x="140" y="110" width="120" height="50" rx="6"/>', color: '#4EA55F' },
      { id: 'keys', shape: '<rect x="140" y="180" width="120" height="120" rx="8"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'alphabetblock', difficulty: 1, title: { uk: 'Кубик з літерою', en: 'Alphabet block', es: 'Cubo con letras' },
    steps: [
      { id: 'letter', shapes: ['<path d="M186 260 L200 210 L214 260 M191 244 L209 244"/>'] },
    ],
    regions: [
      { id: 'face', shape: '<rect x="120" y="150" width="160" height="160" rx="16"/>', color: '#FFC53D' },
      { id: 'top', shape: '<path d="M120 150 L160 110 L320 110 L280 150 Z"/>', color: '#FFDD8A' },
      { id: 'side', shape: '<path d="M280 150 L320 110 L320 260 L280 310 Z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'graduationcap', difficulty: 2, title: { uk: 'Академічна шапочка', en: 'Graduation cap', es: 'Birrete' },
    steps: [
      { id: 'tassel', shapes: ['<path d="M200 190 L240 210 L236 260"/>'] },
    ],
    regions: [
      { id: 'board', shape: '<path d="M60 190 L200 130 L340 190 L200 250 Z"/>', color: '#2A2340' },
      { id: 'band', shape: '<path d="M140 210 L260 210 L260 250 Q200 280 140 250 Z"/>', color: '#4E86E8' },
      { id: 'button', shape: '<circle cx="200" cy="190" r="10"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'lunchbox', difficulty: 1, title: { uk: 'Ланч-бокс', en: 'Lunchbox', es: 'Lonchera' },
    steps: [
      { id: 'clasp', shapes: ['<rect x="188" y="196" width="24" height="18" rx="3"/>'] },
      { id: 'handle', shapes: ['<path d="M170 170 Q200 130 230 170"/>'] },
    ],
    regions: [
      { id: 'lid', shape: '<path d="M110 200 L290 200 L290 220 L110 220 Z"/>', color: '#E4443B' },
      { id: 'body', shape: '<path d="M110 220 L290 220 L280 310 L120 310 Z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'waterbottle', difficulty: 1, title: { uk: 'Пляшечка води', en: 'Water bottle', es: 'Botella de agua' },
    steps: [
      { id: 'level', shapes: ['<path d="M162 220 L238 220"/>'] },
    ],
    regions: [
      { id: 'cap', shape: '<rect x="180" y="80" width="40" height="30" rx="6"/>', color: '#4E86E8' },
      { id: 'neck', shape: '<rect x="188" y="110" width="24" height="30"/>', color: '#BEE3F8' },
      { id: 'body', shape: '<path d="M156 140 L244 140 L244 320 Q200 336 156 320 Z"/>', color: '#BEE3F8' },
      { id: 'water', shape: '<path d="M162 224 L238 224 L238 320 Q200 334 162 320 Z"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'paints', difficulty: 2, title: { uk: 'Фарби', en: 'Paints', es: 'Pinturas' },
    steps: [
      { id: 'wells', shapes: ['<path d="M140 200 L140 250 M180 200 L180 250 M220 200 L220 250 M260 200 L260 250"/>'] },
    ],
    regions: [
      { id: 'tray', shape: '<rect x="110" y="180" width="180" height="90" rx="12"/>', color: '#FBFAFF' },
      { id: 'well1', shape: '<circle cx="140" cy="225" r="16"/>', color: '#E4443B' },
      { id: 'well2', shape: '<circle cx="180" cy="225" r="16"/>', color: '#FFC53D' },
      { id: 'well3', shape: '<circle cx="220" cy="225" r="16"/>', color: '#4E86E8' },
      { id: 'well4', shape: '<circle cx="260" cy="225" r="16"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'stapler', difficulty: 2, title: { uk: 'Степлер', en: 'Stapler', es: 'Grapadora' },
    steps: [
      { id: 'hinge', shapes: ['<path d="M140 200 L260 200"/>'] },
    ],
    regions: [
      { id: 'base', shape: '<rect x="120" y="240" width="180" height="30" rx="8"/>', color: '#8B84A3' },
      { id: 'top', shape: '<path d="M130 240 L140 190 Q200 176 260 190 L270 240 Z"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'calendar', difficulty: 1, title: { uk: 'Календар', en: 'Calendar', es: 'Calendario' },
    steps: [
      { id: 'grid', shapes: ['<path d="M120 220 L280 220"/>', '<path d="M120 260 L280 260"/>', '<path d="M170 190 L170 300"/>', '<path d="M230 190 L230 300"/>'] },
      { id: 'rings', shapes: ['<path d="M160 100 L160 140"/>', '<path d="M240 100 L240 140"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="110" y="130" width="180" height="180" rx="10"/>', color: '#FFFFFF' },
      { id: 'header', shape: '<rect x="110" y="130" width="180" height="50" rx="10"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'sharpener', difficulty: 1, title: { uk: 'Стругачка', en: 'Pencil sharpener', es: 'Sacapuntas' },
    steps: [
      { id: 'hole', shapes: ['<circle cx="200" cy="200" r="14"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="140" y="150" width="120" height="100" rx="20"/>', color: '#4EA55F' },
      { id: 'top', shape: '<rect x="140" y="150" width="120" height="34" rx="14"/>', color: '#7DCB93' },
    ],
  },
]
