import { CHARACTER_PROFILES } from './characters/roster.mjs';
import { loadTerrain } from './terrain.mjs?v=3';
// Source sheets remain intact. Only the rendering layer knows these crop coordinates.
export const LOOK_SHEETS = {
  boaz: CHARACTER_PROFILES.boaz.views.side.asset, ravi: CHARACTER_PROFILES.ravi.views.side.asset,
  terrain: 'assets/look/terrain-sheet.png', rewards: 'assets/look/rewards-sheet.png',
  objects: 'assets/look/objects-sheet.png', scenery: 'assets/look/scenery-sheet.png',
  cat: 'assets/look/cat-sprites.png', dino: 'assets/look/dino-sprites.png',
  riders: 'assets/look/rider-sprites.png'
};
export const LOOK_ATLASES = {
  cat: { columns: 4, rows: 2, frames: ['cat:idle', 'cat:run0', 'cat:run1', 'cat:run2', 'cat:run3', 'cat:jump', 'cat:fall', 'cat:land'] },
  dino: { columns: 2, rows: 2, frames: ['dino:idle', 'dino:walk0', 'dino:walk1', 'dino:jump'] },
  riders: { columns: 2, rows: 1, frames: ['boaz:ride', 'ravi:ride'] }
};
export function atlasRegions(sheet, width, height) {
  const { columns, rows, frames } = LOOK_ATLASES[sheet];
  return Object.fromEntries(frames.map((name, index) => {
    const column = index % columns, row = Math.floor(index / columns);
    const x = Math.round(column * width / columns), y = Math.round(row * height / rows);
    return [name, [sheet, x, y, Math.round((column + 1) * width / columns) - x, Math.round((row + 1) * height / rows) - y, 'alpha']];
  }));
}
// Generated PNGs already have alpha. Keep light fur, clothing and fine whiskers.
export function alphaBounds(pixels, width, height) {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!pixels[(y * width + x) * 4 + 3]) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}
export const LOOK_REGIONS = {
  ground0: ['terrain', 30, 40, 168, 204], ground1: ['terrain', 201, 43, 156, 202],
  ground2: ['terrain', 359, 43, 147, 202], ground3: ['terrain', 506, 42, 151, 203],
  dirt: ['terrain', 666, 350, 111, 113, 'texture'],
  island: ['terrain', 846, 14, 354, 239], cloud: ['terrain', 628, 567, 320, 153],
  coin: ['rewards', 32, 222, 228, 230, 'coin'],
  spring: ['objects', 775, 120, 234, 185], spikes: ['objects', 45, 135, 286, 151],
  crate: ['objects', 1120, 151, 227, 174], flag: ['objects', 647, 473, 205, 209],
  mushroom: ['objects', 1231, 533, 187, 171],
  tree: ['scenery', 1021, 13, 394, 363], bush: ['scenery', 347, 137, 354, 238],
  flowers: ['scenery', 719, 204, 291, 170], rocks: ['scenery', 626, 441, 328, 198],
  sign: ['scenery', 25, 73, 289, 300], house: ['scenery', 326, 656, 635, 403]
};
for(const [character,profile] of Object.entries(CHARACTER_PROFILES)) {
  for(const [frame,bounds] of Object.entries(profile.views.side.frames))LOOK_REGIONS[`${character}:${frame}`]=[character,...bounds];
}
const lookSprites = new Map();
let lookReady = false;
export const hasLook = () => lookReady;
export const lookSprite = name => lookSprites.get(name);

export function sheetCutout(pixels, width, height) {
  const count = width * height, seen = new Uint8Array(count), queue = new Uint32Array(count);
  let head = 0, tail = 0;
  const visit = index => {
    if (seen[index]) return;
    seen[index] = 1;
    const p = index * 4, r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
    const pale = r > 208 && g > 208 && b > 208 || r > 170 && g > 175 && b > 180 && Math.max(r, g, b) - Math.min(r, g, b) < 75 || r > 150 && g > r + 10 && b > g + 5;
    if (!pixels[p + 3] || pale) { pixels[p + 3] = 0; queue[tail++] = index; }
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++], x = index % width;
    if (x) visit(index - 1); if (x < width - 1) visit(index + 1);
    if (index >= width) visit(index - width); if (index < count - width) visit(index + width);
  }
  // Detached labels, motion marks and shadows are not part of the sprite.
  seen.fill(0); let biggest = [];
  for (let start = 0; start < count; start++) {
    if (seen[start] || !pixels[start * 4 + 3]) continue;
    head = 0; tail = 1; queue[0] = start; seen[start] = 1;
    const add = index => { if (!seen[index] && pixels[index * 4 + 3]) { seen[index] = 1; queue[tail++] = index; } };
    while (head < tail) {
      const index = queue[head++], x = index % width;
      if (x) add(index - 1); if (x < width - 1) add(index + 1);
      if (index >= width) add(index - width); if (index < count - width) add(index + width);
    }
    if (tail > biggest.length) biggest = queue.slice(0, tail);
  }
  seen.fill(0); for (const index of biggest) seen[index] = 1;
  let left = width, top = height, right = -1, bottom = -1;
  for (let index = 0; index < count; index++) {
    if (!seen[index]) { pixels[index * 4 + 3] = 0; continue; }
    const x = index % width, y = Math.floor(index / width);
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export async function loadLook() {
  const sheets = Object.fromEntries(await Promise.all(Object.entries(LOOK_SHEETS).map(async ([name, path]) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve; img.onerror = () => reject(new Error(`Nieuwe afbeelding kon niet worden geladen: ${path}`));
      img.src = globalThis.braviosAssets?.[path] || new URL(path, import.meta.url).href;
    });
    return [name, img];
  })));
  const prepared = new Map();
  const regions = { ...LOOK_REGIONS };
  for (const sheet of Object.keys(LOOK_ATLASES)) Object.assign(regions, atlasRegions(sheet, sheets[sheet].naturalWidth, sheets[sheet].naturalHeight));
  for (const [name, [sheet, x, y, width, height, mode]] of Object.entries(regions)) {
    const image = sheets[sheet];
    if (x + width > image.naturalWidth || y + height > image.naturalHeight) throw new Error(`Uitsnede buiten afbeelding: ${name}`);
    const scale = Math.min(1, 384 / Math.max(width, height));
    const surface = document.createElement('canvas'); surface.width = Math.round(width * scale); surface.height = Math.round(height * scale);
    const c = surface.getContext('2d', { willReadFrequently: true });
    c.drawImage(image, x, y, width, height, 0, 0, surface.width, surface.height);
    const data = c.getImageData(0, 0, surface.width, surface.height);
    let bounds;
    if (mode === 'alpha') bounds = alphaBounds(data.data, surface.width, surface.height);
    else if (mode === 'texture') bounds = { x: 0, y: 0, width: surface.width, height: surface.height };
    else if (mode === 'coin') {
      const cx = surface.width / 2, cy = surface.height / 2;
      for (let yy = 0; yy < surface.height; yy++) for (let xx = 0; xx < surface.width; xx++) {
        const p = (yy * surface.width + xx) * 4;
        const grass = data.data[p + 1] > data.data[p] + 15 && data.data[p + 1] > data.data[p + 2] + 15;
        if (grass || ((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2 > 1) data.data[p + 3] = 0;
      }
      bounds = { x: 0, y: 0, width: surface.width, height: surface.height };
    } else bounds = sheetCutout(data.data, surface.width, surface.height);
    if (!bounds) throw new Error(`Lege uitsnede: ${name}`);
    c.putImageData(data, 0, 0); prepared.set(name, { surface, bounds });
  }
  await loadTerrain(prepared.get('ground0'));
  lookSprites.clear(); for (const [name, sprite] of prepared) lookSprites.set(name, sprite);
  lookReady = true;
}

export function drawLook(ctx, name, x, y, width, height) {
  const sprite = lookSprites.get(name); if (!sprite) return false;
  const b = sprite.bounds; ctx.save(); ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sprite.surface, b.x, b.y, b.width, b.height, x, y, width, height); ctx.restore(); return true;
}
export function lookPortrait(character) {
  const sprite = lookSprites.get(`${character}:idle`); if (!sprite) return null;
  const canvas = document.createElement('canvas'); canvas.width = 96; canvas.height = 96;
  const b = sprite.bounds, side = b.width, c = canvas.getContext('2d');
  c.drawImage(sprite.surface, b.x, b.y, side, side, 0, 0, 96, 96);
  return canvas.toDataURL('image/png');
}
