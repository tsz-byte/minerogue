// MineRogue - Block Definitions
// All 68 block types with gameplay properties

export const BLOCKS = [
  { id: 0, name: 'Air', hardness: 0, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 1, name: 'Grass', hardness: 0.6, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: 'Dirt', flammable: false, interactable: false },
  { id: 2, name: 'Dirt', hardness: 0.5, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 3, name: 'Stone', hardness: 1.5, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: 'Cobblestone', flammable: false, interactable: false },
  { id: 4, name: 'Sand', hardness: 0.5, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 5, name: 'Gravel', hardness: 0.6, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: { item: 'Flint', chance: 0.1, count: 1 }, flammable: false, interactable: false },
  { id: 6, name: 'Cobblestone', hardness: 2.0, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 7, name: 'Oak Planks', hardness: 2.0, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 8, name: 'Oak Log', hardness: 2.0, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 9, name: 'Oak Leaves', hardness: 0.2, tool: 'none', level: 0, light: 0, transparent: true, solid: true, drop: { item: 'Stick', chance: 0.05, count: 2 }, flammable: true, interactable: false },
  { id: 10, name: 'Birch Log', hardness: 2.0, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 11, name: 'Birch Leaves', hardness: 0.2, tool: 'none', level: 0, light: 0, transparent: true, solid: true, drop: { item: 'Stick', chance: 0.05, count: 2 }, flammable: true, interactable: false },
  { id: 12, name: 'Spruce Log', hardness: 2.0, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 13, name: 'Spruce Leaves', hardness: 0.2, tool: 'none', level: 0, light: 0, transparent: true, solid: true, drop: { item: 'Stick', chance: 0.05, count: 2 }, flammable: true, interactable: false },
  { id: 14, name: 'Coal Ore', hardness: 3.0, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: 'Coal', flammable: false, interactable: false },
  { id: 15, name: 'Iron Ore', hardness: 3.0, tool: 'pickaxe', level: 1, light: 0, transparent: false, solid: true, drop: 'Iron Ore', flammable: false, interactable: false },
  { id: 16, name: 'Gold Ore', hardness: 3.0, tool: 'pickaxe', level: 2, light: 0, transparent: false, solid: true, drop: 'Gold Ore', flammable: false, interactable: false },
  { id: 17, name: 'Diamond Ore', hardness: 3.0, tool: 'pickaxe', level: 2, light: 0, transparent: false, solid: true, drop: 'Diamond', flammable: false, interactable: false },
  { id: 18, name: 'Redstone Ore', hardness: 3.0, tool: 'pickaxe', level: 2, light: 0, transparent: false, solid: true, drop: { item: 'Redstone', chance: 1, count: 4 }, flammable: false, interactable: false },
  { id: 19, name: 'Crystal Ore', hardness: 4.0, tool: 'pickaxe', level: 3, light: 0, transparent: false, solid: true, drop: 'Crystal', flammable: false, interactable: false },
  { id: 20, name: 'Water', hardness: 100, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 21, name: 'Lava', hardness: 100, tool: 'none', level: 0, light: 15, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 22, name: 'Bedrock', hardness: -1, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 23, name: 'Glass', hardness: 0.3, tool: 'none', level: 0, light: 0, transparent: true, solid: true, drop: null, flammable: false, interactable: false },
  { id: 24, name: 'Bricks', hardness: 2.0, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 25, name: 'Snow Block', hardness: 0.2, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 26, name: 'Ice', hardness: 0.5, tool: 'pickaxe', level: 0, light: 0, transparent: true, solid: true, drop: null, flammable: false, interactable: false },
  { id: 27, name: 'Obsidian', hardness: 50.0, tool: 'pickaxe', level: 3, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 28, name: 'Glowstone', hardness: 0.3, tool: 'none', level: 0, light: 15, transparent: true, solid: true, drop: { item: 'Glowstone Dust', chance: 1, count: 4 }, flammable: false, interactable: false },
  { id: 29, name: 'Crafting Table', hardness: 2.5, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: true },
  { id: 30, name: 'Furnace', hardness: 3.5, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: true },
  { id: 31, name: 'Chest', hardness: 2.5, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: true },
  { id: 32, name: 'Torch', hardness: 0, tool: 'none', level: 0, light: 14, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 33, name: 'Bookshelf', hardness: 1.5, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 34, name: 'Sandstone', hardness: 0.8, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 35, name: 'Clay', hardness: 0.6, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: 'Clay', flammable: false, interactable: false },
  { id: 36, name: 'White Wool', hardness: 0.8, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 37, name: 'Orange Wool', hardness: 0.8, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 38, name: 'Magenta Wool', hardness: 0.8, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 39, name: 'Light Blue Wool', hardness: 0.8, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 40, name: 'Yellow Wool', hardness: 0.8, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 41, name: 'Pink Wool', hardness: 0.8, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 42, name: 'Cactus', hardness: 0.4, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 43, name: 'Pumpkin', hardness: 1.0, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 44, name: 'Carved Pumpkin', hardness: 1.0, tool: 'axe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 45, name: 'Brown Mushroom', hardness: 0, tool: 'none', level: 0, light: 1, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 46, name: 'Red Mushroom', hardness: 0, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 47, name: 'Mycelium', hardness: 0.6, tool: 'shovel', level: 0, light: 0, transparent: false, solid: true, drop: 'Dirt', flammable: false, interactable: false },
  { id: 48, name: 'Netherrack', hardness: 0.4, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 49, name: 'TNT', hardness: 0, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: true },
  { id: 50, name: 'Hay Bale', hardness: 0.5, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: false },
  { id: 51, name: 'Anvil', hardness: 5.0, tool: 'pickaxe', level: 1, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: true },
  { id: 52, name: 'Enchanting Table', hardness: 5.0, tool: 'pickaxe', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: true },
  { id: 53, name: 'Oak Door', hardness: 3.0, tool: 'axe', level: 0, light: 0, transparent: true, solid: true, drop: null, flammable: true, interactable: true },
  { id: 54, name: 'Ladder', hardness: 0.4, tool: 'axe', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: true, interactable: false },
  { id: 55, name: 'Oak Fence', hardness: 2.0, tool: 'axe', level: 0, light: 0, transparent: true, solid: true, drop: null, flammable: true, interactable: false },
  { id: 56, name: 'Tall Grass', hardness: 0, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: { item: 'Stick', chance: 0.1, count: 1 }, flammable: true, interactable: false },
  { id: 57, name: 'Dandelion', hardness: 0, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 58, name: 'Poppy', hardness: 0, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: false, interactable: false },
  { id: 59, name: 'Shrine Block', hardness: -1, tool: 'none', level: 0, light: 10, transparent: false, solid: true, drop: null, flammable: false, interactable: true },
  { id: 60, name: 'Mob Spawner', hardness: 5.0, tool: 'pickaxe', level: 0, light: 0, transparent: true, solid: true, drop: null, flammable: false, interactable: false },
  { id: 61, name: 'Portal Frame', hardness: -1, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: true },
  { id: 62, name: 'Bed', hardness: 0.2, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: true, interactable: true },
  { id: 63, name: 'Brewing Stand', hardness: 0.5, tool: 'pickaxe', level: 0, light: 1, transparent: true, solid: true, drop: null, flammable: false, interactable: true },
  { id: 64, name: 'Carpet', hardness: 0.1, tool: 'none', level: 0, light: 0, transparent: true, solid: false, drop: null, flammable: true, interactable: false },
  { id: 65, name: 'Iron Bars', hardness: 5.0, tool: 'pickaxe', level: 0, light: 0, transparent: true, solid: true, drop: null, flammable: false, interactable: false },
  { id: 66, name: 'Crystal Block', hardness: 5.0, tool: 'pickaxe', level: 2, light: 7, transparent: true, solid: true, drop: null, flammable: false, interactable: false },
  { id: 67, name: 'Void Stone', hardness: -1, tool: 'none', level: 0, light: 0, transparent: false, solid: true, drop: null, flammable: false, interactable: false },
  { id: 68, name: 'Lantern', hardness: 0.5, tool: 'pickaxe', level: 0, light: 15, transparent: true, solid: false, drop: null, flammable: false, interactable: false }
];

export const BLOCK_MAP = Object.fromEntries(BLOCKS.map(b => [b.id, b]));

export function getBlock(id) {
  return BLOCK_MAP[id] || BLOCK_MAP[0];
}

export function getBlockByName(name) {
  return BLOCKS.find(b => b.name === name) || null;
}
