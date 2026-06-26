/**
 * MineRogue Minimap - Top-down 128x128 canvas view
 *
 * Uses the pre-existing #minimap and #minimap-canvas elements from index.html.
 */

export class Minimap {
  constructor(world) {
    this.world = world;

    // Use existing canvas from HTML, or create one as fallback
    this.canvas = document.getElementById('minimap-canvas');
    this.container = document.getElementById('minimap');

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 128;
      this.canvas.height = 128;
    }

    this.ctx = this.canvas.getContext('2d');
    this.visible = false;
    this.lastUpdate = 0;
    this.updateInterval = 500; // ms
    this.playerX = 0;
    this.playerZ = 0;
    this.playerYaw = 0;

    // Block color map (IDs from data/blocks.js)
    this.blockColors = {
      0: null,          // Air
      1: '#6b8c42',     // Grass
      2: '#8b6914',     // Dirt
      3: '#808080',     // Stone
      4: '#c2b280',     // Sand
      5: '#777',        // Gravel
      6: '#555555',     // Cobblestone
      7: '#b8945e',     // Oak Planks
      8: '#6b4c2a',     // Oak Log
      9: '#228b22',     // Oak Leaves
      10: '#7b6440',    // Birch Log
      11: '#44aa44',    // Birch Leaves
      12: '#5b4226',    // Spruce Log
      13: '#1e6e1e',    // Spruce Leaves
      14: '#333333',    // Coal Ore
      15: '#aa8866',    // Iron Ore
      20: '#3366aa',    // Water
      21: '#cc4400',    // Lava
      22: '#222222',    // Bedrock
      24: '#995544',    // Bricks
      27: '#2a1a3a',    // Obsidian
      28: '#ddcc44',    // Glowstone
      29: '#aa7733',    // Crafting Table
      30: '#666666',    // Furnace
      31: '#aa8833',    // Chest
      32: '#ffee66',    // Torch
      59: '#8866cc',    // Shrine
      60: '#ff4444',    // Mob Spawner
      61: '#4a2a6a',    // Portal Frame
    };
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  show() {
    this.visible = true;
    if (this.container) {
      this.container.style.display = 'block';
    } else if (!this.canvas.parentNode) {
      document.body.appendChild(this.canvas);
    }
  }

  hide() {
    this.visible = false;
    if (this.container) {
      this.container.style.display = 'none';
    } else if (this.canvas.parentNode) {
      this.canvas.remove();
    }
  }

  update(playerX, playerZ, playerYaw = 0) {
    this.playerX = playerX;
    this.playerZ = playerZ;
    this.playerYaw = playerYaw;

    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = now;

    if (!this.visible) return;
    this._render();
  }

  _render() {
    const ctx = this.ctx;
    const size = this.canvas.width || 128;
    const half = size / 2;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size, size);

    if (!this.world) return;

    const px = Math.floor(this.playerX);
    const pz = Math.floor(this.playerZ);

    for (let dy = -half; dy < half; dy++) {
      for (let dx = -half; dx < half; dx++) {
        const wx = px + dx;
        const wz = pz + dy;

        // Get highest solid block at this x,z
        let blockId = 0;
        if (typeof this.world.getHighestBlock === 'function') {
          blockId = this.world.getHighestBlock(wx, wz);
        } else if (typeof this.world.getBlock === 'function') {
          // Scan downward from y=64
          for (let y = 64; y >= 0; y--) {
            const bid = this.world.getBlock(wx, y, wz);
            if (bid && bid !== 0) { blockId = bid; break; }
          }
        }

        // Handle block objects or numeric IDs
        const id = typeof blockId === 'object' ? blockId?.id : blockId;
        const color = this.blockColors[id] || null;
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(dx + half, dy + half, 1, 1);
        }
      }
    }

    // Draw player arrow
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(this.playerYaw);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-3, 4);
    ctx.lineTo(3, 4);
    ctx.closePath();
    ctx.fill();
    // Red front indicator
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-2, 1);
    ctx.lineTo(2, 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
