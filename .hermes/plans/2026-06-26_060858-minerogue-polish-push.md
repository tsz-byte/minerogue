# MineRogue Polish Push Implementation Plan

> **For Hermes:** Execute this plan directly in-repo, verify each milestone with build and browser checks, then commit and push cleanly.

**Goal:** Deliver a polished MineRogue build that fixes broken crafting and menu closing, removes the ugly hand artifact, improves content/QoL systems, verifies core gameplay flows, and ships to GitHub.

**Architecture:** Fix the broken cross-system wiring first (input state machine, crafting name/id resolution, structure/chest integration), then do targeted rendering/UI improvements, then add progression/QoL layers on top of the stable baseline. Keep edits surgical inside the current JS/Vite architecture rather than refactoring the game loop.

**Tech Stack:** Vite, vanilla JS, Three.js, HTML/CSS UI, procedural worldgen.

---

## Current Context / Confirmed Findings

### Verified baseline
- Build command: `npm run build`
- Current build status: **PASSING**
- Git remote: `origin https://github.com/tsz-byte/minerogue.git`
- GitHub auth: **logged in as `tsz-byte`**

### Confirmed root causes already identified
1. **E/C close bug in menu states**
   - File: `src/main.js`
   - Cause: input handler returns early unless state is `PLAYING` or `HOME`, making later `INVENTORY` / `CRAFTING_TABLE` close branches unreachable.
2. **Crafting broken across block-heavy recipes / recipe book paths**
   - File: `src/ui/menus.js`
   - Cause: `_craftFromRecipe()` and recipe availability checks only resolve ingredients via `getItemByName()`, but many recipes use block names like `Oak Planks`, `Cobblestone`, `Chest`, `Crafting Table`.
3. **Legacy crafting system has broken imports + incomplete name resolution**
   - File: `src/systems/crafting.js`
   - Cause: imports point to `../../data/...` instead of `../data/...`, and grid/result resolution only uses items for ingredient name conversion.
4. **Minimap toggle mismatch**
   - File: `src/main.js`
   - Cause: current toggle is bound to `Tab`, but requested behavior is `M`.
5. **Structure chests exist visually but likely lack meaningful loot behavior integration**
   - Files: `src/world/structures.js`, `src/systems/dungeon.js`, related interaction/wold files
   - Cause: chest blocks are placed, but need validation that they become useful loot opportunities in runtime.

### Strong suspects still needing runtime confirmation
- Hand green rectangle is likely coming from sleeve/hand composition in `src/ui/hand.js` rather than atlas corruption.
- Mob overlay/wrapping issues are likely caused by texture application being limited mostly to body meshes in `src/entities/mob-manager.js`, leaving heads/limbs/unique parts on flat materials.
- XP/leveling appears only partially present (level-up sound exists), so the actual progression loop likely needs wiring rather than a from-scratch system.

---

## Files Likely to Change

### Already confirmed high-priority edits
- `src/main.js`
- `src/ui/menus.js`
- `src/systems/crafting.js`
- `src/ui/hand.js`
- `src/entities/mob-manager.js`
- `src/world/structures.js`
- `src/systems/dungeon.js`

### Likely supporting edits
- `src/world/world.js`
- `src/entities/player.js`
- `src/ui/minimap.js`
- `src/data/items.js`
- `src/data/blocks.js`
- `src/data/recipes.js`
- `src/index.html` or HUD-related UI files if new overlays are added

---

## Execution Plan

### Phase 1 — Baseline lock + bugfix foundation

#### Task 1: Fix menu close state machine
**Objective:** Make `E` / `C` reliably close inventory and crafting screens.

**Files:**
- Modify: `src/main.js`

**Steps:**
1. Move close-key handling above the early state guard, or broaden the guard so `INVENTORY` and `CRAFTING_TABLE` are handled before returning.
2. Ensure `E` toggles inventory and `C` toggles crafting consistently in both open and closed states.
3. Keep pointer-lock + virtual-cursor behavior intact.
4. Rebuild.

**Validation:**
- `npm run build`
- Browser check: open inventory with `E`, close with `E`; open crafting table UI, close with `C` and `E` as intended.

#### Task 2: Fix recipe-book crafting ingredient resolution
**Objective:** Make crafting actually consume/check both item ingredients and block ingredients.

**Files:**
- Modify: `src/ui/menus.js`
- Possibly modify: `src/data/items.js`, `src/data/blocks.js` if shared helpers are useful

**Steps:**
1. Introduce a shared name resolver that checks **item name first, block name second** and returns the numeric ID either way.
2. Use that resolver in:
   - recipe availability counting
   - `canCraft` checks
   - ingredient consumption
   - result rendering text/icon
3. Ensure inventory-only 2x2 recipes and crafting-table recipe-book crafting both work for blocks like planks/cobblestone.
4. Rebuild.

**Validation:**
- `npm run build`
- Browser check:
  - log → planks
  - planks → sticks
  - planks → crafting table
  - cobblestone → furnace

#### Task 3: Repair / align `CraftingSystem`
**Objective:** Prevent the codebase from having a second broken crafting path.

**Files:**
- Modify: `src/systems/crafting.js`

**Steps:**
1. Fix import paths from `../../data/...` to `../data/...`.
2. Resolve ingredient names from both items and blocks when checking grids.
3. Resolve recipe result IDs from both items and blocks.
4. Ensure the system behavior matches the UI crafting rules instead of diverging.
5. Rebuild.

**Validation:**
- `npm run build`
- Quick smoke via browser or direct call path if used by table/inventory systems.

---

### Phase 2 — Visual cleanup + content integration

#### Task 4: Remove the green rectangle around the hand
**Objective:** Make the first-person hand look clean with no ugly sleeve bleed/box artifact.

**Files:**
- Modify: `src/ui/hand.js`

**Steps:**
1. Adjust sleeve dimensions/position so it no longer forms a visible green slab around skin geometry.
2. If needed, split arm hierarchy so sleeve sits behind the hand instead of intersecting it.
3. Keep animation pivots intact.
4. Verify with empty hand and held tools.

**Validation:**
- `npm run build`
- Browser visual inspection in idle, swing, and movement states.

#### Task 5: Fix mob texture overlays / wrapping consistency
**Objective:** Ensure mobs use their procedural texture atlas coherently on visible body parts.

**Files:**
- Modify: `src/entities/mob-manager.js`
- Inspect/modify if needed: `src/textures/mob-textures.js`

**Steps:**
1. Audit which parts currently receive atlas UVs/materials.
2. Extend atlas application beyond only the body where appropriate (head, torso, special visible parts) without breaking unique emissive/eye details.
3. Avoid random flat-color mismatches between textured and untextured parts.
4. Rebuild and inspect several mob families.

**Validation:**
- `npm run build`
- Browser check on at least: zombie, skeleton, spider, creeper, cow/pig/chicken, boss variant.

#### Task 6: Put real loot chests into structures/dungeons
**Objective:** Make structure chest placement feel intentional and rewarding.

**Files:**
- Modify: `src/world/structures.js`
- Modify: `src/systems/dungeon.js`
- Likely modify: `src/world/world.js` and/or interaction files if chest contents are stored there

**Steps:**
1. Keep chest blocks in generated structures, but add runtime loot data/storage keyed by world position.
2. Add or wire chest interaction/opening so placed chests produce loot rather than being decorative blocks.
3. Make room types influence loot quality (e.g. dungeon boss > treasure > ruins).
4. Ensure generated structures place chests in sensible accessible spots.

**Validation:**
- `npm run build`
- Browser/world check: find structure, open chest, receive loot, chest state persists or empties correctly.

---

### Phase 3 — Systems/QoL push

#### Task 7: Rebind minimap toggle to `M` and improve toggle feel
**Objective:** Match requested control scheme and make the minimap feel intentional.

**Files:**
- Modify: `src/main.js`
- Possibly modify: `src/ui/minimap.js`

**Steps:**
1. Change toggle from `Tab` to `KeyM`.
2. Add small polish if easy: remembered visibility state, clearer frame styling, faster refresh when visible.
3. Ensure no conflict with existing controls.

**Validation:**
- `npm run build`
- Browser check: `M` toggles minimap on/off cleanly.

#### Task 8: Add / finish XP and leveling loop
**Objective:** Give the player a satisfying progression layer.

**Files:**
- Likely modify: `src/main.js`, `src/entities/player.js`, `src/ui/hud.js`

**Steps:**
1. Audit existing level-up sound/hook and determine missing data model.
2. Add XP sources (combat, mining, exploration/chests if appropriate).
3. Add level thresholds and level-up rewards (health, damage, utility, or upgrade points — tuned lightly, not bloated).
4. Add HUD feedback for XP gain and current level.

**Validation:**
- `npm run build`
- Browser check: gain XP through play, trigger level-up, confirm visible/audio feedback and persistent state where applicable.

#### Task 9: Inventory QoL pass
**Objective:** Make inventory handling less annoying without a redesign.

**Files:**
- Likely modify: `src/systems/inventory.js`, `src/ui/menus.js`

**Steps:**
1. Add small but high-value improvements:
   - better stack merging
   - easier armor equip behavior
   - clearer slot feedback / counts / full-inventory behavior
   - optional quick-transfer behavior if already compatible with current UI
2. Preserve current virtual-cursor workflow.
3. Rebuild.

**Validation:**
- `npm run build`
- Browser check: drag/drop, equip armor, craft into near-full inventory, pick up items when almost full.

#### Task 10: Final polish pass
**Objective:** Smooth rough edges that are in the critical path of the updated build.

**Files:**
- Touch only what is justified by runtime issues found during verification

**Steps:**
1. Fix any newly exposed friction from the above work.
2. Keep changes tight — no unrelated refactors.
3. Rebuild.

---

## Verification Checklist

### Build
- Run: `npm run build`
- Expected: success, only existing chunk-size warning acceptable unless new warnings appear.

### Browser gameplay smoke
1. Launch local preview/dev server.
2. Verify inventory open/close with `E`.
3. Verify crafting table open/close with `C` / `E` behavior.
4. Verify crafting recipes:
   - Wood → Oak Planks
   - Oak Planks → Stick
   - Oak Planks x4 → Crafting Table
   - Cobblestone ring → Furnace
5. Verify hand visual during idle + swings.
6. Verify `M` toggles minimap.
7. Verify at least one structure chest gives loot.
8. Verify at least a few mob types render with coherent textures.
9. Verify XP/leveling visibly advances.

### Git / release
- `git status`
- Review diff for only intended files
- Commit with a clear message
- Push to `origin/master`

---

## Risks / Tradeoffs

- Chest runtime loot may require a small persistence model in world state; keep it minimal and keyed by coordinates.
- Mob texture fixes can get messy if over-generalized; prioritize visible correctness over a big renderer rewrite.
- XP/leveling should stay lightweight enough not to destabilize balance during this polish push.
- Existing modified files in the workspace mean every edit must preserve prior fixes and avoid regressing already-passing build state.

---

## Immediate Next Move

1. Fix `src/main.js` menu close/input flow.
2. Fix block-aware recipe resolution in `src/ui/menus.js`.
3. Align `src/systems/crafting.js` so there is not a second broken crafting path.
4. Rebuild before moving to visuals.
