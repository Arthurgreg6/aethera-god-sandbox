/**
 * Animals Module
 * Defines all animal species, their behaviors, and interactions.
 * Includes herbivores, carnivores, omnivores, domestic, and wild animals.
 */

// ── Animal Metabolism ────────────────────────────────────────────────────

/**
 * Get an animal's food requirement.
 * @param {string} animalId - The animal identifier.
 * @returns {number} Food required per turn.
 */
function getAnimalFood(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.food : 0.5;
}

/**
 * Check if an animal species is tameable.
 * @param {string} animalId - The animal identifier.
 * @returns {boolean} True if tameable.
 */
function isTameable(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.tameable : false;
}

/**
 * Check if an animal species is a pest.
 * @param {string} animalId - The animal identifier.
 * @returns {boolean} True if a pest.
 */
function isPest(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal && animal.status === 'PEST';
}

/**
 * Check if an animal species is domestic.
 * @param {string} animalId - The animal identifier.
 * @returns {boolean} True if domestic.
 */
function isDomestic(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.status === 'DOMESTIC' : false;
}

/**
 * Get an animal's emoji representation.
 * @param {string} animalId - The animal identifier.
 * @returns {string} The emoji.
 */
function getAnimalEmoji(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.emoji : '🐾';
}

/**
 * Get the animal color.
 * @param {string} animalId - The animal identifier.
 * @returns {string} Hex color code.
 */
function getAnimalColor(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.emojiColor : '#8a7a5a';
}

/**
 * Get an animal's meeting rate (chance of appearing).
 * @param {string} animalId - The animal identifier.
 * @returns {number} Meeting rate (0-1).
 */
function getMeetingRate(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.meetingRate : 0.5;
}

/**
 * Check if an animal species can be tamed.
 * @param {string} animalId - The animal identifier.
 * @returns {boolean} True if tameable.
 */
function canTame(animalId) {
  const animal = ANIMALS.find(a => a.id === animalId);
  return animal ? animal.tameable : false;
}

/**
 * Get a list of all herbivore animals.
 * @returns {Array} Array of herbivore animals.
 */
function getHerbivores() {
  return ANIMALS.filter(a => a.type === 'HERBIVORE');
}

/**
 * Get a list of all carnivore animals.
 * @returns {Array} Array of carnivore animals.
 */
function getCarnivores() {
  return ANIMALS.filter(a => a.type === 'CARNIVORE');
}

/**
 * Get a list of all omnivore animals.
 * @returns {Array} Array of omnivore animals.
 */
function getOmnivores() {
  return ANIMALS.filter(a => a.type === 'OMNIVORE');
}

/**
 * Get a list of all tameable animals.
 * @returns {Array} Array of tameable animals.
 */
function getTameableAnimals() {
  return ANIMALS.filter(a => a.tameable);
}

/**
 * Get a list of all wild animals.
 * @returns {Array} Array of wild animals.
 */
function getWildAnimals() {
  return ANIMALS.filter(a => a.status === 'WILD');
}

/**
 * Get a list of all domestic animals.
 * @returns {Array} Array of domestic animals.
 */
function getDomesticAnimals() {
  return ANIMALS.filter(a => a.status === 'DOMESTIC');
}

/**
 * Get a list of all pest animals.
 * @returns {Array} Array of pest animals.
 */
function getPestAnimals() {
  return ANIMALS.filter(a => a.status === 'PEST');
}

/**
 * Simulate animal meeting with a creature.
 * @param {string} creatureId - The creature identifier.
 * @param {string} animalId - The animal identifier.
 * @returns {Object} Interaction result.
 */
function simulateAnimalInteraction(creatureId, animalId) {
  const creature = WORLD.creatures.find(c => c.id === creatureId);
  const animal = ANIMALS.find(a => a.id === animalId);
  
  if (!creature || !animal) return null;
  
  // Probability of meeting
  if (Math.random() > animal.meetingRate) {
    return { met: false };
  }
  
  // Mutually exclusive or compatible?
  const creatureTraits = creature.traits || [];
  if (animal.type === 'CARNIVORE' && creatureTraits.includes('HERBIVORE')) {
    return { met: true, result: 'HUNTING', foodGained: 2 };
  }
  if (animal.type === 'HERBIVORE' && creatureTraits.includes('CARNIVORE')) {
    return { met: true, result: 'EVASION', foodGained: 0 };
  }
  
  return { met: true, result: 'CONTACT', foodGained: 0 };
}
