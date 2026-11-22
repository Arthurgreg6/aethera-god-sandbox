/**
 * Races Module
 * Defines all creature races, their abilities, and behaviors.
 */

// ── Race Logic ────────────────────────────────────────────────────────────

/**
 * Get a random race from the RACES array.
 * @returns {Object} A random race definition.
 */
function getRandomRace() {
  return RACES[Math.floor(Math.random() * RACES.length)];
}

/**
 * Check if a race has a specific trait.
 * @param {string} traitId - The trait identifier.
 * @param {Array} traits - The race's trait array.
 * @returns {boolean} True if the race has the trait.
 */
function hasTrait(traitId, traits) {
  return traits.includes(traitId);
}

/**
 * Get race statistics.
 * @param {string} raceId - The race identifier.
 * @returns {Object} Race statistics.
 */
function getRaceStats(raceId) {
  const race = RACES.find(r => r.id === raceId);
  if (!race) return null;
  
  const stats = { ...race };
  race.traits.forEach(traitId => {
    const trait = TRAITS[traitId];
    if (trait) {
      // Apply trait effects
      if (traitId === 'GIANT_STRENGTH') stats.strength += 3;
      if (traitId === 'STONE_SKIN') stats.happiness += 5;
      if (traitId === 'GNOMISH_SKILL') stats.growth += 0.02;
      if (traitId === 'DWARVEN_BRAWN') stats.strength += 2;
      if (traitId === 'ELF_ELEGANCE') stats.wealth += 1;
      if (traitId === 'HUMAN_CURIOSITY') stats.wealth += 1;
    }
  });
  return stats;
}

/**
 * Create a new race population.
 * @param {string} raceId - The race identifier.
 * @param {number} count - Initial population count.
 * @returns {Object} The created race population.
 */
function createRace(raceId, count = 10) {
  const race = RACES.find(r => r.id === raceId);
  if (!race) return null;
  
  return {
    id: raceId,
    name: race.name,
    emoji: race.emoji,
    color: race.color,
    population: count,
    growth: race.growth,
    housing: race.housing,
    happiness: race.happiness,
    allegiance: race.allegiance,
    strength: race.strength,
    wisdom: race.wisdom,
    wealth: race.wealth,
    taxRate: race.taxRate,
    traits: [...race.traits],
    generated: 0,
    destroyed: 0,
  };
}

/**
 * Increase a race's population.
 * @param {string} raceId - The race identifier.
 * @param {number} amount - Amount to add.
 */
function increaseRacePopulation(raceId, amount) {
  const race = RACES.find(r => r.id === raceId);
  if (!race) return;
  
  const population = WORLD.races.find(r => r.id === raceId);
  if (population) {
    population.population += amount;
    // Cap at 1000 for balance
    if (population.population > 1000) population.population = 1000;
  }
}

/**
 * Decrease a race's population.
 * @param {string} raceId - The race identifier.
 * @param {number} amount - Amount to remove.
 */
function decreaseRacePopulation(raceId, amount) {
  const race = RACES.find(r => r.id === raceId);
  if (!race) return;
  
  const population = WORLD.races.find(r => r.id === raceId);
  if (population) {
    population.population -= amount;
    if (population.population < 0) population.population = 0;
  }
}

/**
 * Check if a race can exist in a given environment.
 * @param {number} terrainType - The terrain type.
 * @param {string} raceId - The race identifier.
 * @returns {boolean} True if the race can exist in the terrain.
 */
function canRaceExist(terrainType, raceId) {
  const race = RACES.find(r => r.id === raceId);
  if (!race) return false;
  
  // Rainforest is not suitable for any race
  if (terrainType === 'RAINFOREST') return false;
  
  // All other races can exist in most terrains
  return true;
}
