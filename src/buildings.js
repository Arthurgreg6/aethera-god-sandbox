/**
 * Buildings Module
 * Defines all building types, their costs, and effects.
 * Includes residential, commercial, defensive, and infrastructure buildings.
 */

// ── Building Metadata ─────────────────────────────────────────────────────

/**
 * Get building cost details.
 * @param {string} buildingId - The building identifier.
 * @returns {Object} Cost breakdown.
 */
function getBuildingCost(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  return building ? { ...building.cost } : { gold: 0, food: 0, wood: 0 };
}

/**
 * Get building area requirement.
 * @param {string} buildingId - The building identifier.
 * @returns {number} Area required.
 */
function getBuildingArea(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  return building ? building.area : 1;
}

/**
 * Get building population capacity.
 * @param {string} buildingId - The building identifier.
 * @returns {number} Population it can support.
 */
function getBuildingPopulation(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  return building ? building.population : 0;
}

/**
 * Get building production rates.
 * @param {string} buildingId - The building identifier.
 * @returns {Object} Production rates.
 */
function getBuildingProduction(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  return building ? { ...building.production } : { gold: 0, food: 0, wood: 0 };
}

/**
 * Get building traits.
 * @param {string} buildingId - The building identifier.
 * @returns {Array} Array of trait identifiers.
 */
function getBuildingTraits(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  return building ? [...building.traits] : [];
}

/**
 * Check if a building provides defensive capabilities.
 * @param {string} buildingId - The building identifier.
 * @returns {boolean} True if defensive.
 */
function isDefensiveBuilding(buildingId) {
  const traits = getBuildingTraits(buildingId);
  return traits.includes('DEFENSIVE');
}

/**
 * Check if a building is agricultural.
 * @param {string} buildingId - The building identifier.
 * @returns {boolean} True if agricultural.
 */
function isAgriculturalBuilding(buildingId) {
  const traits = getBuildingTraits(buildingId);
  return traits.includes('AGRICULTURAL');
}

/**
 * Check if a building generates wealth.
 * @param {string} buildingId - The building identifier.
 * @returns {boolean} True if economic.
 */
function isEconomicBuilding(buildingId) {
  const traits = getBuildingTraits(buildingId);
  return traits.includes('ECONOMIC');
}

// ── Building Placement Rules ──────────────────────────────────────────────

/**
 * Check if a building can be placed at a location.
 * @param {Object} grid - The grid at the location.
 * @param {string} buildingId - The building identifier.
 * @returns {boolean} True if placeable.
 */
function canPlaceBuilding(grid, buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (!building) return false;
  
  // Check if building overlaps with existing buildings
  if (grid.building) return false;
  
  // Check area
  if (grid.buildings >= getBuildingArea(buildingId)) return false;
  
  // Check cost availability
  const cost = getBuildingCost(buildingId);
  if (WORLD.resources.gold < cost.gold) return false;
  if (WORLD.resources.food < cost.food) return false;
  if (WORLD.resources.wood < cost.wood) return false;
  
  return true;
}

/**
 * Place a building at a location.
 * @param {string} buildingId - The building identifier.
 * @param {string} gridId - The grid location identifier.
 * @returns {boolean} True if placed successfully.
 */
function placeBuilding(buildingId, gridId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (!building) return false;
  
  const grid = WORLD.grid[gridId];
  if (!grid) return false;
  
  // Check if building already exists
  if (grid.building) return false;
  
  // Check area
  const area = getBuildingArea(buildingId);
  if (grid.buildings >= area) return false;
  
  // Check cost
  const cost = getBuildingCost(buildingId);
  if (WORLD.resources.gold < cost.gold) return false;
  if (WORLD.resources.food < cost.food) return false;
  if (WORLD.resources.wood < cost.wood) return false;
  
  // Deduct cost
  WORLD.resources.gold -= cost.gold;
  WORLD.resources.food -= cost.food;
  WORLD.resources.wood -= cost.wood;
  
  // Place building
  grid.building = {
    id: buildingId,
    name: building.name,
    emoji: building.emoji,
    color: getBuildingColor(buildingId),
    properties: building,
    placed: true,
  };
  
  return true;
}

/**
 * Get building color.
 * @param {string} buildingId - The building identifier.
 * @returns {string} Hex color code.
 */
function getBuildingColor(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (!building) return '#8a8a8a';
  
  // Color by type
  if (building.traits.includes('DEFENSIVE')) return '#6a6a6a';
  if (building.traits.includes('AGRICULTURAL')) return '#5a8a3a';
  if (building.traits.includes('ECONOMIC')) return '#9a7a3a';
  if (building.traits.includes('RELIGIOUS')) return '#6a5a8a';
  if (building.traits.includes('OFFENSIVE')) return '#8a4a2a';
  if (building.traits.includes('AESTHETIC')) return '#7a8a6a';
  
  return '#8a8a8a';
}
