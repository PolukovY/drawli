// Транспорт — wheels and boxes, the easiest silhouettes to get right.
const CATEGORY = 'transport'

const wheels = (leftX, rightX, y, r) =>
  [`<circle cx="${leftX}" cy="${y}" r="${r}"/>`, `<circle cx="${rightX}" cy="${y}" r="${r}"/>`]

export const TRANSPORT = [
  {
    id: 'car', title: { uk: 'Машина', en: 'Car' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="40" y="200" width="320" height="90" rx="34"/>'] },
      { id: 'cabin', shapes: ['<path d="M110 200 L150 130 L260 130 L300 200 Z"/>'] },
      { id: 'wheels', shapes: wheels(120, 285, 295, 42) },
      { id: 'details', shapes: ['<circle cx="345" cy="228" r="14"/>', '<path d="M205 130 L205 200"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<rect x="40" y="200" width="320" height="90" rx="34"/>', color: '#4E86E8' },
      { id: 'cabin', shape: '<path d="M110 200 L150 130 L260 130 L300 200 Z"/>', color: '#8FC0FA' },
      { id: 'wheels', shape: '<g><circle cx="120" cy="295" r="42"/><circle cx="285" cy="295" r="42"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'bus', title: { uk: 'Автобус', en: 'Bus' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="40" y="110" width="320" height="180" rx="28"/>'] },
      { id: 'windows', shapes: ['<rect x="70" y="140" width="70" height="60" rx="10"/>', '<rect x="164" y="140" width="70" height="60" rx="10"/>', '<rect x="258" y="140" width="70" height="60" rx="10"/>'] },
      { id: 'door', shapes: ['<rect x="70" y="212" width="60" height="78" rx="8"/>'] },
      { id: 'wheels', shapes: wheels(112, 296, 296, 38) },
    ],
    regions: [
      { id: 'body', shape: '<rect x="40" y="110" width="320" height="180" rx="28"/>', color: '#FFC53D' },
      { id: 'windows', shape: '<g><rect x="70" y="140" width="70" height="60" rx="10"/><rect x="164" y="140" width="70" height="60" rx="10"/><rect x="258" y="140" width="70" height="60" rx="10"/></g>', color: '#D7EAF7' },
      { id: 'wheels', shape: '<g><circle cx="112" cy="296" r="38"/><circle cx="296" cy="296" r="38"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'truck', title: { uk: 'Вантажівка', en: 'Truck' }, difficulty: 'EASY',
    steps: [
      { id: 'trailer', shapes: ['<rect x="40" y="140" width="200" height="150" rx="12"/>'] },
      { id: 'cabin', shapes: ['<path d="M240 290 v-100 h60 l40 60 v40 z"/>'] },
      { id: 'window', shapes: ['<rect x="258" y="200" width="52" height="42" rx="8"/>'] },
      { id: 'wheels', shapes: wheels(104, 300, 300, 36).concat('<circle cx="180" cy="300" r="36"/>') },
    ],
    regions: [
      { id: 'trailer', shape: '<rect x="40" y="140" width="200" height="150" rx="12"/>', color: '#4EA55F' },
      { id: 'cabin', shape: '<path d="M240 290 v-100 h60 l40 60 v40 z"/>', color: '#E4443B' },
      { id: 'wheels', shape: '<g><circle cx="104" cy="300" r="36"/><circle cx="180" cy="300" r="36"/><circle cx="300" cy="300" r="36"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'tractor', title: { uk: 'Трактор', en: 'Tractor' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<path d="M90 260 v-70 h110 v-60 h80 v130 z"/>'] },
      { id: 'roof', shapes: ['<path d="M198 130 L198 92 L292 92 L292 130"/>', '<rect x="186" y="76" width="120" height="18" rx="8"/>'] },
      { id: 'wheels', shapes: ['<circle cx="122" cy="286" r="52"/>', '<circle cx="292" cy="300" r="38"/>', '<circle cx="122" cy="286" r="20"/>'] },
      { id: 'pipe', shapes: ['<rect x="150" y="120" width="22" height="70" rx="8"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><path d="M90 260 v-70 h110 v-60 h80 v130 z"/><rect x="150" y="120" width="22" height="70" rx="8"/></g>', color: '#4EA55F' },
      { id: 'wheels', shape: '<g><circle cx="122" cy="286" r="52"/><circle cx="292" cy="300" r="38"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'boat', title: { uk: 'Кораблик', en: 'Boat' }, difficulty: 'EASY',
    steps: [
      { id: 'hull', shapes: ['<path d="M50 250 h300 l-46 80 h-208 z"/>'] },
      { id: 'mast', shapes: ['<path d="M200 250 L200 60"/>'] },
      { id: 'sail', shapes: ['<path d="M200 80 L310 220 L200 220 Z"/>', '<path d="M186 100 L90 220 L186 220 Z"/>'] },
      { id: 'waves', shapes: ['<path d="M30 350 q30 -22 60 0 q30 22 60 0 q30 -22 60 0 q30 22 60 0 q30 -22 60 0"/>'] },
    ],
    regions: [
      { id: 'hull', shape: '<path d="M50 250 h300 l-46 80 h-208 z"/>', color: '#8B5E3C' },
      { id: 'sail-right', shape: '<path d="M200 80 L310 220 L200 220 Z"/>', color: '#E4443B' },
      { id: 'sail-left', shape: '<path d="M186 100 L90 220 L186 220 Z"/>', color: '#FFFFFF' },
    ],
  },
  {
    id: 'ship', title: { uk: 'Пароплав', en: 'Steamship' }, difficulty: 'EASY',
    steps: [
      { id: 'hull', shapes: ['<path d="M40 240 h320 q-20 90 -70 90 h-180 q-50 0 -70 -90 z"/>'] },
      { id: 'deck', shapes: ['<rect x="110" y="160" width="180" height="80" rx="10"/>'] },
      { id: 'windows', shapes: ['<circle cx="150" cy="200" r="16"/>', '<circle cx="200" cy="200" r="16"/>', '<circle cx="250" cy="200" r="16"/>'] },
      { id: 'funnel', shapes: ['<rect x="182" y="80" width="46" height="80" rx="8"/>', '<path d="M205 70 q-16 -36 12 -50"/>'] },
    ],
    regions: [
      { id: 'hull', shape: '<path d="M40 240 h320 q-20 90 -70 90 h-180 q-50 0 -70 -90 z"/>', color: '#E4443B' },
      { id: 'deck', shape: '<rect x="110" y="160" width="180" height="80" rx="10"/>', color: '#FFFFFF' },
      { id: 'funnel', shape: '<rect x="182" y="80" width="46" height="80" rx="8"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'submarine', title: { uk: 'Підводний човен', en: 'Submarine' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="60" y="160" width="260" height="130" rx="65"/>'] },
      { id: 'tower', shapes: ['<rect x="170" y="90" width="70" height="76" rx="12"/>', '<path d="M205 90 L205 50"/>'] },
      { id: 'windows', shapes: ['<circle cx="140" cy="226" r="22"/>', '<circle cx="205" cy="226" r="22"/>', '<circle cx="270" cy="226" r="22"/>'] },
      { id: 'propeller', shapes: ['<path d="M320 226 h30"/>', '<path d="M350 190 v72"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><rect x="60" y="160" width="260" height="130" rx="65"/><rect x="170" y="90" width="70" height="76" rx="12"/></g>', color: '#FFC53D' },
      { id: 'windows', shape: '<g><circle cx="140" cy="226" r="22"/><circle cx="205" cy="226" r="22"/><circle cx="270" cy="226" r="22"/></g>', color: '#D7EAF7' },
    ],
  },
  {
    id: 'rocket', title: { uk: 'Ракета', en: 'Rocket' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 40 q70 80 70 170 v60 h-140 v-60 q0 -90 70 -170 z"/>'] },
      { id: 'window', shapes: ['<circle cx="200" cy="150" r="34"/>'] },
      { id: 'fins', shapes: ['<path d="M130 200 q-60 40 -60 110 l60 -40 z"/>', '<path d="M270 200 q60 40 60 110 l-60 -40 z"/>'] },
      { id: 'flame', shapes: ['<path d="M164 270 q36 90 72 0"/>', '<path d="M184 290 q16 50 32 0"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 40 q70 80 70 170 v60 h-140 v-60 q0 -90 70 -170 z"/>', color: '#FFFFFF' },
      { id: 'fins', shape: '<g><path d="M130 200 q-60 40 -60 110 l60 -40 z"/><path d="M270 200 q60 40 60 110 l-60 -40 z"/></g>', color: '#E4443B' },
      { id: 'window', shape: '<circle cx="200" cy="150" r="34"/>', color: '#4E86E8' },
      { id: 'flame', shape: '<path d="M164 270 q36 90 72 0 z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'plane', title: { uk: 'Літак', en: 'Plane' }, difficulty: 'EASY',
    steps: [
      { id: 'fuselage', shapes: ['<path d="M40 200 q0 -40 60 -40 h180 q60 0 80 40 q-20 40 -80 40 h-180 q-60 0 -60 -40 z"/>'] },
      { id: 'wings', shapes: ['<path d="M150 200 l-40 -110 h50 l70 110 z"/>', '<path d="M150 200 l-40 110 h50 l70 -110 z"/>'] },
      { id: 'tail', shapes: ['<path d="M60 172 l-24 -70 h34 l30 70 z"/>'] },
      { id: 'windows', shapes: ['<circle cx="180" cy="192" r="12"/>', '<circle cx="220" cy="192" r="12"/>', '<circle cx="260" cy="192" r="12"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><path d="M40 200 q0 -40 60 -40 h180 q60 0 80 40 q-20 40 -80 40 h-180 q-60 0 -60 -40 z"/><path d="M60 172 l-24 -70 h34 l30 70 z"/></g>', color: '#FFFFFF' },
      { id: 'wings', shape: '<g><path d="M150 200 l-40 -110 h50 l70 110 z"/><path d="M150 200 l-40 110 h50 l70 -110 z"/></g>', color: '#4E86E8' },
    ],
  },
  {
    id: 'helicopter', title: { uk: 'Гелікоптер', en: 'Helicopter' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<path d="M70 220 q0 -70 90 -70 q80 0 110 70 q-20 60 -110 60 q-90 0 -90 -60 z"/>'] },
      { id: 'tail', shapes: ['<path d="M268 210 h100 v34 h-100"/>', '<path d="M368 190 v74"/>'] },
      { id: 'rotor', shapes: ['<path d="M160 150 L160 116"/>', '<path d="M40 112 h240"/>'] },
      { id: 'skids', shapes: ['<path d="M90 300 h180"/>', '<path d="M120 280 L120 300"/>', '<path d="M240 280 L240 300"/>'] },
      { id: 'window', shapes: ['<circle cx="130" cy="200" r="34"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><path d="M70 220 q0 -70 90 -70 q80 0 110 70 q-20 60 -110 60 q-90 0 -90 -60 z"/><path d="M268 210 h100 v34 h-100 z"/></g>', color: '#E4443B' },
      { id: 'window', shape: '<circle cx="130" cy="200" r="34"/>', color: '#D7EAF7' },
    ],
  },
  {
    id: 'train', title: { uk: 'Потяг', en: 'Train' }, difficulty: 'EASY',
    steps: [
      { id: 'engine', shapes: ['<path d="M180 290 v-120 h100 q40 0 40 60 v60 z"/>'] },
      { id: 'cabin', shapes: ['<rect x="60" y="120" width="120" height="170" rx="12"/>', '<rect x="86" y="150" width="68" height="60" rx="8"/>'] },
      { id: 'chimney', shapes: ['<rect x="270" y="110" width="40" height="60" rx="8"/>', '<circle cx="290" cy="80" r="24"/>'] },
      { id: 'wheels', shapes: wheels(110, 210, 316, 30).concat('<circle cx="290" cy="316" r="30"/>') },
    ],
    regions: [
      { id: 'engine', shape: '<g><path d="M180 290 v-120 h100 q40 0 40 60 v60 z"/><rect x="270" y="110" width="40" height="60" rx="8"/></g>', color: '#E4443B' },
      { id: 'cabin', shape: '<rect x="60" y="120" width="120" height="170" rx="12"/>', color: '#4E86E8' },
      { id: 'wheels', shape: '<g><circle cx="110" cy="316" r="30"/><circle cx="210" cy="316" r="30"/><circle cx="290" cy="316" r="30"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'bike', title: { uk: 'Велосипед', en: 'Bicycle' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'wheels', shapes: wheels(100, 300, 260, 76) },
      { id: 'frame', shapes: ['<path d="M100 260 L170 150 L268 150 L300 260"/>', '<path d="M170 150 L200 260"/>'] },
      { id: 'handles', shapes: ['<path d="M268 150 L286 106"/>', '<path d="M262 100 h48"/>'] },
      { id: 'seat', shapes: ['<path d="M150 128 h44 q10 12 -10 16 h-40 q-14 -8 6 -16 z"/>'] },
    ],
    regions: [
      { id: 'wheels', shape: '<g><circle cx="100" cy="260" r="76"/><circle cx="300" cy="260" r="76"/></g>', color: '#D7EAF7' },
      { id: 'seat', shape: '<path d="M150 128 h44 q10 12 -10 16 h-40 q-14 -8 6 -16 z"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'scooter', title: { uk: 'Самокат', en: 'Scooter' }, difficulty: 'EASY',
    steps: [
      { id: 'wheels', shapes: wheels(96, 316, 310, 38) },
      { id: 'deck', shapes: ['<path d="M96 310 h180 l40 -30"/>', '<path d="M120 288 h160"/>'] },
      { id: 'stem', shapes: ['<path d="M300 280 L300 110"/>'] },
      { id: 'handles', shapes: ['<path d="M262 100 h76"/>'] },
    ],
    regions: [
      { id: 'frame', shape: '<g><path d="M120 288 h180 v22 h-204 z"/><rect x="290" y="110" width="20" height="180"/><rect x="262" y="92" width="76" height="18" rx="8"/></g>', color: '#9B5CE0' },
      { id: 'wheels', shape: '<g><circle cx="96" cy="310" r="38"/><circle cx="316" cy="310" r="38"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'motorbike', title: { uk: 'Мотоцикл', en: 'Motorbike' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'wheels', shapes: wheels(96, 306, 280, 64) },
      { id: 'body', shapes: ['<path d="M96 280 L170 190 h90 l46 90"/>', '<path d="M160 190 q60 -30 110 0"/>'] },
      { id: 'seat', shapes: ['<path d="M150 176 h96 q16 16 -14 22 h-84 q-16 -12 2 -22 z"/>'] },
      { id: 'handles', shapes: ['<path d="M262 190 L286 140"/>', '<path d="M258 134 h56"/>'] },
    ],
    regions: [
      { id: 'wheels', shape: '<g><circle cx="96" cy="280" r="64"/><circle cx="306" cy="280" r="64"/></g>', color: '#2A2340' },
      { id: 'body', shape: '<path d="M96 280 L170 190 h90 l46 90 q-60 -50 -210 0 z"/>', color: '#E4443B' },
    ],
  },
  {
    id: 'ambulance', title: { uk: 'Швидка', en: 'Ambulance' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M40 290 v-140 h180 v50 h60 l60 50 v40 z"/>'] },
      { id: 'windows', shapes: ['<rect x="66" y="176" width="60" height="50" rx="8"/>', '<rect x="234" y="216" width="60" height="34" rx="8"/>'] },
      { id: 'cross', shapes: ['<path d="M150 200 h60"/>', '<path d="M180 170 v60"/>'] },
      { id: 'wheels', shapes: wheels(110, 290, 300, 34) },
      { id: 'siren', shapes: ['<rect x="80" y="128" width="50" height="24" rx="10"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M40 290 v-140 h180 v50 h60 l60 50 v40 z"/>', color: '#FFFFFF' },
      { id: 'cross', shape: '<g><rect x="150" y="188" width="60" height="24"/><rect x="168" y="170" width="24" height="60"/></g>', color: '#E4443B' },
      { id: 'wheels', shape: '<g><circle cx="110" cy="300" r="34"/><circle cx="290" cy="300" r="34"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'firetruck', title: { uk: 'Пожежна машина', en: 'Fire truck' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<path d="M40 290 v-110 h230 v-40 h50 l40 60 v90 z"/>'] },
      { id: 'ladder', shapes: ['<path d="M60 170 L250 110"/>', '<path d="M70 190 L262 130"/>', '<path d="M100 162 L110 184"/>', '<path d="M160 144 L170 166"/>', '<path d="M220 126 L230 148"/>'] },
      { id: 'window', shapes: ['<rect x="286" y="156" width="50" height="40" rx="8"/>'] },
      { id: 'wheels', shapes: wheels(110, 300, 300, 34) },
    ],
    regions: [
      { id: 'body', shape: '<path d="M40 290 v-110 h230 v-40 h50 l40 60 v90 z"/>', color: '#E4443B' },
      { id: 'ladder', shape: '<path d="M60 170 L250 110 L262 130 L70 190 z"/>', color: '#C4C9D6' },
      { id: 'wheels', shape: '<g><circle cx="110" cy="300" r="34"/><circle cx="300" cy="300" r="34"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'hotairballoon', title: { uk: 'Повітряна куля', en: 'Hot air balloon' }, difficulty: 'EASY',
    steps: [
      { id: 'envelope', shapes: ['<path d="M200 40 q120 0 120 130 q0 90 -120 130 q-120 -40 -120 -130 q0 -130 120 -130 z"/>'] },
      { id: 'stripes', shapes: ['<path d="M200 40 q-46 130 0 260"/>', '<path d="M200 40 q46 130 0 260"/>'] },
      { id: 'ropes', shapes: ['<path d="M150 288 L166 330"/>', '<path d="M250 288 L234 330"/>'] },
      { id: 'basket', shapes: ['<path d="M166 330 h68 l-8 44 h-52 z"/>'] },
    ],
    regions: [
      { id: 'left', shape: '<path d="M200 40 q-120 0 -120 130 q0 90 120 130 q-46 -130 0 -260 z"/>', color: '#E4443B' },
      { id: 'right', shape: '<path d="M200 40 q120 0 120 130 q0 90 -120 130 q46 -130 0 -260 z"/>', color: '#FFC53D' },
      { id: 'basket', shape: '<path d="M166 330 h68 l-8 44 h-52 z"/>', color: '#8B5E3C' },
    ],
  },
  {
    id: 'taxi', title: { uk: 'Таксі', en: 'Taxi' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<rect x="40" y="200" width="320" height="86" rx="30"/>'] },
      { id: 'cabin', shapes: ['<path d="M116 200 L156 132 L262 132 L296 200 Z"/>'] },
      { id: 'sign', shapes: ['<rect x="176" y="102" width="60" height="30" rx="8"/>'] },
      { id: 'wheels', shapes: wheels(120, 288, 292, 40) },
      { id: 'checks', shapes: ['<path d="M60 244 h280"/>', '<path d="M100 230 v28"/>', '<path d="M160 230 v28"/>', '<path d="M220 230 v28"/>', '<path d="M280 230 v28"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><rect x="40" y="200" width="320" height="86" rx="30"/><path d="M116 200 L156 132 L262 132 L296 200 Z"/><rect x="176" y="102" width="60" height="30" rx="8"/></g>', color: '#FFC53D' },
      { id: 'wheels', shape: '<g><circle cx="120" cy="292" r="40"/><circle cx="288" cy="292" r="40"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'digger', title: { uk: 'Екскаватор', en: 'Digger' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<rect x="60" y="180" width="150" height="100" rx="14"/>'] },
      { id: 'cabin', shapes: ['<rect x="86" y="110" width="100" height="70" rx="12"/>'] },
      { id: 'arm', shapes: ['<path d="M210 200 L300 140"/>', '<path d="M300 140 L340 230"/>'] },
      { id: 'bucket', shapes: ['<path d="M320 226 h60 v50 q-30 20 -60 0 z"/>'] },
      { id: 'tracks', shapes: ['<rect x="46" y="286" width="190" height="56" rx="28"/>', '<circle cx="88" cy="314" r="18"/>', '<circle cx="196" cy="314" r="18"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><rect x="60" y="180" width="150" height="100" rx="14"/><rect x="86" y="110" width="100" height="70" rx="12"/></g>', color: '#FFC53D' },
      { id: 'bucket', shape: '<path d="M320 226 h60 v50 q-30 20 -60 0 z"/>', color: '#F5893B' },
      { id: 'tracks', shape: '<rect x="46" y="286" width="190" height="56" rx="28"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'sled', title: { uk: 'Санчата', en: 'Sled' }, difficulty: 'EASY',
    steps: [
      { id: 'seat', shapes: ['<rect x="80" y="200" width="240" height="30" rx="10"/>'] },
      { id: 'runners', shapes: ['<path d="M70 300 h250 q40 0 40 -40"/>', '<path d="M90 260 v40"/>', '<path d="M300 260 v40"/>'] },
      { id: 'posts', shapes: ['<path d="M120 230 v40"/>', '<path d="M200 230 v40"/>', '<path d="M280 230 v40"/>'] },
      { id: 'rope', shapes: ['<path d="M360 260 q40 -40 20 -80"/>'] },
    ],
    regions: [
      { id: 'sled', shape: '<g><rect x="80" y="200" width="240" height="30" rx="10"/><path d="M70 292 h250 q40 0 40 -32 h-16 q0 16 -24 16 h-250 z"/></g>', color: '#E4443B' },
    ],
  },
].map((e) => ({ ...e, category: CATEGORY }))
