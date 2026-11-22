/**
 * Worldbox Game - World Model
 * Pure simulation engine. All game rules and state live here.
 * Rendering is a thin adapter over this module.
 */

// ── World ────────────────────────────────────────────────────────────────

const WORLD = {
  width: 50,
  height: 50,
  turn: 1,
  day: 1,
  month: 1,
  season: 1, // 1=spring, 2=summer, 3=autumn, 4=winter
  weather: 1, // 1=stormy, 2=rainy, 3=clear, 4=dry
  resources: {
    gold: 0,
    food: 0,
    wood: 1000,
    stone: 500,
    population: 0,
    guilds: 1,
  },
  wealth: 0,
  reputation: 100,
  unrest: 0,
  score: 0,
  kingdoms: [],
  buildings: [],
  creatures: [],
  animals: [],
  events: [],
  turnHistory: [],
};

// ── Trait System ──────────────────────────────────────────────────────────

const TRAITS = {
  // Race traits
  STONE_SKIN: { id: 'STONE_SKIN', name: 'Stone Skin', desc: 'Resists disease and wounds', emoji: '🪨', color: '#8a8a8a' },
  EARTHEN_BLOOD: { id: 'EARTHEN_BLOOD', name: 'Earthen Blood', desc: 'Rebuilds health naturally', emoji: '🗿', color: '#6b6b6b' },
  Dwarven_Brawn: { id: 'DWARVEN_BRAWN', name: 'Dwarven Brawn', desc: 'Gains +2 strength', emoji: '💪', color: '#5a4a3a' },
  Gnomish_SKILL: { id: 'GNOMISH_SKILL', name: 'Gnomish Skill', desc: 'Builds structures faster', emoji: '🧝', color: '#6b8a6b' },
  Human_CURIOSITY: { id: 'HUMAN_CURIOSITY', name: 'Human Curiosity', desc: 'Discovers new lands', emoji: '🌍', color: '#8a6a5a' },
  Elf_ELEGANCE: { id: 'ELF_ELEGANCE', name: 'Elf Elegance', desc: 'Builds beautiful structures', emoji: '🌿', color: '#6a9a6a' },
  Giant_STRENGTH: { id: 'GIANT_STRENGTH', name: 'Giant Strength', desc: 'Unmatched strength and resilience', emoji: '🧗', color: '#7a6a4a' },
  Elf_MYSTICISM: { id: 'ELF_MYSTICISM', name: 'Elf Mysticism', desc: 'Gains mana', emoji: '🔮', color: '#6a5a9a' },
  Dwarf_MINING: { id: 'DWARF_MINING', name: 'Dwarf Mining', desc: 'Finds more minerals', emoji: '⛏️', color: '#5a5a6a' },
  Human_ADVENTUROUS: { id: 'HUMAN_ADVENTUROUS', name: 'Human Adventurous', desc: 'Explores faster', emoji: '🗡️', color: '#8a5a3a' },
  // Building traits
  DEFENSIVE: { id: 'DEFENSIVE', name: 'Defensive', desc: 'Provides protection', emoji: '🛡️' },
  OFFENSIVE: { id: 'OFFENSIVE', name: 'Offensive', desc: 'Provides attackpower', emoji: '⚔️' },
  ECONOMIC: { id: 'ECONOMIC', name: 'Economic', desc: 'Generates wealth', emoji: '💰' },
  AGRICULTURAL: { id: 'AGRICULTURAL', name: 'Agricultural', desc: 'Produces food', emoji: '🌾' },
  RELIGIOUS: { id: 'RELIGIOUS', name: 'Religious', desc: 'Raises allegiance', emoji: '⛪' },
  AESTHETIC: { id: 'AESTHETIC', name: 'Aesthetic', desc: 'Improves appearance', emoji: '🎨' },
  // Animal traits
  HERBIVORE: { id: 'HERBIVORE', name: 'Herbivore', desc: 'Eats plants', emoji: '🐄' },
  CARNIVORE: { id: 'CARNIVORE', name: 'Carnivore', desc: 'Eats meat', emoji: '🐺' },
  OMNIVORE: { id: 'OMNIVORE', name: 'Omnivore', desc: 'Eats anything', emoji: '🐗' },
  DOMESTIC: { id: 'DOMESTIC', name: 'Domestic', desc: 'Can be tamed', emoji: '🐕' },
  WILD: { id: 'WILD', name: 'Wild', desc: 'Cannot be tamed', emoji: '🦌' },
  HUNTING: { id: 'HUNTING', name: 'Hunting', desc: 'Provides meat', emoji: '🏹' },
  HERDLING: { id: 'HERDLING', name: 'Herding', desc: 'Provides wool/milk', emoji: '🐑' },
  PEST: { id: 'PEST', name: 'Pest', desc: 'Damages crops', emoji: '🐜' },
  // Politics traits
  DEMOCRACY: { id: 'DEMOCRACY', name: 'Democracy', desc: 'Happy citizens', emoji: '🇺🇸' },
  MONARCHY: { id: 'MONARCHY', name: 'Monarchy', desc: 'Centralized control', emoji: '👑' },
  THEOCRACY: { id: 'THEOCRACY', name: 'Theocracy', desc: 'Religious adherence', emoji: '✝️' },
  DICTATORSHIP: { id: 'DICTATORSHIP', name: 'Dictatorship', desc: 'Strict control', emoji: '⛨' },
  ANARCHY: { id: 'ANARCHY', name: 'Anarchy', desc: 'Lawless', emoji: '☭' },
  SACK: { id: 'SACK', name: 'Sack', desc: 'Destroys everything', emoji: '💥' },
  // Species
  HUMAN: { id: 'HUMAN', name: 'Human', emoji: '👤', color: '#8a6a5a' },
  GIANT: { id: 'GIANT', name: 'Giant', emoji: '🧗', color: '#7a6a4a' },
  ELF: { id: 'ELF', name: 'Elf', emoji: '🌿', color: '#6a9a6a' },
  DWARF: { id: 'DWARF', name: 'Dwarf', emoji: '🧝', color: '#5a5a6a' },
  GNOME: { id: 'GNOME', name: 'Gnome', emoji: '🧚', color: '#8a9a5a' },
  ORC: { id: 'ORC', name: 'Orc', emoji: '👹', color: '#5a4a3a' },
  DRAGON: { id: 'DRAGON', name: 'Dragon', emoji: '🐉', color: '#6a4a2a' },
  GHOST: { id: 'GHOST', name: 'Ghost', emoji: '👻', color: '#6a6a7a' },
  PETRIFACTION: { id: 'PETRIFACTION', name: 'Petrifaction', emoji: '🪨', color: '#4a4a4a' },
  TREE: { id: 'TREE', name: 'Tree', emoji: '🌲', color: '#5a8a3a' },
};

// ── Race Definitions ──────────────────────────────────────────────────────

const RACES = [
  {
    id: 'HUMAN',
    name: 'Human',
    emoji: '👤',
    color: '#8a6a5a',
    traits: ['HUMAN_CURIOSITY', 'HUMAN_ADVENTUROUS'],
    population: 0,
    growth: 0.05,
    housing: 1,
    happiness: 50,
    allegiance: 100,
    strength: 5,
    wisdom: 5,
    wealth: 5,
    taxRate: 10,
  },
  {
    id: 'GIANT',
    name: 'Giant',
    emoji: '🧗',
    color: '#7a6a4a',
    traits: ['GIANT_STRENGTH', 'STONE_SKIN'],
    population: 0,
    growth: 0.03,
    housing: 2,
    happiness: 60,
    allegiance: 80,
    strength: 10,
    wisdom: 2,
    wealth: 3,
    taxRate: 15,
  },
  {
    id: 'ELF',
    name: 'Elf',
    emoji: '🌿',
    color: '#6a9a6a',
    traits: ['ELF_ELEGANCE', 'ELF_MYSTICISM'],
    population: 0,
    growth: 0.08,
    housing: 1,
    happiness: 70,
    allegiance: 90,
    strength: 3,
    wisdom: 8,
    wealth: 7,
    taxRate: 5,
  },
  {
    id: 'DWARF',
    name: 'Dwarf',
    emoji: '🧝',
    color: '#5a5a6a',
    traits: ['DWARVEN_BRAWN', 'DWARF_MINING'],
    population: 0,
    growth: 0.06,
    housing: 1.5,
    happiness: 65,
    allegiance: 85,
    strength: 8,
    wisdom: 4,
    wealth: 6,
    taxRate: 12,
  },
  {
    id: 'GNOME',
    name: 'Gnome',
    emoji: '🧚',
    color: '#8a9a5a',
    traits: ['GNOMISH_SKILL', 'Dwarven_Brawn'],
    population: 0,
    growth: 0.1,
    housing: 0.8,
    happiness: 75,
    allegiance: 70,
    strength: 6,
    wisdom: 9,
    wealth: 8,
    taxRate: 8,
  },
  {
    id: 'ORC',
    name: 'Orc',
    emoji: '👹',
    color: '#5a4a3a',
    traits: ['DWARVEN_BRAWN', 'STONE_SKIN'],
    population: 0,
    growth: 0.12,
    housing: 2,
    happiness: 55,
    allegiance: 60,
    strength: 9,
    wisdom: 2,
    wealth: 2,
    taxRate: 20,
  },
];

// ── Animal Definitions ────────────────────────────────────────────────────

const ANIMALS = [
  { id: 'DEER', name: 'Deer', emoji: '🦌', emojiColor: '#8a7a5a', type: 'HERBIVORE', tameable: true, food: 1, status: 'WILD', count: 0, meetingRate: 0.5 },
  { id: 'WOLF', name: 'Wolf', emoji: '🐺', emojiColor: '#5a4a3a', type: 'CARNIVORE', tameable: false, food: 2, status: 'WILD', count: 0, meetingRate: 0.3 },
  { id: 'BEAR', name: 'Bear', emoji: '🐻', emojiColor: '#6a5a4a', type: 'CARNIVORE', tameable: false, food: 3, status: 'WILD', count: 0, meetingRate: 0.2 },
  { id: 'EAGLE', name: 'Eagle', emoji: '🦅', emojiColor: '#6a7a5a', type: 'CARNIVORE', tameable: true, food: 1, status: 'WILD', count: 0, meetingRate: 0.6 },
  { id: 'RABBIT', name: 'Rabbit', emoji: '🐇', emojiColor: '#9a7a5a', type: 'HERBIVORE', tameable: true, food: 0.5, status: 'DOMESTIC', count: 0, meetingRate: 0.7 },
  { id: 'COW', name: 'Cow', emoji: '🐄', emojiColor: '#8a8a6a', type: 'HERBIVORE', tameable: true, food: 2, status: 'DOMESTIC', count: 0, meetingRate: 0.6 },
  { id: 'SHEEP', name: 'Sheep', emoji: '🐑', emojiColor: '#7a7a6a', type: 'HERBIVORE', tameable: true, food: 1, status: 'DOMESTIC', count: 0, meetingRate: 0.6 },
  { id: 'PIG', name: 'Pig', emoji: '🐖', emojiColor: '#6a5a4a', type: 'OMNIVORE', tameable: true, food: 2, status: 'DOMESTIC', count: 0, meetingRate: 0.5 },
  { id: 'ROOSTER', name: 'Rooster', emoji: '🐓', emojiColor: '#b8860b', type: 'OMNIVORE', tameable: true, food: 0.5, status: 'DOMESTIC', count: 0, meetingRate: 0.7 },
  { id: 'SPIDER', name: 'Spider', emoji: '🕷️', emojiColor: '#4a4a4a', type: 'CARNIVORE', tameable: false, food: 0.5, status: 'WILD', count: 0, meetingRate: 0.8 },
  { id: 'RAT', name: 'Rat', emoji: '🐀', emojiColor: '#4a4a3a', type: 'OMNIVORE', tameable: false, food: 0.3, status: 'PEST', count: 0, meetingRate: 0.9 },
  { id: 'FISH', name: 'Fish', emoji: '🐟', emojiColor: '#5a7a8a', type: 'OMNIVORE', tameable: false, food: 0.5, status: 'WILD', count: 0, meetingRate: 0.7 },
  { id: 'GOAT', name: 'Goat', emoji: '🐐', emojiColor: '#7a7a5a', type: 'HERBIVORE', tameable: true, food: 1, status: 'DOMESTIC', count: 0, meetingRate: 0.6 },
  { id: 'PANDA', name: 'Panda', emoji: '🐼', emojiColor: '#7a8a5a', type: 'HERBIVORE', tameable: false, food: 3, status: 'WILD', count: 0, meetingRate: 0.3 },
  { id: 'KOALA', name: 'Koala', emoji: '🐨', emojiColor: '#7a8a6a', type: 'HERBIVORE', tameable: false, food: 2, status: 'WILD', count: 0, meetingRate: 0.4 },
  { id: 'YAK', name: 'Yak', emoji: '🦬', emojiColor: '#9a8a6a', type: 'HERBIVORE', tameable: true, food: 4, status: 'DOMESTIC', count: 0, meetingRate: 0.4 },
];

// ── Building Definitions ──────────────────────────────────────────────────

const BUILDINGS = [
  { id: 'HOUSE', name: 'House', emoji: '🏠', cost: { gold: 0, food: 100, wood: 20 }, area: 1, population: 2, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE'] },
  { id: 'WATCHTOWER', name: 'Watchtower', emoji: '🗼', cost: { gold: 50, food: 50, wood: 50 }, area: 2, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE', 'OFFENSIVE'] },
  { id: 'TEMPLE', name: 'Temple', emoji: '⛪', cost: { gold: 80, food: 100, wood: 80 }, area: 2, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['RELIGIOUS'] },
  { id: 'FARM', name: 'Farm', emoji: '🌾', cost: { gold: 0, food: 0, wood: 30 }, area: 3, population: 0, production: { gold: 0, food: 1, wood: 0 }, traits: ['AGRICULTURAL'] },
  { id: 'FOREST', name: 'Forest', emoji: '🌲', cost: { gold: 0, food: 0, wood: 10 }, area: 4, population: 0, production: { gold: 0, food: 0, wood: 1 }, traits: ['AESTHETIC'] },
  { id: 'HUNT', name: 'Hunt', emoji: '🏹', cost: { gold: 0, food: 0, wood: 40 }, area: 2, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['OFFENSIVE', 'HUNTING'] },
  { id: 'MINE', name: 'Mine', emoji: '⛏️', cost: { gold: 0, food: 0, wood: 20 }, area: 3, population: 0, production: { gold: 2, food: 0, wood: 1 }, traits: ['ECONOMIC'] },
  { id: 'FISHING', name: 'Fishing', emoji: '🎣', cost: { gold: 0, food: 0, wood: 20 }, area: 3, population: 0, production: { gold: 0, food: 2, wood: 0 }, traits: ['AGRICULTURAL'] },
  { id: 'TRAININGHOOD', name: 'Training Hood', emoji: '💪', cost: { gold: 60, food: 60, wood: 60 }, area: 2, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['OFFENSIVE', 'DEFENSIVE'] },
  { id: 'PLAZA', name: 'Plaza', emoji: '🏟️', cost: { gold: 20, food: 0, wood: 10 }, area: 3, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['ECONOMIC', 'AESTHETIC'] },
  { id: 'HOSPITAL', name: 'Hospital', emoji: '🏥', cost: { gold: 0, food: 150, wood: 40 }, area: 4, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE'] },
  { id: 'FORT', name: 'Fort', emoji: '🛡️', cost: { gold: 100, food: 100, wood: 100 }, area: 5, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE', 'OFFENSIVE'] },
  { id: 'PLACE_OF_WORSHIP', name: 'Place of Worship', emoji: '⛪', cost: { gold: 70, food: 70, wood: 70 }, area: 3, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['RELIGIOUS'] },
  { id: 'HARBOR', name: 'Harbor', emoji: '🌊', cost: { gold: 80, food: 0, wood: 80 }, area: 4, population: 0, production: { gold: 2, food: 1, wood: 0 }, traits: ['ECONOMIC'] },
  { id: 'MARKET', name: 'Market', emoji: '🏪', cost: { gold: 30, food: 0, wood: 15 }, area: 3, population: 0, production: { gold: 1, food: 0, wood: 0 }, traits: ['ECONOMIC'] },
  { id: 'SCHOOL', name: 'School', emoji: '📚', cost: { gold: 0, food: 0, wood: 30 }, area: 2, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['AESTHETIC'] },
  { id: 'ARMORY', name: 'Armory', emoji: '⚔️', cost: { gold: 40, food: 0, wood: 50 }, area: 3, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['OFFENSIVE'] },
  { id: 'LIVING_ROOM', name: 'Living Room', emoji: '🛋️', cost: { gold: 0, food: 50, wood: 40 }, area: 2, population: 1, production: { gold: 0, food: 0, wood: 0 }, traits: ['AESTHETIC'] },
  { id: 'GARDEN', name: 'Garden', emoji: '🌸', cost: { gold: 0, food: 0, wood: 20 }, area: 3, population: 0, production: { gold: 0, food: 0.5, wood: 0 }, traits: ['AGRICULTURAL', 'AESTHETIC'] },
  { id: 'LABORATORY', name: 'Laboratory', emoji: '🔬', cost: { gold: 50, food: 0, wood: 30 }, area: 3, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['AESTHETIC'] },
  { id: 'WORKSHOP', name: 'Workshop', emoji: '🔧', cost: { gold: 0, food: 0, wood: 30 }, area: 3, population: 0, production: { gold: 1, food: 0, wood: 0 }, traits: ['ECONOMIC'] },
  { id: 'PIER', name: 'Pier', emoji: '🌴', cost: { gold: 60, food: 0, wood: 60 }, area: 4, population: 0, production: { gold: 1, food: 1, wood: 0 }, traits: ['ECONOMIC', 'AESTHETIC'] },
  { id: 'GUILD', name: 'Guild', emoji: '🤝', cost: { gold: 80, food: 0, wood: 70 }, area: 5, population: 0, production: { gold: 2, food: 0, wood: 0 }, traits: ['ECONOMIC', 'OFFENSIVE'] },
];

// ── Political Systems ─────────────────────────────────────────────────────

const POLITICS = [
  { id: 'DEMOCRACY', name: 'Democracy', emoji: '🇺🇸', happiness: 15, allegiance: 5, growth: 1, stability: 0.3, description: 'Citizens participate in decisions. Higher growth but less control.' },
  { id: 'MONARCHY', name: 'Monarchy', emoji: '👑', happiness: 5, allegiance: 15, growth: 0.5, stability: 0.8, description: 'Centralized rule. Stable but less happy.' },
  { id: 'THEOCRACY', name: 'Theocracy', emoji: '✝️', happiness: 10, allegiance: 12, growth: 0.8, stability: 0.5, description: 'Religious rule. Steady growth, some unrest.' },
  { id: 'DICTATORSHIP', name: 'Dictatorship', emoji: '⛨', happiness: -10, allegiance: 20, growth: 0.2, stability: 0.9, description: 'Strict control. High allegiance, unhappy citizens.' },
  { id: 'ANARCHY', name: 'Anarchy', emoji: '☭', happiness: 20, allegiance: -10, growth: 0.3, stability: 0.1, description: 'No rule. Productive but unstable.' },
];

// ── Game World ────────────────────────────────────────────────────────────

function getSeason(month) {
  if (month >= 3 && month <= 5) return 1; // Spring
  if (month >= 6 && month <= 8) return 2; // Summer
  if (month >= 9 && month <= 11) return 3; // Autumn
  return 4; // Winter
}

// ── Exports ───────────────────────────────────────────────────────────────

window.WORLD = WORLD;
window.TRAITS = TRAITS;
window.RACES = RACES;
window.ANIMALS = ANIMALS;
window.BUILDINGS = BUILDINGS;
window.POLITICS = POLITICS;
