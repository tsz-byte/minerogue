// Inventory system - 36 main slots + 4 armor slots (expandable)
import { ITEM_MAP, getItem } from '../data/items.js';

export class InventorySystem {
  constructor(owner) {
    this.owner = owner;
    this.slots = new Array(36).fill(null);
    this.armor = [null, null, null, null];
    this.selectedSlot = 0;
  }

  expandSlots(count) {
    for (let i = 0; i < count; i++) this.slots.push(null);
  }

  getSlot(index) {
    if (index < 0 || index >= this.slots.length) return this.armor[index - 100] ?? null;
    return this.slots[index];
  }

  setSlot(index, item) {
    if (index < 0 || index >= this.slots.length) { this.armor[index - 100] = item; return; }
    this.slots[index] = item;
  }

  swapSlots(a, b) {
    const tmp = this.getSlot(a);
    this.setSlot(a, this.getSlot(b));
    this.setSlot(b, tmp);
  }

  addItem(itemId, count = 1) {
    if (itemId == null || count <= 0) return count;
    const data = getItem(itemId);
    const maxStack = data?.stackSize ?? 64;

    for (let i = 0; i < this.slots.length && count > 0; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId && slot.count < maxStack) {
        const add = Math.min(count, maxStack - slot.count);
        slot.count += add;
        count -= add;
      }
    }
    for (let i = 0; i < this.slots.length && count > 0; i++) {
      if (!this.slots[i]) {
        const add = Math.min(count, maxStack);
        this.slots[i] = { id: itemId, count: add };
        count -= add;
      }
    }
    return count;
  }

  removeItem(slot, count = 1) {
    const item = this.getSlot(slot);
    if (!item) return;
    item.count -= count;
    if (item.count <= 0) this.setSlot(slot, null);
  }

  hasItem(itemId, count = 1) {
    let total = 0;
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId) { total += slot.count; if (total >= count) return true; }
    }
    return false;
  }

  consumeItem(itemId, count = 1) {
    if (!this.hasItem(itemId, count)) return false;
    let remaining = count;
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId) {
        const take = Math.min(remaining, slot.count);
        slot.count -= take;
        remaining -= take;
        if (slot.count <= 0) this.slots[i] = null;
      }
    }
    return true;
  }

  getHotbar() { return this.slots.slice(0, 9); }
  getSelectedItem() { return this.slots[this.selectedSlot]; }

  getArmorSlots() {
    return { helmet: this.armor[0], chestplate: this.armor[1], leggings: this.armor[2], boots: this.armor[3] };
  }

  getTotalDefense() {
    let total = 0;
    for (const slot of this.armor) {
      if (slot) { const data = getItem(slot.id); if (data?.defense) total += data.defense; }
    }
    return total;
  }

  equipArmor(inventorySlot) {
    const item = this.getSlot(inventorySlot);
    if (!item) return false;
    const data = getItem(item.id);
    if (!data || !data.type) return false;
    const armorIndex = { helmet: 0, chestplate: 1, leggings: 2, boots: 3 }[data.type];
    if (armorIndex === undefined) return false;
    const old = this.armor[armorIndex];
    this.armor[armorIndex] = { id: item.id, count: 1 };
    this.setSlot(inventorySlot, old);
    return true;
  }

  getHeldToolData() {
    const item = this.getSelectedItem();
    if (!item) return null;
    return getItem(item.id) ?? null;
  }

  serialize() {
    return {
      slots: this.slots.map(s => s ? { ...s } : null),
      armor: this.armor.map(s => s ? { ...s } : null),
      selectedSlot: this.selectedSlot,
    };
  }

  deserialize(data) {
    if (!data) return;
    if (data.slots) {
      for (let i = 0; i < Math.min(data.slots.length, this.slots.length); i++) {
        this.slots[i] = data.slots[i] ? { ...data.slots[i] } : null;
      }
    }
    if (data.armor) {
      for (let i = 0; i < 4; i++) this.armor[i] = data.armor[i] ? { ...data.armor[i] } : null;
    }
    if (data.selectedSlot != null) this.selectedSlot = data.selectedSlot;
  }
}
