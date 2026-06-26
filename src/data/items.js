// MineRogue - Item Definitions
// All 120+ items: tools, armor, food, materials, potions, legendaries

export const ITEMS = [
  // ===== TOOLS (IDs 100-126) =====
  // Wood tier
  { id: 100, name: 'Wood Sword', type: 'sword', material: 'wood', damage: 5, speed: 1.6, durability: 59, mineLevel: 0, stackSize: 1 },
  { id: 101, name: 'Wood Pickaxe', type: 'pickaxe', material: 'wood', damage: 3, speed: 2.0, durability: 59, mineLevel: 0, stackSize: 1 },
  { id: 102, name: 'Wood Axe', type: 'axe', material: 'wood', damage: 4, speed: 1.6, durability: 59, mineLevel: 0, stackSize: 1 },
  { id: 103, name: 'Wood Shovel', type: 'shovel', material: 'wood', damage: 1, speed: 2.0, durability: 59, mineLevel: 0, stackSize: 1 },
  // Stone tier
  { id: 104, name: 'Stone Sword', type: 'sword', material: 'stone', damage: 6, speed: 1.6, durability: 131, mineLevel: 0, stackSize: 1 },
  { id: 105, name: 'Stone Pickaxe', type: 'pickaxe', material: 'stone', damage: 4, speed: 2.0, durability: 131, mineLevel: 1, stackSize: 1 },
  { id: 106, name: 'Stone Axe', type: 'axe', material: 'stone', damage: 5, speed: 1.6, durability: 131, mineLevel: 0, stackSize: 1 },
  { id: 107, name: 'Stone Shovel', type: 'shovel', material: 'stone', damage: 2, speed: 2.0, durability: 131, mineLevel: 0, stackSize: 1 },
  // Iron tier
  { id: 108, name: 'Iron Sword', type: 'sword', material: 'iron', damage: 7, speed: 1.6, durability: 250, mineLevel: 0, stackSize: 1 },
  { id: 109, name: 'Iron Pickaxe', type: 'pickaxe', material: 'iron', damage: 5, speed: 2.0, durability: 250, mineLevel: 2, stackSize: 1 },
  { id: 110, name: 'Iron Axe', type: 'axe', material: 'iron', damage: 6, speed: 1.6, durability: 250, mineLevel: 0, stackSize: 1 },
  { id: 111, name: 'Iron Shovel', type: 'shovel', material: 'iron', damage: 3, speed: 2.0, durability: 250, mineLevel: 0, stackSize: 1 },
  // Gold tier
  { id: 112, name: 'Gold Sword', type: 'sword', material: 'gold', damage: 5, speed: 1.6, durability: 32, mineLevel: 0, stackSize: 1 },
  { id: 113, name: 'Gold Pickaxe', type: 'pickaxe', material: 'gold', damage: 3, speed: 2.0, durability: 32, mineLevel: 0, stackSize: 1 },
  { id: 114, name: 'Gold Axe', type: 'axe', material: 'gold', damage: 4, speed: 1.6, durability: 32, mineLevel: 0, stackSize: 1 },
  { id: 115, name: 'Gold Shovel', type: 'shovel', material: 'gold', damage: 1, speed: 2.0, durability: 32, mineLevel: 0, stackSize: 1 },
  // Diamond tier
  { id: 116, name: 'Diamond Sword', type: 'sword', material: 'diamond', damage: 8, speed: 1.6, durability: 1561, mineLevel: 0, stackSize: 1 },
  { id: 117, name: 'Diamond Pickaxe', type: 'pickaxe', material: 'diamond', damage: 6, speed: 2.0, durability: 1561, mineLevel: 3, stackSize: 1 },
  { id: 118, name: 'Diamond Axe', type: 'axe', material: 'diamond', damage: 7, speed: 1.6, durability: 1561, mineLevel: 0, stackSize: 1 },
  { id: 119, name: 'Diamond Shovel', type: 'shovel', material: 'diamond', damage: 4, speed: 2.0, durability: 1561, mineLevel: 0, stackSize: 1 },
  // Ranged / Shield
  { id: 120, name: 'Bow', type: 'bow', material: 'wood', damage: 4, speed: 1.0, durability: 385, mineLevel: 0, stackSize: 1 },
  { id: 121, name: 'Shield', type: 'shield', material: 'iron', blockChance: 0.5, durability: 200, mineLevel: 0, stackSize: 1 },
  // Crystal tier
  { id: 122, name: 'Crystal Sword', type: 'sword', material: 'crystal', damage: 9, speed: 1.6, durability: 2000, mineLevel: 0, stackSize: 1 },
  { id: 123, name: 'Crystal Pickaxe', type: 'pickaxe', material: 'crystal', damage: 7, speed: 2.0, durability: 2000, mineLevel: 4, stackSize: 1 },
  { id: 124, name: 'Crystal Axe', type: 'axe', material: 'crystal', damage: 8, speed: 1.6, durability: 2000, mineLevel: 0, stackSize: 1 },
  { id: 125, name: 'Crystal Shovel', type: 'shovel', material: 'crystal', damage: 5, speed: 2.0, durability: 2000, mineLevel: 0, stackSize: 1 },
  { id: 126, name: 'Arrow', type: 'ammo', stackSize: 64 },

  // ===== ARMOR (IDs 127-146) =====
  // Leather
  { id: 127, name: 'Leather Helmet', type: 'helmet', material: 'leather', defense: 1, durability: 55, stackSize: 1 },
  { id: 128, name: 'Leather Chestplate', type: 'chestplate', material: 'leather', defense: 3, durability: 80, stackSize: 1 },
  { id: 129, name: 'Leather Leggings', type: 'leggings', material: 'leather', defense: 2, durability: 75, stackSize: 1 },
  { id: 130, name: 'Leather Boots', type: 'boots', material: 'leather', defense: 1, durability: 65, stackSize: 1 },
  // Iron
  { id: 131, name: 'Iron Helmet', type: 'helmet', material: 'iron', defense: 2, durability: 165, stackSize: 1 },
  { id: 132, name: 'Iron Chestplate', type: 'chestplate', material: 'iron', defense: 6, durability: 240, stackSize: 1 },
  { id: 133, name: 'Iron Leggings', type: 'leggings', material: 'iron', defense: 5, durability: 225, stackSize: 1 },
  { id: 134, name: 'Iron Boots', type: 'boots', material: 'iron', defense: 2, durability: 195, stackSize: 1 },
  // Gold
  { id: 135, name: 'Gold Helmet', type: 'helmet', material: 'gold', defense: 2, durability: 77, stackSize: 1 },
  { id: 136, name: 'Gold Chestplate', type: 'chestplate', material: 'gold', defense: 5, durability: 112, stackSize: 1 },
  { id: 137, name: 'Gold Leggings', type: 'leggings', material: 'gold', defense: 3, durability: 105, stackSize: 1 },
  { id: 138, name: 'Gold Boots', type: 'boots', material: 'gold', defense: 1, durability: 91, stackSize: 1 },
  // Diamond
  { id: 139, name: 'Diamond Helmet', type: 'helmet', material: 'diamond', defense: 3, durability: 363, stackSize: 1 },
  { id: 140, name: 'Diamond Chestplate', type: 'chestplate', material: 'diamond', defense: 8, durability: 528, stackSize: 1 },
  { id: 141, name: 'Diamond Leggings', type: 'leggings', material: 'diamond', defense: 6, durability: 495, stackSize: 1 },
  { id: 142, name: 'Diamond Boots', type: 'boots', material: 'diamond', defense: 3, durability: 429, stackSize: 1 },
  // Crystal
  { id: 143, name: 'Crystal Helmet', type: 'helmet', material: 'crystal', defense: 4, durability: 500, stackSize: 1 },
  { id: 144, name: 'Crystal Chestplate', type: 'chestplate', material: 'crystal', defense: 10, durability: 700, stackSize: 1 },
  { id: 145, name: 'Crystal Leggings', type: 'leggings', material: 'crystal', defense: 8, durability: 650, stackSize: 1 },
  { id: 146, name: 'Crystal Boots', type: 'boots', material: 'crystal', defense: 4, durability: 550, stackSize: 1 },

  // ===== FOOD (IDs 150-163) =====
  { id: 150, name: 'Apple', type: 'food', hunger: 4, stackSize: 64 },
  { id: 151, name: 'Bread', type: 'food', hunger: 6, stackSize: 64 },
  { id: 152, name: 'Steak', type: 'food', hunger: 8, stackSize: 64 },
  { id: 153, name: 'Cooked Porkchop', type: 'food', hunger: 8, stackSize: 64 },
  { id: 154, name: 'Cooked Chicken', type: 'food', hunger: 6, stackSize: 64 },
  { id: 155, name: 'Cooked Mutton', type: 'food', hunger: 6, stackSize: 64 },
  { id: 156, name: 'Cooked Fish', type: 'food', hunger: 5, stackSize: 64 },
  { id: 157, name: 'Carrot', type: 'food', hunger: 3, stackSize: 64 },
  { id: 158, name: 'Baked Potato', type: 'food', hunger: 5, stackSize: 64 },
  { id: 159, name: 'Golden Apple', type: 'food', hunger: 4, stackSize: 64, effects: [{ type: 'regeneration', duration: 5, power: 1 }] },
  { id: 160, name: 'Enchanted Golden Apple', type: 'food', hunger: 4, stackSize: 64, effects: [{ type: 'regeneration', duration: 30, power: 1 }, { type: 'absorption', duration: 120, power: 1 }] },
  { id: 161, name: 'Mushroom Stew', type: 'food', hunger: 6, stackSize: 1 },
  { id: 162, name: 'Cake', type: 'food', hunger: 6, stackSize: 1 },
  { id: 163, name: 'Cookie', type: 'food', hunger: 2, stackSize: 64 },

  // ===== MATERIALS (IDs 200-221) =====
  { id: 200, name: 'Coal', type: 'material', stackSize: 64 },
  { id: 201, name: 'Iron Ingot', type: 'material', stackSize: 64 },
  { id: 202, name: 'Gold Ingot', type: 'material', stackSize: 64 },
  { id: 203, name: 'Diamond', type: 'material', stackSize: 64 },
  { id: 204, name: 'Crystal', type: 'material', stackSize: 64 },
  { id: 205, name: 'Redstone', type: 'material', stackSize: 64 },
  { id: 206, name: 'Stick', type: 'material', stackSize: 64 },
  { id: 207, name: 'String', type: 'material', stackSize: 64 },
  { id: 208, name: 'Bone', type: 'material', stackSize: 64 },
  { id: 209, name: 'Feather', type: 'material', stackSize: 64 },
  { id: 210, name: 'Flint', type: 'material', stackSize: 64 },
  { id: 211, name: 'Brick', type: 'material', stackSize: 64 },
  { id: 212, name: 'Paper', type: 'material', stackSize: 64 },
  { id: 213, name: 'Book', type: 'material', stackSize: 64 },
  { id: 214, name: 'Leather', type: 'material', stackSize: 64 },
  { id: 215, name: 'Gunpowder', type: 'material', stackSize: 64 },
  { id: 216, name: 'Ender Pearl', type: 'material', stackSize: 16 },
  { id: 217, name: 'Soul Shard', type: 'material', stackSize: 64 },
  { id: 218, name: 'Nether Star', type: 'material', stackSize: 64 },
  { id: 219, name: 'Blaze Rod', type: 'material', stackSize: 64 },
  { id: 220, name: 'Ghast Tear', type: 'material', stackSize: 64 },
  { id: 221, name: 'Glowstone Dust', type: 'material', stackSize: 64 },

  // ===== POTIONS (IDs 230-237) =====
  { id: 230, name: 'Potion of Healing', type: 'potion', stackSize: 1, effects: [{ type: 'instant_health', duration: 0, power: 2 }] },
  { id: 231, name: 'Potion of Regeneration', type: 'potion', stackSize: 1, effects: [{ type: 'regeneration', duration: 45, power: 1 }] },
  { id: 232, name: 'Potion of Strength', type: 'potion', stackSize: 1, effects: [{ type: 'strength', duration: 45, power: 1 }] },
  { id: 233, name: 'Potion of Speed', type: 'potion', stackSize: 1, effects: [{ type: 'speed', duration: 45, power: 1 }] },
  { id: 234, name: 'Potion of Fire Resistance', type: 'potion', stackSize: 1, effects: [{ type: 'fire_resistance', duration: 180, power: 0 }] },
  { id: 235, name: 'Potion of Night Vision', type: 'potion', stackSize: 1, effects: [{ type: 'night_vision', duration: 180, power: 0 }] },
  { id: 236, name: 'Potion of Water Breathing', type: 'potion', stackSize: 1, effects: [{ type: 'water_breathing', duration: 180, power: 0 }] },
  { id: 237, name: 'Potion of Invisibility', type: 'potion', stackSize: 1, effects: [{ type: 'invisibility', duration: 180, power: 0 }] },

  // ===== LEGENDARIES (IDs 250-259) =====
  { id: 250, name: 'Flame Sword', type: 'legendary', subtype: 'sword', damage: 12, speed: 1.6, durability: 2500, stackSize: 1, effects: [{ type: 'fire_aspect', duration: 5, power: 2 }] },
  { id: 251, name: 'Crystal Pickaxe', type: 'legendary', subtype: 'pickaxe', damage: 8, speed: 2.5, durability: 3000, mineLevel: 5, stackSize: 1, effects: [{ type: 'efficiency_boost', duration: 0, power: 3 }] },
  { id: 252, name: 'Void Blade', type: 'legendary', subtype: 'sword', damage: 15, speed: 1.4, durability: 2000, stackSize: 1, effects: [{ type: 'void_damage', duration: 0, power: 5 }] },
  { id: 253, name: 'Shadow Armor', type: 'legendary', subtype: 'set', defense: 20, durability: 1500, stackSize: 1, effects: [{ type: 'stealth', duration: 0, power: 1 }, { type: 'speed', duration: 0, power: 1 }] },
  { id: 254, name: 'Gravity Boots', type: 'legendary', subtype: 'boots', defense: 5, durability: 1200, stackSize: 1, effects: [{ type: 'slow_fall', duration: 0, power: 0 }, { type: 'double_jump', duration: 0, power: 1 }] },
  { id: 255, name: 'Phoenix Bow', type: 'legendary', subtype: 'bow', damage: 8, speed: 1.2, durability: 1500, stackSize: 1, effects: [{ type: 'fire_arrows', duration: 0, power: 3 }, { type: 'piercing', duration: 0, power: 2 }] },
  { id: 256, name: 'Ender Gauntlets', type: 'legendary', subtype: 'gloves', damage: 10, speed: 2.0, durability: 1000, stackSize: 1, effects: [{ type: 'teleport_strike', duration: 0, power: 1 }, { type: 'ender_boost', duration: 0, power: 2 }] },
  { id: 257, name: 'Wyrmscale Shield', type: 'legendary', subtype: 'shield', blockChance: 0.8, durability: 3000, defense: 10, stackSize: 1, effects: [{ type: 'damage_reflect', duration: 0, power: 3 }, { type: 'fire_immunity', duration: 0, power: 0 }] },
  { id: 258, name: 'Storm Staff', type: 'legendary', subtype: 'staff', damage: 14, speed: 1.0, durability: 1000, stackSize: 1, effects: [{ type: 'chain_lightning', duration: 0, power: 3 }, { type: 'stun', duration: 2, power: 1 }] },
  { id: 259, name: 'Soul Harvester', type: 'legendary', subtype: 'scythe', damage: 13, speed: 1.2, durability: 1500, stackSize: 1, effects: [{ type: 'life_steal', duration: 0, power: 3 }, { type: 'soul_collect', duration: 0, power: 1 }] },

  // ===== BLOCK-ITEMS (IDs 270-275) =====
  { id: 270, name: 'Wood', type: 'material', stackSize: 64 },
  { id: 271, name: 'Stone', type: 'material', stackSize: 64 },
  { id: 272, name: 'Obsidian', type: 'material', stackSize: 64 },
  { id: 273, name: 'Clay', type: 'material', stackSize: 64 },
  { id: 274, name: 'Iron Ore', type: 'material', stackSize: 64 },
  { id: 275, name: 'Gold Ore', type: 'material', stackSize: 64 },
];

export const ITEM_MAP = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// Name-based lookup for recipe references
export const ITEM_BY_NAME = Object.fromEntries(ITEMS.map(i => [i.name, i]));

export function getItem(id) {
  return ITEM_MAP[id] || null;
}

export function getItemByName(name) {
  return ITEM_BY_NAME[name] || null;
}

export function isTool(type) {
  return ['sword', 'pickaxe', 'axe', 'shovel', 'bow', 'shield'].includes(type);
}

export function isArmor(type) {
  return ['helmet', 'chestplate', 'leggings', 'boots'].includes(type);
}

export function isFood(type) {
  return type === 'food';
}

// ITEM_IDS: enum-style object mapping constant names to numeric IDs
// Used by code that needs ITEMS.BOW, ITEMS.ARROW, etc.
export const ITEM_IDS = Object.fromEntries(ITEMS.map(i => {
  // Convert item name to UPPER_SNAKE_CASE key
  const key = i.name.toUpperCase().replace(/[\s-]+/g, '_');
  return [key, i.id];
}));
// Also add common short aliases that code expects
ITEM_IDS.BOW = 120;
ITEM_IDS.ARROW = 126;
ITEM_IDS.SHIELD = 121;

