/**
 * MineRogue - First-Person Hand/Arm Renderer
 * Minecraft-style held item rendering with smooth animations.
 */
import * as THREE from 'three';
import { getItem, isTool } from '../data/items.js';

// Skin tone for hand/arm — Minecraft Steve color
const SKIN_COLOR = 0xc8956a;

// Material colors
const MAT_COLORS = {
  wood: 0xa08030, stone: 0x8a8a8a, iron: 0xc8c8c8,
  gold: 0xe8c840, diamond: 0x40e8e8, crystal: 0xa040e0,
  leather: 0x8b4513,
};

// Block colors for held block rendering (Minecraft-accurate)
const BLOCK_COLORS = {
  1: 0x8B6914,   // wood planks
  2: 0x6B8C42,   // grass
  3: 0x8B7355,   // dirt
  4: 0x808080,   // stone
  5: 0x808080,   // cobblestone
  6: 0x8B6914,   // oak log
  7: 0x808080,   // bedrock
  8: 0x4444AA,   // sand
  9: 0x8B0000,   // red sand
  10: 0x8B6914,  // oak planks
  11: 0x228B22,  // leaves
  12: 0xD2B48C,  // sand
  13: 0x808080,  // gravel
  14: 0xFFD700,  // gold ore
  15: 0xC0C0C0,  // iron ore
  16: 0x404040,  // coal ore
  17: 0x4AEDD9,  // diamond ore
  18: 0x444444,  // obsidian
  19: 0xB22222,  // netherrack
  20: 0x4B0082,  // end stone
  21: 0x00CED1,  // ice
  22: 0xF5F5DC,  // snow
  23: 0xDAA520,  // crafting table
  24: 0x8B4513,  // chest
  25: 0x808080,  // furnace
  26: 0xA0522D,  // torch (yellow flame)
  27: 0x696969,  // iron block
  28: 0xFFD700,  // gold block
  29: 0x4AEDD9,  // diamond block
  30: 0xA040E0,  // crystal/emerald block
};

// Material item colors for held items
const MATERIAL_COLORS = {
  200: 0x2a2a2a, // coal
  201: 0xc8c8c8, // iron ingot
  202: 0xe8c840, // gold ingot
  203: 0x40e8e8, // diamond
  204: 0xa040e0, // crystal
  205: 0xcc0000, // redstone
  206: 0x8B6914, // stick
  207: 0xcccccc, // string
  208: 0xf0f0d0, // bone
  209: 0xe8e8e0, // feather
  210: 0x4a4a4a, // flint
  211: 0xb04030, // brick
  212: 0xf0f0e0, // paper
  213: 0x8B4513, // book
  214: 0x8b4513, // leather
  215: 0x4a4a4a, // gunpowder
  216: 0x30c060, // ender pearl
  217: 0x6040a0, // soul shard
  218: 0xf0f0a0, // nether star
  219: 0xd06020, // blaze rod
  220: 0xe0e0f0, // ghast tear
  221: 0xe0c040, // glowstone dust
  270: 0x8B6914, // wood
  271: 0x808080, // stone
  272: 0x2a1a3a, // obsidian
  273: 0xc0a080, // clay
  274: 0x8a7a6a, // iron ore
  275: 0xc0a040, // gold ore
};

export class HandRenderer {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    // Base position (bottom-right of screen, like Minecraft)
    this._baseX = 0.28;
    this._baseY = -0.28;
    this._baseZ = -0.35;

    // Root group attached to camera
    this.group = new THREE.Group();
    this.group.position.set(this._baseX, this._baseY, this._baseZ);
    camera.add(this.group);

    // Build arm
    this._buildArm();

    // Item pivot for swing animation
    this.itemPivot = new THREE.Group();
    this.itemPivot.position.set(0, -0.08, -0.02);
    this.group.add(this.itemPivot);

    // Current item display
    this.itemGroup = new THREE.Group();
    this.itemPivot.add(this.itemGroup);

    // Animation state
    this._swingTimer = 0;
    this._swingDuration = 0;
    this._swingAngle = 0;
    this._isSwinging = false;
    this._swingToolType = null;
    this._bobPhase = 0;
    this._bobAmount = 0;
    this._currentItemId = null;
    this._idleTime = 0;

    // Render on top
    this._setRenderOrder(this.group, 999);
  }

  _buildArm() {
    // Simple Minecraft-style arm — one skin-colored box for forearm+hand
    // Steve's arm is 4px wide × 12px tall × 4px deep (scaled to world units)
    const armGeo = new THREE.BoxGeometry(0.12, 0.40, 0.12);
    const armMat = new THREE.MeshLambertMaterial({ color: SKIN_COLOR, depthTest: false });
    this.arm = new THREE.Mesh(armGeo, armMat);
    // Position: bottom-right of viewport, slightly angled inward
    this.arm.position.set(0.04, 0.06, 0.02);
    // Slight natural hold angle — tilted back and inward like Minecraft
    this.arm.rotation.set(-0.15, 0.3, -0.1);
    this.group.add(this.arm);
    // Keep a reference for compatibility
    this.hand = this.arm;
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
      this._buildShield(material);
    } else if (type === 'food') {
      this._buildFood(itemId);
    } else if (type === 'potion') {
      this._buildPotion(itemId);
    } else if (type === 'material') {
      this._buildMaterial(itemId, color);
    } else if (type === 'helmet' || type === 'chestplate' || type === 'leggings' || type === 'boots') {
      this._buildArmor(type, mat);
    } else if (type === 'ammo') {
      this._buildArrow();
    } else if (type === 'block') {
      this._buildBlock(itemId);
    } else {
      this._buildGeneric(color);
    }
  }

  _buildSword(mat) {
    // Blade — tall, thin
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.4, 0.012);
    const blade = new THREE.Mesh(bladeGeo, mat);
    blade.position.set(0, 0.08, 0);
    this.itemGroup.add(blade);
    // Guard — cross-piece
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
    // String
    const stringGeo = new THREE.BoxGeometry(0.004, 0.34, 0.004);
    const stringMat = new THREE.MeshLambertMaterial({ color: 0xcccccc, depthTest: false });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.set(0, 0.02, 0.01);
    this.itemGroup.add(string);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), mat);
    grip.position.set(0, -0.1, 0);
    this.itemGroup.add(grip);
  }

  _buildShield(material) {
    const shieldColor = MAT_COLORS[material] || 0x6a4a10;
    // Body — wooden shield with metal boss
    const bodyGeo = new THREE.BoxGeometry(0.2, 0.25, 0.03);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x6a4a10, depthTest: false });
    this.itemGroup.add(new THREE.Mesh(bodyGeo, bodyMat));
    // Metal rim/boss
    const bossGeo = new THREE.BoxGeometry(0.06, 0.06, 0.04);
    const bossMat = new THREE.MeshLambertMaterial({ color: shieldColor, depthTest: false });
    const boss = new THREE.Mesh(bossGeo, bossMat);
    boss.position.set(0, 0, 0.015);
    this.itemGroup.add(boss);
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
    // Food items held at a slight angle, like eating
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.12, -0.04);
    mesh.rotation.set(0.3, 0.4, 0);
    this.itemGroup.add(mesh);
  }

  _buildPotion(itemId) {
    // Glass bottle — transparent
    const bottleMat = new THREE.MeshLambertMaterial({
      color: 0xaaaaaa, transparent: true, opacity: 0.4, depthTest: false,
    });
    const bottleGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(0, -0.08, -0.04);
    this.itemGroup.add(bottle);
    // Bottle neck
    const neckGeo = new THREE.BoxGeometry(0.03, 0.04, 0.03);
    const neck = new THREE.Mesh(neckGeo, bottleMat);
    neck.position.set(0, -0.0, -0.04);
    this.itemGroup.add(neck);
    // Liquid inside
    const liquidColor = itemId === 230 ? 0xc03030 : itemId === 231 ? 0x30c030 : 0x3030c0;
    const liquidMat = new THREE.MeshLambertMaterial({ color: liquidColor, depthTest: false });
    const liquid = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), liquidMat);
    liquid.position.set(0, -0.1, -0.04);
    this.itemGroup.add(liquid);
  }

  _buildBlock(itemId) {
    // Render as a Minecraft-style cube held in hand
    const color = BLOCK_COLORS[itemId] || 0x808080;
    const mat = new THREE.MeshLambertMaterial({ color, depthTest: false });
    const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.06, -0.06);
    // Slight rotation so it looks 3D (isometric-like)
    mesh.rotation.set(0.3, 0.6, 0);
    this.itemGroup.add(mesh);
    // Edge highlight for blocky look
    const edgeGeo = new THREE.BoxGeometry(0.185, 0.185, 0.185);
    const edgeMat = new THREE.MeshLambertMaterial({
      color: 0x000000, transparent: true, opacity: 0.12, depthTest: false, wireframe: true,
    });
    const edges = new THREE.Mesh(edgeGeo, edgeMat);
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    this.itemGroup.add(edges);
  }

  _buildMaterial(itemId, color) {
    // Material items — small, distinctive shapes per material type
    const actualColor = MATERIAL_COLORS[itemId] || color;
    const mat = new THREE.MeshLambertMaterial({ color: actualColor, depthTest: false });

    // Ender pearl — sphere
    if (itemId === 216) {
      const geo = new THREE.SphereGeometry(0.04, 8, 6);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.10, -0.04);
      this.itemGroup.add(mesh);
      return;
    }
    // Blaze rod — elongated
    if (itemId === 219) {
      const geo = new THREE.BoxGeometry(0.025, 0.2, 0.025);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.04, -0.04);
      mesh.rotation.set(0, 0, -0.3);
      this.itemGroup.add(mesh);
      return;
    }
    // Ghast tear — small sphere
    if (itemId === 220) {
      const geo = new THREE.SphereGeometry(0.03, 6, 4);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.10, -0.04);
      this.itemGroup.add(mesh);
      return;
    }
    // Stick — thin rod
    if (itemId === 206) {
      const geo = new THREE.BoxGeometry(0.02, 0.22, 0.02);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.04, -0.04);
      mesh.rotation.set(0, 0, -0.3);
      this.itemGroup.add(mesh);
      return;
    }
    // String — thin flat
    if (itemId === 207) {
      const geo = new THREE.BoxGeometry(0.015, 0.15, 0.015);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.06, -0.04);
      this.itemGroup.add(mesh);
      return;
    }
    // Paper/book — flat rectangle
    if (itemId === 212 || itemId === 213) {
      const geo = new THREE.BoxGeometry(0.1, 0.14, 0.015);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.06, -0.04);
      this.itemGroup.add(mesh);
      return;
    }
    // Default material — small cube (ingot/gem shape)
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.10, -0.04);
    this.itemGroup.add(mesh);
  }

  _buildArmor(type, mat) {
    // Show armor as a recognizable shape based on slot
    if (type === 'helmet') {
      const geo = new THREE.BoxGeometry(0.12, 0.1, 0.12);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.08, -0.04);
      this.itemGroup.add(mesh);
      // Visor
      const visorGeo = new THREE.BoxGeometry(0.13, 0.03, 0.02);
      const visorMat = new THREE.MeshLambertMaterial({ color: 0x222222, depthTest: false });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, -0.05, -0.08);
      this.itemGroup.add(visor);
    } else if (type === 'chestplate') {
      const geo = new THREE.BoxGeometry(0.14, 0.16, 0.08);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.06, -0.04);
      this.itemGroup.add(mesh);
    } else if (type === 'leggings') {
      const geo = new THREE.BoxGeometry(0.12, 0.18, 0.07);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.06, -0.04);
      this.itemGroup.add(mesh);
    } else if (type === 'boots') {
      const geo = new THREE.BoxGeometry(0.10, 0.08, 0.14);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -0.10, -0.04);
      this.itemGroup.add(mesh);
    }
  }

  _buildArrow() {
    // Arrow shaft
    const shaftGeo = new THREE.BoxGeometry(0.012, 0.3, 0.012);
    const shaftMat = new THREE.MeshLambertMaterial({ color: 0x8B6914, depthTest: false });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(0, 0.0, -0.04);
    shaft.rotation.set(0, 0, -0.3);
    this.itemGroup.add(shaft);
    // Arrowhead
    const tipGeo = new THREE.BoxGeometry(0.025, 0.04, 0.015);
    const tipMat = new THREE.MeshLambertMaterial({ color: 0x808080, depthTest: false });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(-0.03, 0.14, -0.04);
    tip.rotation.z = -0.3;
    this.itemGroup.add(tip);
    // Fletching
    const fletchGeo = new THREE.BoxGeometry(0.03, 0.04, 0.005);
    const fletchMat = new THREE.MeshLambertMaterial({ color: 0xcc3333, depthTest: false });
    const fletch = new THREE.Mesh(fletchGeo, fletchMat);
    fletch.position.set(0.04, -0.12, -0.04);
    fletch.rotation.z = -0.3;
    this.itemGroup.add(fletch);
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
    this._swingToolType = toolType;
    switch (toolType) {
      case 'sword':
        // Wide horizontal arc — dramatic sweeping slash
        this._swingDuration = 0.22;
        this._swingAngle = Math.PI * 0.6; // 108 degrees — wide arc
        break;
      case 'pickaxe':
        // Overhead swing — mostly rotation.x (forward overhead chop)
        this._swingDuration = 0.3;
        this._swingAngle = Math.PI * 0.5;
        break;
      case 'axe':
        // Diagonal swing — mix of rotation.x and rotation.z
        this._swingDuration = 0.28;
        this._swingAngle = Math.PI * 0.45;
        break;
      case 'shovel':
        this._swingDuration = 0.25;
        this._swingAngle = Math.PI * 0.35;
        break;
      default:
        // Quick jab — fast, short punch
        this._swingDuration = 0.15;
        this._swingAngle = Math.PI * 0.25;
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

      const toolType = this._swingToolType || 'hand';
      // Reset rotations each frame
      this.itemPivot.rotation.set(0, 0, 0);

      if (toolType === 'sword') {
        // Wide horizontal sweep (rotation.y) with slight downward tilt
        this.itemPivot.rotation.y = -angle * 0.7;
        this.itemPivot.rotation.x = -angle * 0.3;
        this.itemPivot.rotation.z = swingProgress * 0.3;
      } else if (toolType === 'pickaxe') {
        // Overhead swing — rotation.x dominant (forward overhead chop)
        this.itemPivot.rotation.x = -angle;
        this.itemPivot.rotation.z = swingProgress * 0.08;
      } else if (toolType === 'axe') {
        // Diagonal swing — both rotation.x and rotation.z
        this.itemPivot.rotation.x = -angle * 0.7;
        this.itemPivot.rotation.z = swingProgress * 0.5;
      } else if (toolType === 'shovel') {
        // Scooping motion
        this.itemPivot.rotation.x = -angle;
        this.itemPivot.rotation.z = swingProgress * 0.15;
      } else {
        // Hand/default: quick jab forward
        this.itemPivot.rotation.x = -angle;
      }

      if (t >= 1) {
        this._isSwinging = false;
        this._swingToolType = null;
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
