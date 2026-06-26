/**
 * MineRogue - First-Person Hand/Arm Renderer
 * Minecraft-style held item rendering with smooth animations.
 */
import * as THREE from 'three';
import { getItem, isTool } from '../data/items.js';

const HAND_COLOR = 0xc8956a;
const SLEEVE_COLOR = 0x4a6a4a;

// Material colors
const MAT_COLORS = {
  wood: 0xa08030, stone: 0x8a8a8a, iron: 0xc8c8c8,
  gold: 0xe8c840, diamond: 0x40e8e8, crystal: 0xa040e0,
  leather: 0x8b4513,
};

export class HandRenderer {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    // Base position (bottom-right of screen, like Minecraft)
    this._baseX = 0.28;
    this._baseY = -0.22;
    this._baseZ = -0.35;

    // Root group attached to camera
    this.group = new THREE.Group();
    this.group.position.set(this._baseX, this._baseY, this._baseZ);
    camera.add(this.group);

    // Build arm
    this._buildArm();

    // Item pivot for swing animation
    this.itemPivot = new THREE.Group();
    this.itemPivot.position.set(0, -0.18, 0);
    this.group.add(this.itemPivot);

    // Current item display
    this.itemGroup = new THREE.Group();
    this.itemPivot.add(this.itemGroup);

    // Animation state
    this._swingTimer = 0;
    this._swingDuration = 0;
    this._swingAngle = 0;
    this._isSwinging = false;
    this._bobPhase = 0;
    this._bobAmount = 0;
    this._currentItemId = null;
    this._idleTime = 0;

    // Render on top
    this._setRenderOrder(this.group, 999);
  }

  _buildArm() {
    // Sleeve (upper arm)
    const sleeveGeo = new THREE.BoxGeometry(0.14, 0.25, 0.14);
    const sleeveMat = new THREE.MeshLambertMaterial({ color: SLEEVE_COLOR, depthTest: false });
    this.sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    this.sleeve.position.set(0, 0.12, 0);
    this.group.add(this.sleeve);

    // Hand
    const handGeo = new THREE.BoxGeometry(0.12, 0.18, 0.12);
    const handMat = new THREE.MeshLambertMaterial({ color: HAND_COLOR, depthTest: false });
    this.hand = new THREE.Mesh(handGeo, handMat);
    this.hand.position.set(0, -0.06, -0.02);
    this.group.add(this.hand);

    // Fingers
    const fingerGeo = new THREE.BoxGeometry(0.025, 0.07, 0.025);
    const fingerMat = new THREE.MeshLambertMaterial({ color: HAND_COLOR, depthTest: false });
    for (let i = 0; i < 4; i++) {
      const finger = new THREE.Mesh(fingerGeo, fingerMat);
      finger.position.set(-0.04 + i * 0.025, -0.17, -0.02);
      this.group.add(finger);
    }
    const thumb = new THREE.Mesh(fingerGeo, fingerMat);
    thumb.position.set(-0.07, -0.12, -0.02);
    thumb.rotation.z = 0.5;
    this.group.add(thumb);
  }

  _setRenderOrder(obj, order) {
    if (obj.isMesh) {
      obj.renderOrder = order;
      if (obj.material) obj.material.depthTest = false;
    }
    for (const child of obj.children) this._setRenderOrder(child, order);
  }

  setItem(itemId) {
    if (itemId === this._currentItemId) return;
    this._currentItemId = itemId;

    // Clear old
    while (this.itemGroup.children.length > 0) {
      const child = this.itemGroup.children[0];
      this.itemGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (itemId == null) return;
    const itemDef = getItem(itemId);
    if (!itemDef) return;

    const type = itemDef.type;
    const material = itemDef.material || 'wood';
    const color = MAT_COLORS[material] || 0xcccccc;
    const mat = new THREE.MeshLambertMaterial({ color, depthTest: false });

    if (type === 'sword' || itemDef.subtype === 'sword') {
      this._buildSword(mat);
    } else if (type === 'pickaxe' || itemDef.subtype === 'pickaxe') {
      this._buildPickaxe(mat);
    } else if (type === 'axe' || itemDef.subtype === 'axe') {
      this._buildAxe(mat);
    } else if (type === 'shovel') {
      this._buildShovel(mat);
    } else if (type === 'bow') {
      this._buildBow();
    } else if (type === 'shield') {
      this._buildShield();
    } else if (type === 'food') {
      this._buildFood(itemId);
    } else if (type === 'potion') {
      this._buildPotion(itemId);
    } else {
      this._buildGeneric(color);
    }
  }

  _buildSword(mat) {
    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.4, 0.012);
    const blade = new THREE.Mesh(bladeGeo, mat);
    blade.position.set(0, 0.08, 0);
    this.itemGroup.add(blade);
    // Guard
    const guardGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
    const guardMat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(0, -0.1, 0);
    this.itemGroup.add(guard);
    // Handle
    const handleGeo = new THREE.BoxGeometry(0.025, 0.1, 0.025);
    const handle = new THREE.Mesh(handleGeo, guardMat);
    handle.position.set(0, -0.17, 0);
    this.itemGroup.add(handle);
  }

  _buildPickaxe(mat) {
    const handleGeo = new THREE.BoxGeometry(0.025, 0.35, 0.025);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    this.itemGroup.add(handle);
    const headGeo = new THREE.BoxGeometry(0.25, 0.05, 0.04);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.set(0, 0.17, 0);
    this.itemGroup.add(head);
  }

  _buildAxe(mat) {
    const handleGeo = new THREE.BoxGeometry(0.025, 0.35, 0.025);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    this.itemGroup.add(handle);
    const headGeo = new THREE.BoxGeometry(0.15, 0.14, 0.035);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.set(0.05, 0.15, 0);
    this.itemGroup.add(head);
  }

  _buildShovel(mat) {
    const handleGeo = new THREE.BoxGeometry(0.025, 0.4, 0.025);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    this.itemGroup.add(handle);
    const scoopGeo = new THREE.BoxGeometry(0.1, 0.08, 0.015);
    const scoop = new THREE.Mesh(scoopGeo, mat);
    scoop.position.set(0, 0.22, 0);
    this.itemGroup.add(scoop);
  }

  _buildBow() {
    const mat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    const limbGeo = new THREE.BoxGeometry(0.025, 0.35, 0.025);
    const l = new THREE.Mesh(limbGeo, mat);
    l.position.set(-0.03, 0.02, 0);
    l.rotation.z = -0.12;
    this.itemGroup.add(l);
    const r = new THREE.Mesh(limbGeo, mat);
    r.position.set(0.03, 0.02, 0);
    r.rotation.z = 0.12;
    this.itemGroup.add(r);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), mat);
    grip.position.set(0, -0.1, 0);
    this.itemGroup.add(grip);
  }

  _buildShield() {
    const bodyGeo = new THREE.BoxGeometry(0.2, 0.25, 0.03);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    this.itemGroup.add(new THREE.Mesh(bodyGeo, bodyMat));
  }

  _buildFood(itemId) {
    const foodColors = {
      150: 0xc03030, 151: 0xc8a040, 152: 0x8a3018, 153: 0xc06040,
      154: 0xe8d8b0, 155: 0xa03030, 156: 0xc8a040, 157: 0xe88020,
      158: 0xc8a040, 159: 0xe8c840, 160: 0xf0d860, 161: 0x8a6a4a,
      162: 0xc8a040, 163: 0xc8a040,
    };
    const color = foodColors[itemId] || 0xc8a040;
    const mat = new THREE.MeshLambertMaterial({ color, depthTest: false });
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.12, -0.04);
    this.itemGroup.add(mesh);
  }

  _buildPotion(itemId) {
    const bottleMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5, depthTest: false });
    const bottleGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(0, -0.08, -0.04);
    this.itemGroup.add(bottle);
    const liquidColor = itemId === 230 ? 0xc03030 : itemId === 231 ? 0x30c030 : 0x3030c0;
    const liquidMat = new THREE.MeshLambertMaterial({ color: liquidColor, depthTest: false });
    const liquid = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), liquidMat);
    liquid.position.set(0, -0.1, -0.04);
    this.itemGroup.add(liquid);
  }

  _buildGeneric(color) {
    const mat = new THREE.MeshLambertMaterial({ color, depthTest: false });
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.1, -0.04);
    this.itemGroup.add(mesh);
  }

  swingAttack(toolType = 'hand') {
    this._isSwinging = true;
    this._swingTimer = 0;
    switch (toolType) {
      case 'sword':
        this._swingDuration = 0.25;
        this._swingAngle = Math.PI * 0.45; // 81 degrees — moderate arc
        break;
      case 'pickaxe': case 'axe':
        this._swingDuration = 0.3;
        this._swingAngle = Math.PI * 0.35;
        break;
      case 'shovel':
        this._swingDuration = 0.25;
        this._swingAngle = Math.PI * 0.3;
        break;
      default:
        this._swingDuration = 0.2;
        this._swingAngle = Math.PI * 0.2;
    }
  }

  update(dt) {
    // Swing animation
    if (this._isSwinging) {
      this._swingTimer += dt;
      const t = Math.min(this._swingTimer / this._swingDuration, 1);
      // Smooth ease-in-out sine curve
      const swingProgress = Math.sin(t * Math.PI);
      const angle = swingProgress * this._swingAngle;

      this.itemPivot.rotation.x = -angle;
      // Sword gets a slight side sweep
      if (this._currentItemId) {
        const itemDef = getItem(this._currentItemId);
        if (itemDef?.type === 'sword') {
          this.itemPivot.rotation.z = swingProgress * 0.2;
        }
      }

      if (t >= 1) {
        this._isSwinging = false;
        this.itemPivot.rotation.set(0, 0, 0);
      }
    }

    // Idle bob (gentle sway)
    if (!this._isSwinging) {
      this._idleTime += dt;
      const bobX = Math.sin(this._idleTime * 1.0) * 0.004;
      const bobY = Math.sin(this._idleTime * 0.7) * 0.003;
      this.group.position.set(
        this._baseX + bobX,
        this._baseY + bobY,
        this._baseZ
      );
    } else {
      // During swing, hold base position
      this.group.position.set(this._baseX, this._baseY, this._baseZ);
    }
  }

  setBob(phase, amount) {
    this._bobPhase = phase;
    this._bobAmount = amount * 0.3;
    // Apply walk bob on top of base position
    if (this._bobAmount > 0.001 && !this._isSwinging) {
      const bobOffset = Math.sin(this._bobPhase) * this._bobAmount;
      this.group.position.y = this._baseY + bobOffset;
    }
  }

  updateBob(phase) {
    this.setBob(phase, 0.03);
  }

  dispose() {
    if (this.group.parent) this.group.parent.remove(this.group);
    this.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}
