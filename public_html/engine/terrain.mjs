import { assetURL } from './paths.mjs';
import {STRUCTURE_CATALOG} from './structures/catalog.mjs';
import {structureProfile} from './structures/runtime.mjs';
import { TERRAIN_VARIANTS, terrainConnections, terrainChoice } from './terrain-rules.mjs?v=1';
// Twenty illustrated surfaces per material, coded seams and neighbour-aware borders.
// Numeric level tiles and collision rules stay in engine.mjs.
export const TERRAIN_SHEETS = {
  ground: structureProfile('ground').terrain.image, brick: structureProfile('brick').terrain.image,
  ...Object.fromEntries(STRUCTURE_CATALOG.filter(c=>c.terrain&&![1,2].some(id=>c.tileIds.includes(id))).map(c=>[c.key,c.terrain.image]))
};
export const TERRAIN_COUNT = 20;
export const JOIN = { up: 1, right: 2, down: 4, left: 8 };
const TERRAIN_SIZE = 96;
const terrainTextures = new Map(), terrainCache = new Map();
let grassStrip = null;
export const hasTerrain = () => terrainTextures.has('ground')&&terrainTextures.has('brick');

export function terrainMask(tiles, x, y, id = tiles[y]?.[x]) {
  return terrainConnections(tiles, x, y, id);
}

export function terrainVariant(x, y, id = 1, seed = 0) {
  return terrainChoice([], x, y, seed, id).variant;
}

const smoothEdge = (distance, band) => {
  const t = Math.min(1, distance / band);
  return 1 - t * t * (3 - 2 * t);
};

// The opposite outer pixels become identical, without depending on AI seam accuracy.
export function periodicPixels(source, width, height, band = 10, vertical = true) {
  const result = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const horizontal = smoothEdge(Math.min(x, width - x - 1), band) / 2;
    const v = vertical ? smoothEdge(Math.min(y, height - y - 1), band) / 2 : 0;
    const a = (y * width + x) * 4, b = (y * width + width - x - 1) * 4;
    const c = ((height - y - 1) * width + x) * 4, d = ((height - y - 1) * width + width - x - 1) * 4;
    for (let channel = 0; channel < 4; channel++) {
      result[a + channel] = (source[a + channel] * (1 - horizontal) + source[b + channel] * horizontal) * (1 - v) +
        (source[c + channel] * (1 - horizontal) + source[d + channel] * horizontal) * v;
    }
  }
  return result;
}

export function matchCodedTerrainEdges(source, profiles, width, height, codes, band = 10) {
  const result = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const distances = [y, width - x - 1, height - y - 1, x];
    const weights = distances.map(d => smoothEdge(d, band));
    const total = weights.reduce((a, b) => a + b, 0), weight = Math.max(...weights), p = (y * width + x) * 4;
    // All edge families share their corner patches; an unrelated third/fourth
    // neighbour can never disturb the endpoint of an otherwise valid seam.
    const corner = Math.min(x, width - x - 1) < band && Math.min(y, height - y - 1) < band;
    for (let channel = 0; channel < 4; channel++) {
      let shared = profiles[0][p + channel];
      if (total && !corner) shared = weights.reduce((value, w, side) => value + w * profiles[codes & (1 << side) ? 1 : 0][p + channel], 0) / total;
      result[p + channel] = source[p + channel] * (1 - weight) + shared * weight;
    }
  }
  return result;
}

function terrainCanvas(width = TERRAIN_SIZE, height = TERRAIN_SIZE) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; return canvas;
}

export async function loadTerrain(grassSprite) {
  const prepared = new Map();
  await Promise.all(Object.entries(TERRAIN_SHEETS).map(async ([material, path]) => {
    const terrain=structureProfile(material)?.terrain||{material};
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve; image.onerror = () => reject(new Error(`Blokvarianten konden niet worden geladen: ${path}`));
      image.src = assetURL(path);
    });
    const cells = [], width = image.naturalWidth / 5, height = image.naturalHeight / 4;
    for (let variant = 0; variant < TERRAIN_COUNT; variant++) {
      const canvas = terrainCanvas(), ctx = canvas.getContext('2d', { willReadFrequently: true });
      // Remove thin sheet separators without rescaling the game grid.
      const inset = terrain.material === 'ground' ? .02 : .006;
      ctx.drawImage(image, (variant % 5 + inset) * width, (Math.floor(variant / 5) + inset) * height,
        width * (1 - inset * 2), height * (1 - inset * 2), 0, 0, TERRAIN_SIZE, TERRAIN_SIZE);
      cells.push({ canvas, ctx, data: ctx.getImageData(0, 0, TERRAIN_SIZE, TERRAIN_SIZE) });
    }
    const profiles = [cells[0], cells[terrain.material === 'ground' ? 1 : 4]].map(cell => periodicPixels(cell.data.data, TERRAIN_SIZE, TERRAIN_SIZE));
    for (const [variant, cell] of cells.entries()) {
      cell.data.data.set(matchCodedTerrainEdges(cell.data.data, profiles, TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_VARIANTS[variant].codes));
      cell.ctx.putImageData(cell.data, 0, 0);
    }
    prepared.set(material, cells.map(cell => cell.canvas));
  }));
  if (grassSprite) {
    const b = grassSprite.bounds, strip = terrainCanvas(TERRAIN_SIZE, 27), ctx = strip.getContext('2d', { willReadFrequently: true });
    // Use the supplied grass illustration, without its standalone block outline.
    ctx.drawImage(grassSprite.surface, b.x + b.width * .17, b.y, b.width * .66, b.height * .31, 0, 0, TERRAIN_SIZE, 27);
    const data = ctx.getImageData(0, 0, TERRAIN_SIZE, 27);
    data.data.set(periodicPixels(data.data, TERRAIN_SIZE, 27, 10, false)); ctx.putImageData(data, 0, 0); grassStrip = strip;
  }
  terrainTextures.clear(); terrainCache.clear();
  for (const entry of prepared) terrainTextures.set(...entry);
}

export function terrainSprite(material, variant = 0, mask = 0) {
  const textures = terrainTextures.get(material); if (!textures) return null;
  variant = ((variant % TERRAIN_COUNT) + TERRAIN_COUNT) % TERRAIN_COUNT; mask &= 15;
  const key = `${material}:${variant}:${mask}`;
  if (terrainCache.has(key)) return terrainCache.get(key);
  const canvas = terrainCanvas(), ctx = canvas.getContext('2d'); ctx.drawImage(textures[variant], 0, 0);
  const ground = material === 'ground';
  // Borders appear only at exposed edges; connected tiles retain their common pixels.
  ctx.fillStyle = ground ? '#543428b0' : '#422823c0';
  if (!(mask & JOIN.up)) ctx.fillRect(0, 0, 96, ground ? 2 : 3);
  if (!(mask & JOIN.down)) ctx.fillRect(0, 92, 96, 4);
  if (!(mask & JOIN.left)) ctx.fillRect(0, 0, 3, 96);
  if (!(mask & JOIN.right)) ctx.fillRect(93, 0, 3, 96);
  if (ground && !(mask & JOIN.up) && grassStrip) ctx.drawImage(grassStrip, 0, 0);
  terrainCache.set(key, canvas); // Bounded: 2 materials x 20 variations x 16 neighbour masks.
  return canvas;
}

export function drawTerrain(ctx, material, x, y, size, { mask = 0, variant = terrainVariant(Math.floor(x / size), Math.floor(y / size), material === 'ground' ? 1 : 2) } = {}) {
  const sprite = terrainSprite(material, variant, mask); if (!sprite) return false;
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(sprite, x, y, size, size); ctx.restore(); return true;
}
