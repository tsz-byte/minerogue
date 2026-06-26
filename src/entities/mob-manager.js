// MineRogue - Mob Manager
// Manages all mobs: AI, spawning, rendering, physics, animation
import * as THREE from 'three';
import { MOB_DEFS, getMobDef } from '../data/mobs.js';
import { ITEMS, getItemByName } from '../data/items.js';
import { getBlock } from '../data/blocks.js';
import { createMobTextureAtlas, getMobFaceUV } from '../textures/mob-textures.js';

// Physics (dt-based, matching player physics)
const MOB_GRAVITY = -20;
const MOB_TERMINAL = -40;
const MOB_JUMP = 8.5;
const MOB_HITBOX_W = 0.6;
const MOB_HITBOX_H = 1.8;
const MOB_HITBOX_D = 0.6;

// Spawning
const SPAWN_CHECK_INTERVAL = 3;
const MAX_MOBS = 40;
const MIN_SPAWN_DIST = 24;
const MAX_SPAWN_DIST = 64;
const DESPAWN_DIST = 96;
const NIGHT_HOSTILE_MULT = 3;

// AI state durations (seconds)
const IDLE_MIN = 2, IDLE_MAX = 5;
const PATROL_MIN = 3, PATROL_MAX = 8;
const FLEE_MIN = 3, FLEE_MAX = 5;

// Colors by mob type
const MOB_COLORS = {
  zombie:        { body: 0x3a7a3a, head: 0x4a9a4a },
  skeleton:      { body: 0xd0d0c0, head: 0xd0d0c0 },
  spider:        { body: 0x333333, head: 0x333333, eyes: 0xff0000 },
  creeper:       { body: 0x4a9a4a, head: 0x4a9a4a, face: 0x222222 },
  enderman:      { body: 0x1a1a1a, head: 0x1a1a1a, eyes: 0x9900ff },
  cow:           { body: 0x5a3a20, head: 0x6a4a30, spots: 0x3a2a10 },
  pig:           { body: 0xe8a0a0, head: 0xe8a0a0 },
  chicken:       { body: 0xe8e0d0, head: 0xe84020 },
  sheep:         { body: 0xe8e8e8, head: 0xe8e8e8 },
  witch:         { body: 0x4a2a4a, head: 0x5a3a5a },
  husk:          { body: 0x8a7a5a, head: 0x9a8a6a },
  cave_spider:   { body: 0x2a2a3a, head: 0x2a2a3a, eyes: 0xff0000 },
  phantom:       { body: 0x4a4a6a, head: 0x5a5a7a },
  slime:         { body: 0x4a9a4a, head: 0x5aaa5a },
  mimic:         { body: 0x8B6914, head: 0x8B6914 },
  crystal_golem: { body: 0x6644aa, head: 0x8866cc },
  harpy:         { body: 0x8a6a4a, head: 0xaa8a6a },
  giant_zombie:  { body: 0x3a7a3a, head: 0x4a9a4a },
  spider_queen:  { body: 0x333333, head: 0x444444, eyes: 0xff0044 },
  necromancer:   { body: 0x2a1a2a, head: 0x3a2a3a },
  corrupted_champion: { body: 0x3a1a3a, head: 0x5a2a5a },
  void_wyrm:     { body: 0x1a0a2a, head: 0x3a1a4a, eyes: 0xaa00ff },
};

// Mob type categories
const HUMANOID_TYPES = new Set([
  'zombie', 'skeleton', 'enderman', 'witch', 'husk',
  'giant_zombie', 'necromancer', 'corrupted_champion', 'villager', 'harpy', 'mimic',
]);
const QUADRUPED_TYPES = new Set(['cow', 'pig', 'sheep']);
const PASSIVE_TYPES = new Set(['cow', 'pig', 'chicken', 'sheep', 'fish', 'villager']);

export class MobManager {
  /**
   * @param {import('../world/world.js').World} world
   * @param {THREE.Scene} scene
   * @param {import('./player.js').Player} player
   * @param {import('../audio/engine.js').AudioEngine} audio
   */
  constructor(world, scene, player, audio) {
    this.world = world;
    this.scene = scene;
    this.player = player;
    this.audio = audio;
    this.mobs = [];
    this._spawnTimer = 0;
    this._time = 0;
    // Set externally by the game loop based on DayNightCycle
    this.isNight = false;

    // Create mob texture atlas
    this._mobTextureAtlas = createMobTextureAtlas();
  }

  // ===== PUBLIC API =====

  /**
   * Main per-frame update.
   * @param {number} dt - delta time in seconds
   * @param {number} time - total elapsed time in seconds
   */
  update(dt, time) {
    this._time = time;

    // Periodic spawn check
    this._spawnTimer += dt;
    if (this._spawnTimer >= SPAWN_CHECK_INTERVAL) {
      this._spawnTimer -= SPAWN_CHECK_INTERVAL;
      this._trySpawn();
      this.checkSpawnerBlocks();
    }

    // Update each mob
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      if (mob.dead) continue;

      // Despawn check
      const dist = mob.position.distanceTo(this.player.position);
      if (dist > DESPAWN_DIST) {
        this._despawnMob(mob, i);
        continue;
      }

      // AI state machine
      this._updateAI(mob, dt, dist);

      // Physics (gravity + collision)
      this._updatePhysics(mob, dt);

      // Animation
      this._updateAnimation(mob, dt);

      // Jump cooldown
      if (mob._jumpCooldown > 0) mob._jumpCooldown -= dt;

      // Health bar fade
      if (mob._hpBar) {
        mob._hpBar.showTimer -= dt;
        if (mob._hpBar.showTimer <= 0) {
          mob._hpBar.sprite.visible = false;
        }
      }

      // Flash timer
      if (mob.flashTimer > 0) {
        mob.flashTimer -= dt;
        if (mob.flashTimer <= 0) this._restoreColors(mob);
      }

      // Knockback timer
      if (mob.knockbackTimer > 0) mob.knockbackTimer -= dt;

      // Attack cooldown
      if (mob.attackCooldownTimer > 0) mob.attackCooldownTimer -= dt;

      // Sync mesh to position
      mob.mesh.position.copy(mob.position);
    }
  }

  /**
   * Spawn a mob at the given position.
   * @returns {object|null}
   */
  spawnMob(type, x, y, z) {
    const def = getMobDef(type);
    if (!def) return null;
    if (this.mobs.length >= MAX_MOBS) return null;

    const mesh = this._createMobMesh(type);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    const mob = {
      type,
      hp: def.hp,
      maxHp: def.hp,
      damage: def.damage,
      speed: def.speed,
      hostile: def.hostile,
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(0, 0, 0),
      mesh,
      state: 'idle',
      stateTimer: _rand(IDLE_MIN, IDLE_MAX),
      attackCooldownTimer: 0,
      aggroRange: def.aggroRange,
      attackRange: def.attackRange,
      attackCooldownDef: def.attackCooldown,
      knockbackTimer: 0,
      flashTimer: 0,
      dead: false,
      _animTime: Math.random() * Math.PI * 2,
      _patrolDir: new THREE.Vector3(0, 0, 0),
      _fleeTimer: 0,
      _savedColors: null,
      _parts: mesh.userData.parts || null,
      _def: def,
      _jumpCooldown: 0,
    };

    this.mobs.push(mob);
    return mob;
  }

  /** Get all active mobs. */
  getMobs() { return this.mobs; }

  /**
   * Check if a mob is hit by a melee ray from origin in direction.
   * Returns nearest mob within maxDist and cone angle, or null.
   */
  checkMobHit(origin, direction, maxDist, cone) {
    let nearest = null, nearestDist = maxDist;
    for (const mob of this.mobs) {
      if (mob.dead) continue;
      const target = mob.position.clone().add(new THREE.Vector3(0, 0.9, 0));
      const toMob = target.sub(origin);
      const dist = toMob.length();
      if (dist > maxDist) continue;
      const angle = direction.angleTo(toMob.normalize());
      if (angle > cone) continue;
      if (dist < nearestDist) { nearest = mob; nearestDist = dist; }
    }
    return nearest;
  }

  /**
   * Check collision with mobs for entity proximity.
   */
  checkCollisions(entity) {
    const pos = entity.position ?? entity;
    let nearest = null, nearestDist = Infinity;
    for (const mob of this.mobs) {
      if (mob.dead) continue;
      const dist = mob.position.distanceTo(pos);
      if (dist < 1.5 && dist < nearestDist) { nearest = mob; nearestDist = dist; }
    }
    return nearest;
  }

  /**
   * Apply damage to a mob with optional knockback.
   */
  damageMob(mob, amount, knockbackDir) {
    if (mob.dead) return;

    mob.hp -= amount;
    this._flashWhite(mob);
    this.audio?.play?.('sword_hit');

    // Apply knockback
    if (knockbackDir) {
      const kb = knockbackDir.clone().normalize().multiplyScalar(0.3);
      kb.y = 0.15;
      mob.velocity.add(kb);
      mob.knockbackTimer = 0.3;
      mob.state = 'idle';
      mob.stateTimer = 0.5;
    }

    // Passive mobs flee when hit
    if (!mob.hostile && PASSIVE_TYPES.has(mob.type)) {
      mob.state = 'flee';
      mob._fleeTimer = _rand(FLEE_MIN, FLEE_MAX);
      const away = mob.position.clone().sub(this.player.position);
      away.y = 0;
      mob._patrolDir.copy(away.lengthSq() > 0.01 ? away.normalize() :
        new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize());
    }

    // Hostile mobs aggro when hit
    if (mob.hostile && mob.state !== 'chase' && mob.state !== 'attack') {
      mob.state = 'chase';
    }

    // Update health bar
    this._updateMobHealthBar(mob);

    // Check death
    if (mob.hp <= 0) this.killMob(mob);
  }

  _updateMobHealthBar(mob) {
    if (!mob._hpBar) {
      // Create health bar sprite
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 8;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, 64, 8);
      ctx.fillStyle = '#e22';
      ctx.fillRect(1, 1, 62, 6);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.0, 0.15, 1);
      sprite.position.set(0, 2.2, 0);
      mob.mesh.add(sprite);
      mob._hpBar = { sprite, canvas, ctx, tex, showTimer: 0 };
    }

    // Update bar fill
    const bar = mob._hpBar;
    const pct = Math.max(0, mob.hp / mob.maxHp);
    bar.ctx.fillStyle = '#333';
    bar.ctx.fillRect(0, 0, 64, 8);
    bar.ctx.fillStyle = pct > 0.5 ? '#2e2' : (pct > 0.25 ? '#ea2' : '#e22');
    bar.ctx.fillRect(1, 1, Math.floor(62 * pct), 6);
    bar.tex.needsUpdate = true;
    bar.showTimer = 3; // show for 3 seconds
    bar.sprite.visible = true;
  }

  /**
   * Kill a mob: drop items, remove from scene and array.
   */
  killMob(mob) {
    if (mob.dead) return;
    mob.dead = true;

    // Spawn drops
    const def = mob._def || getMobDef(mob.type);
    if (def && def.drops) this._spawnMobDrops(mob, def);

    // Remove mesh
    this.scene.remove(mob.mesh);
    _disposeMesh(mob.mesh);

    // Remove from array
    const idx = this.mobs.indexOf(mob);
    if (idx >= 0) this.mobs.splice(idx, 1);

    this.audio?.play?.('mob_death');
  }

  // ===== SPAWNING =====

  _trySpawn() {
    if (this.mobs.length >= MAX_MOBS) return;

    const hostileWeight = this.isNight ? NIGHT_HOSTILE_MULT : 1;
    const totalWeight = hostileWeight + 1;
    const attempts = 1 + (Math.random() < 0.3 ? 1 : 0);

    for (let a = 0; a < attempts; a++) {
      if (this.mobs.length >= MAX_MOBS) break;

      const spawnPos = this._findSpawnPosition();
      if (!spawnPos) continue;

      const wantHostile = Math.random() * totalWeight < hostileWeight;
      const candidates = MOB_DEFS.filter(d => !d.boss && d.type !== 'fish' && d.hostile === wantHostile);
      if (candidates.length === 0) continue;

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      this.spawnMob(chosen.type, spawnPos.x, spawnPos.y, spawnPos.z);
    }
  }

  _findSpawnPosition() {
    const px = this.player.position.x;
    const pz = this.player.position.z;
    const angle = Math.random() * Math.PI * 2;
    const dist = MIN_SPAWN_DIST + Math.random() * (MAX_SPAWN_DIST - MIN_SPAWN_DIST);

    const x = Math.floor(px + Math.cos(angle) * dist);
    const z = Math.floor(pz + Math.sin(angle) * dist);

    // Scan down from high Y to find ground
    let y = Math.floor(this.player.position.y) + 16;
    while (y > -64) {
      const blockId = this.world.getBlock(x, y, z);
      if (blockId !== 0) {
        const def = getBlock(blockId);
        if (def && def.solid) {
          const spawnY = y + 1;
          if (this.world.getBlock(x, spawnY, z) === 0 &&
              this.world.getBlock(x, spawnY + 1, z) === 0) {
            return { x, y: spawnY, z };
          }
          return null;
        }
      }
      y--;
    }
    return null;
  }

  _despawnMob(mob, index) {
    mob.dead = true;
    this.scene.remove(mob.mesh);
    _disposeMesh(mob.mesh);
    this.mobs.splice(index, 1);
  }

  // ===== AI =====

  _updateAI(mob, dt, distToPlayer) {
    if (mob.knockbackTimer > 0) return;
    mob.stateTimer -= dt;

    if (PASSIVE_TYPES.has(mob.type)) {
      this._updatePassiveAI(mob, dt, distToPlayer);
    } else {
      this._updateHostileAI(mob, dt, distToPlayer);
    }
  }

  _updatePassiveAI(mob, dt, distToPlayer) {
    switch (mob.state) {
      case 'idle':
        mob.velocity.x *= Math.exp(-8 * dt);
        mob.velocity.z *= Math.exp(-8 * dt);
        if (mob.stateTimer <= 0) {
          mob.state = 'patrol';
          mob.stateTimer = _rand(PATROL_MIN, PATROL_MAX);
          mob._patrolDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }
        break;

      case 'patrol':
        this._moveInDirection(mob, mob._patrolDir, dt);
        if (mob.stateTimer <= 0) {
          mob.state = 'idle';
          mob.stateTimer = _rand(IDLE_MIN, IDLE_MAX);
        }
        break;

      case 'flee':
        this._moveInDirection(mob, mob._patrolDir, dt, 1.5);
        mob._fleeTimer -= dt;
        if (mob._fleeTimer <= 0) {
          mob.state = 'idle';
          mob.stateTimer = _rand(IDLE_MIN, IDLE_MAX);
        }
        break;
    }
  }

  _updateHostileAI(mob, dt, distToPlayer) {
    const def = mob._def;
    const isFlying = def?.behavior === 'fly';

    // Flying mobs always hover
    if (isFlying) {
      const hoverY = this.player.position.y + 2 + Math.sin(this._time * 1.5 + mob._animTime) * 1.0;
      mob.velocity.y += (hoverY - mob.position.y) * 0.03;
      mob.velocity.y *= 0.92;
    }

    switch (mob.state) {
      case 'idle':
        mob.velocity.x *= Math.exp(-8 * dt);
        mob.velocity.z *= Math.exp(-8 * dt);
        if (mob.stateTimer <= 0) {
          mob.state = 'patrol';
          mob.stateTimer = _rand(PATROL_MIN, PATROL_MAX);
          mob._patrolDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }
        if (distToPlayer <= mob.aggroRange) {
          mob.state = 'chase';
          mob.stateTimer = 10;
        }
        break;

      case 'patrol':
        this._moveInDirection(mob, mob._patrolDir, dt);
        if (mob.stateTimer <= 0) {
          mob.state = 'idle';
          mob.stateTimer = _rand(IDLE_MIN, IDLE_MAX);
        }
        if (distToPlayer <= mob.aggroRange) {
          mob.state = 'chase';
          mob.stateTimer = 10;
        }
        break;

      case 'chase': {
        const toPlayer = this.player.position.clone().sub(mob.position);
        toPlayer.y = 0;
        if (toPlayer.length() > 0.5) {
          this._moveInDirection(mob, toPlayer.normalize(), dt, mob.speed);
        }

        if (distToPlayer <= mob.attackRange) {
          mob.state = 'attack';
          mob.stateTimer = 0.5;
        }
        if (distToPlayer > mob.aggroRange * 1.5 || mob.stateTimer <= 0) {
          mob.state = 'idle';
          mob.stateTimer = _rand(IDLE_MIN, IDLE_MAX);
        }

        // Flying mobs hover at player eye level
        if (def && def.behavior === 'fly') {
          const targetY = this.player.position.y + 1.5 + Math.sin(this._time * 2) * 0.5;
          mob.velocity.y += (targetY - mob.position.y) * 0.05;
          mob.velocity.y *= 0.9;
        }
        break;
      }

      case 'attack': {
        const actualDist = mob.position.distanceTo(this.player.position);

        if (mob.attackCooldownTimer <= 0 && actualDist <= mob.attackRange) {
          mob.wantsAttack = true;
          mob.attackCooldownTimer = mob.attackCooldownDef || 1.5;
          mob._animTime = 0; // Reset for attack anim
        }

        if (mob.stateTimer <= 0 || distToPlayer > mob.attackRange * 1.2) {
          mob.state = 'chase';
          mob.stateTimer = 10;
        }
        if (distToPlayer > mob.aggroRange * 1.5) {
          mob.state = 'idle';
          mob.stateTimer = _rand(IDLE_MIN, IDLE_MAX);
        }
        break;
      }
    }
  }

  // ===== PHYSICS =====

  _updatePhysics(mob, dt) {
    const isFlying = mob._def?.behavior === 'fly';

    // dt-based physics (matching player)
    if (!isFlying) {
      mob.velocity.y += MOB_GRAVITY * dt;
      if (mob.velocity.y < MOB_TERMINAL) mob.velocity.y = MOB_TERMINAL;
    } else {
      // Flying mobs: gentle gravity but strong upward buoyancy
      mob.velocity.y += MOB_GRAVITY * dt * 0.1;
      mob.velocity.y *= Math.exp(-3 * dt); // dampen vertical velocity
    }

    const frictionMul = Math.exp(-(mob.knockbackTimer > 0 ? 3 : 6) * dt);
    mob.velocity.x *= frictionMul;
    mob.velocity.z *= frictionMul;

    const newPos = mob.position.clone();

    // X axis
    newPos.x += mob.velocity.x * dt;
    if (this._checkMobCollision(newPos)) {
      const jumpTest = newPos.clone();
      jumpTest.y += 1;
      if (!this._checkMobCollision(jumpTest) && Math.abs(mob.velocity.y) < 0.5 && (mob._jumpCooldown ?? 0) <= 0) {
        mob.velocity.y = MOB_JUMP;
        mob._jumpCooldown = 0.8;
      }
      newPos.x = mob.position.x;
      mob.velocity.x = 0;
    }

    // Z axis
    newPos.z += mob.velocity.z * dt;
    if (this._checkMobCollision(newPos)) {
      const jumpTest = newPos.clone();
      jumpTest.y += 1;
      if (!this._checkMobCollision(jumpTest) && Math.abs(mob.velocity.y) < 0.5 && (mob._jumpCooldown ?? 0) <= 0) {
        mob.velocity.y = MOB_JUMP;
        mob._jumpCooldown = 0.8;
      }
      newPos.z = mob.position.z;
      mob.velocity.z = 0;
    }

    // Y axis
    newPos.y += mob.velocity.y * dt;
    if (this._checkMobCollision(newPos)) {
      if (mob.velocity.y < 0) {
        newPos.y = Math.floor(newPos.y) + 1;
        if (this._checkMobCollision(newPos)) newPos.y = mob.position.y;
      } else {
        newPos.y = mob.position.y;
      }
      mob.velocity.y = 0;
    }

    if (newPos.y < -64) {
      newPos.y = 80;
      mob.velocity.set(0, 0, 0);
    }

    mob.position.copy(newPos);
  }

  _checkMobCollision(pos) {
    const halfW = MOB_HITBOX_W / 2;
    const halfD = MOB_HITBOX_D / 2;
    for (let x = Math.floor(pos.x - halfW); x <= Math.floor(pos.x + halfW); x++) {
      for (let y = Math.floor(pos.y); y <= Math.floor(pos.y + MOB_HITBOX_H); y++) {
        for (let z = Math.floor(pos.z - halfD); z <= Math.floor(pos.z + halfD); z++) {
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

  _moveInDirection(mob, dir, dt, speedMult = 1.0) {
    const speed = (mob.speed || 1.0) * speedMult * 5.0; // blocks per second (roguelike pace)
    mob.velocity.x += dir.x * speed * dt;
    mob.velocity.z += dir.z * speed * dt;
  }

  // ===== ANIMATION =====

  _updateAnimation(mob, dt) {
    if (!mob._parts) return;
    mob._animTime += dt;

    const parts = mob._parts;
    const speed = Math.sqrt(mob.velocity.x ** 2 + mob.velocity.z ** 2);
    const isMoving = speed > 0.01;

    // Knockback stun
    if (mob.knockbackTimer > 0) {
      if (parts.leftArm) parts.leftArm.rotation.x = -0.5;
      if (parts.rightArm) parts.rightArm.rotation.x = -0.5;
      if (parts.leftLeg) parts.leftLeg.rotation.x = 0;
      if (parts.rightLeg) parts.rightLeg.rotation.x = 0;
      return;
    }

    // Attack lunge
    if (mob.state === 'attack' && mob._animTime < 0.3) {
      const t = mob._animTime / 0.3;
      if (parts.rightArm) parts.rightArm.rotation.x = -1.5 * (1 - t);
      if (parts.leftArm) parts.leftArm.rotation.x = -0.5 * (1 - t);
      if (parts.body) parts.body.rotation.x = -0.1 * (1 - t);
      return;
    }

    if (isMoving) {
      // Walking: swing arms and legs
      const swing = Math.sin(mob._animTime * mob.speed * 6) * 0.6;
      if (parts.leftArm) parts.leftArm.rotation.x = swing;
      if (parts.rightArm) parts.rightArm.rotation.x = -swing;
      if (parts.leftLeg) parts.leftLeg.rotation.x = -swing;
      if (parts.rightLeg) parts.rightLeg.rotation.x = swing;
      if (parts.body) parts.body.rotation.x = 0;

      // Face movement direction
      mob.mesh.rotation.y = Math.atan2(mob.velocity.x, mob.velocity.z);
    } else {
      // Idle bob
      const bob = Math.sin(mob._animTime * 2) * 0.03;
      if (parts.body && parts.body.userData) parts.body.position.y = parts.body.userData.baseY + bob;
      if (parts.head && parts.head.userData) parts.head.position.y = parts.head.userData.baseY + bob;
      if (parts.leftArm) parts.leftArm.rotation.x *= 0.9;
      if (parts.rightArm) parts.rightArm.rotation.x *= 0.9;
      if (parts.leftLeg) parts.leftLeg.rotation.x *= 0.9;
      if (parts.rightLeg) parts.rightLeg.rotation.x *= 0.9;
    }
  }

  // ===== MESH CREATION =====

  _createMobMesh(type) {
    const colors = MOB_COLORS[type] || { body: 0xAAAAAA, head: 0xBBBBBB };
    const def = getMobDef(type);
    const scale = def?.boss ? (type === 'void_wyrm' ? 2.0 : 1.5) : 1.0;

    let mesh;
    if (HUMANOID_TYPES.has(type)) {
      mesh = this._createHumanoidMesh(colors, type);
    } else if (QUADRUPED_TYPES.has(type)) {
      mesh = this._createQuadrupedMesh(colors, type);
    } else if (type === 'spider' || type === 'cave_spider' || type === 'spider_queen') {
      mesh = this._createSpiderMesh(colors, type);
    } else if (type === 'chicken') {
      mesh = this._createChickenMesh(colors);
    } else if (type === 'slime') {
      mesh = this._createSlimeMesh(colors);
    } else {
      mesh = this._createHumanoidMesh(colors, type);
    }

    // Apply mob texture atlas to the body mesh
    this._applyMobTexture(mesh, type);

    // Add programmatic visual details (overlays, decorations, glows)
    this._addMobDetails(mesh, type, colors);

    mesh.scale.set(scale, scale, scale);
    return mesh;
  }

  _applyMobTexture(group, type) {
    if (!this._mobTextureAtlas) return;
    const parts = group.userData?.parts;
    if (!parts) return;

    const faceOrder = [3, 2, 4, 5, 0, 1];
    for (const partName of Object.keys(parts)) {
      const part = parts[partName];
      if (!part || !part.geometry || part.material?._special) continue;
      const uvs = part.geometry.attributes.uv;
      if (!uvs) continue;
      for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
        const uv = getMobFaceUV(type, faceOrder[faceIdx]);
        const v = faceIdx * 4;
        uvs.setXY(v, uv.u0, uv.v0);
        uvs.setXY(v + 1, uv.u1, uv.v0);
        uvs.setXY(v + 2, uv.u1, uv.v1);
        uvs.setXY(v + 3, uv.u0, uv.v1);
      }
      uvs.needsUpdate = true;
      part.material = new THREE.MeshLambertMaterial({ map: this._mobTextureAtlas });
    }
  }

  _addMobDetails(group, type, colors) {
    const parts = group.userData?.parts;
    if (!parts) return;

    switch (type) {
      case 'zombie': {
        // Ripped green skin patches on arms
        if (parts.leftArm)
          group.add(_box(0.08, 0.15, 0.03, 0x2a5a2a, -0.375, 1.2, 0.13));
        if (parts.rightArm)
          group.add(_box(0.08, 0.15, 0.03, 0x2a5a2a, 0.375, 1.0, 0.13));
        // Tattered clothing patches on body
        group.add(_box(0.15, 0.12, 0.02, 0x6a4a2a, -0.1, 1.1, 0.13));
        group.add(_box(0.12, 0.1, 0.02, 0x6a4a2a, 0.15, 0.9, 0.13));
        break;
      }
      case 'skeleton': {
        // Ribcage detail (3 horizontal white lines on body front)
        for (let i = 0; i < 3; i++) {
          const ribY = 1.1 + i * 0.12;
          group.add(_box(0.35, 0.03, 0.02, 0xeeeedd, 0, ribY, 0.13));
        }
        // Skull eye sockets (dark insets on head front)
        group.add(_box(0.1, 0.08, 0.02, 0x1a1a1a, -0.1, 1.8, 0.26));
        group.add(_box(0.1, 0.08, 0.02, 0x1a1a1a, 0.1, 1.8, 0.26));
        break;
      }
      case 'creeper': {
        // Iconic face pattern on head front: dark L-shape eyes + mouth
        group.add(_box(0.1, 0.1, 0.02, 0x1a1a1a, -0.1, 1.82, 0.26));
        group.add(_box(0.1, 0.1, 0.02, 0x1a1a1a, 0.1, 1.82, 0.26));
        group.add(_box(0.08, 0.15, 0.02, 0x1a1a1a, -0.14, 1.68, 0.26));
        group.add(_box(0.08, 0.15, 0.02, 0x1a1a1a, 0.14, 1.68, 0.26));
        group.add(_box(0.2, 0.08, 0.02, 0x1a1a1a, 0, 1.58, 0.26));
        group.add(_box(0.08, 0.1, 0.02, 0x1a1a1a, 0, 1.65, 0.26));
        break;
      }
      case 'spider':
      case 'cave_spider':
      case 'spider_queen': {
        // Hair tufts on body
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          group.add(_box(0.06, 0.12, 0.06, 0x1a1a1a,
            Math.cos(angle) * 0.55, 0.65, Math.sin(angle) * 0.45 - 0.3));
        }
        // Red eye glow (self-illuminated, already present but reinforce)
        break;
      }
      case 'enderman': {
        // Purple particle glow around eyes (wider aura)
        const auraMat = new THREE.MeshBasicMaterial({ color: 0x9900ff, transparent: true, opacity: 0.2 });
        const auraGeo = new THREE.BoxGeometry(0.5, 0.2, 0.12);
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.position.set(0, 2.25, 0.3);
        aura.material._special = true;
        group.add(aura);
        break;
      }
      case 'witch': {
        // Hat on head (stacked decreasing boxes)
        const hatBrim = _box(0.7, 0.05, 0.7, 0x2a1a2a, 0, 2.05, 0);
        group.add(hatBrim);
        const hatMid = _box(0.5, 0.2, 0.5, 0x2a1a2a, 0, 2.15, 0);
        group.add(hatMid);
        const hatTop = _box(0.3, 0.15, 0.3, 0x2a1a2a, 0, 2.3, 0);
        group.add(hatTop);
        // Nose protrusion
        group.add(_box(0.08, 0.08, 0.12, 0x6a4a5a, 0, 1.72, 0.3));
        // Potion bottle glow
        const potionMat = new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.6 });
        potionMat._special = true;
        const potionGeo = new THREE.BoxGeometry(0.1, 0.15, 0.1);
        const potion = new THREE.Mesh(potionGeo, potionMat);
        potion.position.set(0.4, 1.0, 0.1);
        group.add(potion);
        break;
      }
      case 'phantom': {
        // Translucent blue body
        group.traverse(child => {
          if (child.isMesh && child.material && !child.material._special) {
            child.material.transparent = true;
            child.material.opacity = 0.7;
            child.material.color.setHex(0x5a6a8a);
          }
        });
        // Glowing green eyes
        const pEyeMat = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
        pEyeMat._special = true;
        for (const x of [-0.1, 0.1]) {
          const eyeGeo = new THREE.BoxGeometry(0.08, 0.06, 0.02);
          const eye = new THREE.Mesh(eyeGeo, pEyeMat);
          eye.position.set(x, 0.55, 0.26);
          group.add(eye);
        }
        break;
      }
      case 'slime': {
        // Already handled with _special translucent material in _createSlimeMesh
        // Add white eye highlights on top cube
        group.add(_box(0.12, 0.12, 0.02, 0xffffff, -0.1, 1.82, 0.26));
        group.add(_box(0.12, 0.12, 0.02, 0xffffff, 0.1, 1.82, 0.26));
        group.add(_box(0.06, 0.06, 0.01, 0x111111, -0.1, 1.82, 0.27));
        group.add(_box(0.06, 0.06, 0.01, 0x111111, 0.1, 1.82, 0.27));
        break;
      }
      case 'cow': {
        // Brown body with white spots (randomized)
        for (let i = 0; i < 4; i++) {
          group.add(_box(0.2, 0.2, 0.02, 0xeeeedd,
            (Math.random() - 0.5) * 0.6, 1.0 + (Math.random() - 0.5) * 0.3, 0.61));
        }
        break;
      }
      case 'pig': {
        // Darker pink snout
        group.add(_box(0.25, 0.18, 0.1, 0xcc8080, 0, 1.05, 0.75));
        // Nostrils
        group.add(_box(0.04, 0.04, 0.02, 0x8a5a5a, -0.05, 1.05, 0.8));
        group.add(_box(0.04, 0.04, 0.02, 0x8a5a5a, 0.05, 1.05, 0.8));
        // Small ears
        group.add(_box(0.12, 0.1, 0.04, 0xdd9090, -0.2, 1.35, 0.55));
        group.add(_box(0.12, 0.1, 0.04, 0xdd9090, 0.2, 1.35, 0.55));
        break;
      }
      case 'sheep': {
        // Fluffy wool (slightly larger body box with offset)
        const woolMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
        woolMat._special = true;
        const woolGeo = new THREE.BoxGeometry(0.9, 0.7, 1.3);
        const wool = new THREE.Mesh(woolGeo, woolMat);
        wool.position.set(0, 1.05, 0);
        group.add(wool);
        break;
      }
      case 'crystal_golem': {
        // Purple crystal shards protruding from shoulders and head
        const shardMat = new THREE.MeshBasicMaterial({ color: 0xaa66ff, transparent: true, opacity: 0.8 });
        shardMat._special = true;
        for (const [sx, sy, sz, rx] of [
          [-0.35, 1.7, 0, 0.3], [0.35, 1.7, 0, -0.3],
          [-0.2, 2.1, 0, 0.5], [0.2, 2.1, 0, -0.5],
        ]) {
          const geo = new THREE.BoxGeometry(0.1, 0.25, 0.1);
          const shard = new THREE.Mesh(geo, shardMat);
          shard.position.set(sx, sy, sz);
          shard.rotation.z = rx;
          group.add(shard);
        }
        break;
      }
      case 'necromancer': {
        // Dark hood enclosing head
        const hoodMat = new THREE.MeshLambertMaterial({ color: 0x1a0a1a });
        hoodMat._special = true;
        const hoodGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const hood = new THREE.Mesh(hoodGeo, hoodMat);
        hood.position.set(0, 1.8, 0);
        group.add(hood);
        // Red glowing eyes
        const nEyeMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
        nEyeMat._special = true;
        for (const x of [-0.1, 0.1]) {
          const geo = new THREE.BoxGeometry(0.08, 0.05, 0.02);
          const eye = new THREE.Mesh(geo, nEyeMat);
          eye.position.set(x, 1.82, 0.3);
          group.add(eye);
        }
        break;
      }
      case 'void_wyrm': {
        // Segmented serpentine body (extra segments behind main body)
        for (let i = 1; i <= 3; i++) {
          const segColor = new THREE.Color(0x1a0a2a).lerp(new THREE.Color(0x6622aa), i * 0.15);
          group.add(_box(0.45 - i * 0.05, 0.4, 0.4, segColor.getHex(), 0, 0.5, -i * 0.45));
        }
        // Purple glow around head
        const wGlowMat = new THREE.MeshBasicMaterial({ color: 0xaa00ff, transparent: true, opacity: 0.25 });
        wGlowMat._special = true;
        const wGlowGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const wGlow = new THREE.Mesh(wGlowGeo, wGlowMat);
        wGlow.position.set(0, 0.5, 0.3);
        group.add(wGlow);
        break;
      }
    }
  }

  _generateBodyTexture(type, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const colors = MOB_COLORS[type] || { body: 0xaaaaaa, head: 0xbbbbbb };

    // Fill with body color
    const bodyHex = '#' + colors.body.toString(16).padStart(6, '0');
    ctx.fillStyle = bodyHex;
    ctx.fillRect(0, 0, width, height);

    // Add shading (lighter top-left, darker bottom-right for 3D effect)
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Type-specific details drawn on the canvas
    if (type === 'creeper') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(4, 4, 3, 3);
      ctx.fillRect(9, 4, 3, 3);
      ctx.fillRect(6, 8, 4, 2);
      ctx.fillRect(5, 10, 2, 2);
      ctx.fillRect(9, 10, 2, 2);
      ctx.fillRect(7, 10, 2, 3);
    } else if (type === 'zombie') {
      ctx.fillStyle = '#2a5a2a';
      ctx.fillRect(2, 6, 4, 4);
      ctx.fillRect(10, 8, 4, 3);
    } else if (type === 'skeleton') {
      ctx.fillStyle = '#eeeecc';
      for (let i = 0; i < 3; i++) ctx.fillRect(2, 4 + i * 3, 12, 1);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(4, 1, 3, 2);
      ctx.fillRect(9, 1, 3, 2);
    } else if (type === 'spider' || type === 'cave_spider' || type === 'spider_queen') {
      ctx.fillStyle = '#1a1a1a';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(1 + i * 2, 2, 1, 4);
        ctx.fillRect(1 + i * 2, 10, 1, 4);
      }
    } else if (type === 'enderman') {
      ctx.fillStyle = '#9900ff';
      ctx.fillRect(3, 5, 4, 2);
      ctx.fillRect(9, 5, 4, 2);
    } else if (type === 'cow') {
      ctx.fillStyle = '#3a2a10';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(2 + i * 4, 4 + (i % 2) * 4, 3, 3);
      }
    } else if (type === 'pig') {
      ctx.fillStyle = '#cc8080';
      ctx.fillRect(5, 6, 6, 4);
    } else if (type === 'sheep') {
      ctx.fillStyle = '#f0f0f0';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(1 + (i % 4) * 4, 1 + Math.floor(i / 4) * 7, 3, 6);
      }
    } else if (type === 'witch') {
      ctx.fillStyle = '#3a2a3a';
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillRect(3, 4, 10, 2);
    } else if (type === 'phantom') {
      ctx.fillStyle = '#5a6a8a';
      ctx.globalAlpha = 0.7;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#44ff44';
      ctx.fillRect(4, 3, 3, 2);
      ctx.fillRect(9, 3, 3, 2);
    } else if (type === 'slime') {
      ctx.fillStyle = '#66cc66';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(2, 2, 12, 12);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 4, 2, 2);
      ctx.fillRect(10, 4, 2, 2);
    } else if (type === 'crystal_golem') {
      ctx.fillStyle = '#aa66ff';
      ctx.fillRect(1, 0, 3, 5);
      ctx.fillRect(12, 0, 3, 5);
      ctx.fillRect(6, 2, 4, 3);
    } else if (type === 'necromancer') {
      ctx.fillStyle = '#1a0a1a';
      ctx.fillRect(0, 0, 16, 6);
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(4, 4, 3, 2);
      ctx.fillRect(9, 4, 3, 2);
    } else if (type === 'void_wyrm') {
      ctx.fillStyle = '#6622aa';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(2 + i * 3, 6, 2, 4);
      }
      ctx.fillStyle = '#aa00ff';
      ctx.fillRect(4, 2, 3, 2);
      ctx.fillRect(9, 2, 3, 2);
    } else if (type === 'husk') {
      ctx.fillStyle = '#7a6a4a';
      ctx.fillRect(2, 6, 4, 4);
      ctx.fillRect(10, 8, 4, 3);
    } else if (type === 'mimic') {
      ctx.fillStyle = '#a07820';
      ctx.fillRect(2, 10, 12, 4);
      ctx.fillStyle = '#444';
      ctx.fillRect(6, 8, 4, 2);
    } else if (type === 'corrupted_champion') {
      ctx.fillStyle = '#5a2a5a';
      ctx.fillRect(2, 4, 12, 8);
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillRect(9, 5, 2, 2);
    } else if (type === 'giant_zombie') {
      ctx.fillStyle = '#2a5a2a';
      ctx.fillRect(2, 6, 4, 4);
      ctx.fillRect(10, 8, 4, 3);
    } else if (type === 'harpy') {
      ctx.fillStyle = '#aa8a6a';
      ctx.fillRect(1, 2, 5, 8);
      ctx.fillRect(10, 2, 5, 8);
    }

    return new THREE.CanvasTexture(canvas);
  }

  _createHumanoidMesh(colors, type) {
    const group = new THREE.Group();

    // ===== ENDERMAN: 1.5x taller, long arms =====
    const isEnderman = type === 'enderman';
    const isSkeleton = type === 'skeleton';
    const isCreeper = type === 'creeper';
    const heightMul = isEnderman ? 1.5 : 1.0;

    // Head
    const head = _box(0.5, 0.5, 0.5, colors.head, 0, 1.75 * heightMul, 0);
    head.userData.baseY = 1.75 * heightMul;
    group.add(head);

    // Body
    const body = _box(0.5, 0.75 * heightMul, 0.25, colors.body, 0, 1.0 * heightMul, 0);
    body.userData.baseY = 1.0 * heightMul;
    group.add(body);

    // Arms
    const armLength = isEnderman ? 1.1 : 0.75;
    const armY = (isEnderman ? 1.6 : 1.375) * heightMul;
    const armWidth = isSkeleton ? 0.12 : 0.25;
    const armColor = isSkeleton ? 0xd0d0c0 : colors.body;

    const leftArm = _box(armWidth, armLength * heightMul, armWidth, armColor, -0.375, armY, 0);
    leftArm.geometry.translate(0, -(armLength * heightMul) / 2, 0);
    group.add(leftArm);

    const rightArm = _box(armWidth, armLength * heightMul, armWidth, armColor, 0.375, armY, 0);
    rightArm.geometry.translate(0, -(armLength * heightMul) / 2, 0);
    group.add(rightArm);

    // Legs (or short legs for creeper)
    const legHeight = isCreeper ? 0.35 : 0.75;
    const legWidth = isSkeleton ? 0.12 : (isCreeper ? 0.2 : 0.25);
    const legColor = isSkeleton ? 0xd0d0c0 : colors.body;
    const legY = isCreeper ? 0.35 : 0.75;

    const leftLeg = _box(legWidth, legHeight, legWidth, legColor, -0.125, legY, 0);
    leftLeg.geometry.translate(0, -legHeight / 2, 0);
    group.add(leftLeg);

    const rightLeg = _box(legWidth, legHeight, legWidth, legColor, 0.125, legY, 0);
    rightLeg.geometry.translate(0, -legHeight / 2, 0);
    group.add(rightLeg);

    // Creeper: 4 short legs (front pair)
    if (isCreeper) {
      const frontLeftLeg = _box(0.2, 0.35, 0.2, colors.body, -0.125, 0.35, 0.15);
      frontLeftLeg.geometry.translate(0, -0.175, 0);
      group.add(frontLeftLeg);
      const frontRightLeg = _box(0.2, 0.35, 0.2, colors.body, 0.125, 0.35, 0.15);
      frontRightLeg.geometry.translate(0, -0.175, 0);
      group.add(frontRightLeg);
    }

    // ===== ENDERMAN: glowing purple eyes + particle aura =====
    if (isEnderman) {
      const eyeMat = new THREE.MeshBasicMaterial({ color: colors.eyes || 0x9900ff });
      for (const x of [-0.1, 0.1]) {
        const eyeGeo = new THREE.BoxGeometry(0.12, 0.06, 0.02);
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(x, 1.8 * heightMul, 0.26);
        group.add(eye);
      }
      // Purple particle aura around eyes
      const particleMat = new THREE.MeshBasicMaterial({ color: 0x9900ff, transparent: true, opacity: 0.3 });
      const particleGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
      const particle = new THREE.Mesh(particleGeo, particleMat);
      particle.position.set(0, 1.8 * heightMul, 0.3);
      group.add(particle);
    }

    // ===== CREEPER: iconic face pattern =====
    if (isCreeper) {
      const fc = colors.face || 0x222222;
      // Eyes
      group.add(_box(0.1, 0.1, 0.02, fc, -0.1, 1.82, 0.26));
      group.add(_box(0.1, 0.1, 0.02, fc, 0.1, 1.82, 0.26));
      // Nose/mouth area (the iconic C-shape)
      group.add(_box(0.1, 0.15, 0.02, fc, 0, 1.68, 0.26));
      group.add(_box(0.2, 0.08, 0.02, fc, 0, 1.58, 0.26));
      group.add(_box(0.08, 0.2, 0.02, fc, -0.14, 1.65, 0.26));
      group.add(_box(0.08, 0.2, 0.02, fc, 0.14, 1.65, 0.26));
    }

    // ===== SKELETON: skull with eye sockets + ribcage =====
    if (isSkeleton) {
      // Eye sockets (dark hollows)
      group.add(_box(0.12, 0.1, 0.04, 0x222222, -0.1, 1.8, 0.26));
      group.add(_box(0.12, 0.1, 0.04, 0x222222, 0.1, 1.8, 0.26));
      // Nose hole
      group.add(_box(0.06, 0.06, 0.04, 0x222222, 0, 1.7, 0.26));
      // Jaw line
      group.add(_box(0.3, 0.06, 0.04, 0xc8c8b8, 0, 1.55, 0.26));
      // Teeth
      for (let i = -0.1; i <= 0.1; i += 0.05) {
        group.add(_box(0.03, 0.04, 0.02, 0xeeeedd, i, 1.55, 0.28));
      }
      // Ribcage on body (horizontal ribs)
      for (let i = 0; i < 4; i++) {
        const ribY = 1.2 + i * 0.12;
        group.add(_box(0.4, 0.04, 0.06, 0xd0d0c0, 0, ribY, 0.13));
      }
      // Spine (vertical line down back)
      group.add(_box(0.06, 0.6, 0.06, 0xd0d0c0, 0, 1.0, -0.13));
      // Pelvis
      group.add(_box(0.35, 0.08, 0.15, 0xd0d0c0, 0, 0.7, 0));
    }

    group.userData.parts = { head, body, leftArm, rightArm, leftLeg, rightLeg };
    return group;
  }

  _createQuadrupedMesh(colors, type) {
    const group = new THREE.Group();

    const body = _box(0.8, 0.6, 1.2, colors.body, 0, 1.0, 0);
    body.userData.baseY = 1.0;
    group.add(body);

    const head = _box(0.5, 0.5, 0.5, colors.head, 0, 1.1, 0.7);
    head.userData.baseY = 1.1;
    group.add(head);

    const legPositions = [[-0.25, 0.65, 0.35], [0.25, 0.65, 0.35], [-0.25, 0.65, -0.35], [0.25, 0.65, -0.35]];
    const legs = legPositions.map(([x, y, z]) => {
      const leg = _box(0.25, 0.6, 0.25, colors.body, x, y, z);
      leg.geometry.translate(0, -0.3, 0);
      group.add(leg);
      return leg;
    });

    // Cow spots
    if (type === 'cow' && colors.spots) {
      for (let i = 0; i < 3; i++) {
        group.add(_box(0.3, 0.3, 0.02, colors.spots,
          (Math.random() - 0.5) * 0.6, 1.0 + (Math.random() - 0.5) * 0.3, 0.61));
      }
    }

    group.userData.parts = {
      head, body,
      leftLeg: legs[0], rightLeg: legs[1],
      leftArm: legs[2], rightArm: legs[3],
    };
    return group;
  }

  _createChickenMesh(colors) {
    const group = new THREE.Group();

    // Body
    const body = _box(0.4, 0.4, 0.5, colors.body, 0, 0.6, 0);
    body.userData.baseY = 0.6;
    group.add(body);

    // Head
    const head = _box(0.3, 0.3, 0.3, colors.body, 0, 0.95, 0.15);
    head.userData.baseY = 0.95;
    group.add(head);

    // Beak (bigger, orange)
    group.add(_box(0.14, 0.1, 0.16, 0xFF8800, 0, 0.9, 0.38));

    // Red wattle under beak
    group.add(_box(0.06, 0.1, 0.04, 0xCC0000, 0, 0.78, 0.3));

    // Eyes
    group.add(_box(0.05, 0.05, 0.02, 0x111111, -0.08, 1.0, 0.3));
    group.add(_box(0.05, 0.05, 0.02, 0x111111, 0.08, 1.0, 0.3));

    // Wings (tiny white boxes on sides)
    group.add(_box(0.06, 0.2, 0.25, 0xF0F0F0, -0.24, 0.62, 0));
    group.add(_box(0.06, 0.2, 0.25, 0xF0F0F0, 0.24, 0.62, 0));

    // Tail feathers (small angled boxes at back)
    group.add(_box(0.08, 0.18, 0.04, 0xDDD8C8, 0, 0.72, -0.3));
    group.add(_box(0.06, 0.15, 0.04, 0xDDD8C8, -0.06, 0.74, -0.28));
    group.add(_box(0.06, 0.15, 0.04, 0xDDD8C8, 0.06, 0.74, -0.28));

    // Legs (pivot at hip)
    const leftLeg = _box(0.08, 0.3, 0.08, 0xAAAA55, -0.1, 0.35, 0);
    leftLeg.geometry.translate(0, -0.15, 0);
    group.add(leftLeg);

    const rightLeg = _box(0.08, 0.3, 0.08, 0xAAAA55, 0.1, 0.35, 0);
    rightLeg.geometry.translate(0, -0.15, 0);
    group.add(rightLeg);

    // Feet (flat orange boxes at bottom of legs)
    group.add(_box(0.14, 0.04, 0.16, 0xFF8800, -0.1, 0.06, 0.04));
    group.add(_box(0.14, 0.04, 0.16, 0xFF8800, 0.1, 0.06, 0.04));

    group.userData.parts = { head, body, leftLeg, rightLeg, leftArm: null, rightArm: null };
    return group;
  }

  _createSpiderMesh(colors, type) {
    const group = new THREE.Group();

    // Abdomen (flatter, wider)
    const body = _box(1.2, 0.4, 1.0, colors.body, 0, 0.45, -0.3);
    body.userData.baseY = 0.45;
    group.add(body);

    // Head (slightly smaller, forward)
    const head = _box(0.6, 0.45, 0.5, colors.head, 0, 0.5, 0.3);
    head.userData.baseY = 0.5;
    group.add(head);

    // Eyes (glowing red) - 4 pairs
    const eyeColor = colors.eyes || 0xff0000;
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    for (const [x, y, z] of [[-0.15, 0.62, 0.56], [0.15, 0.62, 0.56], [-0.22, 0.52, 0.56], [0.22, 0.52, 0.56]]) {
      const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, y, z);
      group.add(eye);
    }
    // Additional smaller eyes
    for (const [x, y, z] of [[-0.08, 0.65, 0.56], [0.08, 0.65, 0.56], [-0.25, 0.45, 0.56], [0.25, 0.45, 0.56]]) {
      const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.04);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, y, z);
      group.add(eye);
    }

    // Fangs below head (white/light gray)
    group.add(_box(0.04, 0.14, 0.04, 0xccccaa, -0.08, 0.2, 0.52));
    group.add(_box(0.04, 0.14, 0.04, 0xccccaa, 0.08, 0.2, 0.52));

    // 8 legs (4 per side) — longer, angled outward
    const legAngles = [-0.6, -0.2, 0.15, 0.5];
    const legs = [];
    for (const zOff of legAngles) {
      for (const side of [-1, 1]) {
        // Upper segment
        const leg = _box(0.06, 0.7, 0.06, colors.body, side * 0.65, 0.55, zOff);
        leg.geometry.translate(0, -0.35, 0);
        leg.rotation.z = side * 0.6;
        group.add(leg);
        legs.push(leg);
      }
    }

    group.userData.parts = {
      head, body,
      leftLeg: legs[0], rightLeg: legs[1],
      leftArm: legs[2], rightArm: legs[3],
    };
    return group;
  }

  _createSlimeMesh(colors) {
    const group = new THREE.Group();

    // Multiple stacked cubes getting smaller (Minecraft slime style)
    const sizes = [
      { w: 0.9, h: 0.9, d: 0.9, y: 0.5 },
      { w: 0.7, h: 0.7, d: 0.7, y: 1.2 },
      { w: 0.5, h: 0.5, d: 0.5, y: 1.7 },
    ];

    // Outer translucent green shell
    const shellMat = new THREE.MeshPhongMaterial({
      color: colors.body,
      transparent: true,
      opacity: 0.6,
      emissive: 0x1a5c1a,
      emissiveIntensity: 0.3,
    });
    shellMat._special = true;

    // Inner glow cube (smaller, brighter)
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x66cc66,
      transparent: true,
      opacity: 0.4,
      emissive: 0x33aa33,
      emissiveIntensity: 0.5,
    });

    // Bottom layer (body) - largest
    const bodyGeo = new THREE.BoxGeometry(sizes[0].w, sizes[0].h, sizes[0].d);
    const body = new THREE.Mesh(bodyGeo, shellMat.clone());
    body.material._special = true;
    body.position.set(0, sizes[0].y, 0);
    body.userData.baseY = sizes[0].y;
    group.add(body);

    // Inner cube for depth inside body
    const innerGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.set(0, 0, 0); // relative to body
    body.add(inner);

    // Middle layer
    const midGeo = new THREE.BoxGeometry(sizes[1].w, sizes[1].h, sizes[1].d);
    const mid = new THREE.Mesh(midGeo, shellMat.clone());
    mid.material._special = true;
    mid.position.set(0, sizes[1].y - sizes[0].y, 0); // relative to body
    body.add(mid);

    // Top layer (head area) - smallest
    const headGeo = new THREE.BoxGeometry(sizes[2].w, sizes[2].h, sizes[2].d);
    const head = new THREE.Mesh(headGeo, shellMat.clone());
    head.material._special = true;
    head.position.set(0, sizes[2].y, 0);
    head.userData.baseY = sizes[2].y;
    group.add(head);

    // Eyes (white with dark pupils) on top section
    group.add(_box(0.15, 0.15, 0.05, 0xffffff, -0.12, 1.82, 0.26));
    group.add(_box(0.15, 0.15, 0.05, 0xffffff, 0.12, 1.82, 0.26));
    group.add(_box(0.07, 0.07, 0.02, 0x111111, -0.12, 1.82, 0.29));
    group.add(_box(0.07, 0.07, 0.02, 0x111111, 0.12, 1.82, 0.29));

    // Mouth below eyes (dark rectangle)
    group.add(_box(0.2, 0.08, 0.02, 0x225522, 0, 1.62, 0.26));

    group.userData.parts = { head, body, leftArm: null, rightArm: null, leftLeg: null, rightLeg: null };
    return group;
  }

  // ===== FLASH (white on hit) =====

  _flashWhite(mob) {
    mob._savedColors = [];
    mob.mesh.traverse(child => {
      if (child.isMesh && child.material) {
        mob._savedColors.push({ mesh: child, color: child.material.color.getHex() });
        child.material.color.setHex(0xffffff);
      }
    });
    mob.flashTimer = 0.1; // 100ms
  }

  _restoreColors(mob) {
    if (mob._savedColors) {
      for (const entry of mob._savedColors) {
        if (entry.mesh.material) entry.mesh.material.color.setHex(entry.color);
      }
      mob._savedColors = null;
    }
  }

  // ===== BOSS SPAWNING =====

  /**
   * Spawn a boss mob at given position. Used by dungeon spawners.
   */
  spawnBoss(type, x, y, z) {
    const def = getMobDef(type);
    if (!def || !def.boss) return null;
    return this.spawnMob(type, x, y, z);
  }

  /**
   * Called periodically to spawn bosses near mob spawner blocks the player is close to.
   */
  checkSpawnerBlocks() {
    const px = Math.floor(this.player.position.x);
    const py = Math.floor(this.player.position.y);
    const pz = Math.floor(this.player.position.z);
    const range = 12;

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        for (let dz = -range; dz <= range; dz++) {
          const bx = px + dx, by = py + dy, bz = pz + dz;
          const blockId = this.world.getBlock(bx, by, bz);
          if (blockId === 60) { // MobSpawner block
            // Only spawn if no boss already nearby
            const hasBoss = this.mobs.some(m => m._def?.boss && m.position.distanceTo(new THREE.Vector3(bx + 0.5, by + 1, bz + 0.5)) < 16);
            if (!hasBoss && Math.random() < 0.01) {
              const bossTypes = ['giant_zombie', 'spider_queen', 'necromancer', 'corrupted_champion'];
              const type = bossTypes[Math.floor(Math.random() * bossTypes.length)];
              this.spawnBoss(type, bx + 0.5, by + 1, bz + 0.5);
              this.audio?.play?.('mob_death'); // reuse as alert sound
            }
          }
        }
      }
    }
  }

  // ===== DROPS =====

  _spawnMobDrops(mob, def) {
    const dropMult = this.player._roguelikeModifiers?.mobDropMultiplier ?? 1;
    const rareMult = this.player._roguelikeModifiers?.rareDropChance ?? 1;
    for (const drop of def.drops) {
      const effectiveChance = Math.min(1, (drop.chance ?? 1) * rareMult);
      if (Math.random() < effectiveChance) {
        const baseCount = (drop.min ?? 0) + Math.floor(Math.random() * ((drop.max ?? 0) - (drop.min ?? 0) + 1));
        const count = Math.floor(baseCount * dropMult);
        const itemDef = getItemByName(drop.item);
        if (!itemDef) continue;

        for (let j = 0; j < count; j++) {
          const x = mob.position.x + (Math.random() - 0.5) * 0.6;
          const y = mob.position.y + 0.5;
          const z = mob.position.z + (Math.random() - 0.5) * 0.6;

          const size = 0.25;
          const geo = new THREE.BoxGeometry(size, size, size);
          const mat = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(x, y, z);

          const droppedItem = {
            id: itemDef.id,
            count: 1,
            mesh,
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.15,
              0.12 + Math.random() * 0.08,
              (Math.random() - 0.5) * 0.15
            ),
            lifetime: 300,
            age: 0,
            pickupDelay: 0.5,
          };

          // Push into player's dropped items for pickup handling
          if (this.player && this.player.droppedItems) {
            this.player.droppedItems.push(droppedItem);
          }
          this.scene.add(mesh);
        }
      }
    }
  }
}

// ===== HELPERS =====

function _rand(min, max) {
  return min + Math.random() * (max - min);
}

function _box(w, h, d, color, x, y, z, mobType, partType, atlasTexture) {
  const geo = new THREE.BoxGeometry(w, h, d);
  let mat;

  if (atlasTexture && mobType && partType === 'body') {
    // Apply mob texture to body faces
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
    // Map to atlas: front(+Z)=0, back(-Z)=1, left(-X)=2, right(+X)=3, top(+Y)=4, bottom(-Y)=5
    const faceOrder = [3, 2, 4, 5, 0, 1]; // box face idx → mob face idx
    const uvs = geo.attributes.uv;
    const pos = geo.attributes.position;
    const index = geo.index;

    // For each face (2 triangles = 6 indices), set UVs
    for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
      const uv = getMobFaceUV(mobType, faceOrder[faceIdx]);
      // BoxGeometry has 4 vertices per face, indexed as pairs of triangles
      const vertStart = faceIdx * 4;
      // UV layout per face: [0,0], [1,0], [1,1], [0,1] mapped to (u0,v0)-(u1,v1)
      uvs.setXY(vertStart, uv.u0, uv.v0);
      uvs.setXY(vertStart + 1, uv.u1, uv.v0);
      uvs.setXY(vertStart + 2, uv.u1, uv.v1);
      uvs.setXY(vertStart + 3, uv.u0, uv.v1);
    }
    uvs.needsUpdate = true;

    mat = new THREE.MeshLambertMaterial({ map: atlasTexture });
  } else {
    mat = new THREE.MeshLambertMaterial({ color });
  }

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function _disposeMesh(group) {
  group.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }
  });
}
