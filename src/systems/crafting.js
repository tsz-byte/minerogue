// Crafting system - supports 2x2 inventory grid and 3x3 crafting table grid
import { CRAFTING_RECIPES, findRecipe } from '../../data/recipes.js';
import { getItem, getItemByName } from '../../data/items.js';
import { getBlock, BLOCK_MAP } from '../../data/blocks.js';

function getBlockByName(name) {
  for (const b of Object.values(BLOCK_MAP)) {
    if (b.name === name) return b;
  }
  return null;
}

function resolveEntryNameById(id) {
  return getItem(id)?.name ?? getBlock(id)?.name ?? null;
}

function resolveIngredientIdByName(name) {
  return getItemByName(name)?.id ?? getBlockByName(name)?.id ?? null;
}

export class CraftingSystem {
  constructor(inventory) {
    this.inventory = inventory;
  }

  /**
   * Check what a crafting grid produces.
   * Grid is a flat array of {id, count} or null.
   * Recipes use name-based matching, so we convert IDs to names.
   * @returns {{id: number, count: number} | null}
   */
  checkRecipe(grid, gridCols = 2) {
    // Convert grid from {id, count} to name strings for recipe matching
    const nameGrid = grid.map(slot => slot ? resolveEntryNameById(slot.id) : null);

    const recipe = findRecipe(nameGrid);
    if (!recipe) return null;

    // Convert result name back to ID
    const resultItem = getItemByName(recipe.result.id);
    const resultBlock = getBlockByName(recipe.result.id);

    if (resultItem) {
      return { id: resultItem.id, count: recipe.result.count };
    }
    if (resultBlock) {
      return { id: resultBlock.id, count: recipe.result.count };
    }

    return null;
  }

  /**
   * Attempt to craft from the given grid.
   */
  craft(grid, gridCols = 2) {
    const result = this.checkRecipe(grid, gridCols);
    if (!result) return false;

    const remaining = this.inventory.addItem(result.id, result.count);
    if (remaining > 0) return false;

    for (let i = 0; i < grid.length; i++) {
      if (grid[i]) {
        grid[i].count--;
        if (grid[i].count <= 0) grid[i] = null;
      }
    }
    return true;
  }

  /**
   * Get list of available recipes the player can craft.
   */
  getAvailableRecipes() {
    const available = [];
    const counts = new Map();
    for (let i = 0; i < this.inventory.slots.length; i++) {
      const slot = this.inventory.slots[i];
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
        if ((counts.get(name) ?? 0) < count) { canCraft = false; break; }
      }

      if (canCraft) {
        const resultItem = getItemByName(recipe.result.id);
        const resultBlock = getBlockByName(recipe.result.id);
        const resultId = resultItem?.id ?? resultBlock?.id;
        if (resultId != null) {
          available.push({
            result: { id: resultId, count: recipe.result.count },
            ingredients: [...needed.entries()].map(([name, count]) => {
              const id = resolveIngredientIdByName(name);
              return { id, name, count };
            }).filter(x => x.id != null),
          });
        }
      }
    }

    return available;
  }
}
