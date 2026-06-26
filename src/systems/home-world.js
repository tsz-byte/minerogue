/**
 * MineRogue Home World - Persistent 64x32x64 safe zone
 *
 * Block IDs match src/data/blocks.js:
 *   1=Grass 2=Dirt 3=Stone 6=Cobblestone 7=OakPlanks 27=Obsidian
 *   29=CraftingTable 30=Furnace 31=Chest 62=Bed 61=PortalFrame
 *   32=Torch 55=OakFence
 */

// Block IDs from data/blocks.js
const B = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLESTONE: 6,
  OAK_PLANKS: 7,
  OBSIDIAN: 27,
  CRAFTING_TABLE: 29,
  FURNACE: 30,
  CHEST: 31,
  TORCH: 32,
  OAK_FENCE: 55,
  PORTAL_FRAME: 61,
  BED: 62,
};

export class HomeWorld {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.sizeX = 64;
    this.sizeY = 32;
    this.sizeZ = 64;
    this.blocks = null;
    this.npcs = [];
  }

  generate() {
    const { sizeX, sizeY, sizeZ } = this;
    const total = sizeX * sizeY * sizeZ;
    this.blocks = new Uint8Array(total);

    const idx = (x, y, z) => x + z * sizeX + y * sizeX * sizeZ;

    // Fill ground: grass at y=0, dirt y=-1..-2, stone below
    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        this.blocks[idx(x, 0, z)] = B.GRASS;
        for (let y = -2; y < 0; y++) {
          if (y >= -sizeY) this.blocks[idx(x, y + sizeY, z)] = B.DIRT;
        }
        for (let y = -6; y < -2; y++) {
          if (y >= -sizeY) this.blocks[idx(x, y + sizeY, z)] = B.STONE;
        }
      }
    }

    // Build starter house at center
    this._buildHouse(28, 1, 28);

    // Build NPC stalls
    this._buildNPCStalls(28, 1, 28);

    // Place portal frame
    this._buildPortal(40, 1, 28);

    this._setupNPCs();
    return this.blocks;
  }

  _flatIndex(x, y, z) {
    if (x < 0 || x >= this.sizeX || z < 0 || z >= this.sizeZ) return -1;
    const adjY = y + this.sizeY;
    if (adjY < 0 || adjY >= this.sizeY) return -1;
    return x + z * this.sizeX + adjY * this.sizeX * this.sizeZ;
  }

  getBlock(x, y, z) {
    const i = this._flatIndex(x, y, z);
    return i >= 0 ? this.blocks[i] : 0;
  }

  setBlock(x, y, z, id) {
    const i = this._flatIndex(x, y, z);
    if (i >= 0) this.blocks[i] = id;
  }

  _fillBox(x1, y1, z1, x2, y2, z2, id) {
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        for (let z = z1; z <= z2; z++)
          this.setBlock(x, y, z, id);
  }

  _buildHouse(cx, cy, cz) {
    const x1 = cx - 5, x2 = cx + 4;
    const z1 = cz - 4, z2 = cz + 3;
    const y1 = cy;

    // Floor: cobblestone
    this._fillBox(x1, y1, z1, x2, y1, z2, B.COBBLESTONE);

    // Walls: oak planks (hollow)
    this._fillBox(x1, y1 + 1, z1, x2, y1 + 4, z1, B.OAK_PLANKS); // back
    this._fillBox(x1, y1 + 1, z2, x2, y1 + 4, z2, B.OAK_PLANKS); // front
    this._fillBox(x1, y1 + 1, z1, x1, y1 + 4, z2, B.OAK_PLANKS); // left
    this._fillBox(x2, y1 + 1, z1, x2, y1 + 4, z2, B.OAK_PLANKS); // right

    // Door opening (front wall center)
    this.setBlock(cx, y1 + 1, z2, B.AIR);
    this.setBlock(cx, y1 + 2, z2, B.AIR);

    // Roof
    this._fillBox(x1 - 1, y1 + 5, z1 - 1, x2 + 1, y1 + 5, z2 + 1, B.COBBLESTONE);

    // Interior: Crafting Table
    this.setBlock(x1 + 1, y1 + 1, cz, B.CRAFTING_TABLE);
    // Furnace
    this.setBlock(x1 + 1, y1 + 1, cz + 1, B.FURNACE);
    // Vault Chest
    this.setBlock(cx, y1 + 1, z1 + 1, B.CHEST);
    // Bed
    this.setBlock(x2 - 1, y1 + 1, cz, B.BED);
    // Torches for light
    this.setBlock(cx, y1 + 3, cz, B.TORCH);
  }

  _buildPortal(cx, cy, cz) {
    const px = cx + 12;
    const pz = cz;
    // Base
    this._fillBox(px, cy, pz, px + 3, cy, pz, B.OBSIDIAN);
    // Sides
    this._fillBox(px, cy + 1, pz, px, cy + 4, pz, B.OBSIDIAN);
    this._fillBox(px + 3, cy + 1, pz, px + 3, cy + 4, pz, B.OBSIDIAN);
    // Top
    this._fillBox(px, cy + 4, pz, px + 3, cy + 4, pz, B.OBSIDIAN);
    // Clear interior
    this._fillBox(px + 1, cy + 1, pz, px + 2, cy + 3, pz, B.AIR);
    // Portal frame center (interactable, starts a new run)
    this._fillBox(px + 1, cy + 1, pz, px + 2, cy + 3, pz, B.PORTAL_FRAME);
  }

  _buildNPCStalls(cx, cy, cz) {
    const stallPositions = [
      { x: cx - 15, z: cz - 8 },
      { x: cx - 15, z: cz + 8 },
      { x: cx + 15, z: cz - 8 },
      { x: cx + 15, z: cz + 8 },
      { x: cx - 8, z: cz - 15 },
      { x: cx + 8, z: cz - 15 },
    ];

    for (const pos of stallPositions) {
      // Stall base
      this._fillBox(pos.x - 1, cy, pos.z - 1, pos.x + 1, cy, pos.z + 1, B.COBBLESTONE);
      // Stall counter
      this._fillBox(pos.x - 1, cy + 1, pos.z, pos.x + 1, cy + 1, pos.z, B.OAK_PLANKS);
      // Stall canopy
      this._fillBox(pos.x - 2, cy + 3, pos.z - 2, pos.x + 2, cy + 3, pos.z + 2, B.OAK_PLANKS);
      // Posts
      this.setBlock(pos.x - 2, cy + 2, pos.z - 2, B.OAK_FENCE);
      this.setBlock(pos.x + 2, cy + 2, pos.z - 2, B.OAK_FENCE);
      this.setBlock(pos.x - 2, cy + 2, pos.z + 2, B.OAK_FENCE);
      this.setBlock(pos.x + 2, cy + 2, pos.z + 2, B.OAK_FENCE);
    }
  }

  _setupNPCs() {
    const cx = 28, cz = 28;
    this.npcs = [
      { type: 'merchant', x: cx - 15, y: 2, z: cz - 8, dialog: 'Welcome! Browse my wares.' },
      { type: 'blacksmith', x: cx - 15, y: 2, z: cz + 8, dialog: 'Need repairs? I can upgrade your gear.' },
      { type: 'alchemist', x: cx + 15, y: 2, z: cz - 8, dialog: 'Potions for every occasion!' },
      { type: 'enchanter', x: cx + 15, y: 2, z: cz + 8, dialog: 'Let me weave magic into your equipment.' },
      { type: 'cartographer', x: cx - 8, y: 2, z: cz - 15, dialog: 'Maps reveal the unknown.' },
      { type: 'mystic', x: cx + 8, y: 2, z: cz - 15, dialog: 'The shrines hold ancient power.' },
    ];
  }

  getNPCs() {
    return this.npcs;
  }

  interactNPC(type) {
    const npc = this.npcs.find(n => n.type === type);
    if (!npc) return null;
    switch (type) {
      case 'merchant': return { action: 'shop', category: 'basic' };
      case 'blacksmith': return { action: 'repair' };
      case 'alchemist': return { action: 'brew' };
      case 'enchanter': return { action: 'enchant' };
      case 'cartographer': return { action: 'map' };
      case 'mystic': return { action: 'shrines' };
      default: return { action: 'talk', dialog: npc.dialog };
    }
  }

  save() {
    if (!this.blocks || !this.saveSystem) return;
    const data = {
      blocks: Array.from(this.blocks),
      sizeX: this.sizeX,
      sizeY: this.sizeY,
      sizeZ: this.sizeZ,
    };
    this.saveSystem.saveHome(data);
  }

  load() {
    if (!this.saveSystem) return false;
    const data = this.saveSystem.loadHome();
    if (!data || !data.blocks) return false;
    this.sizeX = data.sizeX || 64;
    this.sizeY = data.sizeY || 32;
    this.sizeZ = data.sizeZ || 64;
    this.blocks = new Uint8Array(data.blocks);
    this._setupNPCs();
    return true;
  }
}
