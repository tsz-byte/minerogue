# MineRogue ⚔️⛏️

A **3D voxel roguelike** browser game. Minecraft meets Hades meets Spelunky.

**Play it:** Run `npm run dev` and open `http://localhost:5173`

## What Is This?

MineRogue is a first-person voxel roguelike where you:
- 🌍 Explore procedurally generated worlds with 10 unique biomes
- ⛏️ Mine blocks, craft tools, build shelters
- ⚔️ Fight 22+ mob types with juicy combat (hitstop, screen shake, damage numbers)
- 🏰 Delve into dungeon towers with boss fights
- 💀 Die, earn Soul Shards, upgrade permanently
- 🔁 Go again. Every run is different.

## Quick Start

```bash
npm install
npm run dev
```

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look |
| LMB | Mine / Attack |
| RMB | Place block |
| Space | Jump |
| Shift | Sprint |
| E | Inventory |
| C | Crafting |
| F | Eat |
| Q | Drop |
| Tab | Minimap |
| ESC | Pause |

## Tech Stack

- **Three.js** r170 — 3D rendering
- **simplex-noise** v4 — procedural generation
- **Vite** 6 — build tooling
- **Web Audio API** — procedural sound effects
- Pure JavaScript, no frameworks

## Project Structure

```
src/
├── main.js              Game loop & state machine
├── engine/              Three.js renderer, input
├── world/               Chunks, generator, structures
├── entities/            Player, mobs
├── systems/             Combat, inventory, crafting, roguelike
├── audio/               Procedural sound engine
├── particles.js         GPU particle system
├── textures.js          Procedural texture atlas
└── data/                Block, item, mob, recipe definitions
```

## Docs

- `MINECRAFT_ROGUELIKE_PROMPT.md` — Full game design spec
- `GAME_STATE.md` — Current implementation status
- `FUTURE_ROADMAP.md` — Planned features and content

## License

MIT
