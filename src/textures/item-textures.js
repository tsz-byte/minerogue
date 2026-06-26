/**
 * MineRogue - Item Texture Loader
 * Loads generated PNG textures for items and creates Three.js textures from them.
 * Used by both the hand renderer (3D) and the UI (2D hotbar/inventory).
 */
import * as THREE from 'three';

// Cache loaded textures
const _textureCache = new Map();
const _imageCache = new Map();

// Map item types/categories to their texture files
const ITEM_TEXTURE_MAP = {
  // Tools - by type
  'sword_wood': 'sword.png',
  'sword_stone': 'sword.png',
  'sword_iron': 'sword.png',
  'sword_gold': 'gold_sword.png',
  'sword_diamond': 'sword.png',
  'sword_crystal': 'sword.png',
  'pickaxe_wood': 'pickaxe.png',
  'pickaxe_stone': 'pickaxe.png',
  'pickaxe_iron': 'pickaxe.png',
  'pickaxe_gold': 'pickaxe.png',
  'pickaxe_diamond': 'pickaxe.png',
  'pickaxe_crystal': 'pickaxe.png',
  'axe_wood': 'axe.png',
  'axe_stone': 'axe.png',
  'axe_iron': 'axe.png',
  'axe_gold': 'axe.png',
  'axe_diamond': 'axe.png',
  'axe_crystal': 'axe.png',
  'shovel_wood': 'shovel.png',
  'shovel_stone': 'shovel.png',
  'shovel_iron': 'shovel.png',
  'shovel_gold': 'shovel.png',
  'shovel_diamond': 'shovel.png',
  'shovel_crystal': 'shovel.png',
  // Weapons
  'bow': 'bow.png',
  'shield': 'shield.png',
  // Food
  'apple': 'apple.png',
  'food': 'apple.png', // default food fallback
  // Potions
  'potion': 'potion.png',
};

/**
 * Get the texture filename for an item ID.
 */
export function getTextureFilename(itemId) {
  if (itemId == null) return null;
  const { getItem } = require('../data/items.js');
  // Actually we'll use the dynamic import-free approach
  return _getTextureFileForId(itemId);
}

function _getTextureFileForId(itemId) {
  // Swords (100-119)
  if (itemId >= 100 && itemId <= 103) return 'sword.png';
  if (itemId >= 104 && itemId <= 106) return 'sword.png';
  if (itemId === 107) return 'sword.png';
  if (itemId >= 108 && itemId <= 110) return 'sword.png';
  if (itemId === 111) return 'sword.png';
  if (itemId === 112) return 'gold_sword.png';
  if (itemId === 113) return 'gold_sword.png';
  if (itemId === 114) return 'gold_sword.png';
  if (itemId === 115) return 'gold_sword.png';
  if (itemId >= 116 && itemId <= 119) return 'sword.png';
  // Crystal tier
  if (itemId === 122) return 'sword.png';
  if (itemId === 123) return 'pickaxe.png';
  if (itemId === 124) return 'axe.png';
  if (itemId === 125) return 'shovel.png';
  // Pickaxes (101, 105, 109, 113, 117)
  if ([101, 105, 109, 113, 117].includes(itemId)) return 'pickaxe.png';
  // Axes (102, 106, 110, 114, 118)
  if ([102, 106, 110, 114, 118].includes(itemId)) return 'axe.png';
  // Shovels (103, 107, 111, 115, 119)
  if ([103, 107, 111, 115, 119].includes(itemId)) return 'shovel.png';
  // Bow/Shield/Arrow
  if (itemId === 120) return 'bow.png';
  if (itemId === 121) return 'shield.png';
  if (itemId === 126) return 'bow.png'; // arrow uses bow texture
  // Food
  if (itemId >= 150 && itemId <= 163) return 'apple.png';
  // Potions
  if (itemId >= 230 && itemId <= 237) return 'potion.png';
  // Armor (use sword texture as fallback)
  if (itemId >= 127 && itemId <= 146) return 'sword.png';
  // Materials (use pickaxe texture as generic)
  if (itemId >= 200 && itemId <= 221) return 'pickaxe.png';
  // Legendaries
  if (itemId >= 250 && itemId <= 259) return 'sword.png';
  return null;
}

/**
 * Load and cache a Three.js texture for an item.
 * @param {number} itemId
 * @returns {THREE.Texture|null}
 */
export function getItemThreeTexture(itemId) {
  if (_textureCache.has(itemId)) return _textureCache.get(itemId);

  const filename = _getTextureFileForId(itemId);
  if (!filename) return null;

  const path = `/textures/items/${filename}`;
  const loader = new THREE.TextureLoader();
  const texture = loader.load(path);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  _textureCache.set(itemId, texture);
  return texture;
}

/**
 * Remove white/near-white background from an image by compositing onto a transparent canvas.
 * Pixels where R, G, B are all >= 240 are made transparent.
 * @param {HTMLImageElement} img
 * @returns {HTMLCanvasElement} Canvas with transparent background
 */
function _removeWhiteBg(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    // If pixel is near-white (R>=240, G>=240, B>=240), make it transparent
    if (d[i] >= 240 && d[i + 1] >= 240 && d[i + 2] >= 240) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Load and cache an Image element for an item (for 2D UI use).
 * White backgrounds are automatically removed for transparency.
 * @param {number} itemId
 * @returns {Promise<HTMLImageElement|null>}
 */
export function getItemImage(itemId) {
  return new Promise((resolve) => {
    if (_imageCache.has(itemId)) {
      resolve(_imageCache.get(itemId));
      return;
    }

    const filename = _getTextureFileForId(itemId);
    if (!filename) { resolve(null); return; }

    const img = new Image();
    img.onload = () => {
      // Remove white background for transparent rendering in UI
      const canvas = _removeWhiteBg(img);
      const cleanedImg = new Image();
      cleanedImg.onload = () => {
        _imageCache.set(itemId, cleanedImg);
        resolve(cleanedImg);
      };
      cleanedImg.src = canvas.toDataURL();
    };
    img.onerror = () => resolve(null);
    img.src = `/textures/items/${filename}`;
  });
}

/**
 * Get item texture as a data URL for immediate use in DOM (synchronous fallback).
 * Returns a colored placeholder if image not loaded yet.
 * White backgrounds are removed for proper transparency.
 */
export function getItemTextureUrl(itemId) {
  if (_imageCache.has(itemId)) {
    const img = _imageCache.get(itemId);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, 64, 64);
    return canvas.toDataURL();
  }

  // Start loading in background
  getItemImage(itemId);
  return null;
}

/**
 * Preload all item textures. Call this once at game start.
 */
export function preloadItemTextures() {
  const files = ['sword.png', 'pickaxe.png', 'axe.png', 'shovel.png', 'bow.png', 'shield.png', 'apple.png', 'potion.png', 'gold_sword.png'];
  for (const file of files) {
    const img = new Image();
    img.src = `/textures/items/${file}`;
  }
}

// Also keep the atlas-based icon system as fallback
import { getItemIcon as _getAtlasIcon } from './textures.js';

/**
 * Get an item icon URL, preferring generated textures over atlas.
 */
export function getBestItemIcon(itemId) {
  const tex = getItemTextureUrl(itemId);
  if (tex) return tex;
  return _getAtlasIcon(itemId);
}
