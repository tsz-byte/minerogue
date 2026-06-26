<div align="center">

# ⚔️⛏️ MINE ROGUE

### A 3D Voxel Roguelike Browser Game

**Minecraft × Hades × Spelunky**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Three.js](https://img.shields.io/badge/three.js-r170-049ef4)]()
[![Vite](https://img.shields.io/badge/vite-6-646cff)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

**🌍 Explore** · **⛏️ Mine** · **🔨 Craft** · **⚔️ Fight** · **💀 Die** · **🔁 Repeat**

</div>

## 🎮 Play Now

**One-click start** — just double-click:

```
START_GAME.bat
```

Or manually:

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## 🕹️ Controls

| Key | Action | | Key | Action |
|-----|--------|-|-----|--------|
| `WASD` | Move | | `1-9` | Select hotbar slot |
| `Mouse` | Look | | `Scroll` | Cycle hotbar |
| `LMB` | Mine / Attack | | `E` | Inventory |
| `RMB` | Place block | | `C` | Crafting Table |
| `Space` | Jump | | `F` | Eat food |
| `Shift` | Sprint | | `Q` | Drop item |
| `Tab` | Minimap | | `ESC` | Pause |

## ✨ Features

### 🌍 Procedural Worlds
- **10 unique biomes** — Forest, Desert, Tundra, Swamp, Mushroom, Crystal, Volcanic, Ocean, Sky, Void
- **Simplex noise terrain** with caves, ravines, and ore veins
- **Structures** — Village ruins, dungeon towers, desert temples, portal rooms
- **Day/night cycle** with dynamic lighting, stars, and moon

### ⚔️ Combat System
- **22+ mob types** — Zombies, Skeletons, Spiders, Creepers, Endermen, Slimes, and more
- **Procedural mob textures** — unique face/body textures per mob type
- **Juicy game feel** — hitstop, screen shake, damage numbers, particles
- **Boss fights** — Spider Queen, Void Wyrm, Crystal Golem, Necromancer
- **First-person hand model** with tool-specific swing animations

### 🔨 Crafting & Inventory
- **120+ items** — Tools, weapons, armor, food, potions, materials
- **Drag-and-drop inventory** with item texture icons
- **2×2 crafting** in inventory, **3×3 crafting table** with recipe book
- **One-click crafting** from recipe book when materials are available
- **Custom in-game cursor** — no system cursor escape

### 🏰 Roguelike Progression
- **Permadeath** with Soul Shard rewards
- **Soul Shop** — 20+ permanent upgrades (Extra Hearts, Iron Start, Phoenix Revive, Dash...)
- **Run modifiers** that change each attempt
- **Home World** — build, store, and prepare between runs

### 🎨 Visual Polish
- **Procedural texture atlas** — all blocks and items rendered from code
- **Mob texture atlas** — unique face textures for every mob type
- **Transparent block rendering** — leaves, water, glass with proper alpha
- **Ambient occlusion** on block faces
- **Fog, sky gradient, and stars**

### 🔊 Audio
- **Fully procedural** Web Audio engine — no audio files needed
- **40+ sound effects** — mining, combat, footsteps, ambient, UI
- **Dynamic music** that responds to game state

## 📁 Project Structure

```
src/
├── main.js                  Game loop & state machine
├── engine/
│   ├── renderer.js          Three.js setup, camera, fog
│   └── input.js             Keyboard, mouse, pointer lock
├── world/
│   ├── generator.js         Terrain generation (simplex noise)
│   ├── chunk.js             Chunk meshing with AO
│   ├── world.js             Chunk management
│   └── structures.js        Structure generation
├── entities/
│   ├── player.js            Player physics & movement
│   └── mob-manager.js       Mob AI, spawning, textures
├── systems/
│   ├── combat.js            Hitstop, shake, damage numbers
│   ├── inventory.js         Item storage & management
│   ├── crafting.js          Crafting logic
│   ├── roguelike.js         Modifiers, shards, upgrades
│   ├── daynight.js          Day/night cycle
│   ├── dungeon.js           Dungeon generation
│   ├── save.js              localStorage persistence
│   └── home-world.js        Home base system
├── ui/
│   ├── hud.js               Hearts, hunger, hotbar
│   ├── menus.js             Inventory, crafting, recipe book
│   ├── hand.js              First-person hand model
│   └── minimap.js           Minimap overlay
├── textures/
│   └── mob-textures.js      Procedural mob face atlas
├── audio/
│   └── engine.js            Procedural sound engine
├── data/
│   ├── blocks.js            68 block types
│   ├── items.js             120+ item definitions
│   ├── mobs.js              22+ mob definitions
│   └── recipes.js           50+ crafting recipes
├── textures.js              Block & item texture atlases
└── particles.js             Particle system
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Rendering | Three.js r170 |
| Terrain | simplex-noise v4 |
| Build | Vite 6 |
| Audio | Web Audio API (procedural) |
| Language | Vanilla JavaScript (no frameworks) |
| Storage | localStorage |

## 📋 Docs

- [`MINECRAFT_ROGUELIKE_PROMPT.md`](MINECRAFT_ROGUELIKE_PROMPT.md) — Full game design spec
- [`GAME_STATE.md`](GAME_STATE.md) — Implementation status
- [`FUTURE_ROADMAP.md`](FUTURE_ROADMAP.md) — Planned features

## 📄 License

MIT
