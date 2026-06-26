// main.js — MineRogue Game Loop & State Machine
import { GameRenderer } from './engine/renderer.js';
import { InputManager } from './engine/input.js';
import { World } from './world/world.js';
import { WorldGenerator } from './world/generator.js';
import { Player } from './entities/player.js';
import { MobManager } from './entities/mob-manager.js';
import { CombatSystem } from './systems/combat.js';
import { InventorySystem } from './systems/inventory.js';
import { CraftingSystem } from './systems/crafting.js';
import { FurnaceSystem } from './systems/furnace.js';
import { DayNightCycle } from './systems/daynight.js';
import { RoguelikeSystem } from './systems/roguelike.js';
import { SaveSystem } from './systems/save.js';
import { HomeWorld } from './systems/home-world.js';
import { DungeonGenerator } from './systems/dungeon.js';
import { AudioEngine } from './audio/engine.js';
import { ParticleSystem } from './particles.js';
import { HUD } from './ui/hud.js';
import { MenuManager } from './ui/menus.js';
import { getItem } from './data/items.js';
import { Minimap } from './ui/minimap.js';
import { HandRenderer } from './ui/hand.js';
import { createTextureAtlas, createItemTextureAtlas } from './textures.js';

// Game states
const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  DEAD: 'dead',
  INVENTORY: 'inventory',
  CRAFTING_TABLE: 'crafting_table',
  FURNACE: 'furnace',
  SHOP: 'shop',
  HOME: 'home',
  NPC_DIALOG: 'npc_dialog',
};

class Game {
  constructor() {
    this.state = STATE.MENU;
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new GameRenderer(this.canvas);
    this.input = new InputManager(this.canvas);
    this.audio = new AudioEngine();
    this.saveSystem = new SaveSystem();
    this.meta = this.saveSystem.loadMeta() || this.saveSystem.getDefaultMeta();
    this.particles = new ParticleSystem(this.renderer.getScene());
    this.hud = new HUD();
    this.menus = new MenuManager(this.saveSystem);
    this.roguelike = new RoguelikeSystem();
    this.homeWorld = new HomeWorld(this.saveSystem);
    this.minimap = null;

    // Runtime state
    this.world = null;
    this.player = null;
    this.mobManager = null;
    this.combat = null;
    this.inventory = null;
    this.crafting = null;
    this.furnaceSystem = null;
    this.dayNight = null;
    this.dungeon = null;
    this.hand = null;

    // Run stats
    this.runStats = this.resetRunStats();

    // Hitstop / slow-mo
    this.timeScale = 1;
    this.hitstopTimer = 0;
    this.slowmoTimer = 0;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0;

    // Frame timing
    this.lastTime = 0;
    this.frameCount = 0;

    this.setupMenus();
    this.setupInput();

    // Initialize item texture atlas for icon extraction
    createItemTextureAtlas();

    this.gameLoop(0);
  }

  resetRunStats() {
    return {
      mobsKilled: 0,
      blocksMined: 0,
      blocksPlaced: 0,
      craftsDone: 0,
      structuresFound: 0,
      shrinesUsed: 0,
      bossesKilled: 0,
      distanceTraveled: 0,
      depth: 0,
      startTime: Date.now(),
      biomesVisited: new Set(),
    };
  }

  setupMenus() {
    // Main menu
    this.menus.showMainMenu(
      () => this.startRun(),       // Play
      () => this.enterHomeWorld(), // Home
      () => this.openShop()        // Shop
    );
    this.menus.updateShards(this.meta.soulShards);

    // Death screen buttons
    document.getElementById('btn-respawn').addEventListener('click', () => {
      this.menus.hideDeathScreen();
      this.startRun();
    });
    document.getElementById('btn-death-menu').addEventListener('click', () => {
      this.menus.hideDeathScreen();
      this.returnToMenu();
    });

    // Pause
    document.getElementById('btn-resume').addEventListener('click', () => this.unpause());
    document.getElementById('btn-quit').addEventListener('click', () => {
      this.menus.hidePause();
      this.returnToMenu();
    });

    // Shop close
    document.getElementById('btn-close-shop').addEventListener('click', () => {
      this.menus.hideShop();
      this.state = STATE.MENU;
    });

    // Settings
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('settings-screen').style.display = 'flex';
      });
    }
    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => {
        document.getElementById('settings-screen').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
        // Save settings
        const settings = {
          volume: parseInt(document.getElementById('setting-volume')?.value || 50),
          sensitivity: parseInt(document.getElementById('setting-sensitivity')?.value || 20),
          renderDistance: parseInt(document.getElementById('setting-renderdist')?.value || 8),
          showFPS: document.getElementById('setting-showfps')?.checked || false,
        };
        localStorage.setItem('minerogue_settings', JSON.stringify(settings));
        // Apply volume
        if (this.audio) this.audio.setMasterVolume(settings.volume / 100);
      });
    }
    // Load saved settings
    try {
      const saved = JSON.parse(localStorage.getItem('minerogue_settings'));
      if (saved) {
        if (document.getElementById('setting-volume')) document.getElementById('setting-volume').value = saved.volume ?? 50;
        if (document.getElementById('setting-sensitivity')) document.getElementById('setting-sensitivity').value = saved.sensitivity ?? 20;
        if (document.getElementById('setting-renderdist')) document.getElementById('setting-renderdist').value = saved.renderDistance ?? 8;
        if (document.getElementById('setting-showfps')) document.getElementById('setting-showfps').checked = saved.showFPS ?? false;
        if (this.audio) this.audio.setMasterVolume((saved.volume ?? 50) / 100);
      }
    } catch(e) {}
  }

  setupInput() {
    this.input.onMouseLock(() => {
      if (this.state === STATE.MENU) return;
      if (this.state === STATE.PAUSED) return;
    });

    this.input.onMouseUnlock(() => {
      if (this.state === STATE.PLAYING) {
        // Don't pause on pointer unlock if we're in a menu state
      }
    });
  }

  startRun(seed = null) {
    this.runStats = this.resetRunStats();
    const runSeed = seed || Math.floor(Math.random() * 999999);

    // Generate modifiers
    const modifiers = this.roguelike.generateModifiers(
      1 + Math.floor(this.meta.stats.totalRuns / 5)
    );

    // Setup world
    const generator = new WorldGenerator(runSeed);
    this.roguelike.applyModifiers(generator, modifiers);

    this._clearScene();
    const scene = this.renderer.getScene();

    const texAtlas = createTextureAtlas();
    this.world = new World(generator, scene, texAtlas);
    this.dayNight = new DayNightCycle(scene, this.renderer.getRenderer());
    if (generator.eternalNight) {
      this.dayNight.setPermanentNight?.(true) || this.dayNight.setPermanentDay?.(false);
    }
    this.dungeon = new DungeonGenerator(this.world);

    // Setup player
    const camera = this.renderer.getCamera();
    this.inventory = new InventorySystem(this);
    this.crafting = new CraftingSystem(this.inventory);
    this.furnaceSystem = new FurnaceSystem(this.inventory, this.audio);
    this.player = new Player(this.world, camera, scene, this.audio, this.inventory);

    // Hand renderer (first-person arm + held item)
    if (this.hand) this.hand.dispose();
    this.hand = new HandRenderer(camera, scene);

    // Apply starting upgrades
    if (this.meta.upgrades.stoneStart) {
      this.player.inventory.setSlot(0, { id: 101, count: 1 }); // Stone pick
      this.player.inventory.setSlot(1, { id: 104, count: 1 }); // Stone sword
    }
    if (this.meta.upgrades.ironStart) {
      this.player.inventory.setSlot(0, { id: 106, count: 1 }); // Iron pick
      this.player.inventory.setSlot(1, { id: 109, count: 1 }); // Iron sword
    }
    if (this.meta.upgrades.backpack1) this.player.inventory.expandSlots(9);
    if (this.meta.upgrades.backpack2) this.player.inventory.expandSlots(18);

    // Mob system
    this.mobManager = new MobManager(this.world, scene, this.player, this.audio);
    this.combat = new CombatSystem(this.player, this.mobManager, this.particles, this.audio, camera);

    // Pass roguelike modifiers to player for combat system access
    this.player._roguelikeModifiers = {};
    for (const mod of modifiers) {
      Object.assign(this.player._roguelikeModifiers, mod.effect);
    }

    // Apply mob health scaling from modifiers
    const mobHealthMult = this.player._roguelikeModifiers?.mobHealthMultiplier ?? 1;
    if (mobHealthMult !== 1) {
      const origSpawn = this.mobManager.spawnMob.bind(this.mobManager);
      this.mobManager.spawnMob = (type, x, y, z) => {
        const mob = origSpawn(type, x, y, z);
        if (mob) { mob.hp = Math.floor(mob.hp * mobHealthMult); mob.maxHp = mob.hp; }
        return mob;
      };
    }

    // Minimap
    this.minimap = new Minimap(this.world);

    // Particles
    this.particles.clear();

    // Sync hand to initial hotbar slot
    this._syncHandItem();

    // Place player at spawn
    const spawnY = generator.getHeight(128, 128) + 2;
    this.player.position.set(128, spawnY, 128);

    // UI
    this.menus.hideMainMenu();
    this.hud.show();
    this.state = STATE.PLAYING;
    this.timeScale = 1;

    // Show modifiers
    if (modifiers.length > 0) {
      this.hud.showToast(`Modifiers: ${modifiers.map(m => m.name).join(', ')}`);
    }

    // Audio
    this.audio.resume();

    // Generate some dungeon markers
    this.generateRunContent(runSeed);

    this.input.requestPointerLock();
  }

  generateRunContent(seed) {
    // Place portal rooms at edges of world
    this.dungeon.generate(64, 64);
    this.dungeon.generate(192, 192);
    this.dungeon.generate(64, 192);
    this.dungeon.generate(192, 64);

    // Place structures throughout the world
    this._generateStructures(seed);
  }

  async _generateStructures(seed) {
    const rng = this._seededRng(seed + 7777);
    const structures = [
      { type: 'village_ruins', count: 4 + Math.floor(rng() * 3) },
      { type: 'dungeon_tower', count: 3 + Math.floor(rng() * 2) },
      { type: 'desert_temple', count: 2 + Math.floor(rng() * 2) },
      { type: 'portal_room', count: 2 },
    ];

    try {
      const { generateStructure } = await import('./world/structures.js');
      const worldCenter = 128;
      for (const struct of structures) {
        for (let i = 0; i < struct.count; i++) {
          const angle = rng() * Math.PI * 2;
          const dist = 30 + rng() * 80;
          const x = Math.floor(worldCenter + Math.cos(angle) * dist);
          const z = Math.floor(worldCenter + Math.sin(angle) * dist);
          const y = this.world?.generator?.getHeight(x, z) || 64;
          try {
            generateStructure(struct.type, x, y + 1, z, this.world);
          } catch(e) { /* structure may overlap */ }
        }
      }
      // Mark all chunks dirty so structures render
      for (const [, chunk] of this.world?.chunks ?? []) {
        chunk.dirty = true;
      }
    } catch(e) { console.warn('Structure generation failed:', e); }
  }

  _seededRng(seed) {
    return function() {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  enterHomeWorld() {
    this._clearScene();

    const texAtlas = createTextureAtlas();
    const homeData = this.homeWorld;
    homeData.load();

    // Create a simple flat world for home
    const generator = new WorldGenerator(0);
    this.world = new World(generator, scene, texAtlas, true); // isHome=true
    this.dayNight = new DayNightCycle(scene, this.renderer.getRenderer());
    this.dayNight.setPermanentDay(true);

    const camera = this.renderer.getCamera();
    this.inventory = this.inventory || new InventorySystem(this);
    this.player = new Player(this.world, camera, scene, this.audio, this.inventory);
    this.player.position.set(32, 12, 32);

    // Hand renderer for home world
    if (this.hand) this.hand.dispose();
    this.hand = new HandRenderer(camera, scene);
    this._syncHandItem();

    this.particles.clear();
    this.menus.hideMainMenu();
    this.hud.show();
    this.state = STATE.HOME;

    this.input.requestPointerLock();
    this.hud.showToast('Welcome Home! Build, store, and prepare for your next run.');
  }

  openShop() {
    this.state = STATE.SHOP;
    this.menus.showShop(
      this.meta.soulShards,
      this.getUpgradeDefinitions(),
      (upgradeId) => this.buyUpgrade(upgradeId)
    );
  }

  getUpgradeDefinitions() {
    return [
      { id: 'extraHearts1', name: 'Extra Hearts I', cost: 10, desc: '+2 Max HP', max: 4, current: this.meta.upgrades.extraHearts || 0 },
      { id: 'extraHearts2', name: 'Extra Hearts II', cost: 25, desc: '+2 Max HP', max: 4, current: this.meta.upgrades.extraHearts || 0, requires: 1 },
      { id: 'extraHearts3', name: 'Extra Hearts III', cost: 50, desc: '+2 Max HP', max: 4, current: this.meta.upgrades.extraHearts || 0, requires: 2 },
      { id: 'extraHearts4', name: 'Extra Hearts IV', cost: 100, desc: '+2 Max HP', max: 4, current: this.meta.upgrades.extraHearts || 0, requires: 3 },
      { id: 'ironStomach', name: 'Iron Stomach', cost: 15, desc: '-20% hunger drain', max: 1, current: this.meta.upgrades.ironStomach ? 1 : 0 },
      { id: 'stoneStart', name: 'Stone Start', cost: 20, desc: 'Start with stone tools', max: 1, current: this.meta.upgrades.stoneStart ? 1 : 0 },
      { id: 'ironStart', name: 'Iron Start', cost: 50, desc: 'Start with iron tools', max: 1, current: this.meta.upgrades.ironStart ? 1 : 0, requires: 'stoneStart' },
      { id: 'backpack1', name: 'Backpack I', cost: 25, desc: '+9 inventory slots', max: 1, current: this.meta.upgrades.backpack1 ? 1 : 0 },
      { id: 'backpack2', name: 'Backpack II', cost: 75, desc: '+18 inventory slots', max: 1, current: this.meta.upgrades.backpack2 ? 1 : 0, requires: 'backpack1' },
      { id: 'luckyStrike', name: 'Lucky Strike', cost: 30, desc: '+5% crit chance', max: 1, current: this.meta.upgrades.luckyStrike ? 1 : 0 },
      { id: 'toughSkin', name: 'Tough Skin', cost: 35, desc: '+1 base armor', max: 1, current: this.meta.upgrades.toughSkin ? 1 : 0 },
      { id: 'nightOwl', name: 'Night Owl', cost: 20, desc: 'Night vision', max: 1, current: this.meta.upgrades.nightOwl ? 1 : 0 },
      { id: 'treasureHunter', name: 'Treasure Hunter', cost: 40, desc: 'Structures visible on map', max: 1, current: this.meta.upgrades.treasureHunter ? 1 : 0 },
      { id: 'soulMagnet', name: 'Soul Magnet', cost: 50, desc: '+25% soul shards', max: 1, current: this.meta.upgrades.soulMagnet ? 1 : 0 },
      { id: 'phoenix', name: 'Phoenix', cost: 200, desc: 'Revive once per run', max: 1, current: this.meta.upgrades.phoenix ? 1 : 0 },
      { id: 'dash', name: 'Dash', cost: 30, desc: 'Quick dodge ability', max: 1, current: this.meta.upgrades.dash ? 1 : 0 },
      { id: 'groundSlam', name: 'Ground Slam', cost: 50, desc: 'AoE slam ability', max: 1, current: this.meta.upgrades.groundSlam ? 1 : 0 },
      { id: 'parry', name: 'Parry', cost: 40, desc: 'Perfect block reflects', max: 1, current: this.meta.upgrades.parry ? 1 : 0 },
      { id: 'secondWind', name: 'Second Wind', cost: 75, desc: 'Survive lethal once', max: 1, current: this.meta.upgrades.secondWind ? 1 : 0 },
      { id: 'treasureSense', name: 'Treasure Sense', cost: 25, desc: 'Chests pulse on minimap', max: 1, current: this.meta.upgrades.treasureSense ? 1 : 0 },
    ];
  }

  buyUpgrade(upgradeId) {
    const defs = this.getUpgradeDefinitions();
    const def = defs.find(d => d.id === upgradeId);
    if (!def) return;
    if (this.meta.soulShards < def.cost) return;
    if (def.current >= def.max) return;

    this.meta.soulShards -= def.cost;
    this.meta.upgrades[upgradeId] = true;
    if (upgradeId.startsWith('extraHearts')) {
      this.meta.upgrades.extraHearts = (this.meta.upgrades.extraHearts || 0) + 1;
    }

    this.saveSystem.saveMeta(this.meta);
    this.menus.updateShards(this.meta.soulShards);
    this.openShop(); // Refresh
  }

  playerDied() {
    this.state = STATE.DEAD;
    this.audio.play('player_death');
    this.input.exitPointerLock?.();

    // Calculate shards
    const shards = this.roguelike.calculateShards(this.runStats);
    const bonusShards = this.meta.upgrades.soulMagnet ? Math.floor(shards * 0.25) : 0;
    const totalShards = shards + bonusShards;

    this.meta.soulShards += totalShards;
    this.meta.stats.totalRuns = (this.meta.stats.totalRuns || 0) + 1;
    this.meta.stats.totalDeaths = (this.meta.stats.totalDeaths || 0) + 1;
    this.meta.stats.bestShards = Math.max(this.meta.stats.bestShards || 0, totalShards);
    this.meta.stats.totalMobsKilled = (this.meta.stats.totalMobsKilled || 0) + this.runStats.mobsKilled;
    this.meta.stats.totalBlocksMined = (this.meta.stats.totalBlocksMined || 0) + this.runStats.blocksMined;
    this.saveSystem.saveMeta(this.meta);

    const elapsed = Math.floor((Date.now() - this.runStats.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    this.menus.showDeathScreen({
      time: `${mins}m ${secs}s`,
      mobsKilled: this.runStats.mobsKilled,
      blocksMined: this.runStats.blocksMined,
      depth: this.runStats.depth,
      bossesKilled: this.runStats.bossesKilled,
    }, totalShards);
  }

  returnToMenu() {
    this.state = STATE.MENU;
    this.hud.hide();
    this.menus.hidePause();
    this.menus.hideDeathScreen();
    this.menus.showMainMenu(
      () => this.startRun(),
      () => this.enterHomeWorld(),
      () => this.openShop()
    );
    this.menus.updateShards(this.meta.soulShards);

    // Clean up
    if (this.hand) { this.hand.dispose(); this.hand = null; }
    if (this.world) {
      this.world.dispose();
      this.world = null;
    }
    this._clearScene();
  }

  _clearScene() {
    const scene = this.renderer.getScene();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        } else {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      }
    });
    while (scene.children.length > 0) scene.remove(scene.children[0]);
  }

  unpause() {
    this.state = STATE.PLAYING;
    this.menus.hidePause();
    this.input.requestPointerLock();
  }

  closeActiveInterface() {
    if (this.state === STATE.INVENTORY) {
      this.menus.hideInventory();
    } else if (this.state === STATE.CRAFTING_TABLE) {
      this.menus.hideCraftingTable();
    } else if (this.state === STATE.FURNACE) {
      this.menus.hideFurnace?.();
    } else {
      return false;
    }

    this.state = this.world?.isHome ? STATE.HOME : STATE.PLAYING;
    this.input.requestPointerLock();
    return true;
  }

  handleInput(dt) {
    const input = this.input;

    // ESC toggle
    if (input.isKeyDown('Escape')) {
      input.keys.delete('Escape'); // consume
      if (this.state === STATE.PLAYING || this.state === STATE.HOME) {
        this.state = STATE.PAUSED;
        this.input.exitPointerLock?.();
        document.body.style.cursor = 'default';
        this.menus.showPause({
          seed: this.world?.generator?.seed || 0,
          modifiers: this.roguelike.getModifiers()?.map(m => m.name).join(', ') || 'None',
          ...this.runStats,
        });
        return;
      } else if (this.state === STATE.PAUSED) {
        this.unpause();
        return;
      } else if (this.state === STATE.INVENTORY) {
        this.closeActiveInterface();
        return;
      } else if (this.state === STATE.CRAFTING_TABLE) {
        this.closeActiveInterface();
        return;
      } else if (this.state === STATE.FURNACE) {
        this.closeActiveInterface();
        return;
      } else if (this.state === STATE.SHOP) {
        this.menus.hideShop();
        this.state = STATE.MENU;
        return;
      }
    }

    if (this.state === STATE.INVENTORY && (input.isKeyDown('KeyE') || input.isKeyDown('KeyC'))) {
      input.keys.delete('KeyE');
      input.keys.delete('KeyC');
      this.closeActiveInterface();
      return;
    }

    if ((this.state === STATE.CRAFTING_TABLE || this.state === STATE.FURNACE) &&
        (input.isKeyDown('KeyE') || input.isKeyDown('KeyC'))) {
      input.keys.delete('KeyE');
      input.keys.delete('KeyC');
      this.closeActiveInterface();
      return;
    }

    if (this.state !== STATE.PLAYING && this.state !== STATE.HOME) return;

    // Inventory (E)
    if (input.isKeyDown('KeyE')) {
      input.keys.delete('KeyE');
      if (this.state === STATE.INVENTORY) {
        // Close inventory — re-lock pointer
        this.state = STATE.PLAYING;
        this.menus.hideInventory();
        this.input.requestPointerLock();
      } else if (this.state === STATE.PLAYING || this.state === STATE.HOME) {
        // Open inventory — release pointer lock for mouse cursor
        this.state = STATE.INVENTORY;
        document.exitPointerLock?.();
        this.menus.showInventory(this.inventory, this.crafting);
      }
      return;
    }

    // Crafting (C)
    if (input.isKeyDown('KeyC')) {
      input.keys.delete('KeyC');
      if (this.state === STATE.CRAFTING_TABLE) {
        // Close crafting — re-lock pointer
        this.state = STATE.PLAYING;
        this.menus.hideCraftingTable();
        this.input.requestPointerLock();
      } else if (this.state === STATE.PLAYING || this.state === STATE.HOME) {
        // Open crafting — release pointer lock for mouse cursor
        this.state = STATE.CRAFTING_TABLE;
        document.exitPointerLock?.();
        this.menus.showCraftingTable(this.inventory, this.crafting);
      }
      return;
    }

    // M - minimap
    if (input.isKeyDown('KeyM')) {
      input.keys.delete('KeyM');
      if (this.minimap) this.minimap.toggle();
    }

    // Hotbar selection (1-9)
    for (let i = 1; i <= 9; i++) {
      if (input.isKeyDown('Digit' + i)) {
        input.keys.delete('Digit' + i);
        this.player.selectedSlot = i - 1;
        this._syncHandItem();
      }
    }

    // Scroll wheel for hotbar
    const scroll = input.getScrollDelta();
    if (scroll !== 0) {
      this.player.selectedSlot = ((this.player.selectedSlot + Math.sign(scroll)) % 9 + 9) % 9;
      this._syncHandItem();
    }

    // Drop (Q)
    if (input.isKeyDown('KeyQ')) {
      input.keys.delete('KeyQ');
      this.player.dropSelectedItem();
    }

    // Eat (F)
    if (input.isKeyDown('KeyF')) {
      input.keys.delete('KeyF');
      this.player.eat();
    }
  }

  update(dt) {
    if (this.state === STATE.MENU) return;

    // Apply time scale (hitstop / slowmo)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt * 1000;
      this.timeScale = 0.01; // Near-stop
    } else if (this.slowmoTimer > 0) {
      this.slowmoTimer -= dt * 1000;
      this.timeScale = 0.5;
    } else {
      this.timeScale = 1;
    }

    const scaledDt = dt * this.timeScale;

    if (this.state === STATE.PLAYING || this.state === STATE.HOME) {
      // Player update
      this.player.update(scaledDt, this.input);

      // Track distance
      if (this.player.position) {
        const d = this.player.velocity?.length?.() || 0;
        this.runStats.distanceTraveled += d * scaledDt;
      }

      // World update (chunk loading/unloading)
      this.world?.update(this.player.position, this.renderer.getCamera());

      // Day/night
      this.dayNight?.update(scaledDt);

      // Mobs
      if (this.state === STATE.PLAYING) {
        this.mobManager?.update(scaledDt, performance.now() / 1000);
      }

      // Furnace
      this.furnaceSystem?.update(scaledDt);

      // Combat system (hitstop, slowmo, arrows, mob attacks, vignette)
      this.combat?.update(scaledDt);

      // Combat input
      if (this.input.isMouseDown(0) && this.state === STATE.PLAYING) {
        this._doPlayerAttack();
      }
      if (this.input.isMouseDown(2) && this.state === STATE.PLAYING) {
        // Check for interactable block (chest) before placing
        const target = this.player.getBlockLookingAt();
        if (target && target.blockId === 31) { // Chest
          const loot = this.world.openChest(target.pos.x, target.pos.y, target.pos.z);
          if (loot) {
            for (const item of loot.items) {
              this.inventory.addItem(item.id, item.count);
            }
            const names = loot.items.map(i => `${i.count}× ${this._getItemName(i.id)}`).join(', ');
            this.hud.showToast(`Chest opened: ${names}`);
            this.audio?.play?.('block_place');
          }
        } else {
          this.player.placeBlock();
        }
      }

      // Particles
      this.particles?.update(scaledDt);

      // Minimap
      if (this.minimap?.visible) {
        const p = this.player.position;
        const yaw = this.player.yaw || 0;
        this.minimap.update(p.x, p.z, yaw);
      }

      // HUD updates
      this.hud.updateHearts(this.player.health, this.player.maxHealth);
      this.hud.updateHunger(this.player.hunger);
      this.hud.updateHotbar(this.inventory, this.player.selectedSlot);

      // Hand animation update
      if (this.hand) {
        this.hand.update(scaledDt);
        this.hand.updateBob(this.player._bobPhase ?? 0);
      }

      // Block looking at
      const target = this.player.getBlockLookingAt();
      if (target) {
        const blockDef = this.player.world?.getBlockDef?.(target.blockId);
        this.hud.showBlockInfo(blockDef?.name || '');
      } else {
        this.hud.showBlockInfo('');
      }

      // Mining progress
      if (this.player.miningProgress > 0) {
        this.hud.showMineProgress(this.player.miningProgress);
      } else {
        this.hud.hideMineProgress();
      }

      // Low health pulse
      this.hud.lowHealthPulse(this.player.health, this.player.maxHealth);

      // Screen shake — use player's camera shake from combat
      const shakeI = this.player._cameraShakeIntensity || 0;
      if (shakeI > 0.001) {
        this.player._cameraShakeIntensity *= 0.9;
        const cam = this.renderer.getCamera();
        cam.position.x += (Math.random() - 0.5) * shakeI;
        cam.position.y += (Math.random() - 0.5) * shakeI;
      } else if (this.player._cameraShakeIntensity) {
        this.player._cameraShakeIntensity = 0;
      }

      // Check death
      if (this.player.health <= 0 && this.state !== STATE.DEAD) {
        // Phoenix check
        if (this.meta.upgrades.phoenix && !this.player.phoenixUsed) {
          this.player.health = this.player.maxHealth;
          this.player.phoenixUsed = true;
          this.hud.showToast('Phoenix Revive!');
          this.audio.play('level_up');
        } else {
          this.playerDied();
        }
      }
    }

    // Render
    this.renderer.render();
    this.frameCount++;

    // FPS counter
    if (document.getElementById('setting-showfps')?.checked) {
      if (!this._fpsEl) {
        this._fpsEl = document.createElement('div');
        this._fpsEl.style.cssText = 'position:fixed;top:4px;left:4px;color:#0f0;font-size:12px;z-index:999;pointer-events:none;font-family:monospace;';
        document.body.appendChild(this._fpsEl);
      }
      this._fpsEl.style.display = 'block';
      this._fpsEl.textContent = Math.round(1 / Math.max(dt, 0.001)) + ' FPS';
    } else if (this._fpsEl) {
      this._fpsEl.style.display = 'none';
    }
  }

  gameLoop(time) {
    requestAnimationFrame((t) => this.gameLoop(t));

    const dt = Math.min((time - this.lastTime) / 1000, 0.1); // cap dt
    this.lastTime = time;

    try {
      this.handleInput(dt);
      this.update(dt);
    } catch (e) {
      console.error('Game loop error:', e);
    }
    this.input.update();
  }

  // Called by combat system
  applyHitstop(durationMs) {
    this.hitstopTimer = Math.max(this.hitstopTimer, durationMs);
  }

  applySlowmo(durationMs) {
    this.slowmoTimer = Math.max(this.slowmoTimer, durationMs);
  }

  applyScreenShake(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  /**
   * Sync the hand renderer's held item with the player's selected hotbar slot.
   */
  _syncHandItem() {
    if (!this.hand || !this.inventory) return;
    const slot = this.inventory.getSlot(this.player.selectedSlot);
    this.hand.setItem(slot ? slot.id : null);
  }

  /**
   * Get human-readable name for an item ID.
   */
  _getItemName(id) {
    const item = getItem(id);
    return item?.name || `Item #${id}`;
  }

  /**
   * Execute a player attack and trigger the hand swing animation.
   */
  _doPlayerAttack() {
    this.combat?.playerAttack();
    if (this.hand) {
      const toolData = this.inventory?.getHeldToolData();
      const toolType = toolData?.type || 'hand';
      this.hand.swingAttack(toolType);
    }
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
