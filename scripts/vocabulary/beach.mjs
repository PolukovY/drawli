/** New beach words — see farm.mjs for the authoring convention. */
export const BEACH = [
  {
    id: 'wave', difficulty: 1, title: { uk: 'Хвиля', en: 'Wave', es: 'Ola' },
    steps: [
      { id: 'foam', shapes: ['<path d="M90 200 q30 -18 60 0 q30 -18 60 0 q30 -18 60 0 q30 -18 60 0"/>'] },
    ],
    regions: [
      { id: 'crest', shape: '<path d="M70 190 q30 -34 60 -8 q30 -34 60 -8 q30 -34 60 -8 q30 -34 60 -8 l0 30 l-240 0 z"/>', color: '#4E86E8' },
      { id: 'body', shape: '<path d="M70 210 q80 30 260 0 l0 110 l-260 0 z"/>', color: '#7CA5EE' },
    ],
  },
  {
    id: 'sandcastle', difficulty: 2, title: { uk: 'Замок з піску', en: 'Sandcastle', es: 'Castillo de arena' },
    steps: [
      { id: 'windows', shapes: ['<path d="M186 260 L186 300"/>', '<path d="M214 260 L214 300"/>'] },
      { id: 'flag', shapes: ['<path d="M200 130 L200 90"/>'] },
    ],
    regions: [
      { id: 'towerL', shape: '<rect x="120" y="200" width="50" height="140" rx="6"/>', color: '#FFC53D' },
      { id: 'towerR', shape: '<rect x="230" y="200" width="50" height="140" rx="6"/>', color: '#FFC53D' },
      { id: 'roofL', shape: '<path d="M112 200 L145 160 L178 200 Z"/>', color: '#F5893B' },
      { id: 'roofR', shape: '<path d="M222 200 L255 160 L288 200 Z"/>', color: '#F5893B' },
      { id: 'keep', shape: '<rect x="172" y="150" width="56" height="190" rx="6"/>', color: '#FFDD8A' },
      { id: 'roofM', shape: '<path d="M164 150 L200 100 L236 150 Z"/>', color: '#F5893B' },
      { id: 'flag', shape: '<path d="M200 90 L232 104 L200 118 Z"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'starfish', difficulty: 1, title: { uk: 'Морська зірка', en: 'Starfish', es: 'Estrella de mar' },
    steps: [
      { id: 'dots', shapes: ['<circle cx="200" cy="180" r="5"/>', '<circle cx="170" cy="220" r="5"/>', '<circle cx="230" cy="220" r="5"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 70 L228 168 L326 168 L246 226 L276 322 L200 262 L124 322 L154 226 L74 168 L172 168 Z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'bucket', difficulty: 1, title: { uk: 'Відерко', en: 'Bucket', es: 'Cubo' },
    steps: [
      { id: 'handle', shapes: ['<path d="M158 190 q42 -50 84 0"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M140 190 L260 190 L238 320 L162 320 Z"/>', color: '#4E86E8' },
      { id: 'rim', shape: '<ellipse cx="200" cy="190" rx="60" ry="16"/>', color: '#7CA5EE' },
    ],
  },
  {
    id: 'spade', difficulty: 1, title: { uk: 'Лопатка', en: 'Spade', es: 'Pala' },
    steps: [],
    regions: [
      { id: 'grip', shape: '<rect x="156" y="80" width="88" height="26" rx="13"/>', color: '#4E86E8' },
      { id: 'handle', shape: '<rect x="186" y="92" width="28" height="130" rx="10"/>', color: '#F5893B' },
      { id: 'blade', shape: '<path d="M140 210 L260 210 L246 280 Q200 306 154 280 Z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'sunglasses', difficulty: 1, title: { uk: 'Окуляри', en: 'Sunglasses', es: 'Gafas de sol' },
    steps: [
      { id: 'bridge', shapes: ['<path d="M196 200 L204 200"/>'] },
      { id: 'arms', shapes: ['<path d="M120 194 L80 178"/>', '<path d="M280 194 L320 178"/>'] },
    ],
    regions: [
      { id: 'lensL', shape: '<circle cx="150" cy="204" r="52"/>', color: '#2A2340' },
      { id: 'lensR', shape: '<circle cx="250" cy="204" r="52"/>', color: '#2A2340' },
      { id: 'shineL', shape: '<ellipse cx="132" cy="188" rx="12" ry="16"/>', color: '#7C9FF0' },
      { id: 'shineR', shape: '<ellipse cx="232" cy="188" rx="12" ry="16"/>', color: '#7C9FF0' },
    ],
  },
  {
    id: 'flipflops', difficulty: 2, title: { uk: 'В’єтнамки', en: 'Flip-flops', es: 'Chanclas' },
    steps: [],
    regions: [
      { id: 'soleL', shape: '<path d="M76 240 q4 -46 44 -46 q40 0 44 46 q4 60 -44 78 q-48 -18 -44 -78"/>', color: '#F08BB4' },
      { id: 'soleR', shape: '<path d="M236 240 q4 -46 44 -46 q40 0 44 46 q4 60 -44 78 q-48 -18 -44 -78"/>', color: '#F08BB4' },
      { id: 'strapL', shape: '<path d="M96 244 L120 200 L128 204 L112 250 L148 250 L148 260 L108 260 Z"/>', color: '#2A2340' },
      { id: 'strapR', shape: '<path d="M304 244 L280 200 L272 204 L288 250 L252 250 L252 260 L292 260 Z"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'surfboard', difficulty: 2, title: { uk: 'Дошка для серфінгу', en: 'Surfboard', es: 'Tabla de surf' },
    steps: [
      { id: 'stripe', shapes: ['<path d="M200 90 L200 330"/>'] },
    ],
    regions: [
      { id: 'board', shape: '<path d="M200 70 q90 40 60 200 q-14 60 -60 70 q-46 -10 -60 -70 q-30 -160 60 -200"/>', color: '#4E86E8' },
      { id: 'stripe', shape: '<path d="M188 100 L212 100 L206 310 L194 310 Z"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'seagull', difficulty: 1, title: { uk: 'Чайка', en: 'Seagull', es: 'Gaviota' },
    steps: [
      { id: 'face', shapes: ['<circle cx="244" cy="184" r="6"/>'] },
    ],
    regions: [
      { id: 'wingL', shape: '<path d="M210 196 q-90 -60 -160 -10 q80 34 160 34 z"/>', color: '#BCD2F0' },
      { id: 'wingR', shape: '<path d="M210 196 q90 -60 160 -10 q-80 34 -160 34 z"/>', color: '#BCD2F0' },
      { id: 'body', shape: '<ellipse cx="216" cy="198" rx="46" ry="30"/>', color: '#FBFAFF' },
      { id: 'beak', shape: '<path d="M256 184 q30 -8 28 8 q-4 14 -28 4 z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'swimsuit', difficulty: 2, title: { uk: 'Купальник', en: 'Swimsuit', es: 'Traje de baño' },
    steps: [
      { id: 'strapL', shapes: ['<path d="M160 140 L146 100"/>'] },
      { id: 'strapR', shapes: ['<path d="M240 140 L254 100"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M150 150 L250 150 L268 300 Q200 330 132 300 Z"/>', color: '#F08BB4' },
      { id: 'trim', shape: '<path d="M150 150 L250 150 L246 190 Q200 210 154 190 Z"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'snorkelmask', difficulty: 2, title: { uk: 'Маска для пірнання', en: 'Snorkel mask', es: 'Máscara de buceo' },
    steps: [
      { id: 'tube', shapes: ['<path d="M280 160 Q320 150 314 110"/>'] },
    ],
    regions: [
      { id: 'strap', shape: '<path d="M90 210 L310 210 l0 20 L90 230 Z"/>', color: '#2A2340' },
      { id: 'frame', shape: '<path d="M150 150 q50 -30 100 0 q10 60 -10 110 q-40 20 -80 0 q-20 -50 -10 -110"/>', color: '#4E86E8' },
      { id: 'lens', shape: '<ellipse cx="200" cy="210" rx="42" ry="56"/>', color: '#BEE3F8' },
    ],
  },
  {
    id: 'lighthouse', difficulty: 2, title: { uk: 'Маяк', en: 'Lighthouse', es: 'Faro' },
    steps: [
      { id: 'beam', shapes: ['<path d="M240 120 L310 90"/>'] },
      { id: 'bandline', shapes: ['<path d="M172 220 L228 220"/>'] },
    ],
    regions: [
      { id: 'tower', shape: '<path d="M180 340 L172 150 L228 150 L220 340 Z"/>', color: '#FFFFFF' },
      { id: 'band', shape: '<path d="M174 200 L226 200 L222 250 L178 250 Z"/>', color: '#E4443B' },
      { id: 'top', shape: '<path d="M164 150 L200 100 L236 150 Z"/>', color: '#E4443B' },
      { id: 'lamp', shape: '<rect x="186" y="118" width="28" height="32" rx="4"/>', color: '#FFC53D' },
    ],
  },
  {
    id: 'towel', difficulty: 1, title: { uk: 'Рушник', en: 'Towel', es: 'Toalla' },
    steps: [
      { id: 'lines', shapes: ['<path d="M130 170 L270 170"/>', '<path d="M130 230 L270 230"/>', '<path d="M130 290 L270 290"/>'] },
    ],
    regions: [
      { id: 'stripe1', shape: '<rect x="120" y="120" width="160" height="40" rx="4"/>', color: '#E4443B' },
      { id: 'stripe2', shape: '<rect x="120" y="180" width="160" height="40" rx="4"/>', color: '#FFC53D' },
      { id: 'stripe3', shape: '<rect x="120" y="240" width="160" height="40" rx="4"/>', color: '#4E86E8' },
      { id: 'stripe4', shape: '<rect x="120" y="300" width="160" height="40" rx="4"/>', color: '#4EA55F' },
    ],
  },
  {
    id: 'coconut', difficulty: 1, title: { uk: 'Кокос', en: 'Coconut', es: 'Coco' },
    steps: [
      { id: 'face', shapes: ['<circle cx="184" cy="212" r="8"/>', '<circle cx="220" cy="212" r="8"/>', '<circle cx="202" cy="240" r="6"/>'] },
    ],
    regions: [
      { id: 'shell', shape: '<circle cx="200" cy="220" r="100"/>', color: '#8B5E3C' },
      { id: 'shine', shape: '<ellipse cx="164" cy="184" rx="18" ry="26"/>', color: '#A9886F' },
    ],
  },
  {
    id: 'jellyfish', difficulty: 2, title: { uk: 'Медуза', en: 'Jellyfish', es: 'Medusa' },
    steps: [
      { id: 'tendrils', shapes: ['<path d="M160 210 Q150 280 168 330"/>', '<path d="M200 216 Q200 290 200 340"/>', '<path d="M240 210 Q250 280 232 330"/>'] },
    ],
    regions: [
      { id: 'bell', shape: '<path d="M110 200 a90 80 0 0 1 180 0 q0 30 -90 30 q-90 0 -90 -30"/>', color: '#9B5CE0' },
    ],
  },
  {
    id: 'seahorse', difficulty: 2, title: { uk: 'Морський коник', en: 'Seahorse', es: 'Caballito de mar' },
    steps: [
      { id: 'face', shapes: ['<circle cx="246" cy="146" r="6"/>'] },
      { id: 'spine', shapes: ['<path d="M186 200 Q206 230 186 260"/>', '<path d="M180 130 Q160 150 180 170"/>'] },
    ],
    regions: [
      { id: 'tail', shape: '<path d="M160 340 Q120 320 128 280 Q132 250 168 250 Q188 250 188 272 Q188 288 168 284"/>', color: '#F5893B' },
      { id: 'body', shape: '<path d="M168 284 Q140 220 168 170 Q150 130 188 100 Q230 80 258 112 Q278 136 256 156 L246 150 Q252 132 232 122 Q206 112 192 136 Q178 158 198 178 Q220 200 200 250 Q192 270 168 284"/>', color: '#F5893B' },
      { id: 'snout', shape: '<path d="M252 118 q30 -6 28 12 q-4 14 -28 2 z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'anchor', difficulty: 1, title: { uk: 'Якір', en: 'Anchor', es: 'Ancla' },
    steps: [
      { id: 'ring', shapes: ['<circle cx="200" cy="100" r="22"/>'] },
      { id: 'crossbar', shapes: ['<path d="M150 150 L250 150"/>'] },
    ],
    regions: [
      { id: 'shaft', shape: '<rect x="188" y="130" width="24" height="160" rx="8"/>', color: '#4E86E8' },
      { id: 'flukeL', shape: '<path d="M200 290 Q120 300 110 240 q46 6 60 46 z"/>', color: '#4E86E8' },
      { id: 'flukeR', shape: '<path d="M200 290 Q280 300 290 240 q-46 6 -60 46 z"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'beachhat', difficulty: 1, title: { uk: 'Капелюх', en: 'Sun hat', es: 'Sombrero' },
    steps: [
      { id: 'band', shapes: ['<path d="M150 216 L250 216"/>'] },
    ],
    regions: [
      { id: 'brim', shape: '<ellipse cx="200" cy="230" rx="130" ry="30"/>', color: '#FFC53D' },
      { id: 'crown', shape: '<path d="M148 220 q10 -90 52 -90 q52 0 52 90 z"/>', color: '#F5893B' },
      { id: 'band', shape: '<path d="M150 208 L252 208 L248 226 L154 226 Z"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'octopus', difficulty: 2, title: { uk: 'Восьминіг', en: 'Octopus', es: 'Pulpo' },
    steps: [
      { id: 'face', shapes: ['<circle cx="176" cy="176" r="9"/>', '<circle cx="224" cy="176" r="9"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<circle cx="200" cy="188" r="90"/>', color: '#9B5CE0' },
      { id: 'leg1', shape: '<path d="M130 240 q-40 40 -10 90 q30 -20 40 -70"/>', color: '#9B5CE0' },
      { id: 'leg2', shape: '<path d="M170 262 q-16 54 20 90 q20 -30 8 -80"/>', color: '#AB74E8' },
      { id: 'leg3', shape: '<path d="M230 262 q16 54 -20 90 q-20 -30 -8 -80"/>', color: '#9B5CE0' },
      { id: 'leg4', shape: '<path d="M270 240 q40 40 10 90 q-30 -20 -40 -70"/>', color: '#AB74E8' },
    ],
  },
  {
    id: 'buoy', difficulty: 1, title: { uk: 'Буй', en: 'Buoy', es: 'Boya' },
    steps: [],
    regions: [
      { id: 'ring', shape: '<path d="M180 100 a20 20 0 0 1 40 0 l0 20 l-40 0 z"/>', color: '#8B84A3' },
      { id: 'band1', shape: '<ellipse cx="200" cy="180" rx="80" ry="70"/>', color: '#E4443B' },
      { id: 'band2', shape: '<path d="M120 180 a80 70 0 0 0 160 0 l0 46 a80 70 0 0 1 -160 0 z"/>', color: '#FFFFFF' },
      { id: 'band3', shape: '<path d="M124 250 a80 60 0 0 0 152 0 q4 40 -76 60 q-80 -20 -76 -60"/>', color: '#E4443B' },
    ],
  },
]
