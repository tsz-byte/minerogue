/**
 * MineRogue Menu Manager — v3
 * Textured item icons, drag-and-drop, recipe book, working crafting,
 * virtual cursor system (no system cursor escape).
 */
import { getItemIcon } from '../textures.js';
import { getItem, getItemByName } from '../data/items.js';
import { getBlock, getBlockByName } from '../data/blocks.js';
import { CRAFTING_RECIPES, SMELTING_RECIPES } from '../data/recipes.js';

// ─── Resolve a recipe result name to a numeric item/block ID ───
function resolveResultId(name) {
  const item = getItemByName(name);
  if (item) return item.id;
  const block = getBlockByName(name);
  if (block) return block.id;
  return null;
}

function resolveEntryNameById(id) {
  return getItem(id)?.name ?? getBlock(id)?.name ?? null;
}

function resolveIngredientId(name) {
  return getItemByName(name)?.id ?? getBlockByName(name)?.id ?? null;
}

// Recipe ingredient groups — synonyms for flexible matching
const INGREDIENT_GROUPS = {
  'Wood': ['Oak Log', 'Birch Log', 'Spruce Log'],
  'Oak Planks': ['Oak Planks', 'Birch Planks', 'Spruce Planks'],
};

function resolveIngredientGroups(patternItem) {
  return INGREDIENT_GROUPS[patternItem] || [patternItem];
}

export class MenuManager {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;

    // Cache DOM references
    this.mainMenu = document.getElementById('main-menu');
    this.deathScreen = document.getElementById('death-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.inventoryScreen = document.getElementById('inventory-screen');
    this.craftingScreen = document.getElementById('crafting-screen');
    this.furnaceScreen = document.getElementById('furnace-screen');
    this.shopScreen = document.getElementById('shop-screen');
    this.settingsScreen = document.getElementById('settings-screen');
    this.shardCountEl = document.getElementById('shard-count');
    this.shopShardsEl = document.getElementById('shop-shards');
    this.shopItemsEl = document.getElementById('shop-items');
    this.deathStatsEl = document.getElementById('death-stats');
    this.shardEarnedEl = document.getElementById('shard-earned');
    this.pauseStatsEl = document.getElementById('pause-stats');
    this.invGrid = document.getElementById('inv-grid');
    this.craftGrid = document.getElementById('craft-grid');
    this.craftResult = document.getElementById('craft-result');
    this.craftGrid3x3 = document.getElementById('craft-grid-3x3');
    this.craftResult3x3 = document.getElementById('craft-result-3x3');
    this.armorSlots = document.getElementById('armor-slots');
    this.furnaceInput = document.getElementById('furnace-input');
    this.furnaceFuel = document.getElementById('furnace-fuel');
    this.furnaceOutput = document.getElementById('furnace-output');
    this.furnaceProgress = document.getElementById('furnace-progress');

    this._screens = [
      this.mainMenu, this.deathScreen, this.pauseScreen,
      this.inventoryScreen, this.craftingScreen, this.furnaceScreen,
      this.shopScreen, this.settingsScreen,
    ].filter(Boolean);

    // Drag-and-drop state
    this._heldItem = null;
    this._heldEl = null;
    this._inventory = null;
    this._crafting = null;

    // Virtual cursor state
    this._vcActive = false;
    this._vcX = window.innerWidth / 2;
    this._vcY = window.innerHeight / 2;
    this._vcEl = null;
    this._vcSpeed = 3.0; // cursor speed multiplier

    this._setupVirtualCursor();
    this._setupGlobalListeners();
  }

  // ─── Virtual Cursor System ────────────────────────────

  _setupVirtualCursor() {
    // Create the custom cursor element
    this._vcEl = document.createElement('div');
    this._vcEl.id = 'virtual-cursor';
    this._vcEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 99999;
      display: none; width: 20px; height: 20px;
      transform: translate(-50%, -50%);
    `;
    // Custom pixel-art crosshair cursor
    this._vcEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" style="image-rendering:pixelated;">
        <rect x="9" y="2" width="2" height="6" fill="#fff"/>
        <rect x="9" y="12" width="2" height="6" fill="#fff"/>
        <rect x="2" y="9" width="6" height="2" fill="#fff"/>
        <rect x="12" y="9" width="6" height="2" fill="#fff"/>
        <rect x="9" y="9" width="2" height="2" fill="#f0c040"/>
        <rect x="9" y="2" width="2" height="1" fill="rgba(0,0,0,0.5)"/>
        <rect x="2" y="9" width="1" height="2" fill="rgba(0,0,0,0.5)"/>
      </svg>
    `;
    document.body.appendChild(this._vcEl);
  }

  _setupGlobalListeners() {
    // Track mouse movement for virtual cursor (always active when vc is on)
    document.addEventListener('mousemove', (e) => {
      if (!this._vcActive) return;
      // Use movementX/Y when pointer lock is active
      if (document.pointerLockElement) {
        this._vcX += e.movementX * this._vcSpeed;
        this._vcY += e.movementY * this._vcSpeed;
      } else {
        this._vcX = e.clientX;
        this._vcY = e.clientY;
      }
      // Clamp to screen
      this._vcX = Math.max(0, Math.min(window.innerWidth, this._vcX));
      this._vcY = Math.max(0, Math.min(window.innerHeight, this._vcY));
      this._vcEl.style.left = this._vcX + 'px';
      this._vcEl.style.top = this._vcY + 'px';

      // Update held item position
      if (this._heldEl) {
        this._heldEl.style.left = (this._vcX + 12) + 'px';
        this._heldEl.style.top = (this._vcY + 12) + 'px';
      }
    });

    // Handle clicks via virtual cursor
    document.addEventListener('mousedown', (e) => {
      if (!this._vcActive || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      this._handleVirtualClick();
    }, true); // capture phase to intercept before other handlers

    // Prevent context menu when virtual cursor is active
    document.addEventListener('contextmenu', (e) => {
      if (this._vcActive) e.preventDefault();
    });
  }

  _handleVirtualClick() {
    // Find the element under the virtual cursor
    // Temporarily hide the cursor and held item so elementFromPoint finds the slot underneath
    this._vcEl.style.pointerEvents = 'none';
    if (this._heldEl) this._heldEl.style.pointerEvents = 'none';

    const el = document.elementFromPoint(this._vcX, this._vcY);

    // Walk up to find an inv-slot element with an onclick handler
    let target = el;
    for (let i = 0; i < 5 && target; i++) {
      if (target.onclick || target.dataset?.slot !== undefined) {
        target.click();
        return;
      }
      // Check for craft result buttons
      if (target.tagName === 'BUTTON' && target.onclick) {
        target.click();
        return;
      }
      target = target.parentElement;
    }
  }

  activateVirtualCursor() {
    this._vcActive = true;
    this._vcX = window.innerWidth / 2;
    this._vcY = window.innerHeight / 2;
    this._vcEl.style.display = 'block';
    this._vcEl.style.left = this._vcX + 'px';
    this._vcEl.style.top = this._vcY + 'px';
    document.body.style.cursor = 'none';
    // Hide system cursor on all inventory screens
    document.querySelectorAll('#ui-layer > *').forEach(el => {
      el.style.cursor = 'none';
    });
  }

  deactivateVirtualCursor() {
    this._vcActive = false;
    this._vcEl.style.display = 'none';
    this._dropHeldItem();
    this._hideTooltip();
    // Restore cursors
    document.querySelectorAll('#ui-layer > *').forEach(el => {
      el.style.cursor = '';
    });
  }

  // ─── Utility ──────────────────────────────────────────

  isVisible() {
    return this._screens.some(el => {
      if (!el) return false;
      const d = getComputedStyle(el).display;
      return d !== 'none';
    });
  }

  _show(el) { if (el) el.style.display = 'flex'; }
  _hide(el) { if (el) el.style.display = 'none'; }

  updateShards(count) {
    if (this.shardCountEl) this.shardCountEl.textContent = count;
    if (this.shopShardsEl) this.shopShardsEl.textContent = count;
  }

  // ─── Main Menu ────────────────────────────────────────

  showMainMenu(onPlay, onHome, onShop) {
    this._show(this.mainMenu);
    const playBtn = document.getElementById('btn-play');
    const homeBtn = document.getElementById('btn-home');
    const shopBtn = document.getElementById('btn-shop');
    if (onPlay && playBtn) playBtn.onclick = onPlay;
    if (onHome && homeBtn) homeBtn.onclick = onHome;
    if (onShop && shopBtn) shopBtn.onclick = onShop;
    if (this.saveSystem) {
      const meta = this.saveSystem.loadMeta?.();
      if (meta) this.updateShards(meta.soulShards ?? 0);
    }
  }

  hideMainMenu() { this._hide(this.mainMenu); }

  // ─── Death Screen ─────────────────────────────────────

  showDeathScreen(stats, shards) {
    this._show(this.deathScreen);
    if (this.deathStatsEl) {
      this.deathStatsEl.innerHTML = [
        stats.time ? `Time: ${stats.time}` : null,
        `Mobs Killed: ${stats.mobsKilled ?? 0}`,
        `Blocks Mined: ${stats.blocksMined ?? 0}`,
        `Depth: Floor ${stats.depth ?? 1}`,
        stats.bossesKilled != null ? `Bosses: ${stats.bossesKilled}` : null,
      ].filter(Boolean).join('<br>');
    }
    if (this.shardEarnedEl) {
      this.shardEarnedEl.textContent = '✦ +0 Soul Shards';
      let current = 0;
      const target = shards || 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const iv = setInterval(() => {
        current = Math.min(target, current + step);
        this.shardEarnedEl.textContent = `✦ +${current} Soul Shards`;
        if (current >= target) clearInterval(iv);
      }, 40);
    }
  }

  hideDeathScreen() { this._hide(this.deathScreen); }

  // ─── Pause ────────────────────────────────────────────

  showPause(stats) {
    this._show(this.pauseScreen);
    if (this.pauseStatsEl && stats) {
      const lines = [];
      if (stats.seed != null) lines.push(`Seed: ${stats.seed}`);
      if (stats.modifiers) lines.push(`Modifiers: ${stats.modifiers}`);
      if (stats.mobsKilled != null) lines.push(`Kills: ${stats.mobsKilled}`);
      if (stats.blocksMined != null) lines.push(`Mined: ${stats.blocksMined}`);
      if (stats.depth != null) lines.push(`Floor: ${stats.depth}`);
      this.pauseStatsEl.innerHTML = lines.join('<br>');
    }
  }

  hidePause() { this._hide(this.pauseScreen); }

  // ─── Inventory (with drag-and-drop + crafting) ────────

  showInventory(inventory, crafting) {
    this._show(this.inventoryScreen);
    this._inventory = inventory;
    this._crafting = crafting;
    this.activateVirtualCursor();
    this._renderInventoryGrid();
  }

  _renderInventoryGrid() {
    const inventory = this._inventory;
    if (!inventory) return;
    const slots = inventory.slots;
    if (!slots) return;

    // Main inventory grid (slots 9-35, 3 rows of 9 — excludes hotbar)
    if (this.invGrid) {
      this.invGrid.innerHTML = '';
      for (let i = 9; i < Math.min(36, slots.length); i++) {
        this.invGrid.appendChild(this._createSlot(slots, i, 'inventory'));
      }
    }

    // Hotbar (slots 0-8) — rendered in dedicated #inv-hotbar element
    const invHotbar = document.getElementById('inv-hotbar');
    if (invHotbar) {
      invHotbar.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const slotEl = this._createSlot(slots, i, 'inventory');
        if (i === inventory.selectedSlot) {
          slotEl.classList.add('hotbar-selected');
        }
        invHotbar.appendChild(slotEl);
      }
    }

    // Armor slots
    if (this.armorSlots && inventory.armor) {
      const armorSlotEls = this.armorSlots.querySelectorAll('.armor-slot');
      armorSlotEls.forEach((el, i) => {
        el.innerHTML = '';
        const item = inventory.armor[i];
        if (item) el.appendChild(this._createSlotIcon(item));
        el.style.cursor = 'pointer';
        el.onclick = () => this._handleSlotClick('armor', i);
      });
    }

    // 2x2 crafting grid
    if (this.craftGrid) {
      this.craftGrid.innerHTML = '';
      if (!inventory._craftGrid) inventory._craftGrid = [null, null, null, null];
      for (let i = 0; i < 4; i++) {
        this.craftGrid.appendChild(this._createSlot(inventory._craftGrid, i, 'craft2'));
      }
    }

    // Crafting result
    if (this.craftResult) {
      this.craftResult.innerHTML = '';
      const result = this._checkCraft2x2();
      if (result) {
        const el = this._createSlot([{ id: result.numericId, count: result.count }], 0, 'result');
        el.onclick = () => this._craftItem('craft2', result);
        el.style.cursor = 'pointer';
        el.style.border = '2px solid #4f4';
        this.craftResult.appendChild(el);
      } else {
        // Empty placeholder result slot
        const empty = document.createElement('div');
        empty.style.cssText = 'width:40px;height:40px;border:2px dashed #444;background:#1a1a1a;';
        this.craftResult.appendChild(empty);
      }
    }
  }

  _checkCraft2x2() {
    if (!this._inventory?._craftGrid) return null;
    const grid = this._inventory._craftGrid;
    const grid3x3 = [
      grid[0], grid[1], null,
      grid[2], grid[3], null,
      null, null, null,
    ];
    const nameGrid = grid3x3.map(slot => slot ? resolveEntryNameById(slot.id) : null);
    for (const recipe of CRAFTING_RECIPES) {
      if (this._matchRecipe(nameGrid, recipe)) {
        const numericId = resolveResultId(recipe.result.id);
        if (numericId != null) return { ...recipe.result, numericId };
      }
    }
    return null;
  }

  _matchRecipe(grid, recipe) {
    if (recipe.shapeless) {
      const gridItems = grid.filter(x => x != null).sort();
      const recipeItems = recipe.pattern.flat().filter(x => x != null).sort();
      if (gridItems.length !== recipeItems.length) return false;
      // Check each grid item against valid group alternatives
      const used = new Array(gridItems.length).fill(false);
      for (const gi of gridItems) {
        let found = false;
        for (let i = 0; i < recipeItems.length; i++) {
          if (!used[i] && resolveIngredientGroups(recipeItems[i]).includes(gi)) {
            used[i] = true;
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }
    const patternRows = recipe.pattern.length;
    const patternCols = Math.max(...recipe.pattern.map(r => r.length));
    for (let rowOff = 0; rowOff <= 3 - patternRows; rowOff++) {
      for (let colOff = 0; colOff <= 3 - patternCols; colOff++) {
        let match = true;
        for (let r = 0; r < 3 && match; r++) {
          for (let c = 0; c < 3 && match; c++) {
            const gridItem = grid[r * 3 + c];
            let patternItem = null;
            if (r >= rowOff && r < rowOff + patternRows &&
                c >= colOff && c < colOff + patternCols) {
              const pr = r - rowOff;
              const pc = c - colOff;
              if (recipe.pattern[pr] && pc < recipe.pattern[pr].length) {
                patternItem = recipe.pattern[pr][pc];
              }
            }
            if (patternItem === null && gridItem === null) continue;
            if (patternItem === null || gridItem === null) { match = false; continue; }
            const validNames = resolveIngredientGroups(patternItem);
            if (!validNames.includes(gridItem)) match = false;
          }
        }
        if (match) return true;
      }
    }
    return false;
  }

  _craftItem(sourceType, result) {
    if (!this._inventory) return;
    const id = result.numericId ?? (typeof result.id === 'number' ? result.id : resolveResultId(result.id));
    if (id == null) return;
    const remaining = this._inventory.addItem(id, result.count);
    if (remaining > 0) return;

    // Consume ingredients
    if (sourceType === 'craft2' && this._inventory._craftGrid) {
      for (let i = 0; i < 4; i++) {
        const slot = this._inventory._craftGrid[i];
        if (slot) {
          slot.count--;
          if (slot.count <= 0) this._inventory._craftGrid[i] = null;
        }
      }
    } else if (sourceType === 'craft3' && this._inventory._craftGrid3x3) {
      for (let i = 0; i < 9; i++) {
        const slot = this._inventory._craftGrid3x3[i];
        if (slot) {
          slot.count--;
          if (slot.count <= 0) this._inventory._craftGrid3x3[i] = null;
        }
      }
    }
    this._refreshCurrentScreen();
  }

  hideInventory() {
    this._hide(this.inventoryScreen);
    this.deactivateVirtualCursor();
    this._inventory = null;
  }

  // ─── Crafting Table (with recipe book) ────────────────

  showCraftingTable(inventory, crafting) {
    this._show(this.craftingScreen);
    this._inventory = inventory;
    this._crafting = crafting;
    this.activateVirtualCursor();
    this._renderCraftingScreen();
  }

  _renderCraftingScreen() {
    const inventory = this._inventory;
    if (!inventory) return;
    const panel = document.getElementById('crafting-panel');
    if (!panel) return;

    panel.innerHTML = '';

    // Title
    const title = document.createElement('div');
    title.style.cssText = 'color:#fff;font-size:16px;text-align:center;margin-bottom:12px;';
    title.textContent = 'Crafting Table';
    panel.appendChild(title);

    // Top section: 3x3 grid + result
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;gap:16px;align-items:center;justify-content:center;margin-bottom:16px;';

    if (!inventory._craftGrid3x3) inventory._craftGrid3x3 = new Array(9).fill(null);
    const grid3x3 = document.createElement('div');
    grid3x3.style.cssText = 'display:grid;grid-template-columns:repeat(3,40px);gap:2px;';
    for (let i = 0; i < 9; i++) {
      grid3x3.appendChild(this._createSlot(inventory._craftGrid3x3, i, 'craft3'));
    }
    topRow.appendChild(grid3x3);

    const arrow = document.createElement('div');
    arrow.style.cssText = 'color:#888;font-size:24px;padding:0 8px;';
    arrow.textContent = '→';
    topRow.appendChild(arrow);

    // Result slot
    const resultContainer = document.createElement('div');
    const result = this._checkCraft3x3();
    if (result) {
      const el = this._createSlot([{ id: result.numericId, count: result.count }], 0, 'result3');
      el.onclick = () => this._craftItem('craft3', result);
      el.style.cursor = 'pointer';
      el.style.border = '2px solid #4f4';
      resultContainer.appendChild(el);
    } else {
      // Empty placeholder result slot
      const empty = document.createElement('div');
      empty.style.cssText = 'width:40px;height:40px;border:2px dashed #444;background:#1a1a1a;';
      resultContainer.appendChild(empty);
    }
    topRow.appendChild(resultContainer);
    panel.appendChild(topRow);

    // Inventory grid
    const invLabel = document.createElement('div');
    invLabel.style.cssText = 'color:#888;font-size:11px;text-align:center;margin:8px 0 4px;';
    invLabel.textContent = 'Inventory';
    panel.appendChild(invLabel);

    const invGrid = document.createElement('div');
    invGrid.style.cssText = 'display:grid;grid-template-columns:repeat(9,40px);gap:2px;justify-content:center;';
    for (let i = 9; i < Math.min(36, inventory.slots.length); i++) {
      invGrid.appendChild(this._createSlot(inventory.slots, i, 'inventory'));
    }
    panel.appendChild(invGrid);

    // Hotbar
    const hotbarLabel = document.createElement('div');
    hotbarLabel.style.cssText = 'color:#888;font-size:11px;text-align:center;margin:8px 0 4px;';
    hotbarLabel.textContent = 'Hotbar';
    panel.appendChild(hotbarLabel);

    const hotbarGrid = document.createElement('div');
    hotbarGrid.style.cssText = 'display:grid;grid-template-columns:repeat(9,40px);gap:2px;justify-content:center;border-top:2px solid #555;padding-top:8px;';
    for (let i = 0; i < 9; i++) {
      const slotEl = this._createSlot(inventory.slots, i, 'inventory');
      if (i === inventory.selectedSlot) {
        slotEl.classList.add('hotbar-selected');
      }
      hotbarGrid.appendChild(slotEl);
    }
    panel.appendChild(hotbarGrid);

    // Recipe Book
    this._renderRecipeBook(panel, inventory);
  }

  _checkCraft3x3() {
    if (!this._inventory?._craftGrid3x3) return null;
    const grid = this._inventory._craftGrid3x3;
    const nameGrid = grid.map(slot => slot ? resolveEntryNameById(slot.id) : null);
    for (const recipe of CRAFTING_RECIPES) {
      if (this._matchRecipe(nameGrid, recipe)) {
        const numericId = resolveResultId(recipe.result.id);
        if (numericId != null) return { ...recipe.result, numericId };
      }
    }
    return null;
  }

  _renderRecipeBook(panel, inventory) {
    const bookLabel = document.createElement('div');
    bookLabel.style.cssText = 'color:#f0c040;font-size:13px;text-align:center;margin:16px 0 8px;cursor:pointer;';
    bookLabel.textContent = '📖 Recipe Book (click to toggle)';
    panel.appendChild(bookLabel);

    const bookContainer = document.createElement('div');
    bookContainer.style.cssText = 'display:none;max-height:300px;overflow-y:auto;background:#1a1a1a;border:1px solid #333;padding:8px;';
    bookLabel.onclick = () => {
      bookContainer.style.display = bookContainer.style.display === 'none' ? 'block' : 'none';
    };
    panel.appendChild(bookContainer);

    // Count available materials
    const counts = new Map();
    for (let i = 0; i < inventory.slots.length; i++) {
      const slot = inventory.slots[i];
      if (slot) {
        const entryName = resolveEntryNameById(slot.id);
        if (entryName) counts.set(entryName, (counts.get(entryName) ?? 0) + slot.count);
      }
    }

    for (const recipe of CRAFTING_RECIPES) {
      const needed = new Map();
      const flat = recipe.pattern.flat();
      for (const name of flat) {
        if (name != null) needed.set(name, (needed.get(name) ?? 0) + 1);
      }

      let canCraft = true;
      for (const [name, count] of needed) {
        // Check all possible group alternatives
        const alternatives = resolveIngredientGroups(name);
        const available = alternatives.reduce((sum, alt) => sum + (counts.get(alt) ?? 0), 0);
        if (available < count) { canCraft = false; break; }
      }

      const resultId = resolveResultId(recipe.result.id);
      const resultIcon = resultId != null ? getItemIcon(resultId) : null;

      const row = document.createElement('div');
      row.style.cssText = `display:flex;align-items:center;gap:8px;padding:4px 6px;border-bottom:1px solid #222;${canCraft ? '' : 'opacity:0.5;'}`;

      if (resultIcon) {
        const img = document.createElement('img');
        img.src = resultIcon;
        img.style.cssText = 'width:24px;height:24px;image-rendering:pixelated;';
        row.appendChild(img);
      }

      const info = document.createElement('div');
      info.style.cssText = 'flex:1;';
      const ingNames = [...needed.entries()].map(([n, c]) => `${c}x ${n}`).join(', ');
      info.innerHTML = `<div style="color:#fff;font-size:12px;">${recipe.result.id} x${recipe.result.count}</div><div style="color:#888;font-size:10px;">${ingNames}</div>`;
      row.appendChild(info);

      if (canCraft) {
        const btn = document.createElement('button');
        btn.textContent = 'Craft';
        btn.style.cssText = 'background:#2a4a2a;border:1px solid #4a4;color:#4f4;padding:2px 8px;cursor:pointer;font-family:inherit;font-size:11px;';
        btn.onclick = (e) => {
          e.stopPropagation();
          this._craftFromRecipe(recipe, inventory);
        };
        row.appendChild(btn);
      }

      bookContainer.appendChild(row);
    }
  }

  _craftFromRecipe(recipe, inventory) {
    const needed = new Map();
    const flat = recipe.pattern.flat();
    for (const name of flat) {
      if (name != null) needed.set(name, (needed.get(name) ?? 0) + 1);
    }

    // Check — resolve each recipe ingredient to an available alternative
    const resolved = new Map(); // ingredient name -> resolved name
    for (const [name, count] of needed) {
      const alternatives = resolveIngredientGroups(name);
      let found = null;
      for (const alt of alternatives) {
        const ingredientId = resolveIngredientId(alt);
        if (ingredientId != null && inventory.hasItem(ingredientId, count)) {
          found = alt;
          break;
        }
      }
      if (!found) return;
      resolved.set(name, found);
    }

    // Consume using resolved names
    for (const [name, count] of needed) {
      const actualName = resolved.get(name);
      const ingredientId = resolveIngredientId(actualName);
      if (ingredientId != null) inventory.consumeItem(ingredientId, count);
    }

    // Add result
    const resultId = resolveResultId(recipe.result.id);
    if (resultId != null) {
      inventory.addItem(resultId, recipe.result.count);
    }

    this._renderCraftingScreen();
  }

  hideCraftingTable() {
    this._hide(this.craftingScreen);
    this.deactivateVirtualCursor();
    this._inventory = null;
  }

  // ─── Furnace ──────────────────────────────────────────

  showFurnace(furnace) {
    this._show(this.furnaceScreen);
    if (this.furnaceInput) {
      this.furnaceInput.innerHTML = furnace?.input ? `<span style="font-size:16px;">${furnace.input.icon || '?'}</span>` : '';
    }
    if (this.furnaceFuel) {
      this.furnaceFuel.innerHTML = furnace?.fuel ? `<span style="font-size:16px;">${furnace.fuel.icon || '?'}</span>` : '';
    }
    if (this.furnaceOutput) {
      this.furnaceOutput.innerHTML = furnace?.output ? `<span style="font-size:16px;">${furnace.output.icon || '?'}</span>` : '';
    }
    if (this.furnaceProgress) {
      const p = furnace?.progress ?? 0;
      this.furnaceProgress.style.width = `${p * 100}%`;
    }
  }

  hideFurnace() { this._hide(this.furnaceScreen); }

  // ─── Shop ─────────────────────────────────────────────

  showShop(shards, upgrades, onBuy) {
    this._show(this.shopScreen);
    this.updateShards(shards);
    if (!this.shopItemsEl || !upgrades) return;

    this.shopItemsEl.innerHTML = '';
    for (const upg of upgrades) {
      const row = document.createElement('div');
      row.className = 'shop-item';
      const info = document.createElement('div');
      const maxed = upg.current >= upg.max;
      const desc = upg.desc || upg.description || '';
      info.innerHTML = `<div style="font-size:14px;">${upg.name}${maxed ? ' (MAX)' : ` (${upg.current || 0}/${upg.max})`}</div><div style="font-size:11px;color:#888;">${desc}</div>`;
      row.appendChild(info);
      const buyBtn = document.createElement('button');
      buyBtn.className = 'shop-buy';
      const canAfford = shards >= upg.cost && !maxed;
      buyBtn.textContent = `✦ ${upg.cost}`;
      buyBtn.disabled = !canAfford;
      if (onBuy) buyBtn.onclick = () => onBuy(upg.id);
      row.appendChild(buyBtn);
      this.shopItemsEl.appendChild(row);
    }
  }

  hideShop() { this._hide(this.shopScreen); }
  showSettings() { this._show(this.settingsScreen); }
  hideSettings() { this._hide(this.settingsScreen); }

  // ─── Drag & Drop ──────────────────────────────────────

  _handleSlotClick(slotType, index) {
    const inventory = this._inventory;
    if (!inventory) return;

    let slotArray;
    if (slotType === 'inventory') slotArray = inventory.slots;
    else if (slotType === 'armor') slotArray = inventory.armor;
    else if (slotType === 'craft2') slotArray = inventory._craftGrid;
    else if (slotType === 'craft3') slotArray = inventory._craftGrid3x3;
    else return;

    const slotItem = slotArray[index];

    if (this._heldItem) {
      if (!slotItem) {
        slotArray[index] = { ...this._heldItem };
        this._heldItem = null;
      } else if (slotItem.id === this._heldItem.id) {
        const maxStack = (getItem(slotItem.id)?.stackSize) ?? 64;
        const space = maxStack - slotItem.count;
        const add = Math.min(space, this._heldItem.count);
        slotItem.count += add;
        this._heldItem.count -= add;
        if (this._heldItem.count <= 0) this._heldItem = null;
      } else {
        const temp = { ...slotItem };
        slotArray[index] = { ...this._heldItem };
        this._heldItem = temp;
      }
    } else if (slotItem) {
      this._heldItem = { ...slotItem };
      slotArray[index] = null;
    }

    this._updateHeldElement();
    this._refreshCurrentScreen();
  }

  _dropHeldItem() {
    if (this._heldItem && this._inventory) {
      this._inventory.addItem(this._heldItem.id, this._heldItem.count);
      this._heldItem = null;
    }
    this._updateHeldElement();
  }

  _updateHeldElement() {
    if (this._heldEl) {
      this._heldEl.remove();
      this._heldEl = null;
    }
    if (!this._heldItem) return;

    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;pointer-events:none;z-index:99998;transform:scale(1.2);';
    const icon = getItemIcon(this._heldItem.id);
    if (icon) {
      const img = document.createElement('img');
      img.src = icon;
      img.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;';
      el.appendChild(img);
    } else {
      const item = getItem(this._heldItem.id);
      el.style.cssText += 'color:#fff;font-size:14px;background:rgba(0,0,0,0.8);padding:2px 6px;border-radius:4px;';
      el.textContent = item?.name || this._heldItem.id;
    }
    if (this._heldItem.count > 1) {
      const cnt = document.createElement('div');
      cnt.style.cssText = 'position:absolute;bottom:0;right:0;color:#fff;font-size:10px;text-shadow:1px 1px 0 #000;';
      cnt.textContent = this._heldItem.count;
      el.appendChild(cnt);
    }
    document.body.appendChild(el);
    this._heldEl = el;
  }

  _refreshCurrentScreen() {
    if (this.inventoryScreen?.style.display !== 'none') this._renderInventoryGrid();
    if (this.craftingScreen?.style.display !== 'none') this._renderCraftingScreen();
  }

  // ─── Slot Helpers ─────────────────────────────────────

  // ─── Tooltip ─────────────────────────────────────────

  _showTooltip(item, event) {
    this._hideTooltip();
    const itemDef = getItem(item.id);
    if (!itemDef) return;

    const el = document.createElement('div');
    el.id = 'item-tooltip';
    el.style.cssText = 'position:fixed;z-index:99999;background:rgba(20,12,28,0.95);border:2px solid #555;padding:8px 12px;pointer-events:none;max-width:220px;font-family:monospace;';

    // Name
    const name = document.createElement('div');
    name.style.cssText = 'color:#fff;font-size:13px;font-weight:bold;margin-bottom:4px;';
    name.textContent = itemDef.name;
    el.appendChild(name);

    // Type line
    if (itemDef.type) {
      const type = document.createElement('div');
      type.style.cssText = 'color:#888;font-size:10px;text-transform:uppercase;margin-bottom:4px;';
      type.textContent = itemDef.type;
      el.appendChild(type);
    }

    // Stats
    const stats = [];
    if (itemDef.damage) stats.push(`⚔ Damage: ${itemDef.damage}`);
    if (itemDef.defense) stats.push(`🛡 Defense: ${itemDef.defense}`);
    if (itemDef.speed) stats.push(`⚡ Speed: ${itemDef.speed}`);
    if (itemDef.durability) stats.push(`♻ Durability: ${itemDef.durability}`);
    if (itemDef.mineLevel > 0) stats.push(`⛏ Mining Level: ${itemDef.mineLevel}`);
    if (itemDef.hunger) stats.push(`🍖 Hunger: +${itemDef.hunger}`);
    if (itemDef.blockChance) stats.push(`🛡 Block: ${Math.round(itemDef.blockChance * 100)}%`);

    for (const stat of stats) {
      const s = document.createElement('div');
      s.style.cssText = 'color:#aaf;font-size:11px;';
      s.textContent = stat;
      el.appendChild(s);
    }

    // Description
    if (itemDef.description) {
      const desc = document.createElement('div');
      desc.style.cssText = 'color:#aaa;font-size:10px;margin-top:4px;line-height:1.4;font-style:italic;';
      desc.textContent = itemDef.description;
      el.appendChild(desc);
    }

    // Stack info
    if (item.count > 1) {
      const cnt = document.createElement('div');
      cnt.style.cssText = 'color:#888;font-size:10px;margin-top:2px;';
      cnt.textContent = `Count: ${item.count}`;
      el.appendChild(cnt);
    }

    document.body.appendChild(el);
    this._tooltipEl = el;

    // Position near cursor
    const x = Math.min(event.clientX + 12, window.innerWidth - 240);
    const y = Math.min(event.clientY + 12, window.innerHeight - 200);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }

  _hideTooltip() {
    if (this._tooltipEl) {
      this._tooltipEl.remove();
      this._tooltipEl = null;
    }
  }

  _createSlot(slots, index, slotType) {
    const el = document.createElement('div');
    el.className = 'inv-slot';
    el.dataset.slot = index;
    el.style.cssText = 'width:40px;height:40px;border:1px solid #555;background:#1a1a1a;position:relative;cursor:pointer;';
    const item = slots[index];
    if (item) {
      el.appendChild(this._createSlotIcon(item));
      // Tooltip on hover
      el.addEventListener('mouseenter', (e) => this._showTooltip(item, e));
      el.addEventListener('mouseleave', () => this._hideTooltip());
    }
    el.onclick = () => this._handleSlotClick(slotType, index);
    return el;
  }

  _createSlotIcon(item) {
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;';

    const icon = getItemIcon(item.id);
    if (icon) {
      const img = document.createElement('img');
      img.src = icon;
      img.style.cssText = 'width:32px;height:32px;image-rendering:pixelated;pointer-events:none;';
      container.appendChild(img);
    } else {
      const itemDef = getItem(item.id);
      const label = document.createElement('span');
      label.style.cssText = 'font-size:8px;color:#aaa;text-align:center;pointer-events:none;max-width:36px;overflow:hidden;';
      label.textContent = itemDef?.name?.substring(0, 6) || item.id;
      container.appendChild(label);
    }

    if (item.count > 1) {
      const cnt = document.createElement('span');
      cnt.style.cssText = 'position:absolute;bottom:1px;right:3px;color:#fff;font-size:10px;text-shadow:1px 1px 0 #000;pointer-events:none;';
      cnt.textContent = item.count;
      container.appendChild(cnt);
    }

    return container;
  }
}
