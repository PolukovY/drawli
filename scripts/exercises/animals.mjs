// Тварини. Most are built the same way a child draws them: one big round body,
// then ears/limbs, then the face — so every step adds something recognisable.
const CATEGORY = 'animals'

const eyes = (lx, rx, y, r = 9) =>
  [`<circle cx="${lx}" cy="${y}" r="${r}"/>`, `<circle cx="${rx}" cy="${y}" r="${r}"/>`]

export const ANIMALS = [
  {
    id: 'ladybug', title: { uk: 'Сонечко', en: 'Ladybug' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="220" rx="130" ry="124"/>'] },
      { id: 'head', shapes: ['<circle cx="200" cy="105" r="52"/>'] },
      { id: 'wings', shapes: ['<path d="M200 97 L200 343"/>'] },
      { id: 'spots', shapes: ['<circle cx="145" cy="170" r="20"/>', '<circle cx="108" cy="237" r="17"/>', '<circle cx="160" cy="267" r="18"/>', '<circle cx="255" cy="170" r="20"/>', '<circle cx="292" cy="237" r="17"/>', '<circle cx="240" cy="267" r="18"/>'] },
      { id: 'legs', shapes: ['<path d="M178 65 L152 33"/>', '<circle cx="149" cy="29" r="9"/>', '<path d="M222 65 L248 33"/>', '<circle cx="251" cy="29" r="9"/>', '<path d="M78 165 L36 143"/>', '<path d="M72 220 L26 220"/>', '<path d="M80 277 L38 301"/>', '<path d="M322 165 L364 143"/>', '<path d="M328 220 L374 220"/>', '<path d="M320 277 L362 301"/>'] },
    ],
    regions: [
      { id: 'shell', shape: '<ellipse cx="200" cy="220" rx="130" ry="124"/>', color: '#E4443B' },
      { id: 'head', shape: '<circle cx="200" cy="105" r="52"/>', color: '#2A2340' },
      { id: 'spots', shape: '<g><circle cx="145" cy="170" r="20"/><circle cx="108" cy="237" r="17"/><circle cx="160" cy="267" r="18"/><circle cx="255" cy="170" r="20"/><circle cx="292" cy="237" r="17"/><circle cx="240" cy="267" r="18"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'fish', title: { uk: 'Рибка', en: 'Fish' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="185" cy="200" rx="130" ry="90"/>'] },
      { id: 'tail', shapes: ['<path d="M315 200 L385 145 L385 255 Z"/>'] },
      { id: 'fins', shapes: ['<path d="M170 110 q40 -55 78 -6"/>', '<path d="M170 290 q40 55 78 6"/>'] },
      { id: 'face', shapes: ['<circle cx="110" cy="175" r="12"/>', '<path d="M62 210 q22 22 46 6"/>'] },
      { id: 'bubbles', shapes: ['<circle cx="60" cy="120" r="14"/>', '<circle cx="34" cy="82" r="9"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="185" cy="200" rx="130" ry="90"/>', color: '#5FC7C0' },
      { id: 'tail', shape: '<path d="M315 200 L385 145 L385 255 Z"/>', color: '#4E86E8' },
    ],
  },
  {
    id: 'butterfly', title: { uk: 'Метелик', en: 'Butterfly' }, difficulty: 'MEDIUM',
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
    id: 'cat', title: { uk: 'Котик', en: 'Cat' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="170" r="110"/>'] },
      { id: 'ears', shapes: ['<path d="M124 92 L112 20 L182 62 Z"/>', '<path d="M276 92 L288 20 L218 62 Z"/>'] },
      { id: 'face', shapes: [...eyes(162, 238, 158, 12), '<path d="M200 196 l-16 -12 h32 z"/>', '<path d="M200 200 q-4 26 -30 26"/>', '<path d="M200 200 q4 26 30 26"/>'] },
      { id: 'whiskers', shapes: ['<path d="M120 186 L44 172"/>', '<path d="M120 206 L46 214"/>', '<path d="M280 186 L356 172"/>', '<path d="M280 206 L354 214"/>'] },
      { id: 'body', shapes: ['<path d="M118 258 q-14 100 82 100 q96 0 82 -100"/>', '<path d="M282 320 q60 22 62 -46"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><circle cx="200" cy="170" r="110"/><path d="M124 92 L112 20 L182 62 Z"/><path d="M276 92 L288 20 L218 62 Z"/></g>', color: '#F5893B' },
      { id: 'body', shape: '<path d="M118 258 q-14 100 82 100 q96 0 82 -100 z"/>', color: '#F5893B' },
      { id: 'eyes', shape: '<g><circle cx="162" cy="158" r="12"/><circle cx="238" cy="158" r="12"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'dog', title: { uk: 'Песик', en: 'Dog' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="170" r="108"/>'] },
      { id: 'ears', shapes: ['<path d="M104 110 q-56 -20 -60 60 q-4 70 60 62 z"/>', '<path d="M296 110 q56 -20 60 60 q4 70 -60 62 z"/>'] },
      { id: 'face', shapes: [...eyes(166, 234, 154, 12), '<ellipse cx="200" cy="200" rx="22" ry="16"/>', '<path d="M200 216 L200 236"/>', '<path d="M200 236 q-24 20 -42 -4"/>', '<path d="M200 236 q24 20 42 -4"/>'] },
      { id: 'body', shapes: ['<path d="M126 250 q-16 108 74 108 q90 0 74 -108"/>'] },
      { id: 'tail', shapes: ['<path d="M274 322 q52 10 48 -48"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<circle cx="200" cy="170" r="108"/>', color: '#C98A4B' },
      { id: 'ears', shape: '<g><path d="M104 110 q-56 -20 -60 60 q-4 70 60 62 z"/><path d="M296 110 q56 -20 60 60 q4 70 -60 62 z"/></g>', color: '#8B5E3C' },
      { id: 'body', shape: '<path d="M126 250 q-16 108 74 108 q90 0 74 -108 z"/>', color: '#C98A4B' },
      { id: 'nose', shape: '<ellipse cx="200" cy="200" rx="22" ry="16"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'bunny', title: { uk: 'Зайчик', en: 'Bunny' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="200" r="96"/>'] },
      { id: 'ears', shapes: ['<ellipse cx="160" cy="80" rx="26" ry="72"/>', '<ellipse cx="240" cy="80" rx="26" ry="72"/>'] },
      { id: 'face', shapes: [...eyes(168, 232, 188, 11), '<path d="M200 216 l-14 -12 h28 z"/>', '<path d="M200 228 q-4 22 -26 22"/>', '<path d="M200 228 q4 22 26 22"/>'] },
      { id: 'whiskers', shapes: ['<path d="M132 222 L64 210"/>', '<path d="M132 238 L66 250"/>', '<path d="M268 222 L336 210"/>', '<path d="M268 238 L334 250"/>'] },
      { id: 'paws', shapes: ['<ellipse cx="152" cy="320" rx="34" ry="26"/>', '<ellipse cx="248" cy="320" rx="34" ry="26"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><circle cx="200" cy="200" r="96"/><ellipse cx="160" cy="80" rx="26" ry="72"/><ellipse cx="240" cy="80" rx="26" ry="72"/></g>', color: '#EDE6F5' },
      { id: 'paws', shape: '<g><ellipse cx="152" cy="320" rx="34" ry="26"/><ellipse cx="248" cy="320" rx="34" ry="26"/></g>', color: '#EDE6F5' },
      { id: 'nose', shape: '<path d="M200 216 l-14 -12 h28 z"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'bear', title: { uk: 'Ведмедик', en: 'Bear' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="190" r="112"/>'] },
      { id: 'ears', shapes: ['<circle cx="118" cy="106" r="40"/>', '<circle cx="282" cy="106" r="40"/>'] },
      { id: 'muzzle', shapes: ['<ellipse cx="200" cy="232" rx="62" ry="48"/>', '<ellipse cx="200" cy="212" rx="20" ry="15"/>'] },
      { id: 'face', shapes: [...eyes(160, 240, 170, 12), '<path d="M200 227 L200 246"/>', '<path d="M200 246 q-20 18 -34 -2"/>', '<path d="M200 246 q20 18 34 -2"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><circle cx="200" cy="190" r="112"/><circle cx="118" cy="106" r="40"/><circle cx="282" cy="106" r="40"/></g>', color: '#8B5E3C' },
      { id: 'muzzle', shape: '<ellipse cx="200" cy="232" rx="62" ry="48"/>', color: '#E0A860' },
      { id: 'nose', shape: '<ellipse cx="200" cy="212" rx="20" ry="15"/>', color: '#2A2340' },
    ],
  },
  {
    id: 'turtle', title: { uk: 'Черепаха', en: 'Turtle' }, difficulty: 'EASY',
    steps: [
      { id: 'shell', shapes: ['<path d="M70 240 a130 130 0 0 1 260 0 z"/>'] },
      { id: 'plates', shapes: ['<path d="M200 110 L200 240"/>', '<path d="M120 190 L280 190"/>', '<path d="M138 152 L262 152"/>'] },
      { id: 'head', shapes: ['<circle cx="336" cy="212" r="36"/>', '<circle cx="348" cy="202" r="7"/>'] },
      { id: 'legs', shapes: ['<ellipse cx="110" cy="266" rx="38" ry="24"/>', '<ellipse cx="264" cy="266" rx="38" ry="24"/>', '<path d="M64 244 q-34 6 -34 26"/>'] },
    ],
    regions: [
      { id: 'shell', shape: '<path d="M70 240 a130 130 0 0 1 260 0 z"/>', color: '#4EA55F' },
      { id: 'body', shape: '<g><circle cx="336" cy="212" r="36"/><ellipse cx="110" cy="266" rx="38" ry="24"/><ellipse cx="264" cy="266" rx="38" ry="24"/></g>', color: '#B7D24A' },
    ],
  },
  {
    id: 'duck', title: { uk: 'Каченя', en: 'Duckling' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="196" cy="256" rx="112" ry="86"/>'] },
      { id: 'head', shapes: ['<circle cx="264" cy="140" r="66"/>'] },
      { id: 'beak', shapes: ['<path d="M322 140 q56 -6 56 20 q-4 22 -56 12 z"/>'] },
      { id: 'face', shapes: ['<circle cx="286" cy="122" r="10"/>'] },
      { id: 'wing', shapes: ['<path d="M150 240 q60 -30 96 20 q-52 44 -96 -20 z"/>', '<path d="M124 330 q-16 22 6 26"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><ellipse cx="196" cy="256" rx="112" ry="86"/><circle cx="264" cy="140" r="66"/></g>', color: '#FFC53D' },
      { id: 'beak', shape: '<path d="M322 140 q56 -6 56 20 q-4 22 -56 12 z"/>', color: '#F5893B' },
      { id: 'wing', shape: '<path d="M150 240 q60 -30 96 20 q-52 44 -96 -20 z"/>', color: '#F0B429' },
    ],
  },
  {
    id: 'owl', title: { uk: 'Сова', en: 'Owl' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'body', shapes: ['<path d="M200 60 q120 0 120 150 q0 130 -120 130 q-120 0 -120 -130 q0 -150 120 -150 z"/>'] },
      { id: 'eyes', shapes: ['<circle cx="156" cy="160" r="46"/>', '<circle cx="244" cy="160" r="46"/>', '<circle cx="156" cy="160" r="18"/>', '<circle cx="244" cy="160" r="18"/>'] },
      { id: 'beak', shapes: ['<path d="M200 178 l-18 26 h36 z"/>'] },
      { id: 'wings', shapes: ['<path d="M92 190 q-8 90 44 116"/>', '<path d="M308 190 q8 90 -44 116"/>'] },
      { id: 'feet', shapes: ['<path d="M170 340 l0 24"/>', '<path d="M230 340 l0 24"/>', '<path d="M156 364 h28"/>', '<path d="M216 364 h28"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 60 q120 0 120 150 q0 130 -120 130 q-120 0 -120 -130 q0 -150 120 -150 z"/>', color: '#8B5E3C' },
      { id: 'eyes', shape: '<g><circle cx="156" cy="160" r="46"/><circle cx="244" cy="160" r="46"/></g>', color: '#FFFFFF' },
      { id: 'beak', shape: '<path d="M200 178 l-18 26 h36 z"/>', color: '#F5893B' },
    ],
  },
  {
    id: 'bee', title: { uk: 'Бджілка', en: 'Bee' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="230" rx="106" ry="86"/>'] },
      { id: 'stripes', shapes: ['<path d="M150 168 L150 292"/>', '<path d="M200 146 L200 316"/>', '<path d="M250 168 L250 292"/>'] },
      { id: 'wings', shapes: ['<ellipse cx="136" cy="126" rx="60" ry="38" transform="rotate(-28 136 126)"/>', '<ellipse cx="264" cy="126" rx="60" ry="38" transform="rotate(28 264 126)"/>'] },
      { id: 'face', shapes: ['<circle cx="176" cy="212" r="10"/>', '<circle cx="224" cy="212" r="10"/>', '<path d="M180 250 q20 18 40 0"/>'] },
      { id: 'antennae', shapes: ['<path d="M176 152 q-16 -34 -40 -42"/>', '<path d="M224 152 q16 -34 40 -42"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="200" cy="230" rx="106" ry="86"/>', color: '#FFC53D' },
      { id: 'wings', shape: '<g><ellipse cx="136" cy="126" rx="60" ry="38" transform="rotate(-28 136 126)"/><ellipse cx="264" cy="126" rx="60" ry="38" transform="rotate(28 264 126)"/></g>', color: '#D7EAF7' },
    ],
  },
  {
    id: 'snail', title: { uk: 'Равлик', en: 'Snail' }, difficulty: 'EASY',
    steps: [
      { id: 'shell', shapes: ['<circle cx="176" cy="192" r="106"/>'] },
      { id: 'spiral', shapes: ['<path d="M176 192 m0 -20 a20 20 0 1 1 -20 20 a42 42 0 1 1 42 42 a66 66 0 1 1 -66 -66"/>'] },
      { id: 'body', shapes: ['<path d="M78 260 q-24 60 30 68 h190 q34 -6 24 -44 q-10 -32 -46 -30"/>'] },
      { id: 'head', shapes: ['<circle cx="304" cy="266" r="34"/>', '<circle cx="316" cy="256" r="8"/>'] },
      { id: 'antennae', shapes: ['<path d="M312 234 q10 -34 34 -42"/>', '<circle cx="350" cy="188" r="8"/>', '<path d="M290 232 q-2 -36 16 -52"/>', '<circle cx="310" cy="176" r="8"/>'] },
    ],
    regions: [
      { id: 'shell', shape: '<circle cx="176" cy="192" r="106"/>', color: '#F5893B' },
      { id: 'body', shape: '<g><path d="M78 260 q-24 60 30 68 h190 q34 -6 24 -44 q-10 -32 -46 -30 z"/><circle cx="304" cy="266" r="34"/></g>', color: '#B7D24A' },
    ],
  },
  {
    id: 'frog', title: { uk: 'Жабка', en: 'Frog' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="240" rx="130" ry="104"/>'] },
      { id: 'eyes', shapes: ['<circle cx="146" cy="126" r="46"/>', '<circle cx="254" cy="126" r="46"/>', '<circle cx="146" cy="126" r="16"/>', '<circle cx="254" cy="126" r="16"/>'] },
      { id: 'mouth', shapes: ['<path d="M120 250 q80 62 160 0"/>'] },
      { id: 'legs', shapes: ['<path d="M96 300 q-46 26 -50 56 q40 10 66 -26"/>', '<path d="M304 300 q46 26 50 56 q-40 10 -66 -26"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><ellipse cx="200" cy="240" rx="130" ry="104"/><circle cx="146" cy="126" r="46"/><circle cx="254" cy="126" r="46"/></g>', color: '#4EA55F' },
      { id: 'belly', shape: '<ellipse cx="200" cy="290" rx="76" ry="46"/>', color: '#B7D24A' },
    ],
  },
  {
    id: 'penguin', title: { uk: 'Пінгвін', en: 'Penguin' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M200 50 q110 0 110 150 q0 150 -110 150 q-110 0 -110 -150 q0 -150 110 -150 z"/>'] },
      { id: 'belly', shapes: ['<ellipse cx="200" cy="220" rx="72" ry="112"/>'] },
      { id: 'face', shapes: ['<circle cx="172" cy="126" r="11"/>', '<circle cx="228" cy="126" r="11"/>', '<path d="M200 148 l-20 22 h40 z"/>'] },
      { id: 'wings', shapes: ['<path d="M90 180 q-30 80 18 130"/>', '<path d="M310 180 q30 80 -18 130"/>'] },
      { id: 'feet', shapes: ['<path d="M158 348 q-36 12 -30 26 h56 z"/>', '<path d="M242 348 q36 12 30 26 h-56 z"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<path d="M200 50 q110 0 110 150 q0 150 -110 150 q-110 0 -110 -150 q0 -150 110 -150 z"/>', color: '#2A2340' },
      { id: 'belly', shape: '<ellipse cx="200" cy="220" rx="72" ry="112"/>', color: '#FFFFFF' },
      { id: 'beak', shape: '<g><path d="M200 148 l-20 22 h40 z"/><path d="M158 348 q-36 12 -30 26 h56 z"/><path d="M242 348 q36 12 30 26 h-56 z"/></g>', color: '#F5893B' },
    ],
  },
  {
    id: 'elephant', title: { uk: 'Слоник', en: 'Elephant' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="180" r="104"/>'] },
      { id: 'ears', shapes: ['<ellipse cx="88" cy="180" rx="52" ry="76"/>', '<ellipse cx="312" cy="180" rx="52" ry="76"/>'] },
      { id: 'trunk', shapes: ['<path d="M170 260 q0 90 40 96 q46 6 44 -44 q-2 -30 -30 -26"/>'] },
      { id: 'face', shapes: ['<circle cx="164" cy="160" r="12"/>', '<circle cx="236" cy="160" r="12"/>'] },
      { id: 'tusks', shapes: ['<path d="M148 286 q-16 34 4 46"/>', '<path d="M252 286 q16 34 -4 46"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><circle cx="200" cy="180" r="104"/><path d="M170 260 q0 90 40 96 q46 6 44 -44 q-2 -30 -30 -26 z"/></g>', color: '#A9AFC0' },
      { id: 'ears', shape: '<g><ellipse cx="88" cy="180" rx="52" ry="76"/><ellipse cx="312" cy="180" rx="52" ry="76"/></g>', color: '#C4C9D6' },
    ],
  },
  {
    id: 'giraffe', title: { uk: 'Жирафа', en: 'Giraffe' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'neck', shapes: ['<path d="M164 360 L164 150"/>', '<path d="M240 360 L240 150"/>'] },
      { id: 'head', shapes: ['<ellipse cx="204" cy="118" rx="72" ry="52"/>', '<ellipse cx="266" cy="140" rx="30" ry="24"/>'] },
      { id: 'horns', shapes: ['<path d="M176 74 L168 40"/>', '<circle cx="166" cy="32" r="12"/>', '<path d="M232 74 L240 40"/>', '<circle cx="242" cy="32" r="12"/>'] },
      { id: 'face', shapes: ['<circle cx="186" cy="106" r="10"/>', '<circle cx="278" cy="132" r="6"/>'] },
      { id: 'spots', shapes: ['<circle cx="186" cy="200" r="16"/>', '<circle cx="220" cy="248" r="14"/>', '<circle cx="186" cy="296" r="15"/>', '<circle cx="222" cy="336" r="13"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><path d="M164 360 L164 150 L240 150 L240 360 Z"/><ellipse cx="204" cy="118" rx="72" ry="52"/><ellipse cx="266" cy="140" rx="30" ry="24"/></g>', color: '#FFC53D' },
      { id: 'spots', shape: '<g><circle cx="186" cy="200" r="16"/><circle cx="220" cy="248" r="14"/><circle cx="186" cy="296" r="15"/><circle cx="222" cy="336" r="13"/></g>', color: '#C98A4B' },
    ],
  },
  {
    id: 'mouse', title: { uk: 'Мишка', en: 'Mouse' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="210" r="94"/>'] },
      { id: 'ears', shapes: ['<circle cx="128" cy="122" r="48"/>', '<circle cx="272" cy="122" r="48"/>'] },
      { id: 'face', shapes: ['<circle cx="174" cy="200" r="10"/>', '<circle cx="226" cy="200" r="10"/>', '<circle cx="200" cy="236" r="14"/>'] },
      { id: 'whiskers', shapes: ['<path d="M186 244 L112 234"/>', '<path d="M186 254 L114 268"/>', '<path d="M214 244 L288 234"/>', '<path d="M214 254 L286 268"/>'] },
      { id: 'tail', shapes: ['<path d="M290 280 q70 20 60 70 q-10 34 -46 20"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><circle cx="200" cy="210" r="94"/><circle cx="128" cy="122" r="48"/><circle cx="272" cy="122" r="48"/></g>', color: '#A9AFC0' },
      { id: 'nose', shape: '<circle cx="200" cy="236" r="14"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'pig', title: { uk: 'Порося', en: 'Pig' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<circle cx="200" cy="200" r="112"/>'] },
      { id: 'ears', shapes: ['<path d="M118 122 L96 46 L172 82 Z"/>', '<path d="M282 122 L304 46 L228 82 Z"/>'] },
      { id: 'snout', shapes: ['<ellipse cx="200" cy="236" rx="56" ry="42"/>', '<ellipse cx="182" cy="236" rx="10" ry="14"/>', '<ellipse cx="218" cy="236" rx="10" ry="14"/>'] },
      { id: 'eyes', shapes: ['<circle cx="158" cy="168" r="12"/>', '<circle cx="242" cy="168" r="12"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><circle cx="200" cy="200" r="112"/><path d="M118 122 L96 46 L172 82 Z"/><path d="M282 122 L304 46 L228 82 Z"/></g>', color: '#F08BB4' },
      { id: 'snout', shape: '<ellipse cx="200" cy="236" rx="56" ry="42"/>', color: '#E77CA5' },
    ],
  },
  {
    id: 'cow', title: { uk: 'Корівка', en: 'Cow' }, difficulty: 'MEDIUM',
    steps: [
      { id: 'head', shapes: ['<ellipse cx="200" cy="196" rx="112" ry="102"/>'] },
      { id: 'ears', shapes: ['<ellipse cx="82" cy="164" rx="40" ry="26"/>', '<ellipse cx="318" cy="164" rx="40" ry="26"/>'] },
      { id: 'horns', shapes: ['<path d="M138 108 q-16 -46 -50 -50 q10 40 34 60"/>', '<path d="M262 108 q16 -46 50 -50 q-10 40 -34 60"/>'] },
      { id: 'muzzle', shapes: ['<ellipse cx="200" cy="254" rx="70" ry="46"/>', '<circle cx="180" cy="248" r="9"/>', '<circle cx="220" cy="248" r="9"/>'] },
      { id: 'face', shapes: ['<circle cx="158" cy="164" r="12"/>', '<circle cx="242" cy="164" r="12"/>', '<path d="M118 146 q-24 30 4 54"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><ellipse cx="200" cy="196" rx="112" ry="102"/><ellipse cx="82" cy="164" rx="40" ry="26"/><ellipse cx="318" cy="164" rx="40" ry="26"/></g>', color: '#FFFFFF' },
      { id: 'spot', shape: '<path d="M118 146 q-24 30 4 54 q30 22 46 -14 q12 -34 -20 -46 z"/>', color: '#2A2340' },
      { id: 'muzzle', shape: '<ellipse cx="200" cy="254" rx="70" ry="46"/>', color: '#F08BB4' },
    ],
  },
  {
    id: 'sheep', title: { uk: 'Овечка', en: 'Sheep' }, difficulty: 'EASY',
    steps: [
      { id: 'wool', shapes: ['<path d="M120 150 a44 44 0 0 1 44 -44 a48 48 0 0 1 72 0 a44 44 0 0 1 44 44 a44 44 0 0 1 20 60 a44 44 0 0 1 -44 52 h-112 a44 44 0 0 1 -44 -52 a44 44 0 0 1 20 -60 z"/>'] },
      { id: 'face', shapes: ['<ellipse cx="200" cy="212" rx="52" ry="46"/>', '<circle cx="182" cy="204" r="9"/>', '<circle cx="218" cy="204" r="9"/>'] },
      { id: 'ears', shapes: ['<ellipse cx="140" cy="196" rx="26" ry="16"/>', '<ellipse cx="260" cy="196" rx="26" ry="16"/>'] },
      { id: 'legs', shapes: ['<path d="M164 306 L164 350"/>', '<path d="M236 306 L236 350"/>'] },
    ],
    regions: [
      { id: 'wool', shape: '<path d="M120 150 a44 44 0 0 1 44 -44 a48 48 0 0 1 72 0 a44 44 0 0 1 44 44 a44 44 0 0 1 20 60 a44 44 0 0 1 -44 52 h-112 a44 44 0 0 1 -44 -52 a44 44 0 0 1 20 -60 z"/>', color: '#EDE6F5' },
      { id: 'face', shape: '<g><ellipse cx="200" cy="212" rx="52" ry="46"/><ellipse cx="140" cy="196" rx="26" ry="16"/><ellipse cx="260" cy="196" rx="26" ry="16"/></g>', color: '#2A2340' },
    ],
  },
  {
    id: 'chick', title: { uk: 'Курча', en: 'Chick' }, difficulty: 'VERY_EASY',
    steps: [
      { id: 'body', shapes: ['<circle cx="200" cy="220" r="110"/>'] },
      { id: 'beak', shapes: ['<path d="M200 214 l-26 18 l26 18 z" transform="translate(96 0)"/>', '<path d="M310 214 l30 18 l-30 18 z"/>'] },
      { id: 'face', shapes: ['<circle cx="248" cy="188" r="11"/>'] },
      { id: 'wing', shapes: ['<path d="M150 216 q54 -22 84 24 q-48 40 -84 -24 z"/>'] },
      { id: 'feet', shapes: ['<path d="M172 326 L158 358"/>', '<path d="M228 326 L242 358"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<circle cx="200" cy="220" r="110"/>', color: '#FFC53D' },
      { id: 'beak', shape: '<path d="M310 214 l30 18 l-30 18 z"/>', color: '#F5893B' },
      { id: 'wing', shape: '<path d="M150 216 q54 -22 84 24 q-48 40 -84 -24 z"/>', color: '#F0B429' },
    ],
  },
  {
    id: 'crab', title: { uk: 'Крабик', en: 'Crab' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<ellipse cx="200" cy="220" rx="120" ry="84"/>'] },
      { id: 'eyes', shapes: ['<path d="M170 150 L162 100"/>', '<circle cx="160" cy="88" r="16"/>', '<path d="M230 150 L238 100"/>', '<circle cx="240" cy="88" r="16"/>'] },
      { id: 'claws', shapes: ['<path d="M84 196 q-46 -28 -60 4 q-14 32 24 40 q-30 -22 36 -14"/>', '<path d="M316 196 q46 -28 60 4 q14 32 -24 40 q30 -22 -36 -14"/>'] },
      { id: 'legs', shapes: ['<path d="M100 272 L52 306"/>', '<path d="M140 292 L112 336"/>', '<path d="M300 272 L348 306"/>', '<path d="M260 292 L288 336"/>'] },
      { id: 'smile', shapes: ['<path d="M166 236 q34 26 68 0"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<ellipse cx="200" cy="220" rx="120" ry="84"/>', color: '#E4443B' },
      { id: 'claws', shape: '<g><path d="M84 196 q-46 -28 -60 4 q-14 32 24 40 q-30 -22 36 -14 z"/><path d="M316 196 q46 -28 60 4 q14 32 -24 40 q30 -22 -36 -14 z"/></g>', color: '#F5893B' },
    ],
  },
  {
    id: 'whale', title: { uk: 'Кит', en: 'Whale' }, difficulty: 'EASY',
    steps: [
      { id: 'body', shapes: ['<path d="M60 230 q0 -90 120 -90 q130 0 150 90 q-30 80 -150 80 q-120 0 -120 -80 z"/>'] },
      { id: 'tail', shapes: ['<path d="M330 230 q40 -60 58 -30 q-8 44 -12 58 q-22 -20 -46 -28"/>'] },
      { id: 'belly', shapes: ['<path d="M96 268 q100 44 210 -18"/>'] },
      { id: 'face', shapes: ['<circle cx="120" cy="212" r="12"/>', '<path d="M76 250 q26 18 48 2"/>'] },
      { id: 'spout', shapes: ['<path d="M170 140 q-14 -50 10 -70"/>', '<path d="M186 140 q10 -46 44 -58"/>'] },
    ],
    regions: [
      { id: 'body', shape: '<g><path d="M60 230 q0 -90 120 -90 q130 0 150 90 q-30 80 -150 80 q-120 0 -120 -80 z"/><path d="M330 230 q40 -60 58 -30 q-8 44 -12 58 q-22 -20 -46 -28 z"/></g>', color: '#4E86E8' },
      { id: 'belly', shape: '<path d="M96 268 q100 44 210 -18 q-40 52 -130 50 q-60 -2 -80 -32 z"/>', color: '#D7EAF7' },
    ],
  },
  {
    id: 'fox', title: { uk: 'Лисичка', en: 'Fox' }, difficulty: 'EASY',
    steps: [
      { id: 'head', shapes: ['<path d="M200 320 L86 150 q54 -50 114 -50 q60 0 114 50 z"/>'] },
      { id: 'ears', shapes: ['<path d="M100 160 L74 56 L160 108 Z"/>', '<path d="M300 160 L326 56 L240 108 Z"/>'] },
      { id: 'face', shapes: ['<circle cx="158" cy="186" r="12"/>', '<circle cx="242" cy="186" r="12"/>', '<path d="M200 274 l-18 -22 h36 z"/>'] },
      { id: 'cheeks', shapes: ['<path d="M124 208 q26 34 76 22"/>', '<path d="M276 208 q-26 34 -76 22"/>'] },
    ],
    regions: [
      { id: 'head', shape: '<g><path d="M200 320 L86 150 q54 -50 114 -50 q60 0 114 50 z"/><path d="M100 160 L74 56 L160 108 Z"/><path d="M300 160 L326 56 L240 108 Z"/></g>', color: '#F5893B' },
      { id: 'muzzle', shape: '<path d="M200 320 L146 240 q54 22 108 0 z"/>', color: '#FFFFFF' },
      { id: 'nose', shape: '<path d="M200 274 l-18 -22 h36 z"/>', color: '#2A2340' },
    ],
  },
].map((e) => ({ ...e, category: CATEGORY }))
