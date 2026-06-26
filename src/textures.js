import * as THREE from 'three';

export const TEXTURE_SIZE = 16;
export const ATLAS_SIZE = 256;
export const TILE_COUNT = 16; // tiles per row

// Helper to draw a pixel
function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// Helper to fill a tile area
function fillTile(ctx, tx, ty, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TEXTURE_SIZE, ty * TEXTURE_SIZE, TEXTURE_SIZE, TEXTURE_SIZE);
}

// Helper to draw a rect within a tile
function rect(ctx, tx, ty, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TEXTURE_SIZE + x, ty * TEXTURE_SIZE + y, w, h);
}

// Helper to draw noise/dots
function dots(ctx, tx, ty, count, baseX, baseY, size, colors) {
  for (let i = 0; i < count; i++) {
    const dx = baseX + Math.floor(Math.random() * size);
    const dy = baseY + Math.floor(Math.random() * size);
    const c = colors[Math.floor(Math.random() * colors.length)];
    px(ctx, tx * TEXTURE_SIZE + dx, ty * TEXTURE_SIZE + dy, c);
  }
}

// Draw ore spots pattern
function oreSpots(ctx, tx, ty, baseColor, oreColor) {
  fillTile(ctx, tx, ty, baseColor);
  // Add 3-5 ore clusters
  const clusters = 3 + Math.floor(Math.random() * 3);
  for (let c = 0; c < clusters; c++) {
    const cx = 2 + Math.floor(Math.random() * 12);
    const cy = 2 + Math.floor(Math.random() * 12);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (Math.random() > 0.4) {
          const px2 = cx + dx;
          const py2 = cy + dy;
          if (px2 >= 0 && px2 < 16 && py2 >= 0 && py2 < 16) {
            px(ctx, tx * TEXTURE_SIZE + px2, ty * TEXTURE_SIZE + py2, oreColor);
          }
        }
      }
    }
  }
}

// Draw brick/stone pattern
function drawBricks(ctx, tx, ty, mortarColor, brickColor) {
  fillTile(ctx, tx, ty, mortarColor);
  // Row 0: full brick
  rect(ctx, tx, ty, 0, 0, 16, 7, brickColor);
  rect(ctx, tx, ty, 0, 7, 16, 1, mortarColor);
  // Row 1: offset bricks
  rect(ctx, tx, ty, 0, 8, 7, 7, brickColor);
  rect(ctx, tx, ty, 8, 8, 8, 7, brickColor);
  rect(ctx, tx, ty, 7, 8, 1, 7, mortarColor);
  // Cracks
  rect(ctx, tx, ty, 0, 0, 1, 1, mortarColor);
  rect(ctx, tx, ty, 15, 0, 1, 1, mortarColor);
}

function drawTexture(ctx, tx, ty, id) {
  const sx = tx * TEXTURE_SIZE;
  const sy = ty * TEXTURE_SIZE;

  switch (id) {
    case 0: // air - transparent
      break;

    case 1: // grass_top
      fillTile(ctx, tx, ty, '#4a8c2a');
      dots(ctx, tx, ty, 20, 0, 0, 16, ['#3d7a22', '#5a9e3a', '#6ab048']);
      break;

    case 2: // grass_side
      rect(ctx, tx, ty, 0, 0, 16, 4, '#4a8c2a');
      rect(ctx, tx, ty, 0, 4, 16, 12, '#8b6914');
      dots(ctx, tx, ty, 6, 0, 0, 4, ['#3d7a22', '#6ab048']);
      dots(ctx, tx, ty, 10, 0, 4, 12, ['#7a5c10', '#9c7a1e']);
      // Hanging grass
      px(ctx, sx + 3, sy + 4, '#4a8c2a');
      px(ctx, sx + 10, sy + 4, '#4a8c2a');
      px(ctx, sx + 14, sy + 5, '#4a8c2a');
      break;

    case 3: // dirt
      fillTile(ctx, tx, ty, '#8b6914');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#7a5c10', '#9c7a1e', '#6b5010']);
      break;

    case 4: // stone
      fillTile(ctx, tx, ty, '#8a8a8a');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#787878', '#9a9a9a', '#6a6a6a']);
      // Cracks
      px(ctx, sx + 4, sy + 3, '#6a6a6a');
      px(ctx, sx + 5, sy + 4, '#6a6a6a');
      px(ctx, sx + 10, sy + 8, '#6a6a6a');
      px(ctx, sx + 11, sy + 9, '#6a6a6a');
      break;

    case 5: // sand
      fillTile(ctx, tx, ty, '#d4c088');
      dots(ctx, tx, ty, 20, 0, 0, 16, ['#c8b47a', '#e0cc96', '#bfab72']);
      break;

    case 6: // gravel
      fillTile(ctx, tx, ty, '#7a7a7a');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#6a6a6a', '#8a8a8a', '#5a5a5a', '#9a9a9a']);
      break;

    case 7: // cobblestone
      drawBricks(ctx, tx, ty, '#5a5a5a', '#8a8a8a');
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#7a7a7a', '#9a9a9a']);
      break;

    case 8: // oak_planks
      fillTile(ctx, tx, ty, '#b8943c');
      for (let y = 0; y < 16; y += 4) {
        rect(ctx, tx, ty, 0, y, 16, 1, '#a08030');
      }
      dots(ctx, tx, ty, 8, 0, 0, 16, ['#c8a44c', '#a88430']);
      break;

    case 9: // oak_log_top (rings)
      fillTile(ctx, tx, ty, '#8a6a20');
      // Concentric rings
      for (let r = 7; r > 0; r -= 2) {
        ctx.strokeStyle = '#6a4a10';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx + 8, sy + 8, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      rect(ctx, tx, ty, 7, 7, 2, 2, '#a07a20');
      // Bark edges
      rect(ctx, tx, ty, 0, 0, 16, 1, '#6a4a10');
      rect(ctx, tx, ty, 0, 15, 16, 1, '#6a4a10');
      rect(ctx, tx, ty, 0, 0, 1, 16, '#6a4a10');
      rect(ctx, tx, ty, 15, 0, 1, 16, '#6a4a10');
      break;

    case 10: // oak_log_side (bark)
      fillTile(ctx, tx, ty, '#6a4a10');
      // Vertical bark lines
      for (let x = 1; x < 16; x += 3) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.3) {
            px(ctx, sx + x, sy + y, '#5a3a08');
          }
        }
      }
      dots(ctx, tx, ty, 15, 0, 0, 16, ['#7a5a18', '#5a3a08']);
      break;

    case 11: // birch_log
      fillTile(ctx, tx, ty, '#e8e0d0');
      // Dark marks
      for (let y = 0; y < 16; y += 3) {
        rect(ctx, tx, ty, 2, y, 4, 1, '#3a3020');
        rect(ctx, tx, ty, 10, y + 1, 3, 1, '#3a3020');
      }
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#d8d0c0', '#f0e8e0']);
      break;

    case 12: // spruce_log
      fillTile(ctx, tx, ty, '#3a2810');
      for (let x = 1; x < 16; x += 3) {
        for (let y = 0; y < 16; y++) {
          if (Math.random() > 0.4) {
            px(ctx, sx + x, sy + y, '#2a1808');
          }
        }
      }
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#4a3818', '#2a1808']);
      break;

    case 13: // oak_leaves
      fillTile(ctx, tx, ty, '#2d6b1e');
      dots(ctx, tx, ty, 40, 0, 0, 16, ['#1e5a12', '#3d8b2e', '#4a9e38']);
      // Gaps (transparent look)
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#1a4a10']);
      break;

    case 14: // birch_leaves
      fillTile(ctx, tx, ty, '#5aaa3a');
      dots(ctx, tx, ty, 35, 0, 0, 16, ['#4a9a2a', '#6aba4a', '#7acc58']);
      break;

    case 15: // spruce_leaves
      fillTile(ctx, tx, ty, '#1a4a0a');
      dots(ctx, tx, ty, 35, 0, 0, 16, ['#0e3a04', '#2a5a14', '#1a4a08']);
      break;

    case 16: // coal_ore
      oreSpots(ctx, tx, ty, '#8a8a8a', '#2a2a2a');
      break;

    case 17: // iron_ore
      oreSpots(ctx, tx, ty, '#8a8a8a', '#c8a882');
      break;

    case 18: // gold_ore
      oreSpots(ctx, tx, ty, '#8a8a8a', '#e8c840');
      break;

    case 19: // diamond_ore
      oreSpots(ctx, tx, ty, '#8a8a8a', '#40e8e8');
      break;

    case 20: // redstone_ore
      oreSpots(ctx, tx, ty, '#8a8a8a', '#e82020');
      break;

    case 21: // crystal_ore
      oreSpots(ctx, tx, ty, '#8a8a8a', '#a040e8');
      // Glow effect
      dots(ctx, tx, ty, 8, 0, 0, 16, ['#c060ff', '#8020c0']);
      break;

    case 22: // water
      fillTile(ctx, tx, ty, '#2060c0');
      for (let y = 0; y < 16; y += 4) {
        for (let x = 0; x < 16; x++) {
          const wave = Math.sin((x + y) * 0.5) * 0.5 > 0;
          if (wave) px(ctx, sx + x, sy + y, '#3080e0');
        }
      }
      dots(ctx, tx, ty, 8, 0, 0, 16, ['#4090f0', '#1050a0']);
      break;

    case 23: // lava
      fillTile(ctx, tx, ty, '#e04000');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#ff6020', '#c03000', '#ff8040', '#e85010']);
      // Bright spots
      dots(ctx, tx, ty, 5, 0, 0, 16, ['#ffa060']);
      break;

    case 24: // bedrock
      fillTile(ctx, tx, ty, '#3a3a3a');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#2a2a2a', '#4a4a4a', '#1a1a1a']);
      break;

    case 25: // glass
      fillTile(ctx, tx, ty, '#c0e0ff');
      // Border
      rect(ctx, tx, ty, 0, 0, 16, 1, '#80a0c0');
      rect(ctx, tx, ty, 0, 15, 16, 1, '#80a0c0');
      rect(ctx, tx, ty, 0, 0, 1, 16, '#80a0c0');
      rect(ctx, tx, ty, 15, 0, 1, 16, '#80a0c0');
      // Cross highlight
      px(ctx, sx + 2, sy + 2, '#ffffff');
      px(ctx, sx + 3, sy + 3, '#ffffff');
      px(ctx, sx + 1, sy + 3, '#e0f0ff');
      break;

    case 26: // bricks
      drawBricks(ctx, tx, ty, '#8a7a6a', '#b04030');
      dots(ctx, tx, ty, 5, 0, 0, 16, ['#c05040', '#a03020']);
      break;

    case 27: // snow
      fillTile(ctx, tx, ty, '#f0f0f0');
      dots(ctx, tx, ty, 15, 0, 0, 16, ['#e8e8e8', '#ffffff', '#dcdcdc']);
      break;

    case 28: // ice
      fillTile(ctx, tx, ty, '#a0d8f0');
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#90c8e0', '#b0e8ff', '#80b8d0']);
      // Cracks
      px(ctx, sx + 5, sy + 5, '#70a8c0');
      px(ctx, sx + 6, sy + 6, '#70a8c0');
      px(ctx, sx + 7, sy + 7, '#70a8c0');
      break;

    case 29: // obsidian
      fillTile(ctx, tx, ty, '#1a0a2a');
      dots(ctx, tx, ty, 20, 0, 0, 16, ['#2a1a3a', '#0e0418', '#3a2a4a']);
      // Purple sheen
      dots(ctx, tx, ty, 5, 0, 0, 16, ['#4a2060']);
      break;

    case 30: // glowstone
      fillTile(ctx, tx, ty, '#e8c860');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#f0d870', '#d8b850', '#ffe080']);
      // Bright center
      rect(ctx, tx, ty, 5, 5, 6, 6, '#f8e080');
      break;

    case 31: // crafting_table_top
      fillTile(ctx, tx, ty, '#b8943c');
      // Grid pattern
      rect(ctx, tx, ty, 0, 0, 8, 8, '#a08030');
      rect(ctx, tx, ty, 8, 8, 8, 8, '#a08030');
      // Saw marks
      for (let i = 0; i < 16; i += 2) {
        px(ctx, sx + i, sy + 7, '#907028');
        px(ctx, sx + 7, sy + i, '#907028');
      }
      break;

    case 32: // crafting_table_side
      fillTile(ctx, tx, ty, '#b8943c');
      // Tools on side
      rect(ctx, tx, ty, 3, 2, 2, 12, '#808080');
      rect(ctx, tx, ty, 11, 2, 2, 12, '#808080');
      rect(ctx, tx, ty, 2, 2, 4, 2, '#a08030');
      rect(ctx, tx, ty, 10, 2, 4, 2, '#a08030');
      break;

    case 33: // furnace_front
      fillTile(ctx, tx, ty, '#8a8a8a');
      // Opening
      rect(ctx, tx, ty, 4, 5, 8, 8, '#1a1a1a');
      // Grill lines
      for (let y = 7; y < 12; y += 2) {
        rect(ctx, tx, ty, 5, y, 6, 1, '#5a5a5a');
      }
      // Border
      rect(ctx, tx, ty, 3, 4, 10, 1, '#6a6a6a');
      rect(ctx, tx, ty, 3, 13, 10, 1, '#6a6a6a');
      break;

    case 34: // furnace_side
      fillTile(ctx, tx, ty, '#8a8a8a');
      dots(ctx, tx, ty, 15, 0, 0, 16, ['#7a7a7a', '#9a9a9a']);
      break;

    case 35: // chest
      fillTile(ctx, tx, ty, '#b8943c');
      // Planks
      for (let y = 0; y < 16; y += 4) {
        rect(ctx, tx, ty, 0, y, 16, 1, '#a08030');
      }
      // Lock
      rect(ctx, tx, ty, 7, 6, 2, 4, '#c8a840');
      px(ctx, sx + 7, sy + 6, '#e8c860');
      break;

    case 36: // torch
      fillTile(ctx, tx, ty, '#b8943c'); // background transparent in usage
      // Stick
      rect(ctx, tx, ty, 7, 5, 2, 11, '#8a6a20');
      // Flame
      px(ctx, sx + 7, sy + 4, '#ffa020');
      px(ctx, sx + 8, sy + 4, '#ffa020');
      px(ctx, sx + 7, sy + 3, '#ff8000');
      px(ctx, sx + 8, sy + 3, '#ffc040');
      px(ctx, sx + 7, sy + 2, '#ffe080');
      break;

    case 37: // bookshelf
      fillTile(ctx, tx, ty, '#8a6a20');
      // Shelves
      rect(ctx, tx, ty, 0, 0, 16, 1, '#6a4a10');
      rect(ctx, tx, ty, 0, 7, 16, 1, '#6a4a10');
      rect(ctx, tx, ty, 0, 15, 16, 1, '#6a4a10');
      // Books top row
      rect(ctx, tx, ty, 1, 1, 3, 6, '#c03030');
      rect(ctx, tx, ty, 4, 1, 3, 6, '#3030c0');
      rect(ctx, tx, ty, 7, 2, 2, 5, '#30c030');
      rect(ctx, tx, ty, 9, 1, 3, 6, '#c0c030');
      rect(ctx, tx, ty, 12, 1, 3, 6, '#c030c0');
      // Books bottom row
      rect(ctx, tx, ty, 1, 8, 4, 7, '#30c0c0');
      rect(ctx, tx, ty, 5, 8, 3, 7, '#c08030');
      rect(ctx, tx, ty, 8, 9, 2, 6, '#808080');
      rect(ctx, tx, ty, 10, 8, 3, 7, '#6030c0');
      rect(ctx, tx, ty, 13, 8, 2, 7, '#c06030');
      break;

    case 38: // sandstone
      fillTile(ctx, tx, ty, '#d4c088');
      rect(ctx, tx, ty, 0, 0, 16, 3, '#c8b47a');
      rect(ctx, tx, ty, 0, 5, 16, 1, '#bfab72');
      rect(ctx, tx, ty, 0, 10, 16, 1, '#bfab72');
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#e0cc96', '#c0ac70']);
      break;

    case 39: // clay
      fillTile(ctx, tx, ty, '#9a9aaa');
      dots(ctx, tx, ty, 20, 0, 0, 16, ['#8a8a9a', '#aaaaba', '#8888a0']);
      break;

    case 40: // white wool
      fillTile(ctx, tx, ty, '#e8e8e8');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#dddddd', '#f0f0f0', '#d8d8d8']);
      break;

    case 41: // orange wool
      fillTile(ctx, tx, ty, '#e88020');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#d87018', '#f09030', '#c86010']);
      break;

    case 42: // magenta wool
      fillTile(ctx, tx, ty, '#c040c0');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#b030b0', '#d050d0', '#a020a0']);
      break;

    case 43: // light_blue wool
      fillTile(ctx, tx, ty, '#60a0e8');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#5090d8', '#70b0f0', '#4080c8']);
      break;

    case 44: // yellow wool
      fillTile(ctx, tx, ty, '#e8e820');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#d8d818', '#f0f030', '#c8c810']);
      break;

    case 45: // pink wool
      fillTile(ctx, tx, ty, '#e880a0');
      dots(ctx, tx, ty, 25, 0, 0, 16, ['#d87090', '#f090b0', '#c86080']);
      break;

    case 46: // cactus
      fillTile(ctx, tx, ty, '#2a7a1a');
      // Vertical lines
      for (let x = 2; x < 14; x += 3) {
        for (let y = 0; y < 16; y++) {
          px(ctx, sx + x, sy + y, '#1a6a0a');
        }
      }
      // Spines
      dots(ctx, tx, ty, 8, 0, 0, 16, ['#4a9a3a']);
      break;

    case 47: // pumpkin
      fillTile(ctx, tx, ty, '#d08020');
      // Segments
      rect(ctx, tx, ty, 3, 0, 4, 16, '#c07018');
      rect(ctx, tx, ty, 9, 0, 4, 16, '#c07018');
      // Stem
      rect(ctx, tx, ty, 7, 0, 2, 2, '#4a8020');
      break;

    case 48: // carved_pumpkin
      fillTile(ctx, tx, ty, '#d08020');
      // Face
      // Eyes
      rect(ctx, tx, ty, 3, 5, 3, 2, '#1a1a00');
      rect(ctx, tx, ty, 10, 5, 3, 2, '#1a1a00');
      // Mouth
      rect(ctx, tx, ty, 4, 10, 2, 2, '#1a1a00');
      rect(ctx, tx, ty, 7, 11, 2, 2, '#1a1a00');
      rect(ctx, tx, ty, 10, 10, 2, 2, '#1a1a00');
      // Stem
      rect(ctx, tx, ty, 7, 0, 2, 2, '#4a8020');
      break;

    case 49: // brown_mushroom
      fillTile(ctx, tx, ty, '#a08060');
      // Cap
      rect(ctx, tx, ty, 3, 2, 10, 6, '#8a6a4a');
      // Dots
      dots(ctx, tx, ty, 5, 3, 2, 10, ['#c0a080']);
      // Stem
      rect(ctx, tx, ty, 6, 8, 4, 6, '#d8c8a0');
      break;

    case 50: // red_mushroom
      fillTile(ctx, tx, ty, '#c03030');
      // Cap
      rect(ctx, tx, ty, 3, 2, 10, 6, '#b02020');
      // White dots
      px(ctx, sx + 5, sy + 3, '#ffffff');
      px(ctx, sx + 8, sy + 4, '#ffffff');
      px(ctx, sx + 11, sy + 3, '#ffffff');
      px(ctx, sx + 6, sy + 6, '#ffffff');
      px(ctx, sx + 10, sy + 6, '#ffffff');
      // Stem
      rect(ctx, tx, ty, 6, 8, 4, 6, '#e8e0d0');
      break;

    case 51: // mycelium
      fillTile(ctx, tx, ty, '#6a5a7a');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#7a6a8a', '#5a4a6a', '#8a7a9a']);
      break;

    case 52: // netherrack
      fillTile(ctx, tx, ty, '#6a2020');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#5a1818', '#7a2828', '#4a1010', '#8a3030']);
      break;

    case 53: // tnt
      fillTile(ctx, tx, ty, '#c03030');
      // White stripes
      rect(ctx, tx, ty, 0, 6, 16, 4, '#e0e0e0');
      // Letters T N T
      rect(ctx, tx, ty, 3, 7, 2, 2, '#c03030');
      rect(ctx, tx, ty, 7, 7, 2, 2, '#c03030');
      rect(ctx, tx, ty, 11, 7, 2, 2, '#c03030');
      break;

    case 54: // hay
      fillTile(ctx, tx, ty, '#c8a040');
      // Horizontal banding
      for (let y = 0; y < 16; y += 3) {
        rect(ctx, tx, ty, 0, y, 16, 1, '#b89030');
      }
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#d8b050', '#b89030']);
      break;

    case 55: // anvil
      fillTile(ctx, tx, ty, '#4a4a4a');
      // Top
      rect(ctx, tx, ty, 2, 2, 12, 3, '#3a3a3a');
      // Middle
      rect(ctx, tx, ty, 4, 5, 8, 4, '#3a3a3a');
      // Base
      rect(ctx, tx, ty, 2, 9, 12, 3, '#3a3a3a');
      // Shine
      px(ctx, sx + 3, sy + 3, '#6a6a6a');
      px(ctx, sx + 4, sy + 3, '#6a6a6a');
      break;

    case 56: // enchanting_table
      fillTile(ctx, tx, ty, '#2a2a4a');
      // Book
      rect(ctx, tx, ty, 4, 4, 8, 8, '#4a2a1a');
      // Glow
      dots(ctx, tx, ty, 8, 4, 4, 8, ['#8040e0', '#6020c0']);
      // Base decoration
      rect(ctx, tx, ty, 0, 14, 16, 2, '#3a3a5a');
      break;

    case 57: // oak_door
      fillTile(ctx, tx, ty, '#b8943c');
      // Planks
      for (let x = 0; x < 16; x += 4) {
        rect(ctx, tx, ty, x, 0, 1, 16, '#a08030');
      }
      // Handle
      rect(ctx, tx, ty, 11, 8, 2, 2, '#6a6a6a');
      break;

    case 58: // ladder
      fillTile(ctx, tx, ty, '#b8943c');
      // Rails
      rect(ctx, tx, ty, 3, 0, 1, 16, '#8a6a20');
      rect(ctx, tx, ty, 12, 0, 1, 16, '#8a6a20');
      // Rungs
      for (let y = 2; y < 16; y += 4) {
        rect(ctx, tx, ty, 3, y, 10, 1, '#8a6a20');
      }
      break;

    case 59: // fence
      fillTile(ctx, tx, ty, '#8a6a20');
      // Posts
      rect(ctx, tx, ty, 3, 0, 2, 16, '#7a5a18');
      rect(ctx, tx, ty, 11, 0, 2, 16, '#7a5a18');
      // Rails
      rect(ctx, tx, ty, 0, 3, 16, 2, '#7a5a18');
      rect(ctx, tx, ty, 0, 11, 16, 2, '#7a5a18');
      break;

    case 60: // tall_grass
      fillTile(ctx, tx, ty, '#4a8c2a');
      // Grass blades
      for (let x = 1; x < 16; x += 2) {
        const h = 6 + Math.floor(Math.random() * 10);
        for (let y = 16 - h; y < 16; y++) {
          px(ctx, sx + x, sy + y, '#3d7a22');
        }
      }
      dots(ctx, tx, ty, 5, 0, 0, 16, ['#5a9e3a']);
      break;

    case 61: // dandelion
      fillTile(ctx, tx, ty, '#4a8c2a');
      // Stem
      rect(ctx, tx, ty, 7, 6, 2, 10, '#3a7020');
      // Flower
      rect(ctx, tx, ty, 6, 3, 4, 4, '#e8e840');
      px(ctx, sx + 7, sy + 4, '#f0f060');
      px(ctx, sx + 8, sy + 4, '#f0f060');
      // Leaves
      px(ctx, sx + 5, sy + 12, '#3a7020');
      px(ctx, sx + 4, sy + 11, '#3a7020');
      px(ctx, sx + 10, sy + 13, '#3a7020');
      px(ctx, sx + 11, sy + 12, '#3a7020');
      break;

    case 62: // poppy
      fillTile(ctx, tx, ty, '#4a8c2a');
      // Stem
      rect(ctx, tx, ty, 7, 6, 2, 10, '#3a7020');
      // Flower
      rect(ctx, tx, ty, 6, 2, 4, 4, '#c02020');
      px(ctx, sx + 7, sy + 3, '#e04040');
      px(ctx, sx + 8, sy + 3, '#1a1a1a');
      // Leaves
      px(ctx, sx + 5, sy + 12, '#3a7020');
      px(ctx, sx + 10, sy + 13, '#3a7020');
      break;

    case 63: // shrine
      fillTile(ctx, tx, ty, '#3a1a5a');
      // Pillars
      rect(ctx, tx, ty, 2, 2, 3, 12, '#5a3a7a');
      rect(ctx, tx, ty, 11, 2, 3, 12, '#5a3a7a');
      // Glow
      rect(ctx, tx, ty, 5, 4, 6, 8, '#6a40a0');
      dots(ctx, tx, ty, 10, 5, 4, 6, ['#a060e0', '#8040c0', '#c080ff']);
      // Top
      rect(ctx, tx, ty, 0, 0, 16, 2, '#5a3a7a');
      break;

    case 64: // spawner
      fillTile(ctx, tx, ty, '#3a3a4a');
      // Cage bars
      for (let x = 2; x < 14; x += 3) {
        rect(ctx, tx, ty, x, 0, 1, 16, '#5a5a6a');
      }
      // Glow inside
      dots(ctx, tx, ty, 8, 2, 2, 12, ['#40a040', '#208020']);
      break;

    case 65: // portal_frame
      fillTile(ctx, tx, ty, '#3a3a3a');
      // Eye slot
      rect(ctx, tx, ty, 4, 4, 8, 8, '#1a1a1a');
      // Decorative border
      rect(ctx, tx, ty, 3, 3, 10, 1, '#5a5a5a');
      rect(ctx, tx, ty, 3, 12, 10, 1, '#5a5a5a');
      rect(ctx, tx, ty, 3, 3, 1, 10, '#5a5a5a');
      rect(ctx, tx, ty, 12, 3, 1, 10, '#5a5a5a');
      break;

    case 66: // bed
      fillTile(ctx, tx, ty, '#c03030');
      // Blanket
      rect(ctx, tx, ty, 0, 4, 16, 12, '#c03030');
      // Pillow
      rect(ctx, tx, ty, 1, 2, 5, 4, '#e8e0d0');
      // Sheet
      rect(ctx, tx, ty, 0, 8, 16, 1, '#e0d0c0');
      break;

    case 67: // brewing_stand
      fillTile(ctx, tx, ty, '#3a3a3a');
      // Base
      rect(ctx, tx, ty, 3, 12, 10, 3, '#5a5a5a');
      // Rod
      rect(ctx, tx, ty, 7, 2, 2, 10, '#6a6a6a');
      // Bulb
      rect(ctx, tx, ty, 6, 1, 4, 3, '#40a0e0');
      // Bottles
      rect(ctx, tx, ty, 3, 10, 3, 4, '#40a040');
      rect(ctx, tx, ty, 10, 10, 3, 4, '#40a040');
      break;

    case 68: // carpet
      fillTile(ctx, tx, ty, '#c03030');
      // Border pattern
      rect(ctx, tx, ty, 0, 0, 16, 1, '#a02020');
      rect(ctx, tx, ty, 0, 15, 16, 1, '#a02020');
      rect(ctx, tx, ty, 0, 0, 1, 16, '#a02020');
      rect(ctx, tx, ty, 15, 0, 1, 16, '#a02020');
      break;

    case 69: // iron_bars
      fillTile(ctx, tx, ty, '#6a6a6a');
      // Vertical bars
      for (let x = 2; x < 16; x += 4) {
        rect(ctx, tx, ty, x, 0, 1, 16, '#8a8a8a');
      }
      // Cross bar
      rect(ctx, tx, ty, 0, 7, 16, 2, '#7a7a7a');
      break;

    case 70: // crystal_block
      fillTile(ctx, tx, ty, '#6020a0');
      // Facets
      rect(ctx, tx, ty, 0, 0, 8, 8, '#7030b0');
      rect(ctx, tx, ty, 8, 8, 8, 8, '#7030b0');
      // Shine
      px(ctx, sx + 2, sy + 2, '#a060e0');
      px(ctx, sx + 3, sy + 3, '#a060e0');
      px(ctx, sx + 12, sy + 12, '#9050d0');
      dots(ctx, tx, ty, 10, 0, 0, 16, ['#8040c0', '#502090']);
      break;

    case 71: // void_stone
      fillTile(ctx, tx, ty, '#1a1a2a');
      dots(ctx, tx, ty, 30, 0, 0, 16, ['#0e0e18', '#2a2a3a', '#06060e']);
      // Void spots
      dots(ctx, tx, ty, 5, 0, 0, 16, ['#000000']);
      break;
  }
}

// Face-specific UV mapping for blocks with different textures per face
const FACE_MAPS = {
  // blockId: { top: tileIndex, side: tileIndex, bottom: tileIndex }
  2:  { top: 1, side: 2, bottom: 3 },   // grass: top=grass_top, side=grass_side, bottom=dirt
  9:  { top: 9, side: 10, bottom: 9 },  // oak_log: top=rings, side=bark, bottom=rings
  11: { top: 9, side: 11, bottom: 9 },  // birch_log: same top/bottom, different side
  12: { top: 9, side: 12, bottom: 9 },  // spruce_log
  31: { top: 31, side: 32, bottom: 8 },  // crafting_table: top=grid, side=tools, bottom=planks
  33: { top: 34, side: 33, bottom: 34 }, // furnace: top/side=stone, front=furnace_front
};

/**
 * Get UV coordinates for a block's faces
 * @param {number} blockId
 * @returns {{ top: [u1,v1,u2,v2], side: [u1,v1,u2,v2], bottom: [u1,v1,u2,v2] }}
 */
export function getBlockUVs(blockId) {
  const faces = FACE_MAPS[blockId] || { top: blockId, side: blockId, bottom: blockId };

  function tileToUV(tileId) {
    const col = tileId % TILE_COUNT;
    const row = Math.floor(tileId / TILE_COUNT);
    const u1 = col * TEXTURE_SIZE / ATLAS_SIZE;
    const v1 = row * TEXTURE_SIZE / ATLAS_SIZE;
    const u2 = (col + 1) * TEXTURE_SIZE / ATLAS_SIZE;
    const v2 = (row + 1) * TEXTURE_SIZE / ATLAS_SIZE;
    return [u1, v1, u2, v2];
  }

  return {
    top: tileToUV(faces.top),
    side: tileToUV(faces.side),
    bottom: tileToUV(faces.bottom)
  };
}

/**
 * Create the block texture atlas (256x256 canvas with 16x16 tiles)
 * @returns {THREE.CanvasTexture}
 */
export function createTextureAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_SIZE;
  canvas.height = ATLAS_SIZE;
  const ctx = canvas.getContext('2d');

  // Clear to transparent
  ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);

  // Draw each texture tile
  for (let id = 0; id <= 71; id++) {
    const tx = id % TILE_COUNT;
    const ty = Math.floor(id / TILE_COUNT);
    drawTexture(ctx, tx, ty, id);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

/**
 * Create the item texture atlas (256x256 canvas with 16x16 item icons)
 * @returns {THREE.CanvasTexture}
 */
export function createItemTextureAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_SIZE;
  canvas.height = ATLAS_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);

  // Item layout (16x16 per item):
  // Row 0: 0=sword_wood, 1=sword_stone, 2=sword_iron, 3=sword_gold, 4=sword_diamond
  //        5=pickaxe_wood, 6=pickaxe_stone, 7=pickaxe_iron, 8=pickaxe_gold, 9=pickaxe_diamond
  //        10=axe_wood, 11=axe_stone, 12=axe_iron, 13=axe_gold, 14=axe_diamond, 15=shovel_wood
  // Row 1: 16=shovel_stone, 17=shovel_iron, 18=shovel_gold, 19=shovel_diamond
  //        20=bow, 21=arrow, 22=shield, 23=fishing_rod
  //        24=helmet_iron, 25=chestplate_iron, 26=leggings_iron, 27=boots_iron
  //        28=helmet_diamond, 29=chestplate_diamond, 30=leggings_diamond, 31=boots_diamond
  // Row 2: 32=apple, 33=bread, 34=cooked_beef, 35=cooked_pork, 36=golden_apple
  //        37=fish, 38=cooked_fish, 39=mushroom_stew, 40=cookie, 41=melon_slice
  //        42=steak, 43=chicken, 44=mutton, 45=potion_health, 46=potion_mana, 47=potion_speed
  // Row 3: 48=stick, 49=coal, 50=iron_ingot, 51=gold_ingot, 52=diamond
  //        53=emerald, 54=redstone, 55=lapis, 56=crystal_shard, 57=string
  //        58=feather, 59=flint, 60=leather, 61=bone, 62=gunpowder, 63=ender_pearl

  function drawItem(x, y, drawFn) {
    ctx.save();
    ctx.translate(x * 16, y * 16);
    drawFn(ctx);
    ctx.restore();
  }

  // Helper for sword shape
  function swordShape(ctx, bladeColor, handleColor) {
    // Blade
    ctx.fillStyle = bladeColor;
    ctx.fillRect(7, 0, 2, 10);
    // Guard
    ctx.fillStyle = handleColor;
    ctx.fillRect(5, 10, 6, 1);
    // Handle
    ctx.fillStyle = '#6a4a10';
    ctx.fillRect(7, 11, 2, 4);
    // Tip
    ctx.fillStyle = bladeColor;
    ctx.fillRect(7, 0, 1, 1);
  }

  // Helper for pickaxe shape
  function pickaxeShape(ctx, headColor) {
    // Head
    ctx.fillStyle = headColor;
    ctx.fillRect(2, 3, 10, 2);
    ctx.fillRect(2, 3, 2, 4);
    ctx.fillRect(10, 3, 2, 4);
    // Handle
    ctx.fillStyle = '#6a4a10';
    ctx.fillRect(6, 5, 2, 10);
  }

  // Helper for axe shape
  function axeShape(ctx, headColor) {
    // Head
    ctx.fillStyle = headColor;
    ctx.fillRect(4, 1, 6, 3);
    ctx.fillRect(8, 1, 4, 6);
    ctx.fillRect(9, 1, 3, 8);
    // Handle
    ctx.fillStyle = '#6a4a10';
    ctx.fillRect(6, 4, 2, 11);
  }

  // Helper for shovel shape
  function shovelShape(ctx, headColor) {
    // Scoop
    ctx.fillStyle = headColor;
    ctx.fillRect(6, 0, 4, 4);
    ctx.fillRect(5, 1, 6, 2);
    // Handle
    ctx.fillStyle = '#6a4a10';
    ctx.fillRect(7, 4, 2, 11);
  }

  // Row 0: Swords
  drawItem(0, 0, c => swordShape(c, '#a08030', '#8a6a20')); // wood
  drawItem(1, 0, c => swordShape(c, '#8a8a8a', '#6a6a6a')); // stone
  drawItem(2, 0, c => swordShape(c, '#c8c8c8', '#a0a0a0')); // iron
  drawItem(3, 0, c => swordShape(c, '#e8c840', '#c8a820')); // gold
  drawItem(4, 0, c => swordShape(c, '#40e8e8', '#20c8c8')); // diamond

  // Row 0: Pickaxes
  drawItem(5, 0, c => pickaxeShape(c, '#a08030'));
  drawItem(6, 0, c => pickaxeShape(c, '#8a8a8a'));
  drawItem(7, 0, c => pickaxeShape(c, '#c8c8c8'));
  drawItem(8, 0, c => pickaxeShape(c, '#e8c840'));
  drawItem(9, 0, c => pickaxeShape(c, '#40e8e8'));

  // Row 0: Axes
  drawItem(10, 0, c => axeShape(c, '#a08030'));
  drawItem(11, 0, c => axeShape(c, '#8a8a8a'));
  drawItem(12, 0, c => axeShape(c, '#c8c8c8'));
  drawItem(13, 0, c => axeShape(c, '#e8c840'));
  drawItem(14, 0, c => axeShape(c, '#40e8e8'));

  // Row 0: Shovel
  drawItem(15, 0, c => shovelShape(c, '#a08030'));

  // Row 1: More shovels
  drawItem(0, 1, c => shovelShape(c, '#8a8a8a'));
  drawItem(1, 1, c => shovelShape(c, '#c8c8c8'));
  drawItem(2, 1, c => shovelShape(c, '#e8c840'));
  drawItem(3, 1, c => shovelShape(c, '#40e8e8'));

  // Bow
  drawItem(4, 1, (c) => {
    c.fillStyle = '#6a4a10';
    c.fillRect(3, 1, 2, 14);
    c.fillStyle = '#8a6a20';
    c.fillRect(4, 2, 1, 12);
    c.fillStyle = '#aaaaaa';
    c.fillRect(5, 3, 1, 10);
  });

  // Arrow
  drawItem(5, 1, (c) => {
    c.fillStyle = '#8a8a8a';
    c.fillRect(7, 0, 2, 3); // head
    c.fillStyle = '#6a4a10';
    c.fillRect(7, 3, 2, 10); // shaft
    c.fillStyle = '#aaaaaa';
    c.fillRect(6, 13, 4, 1); // fletching
    c.fillRect(5, 14, 2, 1);
    c.fillRect(9, 14, 2, 1);
  });

  // Shield
  drawItem(6, 1, (c) => {
    c.fillStyle = '#6a4a10';
    c.fillRect(3, 1, 10, 14);
    c.fillStyle = '#8a8a8a';
    c.fillRect(5, 3, 6, 10);
    c.fillStyle = '#c03030';
    c.fillRect(6, 4, 4, 8);
  });

  // Fishing rod
  drawItem(7, 1, (c) => {
    c.fillStyle = '#6a4a10';
    c.fillRect(7, 0, 2, 12);
    c.fillStyle = '#aaaaaa';
    c.fillRect(7, 12, 2, 1);
    c.fillRect(8, 13, 1, 2);
  });

  // Iron armor set
  drawItem(8, 1, (c) => { // helmet
    c.fillStyle = '#c8c8c8';
    c.fillRect(3, 3, 10, 8);
    c.fillStyle = '#a0a0a0';
    c.fillRect(5, 5, 6, 4);
    c.fillStyle = '#1a1a1a';
    c.fillRect(5, 6, 6, 2); // visor
  });

  drawItem(9, 1, (c) => { // chestplate
    c.fillStyle = '#c8c8c8';
    c.fillRect(3, 1, 10, 12);
    c.fillStyle = '#a0a0a0';
    c.fillRect(5, 3, 6, 8);
  });

  drawItem(10, 1, (c) => { // leggings
    c.fillStyle = '#c8c8c8';
    c.fillRect(3, 0, 10, 14);
    c.fillStyle = '#a0a0a0';
    c.fillRect(5, 2, 2, 12);
    c.fillRect(9, 2, 2, 12);
  });

  drawItem(11, 1, (c) => { // boots
    c.fillStyle = '#c8c8c8';
    c.fillRect(3, 6, 10, 8);
    c.fillStyle = '#a0a0a0';
    c.fillRect(4, 8, 8, 4);
  });

  // Diamond armor set
  drawItem(12, 1, (c) => {
    c.fillStyle = '#40e8e8';
    c.fillRect(3, 3, 10, 8);
    c.fillStyle = '#20c8c8';
    c.fillRect(5, 5, 6, 4);
    c.fillStyle = '#1a1a1a';
    c.fillRect(5, 6, 6, 2);
  });

  drawItem(13, 1, (c) => {
    c.fillStyle = '#40e8e8';
    c.fillRect(3, 1, 10, 12);
    c.fillStyle = '#20c8c8';
    c.fillRect(5, 3, 6, 8);
  });

  drawItem(14, 1, (c) => {
    c.fillStyle = '#40e8e8';
    c.fillRect(3, 0, 10, 14);
    c.fillStyle = '#20c8c8';
    c.fillRect(5, 2, 2, 12);
    c.fillRect(9, 2, 2, 12);
  });

  drawItem(15, 1, (c) => {
    c.fillStyle = '#40e8e8';
    c.fillRect(3, 6, 10, 8);
    c.fillStyle = '#20c8c8';
    c.fillRect(4, 8, 8, 4);
  });

  // Row 2: Food & Potions
  // Apple
  drawItem(0, 2, (c) => {
    c.fillStyle = '#c03030';
    c.fillRect(5, 4, 6, 8);
    c.fillStyle = '#a02020';
    c.fillRect(6, 5, 4, 6);
    c.fillStyle = '#4a8020';
    c.fillRect(7, 2, 2, 3);
    c.fillStyle = '#6aa030';
    c.fillRect(9, 2, 2, 2);
  });

  // Bread
  drawItem(1, 2, (c) => {
    c.fillStyle = '#c8a040';
    c.fillRect(3, 6, 10, 6);
    c.fillStyle = '#d8b050';
    c.fillRect(4, 5, 8, 2);
    c.fillStyle = '#b89030';
    c.fillRect(4, 8, 8, 2);
  });

  // Cooked beef
  drawItem(2, 2, (c) => {
    c.fillStyle = '#8a4020';
    c.fillRect(4, 5, 8, 7);
    c.fillStyle = '#a05030';
    c.fillRect(5, 4, 6, 3);
    c.fillStyle = '#c06040';
    c.fillRect(6, 5, 4, 2);
    // Bone
    c.fillStyle = '#e8e0d0';
    c.fillRect(10, 3, 2, 5);
    c.fillRect(9, 3, 4, 1);
  });

  // Cooked pork
  drawItem(3, 2, (c) => {
    c.fillStyle = '#c06040';
    c.fillRect(4, 4, 8, 8);
    c.fillStyle = '#d07050';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#e08060';
    c.fillRect(6, 6, 4, 4);
    // Bone
    c.fillStyle = '#e8e0d0';
    c.fillRect(2, 5, 3, 2);
  });

  // Golden apple
  drawItem(4, 2, (c) => {
    c.fillStyle = '#e8c840';
    c.fillRect(5, 4, 6, 8);
    c.fillStyle = '#f0d860';
    c.fillRect(6, 5, 4, 6);
    c.fillStyle = '#4a8020';
    c.fillRect(7, 2, 2, 3);
    // Sparkle
    c.fillStyle = '#ffffff';
    c.fillRect(6, 5, 1, 1);
    c.fillRect(9, 7, 1, 1);
  });

  // Fish
  drawItem(5, 2, (c) => {
    c.fillStyle = '#6090c0';
    c.fillRect(4, 5, 8, 6);
    c.fillStyle = '#70a0d0';
    c.fillRect(5, 4, 6, 2);
    c.fillStyle = '#1a1a1a';
    c.fillRect(10, 6, 1, 1); // eye
    c.fillStyle = '#5080b0';
    c.fillRect(3, 7, 2, 3); // tail
  });

  // Cooked fish
  drawItem(6, 2, (c) => {
    c.fillStyle = '#c8a040';
    c.fillRect(4, 5, 8, 6);
    c.fillStyle = '#d8b050';
    c.fillRect(5, 4, 6, 2);
    c.fillStyle = '#1a1a1a';
    c.fillRect(10, 6, 1, 1);
    c.fillStyle = '#b89030';
    c.fillRect(3, 7, 2, 3);
  });

  // Mushroom stew
  drawItem(7, 2, (c) => {
    c.fillStyle = '#8a6a4a';
    c.fillRect(4, 4, 8, 10);
    c.fillStyle = '#d8c8a0';
    c.fillRect(5, 3, 6, 2);
    c.fillStyle = '#c03030';
    c.fillRect(6, 5, 2, 2); // mushroom
    c.fillStyle = '#e8e0d0';
    c.fillRect(9, 5, 2, 3); // mushroom
  });

  // Cookie
  drawItem(8, 2, (c) => {
    c.fillStyle = '#c8a040';
    c.fillRect(4, 4, 8, 8);
    c.fillStyle = '#6a3a10';
    c.fillRect(6, 6, 2, 2);
    c.fillRect(9, 5, 2, 2);
    c.fillRect(7, 9, 2, 2);
  });

  // Melon slice
  drawItem(9, 2, (c) => {
    c.fillStyle = '#c03030';
    c.fillRect(4, 3, 8, 10);
    c.fillStyle = '#40a020';
    c.fillRect(5, 3, 6, 2);
    c.fillStyle = '#e04040';
    c.fillRect(5, 5, 6, 6);
    // Seeds
    c.fillStyle = '#1a1a00';
    c.fillRect(6, 7, 1, 1);
    c.fillRect(9, 8, 1, 1);
    c.fillRect(7, 10, 1, 1);
  });

  // Steak
  drawItem(10, 2, (c) => {
    c.fillStyle = '#8a3018';
    c.fillRect(3, 5, 10, 7);
    c.fillStyle = '#a04028';
    c.fillRect(4, 4, 8, 3);
    c.fillStyle = '#c05838';
    c.fillRect(5, 5, 6, 2);
    // Fat
    c.fillStyle = '#e8c8a0';
    c.fillRect(7, 8, 3, 2);
  });

  // Chicken
  drawItem(11, 2, (c) => {
    c.fillStyle = '#e8d8b0';
    c.fillRect(4, 4, 8, 8);
    c.fillStyle = '#f0e0c0';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#c0a060';
    c.fillRect(3, 6, 2, 4); // leg
    c.fillRect(11, 6, 2, 4); // leg
  });

  // Mutton
  drawItem(12, 2, (c) => {
    c.fillStyle = '#a03030';
    c.fillRect(4, 4, 8, 8);
    c.fillStyle = '#c04040';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#e8d0b0';
    c.fillRect(4, 3, 8, 2); // fat cap
  });

  // Health potion
  drawItem(13, 2, (c) => {
    c.fillStyle = '#c03030';
    c.fillRect(5, 6, 6, 8);
    c.fillStyle = '#e04040';
    c.fillRect(6, 7, 4, 6);
    c.fillStyle = '#aaaaaa';
    c.fillRect(6, 3, 4, 4);
    c.fillStyle = '#8a8a8a';
    c.fillRect(7, 3, 2, 1); // cork
  });

  // Mana potion
  drawItem(14, 2, (c) => {
    c.fillStyle = '#3030c0';
    c.fillRect(5, 6, 6, 8);
    c.fillStyle = '#4040e0';
    c.fillRect(6, 7, 4, 6);
    c.fillStyle = '#aaaaaa';
    c.fillRect(6, 3, 4, 4);
    c.fillStyle = '#8a8a8a';
    c.fillRect(7, 3, 2, 1);
  });

  // Speed potion
  drawItem(15, 2, (c) => {
    c.fillStyle = '#30c030';
    c.fillRect(5, 6, 6, 8);
    c.fillStyle = '#40e040';
    c.fillRect(6, 7, 4, 6);
    c.fillStyle = '#aaaaaa';
    c.fillRect(6, 3, 4, 4);
    c.fillStyle = '#8a8a8a';
    c.fillRect(7, 3, 2, 1);
  });

  // Row 3: Materials
  // Stick
  drawItem(0, 3, (c) => {
    c.fillStyle = '#8a6a20';
    c.fillRect(7, 2, 2, 12);
    c.fillStyle = '#6a4a10';
    c.fillRect(7, 2, 1, 12);
  });

  // Coal
  drawItem(1, 3, (c) => {
    c.fillStyle = '#2a2a2a';
    c.fillRect(4, 4, 8, 8);
    c.fillStyle = '#1a1a1a';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#3a3a3a';
    c.fillRect(6, 5, 2, 2);
  });

  // Iron ingot
  drawItem(2, 3, (c) => {
    c.fillStyle = '#c8c8c8';
    c.fillRect(4, 5, 8, 6);
    c.fillStyle = '#a0a0a0';
    c.fillRect(5, 4, 6, 2);
    c.fillStyle = '#e0e0e0';
    c.fillRect(5, 6, 6, 4);
  });

  // Gold ingot
  drawItem(3, 3, (c) => {
    c.fillStyle = '#e8c840';
    c.fillRect(4, 5, 8, 6);
    c.fillStyle = '#c8a820';
    c.fillRect(5, 4, 6, 2);
    c.fillStyle = '#f0d860';
    c.fillRect(5, 6, 6, 4);
  });

  // Diamond
  drawItem(4, 3, (c) => {
    c.fillStyle = '#40e8e8';
    c.fillRect(6, 2, 4, 4);
    c.fillRect(4, 6, 8, 4);
    c.fillRect(6, 10, 4, 2);
    c.fillStyle = '#20c8c8';
    c.fillRect(5, 4, 6, 6);
    c.fillStyle = '#60ffff';
    c.fillRect(7, 3, 2, 2);
  });

  // Emerald
  drawItem(5, 3, (c) => {
    c.fillStyle = '#40c040';
    c.fillRect(6, 2, 4, 4);
    c.fillRect(4, 6, 8, 4);
    c.fillRect(6, 10, 4, 2);
    c.fillStyle = '#20a020';
    c.fillRect(5, 4, 6, 6);
    c.fillStyle = '#60e060';
    c.fillRect(7, 3, 2, 2);
  });

  // Redstone
  drawItem(6, 3, (c) => {
    c.fillStyle = '#c02020';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#a01010';
    c.fillRect(6, 6, 4, 4);
    c.fillStyle = '#e04040';
    c.fillRect(7, 6, 2, 2);
  });

  // Lapis
  drawItem(7, 3, (c) => {
    c.fillStyle = '#2040c0';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#1030a0';
    c.fillRect(6, 6, 4, 4);
    c.fillStyle = '#4060e0';
    c.fillRect(7, 7, 2, 2);
  });

  // Crystal shard
  drawItem(8, 3, (c) => {
    c.fillStyle = '#a040e0';
    c.fillRect(7, 1, 2, 12);
    c.fillRect(5, 3, 6, 8);
    c.fillStyle = '#c060ff';
    c.fillRect(6, 4, 4, 6);
    c.fillStyle = '#e080ff';
    c.fillRect(7, 5, 2, 4);
  });

  // String
  drawItem(9, 3, (c) => {
    c.fillStyle = '#d8d0c0';
    c.fillRect(5, 3, 6, 10);
    c.fillStyle = '#c8c0b0';
    for (let y = 4; y < 12; y += 2) {
      c.fillRect(6, y, 4, 1);
    }
  });

  // Feather
  drawItem(10, 3, (c) => {
    c.fillStyle = '#e8e0d0';
    c.fillRect(7, 1, 2, 14);
    c.fillStyle = '#d8d0c0';
    c.fillRect(5, 3, 3, 8);
    c.fillRect(9, 4, 3, 6);
    c.fillStyle = '#c0b8a0';
    c.fillRect(4, 5, 2, 4);
    c.fillRect(10, 6, 2, 3);
  });

  // Flint
  drawItem(11, 3, (c) => {
    c.fillStyle = '#5a5a5a';
    c.fillRect(5, 4, 6, 8);
    c.fillStyle = '#4a4a4a';
    c.fillRect(6, 5, 4, 6);
    c.fillStyle = '#6a6a6a';
    c.fillRect(7, 5, 2, 3);
  });

  // Leather
  drawItem(12, 3, (c) => {
    c.fillStyle = '#a07030';
    c.fillRect(4, 4, 8, 8);
    c.fillStyle = '#906020';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#b08040';
    c.fillRect(5, 4, 6, 1);
  });

  // Bone
  drawItem(13, 3, (c) => {
    c.fillStyle = '#e8e0d0';
    c.fillRect(7, 1, 2, 14);
    c.fillStyle = '#d8d0c0';
    c.fillRect(6, 1, 4, 2);
    c.fillRect(6, 13, 4, 2);
    c.fillRect(5, 2, 2, 1);
    c.fillRect(9, 2, 2, 1);
    c.fillRect(5, 13, 2, 1);
    c.fillRect(9, 13, 2, 1);
  });

  // Gunpowder
  drawItem(14, 3, (c) => {
    c.fillStyle = '#3a3a3a';
    c.fillRect(5, 5, 6, 6);
    c.fillStyle = '#2a2a2a';
    c.fillRect(6, 6, 4, 4);
    c.fillStyle = '#4a4a4a';
    dots(c, 0, 0, 8, 5, 5, 6, ['#5a5a5a', '#1a1a1a']);
  });

  // Ender pearl
  drawItem(15, 3, (c) => {
    c.fillStyle = '#1a3a2a';
    c.fillRect(5, 4, 6, 8);
    c.fillStyle = '#0e2a1e';
    c.fillRect(6, 5, 4, 6);
    c.fillStyle = '#40c080';
    c.fillRect(7, 6, 2, 2);
    c.fillStyle = '#60e0a0';
    c.fillRect(8, 7, 1, 1);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}
