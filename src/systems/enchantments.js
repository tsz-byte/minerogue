// MineRogue - Enchantment System Foundation
// Enchantment definitions, apply/remove, enchanting table interaction,
// random enchantment selection based on level

// ─── Enchantment Definitions ──────────────────────────────────────

export const ENCHANTMENTS = {
  // Weapon enchantments
  sharpness: {
    id: 'sharpness',
    name: 'Sharpness',
    maxLevel: 5,
    compatible: ['sword', 'axe'],
    description: (lvl) => `+${lvl * 1.25} damage`,
    effect: { damageBonus: (lvl) => lvl * 1.25 },
    weight: 10,
  },
  smite: {
    id: 'smite',
    name: 'Smite',
    maxLevel: 5,
    compatible: ['sword', 'axe'],
    description: (lvl) => `+${lvl * 2.5} damage to undead`,
    effect: { undeadDamageBonus: (lvl) => lvl * 2.5 },
    weight: 5,
  },
  fire_aspect: {
    id: 'fire_aspect',
    name: 'Fire Aspect',
    maxLevel: 2,
    compatible: ['sword'],
    description: (lvl) => `Sets target on fire for ${lvl * 3}s`,
    effect: { fireDuration: (lvl) => lvl * 3 },
    weight: 2,
  },
  knockback: {
    id: 'knockback',
    name: 'Knockback',
    maxLevel: 2,
    compatible: ['sword'],
    description: (lvl) => `+${lvl * 3} knockback force`,
    effect: { knockbackBonus: (lvl) => lvl * 3 },
    weight: 5,
  },
  looting: {
    id: 'looting',
    name: 'Looting',
    maxLevel: 3,
    compatible: ['sword'],
    description: (lvl) => `+${lvl * 15}% mob drop chance`,
    effect: { lootingBonus: (lvl) => lvl * 0.15 },
    weight: 2,
  },

  // Tool enchantments
  efficiency: {
    id: 'efficiency',
    name: 'Efficiency',
    maxLevel: 5,
    compatible: ['pickaxe', 'axe', 'shovel'],
    description: (lvl) => `+${lvl * 25}% mining speed`,
    effect: { miningSpeedMult: (lvl) => 1 + lvl * 0.25 },
    weight: 10,
  },
  fortune: {
    id: 'fortune',
    name: 'Fortune',
    maxLevel: 3,
    compatible: ['pickaxe'],
    description: (lvl) => `+${lvl * 20}% extra drops`,
    effect: { fortuneBonus: (lvl) => lvl * 0.20 },
    weight: 2,
  },
  silk_touch: {
    id: 'silk_touch',
    name: 'Silk Touch',
    maxLevel: 1,
    compatible: ['pickaxe', 'axe', 'shovel'],
    description: () => 'Drops the block itself',
    effect: { silkTouch: true },
    weight: 1,
    exclusive: ['fortune'],
  },
  unbreaking: {
    id: 'unbreaking',
    name: 'Unbreaking',
    maxLevel: 3,
    compatible: ['sword', 'pickaxe', 'axe', 'shovel', 'bow', 'helmet', 'chestplate', 'leggings', 'boots'],
    description: (lvl) => `${Math.round(lvl * 33)}% less durability loss`,
    effect: { durabilityMult: (lvl) => 1 - lvl * 0.33 },
    weight: 8,
  },

  // Armor enchantments
  protection: {
    id: 'protection',
    name: 'Protection',
    maxLevel: 4,
    compatible: ['helmet', 'chestplate', 'leggings', 'boots'],
    description: (lvl) => `+${lvl * 4}% damage reduction`,
    effect: { protectionBonus: (lvl) => lvl * 0.04 },
    weight: 10,
  },
  thorns: {
    id: 'thorns',
    name: 'Thorns',
    maxLevel: 3,
    compatible: ['helmet', 'chestplate', 'leggings', 'boots'],
    description: (lvl) => `${15 + lvl * 5}% chance to reflect damage`,
    effect: { thornsChance: (lvl) => 0.15 + lvl * 0.05 },
    weight: 2,
  },

  // Bow enchantments
  power: {
    id: 'power',
    name: 'Power',
    maxLevel: 5,
    compatible: ['bow'],
    description: (lvl) => `+${lvl * 25}% arrow damage`,
    effect: { arrowDamageMult: (lvl) => 1 + lvl * 0.25 },
    weight: 8,
  },
  infinity: {
    id: 'infinity',
    name: 'Infinity',
    maxLevel: 1,
    compatible: ['bow'],
    description: () => 'No arrow consumption',
    effect: { infiniteArrows: true },
    weight: 1,
  },
};

// Enchantment book item IDs
export const ENCHANT_BOOK_IDS = {
  sharpness: 250,
  smite: 251,
  fire_aspect: 252,
  knockback: 253,
  looting: 254,
  efficiency: 255,
  fortune: 256,
  silk_touch: 257,
  unbreaking: 258,
  protection: 259,
  thorns: 260,
  power: 261,
  infinity: 262,
};

// ─── Enchantment System ──────────────────────────────────────────

export class EnchantmentSystem {
  constructor() {
    // Lapis lazuli cost per enchantment (item ID 215 or similar)
    this.lapisCost = 1;
  }

  /**
   * Get all enchantments compatible with a given item type
   */
  getCompatibleEnchantments(itemType) {
    const result = [];
    for (const ench of Object.values(ENCHANTMENTS)) {
      if (ench.compatible.includes(itemType)) {
        result.push(ench);
      }
    }
    return result;
  }

  /**
   * Apply an enchantment to an inventory item slot
   * @param {object} item - The item object { id, count, _enchants }
   * @param {string} enchantId - The enchantment ID
   * @param {number} level - Enchantment level (1-based)
   * @returns {boolean} true if applied successfully
   */
  applyEnchantment(item, enchantId, level) {
    if (!item) return false;
    const ench = ENCHANTMENTS[enchantId];
    if (!ench) return false;

    // Validate level
    const clampedLevel = Math.max(1, Math.min(level, ench.maxLevel));

    // Initialize enchantments map if needed
    if (!item._enchants) item._enchants = {};

    // Check exclusivity
    if (ench.exclusive) {
      for (const excl of ench.exclusive) {
        if (item._enchants[excl]) return false;
      }
    }
    // Check reverse exclusivity
    for (const [existingId] of Object.entries(item._enchants)) {
      const existingEnch = ENCHANTMENTS[existingId];
      if (existingEnch?.exclusive?.includes(enchantId)) return false;
    }

    // Apply or upgrade
    const currentLevel = item._enchants[enchantId] || 0;
    if (clampedLevel > currentLevel) {
      item._enchants[enchantId] = clampedLevel;
    } else {
      return false; // Same or lower level
    }

    return true;
  }

  /**
   * Remove an enchantment from an item
   */
  removeEnchantment(item, enchantId) {
    if (!item?._enchants?.[enchantId]) return false;
    delete item._enchants[enchantId];
    return true;
  }

  /**
   * Get all enchantments on an item with their details
   */
  getItemEnchantments(item) {
    if (!item?._enchants) return [];
    const result = [];
    for (const [id, level] of Object.entries(item._enchants)) {
      const ench = ENCHANTMENTS[id];
      if (ench) {
        result.push({
          id,
          level,
          name: ench.name,
          description: ench.description(level),
          maxLevel: ench.maxLevel,
        });
      }
    }
    return result;
  }

  /**
   * Calculate total enchantment effects for an item (merged effect object)
   */
  calculateEffects(item) {
    if (!item?._enchants) return {};
    const effects = {};
    for (const [id, level] of Object.entries(item._enchants)) {
      const ench = ENCHANTMENTS[id];
      if (!ench?.effect) continue;
      for (const [key, val] of Object.entries(ench.effect)) {
        if (typeof val === 'function') {
          effects[key] = val(level);
        } else {
          effects[key] = val;
        }
      }
    }
    return effects;
  }

  /**
   * Generate random enchantment options for the enchanting table.
   * @param {object} item - The item to enchant
   * @param {number} playerLevel - Player's enchanting level (determines power)
   * @param {number} lapisSpent - Lapis lazuli spent (higher = better options)
   * @returns {Array<{enchantId, level, cost}>} 3 options for the enchanting table
   */
  generateEnchantOptions(item, playerLevel = 1, lapisSpent = 1) {
    if (!item) return [];

    // Get item type from items data
    const itemType = this._getItemType(item.id);
    if (!itemType) return [];

    const compatible = this.getCompatibleEnchantments(itemType);
    if (compatible.length === 0) return [];

    const options = [];
    const maxOptions = 3;

    for (let slot = 0; slot < maxOptions; slot++) {
      // Each slot has different power: slot 0 = weak, slot 2 = strong
      const slotPower = (slot + 1) / maxOptions;
      const effectiveLevel = Math.floor(playerLevel * slotPower) + lapisSpent;

      // Pick a random enchantment weighted by weight and power
      const chosen = this._weightedPick(compatible, effectiveLevel);
      if (!chosen) continue;

      // Determine level based on effective level
      const maxLvl = Math.min(chosen.maxLevel, Math.ceil(effectiveLevel / 3));
      const level = Math.max(1, Math.min(maxLvl, 1 + Math.floor(Math.random() * maxLvl)));

      // Lapis cost increases with slot power
      const cost = 1 + slot;

      options.push({
        enchantId: chosen.id,
        level,
        cost,
        name: chosen.name,
        description: chosen.description(level),
      });
    }

    return options;
  }

  /**
   * Get enchantment display string for tooltips
   */
  getEnchantTooltip(item) {
    const enchants = this.getItemEnchantments(item);
    if (enchants.length === 0) return '';
    return enchants.map(e => {
      const roman = ['', 'I', 'II', 'III', 'IV', 'V'][e.level] || e.level;
      return `${e.name} ${roman}`;
    }).join('\n');
  }

  /**
   * Get enchantment color for display (purple for enchantments)
   */
  getEnchantColor() {
    return '#aa55ff';
  }

  // ── Internal ──

  _getItemType(itemId) {
    // Map item IDs to types for enchantment compatibility
    // Tools: 100-125
    if (itemId >= 100 && itemId <= 103) return ['sword', 'pickaxe', 'axe', 'shovel'][itemId - 100];
    if (itemId >= 104 && itemId <= 107) return ['sword', 'pickaxe', 'axe', 'shovel'][itemId - 104];
    if (itemId >= 108 && itemId <= 111) return ['sword', 'pickaxe', 'axe', 'shovel'][itemId - 108];
    if (itemId >= 112 && itemId <= 115) return ['sword', 'pickaxe', 'axe', 'shovel'][itemId - 112];
    if (itemId >= 116 && itemId <= 119) return ['sword', 'pickaxe', 'axe', 'shovel'][itemId - 116];
    if (itemId === 120) return 'bow';
    if (itemId === 121) return 'shield';
    if (itemId >= 122 && itemId <= 125) return ['sword', 'pickaxe', 'axe', 'shovel'][itemId - 122];
    // Armor: 127-146
    if (itemId >= 127 && itemId <= 130) return ['helmet', 'chestplate', 'leggings', 'boots'][itemId - 127];
    if (itemId >= 131 && itemId <= 134) return ['helmet', 'chestplate', 'leggings', 'boots'][itemId - 131];
    if (itemId >= 135 && itemId <= 138) return ['helmet', 'chestplate', 'leggings', 'boots'][itemId - 135];
    if (itemId >= 139 && itemId <= 142) return ['helmet', 'chestplate', 'leggings', 'boots'][itemId - 139];
    if (itemId >= 143 && itemId <= 146) return ['helmet', 'chestplate', 'leggings', 'boots'][itemId - 143];
    return null;
  }

  _weightedPick(compatible, effectiveLevel) {
    // Build weighted list; higher power = more likely to pick powerful enchantments
    const weighted = [];
    for (const ench of compatible) {
      // Weight is base weight * level scaling
      const w = ench.weight * Math.min(3, effectiveLevel / 5);
      weighted.push({ ench, weight: w });
    }

    const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const { ench, weight } of weighted) {
      roll -= weight;
      if (roll <= 0) return ench;
    }
    return weighted[weighted.length - 1]?.ench;
  }
}
