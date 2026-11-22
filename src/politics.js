/**
 * Politics Module
 * Defines political systems, governance, and kingdom structures.
 * Includes sub-structures, alliances, and political mechanics.
 */

// ── Political Systems ─────────────────────────────────────────────────────

/**
 * Get political system statistics.
 * @param {string} systemId - The political system identifier.
 * @returns {Object} System statistics.
 */
function getPoliticsStats(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  if (!system) return null;
  
  return {
    id: system.id,
    name: system.name,
    emoji: system.emoji,
    happiness: system.happiness,
    allegiance: system.allegiance,
    growth: system.growth,
    stability: system.stability,
    description: system.description,
  };
}

/**
 * Check if a political system provides stability.
 * @param {string} systemId - The political system identifier.
 * @returns {boolean} True if stability.
 */
function hasStabilitySystem(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  return system ? system.stability > 0.5 : false;
}

/**
 * Check if a political system increases allegiance.
 * @param {string} systemId - The political system identifier.
 * @returns {boolean} True if increases allegiance.
 */
function increasesAllegiance(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  return system ? system.allegiance > 0 : false;
}

// ── Kingdom Structures ────────────────────────────────────────────────────

/**
 * Get a list of all kingdom structures.
 * @returns {Array} Array of structure definitions.
 */
function getKingdomStructures() {
  return [
    { id: 'CAPITOL', name: 'Capitol', emoji: '👑', cost: { gold: 100, food: 100, wood: 100 }, area: 10, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE', 'ECONOMIC', 'RELIGIOUS'] },
    { id: 'HALL', name: 'Great Hall', emoji: '🏛️', cost: { gold: 80, food: 80, wood: 80 }, area: 6, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['ECONOMIC', 'RELIGIOUS'] },
    { id: 'PALACE', name: 'Palace', emoji: '🕌', cost: { gold: 120, food: 120, wood: 120 }, area: 8, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE', 'RELIGIOUS', 'AESTHETIC'] },
    { id: 'TOWER', name: 'Giant Tower', emoji: '🗼', cost: { gold: 150, food: 100, wood: 150 }, area: 6, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE', 'OFFENSIVE'] },
    { id: 'AMPHITHEATER', name: 'Amphitheater', emoji: '🎭', cost: { gold: 100, food: 0, wood: 100 }, area: 8, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['AESTHETIC', 'ECONOMIC'] },
    { id: 'LIBRARY', name: 'Library', emoji: '📚', cost: { gold: 0, food: 0, wood: 100 }, area: 4, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['AESTHETIC'] },
    { id: 'BATH', name: 'Thermal Bath', emoji: '♨️', cost: { gold: 60, food: 60, wood: 40 }, area: 4, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['ECONOMIC', 'COMFORT'] },
    { id: 'WATCHTOWER', name: 'Watchtower', emoji: '🗼', cost: { gold: 50, food: 50, wood: 50 }, area: 2, population: 0, production: { gold: 0, food: 0, wood: 0 }, traits: ['DEFENSIVE', 'OFFENSIVE'] },
  ];
}

/**
 * Get a kingdom structure by ID.
 * @param {string} structureId - The structure identifier.
 * @returns {Object|null} The structure definition.
 */
function getKingdomStructure(structureId) {
  return getKingdomStructures().find(s => s.id === structureId) || null;
}

/**
 * Check if a building is a kingdom structure.
 * @param {string} buildingId - The building identifier.
 * @returns {boolean} True if a kingdom structure.
 */
function isKingdomStructure(buildingId) {
  const structures = getKingdomStructures();
  return structures.some(s => s.id === buildingId);
}

/**
 * Get the maximum population a kingdom structure can support.
 * @param {string} structureId - The structure identifier.
 * @returns {number} Population capacity.
 */
function getKingdomStructureCapacity(structureId) {
  const structure = getKingdomStructure(structureId);
  return structure ? structure.population : 0;
}

/**
 * Get the political system's effect on allegiance.
 * @param {string} systemId - The political system identifier.
 * @returns {number} Allegiance modifier.
 */
function getAllegianceModifier(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  return system ? system.allegiance : 0;
}

/**
 * Get the political system's effect on happiness.
 * @param {string} systemId - The political system identifier.
 * @returns {number} Happiness modifier.
 */
function getHappinessModifier(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  return system ? system.happiness : 0;
}

/**
 * Get the political system's effect on growth.
 * @param {string} systemId - The political system identifier.
 * @returns {number} Growth modifier.
 */
function getGrowthModifier(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  return system ? system.growth : 1;
}

/**
 * Get the political system's effect on stability.
 * @param {string} systemId - The political system identifier.
 * @returns {number} Stability modifier.
 */
function getStabilityModifier(systemId) {
  const system = POLITICS.find(p => p.id === systemId);
  return system ? system.stability : 0.5;
}

// ── Alliance System ───────────────────────────────────────────────────────

/**
 * Create a new alliance between kingdoms.
 * @param {string} kingdomId1 - The first kingdom identifier.
 * @param {string} kingdomId2 - The second kingdom identifier.
 * @returns {Object} The alliance.
 */
function createAlliance(kingdomId1, kingdomId2) {
  const kingdom1 = WORLD.kingdoms.find(k => k.id === kingdomId1);
  const kingdom2 = WORLD.kingdoms.find(k => k.id === kingdomId2);
  
  if (!kingdom1 || !kingdom2) return null;
  
  return {
    id: `alliance-${Date.now()}`,
    kingdom1: kingdomId1,
    kingdom2: kingdomId2,
    createdAt: WORLD.turn,
    members: [kingdomId1, kingdomId2],
    status: 'ACTIVE',
  };
}

/**
 * Check if a kingdom is part of an alliance.
 * @param {string} kingdomId - The kingdom identifier.
 * @returns {boolean} True if in an alliance.
 */
function isInAlliance(kingdomId) {
  const alliance = WORLD.kingdoms.find(k => k.id === kingdomId);
  if (!alliance) return false;
  
  return alliance.alliance && alliance.alliance.status === 'ACTIVE';
}

/**
 * Get all alliances for a kingdom.
 * @param {string} kingdomId - The kingdom identifier.
 * @returns {Array} Array of alliances.
 */
function getKingdomAlliances(kingdomId) {
  return WORLD.kingdoms.filter(k => k.alliance && k.alliance.status === 'ACTIVE' && k.alliance.members.includes(kingdomId));
}

// ── Sub-Structure System ──────────────────────────────────────────────────

/**
 * Create a sub-structure within a kingdom.
 * @param {string} parentId - The parent building identifier.
 * @param {string} subId - The sub-structure identifier.
 * @param {string} location - The location.
 * @returns {Object} The sub-structure.
 */
function createSubStructure(parentId, subId, location) {
  const parent = WORLD.buildings.find(b => b.id === parentId);
  if (!parent) return null;
  
  return {
    id: `sub-${Date.now()}`,
    parentId: parentId,
    childId: subId,
    location: location,
    created: WORLD.turn,
    active: true,
  };
}

/**
 * Get sub-structures for a building.
 * @param {string} buildingId - The building identifier.
 * @returns {Array} Array of sub-structures.
 */
function getSubStructures(buildingId) {
  return WORLD.buildings.filter(b => b.parentId === buildingId && b.active);
}

/**
 * Add a sub-structure to a building.
 * @param {string} parentId - The parent building identifier.
 * @param {string} subId - The sub-structure identifier.
 * @param {string} location - The location.
 * @returns {boolean} True if added successfully.
 */
function addSubStructure(parentId, subId, location) {
  const parent = WORLD.buildings.find(b => b.id === parentId);
  if (!parent) return false;
  
  WORLD.buildings.push({
    id: `sub-${Date.now()}`,
    parentId: parentId,
    childId: subId,
    location: location,
    created: WORLD.turn,
    active: true,
  });
  
  return true;
}
