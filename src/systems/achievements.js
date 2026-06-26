// MineRogue - Achievement Tracking System
// 30+ achievements across Combat, Mining, Exploration, Crafting, Progression categories
// localStorage persistence, toast notifications on unlock

const STORAGE_KEY = 'minerogue_achievements';

// ─── Achievement Definitions ──────────────────────────────────────

export const ACHIEVEMENT_CATEGORIES = {
  COMBAT: 'Combat',
  MINING: 'Mining',
  EXPLORATION: 'Exploration',
  CRAFTING: 'Crafting',
  PROGRESSION: 'Progression',
};

export const ACHIEVEMENTS = [
  // ── COMBAT ──
  { id: 'first_kill', name: 'First Blood', desc: 'Kill your first mob', category: 'Combat', icon: '⚔️', check: (s) => s.mobsKilled >= 1 },
  { id: 'kill_10', name: 'Monster Hunter', desc: 'Kill 10 mobs', category: 'Combat', icon: '🗡️', check: (s) => s.mobsKilled >= 10 },
  { id: 'kill_50', name: 'Slaughter', desc: 'Kill 50 mobs in one run', category: 'Combat', icon: '💀', check: (s) => s.mobsKilled >= 50 },
  { id: 'kill_100', name: 'War Machine', desc: 'Kill 100 mobs in one run', category: 'Combat', icon: '🔥', check: (s) => s.mobsKilled >= 100 },
  { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat a boss', category: 'Combat', icon: '👑', check: (s) => s.bossesKilled >= 1 },
  { id: 'boss_3', name: 'Boss Hunter', desc: 'Defeat 3 bosses', category: 'Combat', icon: '🏆', check: (s) => s.bossesKilled >= 3 },
  { id: 'no_hit_boss', name: 'Untouchable', desc: 'Defeat a boss without taking damage', category: 'Combat', icon: '✨', check: (s) => s.bossNoHit },
  { id: 'kill_creeper', name: 'SSSssss...', desc: 'Kill a Creeper before it explodes', category: 'Combat', icon: '🧨', check: (s) => s.creeperPreKill >= 1 },
  { id: 'first_crit', name: 'Critical Hit!', desc: 'Land your first critical hit', category: 'Combat', icon: '💫', check: (s) => s.critsLanded >= 1 },

  // ── MINING ──
  { id: 'first_mine', name: 'Getting Started', desc: 'Mine your first block', category: 'Mining', icon: '⛏️', check: (s) => s.blocksMined >= 1 },
  { id: 'mine_100', name: 'Miner', desc: 'Mine 100 blocks', category: 'Mining', icon: '🪨', check: (s) => s.blocksMined >= 100 },
  { id: 'mine_500', name: 'Excavator', desc: 'Mine 500 blocks', category: 'Mining', icon: '💎', check: (s) => s.blocksMined >= 500 },
  { id: 'mine_1000', name: 'Terraformer', desc: 'Mine 1000 blocks', category: 'Mining', icon: '🌍', check: (s) => s.blocksMined >= 1000 },
  { id: 'find_diamond', name: 'Diamond Find!', desc: 'Mine a diamond ore', category: 'Mining', icon: '💎', check: (s) => s.diamondsMined >= 1 },
  { id: 'find_iron', name: 'Iron Will', desc: 'Mine iron ore for the first time', category: 'Mining', icon: '🪙', check: (s) => s.ironMined >= 1 },
  { id: 'find_gold', name: 'Gold Rush', desc: 'Mine gold ore for the first time', category: 'Mining', icon: '🥇', check: (s) => s.goldMined >= 1 },
  { id: 'find_crystal', name: 'Crystal Clear', desc: 'Mine crystal ore', category: 'Mining', icon: '🔮', check: (s) => s.crystalMined >= 1 },
  { id: 'find_obsidian', name: 'Obsidian!', desc: 'Mine obsidian', category: 'Mining', icon: '⬛', check: (s) => s.obsidianMined >= 1 },
  { id: 'break_tool', name: 'Oops...', desc: 'Break a tool', category: 'Mining', icon: '🔧', check: (s) => s.toolsBroken >= 1 },

  // ── EXPLORATION ──
  { id: 'first_structure', name: 'Explorer', desc: 'Find a structure', category: 'Exploration', icon: '🗺️', check: (s) => s.structuresFound >= 1 },
  { id: 'find_5_structures', name: 'Adventurer', desc: 'Find 5 structures', category: 'Exploration', icon: '🧭', check: (s) => s.structuresFound >= 5 },
  { id: 'open_chest', name: 'Treasure!', desc: 'Open a chest', category: 'Exploration', icon: '📦', check: (s) => s.chestsOpened >= 1 },
  { id: 'open_10_chests', name: 'Treasure Hunter', desc: 'Open 10 chests', category: 'Exploration', icon: '🎁', check: (s) => s.chestsOpened >= 10 },
  { id: 'find_shrine', name: 'Divine', desc: 'Find and use a shrine', category: 'Exploration', icon: '🏛️', check: (s) => s.shrinesUsed >= 1 },
  { id: 'visit_biomes_3', name: 'World Traveler', desc: 'Visit 3 different biomes', category: 'Exploration', icon: '🌈', check: (s) => (s.biomesVisited?.size ?? 0) >= 3 },
  { id: 'reach_depth_5', name: 'Deep Diver', desc: 'Reach floor 5', category: 'Exploration', icon: '⬇️', check: (s) => s.depth >= 5 },
  { id: 'reach_depth_10', name: 'Abyss Walker', desc: 'Reach floor 10', category: 'Exploration', icon: '🕳️', check: (s) => s.depth >= 10 },

  // ── CRAFTING ──
  { id: 'first_craft', name: 'Craftsman', desc: 'Craft your first item', category: 'Crafting', icon: '🔨', check: (s) => s.craftsDone >= 1 },
  { id: 'craft_10', name: 'Artisan', desc: 'Craft 10 items', category: 'Crafting', icon: '⚒️', check: (s) => s.craftsDone >= 10 },
  { id: 'craft_50', name: 'Master Crafter', desc: 'Craft 50 items', category: 'Crafting', icon: '🏭', check: (s) => s.craftsDone >= 50 },
  { id: 'full_iron', name: 'Ironclad', desc: 'Wear a full set of iron armor', category: 'Crafting', icon: '🛡️', check: (s) => s.fullIronArmor },
  { id: 'full_diamond', name: 'Diamond Armor', desc: 'Wear a full set of diamond armor', category: 'Crafting', icon: '💠', check: (s) => s.fullDiamondArmor },
  { id: 'full_crystal', name: 'Crystallized', desc: 'Wear a full set of crystal armor', category: 'Crafting', icon: '🔮', check: (s) => s.fullCrystalArmor },
  { id: 'cook_food', name: 'Chef', desc: 'Eat 10 food items', category: 'Crafting', icon: '🍖', check: (s) => s.foodEaten >= 10 },
  { id: 'use_potion', name: 'Alchemist', desc: 'Drink a potion', category: 'Crafting', icon: '🧪', check: (s) => s.potionsUsed >= 1 },
  { id: 'first_enchant', name: 'Enchanted', desc: 'Enchant an item for the first time', category: 'Crafting', icon: '📚', check: (s) => s.itemsEnchanted >= 1 },

  // ── PROGRESSION ──
  { id: 'first_death', name: 'RIP', desc: 'Die for the first time', category: 'Progression', icon: '💀', check: (s) => s.totalDeaths >= 1 },
  { id: 'first_run', name: 'Beginner', desc: 'Complete your first run', category: 'Progression', icon: '🏁', check: (s) => s.totalRuns >= 1 },
  { id: 'runs_10', name: 'Veteran', desc: 'Complete 10 runs', category: 'Progression', icon: '🎖️', check: (s) => s.totalRuns >= 10 },
  { id: 'earn_100_shards', name: 'Soul Collector', desc: 'Earn 100 soul shards', category: 'Progression', icon: '✦', check: (s) => s.totalShardsEarned >= 100 },
  { id: 'earn_500_shards', name: 'Soul Hoarder', desc: 'Earn 500 soul shards', category: 'Progression', icon: '⭐', check: (s) => s.totalShardsEarned >= 500 },
  { id: 'travel_1000', name: 'Long Walk', desc: 'Travel 1000 blocks in one run', category: 'Progression', icon: '🚶', check: (s) => s.distanceTraveled >= 1000 },
  { id: 'travel_5000', name: 'Marathon', desc: 'Travel 5000 blocks in one run', category: 'Progression', icon: '🏃', check: (s) => s.distanceTraveled >= 5000 },
  { id: 'survive_10min', name: 'Survivor', desc: 'Survive for 10 minutes', category: 'Progression', icon: '⏱️', check: (s) => s.survivalTime >= 600 },
  { id: 'survive_30min', name: 'Endurance', desc: 'Survive for 30 minutes', category: 'Progression', icon: '⏳', check: (s) => s.survivalTime >= 1800 },
];

// ─── Achievement Tracker ──────────────────────────────────────────

export class AchievementSystem {
  constructor() {
    // Unlocked achievements: { id: timestamp }
    this._unlocked = this._load();
    // Pending toast queue
    this._toastQueue = [];
    // External toast callback (set by game)
    this._onToast = null;
    // External stats getter (set by game)
    this._getStats = null;
  }

  /**
   * Set the toast callback function (e.g. hud.showToast)
   */
  setToastCallback(fn) {
    this._onToast = fn;
  }

  /**
   * Set the stats getter function that returns current run stats
   */
  setStatsGetter(fn) {
    this._getStats = fn;
  }

  /**
   * Get all achievement definitions with unlock status
   */
  getAll() {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: !!this._unlocked[a.id],
      unlockedAt: this._unlocked[a.id] || null,
    }));
  }

  /**
   * Get unlocked count
   */
  getUnlockedCount() {
    return Object.keys(this._unlocked).length;
  }

  /**
   * Get total achievement count
   */
  getTotalCount() {
    return ACHIEVEMENTS.length;
  }

  /**
   * Check if a specific achievement is unlocked
   */
  isUnlocked(id) {
    return !!this._unlocked[id];
  }

  /**
   * Manually unlock an achievement (used for special cases)
   */
  unlock(id) {
    if (this._unlocked[id]) return false;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return false;
    this._unlocked[id] = Date.now();
    this._save();
    this._queueToast(def);
    return true;
  }

  /**
   * Check all achievements against current stats.
   * Call this whenever stats change.
   */
  checkAll(stats) {
    for (const ach of ACHIEVEMENTS) {
      if (this._unlocked[ach.id]) continue;
      try {
        if (ach.check(stats)) {
          this._unlocked[ach.id] = Date.now();
          this._queueToast(ach);
        }
      } catch (e) {
        // Stats may not have all fields; skip
      }
    }
    this._save();
    this._flushToasts();
  }

  /**
   * Quick check a single achievement by id against stats
   */
  check(id, stats) {
    if (this._unlocked[id]) return;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return;
    try {
      if (def.check(stats)) {
        this._unlocked[id] = Date.now();
        this._save();
        this._queueToast(def);
        this._flushToasts();
      }
    } catch (e) {}
  }

  /**
   * Get progress summary for display
   */
  getProgressByCategory() {
    const cats = {};
    for (const cat of Object.values(ACHIEVEMENT_CATEGORIES)) {
      cats[cat] = { total: 0, unlocked: 0, achievements: [] };
    }
    for (const a of ACHIEVEMENTS) {
      const cat = cats[a.category];
      if (!cat) continue;
      cat.total++;
      const unlocked = !!this._unlocked[a.id];
      if (unlocked) cat.unlocked++;
      cat.achievements.push({ ...a, unlocked, unlockedAt: this._unlocked[a.id] || null });
    }
    return cats;
  }

  // ── Persistence ──

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._unlocked));
    } catch (e) {
      console.warn('Failed to save achievements:', e);
    }
  }

  // ── Toast Queue ──

  _queueToast(achievement) {
    this._toastQueue.push(achievement);
  }

  _flushToasts() {
    while (this._toastQueue.length > 0) {
      const ach = this._toastQueue.shift();
      if (this._onToast) {
        this._onToast(`🏆 Achievement: ${ach.name} — ${ach.desc}`);
      }
      // Also dispatch a DOM event for UI hooks
      window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }));
    }
  }

  /**
   * Reset all achievements (for testing or new game)
   */
  reset() {
    this._unlocked = {};
    this._save();
  }
}
