/**
 * MineRogue - Structures
 * Simple structure generators for discoverable world features.
 * Block IDs match src/data/blocks.js.
 *
 * Key IDs: 6=Cobblestone, 7=Oak Planks, 8=Oak Log, 22=Bedrock,
 *          24=Bricks, 27=Obsidian, 28=Glowstone, 31=Chest, 34=Sandstone,
 *          59=Shrine Block, 60=Mob Spawner, 61=Portal Frame, 67=Void Stone
 */
// ─── Loot Tables ─────────────────────────────────────────────────────
// Correct IDs from items.js: 200=Coal, 201=Iron Ingot, 202=Gold Ingot,
//   203=Diamond, 204=Crystal, 206=Stick, 100=Wood Sword, 104=Stone Sword,
//   108=Iron Sword, 105=Stone Pickaxe, 109=Iron Pickaxe, 127=Leather Helmet,
//   128=Leather Chestplate, 131=Iron Helmet, 150=Apple, 151=Bread,
//   152=Steak, 153=Cooked Porkchop, 159=Golden Apple, 230=Potion of Healing,
//   120=Bow, 121=Shield, 122=Crystal Sword, 214=Leather, 210=Flint,
//   209=Feather, 207=String, 208=Bone, 215=Gunpowder, 216=Ender Pearl

const LOOT = {
  village: [
    { id: 151, count: 3 },   // Bread
    { id: 206, count: 4 },   // Stick
    { id: 200, count: 3 },   // Coal
    { id: 100, count: 1 },   // Wood Sword
    { id: 150, count: 2 },   // Apple
  ],
  dungeon: [
    { id: 201, count: 4 },   // Iron Ingot
    { id: 108, count: 1 },   // Iron Sword
    { id: 152, count: 3 },   // Steak
    { id: 200, count: 5 },   // Coal
    { id: 131, count: 1 },   // Iron Helmet
    { id: 120, count: 1 },   // Bow
    { id: 210, count: 3 },   // Flint
  ],
  temple: [
    { id: 202, count: 5 },   // Gold Ingot
    { id: 203, count: 2 },   // Diamond
    { id: 159, count: 1 },   // Golden Apple
    { id: 109, count: 1 },   // Iron Pickaxe
    { id: 230, count: 3 },   // Potion of Healing
    { id: 204, count: 2 },   // Crystal
    { id: 216, count: 1 },   // Ender Pearl
  ],
  portal: [
    { id: 204, count: 5 },   // Crystal
    { id: 203, count: 3 },   // Diamond
    { id: 230, count: 4 },   // Potion of Healing
    { id: 122, count: 1 },   // Crystal Sword
    { id: 202, count: 6 },   // Gold Ingot
    { id: 159, count: 2 },   // Golden Apple
    { id: 218, count: 1 },   // Nether Star
  ],
};

function _placeChest(world, cx, cy, cz, lootKey) {
  world.setBlock(cx, cy, cz, 31); // Chest
  const items = LOOT[lootKey] || LOOT.village;
  world.registerChestLoot(cx, cy, cz, items.map(i => ({ ...i })));
}

/**
 * Generate a structure at the given world position.
 * @param {string} type - 'village_ruins' | 'dungeon_tower' | 'desert_temple' | 'portal_room'
 * @param {number} x - World X origin
 * @param {number} y - World Y origin (bottom)
 * @param {number} z - World Z origin
 * @param {{ getBlock: Function, setBlock: Function }} world
 */
export function generateStructure(type, x, y, z, world) {
  switch (type) {
    case 'village_ruins':
      _buildVillageRuins(x, y, z, world);
      break;
    case 'dungeon_tower':
      _buildDungeonTower(x, y, z, world);
      break;
    case 'desert_temple':
      _buildDesertTemple(x, y, z, world);
      break;
    case 'portal_room':
      _buildPortalRoom(x, y, z, world);
      break;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────

function fillBox(world, x1, y1, z1, x2, y2, z2, id) {
  for (let y = y1; y <= y2; y++)
    for (let z = z1; z <= z2; z++)
      for (let x = x1; x <= x2; x++)
        world.setBlock(x, y, z, id);
}

function hollowBox(world, x1, y1, z1, x2, y2, z2, id) {
  for (let y = y1; y <= y2; y++)
    for (let z = z1; z <= z2; z++)
      for (let x = x1; x <= x2; x++) {
        const edge = x === x1 || x === x2 || y === y1 || y === y2 || z === z1 || z === z2;
        if (edge) world.setBlock(x, y, z, id);
      }
}

// ─── Village Ruins ─────────────────────────────────────────────────────

function _buildVillageRuins(x, y, z, world) {
  // Floor: 7×7 cobblestone
  fillBox(world, x, y, z, x + 6, y, z + 6, 6); // Cobblestone

  // Walls: 3 high cobblestone
  hollowBox(world, x, y + 1, z, x + 6, y + 3, z + 6, 6);

  // Door opening (front)
  world.setBlock(x + 3, y + 1, z, 0);
  world.setBlock(x + 3, y + 2, z, 0);

  // Window gaps
  world.setBlock(x, y + 2, z + 3, 0);
  world.setBlock(x + 6, y + 2, z + 3, 0);

  // Ruins: break part of wall/roof
  world.setBlock(x + 4, y + 3, z, 0);
  world.setBlock(x + 5, y + 3, z, 0);
  world.setBlock(x + 5, y + 3, z + 1, 0);

  // Roof cap: oak planks
  fillBox(world, x, y + 4, z, x + 6, y + 4, z + 6, 7); // Oak Planks
  // Hollow interior of roof
  fillBox(world, x + 1, y + 4, z + 1, x + 5, y + 4, z + 5, 0);
  // Broken roof section
  fillBox(world, x + 3, y + 4, z + 4, x + 6, y + 4, z + 6, 0);

  // Oak log corners (support beams)
  const logId = 8;
  for (let h = 1; h <= 3; h++) {
    world.setBlock(x, y + h, z, logId);
    world.setBlock(x + 6, y + h, z, logId);
    world.setBlock(x, y + h, z + 6, logId);
    world.setBlock(x + 6, y + h, z + 6, logId);
  }

  // Loot chest
  _placeChest(world, x + 3, y + 1, z + 3, 'village');
}

// ─── Dungeon Tower ─────────────────────────────────────────────────────

function _buildDungeonTower(x, y, z, world) {
  const s = 9;
  const h = 16;

  // Foundation
  fillBox(world, x, y, z, x + s - 1, y, z + s - 1, 6);

  // Outer walls
  for (let dy = 1; dy <= h; dy++) {
    for (let dx = 0; dx < s; dx++) {
      for (let dz = 0; dz < s; dz++) {
        const wall = dx === 0 || dx === s - 1 || dz === 0 || dz === s - 1;
        if (wall) world.setBlock(x + dx, y + dy, z + dz, 6);
      }
    }
  }

  // Floor every 4 blocks (with stairwell hole)
  for (let dy = 4; dy <= h; dy += 4) {
    fillBox(world, x + 1, y + dy, z + 1, x + s - 2, y + dy, z + s - 2, 6);
    fillBox(world, x + 3, y + dy, z + 3, x + 5, y + dy, z + 5, 0); // hole
  }

  // Mob spawners at each floor
  for (let dy = 1; dy <= h; dy += 4) {
    world.setBlock(x + 4, y + dy, z + 4, 60); // Mob Spawner
  }

  // Loot chest at ground level
  _placeChest(world, x + 7, y + 1, z + 7, 'dungeon');

  // Ground-level door
  world.setBlock(x + 4, y + 1, z, 0);
  world.setBlock(x + 4, y + 2, z, 0);

  // Crenellations on top
  for (let i = 0; i < s; i += 2) {
    world.setBlock(x + i, y + h + 1, z, 6);
    world.setBlock(x + i, y + h + 1, z + s - 1, 6);
    world.setBlock(x, y + h + 1, z + i, 6);
    world.setBlock(x + s - 1, y + h + 1, z + i, 6);
  }

  // Glowstone accents at entrance
  world.setBlock(x + 3, y + 3, z, 28);
  world.setBlock(x + 5, y + 3, z, 28);
}

// ─── Desert Temple ─────────────────────────────────────────────────────

function _buildDesertTemple(x, y, z, world) {
  const base = 11;
  const layers = 6;

  // Sandstone pyramid
  for (let layer = 0; layer < layers; layer++) {
    const off = layer;
    const sz = base - layer * 2;
    if (sz <= 0) break;
    for (let dx = 0; dx < sz; dx++)
      for (let dz = 0; dz < sz; dz++)
        world.setBlock(x + off + dx, y + layer, z + off + dz, 34); // Sandstone
  }

  // Underground chamber (hollow under pyramid)
  fillBox(world, x + 2, y, z + 2, x + 8, y + 3, z + 8, 0);

  // Pillars
  const pillarPos = [[3, 3], [7, 3], [3, 7], [7, 7]];
  for (const [px, pz] of pillarPos) {
    for (let h = 0; h <= 2; h++) {
      world.setBlock(x + px, y + h, z + pz, 34);
    }
  }

  // Glowstone floor accent
  world.setBlock(x + 5, y, z + 5, 28);

  // Loot chest (replaces spawner marker)
  _placeChest(world, x + 5, y + 1, z + 5, 'temple');

  // Entrance tunnel
  fillBox(world, x + 5, y + 1, z, x + 5, y + 3, z + 1, 0);
}

// ─── Portal Room ───────────────────────────────────────────────────────

function _buildPortalRoom(x, y, z, world) {
  const w = 7;
  const h = 7;

  // Obsidian floor
  fillBox(world, x, y, z, x + w - 1, y, z + w - 1, 27);

  // Stone walls
  hollowBox(world, x, y + 1, z, x + w - 1, y + h, z + w - 1, 3);

  // Clear interior
  fillBox(world, x + 1, y + 1, z + 1, x + w - 2, y + h - 1, z + w - 2, 0);

  // Obsidian corner pillars (full height)
  for (let i = 0; i <= h; i++) {
    world.setBlock(x, y + i, z, 27);
    world.setBlock(x + w - 1, y + i, z, 27);
    world.setBlock(x, y + i, z + w - 1, 27);
    world.setBlock(x + w - 1, y + i, z + w - 1, 27);
  }

  // Portal frame (4×5) at center
  const px = x + 2;
  const pz = z + 3;
  const py = y + 1;

  // Left & right pillars
  for (let i = 0; i < 5; i++) {
    world.setBlock(px, py + i, pz, 61);      // Portal Frame
    world.setBlock(px + 3, py + i, pz, 61);
  }
  // Top & bottom bars
  for (let i = 0; i < 4; i++) {
    world.setBlock(px + i, py, pz, 61);
    world.setBlock(px + i, py + 4, pz, 61);
  }

  // Portal interior: water placeholder
  for (let i = 1; i < 4; i++)
    for (let j = 1; j < 4; j++)
      world.setBlock(px + j, py + i, pz, 20); // Water

  // Glowstone lights on walls
  world.setBlock(x + 1, y + 3, z + 1, 28);
  world.setBlock(x + w - 2, y + 3, z + 1, 28);
  world.setBlock(x + 1, y + 3, z + w - 2, 28);
  world.setBlock(x + w - 2, y + 3, z + w - 2, 28);

  // Shrine Block as quest marker
  world.setBlock(x + 3, y + 1, z + 1, 59);

  // Loot chest near shrine
  _placeChest(world, x + 1, y + 1, z + 1, 'portal');
}
