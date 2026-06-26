// Achievement tracking system for MineRogue
// Tracks player stats and unlocks achievements with rewards

const STORAGE_KEY = 'minerogue_achievements';
const STATS_KEY = 'minerogue_stats';

// All 30 achievements defined
const ACHIEVEMENTS = [
  // === COMBAT ===
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Kill your first mob',
    category: 'combat',
    condition: (stats) => stats.kills >= 1,
    reward: { soulShards: 5 }
  },
  {
    id: 'slayer',
    name: 'Slayer',
    description: 'Kill 50 mobs',
    category: 'combat',
    condition: (stats) => stats.kills >= 50,
    reward: { soulShards: 25 }
  },
  {
    id: 'mass_slayer',
    name: 'Mass Slayer',
    description: 'Kill 200 mobs',
    category: 'combat',
    condition: (stats) => stats.kills >= 200,
    reward: { soulShards: 50 }
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    category: 'combat',
    condition: (stats) => stats.bossesKilled >= 1,
    reward: { soulShards: 50 }
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Kill 10 mobs without taking damage',
    category: 'combat',
    condition: (stats) => stats.killsWithoutDamage >= 10,
    reward: { soulShards: 30 }
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: 'Kill 5 mobs in 10 seconds',
    category: 'combat',
    condition: (stats) => stats.killsInWindow >= 5,
    reward: { soulShards: 20 }
  },

  // === MINING ===
  {
    id: 'novice_miner',
    name: 'Novice Miner',
    description: 'Mine 100 blocks',
    category: 'mining',
    condition: (stats) => stats.blocksMined >= 100,
    reward: { soulShards: 10 }
  },
  {
    id: 'expert_miner',
    name: 'Expert Miner',
    description: 'Mine 1,000 blocks',
    category: 'mining',
    condition: (stats) => stats.blocksMined >= 1000,
    reward: { soulShards: 30 }
  },
  {
    id: 'master_miner',
    name: 'Master Miner',
    description: 'Mine 5,000 blocks',
    category: 'mining',
    condition: (stats) => stats.blocksMined >= 5000,
    reward: { soulShards: 75 }
  },
  {
    id: 'diamond_finder',
    name: 'Diamond Finder',
    description: 'Find your first diamond',
    category: 'mining',
    condition: (stats) => stats.diamondsFound >= 1,
    reward: { soulShards: 20 }
  },
  {
    id: 'crystal_finder',
    name: 'Crystal Finder',
    description: 'Find your first crystal',
    category: 'mining',
    condition: (stats) => stats.crystalsFound >= 1,
    reward: { soulShards: 20 }
  },
  {
    id: 'gem_collector',
    name: 'Gem Collector',
    description: 'Find 10 rare gems (diamonds or crystals)',
    category: 'mining',
    condition: (stats) => (stats.diamondsFound + stats.crystalsFound) >= 10,
    reward: { soulShards: 40 }
  },

  // === CRAFTING ===
  {
    id: 'first_craft',
    name: 'First Craft',
    description: 'Craft your first item',
    category: 'crafting',
    condition: (stats) => stats.itemsCrafted >= 1,
    reward: { soulShards: 5 }
  },
  {
    id: 'crafter',
    name: 'Crafter',
    description: 'Craft 50 items',
    category: 'crafting',
    condition: (stats) => stats.itemsCrafted >= 50,
    reward: { soulShards: 25 }
  },
  {
    id: 'iron_smith',
    name: 'Iron Smith',
    description: 'Craft iron tools',
    category: 'crafting',
    condition: (stats) => stats.ironToolsCrafted >= 1,
    reward: { soulShards: 15 }
  },
  {
    id: 'diamond_smith',
    name: 'Diamond Smith',
    description: 'Craft diamond tools',
    category: 'crafting',
    condition: (stats) => stats.diamondToolsCrafted >= 1,
    reward: { soulShards: 40 }
  },
  {
    id: 'master_crafter',
    name: 'Master Crafter',
    description: 'Craft 200 items',
    category: 'crafting',
    condition: (stats) => stats.itemsCrafted >= 200,
    reward: { soulShards: 60 }
  },

  // === EXPLORATION ===
  {
    id: 'wanderer',
    name: 'Wanderer',
    description: 'Walk 1,000 blocks',
    category: 'exploration',
    condition: (stats) => stats.distanceTraveled >= 1000,
    reward: { soulShards: 10 }
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Walk 10,000 blocks',
    category: 'exploration',
    condition: (stats) => stats.distanceTraveled >= 10000,
    reward: { soulShards: 30 }
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Walk 50,000 blocks',
    category: 'exploration',
    condition: (stats) => stats.distanceTraveled >= 50000,
    reward: { soulShards: 75 }
  },
  {
    id: 'biome_hopper',
    name: 'Biome Hopper',
    description: 'Visit all biomes',
    category: 'exploration',
    condition: (stats) => stats.uniqueBiomesVisited >= stats.totalBiomes && stats.totalBiomes > 0,
    reward: { soulShards: 50 }
  },
  {
    id: 'structure_finder',
    name: 'Structure Finder',
    description: 'Find a structure',
    category: 'exploration',
    condition: (stats) => stats.structuresFound >= 1,
    reward: { soulShards: 15 }
  },

  // === SURVIVAL ===
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 10 minutes',
    category: 'survival',
    condition: (stats) => stats.survivalTime >= 600,
    reward: { soulShards: 15 }
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Survive for 30 minutes',
    category: 'survival',
    condition: (stats) => stats.survivalTime >= 1800,
    reward: { soulShards: 40 }
  },
  {
    id: 'death_count',
    name: 'Experienced Death',
    description: 'Die 10 times',
    category: 'survival',
    condition: (stats) => stats.deaths >= 10,
    reward: { soulShards: 10 }
  },
  {
    id: 'golden_feast',
    name: 'Golden Feast',
    description: 'Eat a golden apple',
    category: 'survival',
    condition: (stats) => stats.goldenApplesEaten >= 1,
    reward: { soulShards: 20 }
  },
  {
    id: 'deathless',
    name: 'Deathless',
    description: 'Survive 15 minutes without dying',
    category: 'survival',
    condition: (stats) => stats.currentLifeTime >= 900,
    reward: { soulShards: 50 }
  },

  // === PROGRESSION ===
  {
    id: 'soul_hoarder',
    name: 'Soul Hoarder',
    description: 'Earn 100 soul shards total',
    category: 'progression',
    condition: (stats) => stats.totalSoulShardsEarned >= 100,
    reward: { soulShards: 10 }
  },
  {
    id: 'first_upgrade',
    name: 'First Upgrade',
    description: 'Buy your first upgrade',
    category: 'progression',
    condition: (stats) => stats.upgradesPurchased >= 1,
    reward: { soulShards: 10 }
  },
  {
    id: 'level_five',
    name: 'Rising Star',
    description: 'Reach level 5',
    category: 'progression',
    condition: (stats) => stats.playerLevel >= 5,
    reward: { soulShards: 25 }
  }
];

export class AchievementSystem {
  constructor() {
    this.achievements = ACHIEVEMENTS;
    this.unlockedIds = new Set();
    this.stats = this._getDefaultStats();
    this.toastQueue = [];
    this._load();
  }

  _getDefaultStats() {
    return {
      kills: 0,
      killsWithoutDamage: 0,
      killsInWindow: 0,
      bossesKilled: 0,
      blocksMined: 0,
      diamondsFound: 0,
      crystalsFound: 0,
      itemsCrafted: 0,
      ironToolsCrafted: 0,
      diamondToolsCrafted: 0,
      distanceTraveled: 0,
      uniqueBiomesVisited: 0,
      totalBiomes: 0,
      structuresFound: 0,
      survivalTime: 0,
      currentLifeTime: 0,
      deaths: 0,
      goldenApplesEaten: 0,
      totalSoulShardsEarned: 0,
      upgradesPurchased: 0,
      playerLevel: 1,
      // Internal tracking for kill window
      _killTimestamps: [],
      _damageTakenSinceLastKill: false
    };
  }

  _load() {
    try {
      const savedUnlocked = localStorage.getItem(STORAGE_KEY);
      if (savedUnlocked) {
        const arr = JSON.parse(savedUnlocked);
        this.unlockedIds = new Set(arr);
      }
      const savedStats = localStorage.getItem(STATS_KEY);
      if (savedStats) {
        const loaded = JSON.parse(savedStats);
        // Merge with defaults to handle new fields
        this.stats = { ...this._getDefaultStats(), ...loaded };
      }
    } catch (e) {
      console.warn('Failed to load achievement data:', e);
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.unlockedIds]));
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Failed to save achievement data:', e);
    }
  }

  /**
   * Update stats based on an event and check for newly unlocked achievements.
   * @param {string} eventType - The type of event
   * @param {object} data - Event-specific data
   * @returns {Array} Array of newly unlocked achievements (with reward info)
   */
  check(eventType, data = {}) {
    this._updateStats(eventType, data);
    const newlyUnlocked = [];

    for (const achievement of this.achievements) {
      if (this.unlockedIds.has(achievement.id)) continue;

      try {
        if (achievement.condition(this.stats)) {
          this.unlockedIds.add(achievement.id);
          newlyUnlocked.push(achievement);
          this.toastQueue.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            reward: achievement.reward
          });
        }
      } catch (e) {
        // Condition check failed, skip
      }
    }

    if (newlyUnlocked.length > 0) {
      this._save();
    }

    return newlyUnlocked;
  }

  _updateStats(eventType, data) {
    const now = Date.now();

    switch (eventType) {
      case 'kill': {
        this.stats.kills++;
        const isBoss = data.isBoss || false;
        if (isBoss) {
          this.stats.bossesKilled++;
        }

        // Track kill window for berserker achievement
        this.stats._killTimestamps.push(now);
        // Keep only kills in last 10 seconds
        this.stats._killTimestamps = this.stats._killTimestamps.filter(t => now - t <= 10000);
        this.stats.killsInWindow = this.stats._killTimestamps.length;

        // Track kills without damage
        if (this.stats._damageTakenSinceLastKill) {
          this.stats.killsWithoutDamage = 1; // Reset streak, this kill counts as 1
          this.stats._damageTakenSinceLastKill = false;
        } else {
          this.stats.killsWithoutDamage++;
        }
        break;
      }

      case 'damage_taken': {
        this.stats._damageTakenSinceLastKill = true;
        this.stats.killsWithoutDamage = 0;
        break;
      }

      case 'block_mined': {
        this.stats.blocksMined++;
        const blockType = data.blockType || '';
        if (blockType === 'diamond' || blockType === 'diamond_ore') {
          this.stats.diamondsFound++;
        }
        if (blockType === 'crystal' || blockType === 'crystal_ore') {
          this.stats.crystalsFound++;
        }
        break;
      }

      case 'item_crafted': {
        this.stats.itemsCrafted++;
        const itemType = data.itemType || '';
        const tier = data.tier || '';
        if (itemType.includes('tool') || itemType.includes('sword') || itemType.includes('pickaxe')) {
          if (tier === 'iron') {
            this.stats.ironToolsCrafted++;
          }
          if (tier === 'diamond') {
            this.stats.diamondToolsCrafted++;
          }
        }
        break;
      }

      case 'move': {
        const distance = data.distance || 0;
        this.stats.distanceTraveled += distance;
        break;
      }

      case 'biome_visit': {
        if (data.isNewBiome) {
          this.stats.uniqueBiomesVisited++;
        }
        if (data.totalBiomes !== undefined) {
          this.stats.totalBiomes = data.totalBiomes;
        }
        break;
      }

      case 'structure_found': {
        this.stats.structuresFound++;
        break;
      }

      case 'survive': {
        const elapsed = data.elapsed || 0;
        this.stats.survivalTime += elapsed;
        this.stats.currentLifeTime += elapsed;
        break;
      }

      case 'death': {
        this.stats.deaths++;
        this.stats.currentLifeTime = 0; // Reset life timer
        break;
      }

      case 'eat': {
        const foodType = data.foodType || '';
        if (foodType === 'golden_apple' || foodType === 'golden-apple') {
          this.stats.goldenApplesEaten++;
        }
        break;
      }

      case 'soul_shards_earned': {
        const amount = data.amount || 0;
        this.stats.totalSoulShardsEarned += amount;
        break;
      }

      case 'upgrade_purchased': {
        this.stats.upgradesPurchased++;
        break;
      }

      case 'level_up': {
        if (data.level !== undefined) {
          this.stats.playerLevel = data.level;
        }
        break;
      }

      // Allow direct stat updates for flexibility
      case 'set_stat': {
        if (data.stat && data.value !== undefined) {
          this.stats[data.stat] = data.value;
        }
        break;
      }
    }

    this._save();
  }

  /**
   * Get all achievements with their unlock status.
   * @returns {Array} Array of achievement objects with unlocked flag
   */
  getAll() {
    return this.achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      reward: a.reward,
      unlocked: this.unlockedIds.has(a.id)
    }));
  }

  /**
   * Get count of unlocked achievements.
   * @returns {number}
   */
  getUnlockedCount() {
    return this.unlockedIds.size;
  }

  /**
   * Get total achievement count.
   * @returns {number}
   */
  getTotalCount() {
    return this.achievements.length;
  }

  /**
   * Get achievements by category.
   * @param {string} category
   * @returns {Array}
   */
  getByCategory(category) {
    return this.getAll().filter(a => a.category === category);
  }

  /**
   * Get current player stats.
   * @returns {object}
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Check if a specific achievement is unlocked.
   * @param {string} id
   * @returns {boolean}
   */
  isUnlocked(id) {
    return this.unlockedIds.has(id);
  }

  /**
   * Pop the next toast notification from the queue.
   * @returns {object|null} Toast data or null if queue is empty
   */
  popToast() {
    return this.toastQueue.shift() || null;
  }

  /**
   * Get all pending toasts and clear the queue.
   * @returns {Array}
   */
  flushToasts() {
    const toasts = [...this.toastQueue];
    this.toastQueue = [];
    return toasts;
  }

  /**
   * Reset all progress (for testing or new game).
   */
  reset() {
    this.unlockedIds = new Set();
    this.stats = this._getDefaultStats();
    this.toastQueue = [];
    this._save();
  }
}
