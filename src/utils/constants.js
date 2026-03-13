export const TYPE_COLORS = {
  fire: '#FF6B35', water: '#4A9FD5', grass: '#5BAD5B', electric: '#F7C948',
  psychic: '#E8608A', ice: '#7ECECE', dragon: '#6B5FD8', dark: '#5A4B3E',
  fairy: '#F0B8D8', fighting: '#C84838', poison: '#9B59B6', ground: '#C8A040',
  flying: '#82A8D0', bug: '#8BC450', rock: '#A09058', ghost: '#7060A8',
  steel: '#8888A8', normal: '#888878',
}

export const TYPE_EMOJI = {
  fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', psychic: '🔮',
  ice: '❄️', dragon: '🐉', dark: '🌑', fairy: '✨', fighting: '👊',
  poison: '☠️', ground: '🌍', flying: '🌤️', bug: '🐛', rock: '🪨',
  ghost: '👻', steel: '⚙️', normal: '⭐',
}

export const STAT_LABELS = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
}

export const GENERATIONS = [
  { id: 1, label: 'GEN I',   from: 1,   to: 151  },
  { id: 2, label: 'GEN II',  from: 152, to: 251  },
  { id: 3, label: 'GEN III', from: 252, to: 386  },
  { id: 4, label: 'GEN IV',  from: 387, to: 493  },
  { id: 5, label: 'GEN V',   from: 494, to: 649  },
  { id: 6, label: 'GEN VI',  from: 650, to: 721  },
  { id: 7, label: 'GEN VII', from: 722, to: 809  },
  { id: 8, label: 'GEN VIII',from: 810, to: 905  },
  { id: 9, label: 'GEN IX',  from: 906, to: 1025 },
  { id: 'all', label: 'TODOS' },
]

// Games ordered by EUR release date. Only mainline EUR releases included.
// PokéAPI version names → { emoji, color, display label }
export const GAME_META = {
  // Gen I — 1999 EUR
  red:                { e: '🔴', c: '#CC0000', l: 'Rojo' },
  blue:               { e: '🔵', c: '#0055CC', l: 'Azul' },
  yellow:             { e: '⚡', c: '#FFD700', l: 'Amarillo' },
  // Gen II — 2001 EUR
  gold:               { e: '🥇', c: '#DAA520', l: 'Oro' },
  silver:             { e: '🥈', c: '#A0A0C0', l: 'Plata' },
  crystal:            { e: '💎', c: '#44CCFF', l: 'Cristal' },
  // Gen III — 2003–2005 EUR
  ruby:               { e: '♦️',  c: '#CC2244', l: 'Rubí' },
  sapphire:           { e: '🔷', c: '#2255CC', l: 'Zafiro' },
  firered:            { e: '🔥', c: '#FF6600', l: 'Rojo Fuego' },
  leafgreen:          { e: '🍃', c: '#44AA00', l: 'Verde Hoja' },
  emerald:            { e: '💚', c: '#00AA44', l: 'Esmeralda' },
  // Gen IV — 2007–2010 EUR
  diamond:            { e: '💠', c: '#88AAFF', l: 'Diamante' },
  pearl:              { e: '🩷', c: '#FFAACC', l: 'Perla' },
  platinum:           { e: '⬜', c: '#AAAACC', l: 'Platino' },
  heartgold:          { e: '❤️', c: '#FFB800', l: 'HeartGold' },
  soulsilver:         { e: '🌙', c: '#CCCCEE', l: 'SoulSilver' },
  // Gen V — 2011–2012 EUR
  black:              { e: '⬛', c: '#444466', l: 'Negro' },
  white:              { e: '⬜', c: '#DDDDFF', l: 'Blanco' },
  'black-2':          { e: '🖤', c: '#333355', l: 'Negro 2' },
  'white-2':          { e: '🤍', c: '#EEEEFF', l: 'Blanco 2' },
  // Gen VI — 2013–2014 EUR
  x:                  { e: '❌', c: '#0088FF', l: 'X' },
  y:                  { e: '🔀', c: '#FF4444', l: 'Y' },
  'omega-ruby':       { e: '🌀', c: '#CC1133', l: 'Rubí Omega' },
  'alpha-sapphire':   { e: '🌊', c: '#1144CC', l: 'Zafiro Alfa' },
  // Gen VII — 2016–2018 EUR
  sun:                { e: '☀️', c: '#FF8800', l: 'Sol' },
  moon:               { e: '🌙', c: '#6644AA', l: 'Luna' },
  'ultra-sun':        { e: '🌞', c: '#FF6600', l: 'Ultrasol' },
  'ultra-moon':       { e: '🌛', c: '#443388', l: 'Ultraluna' },
  'lets-go-pikachu':  { e: '⚡', c: '#FFD700', l: "Let's Go Pikachu" },
  'lets-go-eevee':    { e: '🦊', c: '#CC8800', l: "Let's Go Eevee" },
  // Gen VIII — 2019–2022 EUR
  sword:              { e: '⚔️', c: '#3366FF', l: 'Espada' },
  shield:             { e: '🛡️', c: '#CC2200', l: 'Escudo' },
  'brilliant-diamond':{ e: '💎', c: '#66AAFF', l: 'Diamante Brillante' },
  'shining-pearl':    { e: '🌸', c: '#FFAADD', l: 'Perla Reluciente' },
  'legends-arceus':   { e: '✨', c: '#6644BB', l: 'Leyendas: Arceus' },
  // Gen IX — 2022 EUR
  scarlet:            { e: '🌹', c: '#CC1100', l: 'Escarlata' },
  violet:             { e: '🪻', c: '#7722CC', l: 'Púrpura' },
}

// Release order for sorting (EUR dates). Index = sort priority.
export const GAME_RELEASE_ORDER = [
  'red','blue','yellow',
  'gold','silver','crystal',
  'ruby','sapphire','firered','leafgreen','emerald',
  'diamond','pearl','platinum','heartgold','soulsilver',
  'black','white','black-2','white-2',
  'x','y','omega-ruby','alpha-sapphire',
  'sun','moon','ultra-sun','ultra-moon','lets-go-pikachu','lets-go-eevee',
  'sword','shield','brilliant-diamond','shining-pearl','legends-arceus',
  'scarlet','violet',
]

export function getTypeColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.normal
}

export function getGameMeta(name) {
  return GAME_META[name] || { e: '🎮', c: '#556', l: name.replace(/-/g, ' ') }
}
