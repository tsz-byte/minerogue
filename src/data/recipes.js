// MineRogue - Recipe Definitions
// All crafting and smelting recipes

// ============================================================
// CRAFTING RECIPES
// Each recipe: { pattern, result, shapeless? }
// pattern: 2D array (rows x cols), null = empty slot
// result: { id (item name), count }
// ============================================================

export const CRAFTING_RECIPES = [
  // ===== BASIC MATERIALS =====
  // Planks from any log type
  { pattern: [['Oak Log']], result: { id: 'Oak Planks', count: 4 }, shapeless: true },
  { pattern: [['Birch Log']], result: { id: 'Oak Planks', count: 4 }, shapeless: true },
  { pattern: [['Spruce Log']], result: { id: 'Oak Planks', count: 4 }, shapeless: true },
  // Sticks
  { pattern: [['Oak Planks'], ['Oak Planks']], result: { id: 'Stick', count: 4 } },
  // Paper
  { pattern: [['Sugar Cane', 'Sugar Cane', 'Sugar Cane']], result: { id: 'Paper', count: 3 } },
  // Book
  { pattern: [[null, 'Paper', null], ['Paper', 'Leather', 'Paper']], result: { id: 'Book', count: 1 } },
  // Brick
  { pattern: [['Clay', 'Clay'], ['Clay', 'Clay']], result: { id: 'Bricks', count: 1 } },

  // ===== LIGHTING & UTILITY =====
  // Torches
  { pattern: [['Coal'], ['Stick']], result: { id: 'Torch', count: 4 } },
  // Lantern (glowstone surrounded by iron)
  { pattern: [['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], ['Iron Ingot', 'Glowstone Dust', 'Iron Ingot'], ['Iron Ingot', 'Iron Ingot', 'Iron Ingot']], result: { id: 'Lantern', count: 1 } },

  // ===== FURNITURE & STATIONS =====
  // Crafting Table
  { pattern: [['Oak Planks', 'Oak Planks'], ['Oak Planks', 'Oak Planks']], result: { id: 'Crafting Table', count: 1 } },
  // Furnace
  { pattern: [['Cobblestone', 'Cobblestone', 'Cobblestone'], ['Cobblestone', null, 'Cobblestone'], ['Cobblestone', 'Cobblestone', 'Cobblestone']], result: { id: 'Furnace', count: 1 } },
  // Chest
  { pattern: [['Oak Planks', 'Oak Planks', 'Oak Planks'], ['Oak Planks', null, 'Oak Planks'], ['Oak Planks', 'Oak Planks', 'Oak Planks']], result: { id: 'Chest', count: 1 } },
  // Bed
  { pattern: [['White Wool', 'White Wool', 'White Wool'], ['Oak Planks', 'Oak Planks', 'Oak Planks']], result: { id: 'Bed', count: 1 } },
  // Enchanting Table
  { pattern: [[null, 'Book', null], ['Diamond', 'Obsidian', 'Diamond'], ['Obsidian', 'Obsidian', 'Obsidian']], result: { id: 'Enchanting Table', count: 1 } },
  // Anvil
  { pattern: [['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], [null, 'Iron Ingot', null], ['Iron Ingot', 'Iron Ingot', 'Iron Ingot']], result: { id: 'Anvil', count: 1 } },
  // Brewing Stand
  { pattern: [[null, 'Blaze Rod', null], ['Cobblestone', 'Cobblestone', 'Cobblestone']], result: { id: 'Brewing Stand', count: 1 } },
  // Bookshelf
  { pattern: [['Oak Planks', 'Oak Planks', 'Oak Planks'], ['Book', 'Book', 'Book'], ['Oak Planks', 'Oak Planks', 'Oak Planks']], result: { id: 'Bookshelf', count: 1 } },

  // ===== DOORS, FENCES, LADDERS =====
  // Oak Door
  { pattern: [['Oak Planks', 'Oak Planks'], ['Oak Planks', 'Oak Planks'], ['Oak Planks', 'Oak Planks']], result: { id: 'Oak Door', count: 3 } },
  // Oak Fence
  { pattern: [['Oak Planks', 'Stick', 'Oak Planks'], ['Oak Planks', 'Stick', 'Oak Planks']], result: { id: 'Oak Fence', count: 3 } },
  // Ladder
  { pattern: [['Stick', null, 'Stick'], ['Stick', 'Stick', 'Stick'], ['Stick', null, 'Stick']], result: { id: 'Ladder', count: 3 } },

  // ===== COMBAT =====
  // Bow
  { pattern: [[null, 'Stick', 'String'], ['Stick', null, 'String'], [null, 'Stick', 'String']], result: { id: 'Bow', count: 1 } },
  // Arrow
  { pattern: [['Flint'], ['Stick'], ['Feather']], result: { id: 'Arrow', count: 4 } },
  // Shield
  { pattern: [['Oak Planks', 'Iron Ingot', 'Oak Planks'], ['Oak Planks', 'Oak Planks', 'Oak Planks'], [null, 'Oak Planks', null]], result: { id: 'Shield', count: 1 } },

  // ===== TNT =====
  { pattern: [['Gunpowder', 'Sand', 'Gunpowder'], ['Sand', 'Gunpowder', 'Sand'], ['Gunpowder', 'Sand', 'Gunpowder']], result: { id: 'TNT', count: 1 } },

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

  // ===== FOOD CRAFTING =====
  { pattern: [['Brown Mushroom', 'Red Mushroom'], ['Bowl', null]], result: { id: 'Mushroom Stew', count: 1 }, shapeless: true },
  { pattern: [['Wheat', 'Wheat', 'Wheat'], ['Wheat', 'Wheat', 'Wheat'], [null, 'Bucket', null]], result: { id: 'Cake', count: 1 } },
  { pattern: [['Wheat', 'Cocoa Beans', 'Wheat']], result: { id: 'Cookie', count: 8 } },

  // ===== DYES / WOOL =====
  { pattern: [['String', 'String'], ['String', 'String']], result: { id: 'White Wool', count: 1 } },

  // ===== EXTRA ITEMS =====
  // Bowl
  { pattern: [['Oak Planks', null, 'Oak Planks'], [null, 'Oak Planks', null]], result: { id: 'Bowl', count: 4 } },
  // Bucket
  { pattern: [['Iron Ingot', null, 'Iron Ingot'], [null, 'Iron Ingot', null]], result: { id: 'Bucket', count: 1 } },
  // Fishing Rod
  { pattern: [[null, null, 'Stick'], [null, 'Stick', 'String'], ['Stick', null, 'String']], result: { id: 'Fishing Rod', count: 1 } },
  // Flint and Steel
  { pattern: [['Iron Ingot'], ['Flint']], result: { id: 'Flint and Steel', count: 1 }, shapeless: true },
  // Clock
  { pattern: [[null, 'Gold Ingot', null], ['Gold Ingot', 'Redstone', 'Gold Ingot'], [null, 'Gold Ingot', null]], result: { id: 'Clock', count: 1 } },
  // Compass
  { pattern: [[null, 'Iron Ingot', null], ['Iron Ingot', 'Redstone', 'Iron Ingot'], [null, 'Iron Ingot', null]], result: { id: 'Compass', count: 1 } },

  // ===== MISC CRAFTING =====
  // Lead / Leash
  { pattern: [['String', 'String', null], ['String', 'Slime', null], [null, null, 'String']], result: { id: 'Lead', count: 1 } },
  // Name Tag (shapeless)
  { pattern: [['String', 'Paper']], result: { id: 'Name Tag', count: 1 }, shapeless: true },
  // Torch from Charcoal variant
  { pattern: [['Charcoal'], ['Stick']], result: { id: 'Torch', count: 4 } },
  // Barrel
  { pattern: [['Oak Planks', 'Oak Planks', 'Oak Planks'], ['Oak Planks', null, 'Oak Planks'], ['Oak Planks', 'Oak Planks', 'Oak Planks']], result: { id: 'Barrel', count: 1 } },
  // Stone Bricks
  { pattern: [['Stone', 'Stone'], ['Stone', 'Stone']], result: { id: 'Stone Bricks', count: 4 } },
  // Glass Pane
  { pattern: [['Glass', 'Glass', 'Glass'], ['Glass', 'Glass', 'Glass']], result: { id: 'Glass Pane', count: 16 } },
  // Iron Bars
  { pattern: [['Iron Ingot', 'Iron Ingot', 'Iron Ingot'], ['Iron Ingot', 'Iron Ingot', 'Iron Ingot']], result: { id: 'Iron Bars', count: 16 } },
  // Hay Bale
  { pattern: [['Wheat', 'Wheat', 'Wheat'], ['Wheat', 'Wheat', 'Wheat'], ['Wheat', 'Wheat', 'Wheat']], result: { id: 'Hay Bale', count: 1 } },
  // Painting
  { pattern: [['Stick', 'Stick', 'Stick'], ['Stick', 'White Wool', 'Stick'], ['Stick', 'Stick', 'Stick']], result: { id: 'Painting', count: 1 } },
  // Item Frame
  { pattern: [['Stick', 'Stick', 'Stick'], ['Stick', 'Leather', 'Stick'], ['Stick', 'Stick', 'Stick']], result: { id: 'Item Frame', count: 1 } },
];

// ============================================================
// SMELTING RECIPES
// Each: { input, output, time (seconds) }
// ============================================================

export const SMELTING_RECIPES = [
  // Ores -> Ingots
  { input: 'Iron Ore', output: 'Iron Ingot', time: 10 },
  { input: 'Gold Ore', output: 'Gold Ingot', time: 10 },
  { input: 'Sand', output: 'Glass', time: 10 },
  { input: 'Cobblestone', output: 'Stone', time: 10 },
  { input: 'Clay', output: 'Brick', time: 10 },
  { input: 'Oak Log', output: 'Coal', time: 10 },
  { input: 'Raw Beef', output: 'Steak', time: 10 },
  { input: 'Raw Porkchop', output: 'Cooked Porkchop', time: 10 },
  { input: 'Raw Chicken', output: 'Cooked Chicken', time: 10 },
  { input: 'Raw Mutton', output: 'Cooked Mutton', time: 10 },
  { input: 'Raw Fish', output: 'Cooked Fish', time: 10 },
  { input: 'Potato', output: 'Baked Potato', time: 10 },
  { input: 'Wet Sponge', output: 'Sponge', time: 10 },
  { input: 'Netherrack', output: 'Nether Brick', time: 10 },
  { input: 'Ancient Debris', output: 'Netherite Scrap', time: 10 },
];

// ============================================================
// FUEL VALUES (burn time in seconds)
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
// findRecipe: match a 3x3 crafting grid against all recipes
// grid is a flat 9-element array (row-major), null for empty
// Returns matching recipe or null
// ============================================================

// Recipe ingredient groups — synonyms for flexible matching
const INGREDIENT_GROUPS = {
  'Wood': ['Oak Log', 'Birch Log', 'Spruce Log'],
  'Oak Planks': ['Oak Planks', 'Birch Planks', 'Spruce Planks'],
};

function resolveIngredientGroups(patternItem) {
  return INGREDIENT_GROUPS[patternItem] || [patternItem];
}

export function findRecipe(grid) {
  if (!grid) return null;
  // Pad 2x2 grid (4 elements) to 3x3 grid (9 elements)
  let g = grid;
  if (grid.length === 4) {
    g = [
      grid[0], grid[1], null,
      grid[2], grid[3], null,
      null, null, null,
    ];
  }
  if (g.length !== 9) return null;

  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.shapeless) {
      // Shapeless: just compare multisets of non-null ingredients
      const gridItems = g.filter(x => x != null).sort();
      const recipeItems = recipe.pattern.flat().filter(x => x != null).sort();
      if (gridItems.length !== recipeItems.length) continue;
      const used = new Array(gridItems.length).fill(false);
      let allMatch = true;
      for (const gi of gridItems) {
        let found = false;
        for (let i = 0; i < recipeItems.length; i++) {
          if (!used[i] && resolveIngredientGroups(recipeItems[i]).includes(gi)) {
            used[i] = true;
            found = true;
            break;
          }
        }
        if (!found) { allMatch = false; break; }
      }
      if (allMatch) return recipe;
    } else {
      // Shaped: try to fit pattern in the 3x3 grid
      const patternRows = recipe.pattern.length;
      const patternCols = Math.max(...recipe.pattern.map(r => r.length));

      // Try all possible offsets
      for (let rowOff = 0; rowOff <= 3 - patternRows; rowOff++) {
        for (let colOff = 0; colOff <= 3 - patternCols; colOff++) {
          let match = true;
          for (let r = 0; r < 3 && match; r++) {
            for (let c = 0; c < 3 && match; c++) {
              const gridItem = g[r * 3 + c];
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
          if (match) return recipe;
        }
      }
    }
  }

  return null;
}
