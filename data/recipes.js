// MineRogue - Recipe Definitions
// All crafting and smelting recipes

// ============================================================
// CRAFTING RECIPES
// ============================================================

export const CRAFTING_RECIPES = [
  // ===== BASIC MATERIALS =====
  { pattern: [['Oak Log']], result: { id: 'Oak Planks', count: 4 }, shapeless: true },
  { pattern: [['Oak Planks'], ['Oak Planks']], result: { id: 'Stick', count: 4 } },
  { pattern: [['Oak Planks', 'Oak Planks'], ['Oak Planks', 'Oak Planks']], result: { id: 'Crafting Table', count: 1 } },
  { pattern: [['Cobblestone', 'Cobblestone', 'Cobblestone'], ['Cobblestone', null, 'Cobblestone'], ['Cobblestone', 'Cobblestone', 'Cobblestone']], result: { id: 'Furnace', count: 1 } },
  { pattern: [['Oak Planks', 'Oak Planks', 'Oak Planks'], ['Oak Planks', null, 'Oak Planks'], ['Oak Planks', 'Oak Planks', 'Oak Planks']], result: { id: 'Chest', count: 1 } },

  // ===== LIGHTING =====
  { pattern: [['Coal'], ['Stick']], result: { id: 'Torch', count: 4 } },
  { pattern: [['String', 'String'], ['String', 'String']], result: { id: 'White Wool', count: 1 } },

  // ===== WOOD TOOLS =====
  { pattern: [['Oak Planks', 'Oak Planks', 'Oak Planks'], [null, 'Stick', null], [null, 'Stick', null]], result: { id: 'Wood Pickaxe', count: 1 } },
  { pattern: [['Oak Planks', 'Oak Planks'], ['Oak Planks', 'Stick'], [null, 'Stick']], result: { id: 'Wood Axe', count: 1 } },
  { pattern: [['Oak Planks'], ['Stick'], ['Stick']], result: { id: 'Wood Shovel', count: 1 } },
  { pattern: [['Oak Planks'], ['Oak Planks'], ['Stick']], result: { id: 'Wood Sword', count: 1 } },

  // ===== STONE TOOLS =====
  { pattern: [['Cobblestone', 'Cobblestone', 'Cobblestone'], [null, 'Stick', null], [null, 'Stick', null]], result: { id: 'Stone Pickaxe', count: 1 } },
  { pattern: [['Cobblestone', 'Cobblestone'], ['Cobblestone', 'Stick'], [null, 'Stick']], result: { id: 'Stone Axe', count: 1 } },
  { pattern: [['Cobblestone'], ['Stick'], ['Stick']], result: { id: 'Stone Shovel', count: 1 } },
  { pattern: [['Cobblestone'], ['Cobblestone'], ['Stick']], result: { id: 'Stone Sword', count: 1 } },

  // ===== IRON TOOLS =====
  { pattern: [['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], [null, 'Stick', null], [null, 'Stick', null]], result: { id: 'Iron Pickaxe', count: 1 } },
  { pattern: [['Iron Ingot', 'Iron Ingot'], ['Iron Ingot', 'Stick'], [null, 'Stick']], result: { id: 'Iron Axe', count: 1 } },
  { pattern: [['Iron Ingot'], ['Stick'], ['Stick']], result: { id: 'Iron Shovel', count: 1 } },
  { pattern: [['Iron Ingot'], ['Iron Ingot'], ['Stick']], result: { id: 'Iron Sword', count: 1 } },

  // ===== GOLD TOOLS =====
  { pattern: [['Gold Ingot', 'Gold Ingot', 'Gold Ingot'], [null, 'Stick', null], [null, 'Stick', null]], result: { id: 'Gold Pickaxe', count: 1 } },
  { pattern: [['Gold Ingot', 'Gold Ingot'], ['Gold Ingot', 'Stick'], [null, 'Stick']], result: { id: 'Gold Axe', count: 1 } },
  { pattern: [['Gold Ingot'], ['Stick'], ['Stick']], result: { id: 'Gold Shovel', count: 1 } },
  { pattern: [['Gold Ingot'], ['Gold Ingot'], ['Stick']], result: { id: 'Gold Sword', count: 1 } },

  // ===== DIAMOND TOOLS =====
  { pattern: [['Diamond', 'Diamond', 'Diamond'], [null, 'Stick', null], [null, 'Stick', null]], result: { id: 'Diamond Pickaxe', count: 1 } },
  { pattern: [['Diamond', 'Diamond'], ['Diamond', 'Stick'], [null, 'Stick']], result: { id: 'Diamond Axe', count: 1 } },
  { pattern: [['Diamond'], ['Stick'], ['Stick']], result: { id: 'Diamond Shovel', count: 1 } },
  { pattern: [['Diamond'], ['Diamond'], ['Stick']], result: { id: 'Diamond Sword', count: 1 } },

  // ===== LEATHER ARMOR =====
  { pattern: [['Leather', 'Leather', 'Leather'], ['Leather', null, 'Leather']], result: { id: 'Leather Helmet', count: 1 } },
  { pattern: [['Leather', null, 'Leather'], ['Leather', 'Leather', 'Leather'], ['Leather', 'Leather', 'Leather']], result: { id: 'Leather Chestplate', count: 1 } },
  { pattern: [['Leather', 'Leather', 'Leather'], ['Leather', null, 'Leather'], ['Leather', null, 'Leather']], result: { id: 'Leather Leggings', count: 1 } },
  { pattern: [['Leather', null, 'Leather'], ['Leather', null, 'Leather']], result: { id: 'Leather Boots', count: 1 } },

  // ===== IRON ARMOR =====
  { pattern: [['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], ['Iron Ingot', null, 'Iron Ingot']], result: { id: 'Iron Helmet', count: 1 } },
  { pattern: [['Iron Ingot', null, 'Iron Ingot'], ['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], ['Iron Ingot', 'Iron Ingot', 'Iron Ingot']], result: { id: 'Iron Chestplate', count: 1 } },
  { pattern: [['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], ['Iron Ingot', null, 'Iron Ingot'], ['Iron Ingot', null, 'Iron Ingot']], result: { id: 'Iron Leggings', count: 1 } },
  { pattern: [['Iron Ingot', null, 'Iron Ingot'], ['Iron Ingot', null, 'Iron Ingot']], result: { id: 'Iron Boots', count: 1 } },

  // ===== GOLD ARMOR =====
  { pattern: [['Gold Ingot', 'Gold Ingot', 'Gold Ingot'], ['Gold Ingot', null, 'Gold Ingot']], result: { id: 'Gold Helmet', count: 1 } },
  { pattern: [['Gold Ingot', null, 'Gold Ingot'], ['Gold Ingot', 'Gold Ingot', 'Gold Ingot'], ['Gold Ingot', 'Gold Ingot', 'Gold Ingot']], result: { id: 'Gold Chestplate', count: 1 } },
  { pattern: [['Gold Ingot', 'Gold Ingot', 'Gold Ingot'], ['Gold Ingot', null, 'Gold Ingot'], ['Gold Ingot', null, 'Gold Ingot']], result: { id: 'Gold Leggings', count: 1 } },
  { pattern: [['Gold Ingot', null, 'Gold Ingot'], ['Gold Ingot', null, 'Gold Ingot']], result: { id: 'Gold Boots', count: 1 } },

  // ===== DIAMOND ARMOR =====
  { pattern: [['Diamond', 'Diamond', 'Diamond'], ['Diamond', null, 'Diamond']], result: { id: 'Diamond Helmet', count: 1 } },
  { pattern: [['Diamond', null, 'Diamond'], ['Diamond', 'Diamond', 'Diamond'], ['Diamond', 'Diamond', 'Diamond']], result: { id: 'Diamond Chestplate', count: 1 } },
  { pattern: [['Diamond', 'Diamond', 'Diamond'], ['Diamond', null, 'Diamond'], ['Diamond', null, 'Diamond']], result: { id: 'Diamond Leggings', count: 1 } },
  { pattern: [['Diamond', null, 'Diamond'], ['Diamond', null, 'Diamond']], result: { id: 'Diamond Boots', count: 1 } },

  // ===== COMBAT =====
  { pattern: [[null, 'Stick', 'String'], ['Stick', null, 'String'], [null, 'Stick', 'String']], result: { id: 'Bow', count: 1 } },
  { pattern: [['Flint'], ['Stick'], ['Feather']], result: { id: 'Arrow', count: 4 } },
  { pattern: [['Oak Planks', 'Iron Ingot', 'Oak Planks'], ['Oak Planks', 'Oak Planks', 'Oak Planks'], [null, 'Oak Planks', null]], result: { id: 'Shield', count: 1 } },
];

// ============================================================
// SMELTING RECIPES
// ============================================================

export const SMELTING_RECIPES = [
  { input: 'Iron Ore', output: 'Iron Ingot', time: 10 },
  { input: 'Gold Ore', output: 'Gold Ingot', time: 10 },
  { input: 'Sand', output: 'Glass', time: 10 },
  { input: 'Cobblestone', output: 'Stone', time: 10 },
  { input: 'Clay', output: 'Brick', time: 10 },
  { input: 'Oak Log', output: 'Coal', time: 10 },
  { input: 'Raw Beef', output: 'Steak', time: 10 },
  { input: 'Raw Porkchop', output: 'Cooked Porkchop', time: 10 },
  { input: 'Raw Chicken', output: 'Cooked Chicken', time: 10 },
];

// ============================================================
// FUEL VALUES
// ============================================================

export const FUEL_VALUES = {
  'Coal': 8,
  'Charcoal': 8,
  'Oak Planks': 1.5,
  'Stick': 0.5,
  'Lava Bucket': 100,
  'Blaze Rod': 12,
};

// ============================================================
// findRecipe: match a crafting grid against all recipes
// grid is a flat array (4 or 9 elements, row-major), null for empty
// Returns matching recipe or null
// ============================================================

export function findRecipe(grid) {
  const gridSize = grid.length;
  const cols = gridSize === 9 ? 3 : 2;

  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.shapeless) {
      const gridItems = grid.filter(x => x != null).sort();
      const recipeItems = recipe.pattern.flat().filter(x => x != null).sort();
      if (gridItems.length === recipeItems.length &&
          gridItems.every((v, i) => v === recipeItems[i])) {
        return recipe;
      }
    } else {
      const patternRows = recipe.pattern.length;
      const patternCols = Math.max(...recipe.pattern.map(r => r.length));

      for (let rowOff = 0; rowOff <= cols - patternRows; rowOff++) {
        for (let colOff = 0; colOff <= cols - patternCols; colOff++) {
          let match = true;
          for (let r = 0; r < cols && match; r++) {
            for (let c = 0; c < cols && match; c++) {
              const gridItem = grid[r * cols + c];
              let patternItem = null;
              if (r >= rowOff && r < rowOff + patternRows &&
                  c >= colOff && c < colOff + patternCols) {
                const pr = r - rowOff;
                const pc = c - colOff;
                if (recipe.pattern[pr] && pc < recipe.pattern[pr].length) {
                  patternItem = recipe.pattern[pr][pc];
                }
              }
              if (patternItem !== gridItem) {
                match = false;
              }
            }
          }
          if (match) return recipe;
        }
      }
    }
  }
  return null;
}
