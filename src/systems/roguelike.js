// Roguelike system - modifiers, shards, run management

export class RoguelikeSystem {
  constructor() {
    this.modifiers = [];
    this.stats = {
      mobsKilled: 0,
      blocksBroken: 0,
      bossesKilled: 0,
      structuresFound: 0,
      itemsCrafted: 0,
      distanceTraveled: 0,
      shrinesActivated: 0,
      depthReached: 0,
    };
  }

  /**
   * All available modifiers with their weights and effects
   */
  static MODIFIER_POOL = [
    {
      name: 'Volcanic',
      weight: 15,
      description: 'The world is filled with lava pools and obsidian. Mobs drop bonus XP.',
      effect: {
        lavaChance: 0.15,
        obsidianPatches: true,
        mobXPBonus: 1.5,
      },
    },
    {
      name: 'Eternal Night',
      weight: 10,
      description: 'The sun never rises. Hostile mobs spawn constantly.',
      effect: {
        eternalNight: true,
        spawnRateMultiplier: 2.0,
        lightLevel: 0,
      },
    },
    {
      name: 'Abundant',
      weight: 20,
      description: 'Ore veins are 50% larger. Trees are more common.',
      effect: {
        oreMultiplier: 1.5,
        treeMultiplier: 1.5,
      },
    },
    {
      name: 'Swarm',
      weight: 12,
      description: 'Mobs appear in larger groups but drop more loot.',
      effect: {
        groupSizeMultiplier: 2.0,
        mobDropMultiplier: 2.0,
      },
    },
    {
      name: 'Cursed',
      weight: 10,
      description: 'All mobs deal 50% more damage. Healing items are rare.',
      effect: {
        mobDamageMultiplier: 1.5,
        healingReduction: 0.5,
      },
    },
    {
      name: 'Bountiful',
      weight: 20,
      description: 'Food items heal 50% more. Animals are plentiful.',
      effect: {
        foodHealMultiplier: 1.5,
        animalSpawnMultiplier: 2.0,
      },
    },
    {
      name: 'Fragile',
      weight: 15,
      description: 'All blocks break faster but tools have half durability.',
      effect: {
        blockHardnessMultiplier: 0.5,
        toolDurabilityMultiplier: 0.5,
      },
    },
    {
      name: 'Lucky',
      weight: 15,
      description: 'Double chance for rare drops from mobs and ores.',
      effect: {
        rareDropChance: 2.0,
        critChanceBonus: 0.1,
      },
    },
    {
      name: 'Glass Cannon',
      weight: 8,
      description: 'Deal double damage but take double damage. No armor protection.',
      effect: {
        playerDamageMultiplier: 2.0,
        playerDamageTakenMultiplier: 2.0,
        armorDisabled: true,
      },
    },
    {
      name: 'Rich',
      weight: 12,
      description: 'Mobs drop gold and rare materials more often.',
      effect: {
        goldDropMultiplier: 3.0,
        rareMaterialChance: 0.25,
      },
    },
    {
      name: 'Desolation',
      weight: 8,
      description: 'The world is barren. Fewer trees and water. Mobs are tougher.',
      effect: {
        treeMultiplier: 0.3,
        waterMultiplier: 0.2,
        mobHealthMultiplier: 1.5,
      },
    },
    {
      name: 'Treasure Hunter',
      weight: 10,
      description: 'Chests appear more frequently with better loot.',
      effect: {
        chestFrequency: 3.0,
        chestLootMultiplier: 2.0,
      },
    },
  ];

  /**
   * Generate random modifiers for a new run
   * @param {number} count - number of modifiers to apply
   * @returns {Array<{name: string, effect: object, description: string}>}
   */
  generateModifiers(count = 2) {
    const pool = RoguelikeSystem.MODIFIER_POOL;
    const totalWeight = pool.reduce((s, m) => s + m.weight, 0);
    const chosen = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      let roll = Math.random() * totalWeight;
      for (const mod of pool) {
        if (used.has(mod.name)) continue;
        roll -= mod.weight;
        if (roll <= 0) {
          chosen.push({
            name: mod.name,
            effect: { ...mod.effect },
            description: mod.description,
          });
          used.add(mod.name);
          break;
        }
      }
    }

    this.modifiers = chosen;
    return chosen;
  }

  /**
   * Calculate soul shards earned from the run
   * @param {object} stats - run statistics
   * @returns {number} shards earned
   */
  calculateShards(stats) {
    const s = stats ?? this.stats;
    return Math.floor(
      (s.mobsKilled ?? 0) * 1 +
      (s.blocksBroken ?? 0) * 0.1 +
      (s.bossesKilled ?? 0) * 50 +
      (s.structuresFound ?? 0) * 10 +
      (s.itemsCrafted ?? 0) * 0.5 +
      (s.distanceTraveled ?? 0) * 0.01 +
      (s.shrinesActivated ?? 0) * 5 +
      (s.depthReached ?? 0) * 2
    );
  }

  /**
   * Apply modifiers to world generation and gameplay parameters
   * @param {object} world - world/game config object
   * @param {Array} modifiers - modifier list
   */
  applyModifiers(world, modifiers) {
    for (const mod of modifiers) {
      const e = mod.effect;

      // World generation modifiers
      if (e.lavaChance != null) world.lavaChance = e.lavaChance;
      if (e.oreMultiplier != null) world.oreMultiplier = (world.oreMultiplier ?? 1) * e.oreMultiplier;
      if (e.treeMultiplier != null) world.treeMultiplier = (world.treeMultiplier ?? 1) * e.treeMultiplier;
      if (e.waterMultiplier != null) world.waterMultiplier = (world.waterMultiplier ?? 1) * e.waterMultiplier;
      if (e.obsidianPatches) world.obsidianPatches = true;
      if (e.chestFrequency != null) world.chestFrequency = (world.chestFrequency ?? 1) * e.chestFrequency;
      if (e.chestLootMultiplier != null) world.chestLootMultiplier = (world.chestLootMultiplier ?? 1) * e.chestLootMultiplier;

      // Combat modifiers
      if (e.playerDamageMultiplier != null) world.playerDamageMultiplier = (world.playerDamageMultiplier ?? 1) * e.playerDamageMultiplier;
      if (e.playerDamageTakenMultiplier != null) world.playerDamageTakenMultiplier = (world.playerDamageTakenMultiplier ?? 1) * e.playerDamageTakenMultiplier;
      if (e.mobDamageMultiplier != null) world.mobDamageMultiplier = (world.mobDamageMultiplier ?? 1) * e.mobDamageMultiplier;
      if (e.mobHealthMultiplier != null) world.mobHealthMultiplier = (world.mobHealthMultiplier ?? 1) * e.mobHealthMultiplier;
      if (e.mobXPBonus != null) world.mobXPBonus = (world.mobXPBonus ?? 1) * e.mobXPBonus;
      if (e.armorDisabled) world.armorDisabled = true;
      if (e.critChanceBonus != null) world.critChanceBonus = (world.critChanceBonus ?? 0) + e.critChanceBonus;

      // Spawning modifiers
      if (e.spawnRateMultiplier != null) world.spawnRateMultiplier = (world.spawnRateMultiplier ?? 1) * e.spawnRateMultiplier;
      if (e.groupSizeMultiplier != null) world.groupSizeMultiplier = (world.groupSizeMultiplier ?? 1) * e.groupSizeMultiplier;
      if (e.animalSpawnMultiplier != null) world.animalSpawnMultiplier = (world.animalSpawnMultiplier ?? 1) * e.animalSpawnMultiplier;

      // Gameplay modifiers
      if (e.blockHardnessMultiplier != null) world.blockHardnessMultiplier = (world.blockHardnessMultiplier ?? 1) * e.blockHardnessMultiplier;
      if (e.toolDurabilityMultiplier != null) world.toolDurabilityMultiplier = (world.toolDurabilityMultiplier ?? 1) * e.toolDurabilityMultiplier;
      if (e.foodHealMultiplier != null) world.foodHealMultiplier = (world.foodHealMultiplier ?? 1) * e.foodHealMultiplier;
      if (e.healingReduction != null) world.healingReduction = (world.healingReduction ?? 1) * e.healingReduction;
      if (e.mobDropMultiplier != null) world.mobDropMultiplier = (world.mobDropMultiplier ?? 1) * e.mobDropMultiplier;
      if (e.goldDropMultiplier != null) world.goldDropMultiplier = (world.goldDropMultiplier ?? 1) * e.goldDropMultiplier;
      if (e.rareDropChance != null) world.rareDropChance = (world.rareDropChance ?? 1) * e.rareDropChance;
      if (e.rareMaterialChance != null) world.rareMaterialChance = e.rareMaterialChance;

      // Time modifiers
      if (e.eternalNight) world.eternalNight = true;
      if (e.lightLevel != null) world.forcedLightLevel = e.lightLevel;
    }
  }

  /**
   * Get current modifiers
   */
  getModifiers() {
    return this.modifiers;
  }

  /**
   * Reset stats for a new run
   */
  resetStats() {
    this.stats = {
      mobsKilled: 0,
      blocksBroken: 0,
      bossesKilled: 0,
      structuresFound: 0,
      itemsCrafted: 0,
      distanceTraveled: 0,
      shrinesActivated: 0,
      depthReached: 0,
    };
  }

  /**
   * Serialize for saving
   */
  serialize() {
    return {
      modifiers: this.modifiers,
      stats: { ...this.stats },
    };
  }

  /**
   * Deserialize from save
   */
  deserialize(data) {
    if (!data) return;
    if (data.modifiers) this.modifiers = data.modifiers;
    if (data.stats) this.stats = { ...this.stats, ...data.stats };
  }
}
