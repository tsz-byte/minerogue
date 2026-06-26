import * as THREE from 'three';

const MAX_PARTICLES = 300;

/**
 * GPU-efficient particle system using a single BufferGeometry + Points
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Create geometry with max particles
    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.colors = new Float32Array(MAX_PARTICLES * 3);
    this.sizes = new Float32Array(MAX_PARTICLES);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Custom shader material for per-particle size and color
    this.material = new THREE.PointsMaterial({
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);

    // Initialize all particles as inactive
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 0.1,
        life: 0,
        maxLife: 1,
      });
      // Set inactive particles off-screen
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -9999;
      this.positions[i * 3 + 2] = 0;
      this.sizes[i] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  /**
   * Find an inactive particle slot
   * @returns {number} Index or -1 if pool full
   */
  _findSlot() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!this.particles[i].active) return i;
    }
    return -1;
  }

  /**
   * Emit particles at a position
   * @param {THREE.Vector3} position - World position
   * @param {object} options
   * @param {number} options.count - Number of particles (default 6)
   * @param {THREE.Color|string} options.color - Particle color
   * @param {number} options.size - Particle size (default 0.15)
   * @param {number} options.life - Lifetime in seconds (default 0.5)
   * @param {THREE.Vector3} options.velocity - Base velocity direction
   * @param {number} options.spread - Random spread factor (default 2)
   * @param {number} options.gravity - Gravity effect (default -5)
   */
  emit(position, options = {}) {
    const {
      count = 6,
      color = '#ffffff',
      size = 0.15,
      life = 0.5,
      velocity = null,
      spread = 2,
      gravity = -5,
    } = options;

    const col = color instanceof THREE.Color ? color : new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const idx = this._findSlot();
      if (idx === -1) break; // Pool full

      const p = this.particles[idx];
      p.active = true;
      p.position.copy(position);
      p.color.copy(col);
      p.size = size * (0.7 + Math.random() * 0.6);
      p.life = life;
      p.maxLife = life;

      // Set velocity
      if (velocity) {
        p.velocity.copy(velocity);
      } else {
        p.velocity.set(
          (Math.random() - 0.5) * spread,
          Math.random() * spread * 0.5,
          (Math.random() - 0.5) * spread
        );
      }
      // Add random spread
      p.velocity.x += (Math.random() - 0.5) * spread * 0.5;
      p.velocity.y += Math.random() * spread * 0.3;
      p.velocity.z += (Math.random() - 0.5) * spread * 0.5;

      // Store gravity for this particle
      p.gravity = gravity;

      // Update buffers immediately
      this.positions[idx * 3] = p.position.x;
      this.positions[idx * 3 + 1] = p.position.y;
      this.positions[idx * 3 + 2] = p.position.z;
      this.colors[idx * 3] = p.color.r;
      this.colors[idx * 3 + 1] = p.color.g;
      this.colors[idx * 3 + 2] = p.color.b;
      this.sizes[idx] = p.size;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  /**
   * Update all active particles
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    let changed = false;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      changed = true;

      // Update life
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        this.positions[i * 3 + 1] = -9999;
        this.sizes[i] = 0;
        continue;
      }

      // Apply gravity
      p.velocity.y += (p.gravity || -5) * dt;

      // Update position
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;

      // Fade out
      const lifeRatio = p.life / p.maxLife;
      const currentSize = p.size * lifeRatio;

      // Update buffers
      this.positions[i * 3] = p.position.x;
      this.positions[i * 3 + 1] = p.position.y;
      this.positions[i * 3 + 2] = p.position.z;
      this.sizes[i] = currentSize;

      // Fade color slightly
      this.colors[i * 3] = p.color.r * (0.5 + lifeRatio * 0.5);
      this.colors[i * 3 + 1] = p.color.g * (0.5 + lifeRatio * 0.5);
      this.colors[i * 3 + 2] = p.color.b * (0.5 + lifeRatio * 0.5);
    }

    if (changed) {
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.geometry.attributes.size.needsUpdate = true;
    }
  }

  /**
   * Remove all particles and clear the system
   */
  clear() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles[i].active = false;
      this.positions[i * 3 + 1] = -9999;
      this.sizes[i] = 0;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  // ──────────────────────────────────────────────
  // Preset effects
  // ──────────────────────────────────────────────

  /**
   * Block break particles (6 particles, block color, 0.4s)
   */
  blockBreak(pos, color) {
    this.emit(pos, {
      count: 6,
      color: color || '#8a8a8a',
      size: 0.12,
      life: 0.4,
      spread: 3,
      gravity: -8,
    });
  }

  /**
   * Hit effect (4 red particles, 0.2s)
   */
  hitEffect(pos) {
    this.emit(pos, {
      count: 4,
      color: '#ff3030',
      size: 0.1,
      life: 0.2,
      spread: 4,
      gravity: -3,
    });
  }

  /**
   * Critical hit effect (8 yellow particles, 0.3s)
   */
  critEffect(pos) {
    this.emit(pos, {
      count: 8,
      color: '#ffe040',
      size: 0.15,
      life: 0.3,
      spread: 5,
      gravity: -2,
    });
  }

  /**
   * Kill effect (12 mob color particles, 0.5s)
   */
  killEffect(pos, color) {
    this.emit(pos, {
      count: 12,
      color: color || '#ff4040',
      size: 0.18,
      life: 0.5,
      spread: 4,
      gravity: -6,
    });
  }

  /**
   * Explosion effect (20 orange/red particles, 0.5s, radial)
   */
  explosionEffect(pos) {
    // Orange burst
    this.emit(pos, {
      count: 12,
      color: '#ff6020',
      size: 0.25,
      life: 0.5,
      spread: 6,
      gravity: -4,
    });
    // Red core
    this.emit(pos, {
      count: 5,
      color: '#ff2020',
      size: 0.2,
      life: 0.3,
      spread: 3,
      gravity: -2,
    });
    // Yellow sparks
    this.emit(pos, {
      count: 3,
      color: '#ffe040',
      size: 0.1,
      life: 0.4,
      spread: 8,
      gravity: -8,
    });
  }

  /**
   * Torch particle (1 yellow, 0.5s, float up)
   */
  torchParticle(pos) {
    this.emit(pos, {
      count: 1,
      color: '#ffa020',
      size: 0.08,
      life: 0.5,
      velocity: new THREE.Vector3(0, 1.5, 0),
      spread: 0.3,
      gravity: 0.5, // Slight upward drift
    });
  }

  /**
   * Shrine particle (1 purple, 1s)
   */
  shrineParticle(pos) {
    this.emit(pos, {
      count: 1,
      color: '#a040e0',
      size: 0.1,
      life: 1.0,
      velocity: new THREE.Vector3(0, 0.8, 0),
      spread: 0.5,
      gravity: 0.3,
    });
  }

  /**
   * Portal particle (1 green/blue, 1s)
   */
  portalParticle(pos) {
    const colors = ['#40e0a0', '#40a0e0', '#60c0ff', '#40ffc0'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.emit(pos, {
      count: 1,
      color,
      size: 0.12,
      life: 1.0,
      velocity: new THREE.Vector3(0, 1.2, 0),
      spread: 0.8,
      gravity: 0.2,
    });
  }

  /**
   * Dispose of the particle system
   */
  dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ──────────────────────────────────────────────
// Auto-updating particle effects manager
// ──────────────────────────────────────────────

/**
 * Singleton-like particle effects that auto-update each frame.
 * Usage:
 *   import { effects } from './particles.js';
 *   effects.init(scene);
 *   effects.particles.blockBreak(pos, '#8a8a8a');
 *   // In game loop:
 *   effects.update(dt);
 */
export const effects = {
  particles: null,
  _scene: null,

  /**
   * Initialize the particle system
   * @param {THREE.Scene} scene
   */
  init(scene) {
    this._scene = scene;
    this.particles = new ParticleSystem(scene);
  },

  /**
   * Update all particles (call in game loop)
   * @param {number} dt - Delta time
   */
  update(dt) {
    if (this.particles) {
      this.particles.update(dt);
    }
  },

  /**
   * Clear all particles
   */
  clear() {
    if (this.particles) {
      this.particles.clear();
    }
  },

  /**
   * Dispose of the particle system
   */
  dispose() {
    if (this.particles) {
      this.particles.dispose();
      this.particles = null;
    }
  },
};
