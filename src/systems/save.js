// Save system - localStorage based persistence

export class SaveSystem {
  constructor() {
    this.META_KEY = 'minerogue_meta';
    this.HOME_KEY = 'minerogue_home';
    this.SETTINGS_KEY = 'minerogue_settings';
  }

  /**
   * Save meta (persistent between runs)
   */
  saveMeta(data) {
    try {
      localStorage.setItem(this.META_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save meta:', e);
    }
  }

  /**
   * Load meta
   */
  loadMeta() {
    try {
      const raw = localStorage.getItem(this.META_KEY);
      if (!raw) return this.getDefaultMeta();
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load meta:', e);
      return this.getDefaultMeta();
    }
  }

  /**
   * Save home world data
   */
  saveHome(data) {
    try {
      localStorage.setItem(this.HOME_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save home:', e);
    }
  }

  /**
   * Load home world data
   */
  loadHome() {
    try {
      const raw = localStorage.getItem(this.HOME_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to load home:', e);
      return null;
    }
  }

  /**
   * Save settings
   */
  saveSettings(data) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  /**
   * Load settings
   */
  loadSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get default meta state (new player)
   */
  getDefaultMeta() {
    return {
      soulShards: 0,
      totalShardsEarned: 0,
      upgrades: {
        maxHealth: 0,       // +2 HP per level (max 10)
        maxHunger: 0,       // +2 hunger per level (max 10)
        miningSpeed: 0,     // +10% per level (max 5)
        damage: 0,          // +10% per level (max 5)
        armor: 0,           // +1 armor per level (max 5)
        inventorySize: 0,   // +9 slots per level (max 2)
        luck: 0,            // +5% luck per level (max 5)
        regeneration: 0,    // regen speed per level (max 3)
      },
      npcsUnlocked: {
        blacksmith: false,
        witch: false,
        merchant: false,
        enchantress: false,
      },
      stats: {
        totalRuns: 0,
        totalMobsKilled: 0,
        totalBlocksBroken: 0,
        totalShardsEarned: 0,
        bestDepth: 0,
        totalDistanceTraveled: 0,
        totalCrafts: 0,
        bossesKilled: 0,
        totalPlayTime: 0,
      },
      achievements: {},
      highestDepth: 0,
      settings: {
        renderDistance: 6,
        mouseSensitivity: 0.5,
        fov: 75,
        volume: 0.7,
        showFPS: false,
      },
    };
  }

  /**
   * Clear all saved data
   */
  clearAll() {
    localStorage.removeItem(this.META_KEY);
    localStorage.removeItem(this.HOME_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
  }

  /**
   * Check if save exists
   */
  hasSave() {
    return localStorage.getItem(this.META_KEY) !== null;
  }
}
