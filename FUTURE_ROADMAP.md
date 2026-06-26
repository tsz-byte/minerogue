# MINE ROGUE — Future Roadmap
## What It Will Be When All Is Done

**Date:** June 26, 2026
**Target Version:** 1.0.0 (Release)
**Vision:** The best browser-based voxel roguelike ever made. "Just one more run."

---

## 1. VISION STATEMENT

MineRogue at 1.0 will be a **complete, polished, endlessly replayable** browser-based voxel roguelike where every run feels unique, every death teaches something, and every upgrade makes you hungry for more. The game will have:

- **50+ hours** of content before seeing everything
- **Procedural generation** that never produces boring worlds
- **Combat that crunchs** — every hit feels like it matters
- **Deep meta-progression** that respects player time
- **A living world** with weather, water, ambient life, and atmosphere
- **Polish everywhere** — no stubs, no TODOs, no "coming soon"

---

## 2. CONTENT ROADMAP

### Phase 1: Core Polish (v0.9)
*Goal: Everything that exists today works perfectly*

| Feature | Description | Effort |
|---------|-------------|--------|
| Boss multi-phase AI | Each boss has 2-3 phases with unique attack patterns | 3 days |
| Legendary item effects | 10 legendaries with unique mechanics (fire, teleport, chain lightning, etc.) | 2 days |
| Block drop 3D pickup | Items spawn as 3D entities with physics, magnet pickup | 1 day |
| Crafting UI polish | Drag-and-drop, recipe book, auto-craft from available | 2 days |
| Inventory UI polish | Tooltip on hover, shift-click, armor equip | 1 day |
| NPC dialog system | Simple dialog tree with choices, portraits | 2 days |
| NPC trading | Buy/sell items for Soul Shards | 1 day |
| Enchanting UI | 3 random enchantments per item, lapis cost | 1 day |
| Brewing UI | Water bottle + nether wart + ingredient = potion | 1 day |
| Achievement tracking | Track and display 30+ achievements | 2 days |
| Ambient music | Procedural ambient tracks per biome (Web Audio) | 2 days |
| Bug fixes | All known issues from GAME_STATE.md | 3 days |

**Subtotal: ~23 days**

### Phase 2: Content Expansion (v0.95)
*Goal: More biomes, more mobs, more structures, more loot*

#### 2.1 New Biomes (4 additional)

| Biome | Surface | Vibe | Special |
|-------|---------|------|---------|
| **Cherry Blossom** | Pink grass | Serene, beautiful | Cherry trees, butterflies, healing shrine density +50% |
| **Mushroom Fields** | Mycelium | Eerie, safe | No hostile spawns, mooshrooms, giant mushrooms |
| **Deep Dark** | Sculk | Terrifying, silent | Warden-type mobs, sculk sensors, ancient cities |
| **End Islands** | End stone | Alien, floating | Endermen density +200%, chorus plants, end cities |

#### 2.2 New Mobs (8 additional)

| Mob | Type | HP | Special |
|-----|------|----|---------|
| **Warden** | Hostile | 200 | Blind, sonic boom, vibration tracking |
| **Breeze** | Hostile | 15 | Wind charges, knockback attacks |
| **Bogged** | Hostile | 20 | Poison arrows, swamp variant of skeleton |
| **Breeze** | Hostile | 15 | Wind charges, knockback attacks |
| **Armadillo** | Passive | 8 | Drops scutes for wolf armor |
| **Wolf** | Tameable | 8/20 | Tameable with bones, follows player, attacks mobs |
| **Cat** | Tameable | 10 | Tameable with fish, scares phantoms/creepers |
| **Allay** | Passive | 10 | Collects nearby items, brings to player |

#### 2.3 New Structures (6 additional)

| Structure | Biome | Description | Loot |
|-----------|-------|-------------|------|
| **Ancient City** | Deep Dark | Massive underground city with sculk | Enchanted diamond gear, Swift Sneak, disc fragments |
| **End City** | End Islands | Tower with shulkers | Elytra, diamond gear, shulker shells |
| **Trial Chamber** | Underground | Spawner-based challenge rooms | Trial keys, rare equipment, breeze rods |
| **Woodland Mansion** | Forest | Multi-room mansion | Totems of Undying, diamond gear, map |
| **Ocean Monument** | Ocean | Underwater temple | Prismarine, gold blocks, sponge |
| **Trail Ruins** | Any | Buried archaeological site | Decorated pottery, armor trims, rare smithing templates |

#### 2.4 Randomized Loot System

Every chest/kill will pull from **weighted loot tables** with rarity tiers:

```
COMMON (60%):    Basic tools, food, torches, coal
UNCOMMON (25%):  Iron gear, potions, enchantment books
RARE (10%):      Diamond gear, golden apples, rare materials
EPIC (4%):       Legendary fragments, unique enchantments
LEGENDARY (1%):  Full legendary items, ultra-rare artifacts
```

**Loot modifiers:**
- Fortune enchantment: +1 tier for mining drops
- Looting enchantment: +1 tier for mob drops
- Treasure Hunter upgrade: +50% rare drop chance
- Dungeon depth: deeper = better base tier
- Boss kills: guaranteed Rare+ drop

**Loot Affixes** (prefix/suffix system for generated items):
- Prefix: `Sharp` (+1 dmg), `Sturdy` (+50% dur), `Swift` (+20% speed), `Lucky` (+5% crit)
- Suffix: `of Flame` (fire aspect), `of Healing` (lifesteal), `of Haste` (mining speed)
- Generated items have 0-2 affixes based on rarity tier
- Creates infinite item variety within the existing item framework

#### 2.5 Rare Drops

| Drop | Source | Rate | Effect |
|------|--------|------|--------|
| **Dragon Egg Fragment** | Void Wyrm | 100% | Crafting ingredient for endgame gear |
| **Nether Star** | Bosses | 25% | Crafting legendary items |
| **Music Disc** | Dungeon chests | 5% | Plays a unique procedural track |
| **Trident** | Drowned mobs | 2% | Throwable melee/ranged weapon |
| **Totem of Undying** | Woodland Mansion | 100% | Survive lethal hit once |
| **Elytra** | End City | 30% | Gliding flight |
| **Smithing Template** | Trail Ruins | 15% | Upgrade gear to next tier |
| **Enchanted Book** | Library rooms | 20% | Apply specific enchantment |
| **Name Tag** | Dungeon chests | 10% | Name any mob |
| **Saddle** | Dungeon chests | 8% | Ride pigs (future feature) |

### Phase 3: Advanced Systems (v1.0)

#### 3.1 Pet System

Tameable companions that follow the player between runs:

| Pet | Tame With | Ability | Unlock |
|-----|-----------|---------|--------|
| **Wolf** | 5 Bones | Attacks hostile mobs, +10% damage | Default |
| **Cat** | 3 Raw Fish | Scares creepers/phantoms, +5% rare drops | Find in village |
| **Parrot** | 6 Seeds | Mimics mob sounds (warning), +15% shard gain | Find in jungle |
| **Fox** | 4 Berries | Picks up nearby drops automatically | Find in forest |
| **Axolotl** | 4 Tropical Fish | Heals player 1HP/30s underwater | Find in swamp |

**Pet mechanics:**
- Pets have 10 HP, respawn at home between runs
- Pet abilities are passive bonuses
- Pets can wear cosmetic accessories (hats, collars)
- Pet level: +1 per run survived, each level slightly improves ability
- Max 1 active pet per run (switch at home)

#### 3.2 Enhanced Graphics

| Enhancement | Description | Impact |
|-------------|-------------|--------|
| **Greedy meshing** | Merge adjacent same-type faces into larger quads | 5-10× fewer vertices |
| **Bloom post-processing** | Glow on lava, glowstone, enchanting tables | Visual polish |
| **Water shader** | Animated waves, transparency, reflections | Atmosphere |
| **Shadow mapping** | PCFSoft shadows from sun/moon | Depth perception |
| **Ambient particles** | Dust motes, fireflies, falling leaves | Life in the world |
| **Biome fog colors** | Unique fog tint per biome | Atmosphere |
| **Screen-space AO** | Darken corners and crevices | Visual depth |
| **God rays** | Volumetric light through trees/caves | Drama |
| **Weather effects** | Rain particles, lightning flashes, puddles | Immersion |
| **Dynamic skybox** | Clouds, stars, aurora at night | Beauty |

#### 3.3 Advanced Dungeon Generation

Replace simple tower with **procedural dungeon networks:**

- **Room graph generation**: BSP tree creates room layout
- **Room templates**: 50+ pre-designed room shapes per biome
- **Corridor types**: Straight, L-bend, T-junction, spiral staircase, bridge over void
- **Hazard rooms**: Lava parkour, arrow gauntlet, timed puzzle, mimic ambush
- **Secret rooms**: Hidden behind breakable walls (10% per floor)
- **Mini-boss rooms**: Guaranteed mini-boss every 3 floors
- **Rest rooms**: Safe zone with healing fountain, crafting station, shop NPC
- **Biome-specific themes**: Nether fortress (volcanic), woodland mansion (forest), ocean monument (swamp)

#### 3.4 Advanced Combat

| Feature | Description |
|---------|-------------|
| **Combo system** | Chain attacks for bonus damage (3-hit combo = 1.5× on 3rd hit) |
| **Perfect dodge** | Dodge within 0.2s of attack = slow-mo + crit bonus |
| **Elemental system** | Fire/Ice/Lightning/Poison/Void elements with interactions |
| **Status effect icons** | HUD shows active effects with remaining time |
| **Mob telegraph system** | Visual/audio tells 0.5-1.5s before dangerous attacks |
| **Parry system** | Shield block within 0.1s = 100% reflect + stun |
| **Ranged charge indicator** | Visual bow draw power indicator |
| **Crosshair changes** | Red on enemy, yellow on interactable, white on air |

#### 3.5 Advanced World Generation

| Feature | Description |
|---------|-------------|
| **Cave biomes** | Lush caves, dripstone caves, deep dark |
| **Underground lakes** | Large water bodies with unique mobs |
| **Ravines** | Deep vertical cracks with ore veins visible |
| **Geodes** | Amethyst geodes with crystal blocks |
| **Underground forests** | Azalea trees in lush caves |
| **Lava oceans** | Below Y=0 in volcanic biomes |
| **Structures in caves** | Mineshafts, dungeons, strongholds underground |
| **Vegetation variety** | 20+ flower types, bushes, vines, moss |

#### 3.6 Advanced Audio

| Feature | Description |
|---------|-------------|
| **Biome ambient tracks** | Unique procedural ambient per biome |
| **Dynamic music** | Intensity scales with combat/danger |
| **Reverb in caves** | Echo effect when underground |
| **Water sounds** | Flowing water, rain, ocean waves |
| **Mob vocalizations** | Unique sounds per mob type |
| **Footstep materials** | Different sounds for stone/wood/grass/sand/snow |
| **3D spatial audio** | Sounds attenuate with distance, directional |

---

## 3. TECHNICAL IMPROVEMENTS

### 3.1 Performance

| Improvement | Description | Impact |
|-------------|-------------|--------|
| Web Workers | Chunk generation in separate thread | No frame hitches |
| Greedy meshing | Merge adjacent faces | 5-10× fewer triangles |
| Geometry pooling | Reuse BufferGeometry objects | Less GC pressure |
| Texture arrays | WebGL2 DataTexture2DArray | No bleeding, 1 draw call per chunk |
| Instanced meshes | Trees, flowers, grass as InstancedMesh | Fewer draw calls |
| LOD system | Simplified chunks at distance | Higher FPS |
| Object pooling | Reuse mob/projectile objects | Less allocation |

### 3.2 Architecture

| Improvement | Description | Impact |
|-------------|-------------|--------|
| Event system | Custom event emitter for decoupling | Easier to extend |
| State machine | Formal state pattern for game states | Fewer bugs |
| Component system | ECS-lite for entities | Cleaner code |
| Type checking | JSDoc + TypeScript checking in IDE | Fewer runtime errors |
| Test suite | Unit tests for critical systems | Confidence in changes |

### 3.3 Modding Support

| Feature | Description |
|---------|-------------|
| Custom blocks | JSON-based block definitions |
| Custom items | JSON-based item definitions with effects |
| Custom mobs | JSON-based mob definitions with AI behaviors |
| Custom biomes | JSON-based biome configurations |
| Custom recipes | JSON-based crafting/smelting recipes |
| Mod loader | Simple mod loading from URL |

---

## 4. CONTENT METRICS (v1.0 TARGET)

| Category | Current | Target |
|----------|---------|--------|
| Blocks | 68 | 100+ |
| Items | 120+ | 200+ |
| Mobs | 22+ | 35+ |
| Biomes | 10 | 14+ |
| Structures | 6 | 12+ |
| Bosses | 5 | 8+ |
| Recipes | 50+ | 100+ |
| Enchantments | 8 | 15+ |
| Potions | 8 | 12+ |
| Achievements | 15 | 50+ |
| Run modifiers | 12 | 20+ |
| Pets | 0 | 5 |
| Legendary items | 10 | 15+ |
| Sound effects | 22 | 35+ |
| Biome ambient tracks | 0 | 14 |
| Structure types | 6 | 12+ |
| Room templates | 7 | 50+ |

---

## 5. DEVELOPMENT TIMELINE

| Phase | Version | Duration | Focus |
|-------|---------|----------|-------|
| **Core Polish** | v0.9 | 3-4 weeks | Boss AI, legendary effects, UI polish, NPCs |
| **Content Expansion** | v0.95 | 4-6 weeks | New biomes, mobs, structures, loot system, pets |
| **Advanced Systems** | v1.0 | 4-6 weeks | Graphics, dungeons, combat, audio, modding |
| **Polish & QA** | v1.0 | 2 weeks | Bug fixes, performance, playtesting |
| **Total** | — | 13-18 weeks | — |

---

## 6. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| First session duration | >15 minutes |
| Return rate (next day) | >40% |
| Runs before first win | 10-20 |
| Total runs for 100% completion | 50-100 |
| FPS on mid-range hardware | 60 |
| Load time | <3 seconds |
| Build size | <2MB |
| "Just one more run" feeling | ✅ |

---

## 7. DESIGN PRINCIPLES (UNCHANGING)

1. **DIGITAL LEGO SANDBOX** — Every block is breakable, placeable, and has purpose
2. **ROGUELIKE SOUL** — Permadeath with meaning, unique runs, escalating challenge
3. **COMBAT THAT CRUNCHS** — Hitstop, shake, particles, damage numbers. Every hit matters.
4. **DISCOVERY DOPAMINE** — Hidden shrines, rare ores, secret rooms, legendary items
5. **PROGRESSION ADDICTION** — Soul Shards earned on every run, meaningful upgrades
6. **RESPECT PLAYER TIME** — 25-40 minute runs, always earn something, never waste effort
7. **POLISH OVER SCOPE** — Better to have 10 polished features than 50 rough ones
8. **BROWSER FIRST** — No downloads, no installs, runs anywhere with a modern browser

---

*This roadmap is a living document. Priorities shift based on playtesting feedback. The goal is always: make them say "just one more run."*
