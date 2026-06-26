/**
 * MineRogue Menu Manager
 * 
 * Operates on the pre-existing DOM elements from index.html.
 * main.js wires up button click handlers separately; this module
 * toggles visibility and populates data in the DOM.
 */

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
  }

  // ─── Utility ──────────────────────────────────────────

  isVisible() {
    return this._screens.some(el => {
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
    // Wire callbacks if provided (main.js may also wire them via addEventListener)
    const playBtn = document.getElementById('btn-play');
    const homeBtn = document.getElementById('btn-home');
    const shopBtn = document.getElementById('btn-shop');
    if (onPlay && playBtn) playBtn.onclick = onPlay;
    if (onHome && homeBtn) homeBtn.onclick = onHome;
    if (onShop && shopBtn) shopBtn.onclick = onShop;

    // Update shard display
    if (this.saveSystem) {
      const meta = this.saveSystem.loadMeta?.();
      if (meta) this.updateShards(meta.soulShards ?? 0);
    }
  }

  hideMainMenu() { this._hide(this.mainMenu); }

  // ─── Death Screen ─────────────────────────────────────

  showDeathScreen(stats, shards, onNewRun, onMenu) {
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

    // Animate shard counter
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

    // Optional callbacks (main.js may also wire buttons separately)
    if (onNewRun) document.getElementById('btn-respawn').onclick = onNewRun;
    if (onMenu) document.getElementById('btn-death-menu').onclick = onMenu;
  }

  hideDeathScreen() { this._hide(this.deathScreen); }

  // ─── Pause ────────────────────────────────────────────

  showPause(stats, onResume, onQuit) {
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

    if (onResume) document.getElementById('btn-resume').onclick = onResume;
    if (onQuit) document.getElementById('btn-quit').onclick = onQuit;
  }

  hidePause() { this._hide(this.pauseScreen); }

  // ─── Inventory ────────────────────────────────────────

  showInventory(inventory, onSlotClickOrCrafting) {
    this._show(this.inventoryScreen);

    // inventory can be an InventorySystem (with .slots or array-like) or a plain array
    const slots = inventory?.slots ?? inventory;
    if (!slots) return;

    // Main grid (36 slots, 4 rows of 9)
    if (this.invGrid) {
      this.invGrid.innerHTML = '';
      for (let i = 0; i < 36; i++) {
        this.invGrid.appendChild(this._slot(slots, i));
      }
    }

    // Armor slots (indices 36-39)
    if (this.armorSlots) {
      const armorSlotEls = this.armorSlots.querySelectorAll('.armor-slot');
      armorSlotEls.forEach((el, i) => {
        el.innerHTML = '';
        const item = slots[36 + i];
        if (item) el.innerHTML = `<span style="font-size:16px;">${item.icon || ''}</span>`;
      });
    }

    // 2x2 crafting grid (indices 40-43)
    if (this.craftGrid) {
      this.craftGrid.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        this.craftGrid.appendChild(this._slot(slots, 40 + i));
      }
    }

    // Crafting result (index 44)
    if (this.craftResult) {
      this.craftResult.innerHTML = '';
      if (slots[44]) {
        this.craftResult.appendChild(this._slot(slots, 44));
      }
    }
  }

  hideInventory() { this._hide(this.inventoryScreen); }

  // ─── Crafting Table ───────────────────────────────────

  showCraftingTable(inventory, onSlotClickOrCrafting) {
    this._show(this.craftingScreen);

    const slots = inventory?.slots ?? inventory;
    if (!slots) return;

    // 3x3 grid
    if (this.craftGrid3x3) {
      this.craftGrid3x3.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        this.craftGrid3x3.appendChild(this._slot(slots, i));
      }
    }

    // Result
    if (this.craftResult3x3) {
      this.craftResult3x3.innerHTML = '';
      if (slots[9]) {
        this.craftResult3x3.appendChild(this._slot(slots, 9));
      }
    }
  }

  hideCraftingTable() { this._hide(this.craftingScreen); }

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
      if (onBuy) {
        buyBtn.onclick = () => onBuy(upg.id);
      }
      row.appendChild(buyBtn);

      this.shopItemsEl.appendChild(row);
    }
  }

  hideShop() { this._hide(this.shopScreen); }
  // ─── Settings ─────────────────────────────────────────

  showSettings() { this._show(this.settingsScreen); }

  hideSettings() { this._hide(this.settingsScreen); }


  // ─── Slot Helper ──────────────────────────────────────

  _slot(slots, index) {
    const el = document.createElement('div');
    el.className = 'inv-slot';
    el.dataset.slot = index;
    const item = slots[index];
    if (item) {
      const icon = document.createElement('span');
      icon.className = 'slot-icon';
      icon.textContent = item.icon || '';
      icon.style.cssText = 'font-size:18px;';
      el.appendChild(icon);

      if (item.count > 1) {
        const cnt = document.createElement('span');
        cnt.className = 'slot-count';
        cnt.textContent = item.count;
        el.appendChild(cnt);
      }
    }
    return el;
  }
}
