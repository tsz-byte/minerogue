/**
 * MineRogue - Procedural Mob Texture Atlas
 * Generates 16x16 face/body textures for each mob type on a canvas atlas.
 * Each mob gets a 3x2 tile set: [front, back, left, right, top, bottom]
 * Atlas layout: 16 tiles wide, N tiles tall (16px per tile)
 */
import * as THREE from 'three';

const TILE = 16;
const TILES_PER_ROW = 16;
const ATLAS_ROWS = 20;

let _mobAtlasCanvas = null;
let _mobAtlasTexture = null;

// Mob atlas row positions (each mob = 6 tiles = one full cube face set)
const MOB_ATLAS_ROWS = {
  zombie:       0,
  skeleton:     1,
  spider:       2,
  creeper:      3,
  enderman:     4,
  cow:          5,
  pig:          6,
  chicken:      7,
  sheep:        8,
  witch:        9,
  husk:         10,
  phantom:      11,
  slime:        12,
  mimic:        13,
  harpy:        14,
  giant_zombie: 0,  // reuses zombie
  spider_queen: 2,  // reuses spider
  necromancer:  15,
  crystal_golem:16,
  void_wyrm:    17,
  cave_spider:  2,  // reuses spider
  corrupted_champion: 0,  // reuses zombie
  villager:     5,  // reuses cow row as fallback
  fish:         4,  // reuses enderman row as fallback
};

function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function fillTile(ctx, col, row, color) {
  ctx.fillStyle = color;
  ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
}

function drawFace(ctx, col, row, drawFn) {
  ctx.save();
  ctx.translate(col * TILE, row * TILE);
  drawFn(ctx);
  ctx.restore();
}

// ─── Mob Face Drawers ──────────────────────────────────────────

function drawZombieFaces(ctx, row) {
  // Front face (col 0) - green face with dark eyes
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a7a3a');
    // Eyes
    rect(c, 3, 5, 3, 2, '#2a2a2a');
    rect(c, 10, 5, 3, 2, '#2a2a2a');
    // Pupils
    rect(c, 4, 5, 1, 1, '#e0e0e0');
    rect(c, 11, 5, 1, 1, '#e0e0e0');
    // Nose
    rect(c, 7, 7, 2, 2, '#2a6a2a');
    // Mouth
    rect(c, 5, 10, 6, 2, '#1a3a1a');
    rect(c, 6, 11, 1, 1, '#2a5a2a');
    rect(c, 9, 11, 1, 1, '#2a5a2a');
  });
  // Back face (col 1)
  drawFace(ctx, 1, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a7a3a');
    // Hair/back of head
    rect(c, 2, 1, 12, 6, '#2a5a2a');
  });
  // Left face (col 2)
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a7a3a');
    rect(c, 2, 5, 3, 2, '#2a2a2a');
    rect(c, 3, 5, 1, 1, '#e0e0e0');
  });
  // Right face (col 3)
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a7a3a');
    rect(c, 11, 5, 3, 2, '#2a2a2a');
    rect(c, 12, 5, 1, 1, '#e0e0e0');
  });
  // Top face (col 4)
  drawFace(ctx, 4, row, (c) => {
    rect(c, 0, 0, 16, 16, '#4a9a4a');
    rect(c, 3, 3, 10, 10, '#3a7a3a');
  });
  // Bottom face (col 5)
  drawFace(ctx, 5, row, (c) => {
    rect(c, 0, 0, 16, 16, '#2a5a2a');
  });
}

function drawSkeletonFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#d0d0c0');
    // Eye sockets
    rect(c, 3, 4, 3, 3, '#1a1a1a');
    rect(c, 10, 4, 3, 3, '#1a1a1a');
    // Nose hole
    rect(c, 7, 8, 2, 1, '#1a1a1a');
    // Jaw/teeth
    rect(c, 4, 11, 8, 2, '#b0b0a0');
    rect(c, 5, 11, 1, 1, '#1a1a1a');
    rect(c, 7, 11, 1, 1, '#1a1a1a');
    rect(c, 9, 11, 1, 1, '#1a1a1a');
    rect(c, 11, 11, 1, 1, '#1a1a1a');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#c0c0b0'));
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#d0d0c0');
    rect(c, 2, 4, 2, 3, '#1a1a1a');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#d0d0c0');
    rect(c, 12, 4, 2, 3, '#1a1a1a');
  });
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#e0e0d0'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#b0b0a0'));
}

function drawSpiderFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#333333');
    // 8 eyes
    const eyeColor = '#ff0000';
    const eyePositions = [[3,4],[5,3],[8,3],[10,4],[4,6],[6,5],[9,5],[11,6]];
    for (const [ex, ey] of eyePositions) {
      px(c, ex, ey, eyeColor);
      px(c, ex+1, ey, '#cc0000');
    }
    // Fangs
    rect(c, 6, 11, 1, 3, '#aaaaaa');
    rect(c, 9, 11, 1, 3, '#aaaaaa');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#2a2a2a'));
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#333333');
    // Side eyes
    px(c, 2, 4, '#ff0000');
    px(c, 2, 6, '#ff0000');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#333333');
    px(c, 13, 4, '#ff0000');
    px(c, 13, 6, '#ff0000');
  });
  drawFace(ctx, 4, row, (c) => {
    rect(c, 0, 0, 16, 16, '#2a2a2a');
    rect(c, 3, 3, 10, 10, '#222222');
  });
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#1a1a1a'));
}

function drawCreeperFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#4a9a4a');
    // Iconic creeper face
    rect(c, 3, 4, 3, 3, '#1a1a1a');
    rect(c, 10, 4, 3, 3, '#1a1a1a');
    // Nose/mouth pattern
    rect(c, 6, 8, 4, 2, '#1a1a1a');
    rect(c, 5, 10, 2, 2, '#1a1a1a');
    rect(c, 9, 10, 2, 2, '#1a1a1a');
    rect(c, 7, 10, 2, 3, '#1a1a1a');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#4a9a4a'));
  drawFace(ctx, 2, row, (c) => rect(c, 0, 0, 16, 16, '#4a9a4a'));
  drawFace(ctx, 3, row, (c) => rect(c, 0, 0, 16, 16, '#4a9a4a'));
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#5aaa5a'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#3a8a3a'));
}

function drawEndermanFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#1a1a1a');
    // Purple eyes
    rect(c, 3, 5, 3, 2, '#9900ff');
    rect(c, 10, 5, 3, 2, '#9900ff');
    // Eye glow
    rect(c, 4, 5, 1, 1, '#cc66ff');
    rect(c, 11, 5, 1, 1, '#cc66ff');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#1a1a1a'));
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#1a1a1a');
    rect(c, 2, 5, 2, 2, '#9900ff');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#1a1a1a');
    rect(c, 12, 5, 2, 2, '#9900ff');
  });
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#0e0e0e'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#0a0a0a'));
}

function drawCowFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#6a4a30');
    // Eyes
    rect(c, 3, 5, 2, 2, '#1a1a1a');
    rect(c, 11, 5, 2, 2, '#1a1a1a');
    // Nose
    rect(c, 5, 9, 6, 4, '#e8c0a0');
    rect(c, 6, 10, 1, 1, '#1a1a1a');
    rect(c, 9, 10, 1, 1, '#1a1a1a');
    // Horns
    rect(c, 2, 1, 2, 3, '#e8e0d0');
    rect(c, 12, 1, 2, 3, '#e8e0d0');
  });
  drawFace(ctx, 1, row, (c) => {
    rect(c, 0, 0, 16, 16, '#5a3a20');
    rect(c, 4, 4, 3, 3, '#3a2a10');
    rect(c, 9, 6, 2, 2, '#3a2a10');
  });
  drawFace(ctx, 2, row, (c) => rect(c, 0, 0, 16, 16, '#5a3a20'));
  drawFace(ctx, 3, row, (c) => rect(c, 0, 0, 16, 16, '#5a3a20'));
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#6a4a30'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#4a3a20'));
}

function drawPigFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8a0a0');
    rect(c, 4, 5, 2, 2, '#1a1a1a');
    rect(c, 10, 5, 2, 2, '#1a1a1a');
    // Snout
    rect(c, 5, 8, 6, 4, '#c08080');
    rect(c, 6, 9, 1, 1, '#1a1a1a');
    rect(c, 9, 9, 1, 1, '#1a1a1a');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#d89090'));
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8a0a0');
    rect(c, 2, 5, 2, 2, '#1a1a1a');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8a0a0');
    rect(c, 12, 5, 2, 2, '#1a1a1a');
  });
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#e8a0a0'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#c08080'));
}

function drawChickenFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8e0d0');
    // Eyes
    px(c, 4, 5, '#1a1a1a');
    px(c, 11, 5, '#1a1a1a');
    // Beak
    rect(c, 6, 7, 4, 2, '#e8c840');
    rect(c, 7, 9, 2, 1, '#e8c840');
    // Wattle (red)
    rect(c, 7, 10, 2, 3, '#c03030');
    // Comb (red)
    rect(c, 6, 1, 4, 3, '#c03030');
    rect(c, 7, 0, 2, 1, '#c03030');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#d8d0c0'));
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8e0d0');
    px(c, 3, 5, '#1a1a1a');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8e0d0');
    px(c, 12, 5, '#1a1a1a');
  });
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#e8e0d0'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#c0b8a0'));
}

function drawSheepFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8e8e8');
    // Wool tufts
    for (let i = 0; i < 12; i++) {
      px(c, 2 + (i % 4) * 3, 2 + Math.floor(i / 4) * 2, '#f8f8f8');
    }
    // Eyes
    rect(c, 4, 7, 2, 2, '#1a1a1a');
    rect(c, 10, 7, 2, 2, '#1a1a1a');
    // Nose
    rect(c, 6, 10, 4, 3, '#3a3a3a');
  });
  drawFace(ctx, 1, row, (c) => {
    rect(c, 0, 0, 16, 16, '#e8e8e8');
    for (let i = 0; i < 16; i++) px(c, 2 + (i % 4) * 3, 2 + Math.floor(i / 4) * 3, '#f0f0f0');
  });
  drawFace(ctx, 2, row, (c) => rect(c, 0, 0, 16, 16, '#e8e8e8'));
  drawFace(ctx, 3, row, (c) => rect(c, 0, 0, 16, 16, '#e8e8e8'));
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#f0f0f0'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#d0d0d0'));
}

function drawGenericFaces(ctx, row, bodyColor, eyeColor = '#1a1a1a') {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, bodyColor);
    rect(c, 4, 5, 2, 2, eyeColor);
    rect(c, 10, 5, 2, 2, eyeColor);
    rect(c, 6, 10, 4, 2, '#1a1a1a');
  });
  for (let i = 1; i < 6; i++) {
    drawFace(ctx, i, row, (c) => rect(c, 0, 0, 16, 16, bodyColor));
  }
}

function drawSlimeFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#4a9a4a');
    // Slimy shine
    rect(c, 2, 2, 4, 2, '#6aba4a');
    // Eyes
    rect(c, 4, 5, 3, 3, '#ffffff');
    rect(c, 9, 5, 3, 3, '#ffffff');
    rect(c, 5, 6, 2, 2, '#1a1a1a');
    rect(c, 10, 6, 2, 2, '#1a1a1a');
    // Mouth
    rect(c, 5, 11, 6, 2, '#2a6a2a');
  });
  for (let i = 1; i < 6; i++) {
    drawFace(ctx, i, row, (c) => {
      rect(c, 0, 0, 16, 16, '#4a9a4a');
      rect(c, 3, 3, 3, 2, '#6aba4a');
    });
  }
}

function drawCrystalGolemFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#6644aa');
    // Crystal eyes
    rect(c, 4, 4, 3, 2, '#cc88ff');
    rect(c, 9, 4, 3, 2, '#cc88ff');
    // Crystal shards on face
    px(c, 7, 8, '#aa66ff');
    px(c, 8, 9, '#aa66ff');
    px(c, 6, 10, '#aa66ff');
    rect(c, 5, 12, 6, 2, '#5533aa');
  });
  for (let i = 1; i < 6; i++) {
    drawFace(ctx, i, row, (c) => {
      rect(c, 0, 0, 16, 16, '#6644aa');
      // Crystal protrusions
      px(c, 3 + i * 2, 4, '#8866cc');
      px(c, 5 + i, 8, '#aa88ee');
    });
  }
}

function drawVoidWyrmFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#1a0a2a');
    // Glowing void eyes
    rect(c, 3, 4, 3, 3, '#aa00ff');
    rect(c, 10, 4, 3, 3, '#aa00ff');
    rect(c, 4, 5, 1, 1, '#ff66ff');
    rect(c, 11, 5, 1, 1, '#ff66ff');
    // Void mouth
    rect(c, 5, 10, 6, 3, '#000000');
    // Teeth
    px(c, 5, 10, '#aa00ff');
    px(c, 7, 10, '#aa00ff');
    px(c, 9, 10, '#aa00ff');
  });
  for (let i = 1; i < 6; i++) {
    drawFace(ctx, i, row, (c) => {
      rect(c, 0, 0, 16, 16, '#1a0a2a');
      // Void tendrils
      px(c, 4 + i, 3, '#6600aa');
      px(c, 8, 6 + i % 3, '#4400aa');
    });
  }
}

function drawNecromancerFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#2a1a2a');
    // Hood
    rect(c, 1, 0, 14, 5, '#1a0a1a');
    // Glowing eyes
    rect(c, 4, 6, 2, 2, '#ff3333');
    rect(c, 10, 6, 2, 2, '#ff3333');
    px(c, 4, 6, '#ff6666');
    px(c, 10, 6, '#ff6666');
    // Dark mouth
    rect(c, 6, 11, 4, 2, '#0a0a0a');
  });
  for (let i = 1; i < 6; i++) {
    drawFace(ctx, i, row, (c) => rect(c, 0, 0, 16, 16, '#2a1a2a'));
  }
}

function drawWitchFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#4a2a4a');
    // Hat
    rect(c, 2, 0, 12, 3, '#2a1a2a');
    rect(c, 5, 0, 6, 1, '#2a1a2a');
    // Eyes
    rect(c, 4, 5, 2, 2, '#30c030');
    rect(c, 10, 5, 2, 2, '#30c030');
    // Nose
    rect(c, 7, 7, 2, 3, '#3a1a3a');
    // Wart
    px(c, 8, 10, '#2a1a2a');
    // Mouth
    rect(c, 5, 12, 6, 1, '#1a0a1a');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#4a2a4a'));
  drawFace(ctx, 2, row, (c) => rect(c, 0, 0, 16, 16, '#4a2a4a'));
  drawFace(ctx, 3, row, (c) => rect(c, 0, 0, 16, 16, '#4a2a4a'));
  drawFace(ctx, 4, row, (c) => rect(c, 0, 0, 16, 16, '#5a3a5a'));
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#3a1a3a'));
}

function drawCaveSpiderFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#2a2a3a');
    // 8 eyes - orange-tinted for cave variant
    const eyeColor = '#ff4400';
    const eyePositions = [[3,4],[5,3],[8,3],[10,4],[4,6],[6,5],[9,5],[11,6]];
    for (const [ex, ey] of eyePositions) {
      px(c, ex, ey, eyeColor);
      px(c, ex+1, ey, '#cc3300');
    }
    // Fangs
    rect(c, 6, 11, 1, 3, '#88aa88');
    rect(c, 9, 11, 1, 3, '#88aa88');
  });
  drawFace(ctx, 1, row, (c) => rect(c, 0, 0, 16, 16, '#1a1a2a'));
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#2a2a3a');
    px(c, 2, 4, '#ff4400');
    px(c, 2, 6, '#ff4400');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#2a2a3a');
    px(c, 13, 4, '#ff4400');
    px(c, 13, 6, '#ff4400');
  });
  drawFace(ctx, 4, row, (c) => {
    rect(c, 0, 0, 16, 16, '#1a1a2a');
    rect(c, 3, 3, 10, 10, '#15152a');
  });
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#0e0e1a'));
}

function drawCorruptedChampionFaces(ctx, row) {
  drawFace(ctx, 0, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a1a3a');
    // Corrupted helm
    rect(c, 1, 0, 14, 4, '#2a0a2a');
    rect(c, 3, 1, 10, 2, '#4a2a4a');
    // Glowing purple eyes
    rect(c, 4, 6, 2, 2, '#cc00ff');
    rect(c, 10, 6, 2, 2, '#cc00ff');
    px(c, 4, 6, '#ff66ff');
    px(c, 10, 6, '#ff66ff');
    // Dark visor
    rect(c, 3, 5, 10, 1, '#1a0a1a');
    rect(c, 3, 8, 10, 1, '#1a0a1a');
    // Mouth
    rect(c, 6, 11, 4, 2, '#0a0a0a');
  });
  drawFace(ctx, 1, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a1a3a');
    rect(c, 1, 0, 14, 4, '#2a0a2a');
    // Corruption veins
    for (let y = 5; y < 15; y += 2) {
      px(c, 4 + (y % 3), y, '#6600aa');
      px(c, 10 - (y % 3), y + 1, '#5500aa');
    }
  });
  drawFace(ctx, 2, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a1a3a');
    rect(c, 1, 0, 3, 4, '#2a0a2a');
    px(c, 3, 6, '#cc00ff');
    // Corruption veins
    px(c, 5, 10, '#6600aa');
    px(c, 4, 12, '#5500aa');
  });
  drawFace(ctx, 3, row, (c) => {
    rect(c, 0, 0, 16, 16, '#3a1a3a');
    rect(c, 12, 0, 3, 4, '#2a0a2a');
    px(c, 12, 6, '#cc00ff');
    px(c, 10, 10, '#6600aa');
    px(c, 11, 12, '#5500aa');
  });
  drawFace(ctx, 4, row, (c) => {
    rect(c, 0, 0, 16, 16, '#4a2a4a');
    rect(c, 2, 2, 12, 12, '#3a1a3a');
    // Corruption sigil
    px(c, 7, 7, '#cc00ff');
    px(c, 8, 8, '#cc00ff');
  });
  drawFace(ctx, 5, row, (c) => rect(c, 0, 0, 16, 16, '#1a0a1a'));
}

// ─── Atlas Generation ──────────────────────────────────────────

export function createMobTextureAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = TILES_PER_ROW * TILE;
  canvas.height = ATLAS_ROWS * TILE;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawZombieFaces(ctx, 0);
  drawSkeletonFaces(ctx, 1);
  drawSpiderFaces(ctx, 2);
  drawCreeperFaces(ctx, 3);
  drawEndermanFaces(ctx, 4);
  drawCowFaces(ctx, 5);
  drawPigFaces(ctx, 6);
  drawChickenFaces(ctx, 7);
  drawSheepFaces(ctx, 8);
  drawWitchFaces(ctx, 9);
  drawGenericFaces(ctx, 10, '#8a7a5a'); // Husk
  drawGenericFaces(ctx, 11, '#4a4a6a', '#aa88ff'); // Phantom
  drawSlimeFaces(ctx, 12);
  drawGenericFaces(ctx, 13, '#8B6914'); // Mimic
  drawGenericFaces(ctx, 14, '#8a6a4a', '#ffaacc'); // Harpy
  drawNecromancerFaces(ctx, 15);
  drawCrystalGolemFaces(ctx, 16);
  drawVoidWyrmFaces(ctx, 17);
  drawCaveSpiderFaces(ctx, 18);
  drawCorruptedChampionFaces(ctx, 19);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  _mobAtlasCanvas = canvas;
  _mobAtlasTexture = texture;

  // Load AI-generated face images and overlay them on front face (column 0)
  _loadFaceOverlays(canvas, ctx, texture);

  return texture;
}

/**
 * Load AI-generated mob face images and draw them onto the atlas front face positions.
 */
function _loadFaceOverlays(canvas, ctx, texture) {
  const faceMap = {
    zombie: 0, skeleton: 1, spider: 2, creeper: 3, enderman: 4,
    cow: 5, pig: 6, chicken: 7, sheep: 8, witch: 9,
    husk: 10, phantom: 11, slime: 12,
    cave_spider: 18, ghast: -1,
  };

  for (const [name, row] of Object.entries(faceMap)) {
    if (row < 0) continue;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw face onto column 0 of this mob's row in the atlas
      ctx.drawImage(img, 0, row * TILE, TILE, TILE);
      texture.needsUpdate = true;
    };
    img.onerror = () => { /* fallback: keep procedural face */ };
    // Vite serves from /src or /assets — use relative path
    img.src = new URL(`../../assets/textures/mobs/${name}.png`, import.meta.url).href;
  }
}

/**
 * Get UV coordinates for a mob's face in the atlas.
 * @param {string} mobType - mob type key
 * @param {number} faceIdx - 0-5 (front, back, left, right, top, bottom)
 * @returns {{ u0, v0, u1, v1 }} UV rect
 */
export function getMobFaceUV(mobType, faceIdx) {
  const row = MOB_ATLAS_ROWS[mobType] ?? 0;
  const col = faceIdx;
  const u0 = col / TILES_PER_ROW;
  const v0 = 1 - (row + 1) / ATLAS_ROWS;
  const u1 = (col + 1) / TILES_PER_ROW;
  const v1 = 1 - row / ATLAS_ROWS;
  return { u0, v0, u1, v1 };
}

export function getMobTextureAtlas() {
  return _mobAtlasTexture;
}
