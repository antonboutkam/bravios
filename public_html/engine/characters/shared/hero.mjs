import { assetURL } from '../../paths.mjs';
import { CHARACTER_PROFILES } from '../roster.mjs';
import { drawCustomHero } from '../custom/maker.mjs';
import { characterPose } from './poses.mjs';
import { hasLook, lookSprite, drawLook } from '../../look.mjs?v=8';
export const CHARACTER_NAMES = Object.fromEntries(Object.entries(CHARACTER_PROFILES).map(([id,profile])=>[id,profile.name]));
const CHARACTER_IMAGES = Object.fromEntries(Object.entries(CHARACTER_PROFILES).map(([id,profile])=>[id,profile.portrait]));
const characterSprites = {};
function rect(ctx,color,x,y,w,h){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
export function spriteCutout(pixels, width, height) {
  const seen = new Uint8Array(width * height), queue = new Uint32Array(width * height);
  let head = 0, tail = 0;
  const visit = index => {
    if (seen[index]) return;
    seen[index] = 1;
    const i = index * 4, r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (pixels[i + 3] === 0 || (g > r + 25 && b > g + 20 && b > 115)) {
      pixels[i + 3] = 0; queue[tail++] = index;
    }
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++], x = index % width;
    if (x > 0) visit(index - 1);
    if (x < width - 1) visit(index + 1);
    if (index >= width) visit(index - width);
    if (index < width * (height - 1)) visit(index + width);
  }
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!pixels[(y * width + x) * 4 + 3]) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export async function loadCharacters() {
  await Promise.all(Object.entries(CHARACTER_IMAGES).map(async ([name, path]) => {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve; image.onerror = () => reject(new Error(`${CHARACTER_NAMES[name]} kon niet worden geladen.`)); image.src = assetURL(path);
    });
    const surface = document.createElement('canvas'); surface.width = image.naturalWidth; surface.height = image.naturalHeight;
    const context = surface.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, surface.width, surface.height);
    const bounds = spriteCutout(data.data, surface.width, surface.height);
    if (!bounds) throw new Error(`${CHARACTER_NAMES[name]} bevat geen zichtbaar personage.`);
    context.putImageData(data, 0, 0); characterSprites[name] = { surface, bounds };
  }));
}

const HERO = [
  '     RRRRR      ', '    RRRRRRRRR   ', '    HHHSSK      ', '   HSHSSSKSS    ',
  '   HSHHSSSKSS   ', '    HSSSSKKKK   ', '     SSSSSSS    ', '    RRBRRR      ',
  '   RRRBRRBRRR   ', '  RRRRBBBBRRRR  ', '  SSRBYBBYBRSS  ', '  SSSBBBBBBSSS  ',
  '    BBB  BBB    ', '   BBB    BBB   ', '   HHH    HHH   ', '  HHHH    HHHH  '
];
export function hero(ctx, x, y, width = 32, facing = 1, shield = false, frame = 0, character = 'boaz', pose = {}) {
  if (drawCustomHero(ctx, pose.appearance, x, y, width, facing, pose)) return;
  if (hasLook()) {
    const state = characterPose(CHARACTER_PROFILES[character]?.views.side.poses || {}, pose);
    const sprite = lookSprite(`${character}:${state}`);
    if (sprite) {
      const height = width * 1.18, spriteWidth = height * sprite.bounds.width / sprite.bounds.height;
      const animate = state === 'run' && !pose.reducedMotion;
      const bob = animate ? Math.abs(Math.sin((pose.time || 0) * 18)) * width * .035 : 0;
      ctx.save(); ctx.translate(x + width / 2, y + width - bob); ctx.scale(facing, 1);
      if (animate) ctx.rotate(Math.sin((pose.time || 0) * 18) * .025);
      drawLook(ctx, `${character}:${state}`, -spriteWidth / 2, -height, spriteWidth, height);
      ctx.restore(); return;
    }
  }
  const sprite = characterSprites[character];
  if (sprite) {
    const { bounds, surface } = sprite;
    const stride = pose.running && !pose.reducedMotion ? Math.sin(pose.time * 18) : 0;
    const squash = pose.landing ? Math.sin(pose.landing / .16 * Math.PI) * .12 : 0;
    const stretch = pose.airborne ? .045 : 0;
    const height = width, drawWidth = height * bounds.width / bounds.height;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.translate(x + width / 2, y + width - Math.abs(stride) * .7);
    ctx.scale(facing * (1 + squash - stretch), 1 - squash + stretch);
    ctx.rotate(pose.running ? .035 * facing : pose.airborne ? -.045 * facing : 0);
    // Animate the two legs independently while retaining the supplied character art.
    const split = .70, legH = bounds.height * (1 - split);
    for (let leg = 0; leg < 2; leg++) {
      ctx.save(); const pivot = (leg ? .25 : -.25) * drawWidth;
      ctx.translate(pivot, -height * (1 - split)); ctx.rotate(stride * (leg ? -.19 : .19));
      ctx.drawImage(surface, bounds.x + leg * bounds.width / 2, bounds.y + bounds.height * split, bounds.width / 2, legH, -drawWidth / 4, 0, drawWidth / 2, height * (1 - split));
      ctx.restore();
    }
    ctx.drawImage(surface, bounds.x, bounds.y, bounds.width, bounds.height * split, -drawWidth / 2, -height, drawWidth, height * split + .5);
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(x + (facing < 0 ? width : 0), y); ctx.scale(facing * width / 16, width / 16);
  const palette = { R: shield ? '#79bc86' : '#e27c67', H: '#5e4c43', S: '#f2c6a0', K: '#443d3e', B: '#637fa0', Y: '#f8d273' };
  HERO.forEach((row, yy) => [...row].forEach((key, xx) => {
    if (palette[key]) rect(ctx, palette[key], xx, yy + (yy > 11 && frame % 2 ? (xx < 8 ? -.7 : .7) : 0), 1, 1);
  })); ctx.restore();
}
