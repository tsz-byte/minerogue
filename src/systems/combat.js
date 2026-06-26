// Combat system - melee, ranged, mob attacks, and all the juice
import * as THREE from 'three';
import { getItem } from '../data/items.js';

class DamageNumberManager {
  constructor() {
    this.container = document.getElementById('damage-numbers');
  }

  spawn(amount, crit, isPlayerDamage, worldPos, camera) {
    const el = document.createElement('div');
    el.className = 'dmg-number' + (crit ? ' crit' : '') + (isPlayerDamage ? ' player-dmg' : '');
    el.textContent = Math.floor(amount);
    const projected = worldPos.clone().project(camera);
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    el.style.left = `${x + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${y}px`;
    if (this.container) this.container.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }
}

/** Helper: convert a hex number (e.g. 0xff4444) to a THREE.Color */
function hexToColor(hex) {
  return new THREE.Color(hex);
}

export class CombatSystem {
  constructor(player, mobManager, particles, audio, camera) {
    this.player = player;
    this.mobManager = mobManager;
    this.audio = audio;
    this.camera = camera;
    this.particles = particles; // shared ParticleSystem — always passed in
    this.damageNumbers = new DamageNumberManager();
    this.arrows = [];
    this._hitstopTimer = 0;
    this._slowmoTimer = 0;
    this._slowmoSpeed = 1;
    this._redVignetteOpacity = 0;
    this._meleeCooldown = 0;
    this._rangedCooldown = 0;
    this.gameSpeed = 1;
    this._attackAnimTimer = 0;
    this._attackSwingDir = 0;
    this._damageOverlay = document.getElementById('damage-overlay');
  }

  update(dt) {
    if (this._hitstopTimer > 0) { this._hitstopTimer -= dt; return; }
    if (this._slowmoTimer > 0) {
      this._slowmoTimer -= dt;
      this.gameSpeed = this._slowmoSpeed;
      if (this._slowmoTimer <= 0) this.gameSpeed = 1;
    }
    this._meleeCooldown = Math.max(0, this._meleeCooldown - dt);
    this._rangedCooldown = Math.max(0, this._rangedCooldown - dt);
    if (this._attackAnimTimer > 0) this._attackAnimTimer -= dt;
    if (this._redVignetteOpacity > 0) {
      this._redVignetteOpacity = Math.max(0, this._redVignetteOpacity - dt * 2);
      if (this._damageOverlay) this._damageOverlay.style.opacity = this._redVignetteOpacity;
    }
    this._checkMobAttacks();
    this.updateArrows(dt);
  }

  playerAttack() {
    if (this._meleeCooldown > 0) return;

    const toolData = this.player.inventory?.getHeldToolData();
    const baseDmg = toolData?.damage ?? 1;
    const toolType = toolData?.type ?? 'hand';

    // Apply roguelike modifiers
    const mods = this.player._roguelikeModifiers || {};
    const damageMult = (mods.playerDamageMultiplier ?? 1);
    const critBonus = (mods.critChanceBonus ?? 0);

    const cooldowns = { sword: 0.6, axe: 0.8, pickaxe: 1.0, shovel: 1.0, hand: 1.0 };
    this._meleeCooldown = cooldowns[toolType] ?? 1.0;

    const origin = this.player.getEyePosition();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));

    const reach = 4;
    const cone = Math.PI / 3;
    const mob = this.mobManager.checkMobHit(origin, direction, reach, cone);

    if (mob) {
      const isCrit = Math.random() < 0.10 + critBonus + (this.player.velocity.y < -0.05 ? 0.15 : 0);
      const critMult = isCrit ? 2.0 : 1.0;
      const defense = 0;
      const armorRed = defense / (defense + 10);
      const finalDmg = Math.max(1, Math.floor(baseDmg * damageMult * critMult * (1 - armorRed)));

      const kbDir = mob.position.clone().sub(this.player.position);
      kbDir.y = 0; kbDir.normalize();
      if (isCrit) kbDir.multiplyScalar(2);

      const isKill = mob.hp - finalDmg <= 0;
      this.mobManager.damageMob(mob, finalDmg, kbDir);

      // Achievement tracking
      if (window.game?.runStats) {
        if (isCrit) window.game.runStats.critsLanded = (window.game.runStats.critsLanded || 0) + 1;
        if (isKill) {
          window.game.runStats.mobsKilled = (window.game.runStats.mobsKilled || 0) + 1;
          // Boss tracking
          if (mob._def?.isBoss) {
            window.game.runStats.bossesKilled = (window.game.runStats.bossesKilled || 0) + 1;
          }
          // Creeper pre-kill (killed before explosion)
          if (mob._def?.special === 'explosive') {
            window.game.runStats.creeperPreKill = (window.game.runStats.creeperPreKill || 0) + 1;
          }
        }
      }

      // JUICE
      this._hitstopTimer = (isKill ? 100 : (isCrit ? 80 : 30)) / 1000;
      this.player.addCameraShake(isKill ? 0.4 : (isCrit ? 0.3 : 0.15));

      const hitPos = mob.position.clone().add(new THREE.Vector3(0, 0.9, 0));
      const pCount = isKill ? 12 : (isCrit ? 8 : 5);
      const mobColor = mob._def?.color ?? 0xff4444;
      const pColor = isCrit ? 0xffff00 : mobColor;
      this.particles.emit(hitPos, { count: pCount, color: hexToColor(pColor), spread: isCrit ? 0.3 : 0.2, life: 0.5, gravity: -5 });

      if (isKill) {
        this.particles.emit(hitPos, { count: 20, color: hexToColor(mobColor), spread: 0.4, life: 0.8, gravity: -6 });
        this._slowmoTimer = 0.2; this._slowmoSpeed = 0.5;
      }

      this.damageNumbers.spawn(finalDmg, isCrit, false, hitPos, this.camera);
      mob.flashTimer = 0.1;
      this.audio?.play?.(isCrit ? 'crit_hit' : 'sword_hit');
      if (isKill) this.audio?.play?.('mob_death');

      this._attackAnimTimer = 0.3;
      this._attackSwingDir = Math.random() > 0.5 ? 1 : -1;

      const drops = mob._def?.drops ?? [];
      if (isKill && drops.length > 0) {
        for (const drop of drops) {
          if (Math.random() < (drop.chance ?? 1)) {
            this.player._spawnDroppedItem(drop.item, mob.position.x, mob.position.y + 0.5, mob.position.z);
          }
        }
      }
    } else {
      this._attackAnimTimer = 0.2;
      this._attackSwingDir = Math.random() > 0.5 ? 1 : -1;
    }
  }

  playerRangedAttack(chargeTime) {
    if (this._rangedCooldown > 0) return;
    const item = this.player.inventory?.getSelectedItem();
    if (!item) return;
    const itemData = getItem(item.id);
    if (!itemData || itemData.type !== 'bow') return;
    if (!this.player.inventory.hasItem(126, 1)) return; // Arrow id=126

    this._rangedCooldown = 1.0;
    this.player.inventory.consumeItem(126, 1);

    const power = Math.max(0.1, Math.min(1, chargeTime));
    const damage = Math.floor((itemData.damage ?? 4) * power);
    const origin = this.player.getEyePosition();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));

    const speed = 0.5 * power;
    const geo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x8B6914 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.lookAt(origin.clone().add(direction));
    this.player.scene.add(mesh);

    this.arrows.push({
      mesh,
      mat,
      velocity: direction.clone().multiplyScalar(speed),
      damage,
      lifetime: 5,
      age: 0,
    });
  }

  /**
   * Update all active arrows each frame (dt-based, no requestAnimationFrame).
   */
  updateArrows(dt) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.age += dt;
      if (arrow.age > arrow.lifetime) {
        this._removeArrow(i);
        continue;
      }

      arrow.velocity.y -= 9.8 * dt; // proper dt-based gravity
      arrow.mesh.position.add(arrow.velocity.clone().multiplyScalar(dt * 60));
      arrow.mesh.lookAt(arrow.mesh.position.clone().add(arrow.velocity));

      let hit = false;

      // Check mob collisions
      for (const mob of this.mobManager.getMobs()) {
        if (mob.dead) continue;
        if (arrow.mesh.position.distanceTo(mob.position.clone().add(new THREE.Vector3(0, 0.9, 0))) < 1) {
          this.mobManager.damageMob(mob, arrow.damage, arrow.velocity.clone().normalize());
          const hitPos = mob.position.clone().add(new THREE.Vector3(0, 0.9, 0));
          this.particles.emit(hitPos, { count: 4, color: '#ff4444', spread: 0.16, life: 0.3, gravity: -5 });
          this.damageNumbers.spawn(arrow.damage, false, false, hitPos, this.camera);
          hit = true;
          break;
        }
      }

      // Check block collision
      if (!hit) {
        const bx = Math.floor(arrow.mesh.position.x);
        const by = Math.floor(arrow.mesh.position.y);
        const bz = Math.floor(arrow.mesh.position.z);
        if ((this.player.world.getBlock?.(bx, by, bz) ?? 0) !== 0) {
          hit = true;
        }
      }

      if (hit) {
        this._removeArrow(i);
      }
    }
  }

  _removeArrow(index) {
    const arrow = this.arrows[index];
    this.player.scene.remove(arrow.mesh);
    arrow.mesh.geometry.dispose();
    arrow.mat.dispose();
    this.arrows.splice(index, 1);
  }

  mobAttackPlayer(mob) {
    if (this.player.dead) return;
    const mobDmg = mob._def?.damage ?? mob.damage ?? 2;
    const mods = this.player._roguelikeModifiers || {};
    const mobDmgMult = (mods.mobDamageMultiplier ?? 1);
    const playerDmgTakenMult = (mods.playerDamageTakenMultiplier ?? 1);
    const effectiveMobDmg = Math.floor(mobDmg * mobDmgMult * playerDmgTakenMult);
    const finalDmg = this.player.takeDamage(effectiveMobDmg);
    this._redVignetteOpacity = 0.6;
    this.player.addCameraShake(0.25);
    const hitPos = this.player.getEyePosition();
    this.particles.emit(hitPos, { count: 4, color: '#ff0000', spread: 0.16, life: 0.3, gravity: -5 });
    this.damageNumbers.spawn(finalDmg ?? mobDmg, false, true, hitPos, this.camera);
    this.audio?.play?.('damage');
  }

  _checkMobAttacks() {
    for (const mob of this.mobManager.getMobs()) {
      if (mob.dead || !mob.wantsAttack) continue;
      mob.wantsAttack = false;
      const atkRange = mob.attackRange ?? 1.5;
      if (mob.position.distanceTo(this.player.position) <= atkRange) {
        const isExplosive = mob._def?.special === 'explosive';
        if (isExplosive) {
          // Creeper explosion: deal AoE damage and remove the mob
          const explosionDmg = mob._def?.damage ?? 8;
          const mods = this.player._roguelikeModifiers || {};
          const playerDmgTakenMult = (mods.playerDamageTakenMultiplier ?? 1);
          const effectiveDmg = Math.floor(explosionDmg * playerDmgTakenMult);
          this.player.takeDamage(effectiveDmg);
          this._redVignetteOpacity = 1.0;
          this.player.addCameraShake(0.6);
          const hitPos = this.player.getEyePosition();
          this.particles.emit(hitPos, { count: 20, color: '#ff6600', spread: 0.5, life: 0.6, gravity: -3 });
          this.particles.emit(hitPos, { count: 15, color: '#ffff00', spread: 0.8, life: 0.4, gravity: -2 });
          this.damageNumbers.spawn(effectiveDmg, false, true, hitPos, this.camera);
          this.audio?.play?.('explosion');
          // Kill the creeper
          this.mobManager.killMob(mob);
          continue;
        }
        this.mobAttackPlayer(mob);
      }
    }
  }

  getGameSpeed() { return this.gameSpeed; }
  isInHitstop() { return this._hitstopTimer > 0; }
  getAttackAnimation() {
    if (this._attackAnimTimer <= 0) return 0;
    return Math.sin((this._attackAnimTimer / 0.3) * Math.PI) * this._attackSwingDir;
  }
  getMeleeCooldownPct() {
    const toolType = this.player.inventory?.getHeldToolData()?.type ?? 'hand';
    const maxCooldown = { sword: 0.6, axe: 0.8, pickaxe: 1.0, shovel: 1.0, hand: 1.0 }[toolType] ?? 1.0;
    return this._meleeCooldown / maxCooldown;
  }
}
