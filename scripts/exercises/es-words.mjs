// Spanish names for the pictures, each with its article — the article is half
// the word for a learner, so it ships as data rather than being guessed.
// "los" / "las" mark plurals: they are kept out of the el/la game.
const el = (word) => ({ word, article: 'el' })
const la = (word) => ({ word, article: 'la' })
const los = (word) => ({ word, article: 'los' })
const las = (word) => ({ word, article: 'las' })

export const ES_WORDS = {
  // Природа
  sun: el('SOL'), cloud: la('NUBE'), rainbow: el('ARCOIRIS'), raindrop: la('GOTA'),
  snowflake: el('COPO'), moon: la('LUNA'), tree: el('ARBOL'), firtree: el('ABETO'),
  palm: la('PALMERA'), flower: la('FLOR'), tulip: el('TULIPAN'), sunflower: el('GIRASOL'),
  mushroom: la('SETA'), leaf: la('HOJA'), acorn: la('BELLOTA'), cactus: el('CACTUS'),
  mountain: la('MONTANA'), shell: la('CONCHA'), skystars: las('ESTRELLAS'),
  lightning: el('RAYO'), planet: el('PLANETA'), anthill: la('PIEDRA'),

  // Тварини
  ladybug: la('MARIQUITA'), fish: el('PEZ'), butterfly: la('MARIPOSA'), cat: el('GATO'),
  dog: el('PERRO'), bunny: el('CONEJO'), bear: el('OSO'), turtle: la('TORTUGA'),
  duck: el('PATO'), owl: el('BUHO'), bee: la('ABEJA'), snail: el('CARACOL'),
  frog: la('RANA'), penguin: el('PINGUINO'), elephant: el('ELEFANTE'), giraffe: la('JIRAFA'),
  mouse: el('RATON'), pig: el('CERDO'), cow: la('VACA'), sheep: la('OVEJA'),
  chick: el('POLLITO'), crab: el('CANGREJO'), whale: la('BALLENA'), fox: el('ZORRO'),

  // Смаколики
  apple: la('MANZANA'), pear: la('PERA'), banana: el('PLATANO'), cherries: las('CEREZAS'),
  watermelon: la('SANDIA'), strawberry: la('FRESA'), grapes: las('UVAS'), orange: la('NARANJA'),
  lemon: el('LIMON'), icecream: el('HELADO'), popsicle: el('POLO'), cupcake: el('PASTELITO'),
  donut: la('DONA'), cookie: la('GALLETA'), candy: el('CARAMELO'), lollipop: la('PIRULETA'),
  pizza: la('PIZZA'), cake: la('TARTA'), croissant: el('CRUASAN'), carrot: la('ZANAHORIA'),
  corn: el('MAIZ'), juice: el('ZUMO'),

  // Дім і речі
  house: la('CASA'), castle: el('CASTILLO'), umbrella: el('PARAGUAS'), cup: la('TAZA'),
  teapot: la('TETERA'), clock: el('RELOJ'), key: la('LLAVE'), lamp: la('LAMPARA'),
  bed: la('CAMA'), chair: la('SILLA'), door: la('PUERTA'), window: la('VENTANA'),
  book: el('LIBRO'), backpack: la('MOCHILA'), ball: la('PELOTA'), kite: la('COMETA'),
  balloon: el('GLOBO'), gift: el('REGALO'), candle: la('VELA'), vase: el('JARRON'),

  // Транспорт
  car: el('COCHE'), bus: el('AUTOBUS'), truck: el('CAMION'), tractor: el('TRACTOR'),
  boat: el('BARCO'), ship: el('BUQUE'), submarine: el('SUBMARINO'), rocket: el('COHETE'),
  plane: el('AVION'), helicopter: el('HELICOPTERO'), train: el('TREN'), bike: la('BICI'),
  scooter: el('PATINETE'), motorbike: la('MOTO'), ambulance: la('AMBULANCIA'),
  firetruck: los('BOMBEROS'), hotairballoon: el('GLOBO AEROSTATICO'), taxi: el('TAXI'),
  digger: la('EXCAVADORA'), sled: el('TRINEO'),

  // Фігури
  circle: el('CIRCULO'), square: el('CUADRADO'), triangle: el('TRIANGULO'),
  rectangle: el('RECTANGULO'), oval: el('OVALO'), heart: el('CORAZON'), star: la('ESTRELLA'),
  diamond: el('ROMBO'), pentagon: el('PENTAGONO'), hexagon: el('HEXAGONO'),
  octagon: el('OCTAGONO'), crescent: la('LUNA'), cross: la('CRUZ'), arrow: la('FLECHA'),
  semicircle: el('SEMICIRCULO'), trapezoid: el('TRAPECIO'), ring: el('ANILLO'),
  egg: el('HUEVO'), cloudshape: la('NUBE'), spiralshape: la('ESPIRAL'),
}
