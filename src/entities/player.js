// MineRogue - Player Entity
// First-person player with physics, mining, placing, camera control, hunger
import * as THREE from 'three';
import { BLOCKS, BLOCK_MAP, getBlock } from '../data/blocks.js';
import { ITEMS, ITEM_MAP, getItem, getItemByName, isTool, isFood } from '../data/items.js';

// Physics constants (all per-second, frame-rate independent)
const GRAVITY = -20;           // blocks per second squared (was -0.025/frame)
const JUMP_VELOCITY = 7.5;     // blocks per second (slightly lower for tighter control)
const TERMINAL_VELOCITY = -50; // blocks per second
const WALK_SPEED = 5.0;        // blocks per second (slightly above Minecraft's 4.3)
const SPRINT_SPEED = 7.0;      // blocks per second (roguelike feel, above MC's 5.6)
const GROUND_FRICTION = 10.0;  // friction coefficient per second
const AIR_FRICTION = 2.0;      // friction coefficient per second

// Hitbox
const HITBOX_W = 0.6;
const HITBOX_H = 1.8;
const HITBOX_D = 0.6;
const EYE_HEIGHT = 1.62;

// Mining / placing
const MINE_REACH = 5;
const MOUSE_SENSITIVITY = 0.002;

export class Player {
  /**
   * @param {import('../world/world.js').World} world
   * @param {THREE.Camera} camera
   * @param {THREE.Scene} scene
   * @param {import('../audio/engine.js').AudioEngine} audio
   * @param {import('../systems/inventory.js').InventorySystem} inventory
   */
  constructor(world, camera, scene, audio, inventory) {
    this.world = world;
    this.camera = camera;
    this.scene = scene;
    this.audio = audio;
    this.inventory = inventory;

    // Position & velocity (direct properties)
    this.position = new THREE.Vector3(0, 80, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this._onGround = false;

    // Stats (direct properties per spec)
    this.health = 20;
    this.maxHealth = 20;
    this.hunger = 20;
    this._maxHunger = 20;
    this.phoenixUsed = false;

    // Camera rotation (direct properties per spec)
    this.yaw = 0;
    this.pitch = 0;

    // Camera parent object for yaw rotation
    this._yawObject = new THREE.Object3D();
    this._yawObject.position.copy(this.position);
    this._yawObject.add(this.camera);
    this.camera.position.set(0, EYE_HEIGHT, 0);
    scene.add(this._yawObject);

    // Camera shake
    this._cameraShake = new THREE.Vector3(0, 0, 0);
    this._cameraShakeIntensity = 0;
    this._cameraShakeDecay = 0.9;

    // Damage flash overlay (0-1)
    this._damageFlash = 0;

    // Selected hotbar slot (direct property, 0-8)
    this.selectedSlot = 0;

    // Mining state
    this.miningProgress = 0;
    this._mineTargetKey = null;

    // Placing cooldown
    this._placeCooldown = 0;

    // Fall tracking for fall damage
    this._fallStartY = -1;

    // Spawn protection (3 seconds of invulnerability after spawning)
    this._spawnProtection = 3;

    // Landing impact (camera dip)
    this._landingImpact = 0;

    // Camera bob state
    this._bobPhase = 0;
    this._bobAmount = 0;

    // FOV lerp
    this._baseFOV = 70;
    this._currentFOV = 70;

    // Block crack overlay
    this._crackOverlay = null;
    this._crackLevel = 0;
    // Pre-generated crack overlays for each stage (0-10)
    this._crackOverlays = [];
    this._breakParticles = [];
    this._createCrackStages();

    // Hunger / regen timers
    this._hungerTimer = 0;
    this._regenTimer = 0;
    this._starveTimer = 0;

    // Sprint
    this._sprinting = false;

    // Block highlight wireframe
    this._highlightMesh = null;
    this._createHighlight();

    // Dropped items in world (managed by player, mob-manager can push into this)
    this.droppedItems = [];
  }

  // ===== SETUP =====

  _createHighlight() {
    const geo = new THREE.BoxGeometry(1.005, 1.005, 1.005);
    const edges = new THREE.EdgesGeometry(geo);
    const mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    this._highlightMesh = new THREE.LineSegments(edges, mat);
    this._highlightMesh.visible = false;
    this.scene.add(this._highlightMesh);
  }

  /**
   * Pre-generate 10 crack overlay stages with increasing line density.
   * Each stage is a THREE.LineSegments that gets shown/hidden.
   */
  _createCrackStages() {
    for (let stage = 0; stage <= 10; stage++) {
      const positions = [];
      if (stage > 0) {
        // More lines at higher stages: 2 + stage*2 lines
        const lineCount = 2 + stage * 2;
        for (let i = 0; i < lineCount; i++) {
          const face = Math.floor(Math.random() * 6);
          const pts = this._generateCrackLine(face);
          positions.push(...pts);
        }
        // Add cross-hatching at higher stages for density
        if (stage >= 5) {
          for (let i = 0; i < stage - 3; i++) {
            const face = Math.floor(Math.random() * 6);
            const pts = this._generateShortCrackLine(face);
            positions.push(...pts);
          }
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      // Color darkens from reddish to black as cracks deepen
      const darkness = stage / 10;
      const r = 0.8 - darkness * 0.8;
      const g = 0.2 - darkness * 0.2;
      const b = 0.2 - darkness * 0.2;
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(r, g, b),
        linewidth: 2,
        transparent: true,
        opacity: stage === 0 ? 0 : (0.4 + stage * 0.06),
        depthTest: true,
      });

      const mesh = new THREE.LineSegments(geo, mat);
      mesh.visible = false;
      mesh.position.set(0.5, 0.5, 0.5);
      this._crackOverlays.push(mesh);
    }
  }

  /**
   * Generate a crack line segment on a specific face of a unit cube.
   * @returns {number[]} [x1,y1,z1, x2,y2,z2]
   */
  _generateCrackLine(face) {
    const clamp = (v) => Math.max(-0.5, Math.min(0.5, v));
    const len = 0.3 + Math.random() * 0.5;
    const angle = Math.random() * Math.PI * 2;

    let x, y, z;
    const u = Math.random() - 0.5;
    const v = Math.random() - 0.5;
    switch (face) {
      case 0: x =  0.51; y = v; z = u; break;
      case 1: x = -0.51; y = v; z = u; break;
      case 2: x = u; y =  0.51; z = v; break;
      case 3: x = u; y = -0.51; z = v; break;
      case 4: x = u; y = v; z =  0.51; break;
      case 5: x = u; y = v; z = -0.51; break;
    }

    let x2 = x + Math.cos(angle) * len;
    let y2 = y + Math.sin(angle) * len;
    let z2 = z + (Math.random() - 0.5) * len * 0.5;
    x2 = clamp(x2); y2 = clamp(y2); z2 = clamp(z2);

    return [x, y, z, x2, y2, z2];
  }

  /**
   * Generate a short secondary crack for cross-hatching at high stages.
   */
  _generateShortCrackLine(face) {
    const clamp = (v) => Math.max(-0.5, Math.min(0.5, v));
    const len = 0.1 + Math.random() * 0.3;
    const angle = Math.random() * Math.PI * 2;

    let x, y, z;
    const u = Math.random() - 0.5;
    const v = Math.random() - 0.5;
    switch (face) {
      case 0: x =  0.52; y = v; z = u; break;
      case 1: x = -0.52; y = v; z = u; break;
      case 2: x = u; y =  0.52; z = v; break;
      case 3: x = u; y = -0.52; z = v; break;
      case 4: x = u; y = v; z =  0.52; break;
      case 5: x = u; y = v; z = -0.52; break;
    }

    let x2 = x + Math.cos(angle) * len;
    let y2 = y + Math.sin(angle) * len;
    let z2 = z + (Math.random() - 0.5) * len * 0.3;
    x2 = clamp(x2); y2 = clamp(y2); z2 = clamp(z2);

    return [x, y, z, x2, y2, z2];
  }

  /**
   * Regenerate crack patterns for a specific stage (randomized each update).
   */
  _regenerateCracks(stage) {
    const overlay = this._crackOverlays[stage];
    if (!overlay) return;

    const positions = [];
    const lineCount = 2 + stage * 2;
    for (let i = 0; i < lineCount; i++) {
      const face = Math.floor(Math.random() * 6);
      positions.push(...this._generateCrackLine(face));
    }
    if (stage >= 5) {
      for (let i = 0; i < stage - 3; i++) {
        const face = Math.floor(Math.random() * 6);
        positions.push(...this._generateShortCrackLine(face));
      }
    }

    overlay.geometry.dispose();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    overlay.geometry = geo;
  }

  _updateCrackOverlay(pos, level) {
    // Hide all stages
    for (let i = 0; i <= 10; i++) {
      if (this._crackOverlays[i]) {
        this._crackOverlays[i].visible = false;
      }
    }

    if (level <= 0 || level > 10) {
      this._crackOverlay = null;
      return;
    }

    const overlay = this._crackOverlays[level];
    if (!overlay) return;

    // Position at the mining block
    overlay.position.set(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
    overlay.visible = true;

    // Add to scene if not already
    if (!overlay.parent) {
      this.scene.add(overlay);
    }
    this._crackOverlay = overlay;
    this._crackLevel = level;

    // Re-generate cracks each time for variety
    this._regenerateCracks(level);
  }

  _removeCrackOverlay() {
    // Hide all crack overlays
    for (let i = 0; i <= 10; i++) {
      if (this._crackOverlays[i]) {
        this._crackOverlays[i].visible = false;
      }
    }
    this._crackOverlay = null;
    this._crackLevel = 0;
  }

  // ===== MAIN UPDATE =====

  /**
   * Per-frame update: mouse look, movement, physics, mining, hunger, camera
   * @param {number} dt - delta time in seconds
   * @param {import('../engine/input.js').InputManager} input
   */
  update(dt, input) {
    // Clamp dt to avoid physics explosions
    dt = Math.min(dt, 0.1);

    if (this._placeCooldown > 0) this._placeCooldown -= dt;

    // Spawn protection countdown
    if (this._spawnProtection > 0) this._spawnProtection -= dt;

    // Mouse look
    this._handleMouseLook(input);

    // Movement (WASD + sprint + jump)
    this._handleMovement(dt, input);

    // Physics (gravity + collision)
    this._applyPhysics(dt);

    // Mining (left mouse on blocks)
    this._handleMining(dt, input);

    // Hunger, regen, starvation
    this._handleHungerAndRegen(dt);

    // Camera effects (shake + head bob)
    this._updateCamera(dt);

    // Dropped items (physics + pickup)
    this._updateDroppedItems(dt);

    // Sync camera parent to player position
    this._yawObject.position.copy(this.position);

    // Armor value sync
    if (this.inventory) {
      this._armor = this.inventory.getTotalDefense();
    }

    // Damage flash decay
    if (this._damageFlash > 0) {
      this._damageFlash = Math.max(0, this._damageFlash - dt * 2);
    }
  }

  // ===== MOUSE LOOK =====

  _handleMouseLook(input) {
    const delta = input.getMouseDelta();
    this.yaw -= delta.x * MOUSE_SENSITIVITY;
    this.pitch -= delta.y * MOUSE_SENSITIVITY;
    // Clamp pitch to ±89 degrees
    const limit = Math.PI / 2 * (89 / 90);
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch));

    this._yawObject.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  // ===== MOVEMENT =====

  _handleMovement(dt, input) {
    // Forward/right vectors based on yaw (horizontal only)
    const forward = new THREE.Vector3(
      -Math.sin(this.yaw), 0, -Math.cos(this.yaw)
    ).normalize();
    const right = new THREE.Vector3(
      Math.cos(this.yaw), 0, -Math.sin(this.yaw)
    ).normalize();

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (input.isKeyDown('KeyW')) moveDir.add(forward);
    if (input.isKeyDown('KeyS')) moveDir.sub(forward);
    if (input.isKeyDown('KeyA')) moveDir.sub(right);
    if (input.isKeyDown('KeyD')) moveDir.add(right);

    if (moveDir.lengthSq() > 0) moveDir.normalize();

    // Sprint when Shift held and moving
    this._sprinting = input.isKeyDown('ShiftLeft') && moveDir.lengthSq() > 0;
    const speed = this._sprinting ? SPRINT_SPEED : WALK_SPEED;

    // Direct velocity setting (Minecraft-style: set, don't accumulate)
    if (moveDir.lengthSq() > 0) {
      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;
    } else {
      // Decelerate when not pressing movement keys
      this.velocity.x *= Math.exp(-12 * dt);
      this.velocity.z *= Math.exp(-12 * dt);
    }

    // Jump
    if (input.isKeyDown('Space') && this._onGround) {
      this.velocity.y = JUMP_VELOCITY;
      this._onGround = false;
    }
  }

  // ===== PHYSICS =====

  _applyPhysics(dt) {
    // Gravity (dt-based)
    this.velocity.y += GRAVITY * dt;
    if (this.velocity.y < TERMINAL_VELOCITY) {
      this.velocity.y = TERMINAL_VELOCITY;
    }

    // Air friction only (ground movement is handled by _handleMovement)
    if (!this._onGround) {
      const frictionMul = Math.exp(-AIR_FRICTION * dt);
      this.velocity.x *= frictionMul;
      this.velocity.z *= frictionMul;
    }

    const newPos = this.position.clone();

    // Move on X axis, check collision
    newPos.x += this.velocity.x * dt;
    if (this._checkCollision(newPos)) {
      newPos.x = this.position.x;
      this.velocity.x = 0;
    }

    // Move on Z axis, check collision
    newPos.z += this.velocity.z * dt;
    if (this._checkCollision(newPos)) {
      newPos.z = this.position.z;
      this.velocity.z = 0;
    }

    // Move on Y axis, check collision
    newPos.y += this.velocity.y * dt;
    if (this._checkCollision(newPos)) {
      if (this.velocity.y < 0) {
        // Falling: snap feet to top of block
        this._onGround = true;
        newPos.y = Math.floor(newPos.y) + 1;
        // Verify the snapped position doesn't collide
        if (this._checkCollision(newPos)) {
          newPos.y = this.position.y;
        }
        // Fall damage: check how far we fell
        const fallDist = this._fallStartY - newPos.y;
        if (fallDist > 3 && this._fallStartY > 0) {
          const dmg = Math.floor(fallDist - 3);
          this.takeDamage(dmg);
          // Landing impact camera dip
          this._landingImpact = Math.min(0.2, fallDist * 0.025);
        }
        this._fallStartY = -1;
      } else {
        // Hitting ceiling: revert
        newPos.y = this.position.y;
      }
      this.velocity.y = 0;
    } else {
      if (this._onGround && this.velocity.y < 0) {
        // Just started falling - record start height
        this._fallStartY = newPos.y;
      }
      this._onGround = false;
      if (this._fallStartY < 0) this._fallStartY = newPos.y;
    }

    // Prevent falling below world
    if (newPos.y < -64) {
      this.takeDamage(4);
      newPos.y = 80;
      this.velocity.set(0, 0, 0);
    }

    this.position.copy(newPos);
  }

  /**
   * AABB collision check against solid world blocks
   */
  _checkCollision(pos) {
    const halfW = HITBOX_W / 2;
    const halfD = HITBOX_D / 2;

    const minX = Math.floor(pos.x - halfW);
    const maxX = Math.floor(pos.x + halfW);
    const minY = Math.floor(pos.y);
    const maxY = Math.floor(pos.y + HITBOX_H);
    const minZ = Math.floor(pos.z - halfD);
    const maxZ = Math.floor(pos.z + halfD);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const blockId = this.world.getBlock(x, y, z);
          if (blockId !== 0) {
            const def = getBlock(blockId);
            if (def && def.solid) return true;
          }
        }
      }
    }
    return false;
  }

  // ===== MINING =====

  _handleMining(dt, input) {
    const target = this.getBlockLookingAt();

    // Update highlight wireframe
    if (target && target.blockId !== 0) {
      this._highlightMesh.visible = true;
      this._highlightMesh.position.set(
        target.pos.x + 0.5, target.pos.y + 0.5, target.pos.z + 0.5
      );
    } else {
      this._highlightMesh.visible = false;
    }

    // Left mouse held = mine
    if (input.isMouseDown(0) && target && target.blockId !== 0) {
      const key = `${target.pos.x},${target.pos.y},${target.pos.z}`;

      // Reset progress if target changed
      if (this._mineTargetKey !== key) {
        this.miningProgress = 0;
        this._mineTargetKey = key;
      }

      const blockDef = getBlock(target.blockId);
      if (!blockDef) return;

      // Unbreakable blocks (hardness < 0, e.g. bedrock)
      if (blockDef.hardness < 0) return;

      // Determine tool multiplier
      const item = this.inventory.getSlot(this.selectedSlot);
      const toolDef = item ? getItem(item.id) : null;
      let toolMult = 1.0;

      if (toolDef && isTool(toolDef.type)) {
        if (blockDef.tool === 'none') {
          // Block doesn't require a specific tool: base speed
          toolMult = 1.0;
        } else if (toolDef.type === blockDef.tool) {
          // Correct tool: 0.25x time (4x faster)
          toolMult = 0.25;
        } else {
          // Wrong tool type: 4x slower
          toolMult = 4.0;
        }

        // Check mining level requirement
        if (blockDef.level > 0 && (toolDef.mineLevel ?? 0) < blockDef.level) {
          return; // Tool level too low, can't mine
        }
      } else {
        // No tool or non-tool item held
        if (blockDef.tool !== 'none') {
          toolMult = 4.0; // Bare hand on tool-required block
        }
      }

      const hardnessMod = this._roguelikeModifiers?.blockHardnessMultiplier ?? 1;
      const hardness = blockDef.hardness * hardnessMod;

      // Hardness 0 = instant break
      if (hardness <= 0) {
        this._breakBlock(target);
        this.miningProgress = 0;
        this._mineTargetKey = null;
        return;
      }

      // Increment progress: dt / (hardness * toolMult)
      this.miningProgress += dt / (hardness * toolMult);

      // Update block crack overlay
      const crackLevel = Math.floor(this.miningProgress * 10);
      if (crackLevel !== this._crackLevel) {
        this._crackLevel = crackLevel;
        this._updateCrackOverlay(target.pos, crackLevel);
      }

      if (this.miningProgress >= 1.0) {
        this._breakBlock(target);
        this.miningProgress = 0;
        this._mineTargetKey = null;
        this._removeCrackOverlay();
      }
    } else {
      // Not mining: reset
      this.miningProgress = 0;
      this._mineTargetKey = null;
      this._removeCrackOverlay();
    }
  }

  /**
   * Break a block: set to air, spawn drops, play sound
   */
  _breakBlock(target) {
    const { pos, blockId } = target;

    // Set block to air
    this.world.setBlock(pos.x, pos.y, pos.z, 0);

    // Determine and add drops directly to inventory
    const blockDef = getBlock(blockId);
    if (blockDef) {
      let dropName = null;
      let dropCount = 1;

      if (blockDef.drop) {
        if (typeof blockDef.drop === 'string') {
          dropName = blockDef.drop;
          dropCount = 1;
        } else if (blockDef.drop.item) {
          if (Math.random() < (blockDef.drop.chance ?? 1)) {
            dropName = blockDef.drop.item;
            dropCount = blockDef.drop.count ?? 1;
          }
        }
      } else if (blockDef.id !== 0) {
        // Default: drop the block itself
        dropName = blockDef.name;
        dropCount = 1;
      }

      if (dropName) {
        const itemDef = getItemByName(dropName);
        const dropItemId = itemDef ? itemDef.id : blockId;
        if (dropItemId != null) {
          // Phase 1: Spawn 3D pickup instead of direct inventory add
          if (this._pickupManager) {
            this._pickupManager.spawn(dropItemId, pos.x + 0.5, pos.y + 0.5, pos.z + 0.5, { count: dropCount });
          } else {
            // Fallback: direct add if no pickup manager
            const remaining = this.inventory.addItem(dropItemId, dropCount);
            if (remaining > 0) this._spawnDroppedItem(dropItemId, pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
          }
        }
      }
    }

    // Tool durability
    const heldItem = this.inventory.getSlot(this.selectedSlot);
    if (heldItem) {
      const heldDef = getItem(heldItem.id);
      if (heldDef && heldDef.durability) {
        const durMult = this._roguelikeModifiers?.toolDurabilityMultiplier ?? 1;
        heldItem._durability = (heldItem._durability ?? heldDef.durability) - durMult;
        if (heldItem._durability <= 0) {
          // Tool broke!
          this.inventory.setSlot(this.selectedSlot, null);
          this.audio?.play?.('block_break');
          // Track tool break for achievements
          if (window.game?.runStats) {
            window.game.runStats.toolsBroken = (window.game.runStats.toolsBroken || 0) + 1;
          }
        }
      }
    }

    // Audio
    this.audio?.play?.('block_break');

    // Emit break particles
    this._emitBreakParticles(target.pos, blockId);

    // Track for stats
    if (window.game?.runStats) {
      window.game.runStats.blocksMined = (window.game.runStats.blocksMined || 0) + 1;
      // Track specific ore types for achievements
      const oreMap = {
        12: 'diamondsMined', // Diamond Ore
        11: 'ironMined',     // Iron Ore
        10: 'goldMined',     // Gold Ore
        20: 'crystalMined',  // Crystal Ore
        15: 'obsidianMined', // Obsidian
      };
      const statKey = oreMap[blockId];
      if (statKey) {
        window.game.runStats[statKey] = (window.game.runStats[statKey] || 0) + 1;
      }
    }
  }

  /**
   * Spawn a dropped item by item name
   */
  _spawnDropByName(name, x, y, z) {
    const itemDef = getItemByName(name);
    if (!itemDef) return;
    this._spawnDroppedItem(itemDef.id, x, y, z);
  }

  /**
   * Emit particles when a block is broken.
   * Colors match the block type for visual feedback.
   */
  _emitBreakParticles(pos, blockId) {
    const blockColors = {
      1: 0x8B6914, 2: 0x6B8C42, 3: 0x8B7355, 4: 0x808080, 5: 0x808080,
      6: 0x8B6914, 7: 0x404040, 10: 0x8B6914, 11: 0x228B22, 12: 0xD2B48C,
      13: 0x808080, 14: 0xFFD700, 15: 0xC0C0C0, 16: 0x404040, 17: 0x4AEDD9,
      18: 0x444444, 19: 0xB22222, 20: 0x4B0082, 21: 0x00CED1, 22: 0xF5F5DC,
    };
    const color = blockColors[blockId] || 0x888888;
    const count = 8 + Math.floor(Math.random() * 6);
    const center = new THREE.Vector3(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);

    for (let i = 0; i < count; i++) {
      const size = 0.04 + Math.random() * 0.06;
      const geo = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        center.x + (Math.random() - 0.5) * 0.8,
        center.y + (Math.random() - 0.5) * 0.8,
        center.z + (Math.random() - 0.5) * 0.8,
      );
      this.scene.add(mesh);

      this._breakParticles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          2 + Math.random() * 3,
          (Math.random() - 0.5) * 4,
        ),
        age: 0,
        lifetime: 0.6 + Math.random() * 0.4,
      });
    }
  }

  /**
   * Spawn a physical dropped item in the world
   */
  _spawnDroppedItem(itemId, x, y, z) {
    const size = 0.25;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshLambertMaterial({ color: this._getItemColor(itemId) });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);

    const droppedItem = {
      id: itemId,
      count: 1,
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        3 + Math.random() * 1.5,
        (Math.random() - 0.5) * 3
      ),
      lifetime: 300, // 5 minutes
      age: 0,
      pickupDelay: 0.5, // seconds before player can pick up
    };

    this.droppedItems.push(droppedItem);
    this.scene.add(mesh);
  }

  /**
   * Get display color for an item ID
   */
  _getItemColor(itemId) {
    const itemDef = getItem(itemId);
    if (!itemDef) return 0xCCCCCC;

    // Color by item material
    const materialColors = {
      wood: 0x8B6914, stone: 0x888888, iron: 0xCCCCCC,
      gold: 0xFFD700, diamond: 0x00CED1, crystal: 0xAA66FF,
      leather: 0x8B4513,
    };
    if (itemDef.material && materialColors[itemDef.material]) {
      return materialColors[itemDef.material];
    }

    // Color by item type
    const typeColors = {
      food: 0xFFAA00, material: 0xCCCCCC, potion: 0xFF00FF,
      legendary: 0xFFD700, ammo: 0x555555,
    };
    return typeColors[itemDef.type] || 0xCCCCCC;
  }

  /**
   * Update dropped items: physics, lifetime, pickup
   */
  _updateDroppedItems(dt) {
    // Update break particles
    for (let i = this._breakParticles.length - 1; i >= 0; i--) {
      const p = this._breakParticles[i];
      p.age += dt;
      if (p.age >= p.lifetime) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._breakParticles.splice(i, 1);
        continue;
      }
      p.velocity.y += GRAVITY * dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.mesh.rotation.x += dt * 5;
      p.mesh.rotation.y += dt * 3;
      // Fade out
      p.mesh.material.opacity = 1 - (p.age / p.lifetime);
      p.mesh.material.transparent = true;
      const scale = 1 - (p.age / p.lifetime) * 0.5;
      p.mesh.scale.set(scale, scale, scale);
    }

    for (let i = this.droppedItems.length - 1; i >= 0; i--) {
      const item = this.droppedItems[i];
      item.age += dt;
      item.pickupDelay -= dt;

      // Gravity (dt-based)
      item.velocity.y += GRAVITY * dt * 0.5;
      item.mesh.position.addScaledVector(item.velocity, dt);
      item.velocity.multiplyScalar(Math.exp(-5 * dt));

      // Spin animation
      item.mesh.rotation.y += dt * 2;

      // Lifetime expiry
      if (item.age > item.lifetime) {
        this.scene.remove(item.mesh);
        item.mesh.geometry.dispose();
        item.mesh.material.dispose();
        this.droppedItems.splice(i, 1);
        continue;
      }

      // Ground collision for items
      const bx = Math.floor(item.mesh.position.x);
      const by = Math.floor(item.mesh.position.y);
      const bz = Math.floor(item.mesh.position.z);
      const blockBelow = this.world.getBlock(bx, by, bz);
      if (blockBelow !== 0) {
        const def = getBlock(blockBelow);
        if (def && def.solid) {
          item.velocity.y = 0;
          item.mesh.position.y = by + 1;
        }
      }

      // Pickup check
      if (item.pickupDelay <= 0) {
        const eyePos = this.position.clone().add(new THREE.Vector3(0, 1, 0));
        const dist = item.mesh.position.distanceTo(eyePos);
        if (dist < 1.5) {
          const remaining = this.inventory.addItem(item.id, item.count);
          if (remaining === 0) {
            this.scene.remove(item.mesh);
            item.mesh.geometry.dispose();
            item.mesh.material.dispose();
            this.droppedItems.splice(i, 1);
            this.audio?.play?.('pickup');
          }
        }
      }
    }
  }

  // ===== PLACING =====

  /**
   * Place a block from the selected hotbar slot at the targeted position.
   * Called by main.js on right click.
   */
  placeBlock() {
    if (this._placeCooldown > 0) return;

    const target = this.getBlockLookingAt();
    if (!target) return;

    // Place position = targeted block + face normal
    const placePos = {
      x: target.pos.x + target.normal.x,
      y: target.pos.y + target.normal.y,
      z: target.pos.z + target.normal.z,
    };

    // Don't place inside the player
    const px = Math.floor(this.position.x);
    const py = Math.floor(this.position.y);
    const pz = Math.floor(this.position.z);
    if (
      (placePos.x === px && placePos.z === pz) &&
      (placePos.y === py || placePos.y === py + 1)
    ) {
      return;
    }

    // Get item from selected slot
    const item = this.inventory.getSlot(this.selectedSlot);
    if (!item) return;

    // Determine if item maps to a placeable block
    // Block items have id < 100 (direct block IDs)
    let blockId = null;
    if (item.id < 100) {
      blockId = item.id;
    }

    if (blockId != null && blockId !== 0) {
      // Check the target position is air
      const existing = this.world.getBlock(placePos.x, placePos.y, placePos.z);
      if (existing !== 0) return;

      this.world.setBlock(placePos.x, placePos.y, placePos.z, blockId);
      this.inventory.removeItem(this.selectedSlot, 1);
      this._placeCooldown = 0.25;
      this.audio?.play?.('block_place');
    }
  }

  // ===== RAYCASTING (DDA voxel traversal) =====

  /**
   * Cast a ray from the camera and find the first solid block hit.
   * @returns {{ pos: {x,y,z}, normal: {x,y,z}, blockId: number, distance: number } | null}
   */
  getBlockLookingAt() {
    const origin = this.camera.getWorldPosition(new THREE.Vector3());
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));

    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);

    const stepX = direction.x > 0 ? 1 : -1;
    const stepY = direction.y > 0 ? 1 : -1;
    const stepZ = direction.z > 0 ? 1 : -1;

    const tDeltaX = direction.x !== 0 ? Math.abs(1 / direction.x) : Infinity;
    const tDeltaY = direction.y !== 0 ? Math.abs(1 / direction.y) : Infinity;
    const tDeltaZ = direction.z !== 0 ? Math.abs(1 / direction.z) : Infinity;

    let tMaxX = direction.x !== 0
      ? ((direction.x > 0 ? (x + 1 - origin.x) : (origin.x - x)) * tDeltaX)
      : Infinity;
    let tMaxY = direction.y !== 0
      ? ((direction.y > 0 ? (y + 1 - origin.y) : (origin.y - y)) * tDeltaY)
      : Infinity;
    let tMaxZ = direction.z !== 0
      ? ((direction.z > 0 ? (z + 1 - origin.z) : (origin.z - z)) * tDeltaZ)
      : Infinity;

    let normal = { x: 0, y: 0, z: 0 };
    let dist = 0;

    const maxSteps = Math.ceil(MINE_REACH * 3);
    for (let i = 0; i < maxSteps; i++) {
      const blockId = this.world.getBlock(x, y, z);
      if (blockId !== 0) {
        const def = getBlock(blockId);
        if (def && (def.solid || def.hardness >= 0)) {
          return { pos: { x, y, z }, normal, blockId, distance: dist };
        }
      }

      // Advance to next voxel boundary
      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          x += stepX;
          dist = tMaxX;
          tMaxX += tDeltaX;
          normal = { x: -stepX, y: 0, z: 0 };
        } else {
          z += stepZ;
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          normal = { x: 0, y: 0, z: -stepZ };
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          dist = tMaxY;
          tMaxY += tDeltaY;
          normal = { x: 0, y: -stepY, z: 0 };
        } else {
          z += stepZ;
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          normal = { x: 0, y: 0, z: -stepZ };
        }
      }

      if (dist > MINE_REACH) break;
    }

    return null;
  }

  // ===== DAMAGE & HEALING =====

  /**
   * Apply damage with armor reduction.
   * Armor formula: reduction = defense / (defense + 10)
   * @param {number} amount - raw damage
   * @param {string} [source] - damage source identifier
   * @returns {number} final damage applied
   */
  takeDamage(amount, source) {
    // Spawn protection: ignore all damage for the first 3 seconds
    if (this._spawnProtection > 0) return 0;

    const defense = this.inventory.getTotalDefense();
    const reduction = defense / (defense + 10);
    const finalDmg = Math.max(1, Math.floor(amount * (1 - reduction)));

    this.health -= finalDmg;
    this._damageFlash = 0.5;
    this._cameraShakeIntensity = Math.max(this._cameraShakeIntensity, 0.3);

    if (this.health <= 0) {
      this.health = 0;
    }

    this.audio?.play?.('damage');
    return finalDmg;
  }

  /**
   * Heal the player, capped at maxHealth.
   */
  heal(amount) {
    const healingReduction = this._roguelikeModifiers?.healingReduction ?? 1;
    const finalAmount = amount * healingReduction;
    this.health = Math.min(this.maxHealth, this.health + finalAmount);
  }

  // ===== EATING =====

  /**
   * Consume food from the selected hotbar slot.
   * @returns {boolean} true if food was consumed
   */
  eat() {
    const item = this.inventory.getSlot(this.selectedSlot);
    if (!item) return false;

    const itemDef = getItem(item.id);
    if (!itemDef) return false;

    // Handle potions
    if (itemDef.type === 'potion') {
      this.inventory.removeItem(this.selectedSlot, 1);
      this.audio?.play?.('eat');
      // Track potion use for achievements
      if (window.game?.runStats) {
        window.game.runStats.potionsUsed = (window.game.runStats.potionsUsed || 0) + 1;
      }

      // Apply potion effects
      if (itemDef.effects) {
        for (const effect of itemDef.effects) {
          if (effect.type === 'instant_health') {
            this.heal((effect.power || 1) * 4);
          } else {
            this._pendingEffects = this._pendingEffects || [];
            this._pendingEffects.push({ ...effect });
          }
        }
      }
      return true;
    }

    // Handle food
    if (!isFood(itemDef.type)) return false;
    if (this.hunger >= this._maxHunger) return false;

    const healMult = this._roguelikeModifiers?.foodHealMultiplier ?? 1;
    this.hunger = Math.min(this._maxHunger, this.hunger + Math.floor((itemDef.hunger || 4) * healMult));
    this.inventory.removeItem(this.selectedSlot, 1);
    this.audio?.play?.('eat');

    // Track food eaten for achievements
    if (window.game?.runStats) {
      window.game.runStats.foodEaten = (window.game.runStats.foodEaten || 0) + 1;
    }

    // Apply food effects (e.g. golden apple regeneration)
    if (itemDef.effects) {
      this._pendingEffects = this._pendingEffects || [];
      this._pendingEffects.push(...itemDef.effects);
    }

    return true;
  }

  // ===== DROP ITEM =====

  /**
   * Drop the item in the selected hotbar slot into the world.
   */
  dropSelectedItem() {
    const item = this.inventory.getSlot(this.selectedSlot);
    if (!item) return;

    const forward = this.getForwardDir();
    const dropPos = this.position.clone()
      .add(new THREE.Vector3(0, 1.5, 0))
      .add(forward.clone().multiplyScalar(0.5));

    this._spawnDroppedItem(item.id, dropPos.x, dropPos.y, dropPos.z);
    this.inventory.removeItem(this.selectedSlot, 1);
  }

  // ===== HUNGER & REGEN =====

  _handleHungerAndRegen(dt) {
    // Deplete hunger at ~0.005/sec
    this._hungerTimer += dt;
    if (this._hungerTimer >= 1) {
      this._hungerTimer -= 1;
      this.hunger = Math.max(0, this.hunger - 0.005);
    }

    // Regeneration based on hunger level
    if (this.health < this.maxHealth && this.hunger > 0) {
      this._regenTimer += dt;
      let regenRate = 0; // seconds between heals
      if (this.hunger >= 18) {
        regenRate = 1.0; // fast regen when nearly full (heal 1 HP/sec)
      } else if (this.hunger >= 14) {
        regenRate = 3.0; // moderate regen
      } else if (this.hunger >= 10) {
        regenRate = 6.0; // slow regen when half full
      }
      if (regenRate > 0 && this._regenTimer >= regenRate) {
        this._regenTimer -= regenRate;
        this.heal(1);
      }
    }

    // Starvation damage when hunger = 0: 0.5/sec
    if (this.hunger <= 0) {
      this._starveTimer += dt;
      if (this._starveTimer >= 1) {
        this._starveTimer -= 1;
        this.takeDamage(0.5, 'starvation');
      }
    }
  }

  // ===== CAMERA =====

  _updateCamera(dt) {
    // Camera shake
    if (this._cameraShakeIntensity > 0.001) {
      this._cameraShake.set(
        (Math.random() - 0.5) * this._cameraShakeIntensity,
        (Math.random() - 0.5) * this._cameraShakeIntensity,
        (Math.random() - 0.5) * this._cameraShakeIntensity * 0.3
      );
      this._cameraShakeIntensity *= this._cameraShakeDecay;
    } else {
      this._cameraShake.set(0, 0, 0);
      this._cameraShakeIntensity = 0;
    }

    // Camera bob (dt-based phase tracking for frame-rate independence)
    const isMoving = Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.z) > 0.5;
    if (isMoving && this._onGround) {
      const bobSpeed = this._sprinting ? 12 : 8;
      this._bobPhase += dt * bobSpeed;
      this._bobAmount = this._sprinting ? 0.06 : 0.03;
    } else {
      // Smoothly fade bob when stopping
      this._bobPhase = 0;
      this._bobAmount *= Math.exp(-10 * dt);
    }
    const bobY = Math.sin(this._bobPhase) * this._bobAmount;

    // Landing impact (camera dip on hard landings)
    if (this._landingImpact > 0.001) {
      this._landingImpact *= Math.exp(-8 * dt);
    } else {
      this._landingImpact = 0;
    }

    // Apply shake + bob + landing impact + eye height
    this.camera.position.set(
      this._cameraShake.x,
      EYE_HEIGHT + bobY - this._landingImpact + this._cameraShake.y,
      this._cameraShake.z
    );

    // FOV lerp on sprint (smooth transition)
    const targetFOV = this._sprinting ? 80 : 70;
    this._currentFOV += (targetFOV - this._currentFOV) * Math.min(1, dt * 8);
    this.camera.fov = this._currentFOV;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Add camera shake effect (e.g. from explosions nearby)
   */
  addCameraShake(intensity) {
    this._cameraShakeIntensity = Math.max(this._cameraShakeIntensity, intensity);
  }

  /**
   * Get damage flash amount (0-1) for red vignette overlay
   */
  getDamageFlash() {
    return this._damageFlash;
  }

  // ===== UTILITY =====

  /**
   * Get the horizontal direction the player is facing
   */
  getForwardDir() {
    return new THREE.Vector3(
      -Math.sin(this.yaw), 0, -Math.cos(this.yaw)
    ).normalize();
  }

  /**
   * Get eye position in world space
   */
  getEyePosition() {
    return this.position.clone().add(new THREE.Vector3(0, EYE_HEIGHT, 0));
  }

  /**
   * Get whether player is on the ground
   */
  get onGround() {
    return this._onGround;
  }

  // ===== SERIALIZATION =====

  serialize() {
    return {
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      health: this.health,
      hunger: this.hunger,
      phoenixUsed: this.phoenixUsed,
      selectedSlot: this.selectedSlot,
      inventory: this.inventory.serialize(),
    };
  }

  deserialize(data) {
    if (!data) return;
    if (data.position) {
      this.position.set(data.position.x, data.position.y, data.position.z);
    }
    if (data.health != null) this.health = data.health;
    if (data.hunger != null) this.hunger = data.hunger;
    if (data.phoenixUsed != null) this.phoenixUsed = data.phoenixUsed;
    if (data.selectedSlot != null) this.selectedSlot = data.selectedSlot;
    if (data.inventory) this.inventory.deserialize(data.inventory);
  }
}
