# MINE ROGUE — Ultimate Comprehensive Build Prompt
## The Definitive Voxel Roguelike: Minecraft Meets Hades Meets Spelunky

---

> **READ THIS ENTIRE DOCUMENT BEFORE WRITING A SINGLE LINE OF CODE.**
> This is the complete specification for MineRogue — a browser-based 3D voxel roguelike that combines the crafting/sandbox joy of Minecraft with the tight roguelike loop of Hades, the procedural wonder of Spelunky, and the combat satisfaction of Dark Souls. Every system described here is mandatory. No stubs. No TODOs. Ship-ready code.

---

## TABLE OF CONTENTS

1. [Vision & Pillars](#1-vision--pillars)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Project Structure](#3-project-structure)
4. [Core Engine Systems](#4-core-engine-systems)
5. [Voxel World Engine](#5-voxel-world-engine)
6. [Procedural World Generation](#6-procedural-world-generation)
7. [Biome System](#7-biome-system)
8. [Player System](#8-player-system)
9. [Combat System](#9-combat-system)
10. [Mob & AI System](#10-mob--ai-system)
11. [Boss System](#11-boss-system)
12. [Inventory & Items](#12-inventory--items)
13. [Crafting System](#13-crafting-system)
14. [Roguelike Core Loop](#14-roguelike-core-loop)
15. [Meta-Progression: Soul Shop](#15-meta-progression-soul-shop)
16. [Dungeon & Structure Generation](#16-dungeon--structure-generation)
17. [Day/Night Cycle & Atmosphere](#17-daynight-cycle--atmosphere)
18. [Particle & VFX System](#18-particle--vfx-system)
19. [Audio Engine](#19-audio-engine)
20. [UI/HUD System](#20-uihud-system)
21. [Save System](#21-save-system)
22. [Performance & Optimization](#22-performance--optimization)
23. [Controls & Input](#23-controls--input)
24. [Mod & Modifier System](#24-mod--modifier-system)
25. [Achievement & Unlock System](#25-achievement--unlock-system)
26. [NPC & Dialog System](#26-npc--dialog-system)
27. [Enchanting & Alchemy](#27-enchanting--alchemy)
28. [Visual Polish & Game Feel](#28-visual-polish--game-feel)
29. [Asset Manifest](#29-asset-manifest)
30. [Implementation Order](#30-implementation-order)

---

## 1. VISION & PILLARS

### What Is MineRogue?
A **single-file-friendly, browser-based 3D voxel roguelike** built with Three.js. Each run drops you into a procedurally generated voxel world with biomes, caves, dungeons, and bosses. You mine, craft, fight, die, earn Soul Shards, upgrade in the persistent Soul Shop, and dive back in. Every run is different. Every death teaches you something. Every upgrade makes you hungry for more.

### Five Design Pillars

1. **DIGITAL LEGO SANDBOX** — Every block is breakable, placeable, and has purpose. The world is your toolkit. Build bridges, walls, fortifications. Terraform your advantage.

2. **ROGUELIKE SOUL** — Permadeath with meaning. Each run has unique modifiers, procedural layouts, and escalating challenge. Death is not failure — it's fuel for progression.

3. **COMBAT THAT CRUNCHS** — Hitstop on crits. Screen shake on explosions. Damage numbers that float and pop. Every hit should feel like it connects. Frame-perfect dodge windows. Parry timing. Attack commitment.

4. **DISCOVERY DOPAMINE** — Hidden shrines. Secret rooms. Rare ores glinting in dark caves. Legendary items with unique effects. Biome transitions that take your breath away. "Just one more room."

5. **PROGRESSION ADDICTION** — Soul Shards earned on every run. A meta-shop with 20+ upgrades that meaningfully change gameplay. Unlock new biomes, new bosses, new starting gear. The first run is tutorial. The 50th run is mastery.

---

## 2. TECH STACK & ARCHITECTURE

### Core Stack
```
Three.js r170+     — 3D rendering (WebGL2, falling back to WebGL1)
simplex-noise v4+  — Procedural noise (2D, 3D, 4D)
Vite 6+            — Dev server + bundler
```

### Architecture Pattern
```
ECS-Lite (Entity-Component inspired, not full ECS)
├── Game (state machine, game loop, orchestration)
├── Engine (renderer, input, audio, particles)
├── World (chunks, generator, biomes, structures)
├── Entities (player, mobs, projectiles, items)
├── Systems (combat, inventory, crafting, roguelike, daynight)
├── UI (HUD, menus, minimap, dialogs)
└── Data (blocks, items, mobs, recipes, upgrades)
```

### Rendering Pipeline
```
Scene Graph (Three.js)
├── Terrain Meshes (per-chunk BufferGeometry with greedy meshing + AO)
├── Transparent Pass (water, glass, leaves — sorted back-to-front)
├── Entity Meshes (InstancedMesh for mobs, individual for bosses)
├── Particle Systems (point sprites, billboard quads)
├── UI Overlay (HTML/CSS on top of canvas)
└── Post-Processing (optional: bloom for lava/glowstone, fog)
```

### Frame Budget (60 FPS = 16.6ms)
```
Chunk mesh rebuild:  max 2 per frame (~3ms each)
Mob AI update:       max 8 per frame (~0.5ms each)
Particle update:     all active (~1ms)
Physics/collision:   player + nearby mobs (~2ms)
Render:              terrain + entities + particles (~6ms)
UI update:           HUD, minimap (~1ms)
TOTAL TARGET:        <14ms (leaving headroom)
```

---

## 3. PROJECT STRUCTURE

```
minerogue/
├── index.html                  # Full HTML shell (menus, HUD, overlays)
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
├── assets/
│   ├── textures/
│   │   ├── block_atlas.png     # 16x16 tile atlas (16×16 grid = 256 tiles)
│   │   └── biome_atlas.png     # Additional biome-specific textures
│   ├── sprites/
│   │   ├── item_atlas.png      # Item icons (tools, weapons, food, materials)
│   │   ├── mob_atlas.png       # Mob sprites/textures
│   │   └── boss_atlas.png      # Boss textures
│   └── ui/
│       └── ui_atlas.png        # UI elements (hearts, icons, frames)
├── src/
│   ├── main.js                 # Game class, state machine, game loop
│   ├── engine/
│   │   ├── renderer.js         # Three.js renderer, camera, scene, fog, lighting
│   │   └── input.js            # Keyboard, mouse, pointer lock, scroll
│   ├── world/
│   │   ├── world.js            # Chunk manager, block access, dirty tracking
│   │   ├── chunk.js            # 16³ chunk, greedy meshing, AO, UV mapping
│   │   ├── generator.js        # Terrain gen, biomes, caves, ores, trees
│   │   └── structures.js       # Villages, temples, ruins, dungeon placement
│   ├── entities/
│   │   ├── player.js           # Player controller, physics, mining, placing
│   │   ├── mob-manager.js      # Mob spawning, pooling, lifecycle
│   │   ├── mob.js              # Individual mob entity, AI state machine
│   │   └── projectile.js       # Arrows, fireballs, potions
│   ├── systems/
│   │   ├── combat.js           # Damage calc, crits, hitstop, knockback
│   │   ├── inventory.js        # Slot management, stacking, armor slots
│   │   ├── crafting.js         # Recipe matching, 2×2 and 3×3 grids
│   │   ├── furnace.js          # Smelting with fuel consumption
│   │   ├── roguelike.js        # Run management, modifiers, shard calc
│   │   ├── daynight.js         # Sun/moon cycle, lighting changes, mob spawns
│   │   ├── home-world.js       # Persistent home base between runs
│   │   ├── dungeon.js          # Multi-floor dungeon generation
│   │   ├── shrines.js          # Shrine effects and blessings
│   │   └── save.js             # LocalStorage save/load
│   ├── audio/
│   │   └── engine.js           # Web Audio API, procedural sounds
│   ├── particles.js            # Particle system (block break, damage, ambient)
│   ├── textures.js             # Texture atlas generation (procedural + loaded)
│   ├── ui/
│   │   ├── hud.js              # Hearts, hunger, hotbar, status effects
│   │   ├── menus.js            # Main menu, death, pause, shop, inventory
│   │   └── minimap.js          # Top-down minimap with chunk sampling
│   └── data/
│       ├── blocks.js           # All block definitions (68+ types)
│       ├── items.js            # All item definitions (120+ items)
│       ├── mobs.js             # All mob definitions (22+ types)
│       └── recipes.js          # Crafting + smelting recipes (50+)
```

---

## 4. CORE ENGINE SYSTEMS

### 4.1 Game State Machine
```
States: MENU → PLAYING ↔ PAUSED
              ↓              ↑
           INVENTORY / CRAFTING_TABLE / FURNACE / SHOP / NPC_DIALOG
              ↓
            DEAD → (earn shards) → MENU or PLAYING
              ↓
           HOME (persistent base world between runs)
```

**Transitions:**
- `MENU → PLAYING`: Press "Play" → generate new run with seed + modifiers
- `PLAYING → PAUSED`: ESC key → show pause overlay with stats
- `PLAYING → INVENTORY`: E key → show inventory grid + 2×2 crafting
- `PLAYING → CRAFTING_TABLE`: Interact with crafting table block → 3×3 grid
- `PLAYING → FURNACE`: Interact with furnace block → input/fuel/output slots
- `PLAYING → SHOP`: Interact with shop NPC or from main menu
- `PLAYING → DEAD`: Health ≤ 0 → calculate shards, show death stats
- `MENU → HOME`: Press "Home World" → load persistent base

### 4.2 Game Loop
```javascript
gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min((time - lastTime) / 1000, 0.1); // cap at 100ms
  lastTime = time;

  handleInput(dt);
  
  // Time scale (hitstop/slowmo)
  const scaledDt = dt * timeScale;
  
  update(scaledDt);
  render();
}
```

### 4.3 Time Scale System
- **Hitstop**: On critical hits → `timeScale = 0.01` for 50-100ms. Everything freezes except the impact particle burst.
- **Slowmo**: On boss kills, near-death saves → `timeScale = 0.3` for 500ms. Dramatic moments.
- **Normal**: `timeScale = 1.0`

### 4.4 Screen Shake
```javascript
applyScreenShake(intensity) {
  // Each frame: camera.position += randomOffset * shakeIntensity
  // shakeIntensity *= 0.9 decay per frame
  // Sources: explosions (0.5), crits (0.15), boss attacks (0.3), TNT (0.8)
}
```

---

## 5. VOXEL WORLD ENGINE

### 5.1 Chunk System
- **Chunk size**: 16×16×16 blocks
- **World height**: 128 blocks (8 vertical chunks, Y=0 to Y=127)
- **Render distance**: 8 chunks (128 blocks) — spherical check
- **Unload distance**: 10 chunks — cleanup beyond render + buffer
- **Max mesh rebuilds per frame**: 2 (prevents frame spikes)
- **Chunk storage**: `Map<string, Chunk>` keyed by `"cx,cy,cz"`

### 5.2 Block Storage
Each chunk stores blocks as `Uint8Array(4096)` — one byte per block (256 block types max).
Index formula: `y * 256 + z * 16 + x`

### 5.3 Mesh Generation (Naive Face Culling + AO)
For each non-air, non-transparent block:
- Check 6 neighbors → only emit face if neighbor is transparent
- For each face vertex → compute ambient occlusion (AO) by checking 3 neighbors (side1, side2, corner)
- AO levels: 0 (fully occluded, darkest) to 3 (no occlusion, brightest)
- Flip quad diagonal based on AO to fix interpolation artifacts
- UV mapping: each block type maps to atlas tile indices [top, bottom, side]

**BufferGeometry attributes:**
- `position` (Float32, vec3) — world-space vertex positions
- `normal` (Float32, vec3) — face normals
- `uv` (Float32, vec2) — texture atlas UVs
- `ao` (Float32, float) — per-vertex AO (0.0 to 1.0)
- `index` (Uint32) — triangle indices

### 5.4 Transparent Block Rendering
Transparent blocks (water, glass, leaves) are stored in the same chunk but rendered with:
- Separate mesh with `transparent: true` material
- Alpha blending: `material.alphaTest = 0.1` for leaves, `material.opacity = 0.7` for water
- Back-face rendering: `material.side = THREE.DoubleSide` for water surface
- Sorted separately if needed (water planes rendered after opaque terrain)

### 5.5 Block Interaction
- **Raycasting**: From camera position along look direction, step through voxels (DDA algorithm, max 6 blocks)
- **Mining**: Hold LMB → accumulate progress based on tool + block hardness → break block → spawn drop item
- **Placing**: RMB → place held block on the face of targeted block (collision check with player)
- **Interacting**: RMB on interactable block (crafting table, furnace, chest) → open corresponding UI

### 5.6 Texture Atlas Layout
16×16 grid of 16×16 pixel tiles = 256×256 pixel atlas.
Each tile indexed 0-255 (left-to-right, top-to-bottom).

```
Tile mapping (BLOCK_TEXTURES):
  0: grass_top    1: stone        2: dirt         3: grass_side
  4: cobblestone  5: oak_plank    6: oak_bark     7: bedrock
  8: water        9: glass        10: sand        11: gravel
  12: gold_ore    13: iron_ore    14: coal_ore    15: oak_leaves
  16: diamond_ore 17: redstone    18: emerald     19: crystal
  20: snow        21: ice         22: brick       23: mossy_cobble
  24: obsidian    25: corruption  26: lava        27: portal_frame
  28: birch_plank 29: birch_bark  30: spruce_plank 31: spruce_bark
  32: sandstone   33: spawner     34: shrine      35: chest
  36: crafting_tbl 37: furnace    38: torch       39: door
  40: ladder      41: fence       42: tall_grass  43: flower
  44: cactus      45: pumpkin     46: melon       47: mycelium
  48: netherrack  49: glowstone   50: soul_sand   51: end_stone
  52: prismarine  53: coral       54: magma       55: bamboo
  56: cherry_leaf 57: wool_white  58: wool_color  59: carpet
  60: iron_bars   61: anvil       62: enchant_tbl 63: brewing
```

Block types map to tile triplets `[top, bottom, side]`:
```javascript
const BLOCK_TEXTURES = {
  1: [1, 1, 1],         // stone
  2: [0, 2, 3],         // grass (green top, dirt bottom, grass_side)
  3: [2, 2, 2],         // dirt
  // ... etc for all 68+ blocks
};
```

---

## 6. PROCEDURAL WORLD GENERATION

### 6.1 Noise Configuration
Use **simplex-noise** library with seeded PRNG (mulberry32):
```javascript
const prng = mulberry32(seed);
const noise2D = createNoise2D(prng);       // terrain height
const noise3D = createNoise3D(prng2);      // caves, ores
const biomeNoise = createNoise2D(prng3);   // biome temperature
const moistureNoise = createNoise2D(prng4); // biome moisture
```

### 6.2 Terrain Height Map
4-octave simplex noise for natural-looking terrain:
```javascript
getHeight(x, z) {
  let height = 48; // base sea level
  for (let i = 0; i < 4; i++) {
    const freq = 0.005 * Math.pow(2, i);  // 0.005, 0.01, 0.02, 0.04
    const amp = Math.pow(0.5, i);          // 1.0, 0.5, 0.25, 0.125
    height += amp * noise2D(x * freq, z * freq) * 20;
  }
  return Math.floor(height);
}
```
- Base height: 48 blocks
- Amplitude: ±20 blocks per octave (max variation ~±40)
- Low frequency = continental shapes, high frequency = local hills

### 6.3 Biome Distribution (Whittaker-style)
Temperature and moisture noise maps determine biome:
```javascript
getBiome(x, z) {
  const temp = (tempNoise(x * 0.003, z * 0.003) + 1) * 0.5;    // 0-1
  const moisture = (moistureNoise(x * 0.004, z * 0.004) + 1) * 0.5; // 0-1
  // Find closest biome in temp/moisture space
  return closestBiome(temp, moisture);
}
```

### 6.4 Cave Generation (3D Simplex Worms)
```javascript
// 3D noise caves — smooth, organic tunnels
if (wy > 1 && wy < 100) {
  const cave = noise3D(wx * 0.05, wy * 0.07, wz * 0.05);
  if (cave > 0.35) blockId = 0; // carve air
}

// Swiss cheese caves (small pockets)
const cheese = noise3D(wx * 0.1, wy * 0.1, wz * 0.1);
if (cheese > 0.6 && wy < 40) blockId = 0;

// Ravines (long vertical cracks)
const ravine = noise3D(wx * 0.02, wy * 0.01, wz * 0.02);
if (Math.abs(ravine) < 0.03 && wy > 10 && wy < 60) blockId = 0;
```

### 6.5 Ore Vein Generation
Each ore type has specific depth range, vein size, and rarity:
```javascript
const ORES = [
  { id: 14, minY: 5,  maxY: 80, veinSize: 10, rarity: 0.02 },  // coal (common, shallow)
  { id: 13, minY: 5,  maxY: 64, veinSize: 8,  rarity: 0.015 }, // iron
  { id: 12, minY: 5,  maxY: 48, veinSize: 6,  rarity: 0.008 }, // gold
  { id: 17, minY: 5,  maxY: 40, veinSize: 5,  rarity: 0.01 },  // redstone
  { id: 16, minY: 5,  maxY: 32, veinSize: 4,  rarity: 0.004 }, // diamond (rare, deep)
  { id: 19, minY: 5,  maxY: 24, veinSize: 3,  rarity: 0.003 }, // crystal (very rare)
];
```
Use 3D noise with ore-specific offsets to create clustered veins, not random scatter.

### 6.6 Tree Generation
Post-generation pass after all chunks in area are loaded:
```javascript
placeTrees(cx, cz, getBlock, setBlock) {
  const biome = getBiome(cx * 16 + 8, cz * 16 + 8);
  const rng = mulberry32(seed + cx * 31337 + cz * 7919);
  
  for each (lx, lz in chunk) {
    if (rng() > biome.treeChance) continue;
    // Check surface is valid (grass, no block above)
    placeTree(wx, surfaceY + 1, wz, biome.treeType);
  }
}
```

**Tree types:**
- **Oak**: 4-6 trunk, spherical leaf canopy (radius 2), corners randomly cut
- **Birch**: 5-7 trunk, thinner canopy
- **Spruce**: 6-8 trunk, cone-shaped leaves (wider at bottom)
- **Cactus**: 2-4 trunk, no leaves (desert biome)
- **Cherry**: 5-6 trunk, pink leaf canopy (cherry blossom biome)

### 6.7 Structure Generation
Structures placed during chunk generation using deterministic RNG:
```javascript
const STRUCTURES = [
  { type: 'village',    rarity: 0.02, biomes: ['plains', 'forest'] },
  { type: 'temple',     rarity: 0.005, biomes: ['desert', 'snow'] },
  { type: 'ruin',       rarity: 0.01, biomes: ['*'] },
  { type: 'well',       rarity: 0.008, biomes: ['plains'] },
  { type: 'mine_shaft', rarity: 0.01, biomes: ['*'], underground: true },
  { type: 'dungeon',    rarity: 0.015, biomes: ['*'], underground: true },
  { type: 'outpost',    rarity: 0.003, biomes: ['*'] },
];
```

---

## 7. BIOME SYSTEM

### 7.1 Biome Definitions (10 Biomes)
Each biome has: temperature, moisture, surface block, fill block, tree type, tree density, terrain height modifier, unique features, mob spawns, color palette (fog, sky, grass tint).

| Biome | Temp | Moisture | Surface | Trees | Height | Special |
|-------|------|----------|---------|-------|--------|---------|
| **Plains** | 0.5 | 0.5 | Grass | Oak (sparse) | 64 | Flowers, tall grass, villages |
| **Forest** | 0.5 | 0.7 | Grass | Oak (dense) | 65 | Dense canopy, mushrooms |
| **Desert** | 0.9 | 0.1 | Sand | Cactus | 63 | Temples, wells, husks |
| **Snow** | 0.1 | 0.4 | Snow | Spruce | 66 | Ice lakes, powder snow |
| **Swamp** | 0.6 | 0.9 | Grass | Oak (sparse) | 62 | Shallow water, witches, slime |
| **Mountains** | 0.3 | 0.3 | Stone | Spruce (sparse) | 80+ | Emerald ore, goats, cliffs |
| **Crystal Caverns** | 0.4 | 0.6 | Grass | Birch | 64 | Underground crystal veins |
| **Corruption** | 0.7 | 0.2 | Mycelium | None | 60 | Corrupted blocks, void enemies |
| **Floating Islands** | 0.5 | 0.5 | Grass | Birch | 70+ | Sky islands, ender pearls |
| **Volcanic** | 1.0 | 0.1 | Stone | None | 68 | Lava pools, netherrack, blaze |

### 7.2 Biome Transitions
Biomes blend smoothly using distance-based interpolation:
- At biome boundaries, mix surface blocks (e.g., grass fading to sand)
- Blend tree density over 8-16 blocks
- Use temperature/moisture noise with Voronoi-based nearest-biome for clean transitions

### 7.3 Biome-Specific Features
- **Plains**: Village generation (houses, farms, NPCs)
- **Forest**: Dense tree canopy creates dark understory (more hostile spawns)
- **Desert: Temple pyramid with traps and treasure
- **Snow**: Frozen lakes (ice blocks), powder snow (sinks player)
- **Swamp**: Witch huts, lily pads, shallow water everywhere
- **Mountains**: Cliff faces, emerald ore, exposed caves
- **Crystal Caverns**: Glowing crystal blocks underground, crystal golems
- **Corruption**: Blocks slowly "spread" corruption to neighbors, void rifts
- **Floating Islands**: Sky platforms with rare loot, fall risk
- **Volcanic**: Lava geysers, fire-resistant mobs, nether portals

---

## 8. PLAYER SYSTEM

### 8.1 Player Stats
```javascript
{
  health: 20,        // Current HP (max from upgrades)
  maxHealth: 20,     // Base 20, upgradable to 28 via Soul Shop
  hunger: 20,        // 0-20, depletes over time, affects regen
  armor: 0,          // Sum of equipped armor defense values
  attackDamage: 1,   // Base + weapon damage
  attackSpeed: 4,    // Attacks per second
  miningSpeed: 1.0,  // Multiplier on block hardness
  moveSpeed: 4.3,    // Blocks per second (walk), 5.6 (sprint)
  critChance: 0.05,  // 5% base, upgradable
  critMultiplier: 1.5,
  knockbackResist: 0,
}
```

### 8.2 Player Controller
- **Movement**: WASD + mouse look (pointer lock)
- **Sprint**: Shift key (drains hunger faster)
- **Jump**: Space (0.5s cooldown, jump height 1.25 blocks)
- **Sneak**: Ctrl (slow move, prevents fall off edges, reduces mob detection)
- **Physics**: AABB collision with blocks, gravity (9.8 m/s²), terminal velocity
- **Step-up**: Auto-step 0.5-block height differences
- **Water**: Slower movement, can swim upward with Space
- **Fall damage**: >3 blocks = (distance - 3) damage

### 8.3 Mining System
```javascript
mineProgress += dt / (blockHardness * toolSpeedMultiplier);
if (mineProgress >= 1.0) {
  breakBlock();
  spawnDrops();
  mineProgress = 0;
}
```
- **Tool effectiveness**: Correct tool type = 2× speed, wrong tool = 0.5× speed
- **Tool level**: Some blocks require minimum tool level (iron for gold ore, etc.)
- **Mining animation**: Block crack overlay (progressive cracks 0-10 stages)

### 8.4 Block Placement
- RMB places selected hotbar block on the face of targeted block
- Collision check: cannot place inside player AABB
- Placement preview: translucent ghost block showing where it will go

### 8.5 Hunger System
- Depletes at 1 unit per 30 seconds (faster when sprinting, fighting, mining)
- At hunger = 0: no natural regeneration, slow health drain (1 HP per 4 seconds)
- At hunger ≥ 18: passive regeneration (1 HP per 4 seconds)
- Food items restore hunger instantly when eaten (F key)

---

## 9. COMBAT SYSTEM

### 9.1 Melee Combat
```javascript
playerAttack() {
  const target = getMobInFront(attackRange); // 3 blocks range
  if (!target || attackCooldown > 0) return;
  
  let damage = weapon.damage + player.attackDamage;
  
  // Crit check
  if (Math.random() < player.critChance) {
    damage *= player.critMultiplier;
    applyHitstop(80); // 80ms freeze on crit
    applyScreenShake(0.15);
    spawnCritParticles(target.position);
    showDamageNumber(target.position, damage, true); // yellow, larger
  } else {
    applyHitstop(30); // light hitstop on normal hit
    showDamageNumber(target.position, damage, false);
  }
  
  // Knockback
  const dir = player.lookDirection.clone().normalize();
  target.velocity.add(dir.multiplyScalar(3));
  
  // Durability
  weapon.durability--;
  if (weapon.durability <= 0) breakWeapon();
  
  attackCooldown = 1.0 / weapon.speed;
}
```

### 9.2 Ranged Combat (Bow)
- Draw time: 0.5s for full power
- Arrow velocity: 20-50 blocks/s based on draw time
- Arrow gravity: drops over distance
- Arrow pickup: arrows stick in blocks/mobs, recoverable
- Damage: 4-10 based on draw time

### 9.3 Shield Blocking
- Hold RMB with shield equipped → blocks frontal attacks
- Block chance: 50% base (upgradable)
- Blocked damage reduced by 66%
- Parry window (first 0.2s of blocking): 100% block + reflect damage

### 9.4 Damage Calculation
```javascript
finalDamage = max(1, rawDamage - armorReduction);
armorReduction = armor * 0.04 * rawDamage; // armor is % reduction
```

### 9.5 Knockback
```javascript
knockback = baseKnockback * (1 - target.knockbackResist);
target.velocity += attackDirection * knockback;
// Vertical component: 0.4 * knockback (launches slightly upward)
```

### 9.6 Status Effects
Applied by weapons, mobs, potions, shrines:
```javascript
const EFFECTS = {
  poison:     { tickDamage: 1, interval: 1.0, color: '#4a4' },
  wither:     { tickDamage: 2, interval: 0.5, color: '#222' },
  fire:       { tickDamage: 1, interval: 0.5, color: '#f80' },
  slowness:   { speedMult: 0.5, color: '#888' },
  weakness:   { damageMult: 0.5, color: '#888' },
  regeneration: { heal: 1, interval: 1.0, color: '#f4f' },
  strength:   { damageMult: 1.5, color: '#f44' },
  speed:      { speedMult: 1.3, color: '#88f' },
  fire_resist:{ fireImmune: true, color: '#f80' },
  invisibility:{ mobDetection: 0.25, color: '#ccc' },
};
```

---

## 10. MOB & AI SYSTEM

### 10.1 Mob Definitions (22+ Types)

**Passive (6):** Cow, Pig, Chicken, Sheep, Fish, Villager
- Behavior: Wander randomly, flee when attacked
- Drops: Food items, leather, feathers, wool
- Spawn: Daytime, specific biomes

**Hostile (14):** Zombie, Skeleton, Spider, Creeper, Enderman, Witch, Phantom, Slime, Husk, Cave Spider, Mimic, Crystal Golem, Harpy, Blaze
- Each has unique AI behavior, attack pattern, drops, and biome affinity
- Special abilities: Creeper explodes, Enderman teleports, Spider climbs, Phantom swoops, Slime splits, Mimic ambushes

**Mini-Bosses (4):** Giant Zombie, Spider Queen, Necromancer, Corrupted Champion
- Multi-phase fights, summon adds, unique arena mechanics
- Guaranteed Soul Shard drops + rare loot

**Final Boss (1):** Void Wyrm
- 300 HP, 5 attack patterns, arena-based fight
- Legendary item drops (15% chance)

### 10.2 Mob AI State Machine
```
IDLE → (aggro range) → CHASE → (attack range) → ATTACK
  ↑        ↑                              ↓
  └────────┴──── (target lost/dead) ───────┘
  
Special states: FLEE (passive mobs), TELEPORT (enderman),
                EXPLODE (creeper countdown), SUMMON (bosses)
```

### 10.3 Mob Spawning Rules
```javascript
spawnMobs(playerPos, timeOfDay, biome) {
  // Hostile mobs: night time OR underground OR dark areas
  // Passive mobs: day time, surface, specific biomes
  // Spawn cap: 20 hostile + 15 passive within 128 blocks of player
  // Spawn interval: every 2 seconds, check 24-block radius
  // Light level check: hostile mobs only in light < 7
}
```

### 10.4 Mob Behavior Types
- **wander**: Random direction changes every 2-4s, stop occasionally
- **chase**: Path toward player, avoid obstacles (simple A* or steering)
- **ranged**: Maintain 8-12 block distance, shoot projectiles
- **fly**: Move in 3D, swoop attacks, hover above player
- **ambush**: Stay hidden until player is close, then burst attack

### 10.5 Mob Drops & Loot Tables
Each mob has weighted loot drops with min/max counts and probability:
```javascript
drops: [
  { item: 'Iron Ingot', min: 0, max: 1, chance: 0.05 },
  { item: 'Diamond', min: 0, max: 1, chance: 0.01 },
]
```
Fortune effect doubles drop quantities. Looting enchantment increases chance.

---

## 11. BOSS SYSTEM

### 11.1 Boss Design Principles
- Multi-phase fights (HP thresholds trigger phase changes)
- Telegraphed attacks (visual/audio tells before dangerous moves)
- Arena-based (specific room/area for the fight)
- Add spawning (summon minions during fight)
- Guaranteed meaningful loot

### 11.2 Boss Roster

**Giant Zombie** (Floor 2+ boss)
- Phase 1 (100-60 HP): Slow slam attacks, shockwave on ground impact
- Phase 2 (<60 HP): Faster, throws rocks (projectiles), ground pound AoE
- Arena: Open stone room with pillars for cover

**Spider Queen** (Floor 2+ boss)
- Phase 1 (80-40 HP): Web shots (slows player), poison bite
- Phase 2 (<40 HP): Summons spider adds (3 every 20s), ceiling climb
- Arena: Web-covered room with cocoons

**Necromancer** (Floor 3+ boss)
- Phase 1 (90-50 HP): Ranged dark bolts, summons skeleton adds
- Phase 2 (<50 HP): Teleports, wither AoE, raises undead faster
- Arena: Dark altar room with soul fire

**Corrupted Champion** (Floor 4+ boss)
- Phase 1 (120-70 HP): Heavy melee combos, corruption trail
- Phase 2 (<70 HP): Corruption explosion AoE, charges, enrage mode
- Arena: Corrupted stone arena with void edges

**Void Wyrm** (Final Boss — special portal arena)
- Phase 1 (300-200 HP): Tail sweeps, bite attacks, fire breath line
- Phase 2 (200-100 HP): Burrows underground, emerges with AoE, summons endermites
- Phase 3 (<100 HP): Teleports, void beam (tracking laser), arena shrinks
- Arena: Obsidian platform over void, shrinking over time

### 11.3 Boss Health Bar
- Displayed at top of screen during boss fights
- Boss name + health bar + phase indicators
- Damage numbers on boss are larger

---

## 12. INVENTORY & ITEMS

### 12.1 Inventory Layout
- **Main grid**: 27 slots (3 rows × 9 columns) — expandable to 36/45 via upgrades
- **Hotbar**: 9 slots (always visible, number keys 1-9 to select)
- **Armor slots**: 4 (helmet, chestplate, leggings, boots)
- **Offhand**: 1 slot (shield, torch, arrow)
- **Crafting**: 2×2 grid in inventory screen

### 12.2 Item Properties
```javascript
{
  id: number,         // Unique ID
  name: string,       // Display name
  type: string,       // 'sword', 'pickaxe', 'food', 'material', 'potion', etc.
  damage: number,     // Weapon damage
  speed: number,      // Attack speed
  durability: number, // Uses before breaking
  mineLevel: number,  // Mining capability (0=wood, 1=stone, 2=iron, 3=diamond, 4=crystal)
  stackSize: number,  // Max stack (1 for tools/armor, 64 for materials)
  defense: number,    // Armor value
  hunger: number,     // Food restoration
  effects: array,     // Status effects applied on use
}
```

### 12.3 Item Categories (120+ items)
- **Tools** (20): Wood/Stone/Iron/Gold/Diamond/Crystal × Sword/Pickaxe/Axe/Shovel + Bow + Shield
- **Armor** (20): Leather/Iron/Gold/Diamond/Crystal × Helmet/Chest/Leggings/Boots
- **Food** (13): Apple, Bread, Steak, Porkchop, Chicken, Mutton, Fish, Carrot, Potato, Golden Apple, etc.
- **Materials** (22): Coal, Iron Ingot, Gold, Diamond, Crystal, Redstone, Stick, String, Bone, etc.
- **Potions** (8): Healing, Regen, Strength, Speed, Fire Resist, Night Vision, Water Breathing, Invisibility
- **Legendaries** (10): Flame Sword, Void Blade, Shadow Armor, Gravity Boots, Phoenix Bow, etc.
- **Block-Items** (6): Placeable blocks as inventory items

### 12.4 Legendary Items (Unique Effects)
Each legendary has a unique passive effect that changes gameplay:
- **Flame Sword**: Sets enemies on fire, light source when held
- **Void Blade**: Teleports behind target on crit
- **Shadow Armor**: Invisibility when crouching, +speed
- **Gravity Boots**: Slow fall, double jump
- **Phoenix Bow**: Arrows explode on impact, fire trail
- **Ender Gauntlets**: Teleport punch (blink to target)
- **Wyrmscale Shield**: Reflect 30% damage, fire immunity
- **Storm Staff**: Chain lightning (hits 3 enemies), stun
- **Soul Harvester**: Life steal 15% of damage, +Soul Shards from kills

---

## 13. CRAFTING SYSTEM

### 13.1 Crafting Grids
- **Inventory crafting**: 2×2 grid (basic recipes only)
- **Crafting table**: 3×3 grid (all recipes)

### 13.2 Recipe Matching
```javascript
findRecipe(grid) {
  // grid = flat 9-element array (row-major), null for empty
  for (const recipe of RECIPES) {
    if (recipe.shapeless) {
      // Compare sorted multisets of ingredients
    } else {
      // Try all offsets in 3×3 grid, match pattern
    }
  }
}
```

### 13.3 Recipe Categories (50+ recipes)
- **Basic Materials**: Planks from logs, sticks from planks, paper, books
- **Lighting**: Torches (coal + stick), lanterns
- **Stations**: Crafting table, furnace, chest, bed, enchanting table, anvil, brewing stand
- **Doors/Fences/Ladders**: Functional blocks
- **Combat**: Bow, arrows, shield, TNT
- **Tools**: All tiers (wood → crystal)
- **Armor**: All tiers (leather → crystal)
- **Food**: Mushroom stew, cake, cookies

### 13.4 Smelting (Furnace)
- Input slot + Fuel slot → Output slot
- Fuel has burn time (Coal = 8s, Planks = 1.5s, etc.)
- Smelting time: 10 seconds per item
- Recipes: Ore → Ingot, Raw food → Cooked, Sand → Glass, Cobble → Stone

---

## 14. ROGUELIKE CORE LOOP

### 14.1 Run Structure
```
START RUN
  → Generate world (seed + modifiers)
  → Spawn player at world center
  → Show modifiers (e.g., "Rich Ores", "Eternal Night", "Swarm")
  → Explore, mine, craft, fight
  → Find portal rooms → enter dungeon tower
  → Clear dungeon floors → fight boss
  → OR die → calculate Soul Shards → return to menu
  → OR beat final boss → mega shard bonus → return to menu
```

### 14.2 Run Modifiers (20+)
Each run gets 1-3 random modifiers that change gameplay:
```javascript
const MODIFIERS = [
  { name: 'Rich Ores',     desc: 'Ores are 2× more common', effect: 'oreMult:2' },
  { name: 'Poor Ores',     desc: 'Ores are 50% rarer', effect: 'oreMult:0.5' },
  { name: 'Eternal Night', desc: 'Always dark, more hostile spawns', effect: 'alwaysNight' },
  { name: 'Eternal Day',   desc: 'Always bright, peaceful', effect: 'alwaysDay' },
  { name: 'Swarm',         desc: '2× mob spawns, 0.5× mob HP', effect: 'swarm' },
  { name: 'Tank Mobs',     desc: '0.5× mob spawns, 2× mob HP', effect: 'tank' },
  { name: 'Speed Run',     desc: 'Timer: bonus shards for speed', effect: 'speedrun' },
  { name: 'Glass Cannon',  desc: '2× damage dealt, 2× damage taken', effect: 'glasscannon' },
  { name: 'Midas Touch',   desc: 'Mining drops gold instead of blocks', effect: 'midas' },
  { name: 'Gravity Well',  desc: 'Jump height halved, fall damage doubled', effect: 'heavy' },
  { name: 'Bountiful',     desc: 'Mobs drop 2× loot', effect: 'bountiful' },
  { name: 'Cursed',        desc: 'Cannot eat food, only potions heal', effect: 'cursed' },
  { name: 'Labyrinth',     desc: 'Caves are 3× more complex', effect: 'labyrinth' },
  { name: 'Flat World',    desc: 'Minimal terrain variation', effect: 'flat' },
  { name: 'Sky Islands',   desc: 'Floating islands only, void below', effect: 'skyislands' },
  { name: 'Darkness',      desc: 'Reduced render distance, no torch light', effect: 'darkness' },
  { name: 'Abundance',     desc: 'Trees everywhere, thick forests', effect: 'abundance' },
  { name: 'Scorched',      desc: 'No trees, desert/volcanic biomes only', effect: 'scorched' },
  { name: 'Lucky',         desc: '+50% crit chance, shrines more common', effect: 'lucky' },
  { name: 'Permadeath+',   desc: 'No soul shards earned, 3× boss loot', effect: 'permadeath' },
];
```

### 14.3 Soul Shard Calculation
```javascript
calculateShards(runStats) {
  let shards = 0;
  shards += runStats.mobsKilled * 1;        // 1 per mob
  shards += runStats.bossesKilled * 10;     // 10 per boss
  shards += runStats.structuresFound * 3;   // 3 per structure
  shards += runStats.shrinesUsed * 2;       // 2 per shrine
  shards += Math.floor(runStats.blocksMined / 50); // 1 per 50 blocks
  shards += Math.floor(runStats.distanceTraveled / 100); // 1 per 100 blocks
  shards += runStats.depth * 2;             // 2 per dungeon floor cleared
  
  // Modifier bonuses
  if (modifier === 'speedrun' && runTime < 600) shards *= 2;
  if (modifier === 'permadeath') shards = 0;
  
  return Math.floor(shards);
}
```

### 14.4 Difficulty Scaling
Run difficulty increases with total runs completed:
```javascript
difficulty = 1 + Math.floor(totalRuns / 5); // every 5 runs = +1 difficulty
// Affects:
//   - Mob HP multiplier: 1.0 + (difficulty * 0.1)
//   - Mob damage multiplier: 1.0 + (difficulty * 0.05)
//   - Mob spawn rate: 1.0 + (difficulty * 0.1)
//   - Ore rarity: 1.0 / (1.0 + difficulty * 0.05)
//   - Boss HP multiplier: 1.0 + (difficulty * 0.15)
//   - Number of modifiers: 1 + floor(difficulty / 3)
```

---

## 15. META-PROGRESSION: SOUL SHOP

### 15.1 Design Philosophy
Soul Shop upgrades should be:
- **Meaningful**: Each upgrade noticeably changes gameplay
- **Tiered**: Better versions cost exponentially more
- **Diverse**: Mix of stats, abilities, and convenience
- **Permanent**: Survive across all runs

### 15.2 Upgrade Categories (25+ upgrades)

**Survival:**
| Upgrade | Cost | Effect | Max |
|---------|------|--------|-----|
| Extra Hearts I-IV | 10/25/50/100 | +2 max HP each | 4 ranks |
| Iron Stomach | 15 | -20% hunger drain | 1 |
| Tough Skin | 35 | +1 base armor | 1 |
| Second Wind | 75 | Survive lethal hit once per run | 1 |
| Phoenix | 200 | Full revive once per run | 1 |

**Combat:**
| Upgrade | Cost | Effect | Max |
|---------|------|--------|-----|
| Lucky Strike | 30 | +5% crit chance | 1 |
| Dash | 30 | Quick dodge ability (3s cooldown) | 1 |
| Ground Slam | 50 | AoE slam attack (8s cooldown) | 1 |
| Parry | 40 | Perfect block reflects damage | 1 |

**Utility:**
| Upgrade | Cost | Effect | Max |
|---------|------|--------|-----|
| Stone Start | 20 | Start with stone tools | 1 |
| Iron Start | 50 | Start with iron tools (req: Stone Start) | 1 |
| Backpack I/II | 25/75 | +9/+18 inventory slots | 2 |
| Night Owl | 20 | Permanent night vision | 1 |
| Treasure Hunter | 40 | Structures visible on minimap | 1 |
| Treasure Sense | 25 | Chests pulse on minimap | 1 |
| Soul Magnet | 50 | +25% Soul Shard gain | 1 |

**Abilities:**
| Upgrade | Cost | Effect | Max |
|---------|------|--------|-----|
| Double Jump | 40 | Jump again in mid-air | 1 |
| Wall Slide | 35 | Slow fall when touching walls | 1 |
| Magnet | 30 | Auto-pickup items in 5-block radius | 1 |
| X-Ray Vision | 60 | See ores through walls (5s, 30s cooldown) | 1 |
| Recall | 45 | Teleport to spawn (60s cooldown) | 1 |

---

## 16. DUNGEON & STRUCTURE GENERATION

### 16.1 Dungeon Tower Structure
Multi-floor tower placed at 3-4 locations per world:
- **Floors**: 3-5 per tower
- **Floor layout**: 12×12 rooms with 6-block height
- **Connections**: Ladder holes between floors
- **Boss room**: Top floor always has boss

### 16.2 Room Types (7 types, weighted)
| Room Type | Weight | Features |
|-----------|--------|----------|
| Spawner | 35% | Mob spawner + chest |
| Treasure | 15% | Multiple chests (10% mimic chance) |
| Shrine | 15% | Blessing altar (buff) |
| Trap | 15% | Pressure plates, arrow dispensers, pitfalls |
| Arena | 10% | Iron bars lock you in, waves of mobs |
| Puzzle | 5% | Lever puzzle → door to treasure |
| Lore | 5% | Bookshelves with world-building text |

### 16.3 Surface Structures
- **Village**: 3-8 buildings (houses, farms, blacksmith) + Villager NPCs
- **Desert Temple**: Pyramid with hidden basement, traps, treasure
- **Ruins**: Crumbled walls, buried chests, mob spawns
- **Well**: Deep shaft to underground, water at bottom, cave entrance
- **Outpost**: Fortified tower with hostile mobs + good loot
- **Mine Shaft**: Wooden supports, rails, cave spider spawners

### 16.4 Chest Loot Tables
```javascript
const CHEST_LOOT = {
  common: [
    { item: 'Bread', min: 2, max: 4, weight: 10 },
    { item: 'Iron Ingot', min: 1, max: 3, weight: 5 },
    { item: 'Torch', min: 3, max: 8, weight: 8 },
  ],
  rare: [
    { item: 'Diamond', min: 1, max: 2, weight: 3 },
    { item: 'Gold Ingot', min: 2, max: 5, weight: 5 },
    { item: 'Potion of Healing', min: 1, max: 2, weight: 4 },
  ],
  legendary: [
    { item: 'Flame Sword', min: 1, max: 1, weight: 1 },
    { item: 'Shadow Armor', min: 1, max: 1, weight: 1 },
    { item: 'Enchanted Golden Apple', min: 1, max: 1, weight: 2 },
  ],
};
```

---

## 17. DAY/NIGHT CYCLE & ATMOSPHERE

### 17.1 Cycle Timing
- Full day cycle: 20 minutes real-time
- Day (0-60%): Bright sky, passive mobs spawn, peaceful
- Sunset (60-70%): Sky gradient orange→red→purple, mobs start spawning
- Night (70-90%): Dark sky, moon, hostile mobs active, danger
- Sunrise (90-100%): Gradient purple→orange→blue, mobs burn

### 17.2 Sky Rendering
- Background color interpolation between sky states
- Sun/Moon as billboard sprites rotating around world
- Stars at night (point sprites)
- Fog color changes with time of day

### 17.3 Lighting
- Hemisphere light (sky color top, ground color bottom)
- Directional light (sun position follows time of day)
- Night: reduce ambient light, increase fog density
- Torch blocks: point light radius 14 (Minecraft-style)
- Lava: point light radius 15
- Crystal: point light radius 7

### 17.4 Weather (Optional Enhancement)
- Rain: Particle system + reduced visibility + wet surface shader
- Thunder: Flash + screen shake + lightning strike (sets block on fire)
- Clear: Normal gameplay

---

## 18. PARTICLE & VFX SYSTEM

### 18.1 Particle Types
```javascript
const PARTICLE_TYPES = {
  blockBreak: { count: 8, speed: 2, lifetime: 0.5, gravity: true, size: 0.1 },
  blockPlace: { count: 4, speed: 1, lifetime: 0.3, gravity: true, size: 0.08 },
  damage: { count: 5, speed: 3, lifetime: 0.4, gravity: true, color: '#f00' },
  crit: { count: 12, speed: 4, lifetime: 0.6, gravity: false, color: '#ff0', size: 0.15 },
  heal: { count: 8, speed: 1, lifetime: 0.8, gravity: false, color: '#f4f', rise: true },
  soulShard: { count: 15, speed: 2, lifetime: 1.0, gravity: false, color: '#a0f', spiral: true },
  fire: { count: 3, speed: 0.5, lifetime: 0.8, gravity: false, color: '#f80', rise: true },
  smoke: { count: 2, speed: 0.3, lifetime: 1.5, gravity: false, color: '#888', rise: true },
  explosion: { count: 30, speed: 5, lifetime: 0.8, gravity: true, color: '#f80', size: 0.2 },
  portal: { count: 20, speed: 1, lifetime: 1.0, gravity: false, color: '#08f', spiral: true },
  mining: { count: 2, speed: 0.5, lifetime: 0.3, gravity: true, color: '#aaa' },
  waterSplash: { count: 6, speed: 2, lifetime: 0.5, gravity: true, color: '#48f' },
};
```

### 18.2 Implementation
```javascript
class ParticleSystem {
  constructor(scene) {
    this.particles = [];
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }
  
  emit(type, position, color) {
    const def = PARTICLE_TYPES[type];
    for (let i = 0; i < def.count; i++) {
      this.particles.push({
        pos: position.clone(),
        vel: randomDirection().multiplyScalar(def.speed),
        life: def.lifetime,
        maxLife: def.lifetime,
        color: new THREE.Color(color || def.color),
        size: def.size || 0.1,
        gravity: def.gravity,
      });
    }
  }
  
  update(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.pos.add(p.vel.clone().multiplyScalar(dt));
      if (p.gravity) p.vel.y -= 9.8 * dt;
      p.vel.multiplyScalar(0.98); // drag
    }
    this.particles = this.particles.filter(p => p.life > 0);
    this._updateBuffers();
  }
}
```

### 18.3 Damage Numbers
Floating numbers that rise, fade, and pop:
```javascript
showDamageNumber(worldPos, damage, isCrit) {
  // Project 3D → 2D screen position
  const screenPos = worldToScreen(worldPos, camera);
  // Create DOM element with CSS animation
  // Float upward 60px over 0.8s, fade out
  // Crit: yellow, larger font (24px vs 18px)
  // Player damage: red
}
```

---

## 19. AUDIO ENGINE

### 19.1 Web Audio API Approach
```javascript
class AudioEngine {
  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.sounds = new Map(); // name → AudioBuffer
  }
  
  play(name, volume = 1.0, pitch = 1.0) {
    // Procedural sound generation OR pre-loaded buffer
    const source = this.ctx.createBufferSource();
    source.buffer = this.sounds.get(name);
    source.playbackRate.value = pitch + (Math.random() - 0.5) * 0.1; // slight variation
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.masterGain);
    source.start();
  }
}
```

### 19.2 Sound Effects (Procedural where possible)
**Block sounds:**
- Stone break: Short noise burst with bandpass filter
- Wood break: Warmer tone, lower frequency
- Dirt break: Soft thud, low frequency
- Glass break: High-frequency tinkle

**Combat sounds:**
- Sword hit: Metallic clang (sawtooth + noise)
- Bow draw: Rising pitch sine
- Arrow impact: Thud + noise
- Critical hit: Layered hit + reverb + low boom
- Player hurt: Short noise burst (pain sound)

**Ambient:**
- Cave ambience: Low-frequency drone + water drips
- Night ambience: Cricket-like synthesis + wind
- Wind: Filtered noise

**UI sounds:**
- Menu click: Short tick
- Item pickup: Rising chime
- Level up: Ascending arpeggio
- Death: Descending tone + reverb

---

## 20. UI/HUD SYSTEM

### 20.1 HUD Elements (Always Visible During Gameplay)
- **Hearts**: Top-left, 10 hearts (2px per HP), flash when damaged
- **Hunger bar**: Below hearts, 10 drumsticks
- **Hotbar**: Bottom-center, 9 slots with item icons + counts
- **Selected slot**: White border highlight
- **Crosshair**: Center, white + with difference blend mode
- **Block info**: Below crosshair, shows targeted block name
- **Mining progress**: Below block info, green bar
- **Status effects**: Top-right, icons with remaining time
- **Damage overlay**: Red vignette when hit (flash 0.3s)
- **Low health pulse**: Red vignette pulsing when < 6 HP

### 20.2 Menu Screens

**Main Menu:**
- Title: "MINE ROGUE" in large pixel font
- Subtitle: "A Voxel Roguelike"
- Buttons: Play | Home World | Soul Shop
- Soul Shard counter
- Controls hint at bottom

**Death Screen:**
- "YOU DIED" in red
- Run stats: Time, mobs killed, blocks mined, depth, bosses killed
- Soul Shards earned
- Buttons: New Run | Menu

**Pause Screen:**
- "PAUSED" header
- Current run stats
- Buttons: Resume | Quit to Menu

**Inventory Screen:**
- 4 armor slots (top)
- 27-slot inventory grid
- 2×2 crafting grid + result slot
- Drag & drop between slots
- Right-click to split stacks

**Crafting Table Screen:**
- 3×3 crafting grid + result slot
- Recipe book (shows known recipes)

**Furnace Screen:**
- Input slot + Fuel slot → Output slot
- Progress bar (smelting progress)
- Animated fire icon when burning

**Shop Screen:**
- Scrollable list of upgrades
- Each: Name, description, cost, current level, buy button
- Greyed out if insufficient shards or prerequisite not met

**Minimap:**
- Top-right, 128×128 pixel canvas
- Top-down view of terrain (color-coded by block type)
- Player marker (white dot with direction arrow)
- Toggle: Tab key

### 20.3 Toast Messages
```javascript
showToast(message) {
  // Center-screen floating text
  // Fades in, holds 1.5s, fades out over 0.5s
  // Stack up to 3 visible toasts
}
```

---

## 21. SAVE SYSTEM

### 21.1 LocalStorage Schema
```javascript
// Meta progression (persists across runs)
'minerogue_meta': {
  soulShards: number,
  upgrades: { [upgradeId]: true/number },
  stats: {
    totalRuns: number,
    totalDeaths: number,
    bestShards: number,
    totalMobsKilled: number,
    totalBlocksMined: number,
    bestTime: number,
    bossesKilled: number,
  },
  achievements: string[],
  unlockedBiomes: string[],
}

// Home world (persistent base)
'minerogue_home': {
  blocks: { [key]: blockId }, // sparse storage for placed blocks
  chests: { [key]: items[] },
}
```

### 21.2 Save Triggers
- On death: save meta + stats
- On upgrade purchase: save meta
- On home world block place/break: save home
- Auto-save home world every 60 seconds

---

## 22. PERFORMANCE & OPTIMIZATION

### 22.1 Chunk Mesh Optimization
- **Greedy meshing** (future enhancement): merge adjacent same-type faces into larger quads
- **Face culling**: only render faces adjacent to air/transparent blocks
- **AO calculation**: per-vertex, check 3 neighbors per vertex per face
- **Max rebuilds per frame**: 2 (prevent frame spikes)
- **Geometry pooling**: reuse BufferGeometry objects, update attributes in place

### 22.2 Entity Optimization
- **Mob cap**: 35 total within 128 blocks
- **LOD for mobs**: full detail < 32 blocks, simplified > 32 blocks
- **Instanced mesh**: for identical mob types (use InstancedMesh)
- **Object pooling**: reuse mob objects instead of creating/destroying

### 22.3 Rendering Optimization
- **Frustum culling**: Three.js built-in (bounding boxes per chunk)
- **Render distance**: 8 chunks (128 blocks) — user adjustable
- **Fog**: FogExp2 hides chunk pop-in naturally
- **Texture atlas**: single texture for all blocks = no material switching
- **Material reuse**: one material for all opaque chunks, one for transparent
- **Matrix caching**: `mesh.matrixAutoUpdate = false` for static chunks

### 22.4 Memory Management
- **Chunk disposal**: remove from scene + dispose geometry + dispose material
- **Audio buffer management**: limit active AudioBufferSourceNodes
- **Particle pool**: max 500 active particles
- **WeakRef for disposed objects**: prevent memory leaks

---

## 23. CONTROLS & INPUT

### 23.1 Key Bindings
| Key | Action |
|-----|--------|
| W/A/S/D | Move forward/left/backward/right |
| Mouse | Look around (pointer lock) |
| LMB | Mine block / Attack mob |
| RMB | Place block / Use item / Block with shield |
| Space | Jump / Swim up |
| Shift | Sprint |
| Ctrl | Sneak |
| E | Open/close inventory |
| C | Open crafting table (if nearby) |
| F | Eat selected food item |
| Q | Drop selected item |
| 1-9 | Select hotbar slot |
| Scroll | Cycle hotbar slots |
| Tab | Toggle minimap |
| ESC | Pause / close menu |

### 23.2 Pointer Lock
- Click canvas to lock pointer
- ESC to unlock
- Movement delta from `mousemove` event while locked
- Sensitivity: configurable (default 0.002 rad/px)

### 23.3 Input Buffering
- Queue key presses during lag spikes
- Consume keys on read (one-shot actions like inventory toggle)
- Track held state for continuous actions (mining, sprinting)

---

## 24. MOD & MODIFIER SYSTEM

### 24.1 Run Modifier Application
```javascript
class RoguelikeSystem {
  generateModifiers(difficulty) {
    const count = 1 + Math.floor(difficulty / 3); // 1-4 modifiers
    const pool = [...MODIFIERS];
    const selected = [];
    for (let i = 0; i < count; i++) {
      const idx = weightedRandom(pool);
      selected.push(pool.splice(idx, 1)[0]);
    }
    return selected;
  }
  
  applyModifiers(generator, modifiers) {
    for (const mod of modifiers) {
      switch (mod.effect) {
        case 'oreMult': generator.oreMultiplier = mod.value; break;
        case 'alwaysNight': /* force night state */ break;
        case 'swarm': generator.mobSpawnMult = 2; break;
        // ... etc
      }
    }
  }
}
```

---

## 25. ACHIEVEMENT & UNLOCK SYSTEM

### 25.1 Achievements (30+)
```javascript
const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Kill your first mob', icon: '⚔️' },
  { id: 'miner_100', name: 'Rock Breaker', desc: 'Mine 100 blocks', icon: '⛏' },
  { id: 'diamond_find', name: 'Diamonds!', desc: 'Find your first diamond', icon: '💎' },
  { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat a boss', icon: '👑' },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete a run in under 10 minutes', icon: '⚡' },
  { id: 'pacifist', name: 'Pacifist', desc: 'Complete a dungeon without killing mobs', icon: '☮️' },
  { id: 'tower_clear', name: 'Tower Clear', desc: 'Clear all floors of a dungeon', icon: '🏰' },
  { id: 'collector', name: 'Collector', desc: 'Obtain every item type', icon: '📦' },
  { id: 'legendary_find', name: 'Legendary!', desc: 'Find a legendary item', icon: '🌟' },
  { id: 'void_slayer', name: 'Void Slayer', desc: 'Defeat the Void Wyrm', icon: '🐉' },
  // ... 20+ more
];
```

### 25.2 Achievement Rewards
Each achievement unlocks something:
- Cosmetic: title displayed on death screen
- Functional: small permanent stat boost (+0.5% crit, +1 max HP, etc.)
- Content: unlock new biomes for future runs

---

## 26. NPC & DIALOG SYSTEM

### 26.1 NPC Types
- **Villager**: Trades basic items, gives hints about nearby structures
- **Blacksmith**: Upgrades tools (iron → diamond for a cost)
- **Witch**: Sells potions, buys rare materials
- **Wanderer**: Gives quests ("kill 10 zombies", "find the temple")
- **Shop Keeper**: Soul Shop interface (in home world)

### 26.2 Dialog System
```javascript
class DialogSystem {
  show(npc, dialogTree) {
    // Simple dialog box at bottom of screen
    // NPC name + portrait + text
    // Click to advance / choose options
    // Options can trigger: give item, start quest, open shop
  }
}
```

---

## 27. ENCHANTING & ALCHEMY

### 27.1 Enchanting Table
- Requires Lapis Lazuli + XP levels
- 3 random enchantment choices
- Enchantments: Sharpness, Efficiency, Protection, Fortune, Silk Touch, Fire Aspect, Knockback, Unbreaking

### 27.2 Brewing Stand
- Water Bottle + Nether Wart = Awkward Potion
- Awkward Potion + ingredient = specific potion
- Ingredient list: Blaze Powder (Strength), Sugar (Speed), Glistering Melon (Healing), etc.

---

## 28. VISUAL POLISH & GAME FEEL

### 28.1 Screen Effects
- **Damage vignette**: Red radial gradient, flashes on hit (0.3s)
- **Low health pulse**: Red vignette pulsing at <6 HP
- **Heal effect**: Green particle burst rising
- **Level up**: Golden particle explosion + ascending tone
- **Boss intro**: Screen darkens, boss name appears in large text, dramatic pause

### 28.2 Camera Effects
- **FOV change**: Sprint → FOV 70→80 (smooth lerp)
- **Camera bob**: Subtle head bob when walking, more when sprinting
- **Landing impact**: Quick camera dip when falling >3 blocks
- **Hitstop**: Camera position freezes for 30-100ms on impacts

### 28.3 Block Feedback
- **Break particles**: Block-colored particles spray from break point
- **Crack overlay**: Progressive cracks on block being mined (10 stages)
- **Place effect**: Brief flash + subtle particles
- **Mining sound**: Pitch varies by block type

### 28.4 Combat Feedback
- **Hit flash**: Mob turns white for 1 frame when hit
- **Knockback**: Mob flies backward from hit direction
- **Critical hit**: Yellow particles, larger damage number, screen shake, hitstop
- **Death explosion**: Mob breaks into particles (block-colored)
- **Damage numbers**: Float up, fade out, crit = yellow + larger

### 28.5 UI Animations
- **Heart damage**: Hearts shake when losing HP
- **Hotbar scroll**: Smooth slot transition
- **Menu transitions**: Fade in/out (0.2s)
- **Toast messages**: Float up and fade
- **Shard counter**: Animated count-up when earning shards

---

## 29. ASSET MANIFEST

### Generated Assets (in assets/ directory)
```
assets/
├── textures/
│   ├── block_atlas.png    # 256×256 block texture atlas (16×16 tiles)
│   └── biome_atlas.png    # Additional biome textures
├── sprites/
│   ├── item_atlas.png     # Item icons atlas
│   ├── mob_atlas.png      # Mob textures
│   └── boss_atlas.png     # Boss textures
└── ui/
    └── ui_atlas.png       # UI elements (hearts, icons, frames)
```

### Procedural Textures (Generated at Runtime)
For textures not in the atlas, generate procedurally:
```javascript
function generateBlockTexture(blockType) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext('2d');
  // Generate pixel art based on block type
  // Use noise for stone variation, gradients for grass, etc.
  return new THREE.CanvasTexture(canvas);
}
```

### Texture Atlas Generation
If no external atlas is loaded, generate a procedural atlas at startup:
```javascript
function createTextureAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256; // 16×16 grid of 16×16 tiles
  const ctx = canvas.getContext('2d');
  
  // Draw each block texture into its atlas position
  drawGrassTop(ctx, 0, 0);     // tile 0
  drawStone(ctx, 16, 0);       // tile 1
  drawDirt(ctx, 32, 0);        // tile 2
  // ... etc
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter; // pixelated
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
```

---

## 30. IMPLEMENTATION ORDER

### Phase 1: Foundation (Build First)
1. ✅ Project setup (Vite + Three.js + simplex-noise)
2. ✅ HTML shell (index.html with all UI containers)
3. Renderer (Three.js scene, camera, fog, lighting)
4. Input manager (keyboard, mouse, pointer lock)
5. Texture atlas (procedural generation or load from file)
6. Chunk system (16³ storage, face culling, AO, UV mapping)
7. World manager (chunk loading/unloading, block access)
8. World generator (terrain height, basic biomes, caves, ores)
9. Player controller (movement, physics, collision)
10. Block interaction (raycast, mine, place)

### Phase 2: Gameplay Core
11. Inventory system (slots, stacking, hotbar)
12. Crafting system (2×2 + 3×3 recipe matching)
13. Furnace system (smelting with fuel)
14. Item drops (break block → spawn item entity → pickup)
15. HUD (hearts, hunger, hotbar, crosshair, block info)
16. Menu system (main menu, pause, death screen)
17. Day/night cycle (sky color, lighting, mob spawning)

### Phase 3: Combat & Mobs
18. Mob manager (spawning, pooling, lifecycle)
19. Mob AI (wander, chase, ranged, fly behaviors)
20. Combat system (melee, ranged, damage calc, knockback)
21. Mob definitions (all 22+ types with stats and drops)
22. Status effects (poison, fire, regen, etc.)
23. Damage numbers (floating, fading, crit styling)
24. Hitstop & screen shake

### Phase 4: Roguelike Systems
25. Roguelike system (run management, modifiers, shard calculation)
26. Soul Shop (upgrade definitions, purchase, application)
27. Dungeon generator (multi-floor tower, room types)
28. Boss system (5 bosses with multi-phase AI)
29. Shrine effects (8 blessing types)
30. Achievement system (30+ achievements with rewards)

### Phase 5: Polish & Content
31. Particle system (block break, damage, ambient)
32. Audio engine (procedural sounds, Web Audio)
33. Minimap (terrain sampling, player marker)
34. Home world (persistent base between runs)
35. Save system (LocalStorage, auto-save)
36. Structure generation (villages, temples, ruins)
37. NPC dialog system
38. Enchanting & brewing
39. Visual polish (camera effects, UI animations)
40. Performance optimization (profiling, tuning)

---

## CRITICAL RULES

1. **NO STUBS** — Every function must be fully implemented. No `// TODO` or `// placeholder`.
2. **NO BROKEN IMPORTS** — Every import must resolve to an existing file. Create files before importing them.
3. **RUN ON FIRST LOAD** — The game must boot to the main menu and be playable immediately after `npm run dev`.
4. **60 FPS TARGET** — Profile and optimize. If chunk rebuilds cause drops, reduce max rebuilds per frame.
5. **MOBILE CONSIDERATION** — While desktop-first, ensure canvas resizes and touch events are handled.
6. **PROCEDURAL OVER EXTERNAL** — Prefer generating textures/sounds procedurally over requiring external files.
7. **SAVE PROGRESS** — Meta progression persists in LocalStorage. Never lose player progress.
8. **GAME FEEL IS KING** — Hitstop, screen shake, damage numbers, particles. Every interaction must FEEL good.

---

> **This is the complete specification. Build MineRogue as described. Every system. Every detail. Every number. No shortcuts. Make it legendary.**
