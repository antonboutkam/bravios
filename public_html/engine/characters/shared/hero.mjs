import { loadImageAsset } from '../../image-loader.mjs';
import { drawPinball } from '../../pinball.mjs';
import { CHARACTER_PROFILES } from '../roster.mjs';
import { drawCustomHero } from '../custom/maker.mjs';
import { characterPose, rollingPose } from './poses.mjs?v=walk-run-1';
import { characterSettings2D } from './settings.mjs?v=health-power-1';
import { hasLook, lookSprite, drawLook } from '../../look.mjs?v=9';
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
    const image = await loadImageAsset(path, `Portret · ${CHARACTER_NAMES[name]}`);
    const surface = document.createElement('canvas'); surface.width = image.naturalWidth; surface.height = image.naturalHeight;
    const context = surface.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, surface.width, surface.height);
    const bounds = spriteCutout(data.data, surface.width, surface.height);
    if (!bounds) throw new Error(`${CHARACTER_NAMES[name]} bevat geen zichtbaar personage.`);
    context.putImageData(data, 0, 0); characterSprites[name] = { surface, bounds };
  }));
}

// A small Bravios robot while character artwork is unavailable.
const HERO = [
  '       YY       ', '       YY       ', '    TTTTTTTT    ', '   TTTTTTTTTT   ',
  '   TTWTTTTWTT   ', '   TTTTTTTTTT   ', '   TTTYYYYTTT   ', '    TTTTTTTT    ',
  '  YY TTTTTT YY  ', '  YY TTWWTT YY  ', '  TT TWWWWT TT  ', '  TT TTWWTT TT  ',
  '  YY TTTTTT YY  ', '     TT  TT     ', '     TT  TT     ', '    YYY  YYY    '
];
export function hero(ctx, x, y, width = 32, facing = 1, shield = false, frame = 0, character = 'boaz', pose = {}) {
  if (drawCustomHero(ctx, pose.appearance, x, y, width, facing, pose)) return;
  if (character === 'pinball') {
    const radius = width * .44;
    drawPinball(ctx, x + width / 2, y + width - radius, radius, pose.reducedMotion ? 0 : pose.pinballAngle || 0);
    return;
  }
  const settings = characterSettings2D(character), renderScale = settings.renderScale ?? 1;
  if (hasLook()) {
    const poses = CHARACTER_PROFILES[character]?.views.side.poses || {};
    const state = characterPose(poses, pose);
    const sprite = lookSprite(`${character}:${state}`);
    if (sprite) {
      const height = width * 1.18 * renderScale, spriteWidth = height * sprite.bounds.width / sprite.bounds.height;
      if (rollingPose(poses, settings, pose)) {
        // Keep the normal pose size throughout a roll. Only the pivot height
        // changes to keep the rotated image above the floor. Walls stop travel.
        const angle = pose.reducedMotion ? 0 : (pose.moveDistance || 0) / 48 * Math.PI * 2;
        const support = (Math.abs(Math.sin(angle)) * spriteWidth + Math.abs(Math.cos(angle)) * height) / 2;
        ctx.save(); ctx.translate(x + width / 2, y + width - support); ctx.scale(facing, 1); ctx.rotate(angle);
        drawLook(ctx, `${character}:${state}`, -spriteWidth / 2, -height / 2, spriteWidth, height);
        ctx.restore(); return;
      }
      const animate = (state === 'run' || state === 'walk') && !pose.reducedMotion;
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
    const stride = (pose.walking || pose.running) && !pose.reducedMotion ? Math.sin(pose.time * 18) : 0;
    const squash = pose.landing ? Math.sin(pose.landing / .16 * Math.PI) * .12 : 0;
    const stretch = pose.airborne ? .045 : 0;
    const height = width * renderScale, drawWidth = height * bounds.width / bounds.height;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.translate(x + width / 2, y + width - Math.abs(stride) * .7);
    ctx.scale(facing * (1 + squash - stretch), 1 - squash + stretch);
    ctx.rotate((pose.walking || pose.running) ? .035 * facing : pose.airborne ? -.045 * facing : 0);
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
  const palette = { T: shield ? '#79bc86' : '#22acb5', W: '#a6f4df', Y: '#ffaf47' };
  HERO.forEach((row, yy) => [...row].forEach((key, xx) => {
    if (palette[key]) rect(ctx, palette[key], xx, yy + (yy > 11 && frame % 2 ? (xx < 8 ? -.7 : .7) : 0), 1, 1);
  })); ctx.restore();
}
