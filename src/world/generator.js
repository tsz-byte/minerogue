/**
 * MineRogue - World Generator
 * Procedural terrain generation with biomes, caves, ores, trees, and structures.
 * Block IDs match src/data/blocks.js definitions.
 *
 * Block ID reference (from blocks.js):
 *   0=Air, 1=Grass, 2=Dirt, 3=Stone, 4=Sand, 5=Gravel, 6=Cobblestone,
 *   7=Oak Planks, 8=Oak Log, 9=Oak Leaves, 10=Birch Log, 11=Birch Leaves,
 *   12=Spruce Log, 13=Spruce Leaves, 14=Coal Ore, 15=Iron Ore, 16=Gold Ore,
 *   17=Diamond Ore, 18=Redstone Ore, 19=Crystal Ore, 20=Water, 21=Lava,
 *   22=Bedrock, 23=Glass, 24=Bricks, 25=Snow Block, 26=Ice, 27=Obsidian,
 *   28=Glowstone, 29=Crafting Table, 30=Furnace, 31=Chest, 32=Torch,
 *   33=Bookshelf, 34=Sandstone, 35=Clay, 42=Cactus, 59=Shrine Block,
 *   60=Mob Spawner, 61=Portal Frame, 66=Crystal Block, 67=Void Stone
 */
import { createNoise2D, createNoise3D } from 'simplex-noise';

// Simple seeded PRNG (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Biome definitions — surfaceBlock, fillBlock use IDs from blocks.js
const BIOMES = {
  plains:          { name: 'plains',          temp: 0.5, moisture: 0.5, surfaceBlock: 1,  fillBlock: 2,  treeChance: 0.005, treeType: 'oak' },
  forest:          { name: 'forest',          temp: 0.5, moisture: 0.7, surfaceBlock: 1,  fillBlock: 2,  treeChance: 0.04,  treeType: 'oak' },
  desert:          { name: 'desert',          temp: 0.9, moisture: 0.1, surfaceBlock: 4,  fillBlock: 4,  treeChance: 0.001, treeType: 'cactus' },
  snow:            { name: 'snow',            temp: 0.1, moisture: 0.4, surfaceBlock: 25, fillBlock: 2,  treeChance: 0.015, treeType: 'spruce' },
  swamp:           { name: 'swamp',           temp: 0.6, moisture: 0.9, surfaceBlock: 1,  fillBlock: 2,  treeChance: 0.02,  treeType: 'oak' },
  mountains:       { name: 'mountains',       temp: 0.3, moisture: 0.3, surfaceBlock: 3,  fillBlock: 3,  treeChance: 0.008, treeType: 'spruce' },
  crystal_caverns: { name: 'crystal_caverns', temp: 0.4, moisture: 0.6, surfaceBlock: 1,  fillBlock: 3,  treeChance: 0.005, treeType: 'birch' },
  corruption:      { name: 'corruption',      temp: 0.7, moisture: 0.2, surfaceBlock: 67, fillBlock: 67, treeChance: 0.01,  treeType: 'none' },
  floating_islands:{ name: 'floating_islands',temp: 0.5, moisture: 0.5, surfaceBlock: 1,  fillBlock: 2,  treeChance: 0.03,  treeType: 'birch' },
  volcanic:        { name: 'volcanic',        temp: 1.0, moisture: 0.1, surfaceBlock: 3,  fillBlock: 6,  treeChance: 0,     treeType: 'none' },
};

// Ore definitions: block IDs from blocks.js
const ORES = [
  { id: 14, minY: 0, maxY: 80, veinSize: 8, rarity: 0.02 },   // Coal Ore
  { id: 15, minY: 0, maxY: 64, veinSize: 6, rarity: 0.015 },  // Iron Ore
  { id: 16, minY: 0, maxY: 48, veinSize: 5, rarity: 0.008 },  // Gold Ore
  { id: 17, minY: 0, maxY: 32, veinSize: 4, rarity: 0.004 },  // Diamond Ore
  { id: 18, minY: 0, maxY: 40, veinSize: 5, rarity: 0.01 },   // Redstone Ore
  { id: 19, minY: 0, maxY: 48, veinSize: 3, rarity: 0.006 },  // Crystal Ore
];

const CHUNK_SIZE = 16;

export class WorldGenerator {
  constructor(seed = 42) {
    this.seed = seed;
    const prng = mulberry32(seed);
    this.noise2D = createNoise2D(prng);
    const prng2 = mulberry32(seed + 1000);
    this.noise3D = createNoise3D(prng2);
    const prng3 = mulberry32(seed + 2000);
    this.biomeNoise2D = createNoise2D(prng3);
    const prng4 = mulberry32(seed + 3000);
    this.moistureNoise = createNoise2D(prng4);
    const prng5 = mulberry32(seed + 4000);
    this.tempNoise = createNoise2D(prng5);
  }

  /**
   * Get terrain height at world (x, z) using 4-octave noise.
   */
  getHeight(x, z) {
    let height = 48;
    for (let i = 0; i < 4; i++) {
      const freq = 0.005 * Math.pow(2, i);
      const amp = Math.pow(0.5, i);
      height += amp * this.noise2D(x * freq, z * freq) * 20;
    }
    return Math.floor(height);
  }

  /**
   * Get biome at world (x, z) based on temperature/moisture noise.
   */
  getBiome(x, z) {
    const temp = (this.tempNoise(x * 0.003, z * 0.003) + 1) * 0.5;
    const moisture = (this.moistureNoise(x * 0.004, z * 0.004) + 1) * 0.5;

    let bestBiome = BIOMES.plains;
    let bestDist = Infinity;

    for (const key of Object.keys(BIOMES)) {
      const biome = BIOMES[key];
      const dt = biome.temp - temp;
      const dm = biome.moisture - moisture;
      const dist = dt * dt + dm * dm;
      if (dist < bestDist) {
        bestDist = dist;
        bestBiome = biome;
      }
    }

    return bestBiome;
  }

  /**
   * Generate a full chunk of block IDs.
   * @returns {Uint8Array} 4096 bytes of block IDs
   */
  generateChunk(cx, cy, cz) {
    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);

    const worldX0 = cx * CHUNK_SIZE;
    const worldY0 = cy * CHUNK_SIZE;
    const worldZ0 = cz * CHUNK_SIZE;

    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      const wy = worldY0 + ly;
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wz = worldZ0 + lz;
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          const wx = worldX0 + lx;
          const idx = ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;

          const height = this.getHeight(wx, wz);
          const biome = this.getBiome(wx, wz);
          let blockId = 0;

          // Bedrock layer (y 0-1)
          if (wy <= 1) {
            blockId = 22; // Bedrock
          }
          // Deep stone / underground (y 2 to height-1)
          else if (wy < height) {
            blockId = 3; // Stone (generic underground filler)
          }
          // Surface block (y === height)
          else if (wy === height) {
            blockId = biome.surfaceBlock;
          }
          // One layer of fill below surface in certain biomes
          else if (wy === height - 1 && biome.fillBlock !== 3) {
            blockId = biome.fillBlock;
          }
          // Above surface: air
          else {
            blockId = 0;
          }

          // 3D cave carving (y 2-99, only in stone regions)
          if (wy > 1 && wy < 100 && blockId === 3) {
            const caveNoise = this.noise3D(wx * 0.05, wy * 0.07, wz * 0.05);
            if (caveNoise > 0.35) {
              blockId = 0; // carve caves
            }
          }

          // Ore generation (only in stone)
          if (blockId === 3) {
            for (const ore of ORES) {
              if (wy >= ore.minY && wy <= ore.maxY) {
                const oreNoise = this.noise3D(
                  (wx + ore.id * 100) * 0.15,
                  (wy + ore.id * 50) * 0.15,
                  (wz + ore.id * 200) * 0.15
                );
                if (oreNoise > (1 - ore.rarity * 10)) {
                  blockId = ore.id;
                  break;
                }
              }
            }
          }

          // Crystal Caverns biome: replace some stone with Crystal Ore
          if (biome.name === 'crystal_caverns' && blockId === 3 && wy < 50) {
            const crystalNoise = this.noise3D(wx * 0.1, wy * 0.1, wz * 0.1);
            if (crystalNoise > 0.6) {
              blockId = 19; // Crystal Ore
            }
          }

          // Corruption biome: replace underground blocks with Void Stone
          if (biome.name === 'corruption' && blockId === 3 && wy < 64) {
            const corruptNoise = this.noise3D(wx * 0.08, wy * 0.08, wz * 0.08);
            if (corruptNoise > 0.5) {
              blockId = 67; // Void Stone
            }
          }

          // Volcanic biome: lava pools at low Y in caves
          if (biome.name === 'volcanic' && wy < 30 && blockId === 0) {
            blockId = 21; // Lava
          }

          // Floating Islands biome: generate floating platforms
          if (biome.name === 'floating_islands') {
            const islandNoise = this.noise3D(wx * 0.02, wy * 0.04, wz * 0.02);
            if (wy > 80 && wy < 110 && islandNoise > 0.3 && blockId === 0) {
              const islandTop = 90 + Math.floor(islandNoise * 10);
              if (wy < islandTop) {
                blockId = 2; // Dirt
                if (wy === islandTop - 1) {
                  blockId = 1; // Grass on top
                }
              }
            }
          }

          // Water: fill only surface-level air in swamp biome (1-2 blocks deep)
          if (biome.name === 'swamp' && blockId === 0 && wy >= height - 2 && wy <= height) {
              blockId = 20; // Water
          }

          blocks[idx] = blockId;
        }
      }
    }

    return blocks;
  }

  /**
   * Post-generation pass for trees. Call after chunk data is loaded.
   */
  placeTrees(cx, cz, getBlock, setBlock) {
    const worldX0 = cx * CHUNK_SIZE;
    const worldZ0 = cz * CHUNK_SIZE;
    const biome = this.getBiome(worldX0 + 8, worldZ0 + 8);

    if (biome.treeChance <= 0 || biome.treeType === 'none') return;

    const rng = mulberry32(this.seed + cx * 31337 + cz * 7919 + 999);

    for (let lx = 2; lx < CHUNK_SIZE - 2; lx++) {
      for (let lz = 2; lz < CHUNK_SIZE - 2; lz++) {
        if (rng() > biome.treeChance) continue;

        const wx = worldX0 + lx;
        const wz = worldZ0 + lz;
        const height = this.getHeight(wx, wz);
        const wy = Math.floor(height);

        // Only place on surface where air is above
        if (wy < 60 || wy > 110) continue;
        const above = getBlock(wx, wy + 1, wz);
        if (above !== 0) continue;

        this._placeTree(wx, wy + 1, wz, biome.treeType, getBlock, setBlock);
      }
    }
  }

  _placeTree(x, y, z, type, getBlock, setBlock) {
    let trunkHeight, trunkBlock, leafBlock;

    switch (type) {
      case 'oak':
        trunkHeight = 4 + Math.floor(Math.abs(this.noise2D(x * 0.5, z * 0.5)) * 2);
        trunkBlock = 8;  // Oak Log
        leafBlock = 9;   // Oak Leaves
        break;
      case 'birch':
        trunkHeight = 5 + Math.floor(Math.abs(this.noise2D(x * 0.5, z * 0.5)) * 2);
        trunkBlock = 10; // Birch Log
        leafBlock = 11;  // Birch Leaves
        break;
      case 'spruce':
        trunkHeight = 6 + Math.floor(Math.abs(this.noise2D(x * 0.5, z * 0.5)) * 2);
        trunkBlock = 12; // Spruce Log
        leafBlock = 13;  // Spruce Leaves
        break;
      case 'cactus':
        trunkHeight = 2 + Math.floor(Math.abs(this.noise2D(x * 0.5, z * 0.5)) * 2);
        trunkBlock = 42; // Cactus
        leafBlock = 0;
        break;
      default:
        return;
    }

    // Trunk
    for (let i = 0; i < trunkHeight; i++) {
      setBlock(x, y + i, z, trunkBlock);
    }

    if (leafBlock === 0) return;

    // Leaves (sphere-ish canopy)
    const leafStart = y + trunkHeight - 2;
    const leafEnd = y + trunkHeight + 2;
    for (let ly = leafStart; ly <= leafEnd; ly++) {
      const radius = (ly < y + trunkHeight) ? 2 : 1;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (dx === 0 && dz === 0 && ly < y + trunkHeight) continue; // trunk pos
          if (Math.abs(dx) === radius && Math.abs(dz) === radius) {
            if (Math.abs(this.noise2D((x + dx) * 0.3, (z + dz) * 0.3)) > 0.5) continue;
          }
          const existing = getBlock(x + dx, ly, z + dz);
          if (existing === 0) {
            setBlock(x + dx, ly, z + dz, leafBlock);
          }
        }
      }
    }
  }
}
