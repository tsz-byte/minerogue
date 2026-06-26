/**
 * MineRogue - Chunk
 * 16x16x16 voxel chunk with face culling, UV atlas mapping, and per-vertex AO.
 *
 * Block IDs match src/data/blocks.js definitions.
 */
import * as THREE from 'three';

const CHUNK_SIZE = 16;

// Transparent / non-solid block IDs (from blocks.js)
const TRANSPARENT_IDS = new Set([
  0,  // Air
  9,  // Oak Leaves
  11, // Birch Leaves
  13, // Spruce Leaves
  20, // Water
  23, // Glass
  26, // Ice
  28, // Glowstone
  32, // Torch
  45, // Brown Mushroom
  46, // Red Mushroom
  54, // Ladder
  56, // Tall Grass
  57, // Dandelion
  58, // Poppy
  60, // Mob Spawner
  63, // Brewing Stand
  64, // Carpet
  65, // Iron Bars
  66, // Crystal Block
]);

function isTransparent(id) {
  return TRANSPARENT_IDS.has(id);
}

// 6 faces: +X, -X, +Y, -Y, +Z, -Z
// Each face has: direction offset, normal, 4 corner vertices [x,y,z,u,v]
const FACES = [
  { // 0: +X (East)
    dir: [1, 0, 0],
    normal: [1, 0, 0],
    corners: [
      [1, 0, 0, 0, 0],
      [1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 1, 0],
    ],
  },
  { // 1: -X (West)
    dir: [-1, 0, 0],
    normal: [-1, 0, 0],
    corners: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 0, 1],
      [0, 1, 0, 1, 1],
      [0, 0, 0, 1, 0],
    ],
  },
  { // 2: +Y (Top)
    dir: [0, 1, 0],
    normal: [0, 1, 0],
    corners: [
      [0, 1, 0, 0, 0],
      [0, 1, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 0, 1, 0],
    ],
  },
  { // 3: -Y (Bottom)
    dir: [0, -1, 0],
    normal: [0, -1, 0],
    corners: [
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1],
      [1, 0, 1, 1, 0],
    ],
  },
  { // 4: +Z (South)
    dir: [0, 0, 1],
    normal: [0, 0, 1],
    corners: [
      [1, 0, 1, 0, 0],
      [1, 1, 1, 0, 1],
      [0, 1, 1, 1, 1],
      [0, 0, 1, 1, 0],
    ],
  },
  { // 5: -Z (North)
    dir: [0, 0, -1],
    normal: [0, 0, -1],
    corners: [
      [0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 0, 1, 0],
    ],
  },
];

/**
 * Map block ID → atlas tile indices [top, bottom, side].
 * Atlas tiles are defined by drawTexture() in textures.js:
 *   0=air, 1=grass_top, 2=grass_side, 3=dirt, 4=stone, 5=sand, 6=gravel,
 *   7=cobblestone, 8=oak_planks, 9=oak_log_top, 10=oak_log_side,
 *   11=birch_log, 12=spruce_log, 13=oak_leaves, 14=birch_leaves,
 *   15=spruce_leaves, 16=coal_ore, 17=iron_ore, 18=gold_ore, 19=diamond_ore,
 *   20=redstone_ore, 21=crystal_ore, 22=water, 23=lava, 24=bedrock,
 *   25=glass, 26=bricks, 27=snow, 28=ice, 29=obsidian, 30=glowstone,
 *   31=crafting_table_top, 32=crafting_table_side, 33=furnace_front,
 *   34=furnace_side, 35=chest, 36=torch, 37=bookshelf, 38=sandstone,
 *   39=clay, 40=white_wool, 41=orange_wool, 42=magenta_wool,
 *   43=light_blue_wool, 44=yellow_wool, 45=pink_wool, 46=cactus,
 *   47=pumpkin, 48=carved_pumpkin, 49=brown_mushroom, 50=red_mushroom,
 *   51=mycelium, 52=netherrack, 53=tnt, 54=hay, 55=anvil,
 *   56=enchanting_table, 57=oak_door, 58=ladder, 59=fence,
 *   60=tall_grass, 61=dandelion, 62=poppy, 63=shrine, 64=spawner,
 *   65=portal_frame, 66=bed, 67=brewing_stand, 68=carpet,
 *   69=iron_bars, 70=crystal_block, 71=void_stone
 */
function getBlockTextures(blockId) {
  const M = {
    // blockId: [top, bottom, side]
    1:  [1,  3,  2 ],  // Grass: top=grass_top, bottom=dirt, side=grass_side
    2:  [3,  3,  3 ],  // Dirt
    3:  [4,  4,  4 ],  // Stone
    4:  [5,  5,  5 ],  // Sand
    5:  [6,  6,  6 ],  // Gravel
    6:  [7,  7,  7 ],  // Cobblestone
    7:  [8,  8,  8 ],  // Oak Planks
    8:  [9,  9,  10],  // Oak Log: top/bottom=rings, side=bark
    9:  [13, 13, 13],  // Oak Leaves
    10: [9,  9,  11],  // Birch Log: top/bottom=rings, side=birch bark
    11: [14, 14, 14],  // Birch Leaves
    12: [9,  9,  12],  // Spruce Log: top/bottom=rings, side=spruce bark
    13: [15, 15, 15],  // Spruce Leaves
    14: [16, 16, 16],  // Coal Ore
    15: [17, 17, 17],  // Iron Ore
    16: [18, 18, 18],  // Gold Ore
    17: [19, 19, 19],  // Diamond Ore
    18: [20, 20, 20],  // Redstone Ore
    19: [21, 21, 21],  // Crystal Ore
    20: [22, 22, 22],  // Water
    21: [23, 23, 23],  // Lava
    22: [24, 24, 24],  // Bedrock
    23: [25, 25, 25],  // Glass
    24: [26, 26, 26],  // Bricks
    25: [27, 27, 27],  // Snow Block
    26: [28, 28, 28],  // Ice
    27: [29, 29, 29],  // Obsidian
    28: [30, 30, 30],  // Glowstone
    29: [31, 8,  32],  // Crafting Table: top=grid, bottom=planks, side=tools
    30: [34, 34, 33],  // Furnace: top/bottom=stone_side, side=furnace_front
    31: [35, 35, 35],  // Chest
    32: [36, 36, 36],  // Torch
    33: [8,  8,  37],  // Bookshelf: top/bottom=planks, side=books
    34: [38, 38, 38],  // Sandstone
    35: [39, 39, 39],  // Clay
    36: [40, 40, 40],  // White Wool
    37: [41, 41, 41],  // Orange Wool
    38: [42, 42, 42],  // Magenta Wool
    39: [43, 43, 43],  // Light Blue Wool
    40: [44, 44, 44],  // Yellow Wool
    41: [45, 45, 45],  // Pink Wool
    42: [46, 46, 46],  // Cactus
    43: [47, 47, 47],  // Pumpkin
    44: [48, 48, 48],  // Carved Pumpkin
    45: [49, 49, 49],  // Brown Mushroom
    46: [50, 50, 50],  // Red Mushroom
    47: [51, 3,  51],  // Mycelium: top/side=mycelium, bottom=dirt
    48: [52, 52, 52],  // Netherrack
    49: [53, 53, 53],  // TNT
    50: [54, 54, 54],  // Hay Bale
    51: [55, 55, 55],  // Anvil
    52: [56, 56, 56],  // Enchanting Table
    53: [57, 57, 57],  // Oak Door
    54: [58, 58, 58],  // Ladder
    55: [59, 59, 59],  // Oak Fence
    56: [60, 60, 60],  // Tall Grass
    57: [61, 61, 61],  // Dandelion
    58: [62, 62, 62],  // Poppy
    59: [63, 63, 63],  // Shrine Block
    60: [64, 64, 64],  // Mob Spawner
    61: [65, 65, 65],  // Portal Frame
    62: [66, 66, 66],  // Bed
    63: [67, 67, 67],  // Brewing Stand
    64: [68, 68, 68],  // Carpet
    65: [69, 69, 69],  // Iron Bars
    66: [70, 70, 70],  // Crystal Block
    67: [71, 71, 71],  // Void Stone
  };
  return M[blockId] || [4, 4, 4]; // fallback = stone tile
}

export class Chunk {
  constructor(cx, cy, cz, world) {
    this.cx = cx;
    this.cy = cy;
    this.cz = cz;
    this.world = world;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
    this.mesh = null;
    this.dirty = true;
  }

  _index(x, y, z) {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  /**
   * Get block ID at local coordinates (0-15).
   * If out of bounds, queries the world for the neighbor chunk.
   */
  getBlock(x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) {
      const wx = this.cx * CHUNK_SIZE + x;
      const wy = this.cy * CHUNK_SIZE + y;
      const wz = this.cz * CHUNK_SIZE + z;
      return this.world.getBlock(wx, wy, wz);
    }
    return this.blocks[this._index(x, y, z)];
  }

  setBlock(x, y, z, id) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) return;
    this.blocks[this._index(x, y, z)] = id;
    this.dirty = true;
  }

  /**
   * Check if a block at local coords is solid (opaque + not transparent).
   */
  _isSolid(x, y, z) {
    const id = this.getBlock(x, y, z);
    return id !== 0 && !isTransparent(id);
  }

  /**
   * Compute AO level for one vertex of a face.
   * side1, side2, corner are booleans (true = opaque neighbor present).
   * Returns 0-3 where 0 = darkest, 3 = fully lit.
   */
  _calcAO(side1, side2, corner) {
    const s1 = side1 ? 1 : 0;
    const s2 = side2 ? 1 : 0;
    const c = corner ? 1 : 0;
    if (s1 && s2) return 0;
    return 3 - (s1 + s2 + c);
  }

  /**
   * Compute AO values for all 4 vertices of a face at block (lx, ly, lz).
   */
  _computeFaceAO(lx, ly, lz, face) {
    const [dx, dy, dz] = face.dir;
    const ao = [0, 0, 0, 0];

    for (let v = 0; v < 4; v++) {
      const c = face.corners[v]; // [offX, offY, offZ, u, v]
      let s1x, s1y, s1z, s2x, s2y, s2z, crx, cry, crz;

      if (dx !== 0) {
        // X-facing: tangent axes are Y and Z
        const uy = c[1] === 1 ? 1 : -1;
        const uz = c[2] === 1 ? 1 : -1;
        s1x = lx;       s1y = ly + uy; s1z = lz;
        s2x = lx;       s2y = ly;      s2z = lz + uz;
        crx = lx;       cry = ly + uy; crz = lz + uz;
      } else if (dy !== 0) {
        // Y-facing: tangent axes are X and Z
        const ux = c[0] === 1 ? 1 : -1;
        const uz = c[2] === 1 ? 1 : -1;
        s1x = lx + ux;  s1y = ly;      s1z = lz;
        s2x = lx;       s2y = ly;      s2z = lz + uz;
        crx = lx + ux;  cry = ly;      crz = lz + uz;
      } else {
        // Z-facing: tangent axes are X and Y
        const ux = c[0] === 1 ? 1 : -1;
        const uy = c[1] === 1 ? 1 : -1;
        s1x = lx + ux;  s1y = ly;      s1z = lz;
        s2x = lx;       s2y = ly + uy; s2z = lz;
        crx = lx + ux;  cry = ly + uy; crz = lz;
      }

      // Offset by face normal direction
      const side1 = this._isSolid(s1x + dx, s1y + dy, s1z + dz);
      const side2 = this._isSolid(s2x + dx, s2y + dy, s2z + dz);
      const corner = this._isSolid(crx + dx, cry + dy, crz + dz);

      ao[v] = this._calcAO(side1, side2, corner);
    }

    return ao;
  }

  /**
   * Build the chunk mesh with face culling, atlas UVs, and per-vertex AO.
   * @param {THREE.Texture} textureAtlas
   * @param {THREE.Scene} scene
   */
  buildMesh(textureAtlas, scene) {
    this.dispose(scene);

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const aoValues = [];
    let vertCount = 0;

    // Transparent pass data (leaves, water, glass, etc.)
    const tPositions = [];
    const tNormals = [];
    const tUvs = [];
    const tIndices = [];
    const tAoValues = [];
    let tVertCount = 0;

    // Atlas is 16x16 tiles
    const ATLAS_SIZE = 16;
    const tileU = 1 / ATLAS_SIZE;
    const tileV = 1 / ATLAS_SIZE;

    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          const blockId = this.blocks[this._index(lx, ly, lz)];
          if (blockId === 0) continue;

          const isBlockTransparent = isTransparent(blockId);
          const texMap = getBlockTextures(blockId);

          // Choose which buffer set to write into
          const pPos = isBlockTransparent ? tPositions : positions;
          const pNorm = isBlockTransparent ? tNormals : normals;
          const pUv = isBlockTransparent ? tUvs : uvs;
          const pIdx = isBlockTransparent ? tIndices : indices;
          const pAo = isBlockTransparent ? tAoValues : aoValues;
          const pVert = isBlockTransparent ? tVertCount : vertCount;

          for (let f = 0; f < 6; f++) {
            const face = FACES[f];
            const nx = lx + face.dir[0];
            const ny = ly + face.dir[1];
            const nz = lz + face.dir[2];

            const neighborId = this.getBlock(nx, ny, nz);

            // For opaque blocks: only show face if neighbor is transparent
            // For transparent blocks: only show face if neighbor is air OR different block
            if (!isBlockTransparent) {
              if (!isTransparent(neighborId)) continue;
            } else {
              // Transparent block: show face if neighbor is air or a different block type
              if (neighborId === blockId) continue; // same type = hide (e.g. leaf-to-leaf)
              if (!isTransparent(neighborId) && neighborId !== 0) continue; // opaque neighbor = hide face
            }

            // Select tile index: top=0, bottom=1, side=2
            let tileIdx;
            if (f === 2) tileIdx = texMap[0];      // +Y top
            else if (f === 3) tileIdx = texMap[1];  // -Y bottom
            else tileIdx = texMap[2];                // sides

            const tileCol = tileIdx % ATLAS_SIZE;
            const tileRow = Math.floor(tileIdx / ATLAS_SIZE);

            // Compute per-vertex AO
            const ao = this._computeFaceAO(lx, ly, lz, face);

            // Diagonal flip for better AO interpolation
            const doFlip = (ao[0] + ao[2]) < (ao[1] + ao[3]);

            const base = pVert + (isBlockTransparent ? tVertCount : vertCount) - (isBlockTransparent ? tVertCount : vertCount);

            // Emit 4 vertices
            for (let v = 0; v < 4; v++) {
              const c = face.corners[v];
              const px = this.cx * CHUNK_SIZE + lx + c[0];
              const py = this.cy * CHUNK_SIZE + ly + c[1];
              const pz = this.cz * CHUNK_SIZE + lz + c[2];
              pPos.push(px, py, pz);
              pNorm.push(face.normal[0], face.normal[1], face.normal[2]);

              // UV within tile, mapped to atlas position
              const cu = (tileCol + c[3]) * tileU;
              const cv = 1 - (tileRow + 1 - c[4]) * tileV;
              pUv.push(cu, cv);

              pAo.push(ao[v] / 3.0);
            }

            // Two triangles per face (quad)
            const vBase = isBlockTransparent ? tVertCount : vertCount;
            if (doFlip) {
              pIdx.push(vBase, vBase + 1, vBase + 3);
              pIdx.push(vBase + 1, vBase + 2, vBase + 3);
            } else {
              pIdx.push(vBase, vBase + 1, vBase + 2);
              pIdx.push(vBase + 2, vBase + 3, vBase);
            }

            if (isBlockTransparent) tVertCount += 4; else vertCount += 4;
          }
        }
      }
    }

    // Opaque mesh
    if (vertCount > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setAttribute('ao', new THREE.Float32BufferAttribute(aoValues, 1));
      geometry.setIndex(indices);

      const material = new THREE.MeshLambertMaterial({
        map: textureAtlas,
      });

      material.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>\nattribute float ao;\nvarying float vAo;`
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>\nvAo = ao;`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>\nvarying float vAo;`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `gl_FragColor.rgb *= vAo;\n#include <dithering_fragment>`
        );
      };

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.matrixAutoUpdate = false;
      this.mesh.updateMatrix();

      const min = new THREE.Vector3(
        this.cx * CHUNK_SIZE, this.cy * CHUNK_SIZE, this.cz * CHUNK_SIZE
      );
      const max = new THREE.Vector3(
        this.cx * CHUNK_SIZE + CHUNK_SIZE, this.cy * CHUNK_SIZE + CHUNK_SIZE, this.cz * CHUNK_SIZE + CHUNK_SIZE
      );
      geometry.boundingBox = new THREE.Box3(min, max);
      geometry.boundingSphere = new THREE.Sphere();
      geometry.boundingBox.getBoundingSphere(geometry.boundingSphere);
      this.mesh.frustumCulled = true;

      scene.add(this.mesh);
    }

    // Transparent mesh (leaves, water, glass, etc.)
    if (tVertCount > 0) {
      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute('position', new THREE.Float32BufferAttribute(tPositions, 3));
      tGeo.setAttribute('normal', new THREE.Float32BufferAttribute(tNormals, 3));
      tGeo.setAttribute('uv', new THREE.Float32BufferAttribute(tUvs, 2));
      tGeo.setAttribute('ao', new THREE.Float32BufferAttribute(tAoValues, 1));
      tGeo.setIndex(tIndices);

      const tMat = new THREE.MeshLambertMaterial({
        map: textureAtlas,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
        alphaTest: 0.1,
      });

      this.transparentMesh = new THREE.Mesh(tGeo, tMat);
      this.transparentMesh.matrixAutoUpdate = false;
      this.transparentMesh.updateMatrix();

      const min = new THREE.Vector3(
        this.cx * CHUNK_SIZE, this.cy * CHUNK_SIZE, this.cz * CHUNK_SIZE
      );
      const max = new THREE.Vector3(
        this.cx * CHUNK_SIZE + CHUNK_SIZE, this.cy * CHUNK_SIZE + CHUNK_SIZE, this.cz * CHUNK_SIZE + CHUNK_SIZE
      );
      tGeo.boundingBox = new THREE.Box3(min, max);
      tGeo.boundingSphere = new THREE.Sphere();
      tGeo.boundingBox.getBoundingSphere(tGeo.boundingSphere);
      this.transparentMesh.frustumCulled = true;

      scene.add(this.transparentMesh);
    }

    this.dirty = false;
  }

  /**
   * Remove mesh from scene and dispose GPU resources.
   */
  dispose(scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
      this.mesh = null;
    }
    if (this.transparentMesh) {
      scene.remove(this.transparentMesh);
      if (this.transparentMesh.geometry) this.transparentMesh.geometry.dispose();
      if (this.transparentMesh.material) this.transparentMesh.material.dispose();
      this.transparentMesh = null;
    }
  }
}
