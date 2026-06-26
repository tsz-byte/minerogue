/**
 * MineRogue Shrine Effects System
 */

export const SHRINE_EFFECTS = {
  strength: {
    name: 'Strength',
    icon: '💪',
    description: '+50% melee damage',
    duration: 300, // 5 minutes
    apply(player) {
      player.meleeMultiplier = (player.meleeMultiplier || 1) * 1.5;
    },
    remove(player) {
      player.meleeMultiplier = (player.meleeMultiplier || 1) / 1.5;
    },
  },
  haste: {
    name: 'Haste',
    icon: '⛏',
    description: '+50% mining speed',
    duration: 300,
    apply(player) {
      player.miningSpeedMultiplier = (player.miningSpeedMultiplier || 1) * 1.5;
    },
    remove(player) {
      player.miningSpeedMultiplier = (player.miningSpeedMultiplier || 1) / 1.5;
    },
  },
  regen: {
    name: 'Regeneration',
    icon: '❤️',
    description: '+1 HP per second',
    duration: 120,
    tickInterval: 1000,
    apply(player) {
      player._regenTimer = setInterval(() => {
        if (player.health < player.maxHealth) {
          player.health = Math.min(player.maxHealth, player.health + 1);
        }
      }, 1000);
    },
    remove(player) {
      if (player._regenTimer) {
        clearInterval(player._regenTimer);
        delete player._regenTimer;
      }
    },
  },
  fireWalk: {
    name: 'Fire Walk',
    icon: '🔥',
    description: 'Immune to fire damage',
    duration: 180,
    apply(player) {
      player.fireImmune = true;
    },
    remove(player) {
      player.fireImmune = false;
    },
  },
  nightVision: {
    name: 'Night Vision',
    icon: '👁',
    description: 'See in the dark',
    duration: 300,
    apply(player) {
      player.nightVision = true;
    },
    remove(player) {
      player.nightVision = false;
    },
  },
  fortune: {
    name: 'Fortune',
    icon: '🍀',
    description: '2x drop rates',
    duration: 180,
    apply(player) {
      player.dropMultiplier = (player.dropMultiplier || 1) * 2;
    },
    remove(player) {
      player.dropMultiplier = (player.dropMultiplier || 1) / 2;
    },
  },
  swift: {
    name: 'Swiftness',
    icon: '💨',
    description: '+30% movement speed',
    duration: 300,
    apply(player) {
      player.speedMultiplier = (player.speedMultiplier || 1) * 1.3;
    },
    remove(player) {
      player.speedMultiplier = (player.speedMultiplier || 1) / 1.3;
    },
  },
  luck: {
    name: 'Luck',
    icon: '🎲',
    description: '+20% critical hit chance',
    duration: 180,
    apply(player) {
      player.critChance = (player.critChance || 0) + 0.2;
    },
    remove(player) {
      player.critChance = (player.critChance || 0) - 0.2;
    },
  },
};

/**
 * Apply a shrine effect to a player.
 * @param {string} type - One of the shrine type keys
 * @param {object} player - Player object with stats
 * @returns {{ name, icon, duration }} effect info for HUD, or null
 */
export function applyShrine(type, player) {
  const effect = SHRINE_EFFECTS[type];
  if (!effect) return null;

  // Remove existing instance of same effect first
  if (player._activeEffects && player._activeEffects[type]) {
    effect.remove(player);
    clearTimeout(player._activeEffects[type].timeout);
    delete player._activeEffects[type];
  }

  // Initialize effects map
  if (!player._activeEffects) player._activeEffects = {};

  // Apply the effect
  effect.apply(player);

  // Set removal timeout
  const timeout = setTimeout(() => {
    effect.remove(player);
    delete player._activeEffects[type];
  }, effect.duration * 1000);

  player._activeEffects[type] = { timeout, effect };

  return { name: effect.name, icon: effect.icon, duration: effect.duration };
}

/**
 * Clear all shrine effects from a player (e.g. on death).
 */
export function clearAllEffects(player) {
  if (!player._activeEffects) return;
  for (const [type, active] of Object.entries(player._activeEffects)) {
    const effect = SHRINE_EFFECTS[type];
    if (effect) effect.remove(player);
    clearTimeout(active.timeout);
  }
  player._activeEffects = {};
}
