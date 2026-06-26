/**
 * MineRogue Dungeon Generator - Multi-floor tower with room types
 *
 * Block IDs match src/data/blocks.js:
 *   3=Stone 6=Cobblestone 31=Chest 54=Ladder 55=OakFence
 *   59=ShrineBlock 60=MobSpawner 65=IronBars
 */

// Block IDs from data/blocks.js
const B = {
  AIR: 0,
  STONE: 3,
  COBBLESTONE: 6,
  CHEST: 31,
  LADDER: 54,
  OAK_FENCE: 55,
  OAK_DOOR: 53,
  SHRINE: 59,
  MOB_SPAWNER: 60,
  IRON_BARS: 65,
};

export class DungeonGenerator {
  constructor(world) {
    this.world = world;
    this.floorSize = 12;
    this.floorHeight = 6;
    this.roomTypes = [
      { type: 'spawner', weight: 35 },
      { type: 'treasure', weight: 15 },
      { type: 'shrine', weight: 15 },
      { type: 'trap', weight: 15 },
      { type: 'arena', weight: 10 },
      { type: 'puzzle', weight: 5 },
      { type: 'lore', weight: 5 },
    ];
    this.totalWeight = this.roomTypes.reduce((s, r) => s + r.weight, 0);
  }

  generate(baseX, baseZ) {
    const numFloors = 3 + Math.floor(Math.random() * 3); // 3-5 floors
    const floors = [];

    for (let f = 0; f < numFloors; f++) {
      const floor = this.generateFloor(f);
      floors.push(floor);

      // Place floor into world
      const yBase = f * this.floorHeight;
      this._placeFloor(baseX, yBase, baseZ, floor, f, numFloors);
    }

    return {
      baseX, baseZ,
      floors,
      numFloors,
      totalHeight: numFloors * this.floorHeight,
    };
  }

  generateFloor(floorNum) {
    const rooms = [];
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 rooms per floor

    for (let i = 0; i < count; i++) {
      const type = this._pickRoomType();
      rooms.push({
        type,
        index: i,
        floor: floorNum,
        cleared: false,
      });
    }

    // Last floor always has boss room
    if (floorNum >= 2) {
      rooms.push({ type: 'boss', index: rooms.length, floor: floorNum, cleared: false });
    }

    return { rooms, floorNum };
  }

  _pickRoomType() {
    let r = Math.random() * this.totalWeight;
    for (const rt of this.roomTypes) {
      r -= rt.weight;
      if (r <= 0) return rt.type;
    }
    return 'spawner';
  }

  _placeFloor(bx, by, bz, floor, floorNum, totalFloors) {
    const S = this.floorSize;
    const H = this.floorHeight;

    // Floor base
    for (let x = 0; x < S; x++) {
      for (let z = 0; z < S; z++) {
        this._set(bx + x, by, bz + z, B.STONE);
      }
    }

    // Outer walls
    for (let x = 0; x < S; x++) {
      for (let y = 1; y < H; y++) {
        this._set(bx + x, by + y, bz, B.COBBLESTONE);
        this._set(bx + x, by + y, bz + S - 1, B.COBBLESTONE);
      }
    }
    for (let z = 0; z < S; z++) {
      for (let y = 1; y < H; y++) {
        this._set(bx, by + y, bz + z, B.COBBLESTONE);
        this._set(bx + S - 1, by + y, bz + z, B.COBBLESTONE);
      }
    }

    // Ceiling
    for (let x = 0; x < S; x++) {
      for (let z = 0; z < S; z++) {
        this._set(bx + x, by + H - 1, bz + z, B.STONE);
      }
    }

    // Stairs to next floor (hole in ceiling + ladder)
    if (floorNum < totalFloors - 1) {
      const sx = S - 2, sz = S - 2;
      this._set(bx + sx, by + H - 1, bz + sz, B.AIR); // open ceiling
      for (let y = 1; y < H - 1; y++) {
        this._set(bx + sx, by + y, bz + sz, B.LADDER);
      }
    }

    // Place room-specific features
    for (const room of floor.rooms) {
      this._placeRoom(bx, by, bz, room);
    }
  }

  _placeRoom(bx, by, bz, room) {
    const cx = bx + 3 + room.index * 3;
    const cz = bz + 3;

    switch (room.type) {
      case 'spawner':
        this._set(cx, by + 1, cz, B.MOB_SPAWNER);
        this._set(cx + 2, by + 1, cz, B.CHEST);
        break;

      case 'treasure':
        this._set(cx, by + 1, cz, B.CHEST);
        this._set(cx + 1, by + 1, cz, B.CHEST);
        this._set(cx, by + 1, cz + 1, B.CHEST);
        break;

      case 'shrine':
        this._set(cx, by + 1, cz, B.SHRINE);
        break;

      case 'trap':
        // Pressure plates would be decorative; mark area with stone
        this._set(cx, by + 1, cz, B.STONE);
        this._set(cx + 2, by + 1, cz, B.STONE);
        // Pitfall
        this._set(cx + 1, by, cz + 1, B.AIR);
        break;

      case 'arena':
        // Iron bars around perimeter
        for (let dx = -1; dx <= 3; dx++) {
          this._set(cx + dx, by + 2, cz - 1, B.IRON_BARS);
          this._set(cx + dx, by + 2, cz + 3, B.IRON_BARS);
        }
        for (let dz = 0; dz <= 2; dz++) {
          this._set(cx - 1, by + 2, cz + dz, B.IRON_BARS);
          this._set(cx + 3, by + 2, cz + dz, B.IRON_BARS);
        }
        break;

      case 'puzzle':
        // Mark puzzle area with stone blocks
        this._set(cx, by + 1, cz, B.STONE);
        this._set(cx + 2, by + 1, cz, B.STONE);
        this._set(cx + 1, by + 1, cz + 1, B.STONE);
        // Door (oak door)
        this._set(cx + 1, by + 1, cz - 1, B.OAK_DOOR);
        this._set(cx + 1, by + 2, cz - 1, B.OAK_DOOR);
        break;

      case 'lore':
        // Bookshelves - use fence as placeholder for bookshelf (id 33 not in list)
        this._set(cx, by + 1, cz, B.CHEST); // loot chest
        break;

      case 'boss':
        this._set(cx, by + 1, cz, B.MOB_SPAWNER);
        this._set(cx - 1, by + 1, cz, B.CHEST);
        this._set(cx + 1, by + 1, cz, B.CHEST);
        break;
    }
  }

  _set(x, y, z, id) {
    if (this.world && typeof this.world.setBlock === 'function') {
      this.world.setBlock(x, y, z, id);
    }
  }
}
