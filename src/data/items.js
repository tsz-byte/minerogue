// MineRogue - Item Definitions
// All 120+ items: tools, armor, food, materials, potions, legendaries

export const ITEMS = [
  // ===== TOOLS (IDs 100-126) =====
  // Wood tier
  { id: 100, name: 'Wood Sword', type: 'sword', material: 'wood', damage: 5, speed: 1.6, durability: 59, mineLevel: 0, stackSize: 1, description: 'A basic wooden blade. Deals 5 damage. Fragile but gets the job done.' },
  { id: 101, name: 'Wood Pickaxe', type: 'pickaxe', material: 'wood', damage: 3, speed: 2.0, durability: 59, mineLevel: 0, stackSize: 1, description: 'Mines basic blocks. Mining level 0. Not very durable.' },
  { id: 102, name: 'Wood Axe', type: 'axe', material: 'wood', damage: 4, speed: 1.6, durability: 59, mineLevel: 0, stackSize: 1, description: 'Chops wood efficiently. Deals 4 damage.' },
  { id: 103, name: 'Wood Shovel', type: 'shovel', material: 'wood', damage: 1, speed: 2.0, durability: 59, mineLevel: 0, stackSize: 1, description: 'Digs dirt and sand. Deals 1 damage.' },
  // Stone tier
  { id: 104, name: 'Stone Sword', type: 'sword', material: 'stone', damage: 6, speed: 1.6, durability: 131, mineLevel: 0, stackSize: 1, description: 'A sturdy stone blade. Deals 6 damage.' },
  { id: 105, name: 'Stone Pickaxe', type: 'pickaxe', material: 'stone', damage: 4, speed: 2.0, durability: 131, mineLevel: 1, stackSize: 1, description: 'Mines stone and iron ore. Mining level 1.' },
  { id: 106, name: 'Stone Axe', type: 'axe', material: 'stone', damage: 5, speed: 1.6, durability: 131, mineLevel: 0, stackSize: 1, description: 'A solid stone axe. Deals 5 damage.' },
  { id: 107, name: 'Stone Shovel', type: 'shovel', material: 'stone', damage: 2, speed: 2.0, durability: 131, mineLevel: 0, stackSize: 1, description: 'A durable stone shovel. Deals 2 damage.' },
  // Iron tier
  { id: 108, name: 'Iron Sword', type: 'sword', material: 'iron', damage: 7, speed: 1.6, durability: 250, mineLevel: 0, stackSize: 1, description: 'A reliable iron blade. Deals 7 damage.' },
  { id: 109, name: 'Iron Pickaxe', type: 'pickaxe', material: 'iron', damage: 5, speed: 2.0, durability: 250, mineLevel: 2, stackSize: 1, description: 'Mines iron and gold ore. Mining level 2.' },
  { id: 110, name: 'Iron Axe', type: 'axe', material: 'iron', damage: 6, speed: 1.6, durability: 250, mineLevel: 0, stackSize: 1, description: 'A sharp iron axe. Deals 6 damage.' },
  { id: 111, name: 'Iron Shovel', type: 'shovel', material: 'iron', damage: 3, speed: 2.0, durability: 250, mineLevel: 0, stackSize: 1, description: 'A sturdy iron shovel. Deals 3 damage.' },
  // Gold tier
  { id: 112, name: 'Gold Sword', type: 'sword', material: 'gold', damage: 5, speed: 1.6, durability: 32, mineLevel: 0, stackSize: 1, description: 'A flashy gold blade. Deals 5 damage but very fragile.' },
  { id: 113, name: 'Gold Pickaxe', type: 'pickaxe', material: 'gold', damage: 3, speed: 2.0, durability: 32, mineLevel: 0, stackSize: 1, description: 'A shiny gold pickaxe. Mining level 0. Very fragile.' },
  { id: 114, name: 'Gold Axe', type: 'axe', material: 'gold', damage: 4, speed: 1.6, durability: 32, mineLevel: 0, stackSize: 1, description: 'A gleaming gold axe. Deals 4 damage but breaks easily.' },
  { id: 115, name: 'Gold Shovel', type: 'shovel', material: 'gold', damage: 1, speed: 2.0, durability: 32, mineLevel: 0, stackSize: 1, description: 'A golden shovel. Deals 1 damage. Extremely fragile.' },
  // Diamond tier
  { id: 116, name: 'Diamond Sword', type: 'sword', material: 'diamond', damage: 8, speed: 1.6, durability: 1561, mineLevel: 0, stackSize: 1, description: 'A powerful diamond blade. Deals 8 damage. Very durable.' },
  { id: 117, name: 'Diamond Pickaxe', type: 'pickaxe', material: 'diamond', damage: 6, speed: 2.0, durability: 1561, mineLevel: 3, stackSize: 1, description: 'Mines all ores including obsidian. Mining level 3.' },
  { id: 118, name: 'Diamond Axe', type: 'axe', material: 'diamond', damage: 7, speed: 1.6, durability: 1561, mineLevel: 0, stackSize: 1, description: 'A razor-sharp diamond axe. Deals 7 damage.' },
  { id: 119, name: 'Diamond Shovel', type: 'shovel', material: 'diamond', damage: 4, speed: 2.0, durability: 1561, mineLevel: 0, stackSize: 1, description: 'An excellent diamond shovel. Deals 4 damage.' },
  // Ranged / Shield
  { id: 120, name: 'Bow', type: 'bow', material: 'wood', damage: 4, speed: 1.0, durability: 385, mineLevel: 0, stackSize: 1, description: 'A ranged weapon. Deals 4 damage per shot. Requires arrows.' },
  { id: 121, name: 'Shield', type: 'shield', material: 'iron', blockChance: 0.5, durability: 200, mineLevel: 0, stackSize: 1, description: 'Blocks 50% of incoming attacks. 200 durability.' },
  // Crystal tier
  { id: 122, name: 'Crystal Sword', type: 'sword', material: 'crystal', damage: 9, speed: 1.6, durability: 2000, mineLevel: 0, stackSize: 1, description: 'A crystalline blade of immense power. Deals 9 damage.' },
  { id: 123, name: 'Crystal Pickaxe', type: 'pickaxe', material: 'crystal', damage: 7, speed: 2.0, durability: 2000, mineLevel: 4, stackSize: 1, description: 'Mines the hardest materials. Mining level 4.' },
  { id: 124, name: 'Crystal Axe', type: 'axe', material: 'crystal', damage: 8, speed: 1.6, durability: 2000, mineLevel: 0, stackSize: 1, description: 'A devastating crystal axe. Deals 8 damage.' },
  { id: 125, name: 'Crystal Shovel', type: 'shovel', material: 'crystal', damage: 5, speed: 2.0, durability: 2000, mineLevel: 0, stackSize: 1, description: 'An elite crystal shovel. Deals 5 damage.' },
  { id: 126, name: 'Arrow', type: 'ammo', stackSize: 64, description: 'Ammunition for bows. Stackable up to 64.' },

  // ===== ARMOR (IDs 127-146) =====
  // Leather
  { id: 127, name: 'Leather Helmet', type: 'helmet', material: 'leather', defense: 1, durability: 55, stackSize: 1, description: 'Basic head protection. Defense: 1.' },
  { id: 128, name: 'Leather Chestplate', type: 'chestplate', material: 'leather', defense: 3, durability: 80, stackSize: 1, description: 'Basic body protection. Defense: 3.' },
  { id: 129, name: 'Leather Leggings', type: 'leggings', material: 'leather', defense: 2, durability: 75, stackSize: 1, description: 'Basic leg protection. Defense: 2.' },
  { id: 130, name: 'Leather Boots', type: 'boots', material: 'leather', defense: 1, durability: 65, stackSize: 1, description: 'Basic foot protection. Defense: 1.' },
  // Iron
  { id: 131, name: 'Iron Helmet', type: 'helmet', material: 'iron', defense: 2, durability: 165, stackSize: 1, description: 'Solid iron head protection. Defense: 2.' },
  { id: 132, name: 'Iron Chestplate', type: 'chestplate', material: 'iron', defense: 6, durability: 240, stackSize: 1, description: 'Solid iron body protection. Defense: 6.' },
  { id: 133, name: 'Iron Leggings', type: 'leggings', material: 'iron', defense: 5, durability: 225, stackSize: 1, description: 'Solid iron leg protection. Defense: 5.' },
  { id: 134, name: 'Iron Boots', type: 'boots', material: 'iron', defense: 2, durability: 195, stackSize: 1, description: 'Solid iron foot protection. Defense: 2.' },
  // Gold
  { id: 135, name: 'Gold Helmet', type: 'helmet', material: 'gold', defense: 2, durability: 77, stackSize: 1, description: 'Gleaming gold headgear. Defense: 2. Fragile.' },
  { id: 136, name: 'Gold Chestplate', type: 'chestplate', material: 'gold', defense: 5, durability: 112, stackSize: 1, description: 'Gleaming gold armor. Defense: 5. Fragile.' },
  { id: 137, name: 'Gold Leggings', type: 'leggings', material: 'gold', defense: 3, durability: 105, stackSize: 1, description: 'Gleaming gold leg armor. Defense: 3. Fragile.' },
  { id: 138, name: 'Gold Boots', type: 'boots', material: 'gold', defense: 1, durability: 91, stackSize: 1, description: 'Gleaming gold boots. Defense: 1. Fragile.' },
  // Diamond
  { id: 139, name: 'Diamond Helmet', type: 'helmet', material: 'diamond', defense: 3, durability: 363, stackSize: 1, description: 'Excellent head protection. Defense: 3.' },
  { id: 140, name: 'Diamond Chestplate', type: 'chestplate', material: 'diamond', defense: 8, durability: 528, stackSize: 1, description: 'Excellent body protection. Defense: 8.' },
  { id: 141, name: 'Diamond Leggings', type: 'leggings', material: 'diamond', defense: 6, durability: 495, stackSize: 1, description: 'Excellent leg protection. Defense: 6.' },
  { id: 142, name: 'Diamond Boots', type: 'boots', material: 'diamond', defense: 3, durability: 429, stackSize: 1, description: 'Excellent foot protection. Defense: 3.' },
  // Crystal
  { id: 143, name: 'Crystal Helmet', type: 'helmet', material: 'crystal', defense: 4, durability: 500, stackSize: 1, description: 'Ultimate head protection. Defense: 4.' },
  { id: 144, name: 'Crystal Chestplate', type: 'chestplate', material: 'crystal', defense: 10, durability: 700, stackSize: 1, description: 'Ultimate body protection. Defense: 10.' },
  { id: 145, name: 'Crystal Leggings', type: 'leggings', material: 'crystal', defense: 8, durability: 650, stackSize: 1, description: 'Ultimate leg protection. Defense: 8.' },
  { id: 146, name: 'Crystal Boots', type: 'boots', material: 'crystal', defense: 4, durability: 550, stackSize: 1, description: 'Ultimate foot protection. Defense: 4.' },

  // ===== FOOD (IDs 150-163) =====
  { id: 150, name: 'Apple', type: 'food', hunger: 4, stackSize: 64, description: 'A simple snack. Restores 4 hunger.' },
  { id: 151, name: 'Bread', type: 'food', hunger: 6, stackSize: 64, description: 'Simple but reliable. Restores 6 hunger.' },
  { id: 152, name: 'Steak', type: 'food', hunger: 8, stackSize: 64, description: 'A hearty meal. Restores 8 hunger.' },
  { id: 153, name: 'Cooked Porkchop', type: 'food', hunger: 8, stackSize: 64, description: 'A filling meal. Restores 8 hunger.' },
  { id: 154, name: 'Cooked Chicken', type: 'food', hunger: 6, stackSize: 64, description: 'Tender poultry. Restores 6 hunger.' },
  { id: 155, name: 'Cooked Mutton', type: 'food', hunger: 6, stackSize: 64, description: 'Savory mutton. Restores 6 hunger.' },
  { id: 156, name: 'Cooked Fish', type: 'food', hunger: 5, stackSize: 64, description: 'A light meal. Restores 5 hunger.' },
  { id: 157, name: 'Carrot', type: 'food', hunger: 3, stackSize: 64, description: 'A crunchy vegetable. Restores 3 hunger.' },
  { id: 158, name: 'Baked Potato', type: 'food', hunger: 5, stackSize: 64, description: 'A warm snack. Restores 5 hunger.' },
  { id: 159, name: 'Golden Apple', type: 'food', hunger: 4, stackSize: 64, effects: [{ type: 'regeneration', duration: 5, power: 1 }], description: 'Restores 4 hunger and grants 5s of Regeneration.' },
  { id: 160, name: 'Enchanted Golden Apple', type: 'food', hunger: 4, stackSize: 64, effects: [{ type: 'regeneration', duration: 30, power: 1 }, { type: 'absorption', duration: 120, power: 1 }], description: 'Restores 4 hunger. Grants 30s Regeneration and 120s Absorption.' },
  { id: 161, name: 'Mushroom Stew', type: 'food', hunger: 6, stackSize: 1, description: 'A warm stew. Restores 6 hunger.' },
  { id: 162, name: 'Cake', type: 'food', hunger: 6, stackSize: 1, description: 'A sweet treat. Restores 6 hunger.' },
  { id: 163, name: 'Cookie', type: 'food', hunger: 2, stackSize: 64, description: 'A small snack. Restores 2 hunger.' },

  // ===== MATERIALS (IDs 200-221) =====
  { id: 200, name: 'Coal', type: 'material', stackSize: 64, description: 'Fuel for smelting and torches.' },
  { id: 201, name: 'Iron Ingot', type: 'material', stackSize: 64, description: 'Crafts iron tools, weapons, and armor.' },
  { id: 202, name: 'Gold Ingot', type: 'material', stackSize: 64, description: 'Crafts gold equipment and golden apples.' },
  { id: 203, name: 'Diamond', type: 'material', stackSize: 64, description: 'Crafts diamond tools, weapons, and armor.' },
  { id: 204, name: 'Crystal', type: 'material', stackSize: 64, description: 'Crafts the strongest equipment.' },
  { id: 205, name: 'Redstone', type: 'material', stackSize: 64, description: 'Used in brewing and redstone circuits.' },
  { id: 206, name: 'Stick', type: 'material', stackSize: 64, description: 'Basic crafting component for tools.' },
  { id: 207, name: 'String', type: 'material', stackSize: 64, description: 'Used to craft bows and wool.' },
  { id: 208, name: 'Bone', type: 'material', stackSize: 64, description: 'Crafts bone meal and fishing rods.' },
  { id: 209, name: 'Feather', type: 'material', stackSize: 64, description: 'Used to craft arrows.' },
  { id: 210, name: 'Flint', type: 'material', stackSize: 64, description: 'Used to craft arrows and flint & steel.' },
  { id: 211, name: 'Brick', type: 'material', stackSize: 64, description: 'Used in construction and decoration.' },
  { id: 212, name: 'Paper', type: 'material', stackSize: 64, description: 'Used to craft books and maps.' },
  { id: 213, name: 'Book', type: 'material', stackSize: 64, description: 'Used for enchanting.' },
  { id: 214, name: 'Leather', type: 'material', stackSize: 64, description: 'Crafts leather armor and books.' },
  { id: 215, name: 'Gunpowder', type: 'material', stackSize: 64, description: 'Used to brew splash potions.' },
  { id: 216, name: 'Ender Pearl', type: 'material', stackSize: 16, description: 'Teleports you when thrown.' },
  { id: 217, name: 'Soul Shard', type: 'material', stackSize: 64, description: 'A mysterious crafting material from the depths.' },
  { id: 218, name: 'Nether Star', type: 'material', stackSize: 64, description: 'A rare trophy dropped by the Wither.' },
  { id: 219, name: 'Blaze Rod', type: 'material', stackSize: 64, description: 'Used to brew potions and craft blaze powder.' },
  { id: 220, name: 'Ghast Tear', type: 'material', stackSize: 64, description: 'Used to brew regeneration potions.' },
  { id: 221, name: 'Glowstone Dust', type: 'material', stackSize: 64, description: 'Used to brew potions and craft glowstone.' },

  // ===== POTIONS (IDs 230-237) =====
  { id: 230, name: 'Potion of Healing', type: 'potion', stackSize: 1, effects: [{ type: 'instant_health', duration: 0, power: 2 }], description: 'Instantly restores health. Power level 2.' },
  { id: 231, name: 'Potion of Regeneration', type: 'potion', stackSize: 1, effects: [{ type: 'regeneration', duration: 45, power: 1 }], description: 'Restores health over 45 seconds.' },
  { id: 232, name: 'Potion of Strength', type: 'potion', stackSize: 1, effects: [{ type: 'strength', duration: 45, power: 1 }], description: 'Increases melee damage for 45 seconds.' },
  { id: 233, name: 'Potion of Speed', type: 'potion', stackSize: 1, effects: [{ type: 'speed', duration: 45, power: 1 }], description: 'Increases movement speed for 45 seconds.' },
  { id: 234, name: 'Potion of Fire Resistance', type: 'potion', stackSize: 1, effects: [{ type: 'fire_resistance', duration: 180, power: 0 }], description: 'Immune to fire and lava for 3 minutes.' },
  { id: 235, name: 'Potion of Night Vision', type: 'potion', stackSize: 1, effects: [{ type: 'night_vision', duration: 180, power: 0 }], description: 'See in the dark for 3 minutes.' },
  { id: 236, name: 'Potion of Water Breathing', type: 'potion', stackSize: 1, effects: [{ type: 'water_breathing', duration: 180, power: 0 }], description: 'Breathe underwater for 3 minutes.' },
  { id: 237, name: 'Potion of Invisibility', type: 'potion', stackSize: 1, effects: [{ type: 'invisibility', duration: 180, power: 0 }], description: 'Become invisible for 3 minutes.' },

  // ===== LEGENDARIES (IDs 250-259) =====
  { id: 250, name: 'Flame Sword', type: 'legendary', subtype: 'sword', damage: 12, speed: 1.6, durability: 2500, stackSize: 1, effects: [{ type: 'fire_aspect', duration: 5, power: 2 }], description: 'A legendary blade wreathed in fire. Deals 12 damage and ignites enemies.' },
  { id: 251, name: 'Crystal Pickaxe', type: 'legendary', subtype: 'pickaxe', damage: 8, speed: 2.5, durability: 3000, mineLevel: 5, stackSize: 1, effects: [{ type: 'efficiency_boost', duration: 0, power: 3 }], description: 'An enhanced crystal pickaxe. Mining level 5 with efficiency boost.' },
  { id: 252, name: 'Void Blade', type: 'legendary', subtype: 'sword', damage: 15, speed: 1.4, durability: 2000, stackSize: 1, effects: [{ type: 'void_damage', duration: 0, power: 5 }], description: 'A blade from the void. Deals 15 damage with void damage bonus.' },
  { id: 253, name: 'Shadow Armor', type: 'legendary', subtype: 'set', defense: 20, durability: 1500, stackSize: 1, effects: [{ type: 'stealth', duration: 0, power: 1 }, { type: 'speed', duration: 0, power: 1 }], description: 'Legendary armor of the shadows. Defense: 20 with stealth and speed.' },
  { id: 254, name: 'Gravity Boots', type: 'legendary', subtype: 'boots', defense: 5, durability: 1200, stackSize: 1, effects: [{ type: 'slow_fall', duration: 0, power: 0 }, { type: 'double_jump', duration: 0, power: 1 }], description: 'Defy gravity. Defense: 5 with slow fall and double jump.' },
  { id: 255, name: 'Phoenix Bow', type: 'legendary', subtype: 'bow', damage: 8, speed: 1.2, durability: 1500, stackSize: 1, effects: [{ type: 'fire_arrows', duration: 0, power: 3 }, { type: 'piercing', duration: 0, power: 2 }], description: 'A bow forged in phoenix fire. Deals 8 damage with fire and piercing.' },
  { id: 256, name: 'Ender Gauntlets', type: 'legendary', subtype: 'gloves', damage: 10, speed: 2.0, durability: 1000, stackSize: 1, effects: [{ type: 'teleport_strike', duration: 0, power: 1 }, { type: 'ender_boost', duration: 0, power: 2 }], description: 'Gauntlets of the End. Deals 10 damage with teleport strike.' },
  { id: 257, name: 'Wyrmscale Shield', type: 'legendary', subtype: 'shield', blockChance: 0.8, durability: 3000, defense: 10, stackSize: 1, effects: [{ type: 'damage_reflect', duration: 0, power: 3 }, { type: 'fire_immunity', duration: 0, power: 0 }], description: 'A shield of dragon scales. Blocks 80% with reflect and fire immunity.' },
  { id: 258, name: 'Storm Staff', type: 'legendary', subtype: 'staff', damage: 14, speed: 1.0, durability: 1000, stackSize: 1, effects: [{ type: 'chain_lightning', duration: 0, power: 3 }, { type: 'stun', duration: 2, power: 1 }], description: 'Commands lightning. Deals 14 damage with chain lightning and stun.' },
  { id: 259, name: 'Soul Harvester', type: 'legendary', subtype: 'scythe', damage: 13, speed: 1.2, durability: 1500, stackSize: 1, effects: [{ type: 'life_steal', duration: 0, power: 3 }, { type: 'soul_collect', duration: 0, power: 1 }], description: 'A scythe that steals life. Deals 13 damage with life steal.' },

  // ===== BLOCK-ITEMS (IDs 270-275) =====
  { id: 270, name: 'Wood', type: 'material', stackSize: 64, description: 'Basic building material. Used for crafting tools and planks.' },
  { id: 271, name: 'Stone', type: 'material', stackSize: 64, description: 'Common building material. Requires mining level 1.' },
  { id: 272, name: 'Obsidian', type: 'material', stackSize: 64, description: 'Extremely hard block. Requires mining level 3.' },
  { id: 273, name: 'Clay', type: 'material', stackSize: 64, description: 'Found near water. Used for bricks.' },
  { id: 274, name: 'Iron Ore', type: 'material', stackSize: 64, description: 'Smelts into iron ingots. Requires mining level 1.' },
  { id: 275, name: 'Gold Ore', type: 'material', stackSize: 64, description: 'Smelts into gold ingots. Requires mining level 2.' },
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

