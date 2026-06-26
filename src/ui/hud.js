/**
 * MineRogue HUD - Hearts, Hunger, Hotbar, Damage Numbers, Status Effects
 *
 * All methods operate on the pre-existing DOM elements from index.html.
 */

export class HUD {
  constructor() {
    this.hud = document.getElementById('hud');
    this.heartsEl = document.getElementById('hearts');
    this.hungerEl = document.getElementById('hunger-bar');
    this.hotbarEl = document.getElementById('hotbar');
    this.damageNumsEl = document.getElementById('damage-numbers');
    this.toastsEl = document.getElementById('toasts');
    this.blockInfoEl = document.getElementById('block-info');
    this.mineProgressEl = document.getElementById('mine-progress');
    this.mineProgressBarEl = document.getElementById('mine-progress-bar');
    this.damageOverlayEl = document.getElementById('damage-overlay');
    this.lowHealthOverlayEl = document.getElementById('low-health-overlay');
    this.statusEffects = new Map();

    // Status effects container (already in HTML or create one)
    this.statusContainer = document.getElementById('status-effects');
    if (!this.statusContainer) {
      this.statusContainer = document.createElement('div');
      this.statusContainer.id = 'status-effects';
      document.body.appendChild(this.statusContainer);
    }
  }

  show() {
    if (this.hud) this.hud.style.display = 'block';
  }

  hide() {
    if (this.hud) this.hud.style.display = 'none';
  }

  // ─── Hearts ───────────────────────────────────────────

  updateHearts(health, maxHealth) {
    if (!this.heartsEl) return;
    const maxHearts = Math.ceil(maxHealth / 2);
    const fullHearts = Math.floor(health / 2);
    const halfHeart = health % 2 !== 0;
    let html = '';
    for (let i = 0; i < maxHearts; i++) {
      if (i < fullHearts) {
        html += '<span style="color:#e22;font-size:16px;text-shadow:0 0 3px #a00;">♥</span>';
      } else if (i === fullHearts && halfHeart) {
        html += '<span style="color:#e22;font-size:16px;opacity:0.5;text-shadow:0 0 3px #a00;">♥</span>';
      } else {
        html += '<span style="color:#444;font-size:16px;">♥</span>';
      }
    }
    this.heartsEl.innerHTML = html;
  }

  // ─── Hunger ───────────────────────────────────────────

  updateHunger(hunger) {
    if (!this.hungerEl) return;
    const maxPieces = 10;
    const full = Math.floor(hunger / 2);
    const half = hunger % 2 !== 0;
    let html = '';
    for (let i = 0; i < maxPieces; i++) {
      if (i < full) {
        html += '<span style="font-size:14px;">🍖</span>';
      } else if (i === full && half) {
        html += '<span style="font-size:14px;opacity:0.5;">🍖</span>';
      } else {
        html += '<span style="font-size:14px;opacity:0.2;">🍖</span>';
      }
    }
    this.hungerEl.innerHTML = html;
  }

  // ─── Hotbar ───────────────────────────────────────────

  updateHotbar(inventory, selectedSlot) {
    if (!this.hotbarEl) return;

    // Accept InventorySystem (with .slots or .getSlot()) or plain array
    const getSlot = (i) => {
      if (inventory?.getSlot) return inventory.getSlot(i);
      const slots = inventory?.slots ?? inventory;
      return slots?.[i] ?? null;
    };

    this.hotbarEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const item = getSlot(i);
      const selected = i === selectedSlot;
      const slotEl = document.createElement('div');
      slotEl.className = `hotbar-slot${selected ? ' selected' : ''}`;

      if (item) {
        const icon = document.createElement('span');
        icon.className = 'slot-name';
        icon.textContent = item.icon || item.name || item.id || '';
        slotEl.appendChild(icon);

        if (item.count > 1) {
          const cnt = document.createElement('span');
          cnt.className = 'slot-count';
          cnt.textContent = item.count;
          slotEl.appendChild(cnt);
        }
      }

      this.hotbarEl.appendChild(slotEl);
    }
  }

  // ─── Damage Numbers ───────────────────────────────────

  showDamageNumber(x, y, amount, type = 'damage') {
    if (!this.damageNumsEl) return;
    const el = document.createElement('div');
    el.className = 'dmg-number';
    if (type === 'crit') el.classList.add('crit');
    if (type === 'damage') el.classList.add('player-dmg');

    el.textContent = type === 'heal' ? `+${Math.round(amount)}` : Math.round(amount);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    this.damageNumsEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  // ─── Block Info ───────────────────────────────────────

  showBlockInfo(name) {
    if (!this.blockInfoEl) return;
    if (name) {
      this.blockInfoEl.textContent = name;
      this.blockInfoEl.style.display = 'block';
    } else {
      this.blockInfoEl.style.display = 'none';
    }
  }

  hideBlockInfo() {
    if (this.blockInfoEl) this.blockInfoEl.style.display = 'none';
  }

  // ─── Mining Progress ──────────────────────────────────

  showMineProgress(progress) {
    if (this.mineProgressEl) this.mineProgressEl.style.display = 'block';
    if (this.mineProgressBarEl) this.mineProgressBarEl.style.width = `${Math.min(100, progress * 100)}%`;
  }

  hideMineProgress() {
    if (this.mineProgressEl) this.mineProgressEl.style.display = 'none';
  }

  // ─── Toasts ───────────────────────────────────────────

  showToast(text) {
    if (!this.toastsEl) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    this.toastsEl.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  // ─── Damage Flash ─────────────────────────────────────

  flashDamage(intensity = 1) {
    if (!this.damageOverlayEl) return;
    this.damageOverlayEl.style.opacity = Math.min(1, 0.4 * intensity).toString();
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.damageOverlayEl.style.opacity = '0';
      }, 150);
    });
  }

  // ─── Low Health Pulse ─────────────────────────────────

  lowHealthPulse(health, maxHealth) {
    if (!this.lowHealthOverlayEl) return;
    if (health / maxHealth < 0.3) {
      this.lowHealthOverlayEl.style.opacity = '1';
      this.lowHealthOverlayEl.style.animation = 'lowHealthPulse 1s infinite';
    } else {
      this.lowHealthOverlayEl.style.opacity = '0';
      this.lowHealthOverlayEl.style.animation = '';
    }
  }

  // ─── Status Effects ───────────────────────────────────

  addStatusEffect(name, duration) {
    if (!this.statusContainer) return;

    // Remove existing timer for same effect
    const existing = this.statusEffects.get(name);
    if (existing) {
      clearTimeout(existing.timeout);
      cancelAnimationFrame(existing.raf);
    }

    let el = existing?.el;
    if (!el) {
      el = document.createElement('div');
      el.style.cssText = 'background:rgba(0,0,0,0.7);color:#fff;padding:4px 10px;border-radius:4px;font-size:12px;white-space:nowrap;';
      this.statusContainer.appendChild(el);
    }

    const end = Date.now() + duration * 1000;

    // Create entry first so update() can reference it
    const entry = { el, timeout: 0, raf: 0 };
    this.statusEffects.set(name, entry);

    const update = () => {
      const remaining = Math.max(0, (end - Date.now()) / 1000);
      el.textContent = `${name} ${Math.ceil(remaining)}s`;
      if (remaining <= 0) {
        el.remove();
        this.statusEffects.delete(name);
        return;
      }
      entry.raf = requestAnimationFrame(update);
    };
    update();

    entry.timeout = setTimeout(() => {
      cancelAnimationFrame(entry.raf);
      el.remove();
      this.statusEffects.delete(name);
    }, duration * 1000);
  }
}
