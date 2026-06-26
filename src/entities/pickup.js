// MineRogue - Block Drop 3D Pickup Entity
// When a block is mined, spawn a small 3D entity that floats, rotates,
// and gets magnet-picked up when player is near.

import * as THREE from 'three';
import { getItem, getItemByName } from '../data/items.js';
import { getBlock } from '../data/blocks.js';

// ─── Pickup Entity ────────────────────────────────────────────────

export class PickupManager {
  constructor(scene) {
    this.scene = scene;
    this.pickups = [];
    this._magnetRange = 2.5;     // blocks - magnet pull range
    this._pickupRange = 1.2;     // blocks - actual pickup distance
    this._despawnTime = 30;       // seconds before auto-despawn
    this._floatAmplitude = 0.15; // how much it bobs up/down
    this._floatSpeed = 2.0;      // bob speed
    this._spinSpeed = 2.5;       // radians per second
    this._magnetSpeed = 8.0;     // blocks/sec pull speed
    this._spawnBounceSpeed = 4.0;
    this._spawnBounceDecay = 6.0;
  }

  /**
   * Spawn a pickup entity at a world position.
   * @param {number} itemId - The item ID to drop
   * @param {number} x - World X
   * @param {number} y - World Y
   * @param {number} z - World Z
   * @param {object} [opts] - Options: { count, velocity, blockColor }
   * @returns {object} The pickup entity
   */
  spawn(itemId, x, y, z, opts = {}) {
    const count = opts.count ?? 1;
    const size = 0.3;
    const geo = new THREE.BoxGeometry(size, size, size);
    const color = opts.blockColor ?? this._getItemColor(itemId);
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: 1.0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);

    // Initial velocity (scatter from broken block)
    const velocity = opts.velocity ?? new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      2.0 + Math.random() * 1.5,
      (Math.random() - 0.5) * 2,
    );

    const pickup = {
      id: itemId,
      count,
      mesh,
      velocity,
      age: 0,
      despawnTime: this._despawnTime,
      phase: Math.random() * Math.PI * 2, // random start phase for bob
      state: 'bouncing', // 'bouncing' | 'floating' | 'magnet' | 'collected'
      bounceTimer: 0,
    };

    this.pickups.push(pickup);
    this.scene.add(mesh);
    return pickup;
  }

  /**
   * Update all pickups each frame.
   * @param {number} dt - Delta time in seconds
   * @param {THREE.Vector3} playerPos - Player position (feet)
   * @param {object} inventory - Player inventory (addItem method)
   * @param {function} [onPickup] - Callback when item is picked up: (itemId, count) => void
   * @returns {Array<{id, count}>} Items collected this frame
   */
  update(dt, playerPos, inventory, onPickup) {
    const collected = [];
    // Eye-level reference for magnet
    const eyePos = playerPos.clone().add(new THREE.Vector3(0, 1.0, 0));

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.age += dt;

      // Despawn check
      if (p.age > p.despawnTime) {
        this._remove(i);
        continue;
      }

      // State machine
      switch (p.state) {
        case 'bouncing':
          this._updateBouncing(dt, p);
          break;
        case 'floating':
          this._updateFloating(dt, p, eyePos);
          break;
        case 'magnet':
          this._updateMagnet(dt, p, eyePos, inventory, collected, i);
          break;
      }

      // Fade out near despawn
      const fadeStart = p.despawnTime - 3;
      if (p.age > fadeStart) {
        const t = (p.age - fadeStart) / 3;
        p.mesh.material.opacity = 1 - t;
        // Blink
        if (t > 0.5) {
          p.mesh.visible = Math.floor(p.age * 8) % 2 === 0;
        }
      }
    }

    return collected;
  }

  /**
   * Bouncing state: physics with gravity + ground collision
   */
  _updateBouncing(dt, p) {
    p.velocity.y -= 12 * dt; // gravity
    p.mesh.position.addScaledVector(p.velocity, dt);

    // Spin
    p.mesh.rotation.y += this._spinSpeed * dt;
    p.mesh.rotation.x += this._spinSpeed * 0.3 * dt;

    // Ground collision (approximate — check if below y=1 or if block below is solid)
    const groundY = Math.floor(p.mesh.position.y);
    if (p.velocity.y < 0 && p.mesh.position.y < groundY + 0.5) {
      p.velocity.y *= -0.3; // bounce
      p.velocity.x *= 0.7;
      p.velocity.z *= 0.7;
      if (Math.abs(p.velocity.y) < 0.3) {
        p.velocity.y = 0;
      }
    }

    // Friction
    p.velocity.x *= Math.exp(-4 * dt);
    p.velocity.z *= Math.exp(-4 * dt);

    p.bounceTimer += dt;

    // Transition to floating after settling
    if (p.bounceTimer > 0.8 && p.velocity.length() < 0.3) {
      p.state = 'floating';
      p.velocity.set(0, 0, 0);
    }
  }

  /**
   * Floating state: bob up/down, spin, check for magnet trigger
   */
  _updateFloating(dt, p, eyePos) {
    // Float bob
    p.phase += this._floatSpeed * dt;
    p.mesh.position.y += Math.sin(p.phase) * this._floatAmplitude * dt;

    // Spin
    p.mesh.rotation.y += this._spinSpeed * dt;

    // Check magnet range
    const dist = p.mesh.position.distanceTo(eyePos);
    if (dist < this._magnetRange) {
      p.state = 'magnet';
    }
  }

  /**
   * Magnet state: pull toward player, collect on contact
   */
  _updateMagnet(dt, p, eyePos, inventory, collected, index) {
    const dir = eyePos.clone().sub(p.mesh.position);
    const dist = dir.length();

    if (dist < this._pickupRange) {
      // Collect!
      const remaining = inventory.addItem(p.id, p.count);
      if (remaining === 0) {
        collected.push({ id: p.id, count: p.count });
        this._remove(index);
        return;
      } else {
        // Partial pickup (inventory full)
        p.count = remaining;
      }
    }

    // Pull toward player
    if (dist > 0.1) {
      dir.normalize();
      const speed = this._magnetSpeed * (1 + (this._magnetRange - dist) * 2);
      p.mesh.position.addScaledVector(dir, speed * dt);
    }

    // Accelerating spin when magnetized
    p.mesh.rotation.y += this._spinSpeed * 3 * dt;
  }

  /**
   * Remove a pickup by index
   */
  _remove(index) {
    const p = this.pickups[index];
    if (!p) return;
    this.scene.remove(p.mesh);
    p.mesh.geometry.dispose();
    p.mesh.material.dispose();
    this.pickups.splice(index, 1);
  }

  /**
   * Clear all pickups (e.g. when returning to menu)
   */
  clear() {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      this._remove(i);
    }
  }

  /**
   * Get color for an item/block ID
   */
  _getItemColor(itemId) {
    // Block colors (IDs 1-99)
    if (itemId < 100) {
      const blockColors = {
        1: 0x888888,  // Stone
        2: 0x55AA55,  // Grass
        3: 0x8B6914,  // Dirt
        4: 0x999999,  // Cobblestone
        5: 0x8B6914,  // Wood Planks
        6: 0x664400,  // Oak Log
        7: 0x333333,  // Bedrock
        8: 0xCC8833,  // Sand
        9: 0xBBBB77,  // Gravel
        10: 0xFFCC00, // Gold Ore
        11: 0xCCCCCC, // Iron Ore
        12: 0x88DDFF, // Diamond Ore
        13: 0x333333, // Coal Ore
        14: 0xCC3333, // Redstone Ore
        15: 0x444444, // Obsidian
        16: 0x8B6914, // Crafting Table
        17: 0x666666, // Furnace
        18: 0x555555, // Chest
        19: 0x55AA55, // Leaves
        20: 0xAA66FF, // Crystal Ore
      };
      return blockColors[itemId] || 0xCCCCCC;
    }

    // Item colors (IDs 100+)
    const itemDef = getItem(itemId);
    if (!itemDef) return 0xCCCCCC;

    const materialColors = {
      wood: 0x8B6914, stone: 0x888888, iron: 0xCCCCCC,
      gold: 0xFFD700, diamond: 0x00CED1, crystal: 0xAA66FF,
      leather: 0x8B4513,
    };
    if (itemDef.material && materialColors[itemDef.material]) {
      return materialColors[itemDef.material];
    }

    const typeColors = {
      food: 0xFFAA00, material: 0xCCCCCC, potion: 0xFF00FF,
      legendary: 0xFFD700, ammo: 0x555555,
    };
    return typeColors[itemDef.type] || 0xCCCCCC;
  }

  /**
   * Get count of active pickups
   */
  get count() {
    return this.pickups.length;
  }
}
