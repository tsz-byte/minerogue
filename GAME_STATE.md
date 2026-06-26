# MINE ROGUE — Current State Document
## What Exists Today

**Date:** June 26, 2026
**Version:** 0.8.0 (Pre-Alpha)
**Build:** 34 modules, 652KB output, 1.68s build time
**Status:** Playable prototype — core loop functional, polish ongoing

---

## 1. EXECUTIVE SUMMARY

MineRogue is a **browser-based 3D voxel roguelike** built with Three.js r170, simplex-noise v4, and Vite 6. The player spawns in a procedurally generated voxel world, mines blocks, crafts tools, fights mobs, explores dungeons, dies, earns Soul Shards, upgrades in the Soul Shop, and dives back in. Every run is different.

**What works today:** You can load the game, walk around a 3D voxel world with 10 biomes, mine blocks (items go to inventory), craft tools, fight mobs with hitstop/shake/particles, explore dungeon towers, die, earn Soul Shards, buy upgrades, and start a new run. The core roguelike loop is functional.

**What's still in progress:** Boss multi-phase AI, enchanting/brewing UIs, NPC dialog/trading, achievement tracking, legendary item unique effects, weather, water physics.

---

## 2. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Build | Vite | 6.x |
| 3D Engine | Three.js | r170 |
| Noise | simplex-noise | v4 |
| Language | JavaScript (ES modules) | ES2022 |
| Audio | Web Audio API (procedural) | native |
| Persistence | localStorage | native |

---

## 3. PROJECT STRUCTURE

```
minerogue/
├── index.html              (242 lines — full UI shell)
├── vite.config.js          (15 lines)
├── package.json
├── MINECRAFT_ROGUELIKE_PROMPT.md  (1,536 lines — full spec)
├── assets/
│   ├── textures/           (block_atlas.png, biome_atlas.png)
│   ├── sprites/            (item_atlas.png, mob_atlas.png, boss_atlas.png)
│   └── ui/                 (ui_atlas.png)
├── dist/                   (652KB build output)
└── src/
    ├── main.js             (650 lines — game loop, state machine)
    ├── engine/
    │   ├── renderer.js     (84 lines — Three.js scene, camera, fog)
    │   └── input.js        (117 lines — keyboard, mouse, pointer lock)
    ├── world/
    │   ├── world.js        (162 lines — chunk manager, block access)
    │   ├── chunk.js        (458 lines — face culling, AO, UV mapping)
    │   ├── generator.js    (309 lines — terrain, biomes, caves, ores, trees)
    │   └── structures.js   (232 lines — villages, temples, ruins)
    ├── entities/
    │   ├── player.js       (979 lines — physics, mining, placing, camera)
    │   └── mob-manager.js  (872 lines — AI, spawning, rendering, physics)
    ├── systems/
    │   ├── combat.js       (265 lines — melee, ranged, juice effects)
    │   ├── inventory.js    (140 lines — slots, stacking, armor)
    │   ├── crafting.js     (107 lines — recipe matching)
    │   ├── furnace.js      (113 lines — smelting with fuel)
    │   ├── daynight.js     (300 lines — sky, lighting, sun/moon)
    │   ├── roguelike.js    (276 lines — modifiers, shard calculation)
    │   ├── save.js         (143 lines — localStorage persistence)
    │   ├── home-world.js   (221 lines — persistent base)
    │   ├── dungeon.js      (207 lines — multi-floor tower generation)
    │   └── shrines.js      (157 lines — 8 blessing effects)
    ├── audio/
    │   └── engine.js       (496 lines — 22 procedural Web Audio sounds)
    ├── particles.js        (412 lines — GPU-efficient Points-based system)
    ├── textures.js         (1,359 lines — procedural 256×256 atlas)
    ├── ui/
    │   ├── hud.js          (239 lines — hearts, hunger, hotbar, toasts)
    │   ├── menus.js        (299 lines — main menu, death, pause, shop, settings)
    │   └── minimap.js      (159 lines — top-down terrain view)
    └── data/
        ├── blocks.js       (79 lines — 68 block definitions)
        ├── items.js        (175 lines — 120+ item definitions)
        ├── mobs.js         (441 lines — 22+ mob definitions)
        └── recipes.js      (218 lines — 50+ crafting/smelting recipes)
```

**Total: 29 source files, 9,669 lines of JavaScript**

---

## 4. WHAT'S IMPLEMENTED AND WORKING

### 4.1 Core Engine ✅
- Three.js WebGL renderer with pixel-art aesthetic (antialias off, pixel ratio 1)
- PerspectiveCamera (70° FOV, near 0.1, far 300)
- Exponential fog matching sky color
- Pointer lock for mouse-look
- Frame-rate independent game loop with dt scaling
- Error boundary in game loop (one crash doesn't freeze everything)

### 4.2 Voxel World ✅
- 16×16×16 chunk system with face culling
- Per-vertex ambient occlusion (3-neighbor check, diagonal flip)
- Texture atlas UV mapping (256×256, 72 tiles)
- Custom shader injection for AO via `onBeforeCompile`
- Chunk loading/unloading based on distance (8 chunk render distance)
- Max 2 chunk rebuilds per frame
- Frustum culling per chunk AABB

### 4.3 World Generation ✅
- 4-octave simplex noise terrain heightmap
- 3D simplex noise caves
- 10 biomes (Plains, Forest, Desert, Snow, Swamp, Mountains, Crystal Caverns, Corruption, Floating Islands, Volcanic)
- Biome selection via temperature/moisture noise maps
- Ore generation per Y range (Coal, Iron, Gold, Diamond, Redstone, Crystal)
- Tree generation (Oak, Birch, Spruce, Cactus) with cross-chunk support
- Structure placement (villages, temples, ruins, portal rooms)

### 4.4 Player Controller ✅
- WASD movement with direct velocity (Minecraft-style, frame-rate independent)
- Sprint (Shift, 7.0 blocks/sec vs 5.0 walk)
- Jump (8.5 blocks/sec velocity, clears 1-block steps)
- AABB collision detection against solid blocks
- Gravity (-20 blocks/sec²), terminal velocity
- Mining with tool multipliers, hardness, mining levels
- Block placing with collision check
- Camera bob (walk/sprint), FOV lerp on sprint (70→80)
- Landing impact camera dip, fall damage (>3 blocks)
- Block crack overlay (wireframe reddening with progress)
- Block highlight wireframe on targeted block

### 4.5 Combat ✅
- Melee: 4-block reach, 60° cone, per-weapon cooldowns
- Ranged: Bow with charge time, arrow physics (dt-based, integrated)
- Shield: 50% frontal block chance
- **The Juice:**
  - Hitstop (30ms normal, 80ms crit, 100ms kill)
  - Screen shake (proportional to hit severity)
  - Particle bursts (hit, crit, kill, explosion)
  - Damage numbers (floating, white/yellow/red)
  - Enemy flash white on hit (100ms)
  - Knockback (2× on crit)
  - Red vignette on player damage
  - Kill slow-mo (0.5× for 200ms)
  - Crit chance (10% base, 25% if falling)

### 4.6 Mob System ✅
- 22+ mob types: 6 passive, 14 hostile, 4 mini-bosses, 1 final boss
- AI state machine: Idle → Patrol → Chase → Attack
- Passive: wander, flee when hit
- Hostile: aggro on range, chase, attack on cooldown
- Flying mobs hover at player eye level
- Mob spawning: every 3s, max 40, light-based, biome-filtered
- Despawn >96 blocks from player
- Box-based rendering per body type (humanoid, quadruped, spider, chicken)
- Walk animation (arm/leg swing), idle bob

### 4.7 Inventory & Crafting ✅
- 36-slot inventory (expandable to 45/54 via upgrades)
- 9-slot hotbar with number key selection
- 4 armor slots
- Item stacking (respecting stack sizes)
- 2×2 crafting in inventory, 3×3 crafting table
- Auto-recipe detection (shaped + shapeless matching)
- 50+ crafting recipes (tools, armor, furniture, combat items)
- Smelting with fuel consumption

### 4.8 Day/Night Cycle ✅
- 20-minute full cycle (dawn → day → dusk → night)
- Sky color interpolation (pink → blue → orange → dark blue)
- DirectionalLight rotates as sun
- AmbientLight intensity lerps
- Fog density changes with time
- Stars visible at night
- Moon at opposite position

### 4.9 Roguelike Systems ✅
- Permadeath: lose inventory, world gone
- Soul Shard calculation (mobs×1 + blocks×0.1 + bosses×50 + structures×10 + ...)
- 12 run modifiers (Volcanic, Eternal Night, Abundant, Swarm, Cursed, etc.)
- Difficulty scaling with total runs completed
- Run stats tracking (mobs killed, blocks mined, distance, depth)

### 4.10 Soul Shop ✅
- 20+ upgrades across 4 categories (Survival, Combat, Utility, Abilities)
- Extra Hearts (4 ranks), Iron Stomach, Stone/Iron Start, Backpack I/II
- Lucky Strike, Tough Skin, Night Owl, Treasure Hunter, Soul Magnet
- Phoenix (revive once), Dash, Ground Slam, Parry, Second Wind, Treasure Sense
- Persistent via localStorage

### 4.11 Dungeon System ✅
- Multi-floor tower (3-5 floors)
- 7 room types: Spawner (35%), Treasure (15%), Shrine (15%), Trap (15%), Arena (10%), Puzzle (5%), Lore (5%)
- Boss room at top floor
- Ladder connections between floors

### 4.12 Home World ✅
- Persistent 64×32×64 world
- Flat grass terrain with starter house
- Crafting Table, Furnace, Vault Chest, Bed, Portal Frame
- 6 NPC stalls
- Permanent day, no hostiles
- Auto-save every 60s

### 4.13 Audio ✅
- 22 procedural sounds via Web Audio API
- Block break/place, sword swing/hit, crit hit, damage, mob death
- Footsteps (grass/stone), eat, drink, pickup, level up, player death
- Explosion, cave ambient, night ambient, boss spawn, shrine, portal
- Arrow shoot/hit
- Each sound uses oscillators + noise buffers + envelope shaping + filtering

### 4.14 Particles ✅
- GPU-efficient Points-based system (300 max particles)
- Single BufferGeometry with pooled slots
- Per-particle position, color, size, life, velocity, gravity
- Preset effects: blockBreak, hit, crit, kill, explosion, torch, shrine, portal

### 4.15 UI ✅
- Main menu (golden title, gradient background, Play/Home/Shop/Settings)
- HUD (hearts above hotbar, hunger bar, hotbar with item icons)
- Crosshair, block info, mining progress bar
- Damage overlay (red vignette), low health pulse
- Damage numbers (floating, crit styling)
- Toast messages
- Death screen (stats, shard counter, New Run/Menu)
- Pause screen (stats, Resume/Quit)
- Inventory screen (36 slots, armor, 2×2 crafting)
- Crafting table screen (3×3 grid)
- Furnace screen (input/fuel/output with progress)
- Shop screen (upgrade list with costs)
- Settings screen (volume, sensitivity, render distance, FPS counter)
- Minimap (top-down block colors, player arrow)

### 4.16 Persistence ✅
- Meta-progression in `minerogue_meta` (soul shards, upgrades, stats, achievements)
- Home world in `minerogue_home` (blocks, chests)
- Settings in `minerogue_settings`
- Auto-save on death and periodically

---

## 5. WHAT'S PARTIALLY IMPLEMENTED

| System | Status | What's Missing |
|--------|--------|---------------|
| Boss AI | ⚠️ Spawns as regular mob | No multi-phase mechanics, no unique attacks |
| Structure generation | ⚠️ Basic placement | Simple block layouts, not full procedural buildings |
| Enchanting table | ⚠️ Block exists | No enchanting UI |
| Brewing stand | ⚠️ Block exists | No brewing UI |
| NPC dialog | ⚠️ NPCs defined | No dialog system, no trading |
| Legendary items | ⚠️ Stats defined | No unique effects (Flame Sword fire, Void Blade heal, etc.) |
| Achievement system | ⚠️ Data defined | No tracking, no display |
| Mob drops | ⚠️ Drop tables defined | Drops go to inventory directly (no 3D pickup for most) |
| Curse system | ⚠️ Data defined | No stacking curses |

---

## 6. WHAT'S NOT IMPLEMENTED

| System | Priority | Description |
|--------|----------|-------------|
| Weather | Low | Rain, snow, thunder |
| Water physics | Low | Swimming, current, drowning |
| Portal mechanics | Medium | Enter new roguelike world via portal |
| New Game+ | Medium | Harder modifiers after first win |
| Void Wyrm boss fight | High | Final boss with 3 phases |
| Co-op multiplayer | Low | WebSocket-based 2-player |
| Mobile touch controls | Low | Virtual joystick, tap to mine |
| Greedy meshing | Medium | Reduce vertex count 5-10× |
| Web Workers for chunks | Medium | Non-blocking terrain generation |
| Post-processing | Low | Bloom for lava/glowstone, SSAO |

---

## 7. KNOWN ISSUES

1. **Block drops for some blocks may not resolve** — blocks that drop themselves (Dirt, Sand, etc.) use block name as item name; if no matching item exists, falls back to block ID which may not have proper item data
2. **Inventory UI click interaction** — slot clicking may not work perfectly in all browsers
3. **Crafting table UI** — 3×3 grid interaction needs polish
4. **Mob spawning** — may spawn inside walls occasionally
5. **Chunk boundary seams** — minor visual seams at chunk edges
6. **No ambient music** — only sound effects, no background music

---

## 8. PERFORMANCE METRICS

| Metric | Target | Current |
|--------|--------|---------|
| FPS | 30-60 | 60 (on modern hardware) |
| Render distance | 8 chunks | 8 chunks |
| Chunk rebuilds/frame | 2 | 2 |
| Max mobs | 40 | 40 |
| Max particles | 300 | 300 |
| Build size | <1MB | 652KB |
| Load time | <3s | ~2s |
| Memory | <100MB | ~50MB |

---

## 9. CONTROLS

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look (pointer lock) |
| LMB | Mine / Attack |
| RMB | Place block |
| Space | Jump |
| Shift | Sprint |
| E | Inventory |
| C | Crafting table |
| F | Eat selected food |
| Q | Drop selected item |
| 1-9 | Select hotbar slot |
| Scroll | Cycle hotbar |
| Tab | Toggle minimap |
| ESC | Pause / close menu |

---

*This document reflects the game state as of June 26, 2026. The game is playable and the core roguelike loop works. Continued development focuses on polish, missing systems, and the content roadmap in DOCUMENT 2.*
