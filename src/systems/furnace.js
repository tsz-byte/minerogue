// Furnace system - smelting with fuel
import { SMELTING_RECIPES, FUEL_VALUES } from '../../data/recipes.js';
import { getItem, getItemByName } from '../../data/items.js';

export class FurnaceSystem {
  constructor(inventory, audio) {
    this.inventory = inventory;
    this.audio = audio;

    this.input = null;
    this.fuel = null;
    this.output = null;

    this.smeltProgress = 0;
    this.fuelRemaining = 0;
    this.fuelTotal = 0;
    this.active = false;
    this.smeltTime = 10;
  }

  smelt(inputSlot, fuelSlot, outputSlot) {
    this._inputSlotRef = inputSlot;
    this._fuelSlotRef = fuelSlot;
    this._outputSlotRef = outputSlot;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;

    const inputSlot = this._inputSlotRef;
    const fuelSlot = this._fuelSlotRef;
    const outputSlot = this._outputSlotRef;

    if (!inputSlot || !inputSlot()) { this.active = false; this.smeltProgress = 0; return; }

    const inputItem = inputSlot();
    if (!inputItem) { this.active = false; this.smeltProgress = 0; return; }

    const inputData = getItem(inputItem.id);
    if (!inputData) { this.active = false; return; }

    // Find matching smelting recipe
    const recipe = SMELTING_RECIPES.find(r => r.input === inputData.name);
    if (!recipe) { this.active = false; this.smeltProgress = 0; return; }

    // Check output
    const outputData = outputSlot();
    const resultItem = getItemByName(recipe.output);
    if (!resultItem) return;

    if (outputData) {
      if (outputData.id !== resultItem.id || outputData.count >= (resultItem.stackSize ?? 64)) return;
    }

    // Need fuel
    if (this.fuelRemaining <= 0) {
      const fuel = fuelSlot();
      if (!fuel) { this.active = false; this.smeltProgress = 0; return; }

      const fuelItemData = getItem(fuel.id);
      const fuelTime = FUEL_VALUES[fuelItemData?.name] ?? 0;
      if (fuelTime <= 0) { this.active = false; this.smeltProgress = 0; return; }

      this.fuelRemaining = fuelTime;
      this.fuelTotal = fuelTime;
      fuel.count--;
      if (fuel.count <= 0 && this._fuelSlotClear) this._fuelSlotClear();
    }

    this.smeltProgress += dt / this.smeltTime;
    this.fuelRemaining -= dt;

    if (this.smeltProgress >= 1) {
      this.smeltProgress = 0;
      inputItem.count--;
      if (inputItem.count <= 0 && this._inputSlotClear) this._inputSlotClear();

      if (outputData) {
        outputData.count++;
      } else if (this._outputSlotSet) {
        this._outputSlotSet({ id: resultItem.id, count: 1 });
      }
    }
  }

  isActive() { return this.active && this.fuelRemaining > 0; }
  getFuelProgress() { return this.fuelTotal > 0 ? Math.max(0, this.fuelRemaining / this.fuelTotal) : 0; }
  getSmeltProgress() { return this.smeltProgress; }

  serialize() {
    return {
      input: this.input ? { ...this.input } : null,
      fuel: this.fuel ? { ...this.fuel } : null,
      output: this.output ? { ...this.output } : null,
      smeltProgress: this.smeltProgress,
      fuelRemaining: this.fuelRemaining,
      fuelTotal: this.fuelTotal,
      active: this.active,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.input = data.input;
    this.fuel = data.fuel;
    this.output = data.output;
    this.smeltProgress = data.smeltProgress ?? 0;
    this.fuelRemaining = data.fuelRemaining ?? 0;
    this.fuelTotal = data.fuelTotal ?? 0;
    this.active = data.active ?? false;
  }
}
