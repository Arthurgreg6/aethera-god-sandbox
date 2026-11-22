/**
 * Worldbox Game - Main Game Engine
 * Canvas 2D rendering, input handling, and game loop.
 */

// ── DOM References ────────────────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── Game State ────────────────────────────────────────────────────────────

const GAME = {
  canvasWidth: 1200,
  canvasHeight: 800,
  cameraX: 0,
  cameraY: 0,
  cameraZoom: 1,
  viewWidth: 0,
  viewHeight: 0,
  
  world: {
    grid: [],
    creatures: [],
    buildings: [],
    kingdoms: [],
    turn: 1,
    day: 1,
    month: 1,
    season: 1,
    weather: 1,
  },
  
  // UI state
  activeTool: 'select',
  activeRace: null,
  activeBuilding: null,
  activePanel: null,
  selectedCell: null,
  
  // Game flags
  running: false,
  paused: false,
  gameOver: false,
  startedYear: 2026,
  count: 0,
};

// ── Canvas Setup ──────────────────────────────────────────────────────────

function setupCanvas() {
  GAME.canvas.width = GAME.canvasWidth;
  GAME.canvas.height = GAME.canvasHeight;
  GAME.viewWidth = GAME.canvas.width;
  GAME.viewHeight = GAME.canvas.height;
}

// ── Grid Generation ───────────────────────────────────────────────────────

/**
 * Initialize the world grid.
 */
function initializeGrid() {
  GAME.world.grid = [];
  
  for (let y = 0; y < WORLD.width; y++) {
    for (let x = 0; x < WORLD.width; x++) {
      const gridId = `${x},${y}`;
      const tileType = getTerrainType(x, y);
      
      GAME.world.grid[gridId] = {
        x: x,
        y: y,
        id: gridId,
        terrain: tileType,
        elevation: getElevation(x, y),
        resources: getTerrainResources(tileType),
        buildings: 0,
        creature: null,
        building: null,
      };
    }
  }
  
  // Create initial creature
  createInitialCreature();
}

/**
 * Get terrain type for a location.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {string} Terrain type.
 */
function getTerrainType(x, y) {
  const distanceFromCenter = Math.sqrt((x - WORLD.width / 2) ** 2 + (y - WORLD.width / 2) ** 2);
  const center = WORLD.width / 2;
  
  if (distanceFromCenter < center * 0.2) return 'PLAIN';
  if (distanceFromCenter < center * 0.4) return 'FOREST';
  if (distanceFromCenter < center * 0.6) return 'MOUNTAIN';
  return 'DESERT';
}

/**
 * Get elevation for a location.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {number} Elevation (0-1).
 */
function getElevation(x, y) {
  const noise = Math.sin(x * 0.5) * Math.cos(y * 0.7) * 0.5 + 0.5;
  const distanceFromCenter = Math.sqrt((x - WORLD.width / 2) ** 2 + (y - WORLD.width / 2) ** 2) / WORLD.width;
  return Math.min(1, noise + distanceFromCenter * 0.3);
}

/**
 * Get terrain resources.
 * @param {string} terrainType - The terrain type.
 * @returns {Object} Resource amounts.
 */
function getTerrainResources(terrainType) {
  const resources = { gold: 0, food: 0, wood: 0 };
  
  switch (terrainType) {
    case 'PLAIN':
      resources.food = 10;
      resources.wood = 5;
      break;
    case 'FOREST':
      resources.food = 3;
      resources.wood = 10;
      break;
    case 'MOUNTAIN':
      resources.gold = 5;
      resources.wood = 3;
      break;
    case 'DESERT':
      resources.food = 2;
      resources.wood = 1;
      resources.gold = 2;
      break;
  }
  
  return resources;
}

// ── Creature System ───────────────────────────────────────────────────────

/**
 * Create a new creature.
 * @param {string} raceId - The race identifier.
 * @param {Object} position - The position { x, y }.
 */
function createCreature(raceId, position) {
  const race = RACES.find(r => r.id === raceId);
  if (!race) return null;
  
  const creature = {
    id: `creature-${Date.now()}`,
    race: raceId,
    name: race.name,
    emoji: race.emoji,
    color: race.color,
    position: { ...position },
    population: 1,
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
    leader: null,
    happiness: race.happiness,
    allegiance: race.allegiance,
  };
  
  WORLD.creatures.push(creature);
  
  // Update population
  const racePopulation = WORLD.races.find(r => r.id === raceId);
  if (racePopulation) {
    racePopulation.population += 1;
  }
  
  // Check for native lands (create multiple races)
  if (Math.random() < 0.3) {
    createNativeLand(creature.position);
  }
  
  // Add to native lands
  const nativeLand = WORLD.nativeLands.find(n => {
    const dx = n.position.x - creature.position.x;
    const dy = n.position.y - creature.position.y;
    return dx * dx + dy * dy <= 4;
  });
  
  if (nativeLand) {
    nativeLand.creatures.push(creature);
  }
  
  return creature;
}

/**
 * Create native lands across the map.
 */
function createNativeLands() {
  for (let y = 0; y < WORLD.width; y += 10) {
    for (let x = 0; x < WORLD.width; x += 10) {
      if (Math.random() < 0.5) {
        const terrain = GAME.world.grid[`${x},${y}`].terrain;
        if (terrain !== 'RAINFOREST') {
          const race = getRandomRace();
          WORLD.nativeLands.push({
            id: `native-${Date.now()}`,
            position: { x, y },
            radius: 2,
            creatures: [],
            territory: terrain,
          });
          createCreature(race.id, { x, y });
        }
      }
    }
  }
  
  // Ensure all races exist
  RACES.forEach(race => {
    const exists = WORLD.races.find(r => r.id === race.id);
    if (!exists) {
      WORLD.races.push(createRace(race.id, 10));
    }
  });
}

/**
 * Create initial creature at starting position.
 */
function createInitialCreature() {
  const startX = Math.floor(WORLD.width / 2);
  const startY = Math.floor(WORLD.height / 2);
  createCreature('HUMAN', { x: startX, y: startY });
}

// ── Game Loop ─────────────────────────────────────────────────────────────

/**
 * Main game update loop.
 */
function gameLoop() {
  if (GAME.paused || GAME.gameOver) return;
  
  update();
  render();
  requestAnimationFrame(gameLoop);
}

/**
 * Update game state.
 */
function update() {
  // Advance turn
  WORLD.turn++;
  WORLD.day++;
  WORLD.wealth++;
  
  // Update seasons
  if (WORLD.day > 30) {
    WORLD.day = 1;
    WORLD.month++;
    WORLD.season = getSeason(WORLD.month);
  }
  
  // Update weather
  updateWeather();
  
  // Update resources
  updateResources();
  
  // Update creatures
  updateCreatures();
  
  // Update animals
  updateAnimals();
  
  // Update buildings
  updateBuildings();
  
  // Update kingdoms
  updateKingdoms();
  
  // Check game over
  checkGameOver();
  
  // Spawn events
  checkEvents();
}

/**
 * Update weather system.
 */
function updateWeather() {
  // Simple weather cycle
  WORLD.weather = Math.floor(Math.random() * 4) + 1;
}

/**
 * Update resources.
 */
function updateResources() {
  // Food production
  let foodProduced = 0;
  GAME.world.buildings.forEach(building => {
    if (building.properties) {
      foodProduced += building.properties.production.food || 0;
      if (building.properties.traits.includes('AGRICULTURAL')) {
        foodProduced += 2;
      }
    }
  });
  
  WORLD.resources.food += foodProduced;
  WORLD.resources.wood += WORLD.resources.wood * 0.1;
  
  // Food consumption
  const foodNeeded = getFoodNeeded();
  if (WORLD.resources.food > foodNeeded) {
    WORLD.resources.food -= foodNeeded;
  } else {
    WORLD.resources.food = 0;
    WORLD.resources.wealth -= 10;
  }
  
  // Gold production
  let goldProduced = 0;
  GAME.world.buildings.forEach(building => {
    goldProduced += building.properties ? building.properties.production.gold || 0 : 0;
  });
  WORLD.resources.gold += goldProduced;
  
  // Wood production
  let woodProduced = 0;
  GAME.world.buildings.forEach(building => {
    woodProduced += building.properties ? building.properties.production.wood || 0 : 0;
  });
  WORLD.resources.wood += woodProduced;
}

/**
 * Get total food needed.
 * @returns {number} Total food consumption.
 */
function getFoodNeeded() {
  let total = 0;
  GAME.world.creatures.forEach(creature => {
    total += getCreatureFood(creature);
  });
  // Population food needs
  WORLD.races.forEach(race => {
    total += race.population * (race.housing || 1) * 2;
  });
  return total;
}

/**
 * Get creature food requirement.
 * @param {Object} creature - The creature object.
 * @returns {number} Food needed.
 */
function getCreatureFood(creature) {
  const traits = TRAITS[creature.traits] || {};
  if (traits.Herbivore) return 2;
  if (traits.Carnivore) return 3;
  if (traits.Omnivore) return 2;
  return 1;
}

/**
 * Update creatures with turn-based logic.
 */
function updateCreatures() {
  if (WORLD.creatures.length === 0) return;
  
  // Move creatures randomly
  GAME.world.creatures.forEach(creature => {
    if (Math.random() < 0.3) {
      const neighbors = getNeighbors(creature.position.x, creature.position.y);
      if (neighbors.length > 0) {
        const target = neighbors[Math.floor(Math.random() * neighbors.length)];
        creature.position.x = target.x;
        creature.position.y = target.y;
      }
    }
  });
}

/**
 * Update animals with turn-based logic.
 */
function updateAnimals() {
  // Generate animals based on terrain
  ANIMALS.forEach(animal => {
    const count = WORLD.animals.find(a => a.id === animal.id);
    if (!count) {
      if (Math.random() < animal.meetingRate) {
        WORLD.animals.push({
          id: animal.id,
          name: animal.name,
          emoji: animal.emoji,
          emojiColor: animal.emojiColor,
          type: animal.type,
          tameable: animal.tameable,
          status: animal.status,
          count: 1,
          position: getRandomPosition(),
        });
      }
    } else {
      // Animals reproduce
      count.count += Math.random() < 0.1 ? 1 : 0;
    }
  });
  
  // Check for pest damage
  const pestAnimals = ANIMALS.filter(a => a.status === 'PEST');
  pestAnimals.forEach(pest => {
    const count = WORLD.animals.find(a => a.id === pest.id);
    if (count && count.count > 5) {
      // Damage crops
      for (let y = 0; y < WORLD.width; y++) {
        for (let x = 0; x < WORLD.width; x++) {
          const gridId = `${x},${y}`;
          const tile = GAME.world.grid[gridId];
          if (tile && tile.terrain === 'PLAIN' && tile.resources.food > 0) {
            tile.resources.food = Math.max(0, tile.resources.food - 1);
          }
        }
      }
      count.count = Math.floor(count.count * 0.7);
    }
  });
  
  // Update creature counts based on animals
  // (simplified - in full game this would be more complex)
}

/**
 * Update buildings with turn-based logic.
 */
function updateBuildings() {
  // Buildings generate resources
  GAME.world.buildings.forEach(building => {
    if (!building.properties) return;
    
    WORLD.resources.gold += building.properties.production.gold || 0;
    WORLD.resources.food += building.properties.production.food || 0;
    WORLD.resources.wood += building.properties.production.wood || 0;
    
    // Check if building provides protection
    if (building.properties.traits.includes('DEFENSIVE')) {
      // Increase kingdom defense
      const kingdom = GAME.world.kingdoms.find(k => {
        const dx = k.position.x - building.position.x;
        const dy = k.position.y - building.position.y;
        return dx * dx + dy * dy <= 4;
      });
      if (kingdom) {
        kingdom.attackPower += 1;
      }
    }
  });
}

/**
 * Update kingdoms with turn-based logic.
 */
function updateKingdoms() {
  WORLD.kingdoms.forEach(kingdom => {
    // Update tax
    const tax = WORLD.resources.gold * (kingdom.taxRate / 100);
    WORLD.resources.gold += tax;
    
    // Update allegiance
    kingdom.allegiance += 2;
    if (kingdom.allegiance > 100) kingdom.allegiance = 100;
  });
}

/**
 * Check if the game is over.
 */
function checkGameOver() {
  if (WORLD.resources.food < 0 && WORLD.creatures.length === 0) {
    endGame();
  }
}

/**
 * End the game.
 */
function endGame() {
  GAME.gameOver = true;
  GAME.running = false;
  
  const totalScore = WORLD.score + (WORLD.resources.gold * 2);
  
  const overlay = document.getElementById('game-overlay');
  overlay.innerHTML = `
    <div class="game-over">
      <h1>${WORLD.season === 1 ? 'Spring' : WORLD.season === 2 ? 'Summer' : WORLD.season === 3 ? 'Autumn' : 'Winter'} Era</h1>
      <p class="subheading">The ${WORLD.season} ruled with ${TOTAL_POPULATION} people</p>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${TOTAL_POPULATION}</div>
          <div class="stat-label">Population</div>
        </div>
        <div class="stat">
          <div class="stat-value">${TOTAL_WEALTH}</div>
          <div class="stat-label">Wealth</div>
        </div>
        <div class="stat">
          <div class="stat-value">${WORLD.kingdoms.length}</div>
          <div class="stat-label">Kingdoms</div>
        </div>
        <div class="stat">
          <div class="stat-value">${TOTAL_SCORE}</div>
          <div class="stat-label">Score</div>
        </div>
      </div>
      <button class="restart-btn" onclick="restartGame()">Start New Game</button>
    </div>
  `;
  overlay.classList.add('show');
}

// ── Rendering ─────────────────────────────────────────────────────────────

/**
 * Render the game scene.
 */
function render() {
  ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
  
  // Draw grid
  drawGrid();
  
  // Draw terrain
  drawTerrain();
  
  // Draw creatures
  drawCreatures();
  
  // Draw animals
  drawAnimals();
  
  // Draw buildings
  drawBuildings();
  
  // Draw kingdoms
  drawKingdoms();
  
  // Draw UI overlay
  drawUIOverlay();
}

/**
 * Draw the grid.
 */
function drawGrid() {
  ctx.strokeStyle = 'rgba(168, 154, 130, 0.2)';
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= GAME.canvasWidth; x += GAME.canvasWidth / WORLD.width) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME.canvasHeight);
    ctx.stroke();
  }
  
  for (let y = 0; y <= GAME.canvasHeight; y += GAME.canvasHeight / WORLD.height) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GAME.canvasWidth, y);
    ctx.stroke();
  }
}

/**
 * Draw terrain.
 */
function drawTerrain() {
  for (let y = 0; y < WORLD.height; y++) {
    for (let x = 0; x < WORLD.width; x++) {
      const gridId = `${x},${y}`;
      const tile = GAME.world.grid[gridId];
      if (!tile) continue;
      
      const px = (x + GAME.cameraX) * (GAME.canvasWidth / WORLD.width);
      const py = (y + GAME.cameraY) * (GAME.canvasHeight / WORLD.height);
      
      ctx.fillStyle = getTerrainColor(tile.terrain, tile.elevation);
      ctx.fillRect(px, py, GAME.canvasWidth / WORLD.width, GAME.canvasHeight / WORLD.height);
    }
  }
}

/**
 * Get terrain color.
 * @param {string} terrainType - The terrain type.
 * @param {number} elevation - The elevation.
 * @returns {string} Hex color.
 */
function getTerrainColor(terrainType, elevation) {
  switch (terrainType) {
    case 'PLAIN':
      return `hsl(${120 + elevation * 30}, 40%, ${60 - elevation * 10}%)`;
    case 'FOREST':
      return `hsl(${100 + elevation * 20}, 30%, ${50 - elevation * 10}%)`;
    case 'MOUNTAIN':
      return `hsl(${0 + elevation * 30}, 20%, ${40 - elevation * 10}%)`;
    case 'DESERT':
      return `hsl(${30 + elevation * 20}, 50%, ${60 - elevation * 10}%)`;
    default:
      return '#8a8a8a';
  }
}

/**
 * Draw creatures on the map.
 */
function drawCreatures() {
  GAME.world.creatures.forEach(creature => {
    const grid = GAME.world.grid[`${creature.position.x},${creature.position.y}`];
    if (!grid) return;
    
    const px = (creature.position.x + GAME.cameraX) * (GAME.canvasWidth / WORLD.width);
    const py = (creature.position.y + GAME.cameraY) * (GAME.canvasHeight / WORLD.height);
    const size = (GAME.canvasHeight / WORLD.height) * GAME.cameraZoom;
    
    ctx.fillStyle = getRaceColor(creature.race);
    ctx.beginPath();
    ctx.arc(px, py, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(creature.emoji, px, py);
  });
}

/**
 * Get race color.
 * @param {string} raceId - The race identifier.
 * @returns {string} Hex color.
 */
function getRaceColor(raceId) {
  const race = RACES.find(r => r.id === raceId);
  return race ? race.color : '#8a8a8a';
}

/**
 * Draw animals on the map.
 */
function drawAnimals() {
  GAME.world.animals.forEach(animal => {
    const grid = GAME.world.grid[`${animal.position.x},${animal.position.y}`];
    if (!grid) return;
    
    const px = (animal.position.x + GAME.cameraX) * (GAME.canvasWidth / WORLD.width);
    const py = (animal.position.y + GAME.cameraY) * (GAME.canvasHeight / WORLD.height);
    const size = (GAME.canvasHeight / WORLD.height) * GAME.cameraZoom;
    
    ctx.fillStyle = getAnimalColor(animal.emojiColor);
    ctx.beginPath();
    ctx.arc(px, py, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(animal.emoji, px, py);
  });
}

/**
 * Draw buildings on the map.
 */
function drawBuildings() {
  GAME.world.buildings.forEach(building => {
    const grid = GAME.world.grid[`${building.position.x},${building.position.y}`];
    if (!grid) return;
    
    const px = (building.position.x + GAME.cameraX) * (GAME.canvasWidth / WORLD.width);
    const py = (building.position.y + GAME.cameraY) * (GAME.canvasHeight / WORLD.height);
    const size = (GAME.canvasHeight / WORLD.height) * GAME.cameraZoom;
    
    ctx.fillStyle = getBuildingColor(building.id);
    ctx.beginPath();
    ctx.arc(px, py, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(building.emoji, px, py);
    
    // Draw building name
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.25}px sans-serif`;
    ctx.fillText(building.name, px, py + size * 0.6);
  });
}

/**
 * Draw kingdoms.
 */
function drawKingdoms() {
  GAME.world.kingdoms.forEach(kingdom => {
    const grid = GAME.world.grid[`${kingdom.position.x},${kingdom.position.y}`];
    if (!grid) return;
    
    const px = (kingdom.position.x + GAME.cameraX) * (GAME.canvasWidth / WORLD.width);
    const py = (kingdom.position.y + GAME.cameraY) * (GAME.canvasHeight / WORLD.height);
    const size = (GAME.canvasHeight / WORLD.height) * GAME.cameraZoom;
    
    ctx.fillStyle = kingdom.color;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kingdom.emoji, px, py);
  });
}

/**
 * Draw UI overlay elements.
 */
function drawUIOverlay() {
  // HUD would be drawn here
  // This is a placeholder for future UI elements
}

// ── Input Handling ────────────────────────────────────────────────────────

/**
 * Handle mouse click.
 * @param {number} clientX - The client X coordinate.
 * @param {number} clientY - The client Y coordinate.
 */
function handleClick(clientX, clientY) {
  const rect = GAME.canvas.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width * GAME.canvasWidth;
  const y = (clientY - rect.top) * GAME.canvasHeight / GAME.canvasHeight;
  
  // Convert to world coordinates
  const worldX = Math.floor((x - GAME.cameraX) / (GAME.canvasWidth / WORLD.width));
  const worldY = Math.floor((y - GAME.cameraY) / (GAME.canvasHeight / WORLD.height));
  
  const gridId = `${worldX},${worldY}`;
  const grid = GAME.world.grid[gridId];
  
  if (!grid) return;
  
  // Handle interaction based on active tool
  switch (GAME.activeTool) {
    case 'build':
      handleBuild(gridId);
      break;
    case 'research':
      handleResearch(gridId);
      break;
    case 'diplomacy':
      handleDiplomacy(gridId);
      break;
    case 'select':
      // Select cell for inspection
      GAME.selectedCell = gridId;
      break;
  }
}

/**
 * Handle building placement.
 * @param {string} gridId - The grid location.
 */
function handleBuild(gridId) {
  if (!GAME.activeBuilding) return;
  
  const cost = getBuildingCost(GAME.activeBuilding);
  if (WORLD.resources.gold >= cost.gold && 
      WORLD.resources.food >= cost.food && 
      WORLD.resources.wood >= cost.wood) {
    
    if (placeBuilding(GAME.activeBuilding, gridId)) {
      WORLD.resources.gold -= cost.gold;
      WORLD.resources.food -= cost.food;
      WORLD.resources.wood -= cost.wood;
      
      // Play building animation
      const grid = GAME.world.grid[gridId];
      grid.building = {
        id: GAME.activeBuilding,
        name: BUILDINGS.find(b => b.id === GAME.activeBuilding).name,
        emoji: BUILDINGS.find(b => b.id === GAME.activeBuilding).emoji,
        placed: true,
      };
      
      showMessage(`Built ${BUILDINGS.find(b => b.id === GAME.activeBuilding).name}`, 'success');
      refreshHUD();
    }
  }
}

/**
 * Handle research.
 * @param {string} gridId - The grid location.
 */
function handleResearch(gridId) {
  const research = WORLD.research.find(r => r.id === GAME.activeResearch);
  if (!research || research.owned) return;
  
  if (WORLD.resources.gold >= research.cost.gold) {
    WORLD.resources.gold -= research.cost.gold;
    research.owned = true;
    showMessage(`Research complete: ${research.name}`, 'success');
    refreshHUD();
  }
}

/**
 * Handle diplomacy.
 * @param {string} gridId - The grid location.
 */
function handleDiplomacy(gridId) {
  // Show diplomacy options
  showMessage('Diplomacy options...', 'info');
}

// ── Utility Functions ─────────────────────────────────────────────────────

/**
 * Get random position.
 * @returns {Object} Random position { x, y }.
 */
function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * WORLD.width),
    y: Math.floor(Math.random() * WORLD.width),
  };
}

/**
 * Get neighbors of a position.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {Array} Array of neighbor positions.
 */
function getNeighbors(x, y) {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < WORLD.width && ny >= 0 && ny < WORLD.width) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
}

/**
 * Show a message to the player.
 * @param {string} message - The message.
 * @param {string} type - The message type (success, error, info).
 */
function showMessage(message, type = 'info') {
  const overlay = document.getElementById('game-overlay');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <p style="color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--text-light)'}">
        ${message}
      </p>
      <button class="close-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
    </div>
  `;
}

/**
 * Refresh HUD display.
 */
function refreshHUD() {
  document.getElementById('wealth-value').textContent = WORLD.resources.gold;
  document.getElementById('population-value').textContent = getTotalPopulation();
  document.getElementById('unrest-value').textContent = WORLD.unrest;
  document.getElementById('reputation-value').textContent = WORLD.reputation;
  document.getElementById('turn-number').textContent = WORLD.turn;
  document.getElementById('day-number').textContent = WORLD.day;
  document.getElementById('month-number').textContent = WORLD.month;
  document.getElementById('season-icon').textContent = getSeasonEmoji(WORLD.season);
  
  const score = getScore();
  document.getElementById('score-value').textContent = score;
}

/**
 * Get total population.
 * @returns {number} Total population.
 */
function getTotalPopulation() {
  let total = 0;
  WORLD.races.forEach(race => {
    total += race.population;
  });
  return total;
}

/**
 * Get score.
 * @returns {number} Current score.
 */
function getScore() {
  return WORLD.wealth + (WORLD.wealth * 0.5) + (WORLD.reputation * 2);
}

/**
 * Get season emoji.
 * @param {number} season - The season number.
 * @returns {string} Season emoji.
 */
function getSeasonEmoji(season) {
  switch (season) {
    case 1: return '🌱'; // Spring
    case 2: return '☀️'; // Summer
    case 3: return '🍂'; // Autumn
    case 4: return '❄️'; // Winter
  }
}

// ── Game Control ──────────────────────────────────────────────────────────

/**
 * Start the game.
 */
function startGame() {
  initializeGrid();
  createNativeLands();
  GAME.running = true;
  GAME.paused = false;
  GAME.gameOver = false;
  GAME.count = 0;
  
  gameLoop();
}

/**
 * Pause the game.
 */
function pauseGame() {
  GAME.paused = !GAME.paused;
  GAME.running = !GAME.paused;
}

/**
 * Restart the game.
 */
function restartGame() {
  GAME.gameOver = false;
  GAME.running = false;
  
  // Reset to initial state
  Object.assign(WORLD, {
    turn: 1,
    day: 1,
    month: 1,
    season: 1,
    weather: 1,
    resources: {
      gold: 0,
      food: 0,
      wood: 1000,
      stone: 500,
      population: 0,
      wealth: 0,
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
    races: [],
    nativeLands: [],
  });
  
  // Re-create races
  RACES.forEach(race => {
    WORLD.races.push(createRace(race.id, 10));
  });
  
  // Clear world
  GAME.world = {
    width: WORLD.width,
    height: WORLD.height,
    turn: 1,
    day: 1,
    month: 1,
    season: 1,
    weather: 1,
    grid: [],
    creatures: [],
    buildings: [],
    kingdoms: [],
    animals: [],
    events: [],
    resources: {
      gold: 0,
      food: 0,
      wood: 1000,
      stone: 500,
      population: 0,
      wealth: 0,
      guilds: 1,
    },
    wealth: 0,
    reputation: 100,
    unrest: 0,
    score: 0,
    races: [],
    nativeLands: [],
  };
  
  initializeGrid();
  createNativeLands();
  GAME.running = true;
  GAME.gameOver = false;
  GAME.paused = false;
  
  refreshHUD();
  render();
}

// ── Event Listeners ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();
  document.getElementById('fullscreen-btn').onclick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };
  
  // Tool buttons
  document.getElementById('btn-inventory').onclick = () => {
    GAME.activePanel = 'inventory';
    // Show inventory panel
  };
  
  document.getElementById('btn-races').onclick = () => {
    GAME.activePanel = 'races';
    // Show races panel
  };
  
  document.getElementById('btn-animals').onclick = () => {
    GAME.activePanel = 'animals';
    // Show animals panel
  };
  
  document.getElementById('btn-buildings').onclick = () => {
    GAME.activePanel = 'buildings';
    // Show buildings panel
  };
  
  document.getElementById('btn-politics').onclick = () => {
    GAME.activePanel = 'politics';
    // Show politics panel
  };
});

// ── Exports ───────────────────────────────────────────────────────────────

window.GAME = GAME;
window.RACES = RACES;
window.TRAITS = TRAITS;
window.WORLD = WORLD;
