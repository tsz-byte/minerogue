/**
 * MineRogue - World
 * Manages chunk loading/unloading, block access, and mesh rebuilds.
 */
import { Chunk } from './chunk.js';

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 8; // chunks
const UNLOAD_DISTANCE = RENDER_DISTANCE + 2;
const MAX_REBUILDS_PER_FRAME = 2;

export class World {
  constructor(generator, scene, textureAtlas, isHome = false) {
    this.generator = generator;
    this.scene = scene;
    this.textureAtlas = textureAtlas;
    this.isHome = isHome;
    this.chunks = new Map();
    this._pendingTrees = [];
    this.chestLoot = new Map(); // key "x,y,z" → [{id, count}]
  }

  /**
   * Open a chest at world coordinates. Returns loot array and removes the chest.
   * @returns {{items: Array<{id: number, count: number}>} | null}
   */
  openChest(x, y, z) {
    const key = `${x},${y},${z}`;
    const loot = this.chestLoot.get(key);
    if (!loot) return null;
    this.chestLoot.delete(key);
    this.setBlock(x, y, z, 0); // remove chest block
    return { items: loot };
  }

  /**
   * Register loot for a chest at world coordinates.
   */
  registerChestLoot(x, y, z, items) {
    this.chestLoot.set(`${x},${y},${z}`, items);
  }

  chunkKey(cx, cy, cz) {
    return `${cx},${cy},${cz}`;
  }

  /**
   * Get block ID at world coordinates. Returns 0 (air) for unloaded chunks.
   */
  getBlock(x, y, z) {
    // Use proper floor division (Math.floor handles negatives correctly)
    const cx = Math.floor(x / CHUNK_SIZE);
    const cy = Math.floor(y / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = this.chunks.get(this.chunkKey(cx, cy, cz));
    if (!chunk) return 0;

    // Proper modulo for negative coordinates
    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk.getBlock(lx, ly, lz);
  }

  /**
   * Set block ID at world coordinates. Marks chunk and neighbors dirty.
   */
  setBlock(x, y, z, id) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cy = Math.floor(y / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = this.chunks.get(this.chunkKey(cx, cy, cz));
    if (!chunk) return;

    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    chunk.setBlock(lx, ly, lz, id);

    // Dirty neighbor chunks if block is on a chunk boundary
    if (lx === 0)              this._dirtyNeighbor(cx - 1, cy, cz);
    if (lx === CHUNK_SIZE - 1) this._dirtyNeighbor(cx + 1, cy, cz);
    if (ly === 0)              this._dirtyNeighbor(cx, cy - 1, cz);
    if (ly === CHUNK_SIZE - 1) this._dirtyNeighbor(cx, cy + 1, cz);
    if (lz === 0)              this._dirtyNeighbor(cx, cy, cz - 1);
    if (lz === CHUNK_SIZE - 1) this._dirtyNeighbor(cx, cy, cz + 1);
  }

  _dirtyNeighbor(cx, cy, cz) {
    const chunk = this.chunks.get(this.chunkKey(cx, cy, cz));
    if (chunk) chunk.dirty = true;
  }

  /**
   * Main per-frame update: load/unload chunks, rebuild dirty meshes.
   * @param {{ x: number, y: number, z: number }} playerPos
   * @param {THREE.Camera} camera
   */
  update(playerPos, camera) {
    const pcx = Math.floor(playerPos.x / CHUNK_SIZE);
    const pcz = Math.floor(playerPos.z / CHUNK_SIZE);

    // Load chunks within render distance (vertical: 0-7, covering y 0-127)
    const r2 = RENDER_DISTANCE * RENDER_DISTANCE;
    for (let dy = 0; dy < 8; dy++) {
      for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
        for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
          if (dx * dx + dz * dz > r2) continue;
          const cx = pcx + dx;
          const cy = dy;
          const cz = pcz + dz;
          const key = this.chunkKey(cx, cy, cz);
          if (!this.chunks.has(key)) {
            this._loadChunk(cx, cy, cz);
          }
        }
      }
    }

    // Unload distant chunks
    const u2 = UNLOAD_DISTANCE * UNLOAD_DISTANCE;
    const toUnload = [];
    for (const [key, chunk] of this.chunks) {
      const dx = chunk.cx - pcx;
      const dz = chunk.cz - pcz;
      if (dx * dx + dz * dz > u2) {
        toUnload.push(key);
      }
    }
    for (const key of toUnload) {
      const chunk = this.chunks.get(key);
      chunk.dispose(this.scene);
      this.chunks.delete(key);
    }

    // Process pending tree placements (batch per frame)
    this._processPendingTrees();

    // Rebuild dirty chunks (cap to avoid frame stalls)
    let rebuilds = 0;
    for (const [, chunk] of this.chunks) {
      if (rebuilds >= MAX_REBUILDS_PER_FRAME) break;
      if (chunk.dirty) {
        chunk.buildMesh(this.textureAtlas, this.scene);
        rebuilds++;
      }
    }
  }

  _loadChunk(cx, cy, cz) {
    const key = this.chunkKey(cx, cy, cz);
    const chunk = new Chunk(cx, cy, cz, this);
    chunk.blocks = this.generator.generateChunk(cx, cy, cz);
    this.chunks.set(key, chunk);

    // Queue tree generation for surface-level chunks
    if (cy >= 3 && cy <= 6) {
      this._pendingTrees.push({ cx, cz });
    }
  }

  _processPendingTrees() {
    if (this._pendingTrees.length === 0) return;
    const batch = this._pendingTrees.splice(0, 4);
    for (const { cx, cz } of batch) {
      this.generator.placeTrees(
        cx, cz,
        (x, y, z) => this.getBlock(x, y, z),
        (x, y, z, id) => this.setBlock(x, y, z, id)
      );
    }
  }

  getChunks() {
    return this.chunks;
  }

  dispose() {
    for (const [, chunk] of this.chunks) {
      chunk.dispose(this.scene);
    }
    this.chunks.clear();
    this._pendingTrees = [];
  }
}
