import { drawEnemySprite } from './enemies/sprites.mjs';
import { hero, CHARACTER_NAMES } from './characters/shared/hero.mjs';
export { hero, CHARACTER_NAMES, spriteCutout, loadCharacters } from './characters/shared/hero.mjs';
import { createFirebars, drawFirebar, FIREBAR_TILE, FIREBAR_REACH } from './firebars.mjs?v=1';
import { drawMonsterArt } from './monster-art.mjs?v=1';
import { drawDepthBackground } from './depth-backgrounds.mjs?v=9';
import { createSwingPlatforms, vinePoint } from './swing-platforms.mjs?v=1';
import { drawWonderFoe, drawWonderArena, drawWonderHazard } from './wonder-foe-art.mjs?v=1';
import { drawWonderMagic, drawWonderBackdrop } from './wonder-magic.mjs?v=14';
import { isWaterTheme, isSeaEnemy, isSeaMount, SEA_KINDS, SEA_MOUNTS } from './sea-life.mjs?v=4';
import { drawSeaCreature, drawSeaIcon, drawSeaEffects } from './sea-art.mjs?v=36';
import { drawEnemyWings, drawEnemyFront } from './enemy-design-art.mjs?v=36';
import { characterSurface } from './character-maker.mjs?v=3';
import { createMechanisms } from './mechanisms.mjs?v=2';
import { TILE, THEMES, chainBall, PIPE_TYPES, frogTongue, worldTheme, caveLinks, pipeConnections, QUESTION_REWARDS, terrainAppearance, visualFacing, rocketCountdown } from './engine.mjs?v=44';
import { hasLook, lookSprite, drawLook } from './look.mjs?v=8';
import { hasTerrain, drawTerrain, terrainVariant, JOIN } from './terrain.mjs?v=3';

const spriteCache = new Map();
function cachedSprite(ctx, key, x, y, paint) {
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') { paint(ctx, x, y); return; }
  let sprite = spriteCache.get(key);
  if (!sprite) {
    sprite = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(40, 40) : document.createElement('canvas');
    sprite.width = 40; sprite.height = 40;
    paint(sprite.getContext('2d'), 4, 4);
    if (spriteCache.size >= 512) spriteCache.clear();
    spriteCache.set(key, sprite);
  }
  ctx.drawImage(sprite, x - 4, y - 4);
}
export const assetURL = path => globalThis.braviosAssets?.[path] || path;

export const CRAZY_BACKGROUND_ASSET = 'assets/look/crazy-backgrounds.png';
let crazyBackgroundImage = null;
export async function loadCrazyBackgrounds() {
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('De gekke achtergronden konden niet worden geladen.'));
    image.src = globalThis.braviosAssets?.[CRAZY_BACKGROUND_ASSET] || new URL(CRAZY_BACKGROUND_ASSET, import.meta.url).href;
  });
  crazyBackgroundImage = image;
}
function drawCrazyBackground(ctx, scene, viewport, width, height) {
  if (!crazyBackgroundImage) return;
  const panel = ['teapots', 'candy', 'space', 'jellyfish'].indexOf(scene);
  if (panel < 0) return;
  const left = viewport?.left || 0, top = viewport?.top || 0;
  const w = (viewport?.right ?? width) - left, h = (viewport?.bottom ?? height) - top;
  const sw = crazyBackgroundImage.naturalWidth / 2, sh = crazyBackgroundImage.naturalHeight / 2;
  const scale = Math.max(w / sw, h / sh), dw = sw * scale, dh = sh * scale;
  ctx.drawImage(crazyBackgroundImage, panel % 2 * sw, Math.floor(panel / 2) * sh, sw, sh, left + (w - dw) / 2, top + (h - dh) / 2, dw, dh);
  // Slight atmospheric veil keeps platforms and the player legible.
  rect(ctx, '#28325525', left, top, w, h);
}
function drawFartSky(ctx, game, viewport, width, height) {
  const remaining = Math.max(0, ...(game?.players || (game ? [game.player] : [])).filter(p => !p.respawn).map(p => p.rainbowFart || 0));
  if (!remaining) return;
  const left = viewport?.left || 0, top = viewport?.top || 0;
  const w = (viewport?.right ?? width) - left, h = (viewport?.bottom ?? height) - top;
  ctx.save(); ctx.globalAlpha = Math.min(.48, remaining / 2);
  const radius = Math.min(w * .43, h * .78), band = Math.max(5, radius * .035);
  RAINBOW_COLORS.forEach((color, i) => {
    ctx.strokeStyle = color; ctx.lineWidth = band + 1;
    ctx.beginPath(); ctx.arc(left + w / 2, top + h * .82, radius - i * band, Math.PI, Math.PI * 2); ctx.stroke();
  });
  ctx.restore();
}
function drawFartTrail(ctx, p) {
  if (!(p.rainbowFart > 0) || !p.fartTrail?.length || p.respawn) return;
  const points = p.fartTrail;
  ctx.save(); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  RAINBOW_COLORS.forEach((color, band) => {
    ctx.strokeStyle = color;
    // Age fades the tail; positions match the collision path in the engine.
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[i + 1] || a;
      ctx.globalAlpha = Math.min(1, a.life / .5, p.rainbowFart) * .8;
      ctx.beginPath(); ctx.moveTo(a.x, a.y - 15 + band * 6);
      ctx.lineTo(b.x + (a === b ? .1 : 0), b.y - 15 + band * 6); ctx.stroke();
    }
  });
  ctx.restore();
}

// Only remove blue pixels connected to the image border, so blue clothing stays intact.
export const COLORS = {
  castle: { sky: ['#101017', '#1e1d27'], far: '#25242e', hill: '#302e39', bush: '#373440', grass: '#696675', dirt: '#53505e', shade: '#35323f', cloud: '#585462', sun: '#e5b778' },
  moon: { sky: ['#070b24', '#242d4e'], far: '#69748b', hill: '#8993a4', bush: '#687387', grass: '#c6ccd5', dirt: '#929bab', shade: '#737d90', cloud: '#ddd', sun: '#82c8ed' },
  grass: { sky: ['#7bc8dc', '#f3f4cc'], far: '#a3d4be', hill: '#69af8c', bush: '#37896e', grass: '#6baf60', dirt: '#b69370', shade: '#937450', cloud: '#fffdf0', sun: '#fff6bb' },
  sunset: { sky: ['#ddb1ad', '#f9dfb8'], far: '#d7b4a4', hill: '#c39990', bush: '#ad827e', grass: '#bb927b', dirt: '#aa8772', shade: '#917361', cloud: '#fff0df', sun: '#ffe4a0' },
  night: { sky: ['#333c64', '#67738f'], far: '#697998', hill: '#596d8a', bush: '#445c75', grass: '#819c94', dirt: '#7c858b', shade: '#636d79', cloud: '#8793ad', sun: '#f0e7bd' },
  winter: { sky: ['#a9cde4', '#eef7fa'], far: '#dbe8f1', hill: '#bdcfdd', bush: '#598c89', grass: '#f6fbff', dirt: '#93aabd', shade: '#71889e', cloud: '#fffefe', sun: '#fff3ce' },
  'underwater-night': { sky:['#040c24','#102941'], far:'#17394c',hill:'#1f4154',bush:'#84d4c6',grass:'#9ab7bd',dirt:'#4d6778',shade:'#32465d',cloud:'#b9ffff',sun:'#d9fbff' },
  underwater: { sky: ['#78d8e0', '#185b91'], far: '#367f9f', hill: '#286780', bush: '#2db39f', grass: '#e4d3a0', dirt: '#b49c76', shade: '#897d69', cloud: '#a8edf0', sun: '#d6f9ec' }
};
function rect(ctx, color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function oval(ctx, color, x, y, rx, ry) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
export function background(ctx, width, height, theme = 'grass', { left = 0, right = width, camera = 0, reducedMotion = false, depthLayers = true, depthPanelCache = null } = {}) {
  drawDepthBackground(ctx, height, theme, { left, right, camera, reducedMotion, layers: depthLayers, panelCache: depthPanelCache });
}
export function drawRobot(ctx, x, y, charge = 0, facing = 1, time = 0, angry = false) {
  drawMonsterArt(ctx,'robot',x,y,{charge,facing,time,variant:angry?'angry':''});
}
export function drawFrog(ctx, x, y, facing = 1, crawling = false, time = 0, red = false) {
  drawMonsterArt(ctx,'frog',x,y,{facing,time,moving:crawling,variant:red?'red':''});
}
export function drawBubble(ctx, x, y, radius) {
  ctx.save(); ctx.fillStyle = '#b8edff25'; ctx.strokeStyle = '#b8efffc9'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#f4bdebd9'; ctx.beginPath(); ctx.arc(x, y, radius - 2, .2, 1.6); ctx.stroke();
  ctx.strokeStyle = '#fffaf6'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, radius * .73, 3.6, 4.65); ctx.stroke();
  ctx.restore();
}
export function drawBubbleGun(ctx, x, y, facing = 1, size = 28) {
  ctx.save(); ctx.translate(x, y); ctx.scale(facing * size / 28, size / 28);
  rect(ctx, '#3b788b', -10, -5, 18, 10); rect(ctx, '#84dce3', -8, -6, 15, 5);
  rect(ctx, '#edb5d9', -7, 3, 6, 10); rect(ctx, '#976eb1', -7, 10, 6, 3);
  rect(ctx, '#e3d6f4', 7, -4, 6, 8); rect(ctx, '#3e687e', 10, -2, 4, 4);
  drawBubble(ctx, -5, -10, 5); ctx.restore();
}
export function drawReverseReward(ctx, x, y, time = 0) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = '#b7dbea'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const width = 11 - i * 1.7, yy = -10 + i * 4;
    ctx.beginPath(); ctx.ellipse(Math.sin(time * 3 + i) * 1.2, yy, width, 2.4, 0, 0, Math.PI * 1.8); ctx.stroke();
  }
  const arrow = (direction, yy, color) => {
    ctx.save(); ctx.scale(direction, 1); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-12, yy); ctx.lineTo(12, yy); ctx.lineTo(8, yy - 4); ctx.moveTo(12, yy); ctx.lineTo(8, yy + 4); ctx.stroke(); ctx.restore();
  };
  arrow(1, -7, '#ffe286'); arrow(-1, 3, '#e9b3ff'); ctx.restore();
}
function drawHeroIntro(ctx, remaining, character, viewport, width, height, reducedMotion, circus = false, appearance = null) {
  if (!(remaining > 0)) return;
  const left = viewport?.left || 0, top = viewport?.top || 0;
  const w = (viewport?.right ?? width) - left, h = (viewport?.bottom ?? height) - top;
  const progress = Math.max(0, Math.min(1, 1 - remaining / 2.4));
  const size = Math.min(w * .54, h * .38, 180), cx = left + w / 2, cy = top + h * .43;
  const scale = reducedMotion ? 1 : .88 + Math.sin(Math.min(1, progress * 4) * Math.PI / 2) * .12;
  ctx.save(); rect(ctx, '#17243b88', left, top, w, h);
  ctx.translate(cx, cy); ctx.scale(scale, scale);
  if (circus) {
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12; ctx.fillStyle = i % 2 ? '#fff0c3' : '#c85267';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, size * .67, a, a + Math.PI / 12); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12; ctx.fillStyle = '#ffe9a2'; ctx.beginPath(); ctx.arc(Math.cos(a) * size * .66, Math.sin(a) * size * .66, size * .014, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = circus ? '#fff5d9' : '#f8edff'; ctx.strokeStyle = circus ? '#e3b54e' : '#a3e8ec'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, size * .57, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  const custom = characterSurface(appearance);
  const sprite = lookSprite(`${character}:idle`);
  if (custom) {
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, size * .52, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(custom, 64, 0, 192, 192, -size / 2, -size / 2, size, size); ctx.restore();
  } else if (sprite) {
    const b = sprite.bounds, side = b.width;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, size * .52, 0, Math.PI * 2); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sprite.surface, b.x, b.y, side, side, -size / 2, -size / 2, size, size); ctx.restore();
  } else hero(ctx, -size / 2, -size / 2, size, 1, false, 0, character);
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7 + (reducedMotion ? 0 : progress * Math.PI * 1.5);
    const xx = Math.cos(angle) * size * .72, yy = Math.sin(angle) * size * .62;
    ctx.save(); ctx.translate(xx, yy); if (!reducedMotion) ctx.rotate(angle);
    ctx.fillStyle = i % 2 ? '#ffe58e' : '#fff7cf'; ctx.strokeStyle = '#b08845'; ctx.lineWidth = .8;
    ctx.beginPath(); for (let j = 0; j < 10; j++) {
      const r = size * (j % 2 ? .023 : .055), a = j * Math.PI / 5 - Math.PI / 2;
      if (j) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#fff8df'; ctx.textAlign = 'center'; ctx.font = `bold ${Math.max(10, size * .14)}px sans-serif`;
  ctx.fillText(circus ? 'DE VUURPIJL!' : 'ACHTERSTEVOREN!', 0, size * .91);
  ctx.font = `${Math.max(8, size * .085)}px sans-serif`; ctx.fillText(circus ? 'Een echte circusheld!' : 'Terug naar de oude start!', 0, size * 1.09);
  ctx.restore();
}
export function drawReverseIntro(ctx, game, viewport, width, height, character = 'boaz', reducedMotion = false) {
  drawHeroIntro(ctx, game?.reverseIntro, game?.reverseCharacter || character, viewport, width, height, reducedMotion, false, (game?.players?.find(p => p.character === (game?.reverseCharacter || character)) || game?.player)?.appearance);
}
export function drawRocketIntro(ctx, game, viewport, width, height, character = 'boaz', reducedMotion = false) {
  drawHeroIntro(ctx, game?.rocketIntro, game?.rocketCharacter || character, viewport, width, height, reducedMotion, true, (game?.players?.find(p => p.character === (game?.rocketCharacter || character)) || game?.player)?.appearance);
}
export function drawRocket(ctx, x, y, { firing = false, fuse = null, direction = 1, time = 0, reducedMotion = false, size = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size, size); if (firing) ctx.rotate(direction * .06);
  rect(ctx, '#916943', -1, 0, 2, 34);
  ctx.fillStyle = '#d45c6b'; ctx.strokeStyle = '#77536d'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-7, -15); ctx.lineTo(0, -27); ctx.lineTo(7, -15); ctx.closePath(); ctx.fill(); ctx.stroke();
  rect(ctx, '#fff0bd', -6, -15, 12, 27); rect(ctx, '#d45c6b', -6, -12, 12, 5); rect(ctx, '#d45c6b', -6, -1, 12, 5);
  rect(ctx, '#e3b54e', -7, 10, 14, 3); rect(ctx, '#ffffff80', -5, -14, 2, 25);
  if (fuse !== null && !firing) {
    const left = Math.max(0, Math.min(1, fuse / 5.6)), xx = -6 - left * 12, yy = 12 + left * 13;
    ctx.strokeStyle = '#685047'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, 11); ctx.quadraticCurveTo(-13, 14, xx, yy); ctx.stroke();
    const flare = reducedMotion ? 2.5 : 2.5 + Math.sin(time * 27) * .8;
    ctx.fillStyle = '#ffb05e'; ctx.beginPath(); ctx.arc(xx, yy, flare + 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff4a5'; ctx.beginPath(); ctx.arc(xx, yy, flare, 0, Math.PI * 2); ctx.fill();
  }
  if (firing) {
    const flame = reducedMotion ? 19 : 19 + Math.sin(time * 31) * 4;
    ctx.fillStyle = '#ee8d4d'; ctx.beginPath(); ctx.moveTo(-6, 13); ctx.quadraticCurveTo(-7, 22, 0, 13 + flame); ctx.quadraticCurveTo(7, 22, 6, 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff0aa'; ctx.beginPath(); ctx.moveTo(-3, 13); ctx.lineTo(0, 23); ctx.lineTo(3, 13); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawPlayerRocket(ctx, p, facing, time, reducedMotion) {
  const x = p.x + p.w / 2 - facing * 13, y = p.y + p.h * .43;
  drawRocket(ctx, x, y, { firing: p.rocketStage === 'flight', fuse: p.rocketStage === 'fuse' ? p.rocketFuse : null, direction: p.rocketDirection, time, reducedMotion });
  ctx.strokeStyle = '#916943'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4, y + 3); ctx.lineTo(p.x + p.w / 2, p.y + p.h * .62); ctx.stroke();
  if (p.rocketStage === 'fuse') {
    const cx = p.x + p.w / 2 + facing * 32, cy = p.y - 17;
    ctx.save(); ctx.fillStyle = '#fff4d1'; ctx.strokeStyle = '#d45c6b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 21px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#754c67';
    ctx.fillText(String(rocketCountdown(p)), cx, cy + 1); ctx.restore();
  }
}
export function drawFireball(ctx, x, y, size = 10, time = 0, ice = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 10, size / 10);
  rect(ctx, ice ? '#588dc4' : '#c97546', 0, 2, 10, 6); rect(ctx, ice ? '#8adced' : '#f1a84e', 2, 0, 6, 10); rect(ctx, ice ? '#d9faff' : '#ffe59a', 3, 2, 5, 5);
  rect(ctx, '#fff5d1', 4, 2 + Math.floor(time * 8) % 2, 2, 3); ctx.restore();
}
const RAINBOW_COLORS = ['#ff637d', '#ffab55', '#ffe479', '#75df98', '#66cdf5', '#b48aff'];
export function creatureFrame(kind, { airborne = false, moving = false, vy = 0, time = 0, landing = 0, reducedMotion = false } = {}) {
  if (kind === 'cat') return landing > .04 ? 'land' : airborne ? (vy > 0 ? 'fall' : 'jump') : moving && !reducedMotion ? `run${Math.floor(time * 10) % 4}` : 'idle';
  return airborne ? 'jump' : moving && !reducedMotion ? `walk${Math.floor(time * 8) % 2}` : 'idle';
}
export function drawCat(ctx, x, y, facing = 1, frame = 0, instinct = false, pose = {}) {
  if (hasLook()) {
    const state = creatureFrame('cat', pose), sprite = lookSprite(`cat:${state}`);
    const height = 30, width = height * sprite.bounds.width / sprite.bounds.height;
    ctx.save(); ctx.translate(x + 16, y + 32); ctx.scale(facing, 1);
    drawLook(ctx, `cat:${state}`, -width / 2, -height, width, height);
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(x + (facing < 0 ? 32 : 0), y); ctx.scale(facing, 1);
  const fur = instinct ? '#ffe396' : '#e3b77b';
  rect(ctx, '#b47d53', 2, 19, 5, 8); rect(ctx, fur, 3, 23, 9, 5);
  rect(ctx, fur, 9, 15, 17, 13); rect(ctx, '#f8deb0', 13, 20, 11, 7);
  rect(ctx, fur, 11, 6, 19, 15); rect(ctx, fur, 11, 1, 6, 8); rect(ctx, fur, 24, 1, 6, 8);
  rect(ctx, '#df9ca0', 13, 3, 3, 5); rect(ctx, '#df9ca0', 25, 3, 3, 5);
  rect(ctx, '#526949', 16, 10, 3, 5); rect(ctx, '#526949', 26, 10, 3, 5);
  rect(ctx, '#80584e', 21, 16, 3, 2); rect(ctx, '#f9edcd', 8, 16, 9, 1); rect(ctx, '#f9edcd', 25, 17, 7, 1);
  rect(ctx, '#b96578', 11, 21, 17, 2); rect(ctx, '#f6d36c', 20, 22, 4, 4);
  const shift = frame % 2 ? 2 : 0;
  rect(ctx, '#b47d53', 10 + shift, 28, 6, 4); rect(ctx, '#b47d53', 23 - shift, 28, 6, 4);
  ctx.restore();
}
export function dinoPlacement(dino, state = 'idle') {
  const sprite = lookSprite(`dino:${state}`);
  const height = 32, width = height * (sprite ? sprite.bounds.width / sprite.bounds.height : 1.1);
  const x = dino.x + dino.w / 2, bottom = dino.y + dino.h;
  return { x, bottom, width, height, seatX: x - width * .04 * dino.facing, seatY: bottom - height * (state === 'jump' ? .48 : .49) };
}
export function drawDino(ctx, dino, pose = {}) {
  if (dino.kind === 'quad') { drawTile(ctx, 74, dino.x - 2, dino.y - 8); return; }
  if (!hasLook()) {
    ctx.save(); ctx.translate(dino.x - 2 + (dino.facing < 0 ? 32 : 0), dino.y - 8); ctx.scale(dino.facing, 1);
    drawTile(ctx, 16, 0, 0, TILE, 'grass', { time: pose.time }); ctx.restore(); return;
  }
  const state = creatureFrame('dino', pose), art = dinoPlacement(dino, state);
  ctx.save(); ctx.translate(art.x, art.bottom); ctx.scale(dino.facing, 1);
  drawLook(ctx, `dino:${state}`, -art.width / 2, -art.height, art.width, art.height);
  ctx.restore();
}
export function drawRider(ctx, dino, character, cat = false, pose = {}) {
  if (dino.kind === 'quad') { hero(ctx, dino.x - 2, dino.y - 27, 32, dino.facing, false, 0, character, pose); return; }
  if (!cat && pose.appearance) {
    hero(ctx, dino.x - 2, dino.y - 24, 32, dino.facing, false, 0, character, { ...pose, running: false }); return;
  }
  const state = creatureFrame('dino', pose), seat = dinoPlacement(dino, state);
  const name = cat ? 'cat:idle' : `${character}:ride`, sprite = lookSprite(name);
  if (!sprite) { hero(ctx, dino.x - 2, seat.seatY - 32, 32, dino.facing, false, 0, character); return; }
  const height = cat ? 24 : 31, width = height * sprite.bounds.width / sprite.bounds.height;
  ctx.save(); ctx.translate(seat.seatX, seat.seatY); ctx.scale(dino.facing, 1);
  // Seated hips touch the saddle; bent knees and boots hang down its sides.
  drawLook(ctx, name, -width * (cat ? .52 : .43), -height * (cat ? 1 : .70), width, height);
  ctx.restore();
}
export function drawCrusher(ctx, x, y, size = TILE, phase = 'waiting') {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
  ctx.fillStyle = '#d8e0e4'; ctx.strokeStyle = '#3c4352'; ctx.lineWidth = 1.3;
  for (const turn of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    ctx.save(); ctx.translate(16, 16); ctx.rotate(turn);
    for (const xx of [-10, 0, 10]) { ctx.beginPath(); ctx.moveTo(xx - 4, -11); ctx.lineTo(xx, -16); ctx.lineTo(xx + 4, -11); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }
  ctx.fillStyle = '#747e8e'; ctx.fillRect(4, 4, 24, 24); ctx.strokeRect(4, 4, 24, 24);
  ctx.fillStyle = '#aeb8c5'; ctx.fillRect(6, 6, 20, 3); ctx.fillRect(6, 9, 3, 13); ctx.fillStyle = '#515a6c'; ctx.fillRect(9, 25, 17, 2);
  ctx.fillStyle = phase === 'falling' ? '#ffd1a4' : '#f5e8d4'; ctx.fillRect(9, 12, 5, 5); ctx.fillRect(18, 12, 5, 5);
  ctx.fillStyle = '#292f3f'; ctx.fillRect(12, 13, 2, 4); ctx.fillRect(18, 13, 2, 4);
  ctx.strokeStyle = '#292f3f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(8, 10); ctx.lineTo(14, 12); ctx.moveTo(18, 12); ctx.lineTo(24, 10); ctx.stroke();
  ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(11, 23); ctx.lineTo(13, 20); ctx.lineTo(19, 20); ctx.lineTo(21, 23); ctx.stroke();
  ctx.strokeStyle = '#596274'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(24, 7); ctx.lineTo(22, 9); ctx.lineTo(24, 11); ctx.stroke();
  ctx.restore();
}
// A distinct silhouette for the castle guardian; body matches its collision box.
function drawCastleBoss(ctx, enemy, facing, time) {
  ctx.save(); ctx.translate(enemy.x + enemy.w / 2, enemy.y); ctx.scale(facing, 1);
  const final = enemy.maxHp === 9, body = final ? '#a14d48' : '#655a88';
  const step = Math.sin(time * 7) * 2;
  oval(ctx, '#29212f', 0, 46, 29, 4);
  oval(ctx, '#b49778', -16, 43 + step, 10, 5); oval(ctx, '#b49778', 16, 43 - step, 10, 5);
  oval(ctx, body, 0, 27, 26, 21); oval(ctx, '#bb9772', 4, 32, 16, 13);
  for (const x of [-18, 18]) {
    ctx.fillStyle = '#eee0be'; ctx.beginPath(); ctx.moveTo(x - 7, 13); ctx.lineTo(x * 1.4, -9); ctx.lineTo(x + 7, 10); ctx.fill();
  }
  oval(ctx, body, 0, 13, 24, 17);
  oval(ctx, '#271d2c', -10, 12, 8, 6); oval(ctx, '#271d2c', 10, 12, 8, 6);
  oval(ctx, '#ffe28b', -8, 12, 4, 3); oval(ctx, '#ffe28b', 12, 12, 4, 3);
  rect(ctx, '#1a1520', -14, 23, 31, 9);
  for (const x of [-11, -2, 7]) {
    ctx.fillStyle = '#fff0cf'; ctx.beginPath(); ctx.moveTo(x, 23); ctx.lineTo(x + 3, 30); ctx.lineTo(x + 6, 23); ctx.fill();
  }
  ctx.restore();
  rect(ctx, '#151019', enemy.x - 9, enemy.y - 23, enemy.w + 18, 8);
  rect(ctx, '#ec795d', enemy.x - 7, enemy.y - 21, (enemy.w + 14) * Math.max(0, enemy.hp) / enemy.maxHp, 4);
  ctx.save(); ctx.fillStyle = '#ffe5b3'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(final ? 'Lavakoning' : 'Kasteelmonster', enemy.x + enemy.w / 2, enemy.y - 29); ctx.restore();
}

export function drawTurtle(ctx, x, y, kind = 'turtle', phase = '', facing = 1, time = 0) {
  drawMonsterArt(ctx,kind,x,y,{phase,facing,time,moving:!['shell','fallen'].includes(phase)});
}
export function drawMushroomHelper(ctx, x, y, { time = 0, reducedMotion = false, given = false } = {}) {
  const wave = reducedMotion ? 0 : Math.floor(time * 3) % 2;
  cachedSprite(ctx, `mushroom-helper:${wave}:${given}`, x, y, (c, xx, yy) => {
    c.save(); c.translate(xx, yy);
    oval(c, '#765c49', 10, 31, 6, 2); oval(c, '#765c49', 23, 31, 6, 2);
    rect(c, '#fff4d9', 9, 25, 15, 5);
    oval(c, '#f4d6ad', 16, 18, 8, 8);
    oval(c, given ? '#60afa5' : '#5a9bc9', 16, 9, 15, 9);
    oval(c, '#fff5df', 8, 8, 4, 5); oval(c, '#fff5df', 23, 7, 4.5, 5); oval(c, '#fff5df', 16, 3, 3, 2);
    rect(c, '#34495d', 11, 17, 2, 3); rect(c, '#34495d', 20, 17, 2, 3);
    c.strokeStyle = '#a66c56'; c.lineWidth = 1;
    c.beginPath(); c.arc(16, 20, 3, .15, Math.PI - .15); c.stroke();
    rect(c, '#659aba', 9, 24, 15, 5); rect(c, '#efcc82', 14, 25, 4, 4);
    oval(c, '#f4d6ad', 5, 24, 3, 3); oval(c, '#f4d6ad', 28, 21 - wave * 2, 3, 3);
    rect(c, given ? '#d6deb3' : '#e9a3bf', 7, 25, 8, 6); rect(c, '#ffe8a2', 10, 25, 2, 6); rect(c, '#ffe8a2', 7, 27, 8, 1);
    c.restore();
  });
}
export function drawParachute(ctx, p, character = 'boaz', time = 0, reducedMotion = false) {
  const center = p.x + p.w / 2, bottom = p.y - 33;
  const sway = reducedMotion ? 0 : Math.sin(time * 2.6) * 2;
  ctx.save(); ctx.translate(center, bottom); ctx.rotate(sway * .006);
  ctx.strokeStyle = '#f8f1d6'; ctx.lineWidth = 1.2;
  for (const x of [-34, -12, 12, 34]) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x < 0 ? -8 : 8, 33 + p.h * .4); ctx.stroke();
  }
  const accent = character === 'ravi' ? '#e68672' : '#6daecb';
  ctx.fillStyle = accent; ctx.strokeStyle = '#456479'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-36, 0); ctx.bezierCurveTo(-32, -34, 32, -34, 36, 0);
  ctx.quadraticCurveTo(24, -6, 12, 0); ctx.quadraticCurveTo(0, -6, -12, 0); ctx.quadraticCurveTo(-24, -6, -36, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff0bb'; ctx.beginPath(); ctx.moveTo(-12, -1);
  ctx.bezierCurveTo(-12, -15, -7, -25, 0, -25); ctx.bezierCurveTo(7, -25, 12, -15, 12, -1);
  ctx.quadraticCurveTo(0, -6, -12, -1); ctx.fill();
  ctx.strokeStyle = '#ffffff75'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-30, -5); ctx.bezierCurveTo(-24, -19, -14, -24, -4, -25); ctx.stroke();
  ctx.restore();
}
export function drawShellHelmet(ctx, p, pose = {}) {
  let center = p.x + p.w / 2, head = p.y + (p.cat ? -2 : -8);
  if (p.mounted && hasLook()) {
    const seat = dinoPlacement(p.mounted, creatureFrame('dino', pose));
    center = seat.seatX; head = seat.seatY - (p.cat ? 24 : 31 * .70);
  } else if (p.mounted) head = dinoPlacement(p.mounted).seatY - 38;
  // The cat's head sits ahead of its body, unlike the upright players.
  if (p.cat) { center += p.facing * 8; head += 3; }
  const bob = !p.mounted && !p.cat && pose.moving && !pose.reducedMotion ? Math.abs(Math.sin(pose.time * 18)) * 32 * .035 : 0;
  cachedSprite(ctx, 'shell-helmet', center - 16, head - 28 - bob, (c, x, y) => {
    c.save(); c.translate(x, y);
    c.fillStyle = '#608b65'; c.strokeStyle = '#315c45'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(3, 29); c.quadraticCurveTo(3, 15, 16, 15);
    c.quadraticCurveTo(29, 15, 29, 29); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#a5bb79'; c.beginPath(); c.ellipse(12, 20, 6, 2.2, -.3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#416a51'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(16, 16); c.lineTo(12, 22); c.lineTo(16, 28);
    c.moveTo(12, 22); c.lineTo(5, 24); c.moveTo(12, 22); c.lineTo(23, 22); c.lineTo(27, 27); c.stroke();
    rect(c, '#d7cc9a', 2, 28, 28, 3); rect(c, '#f1e3b9', 4, 28, 24, 1);
    c.restore();
  });
}
export function drawDragon(ctx, x, y, facing = 1, time = 0) {
  drawMonsterArt(ctx,'dragon',x,y,{facing,time});
}
export function drawPlant(ctx, x, y, time = 0) {
  drawMonsterArt(ctx,'plant',x,y,{time,moving:false});
}
export function drawBomb(ctx, x, y, fuse = 0, time = 0) {
  drawMonsterArt(ctx,'bomb',x,y,{fuse,time});
}
function drawCentipede(ctx, x, y, width, phase = 'walk', facing = 1, time = 0) {
  const count = Math.max(2, Math.round(width / 24));
  for (let i = 0; i < count; i++) {
    const cx = x + (i + .5) * width / count, head = facing > 0 ? i === count - 1 : i === 0;
    const kick = Math.sin(time * (phase === 'angry' ? 24 : 8) + i) * 3;
    for (const side of [-1, 1]) { ctx.strokeStyle = '#594738'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + side * 5, y + 15); ctx.lineTo(cx + side * 9 + kick, y + 22); ctx.stroke(); }
    oval(ctx, head && ['look','angry'].includes(phase) ? '#e54639' : i % 2 ? '#87bf55' : '#a4d56b', cx, y + 10, width / count / 2 + 1, 10);
    if (head) {
      for (const side of [-1,1]) { oval(ctx, '#fff8df', cx + side * 5, y + 7, 4, 4); oval(ctx, '#30283b', cx + side * 5 + (phase === 'look' ? 0 : facing), y + 7, 1.8, 2); }
      rect(ctx, '#6d3034', cx - 4, y + 15, 8, 2);
      if (phase === 'look' || phase === 'angry') { ctx.strokeStyle = '#562831'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx-9,y); ctx.lineTo(cx-2,y+3); ctx.moveTo(cx+9,y); ctx.lineTo(cx+2,y+3); ctx.stroke(); }
    }
  }
}
function drawChainHead(ctx, x, y, size = 28) {
  oval(ctx, '#bc85cf', x + size/2, y + size/2, size/2, size/2);
  oval(ctx, '#fff7df', x + size*.3, y + size*.35, size*.2, size*.23);
  oval(ctx, '#fff7df', x + size*.72, y + size*.3, size*.17, size*.18);
  oval(ctx, '#302644', x + size*.35, y + size*.4, 2, 3); oval(ctx, '#302644', x + size*.68, y + size*.28, 2, 2);
  oval(ctx, '#602d58', x + size*.52, y + size*.73, size*.3, size*.14);
  rect(ctx, '#fff8df', x + size*.4, y + size*.62, size*.16, size*.15);
}
function drawDesignedChainHead(ctx, x, y, size, design, time) {
  if (design) drawEnemyWings(ctx, design, x, y, size, size, time);
  drawChainHead(ctx, x, y, size);
  if (design) drawEnemyFront(ctx, design, x, y, size, size, time);
}
// Wooden crates are drawn straight-on, in the same plane as the level.
function drawFrontCrate(ctx) {
  rect(ctx, '#704c32', 0, 0, 32, 32); rect(ctx, '#bc8752', 2, 2, 28, 28); rect(ctx, '#d4a56d', 5, 5, 22, 22);
  for (const x of [12, 20]) rect(ctx, '#a47446', x, 5, 1, 22);
  for (const [x,y,w] of [[7,10,3],[15,21,3],[23,14,2]]) rect(ctx, '#b38150', x, y, w, 1);
  for (const x of [3, 27]) for (const y of [3, 27]) rect(ctx, '#634933', x, y, 2, 2);
}
export function drawHelmetBeetle(ctx, x, y, { spike = false, folded = false, facing = 1, time = 0 } = {}) {
  ctx.save(); ctx.translate(x + (facing < 0 ? 26 : 0), y); ctx.scale(facing, 1);
  const foot = Math.sin(time * 12) * 2;
  if (!folded) {
    for (const xx of [3, 11, 19]) { ctx.strokeStyle = '#3e3540'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xx, 19); ctx.lineTo(xx - 2 + foot, 26); ctx.lineTo(xx + 3 + foot, 26); ctx.stroke(); }
    oval(ctx, '#69424b', 12, 17, 12, 8); oval(ctx, '#925963', 10, 14, 7, 4);
    oval(ctx, '#443744', 23, 17, 5, 6); oval(ctx, '#fff6dd', 25, 15, 2.5, 3); oval(ctx, '#242b39', 26, 15, 1, 2);
  }
  const top = 7;
  oval(ctx, '#aa751e', 13, top + 2, 14, folded ? 5 : 8);
  oval(ctx, '#f6ce43', 13, top, 13, folded ? 5 : 8);
  rect(ctx, '#ffe887', 5, folded ? 4 : 3, 14, 2); rect(ctx, '#e0a72c', 0, folded ? 10 : 11, 27, 3);
  if (spike) { ctx.fillStyle = '#526375'; ctx.beginPath(); ctx.moveTo(9, 1); ctx.lineTo(13, -7); ctx.lineTo(17, 1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

export function drawVine(ctx, vine) {
  const end = vinePoint(vine);
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#354d30'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(vine.x, vine.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  ctx.strokeStyle = '#99be55'; ctx.lineWidth = 2; ctx.stroke();
  for (let distance = 14, i = 0; distance < vine.length; distance += 20, i++) {
    const p = vinePoint(vine, distance), side = i % 2 ? -1 : 1;
    ctx.fillStyle = i % 2 ? '#77ad47' : '#b1cc63'; ctx.beginPath();
    ctx.ellipse(p.x + side * 5, p.y - 2, 8, 3.5, side * -.6 - vine.angle, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#a57442'; ctx.fillRect(vine.x - 10, vine.y - 5, 20, 7);
  ctx.fillStyle = '#d6bb7e'; ctx.beginPath(); ctx.arc(end.x, end.y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function drawDonut(ctx, x, y, size = 32, remaining = null, time = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
  const shake = remaining !== null && remaining < 1 ? Math.sin(time * 70) * 1.3 : 0;
  ctx.translate(shake, 0);
  ctx.strokeStyle = '#865537'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(16, 19, 11, 5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = remaining !== null ? '#f2aa72' : '#edcc81'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(16, 15, 11, 5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#fff0b5'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(16, 14, 11, 4, 0, Math.PI, Math.PI * 2); ctx.stroke();
  for (const [xx, yy, color] of [[7,13,'#a75077'],[14,10,'#6d9c80'],[24,14,'#a75077'],[18,19,'#fff3c7']]) { ctx.fillStyle=color; ctx.fillRect(xx,yy,3,2); }
  if (remaining !== null) {
    ctx.fillStyle = '#49344b'; ctx.beginPath(); ctx.arc(16, -2, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff5cd'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(Math.ceil(remaining)),16,2);
  }
  ctx.restore();
}
function drawSwingPlatforms(ctx, state, left, right, time, reducedMotion) {
  for (const vine of state.vines || []) if (vine.x + vine.length >= left && vine.x - vine.length <= right) drawVine(ctx, vine);
  for (const donut of state.donuts || []) if (donut.phase !== 'gone' && donut.x + 32 >= left && donut.x <= right) {
    drawDonut(ctx, donut.x, donut.y - 8, 32, donut.phase === 'armed' ? donut.remaining : null, reducedMotion ? 0 : time);
  }
}

export function drawTile(ctx, id, x, y, size = TILE, theme = 'grass', { top = true, icon = false, time = 0, character = 'boaz', mask = null, variant = null, revealContents = icon, doorOpen = 0, enemyDesign = null } = {}) {
  if (id === 99) {
    ctx.save(); ctx.translate(x,y); ctx.scale(size/32,size/32); drawVine(ctx, { x:16, y:5, length:24, angle: .22 }); ctx.restore(); return;
  }
  if (id === 100) { drawDonut(ctx,x,y,size); return; }
  if (id === 83) {
    const count = enemyDesign?.length ?? 4;
    ctx.save(); ctx.translate(x,y); const scale = icon ? size / (count * 24) : size / 32; ctx.scale(scale,scale);
    drawCentipede(ctx, 0, icon ? 12 : 10, count * 24, 'walk', 1, time); ctx.restore(); return;
  }
  if (enemyDesign && !(id >= 70 && id <= 73) && id !== 84) {
    drawEnemyWings(ctx, enemyDesign, x, y, size, size, time);
    drawTile(ctx, id, x, y, size, theme, { top, icon, time, character, mask, variant, revealContents, doorOpen });
    drawEnemyFront(ctx, enemyDesign, x, y, size, size, time);
    return;
  }
  if (SEA_KINDS[id] || SEA_MOUNTS[id]) { drawSeaIcon(ctx,id,x,y,size,time,theme==='underwater-night',icon); return; }
  if (id === 82 || id === 84) {
    ctx.save(); ctx.translate(x,y); ctx.scale(size/32,size/32);
    if (id === 82) {
      oval(ctx,'#a8bfd0',16,19,16,12); oval(ctx,'#f6fbff',10,15,10,11); oval(ctx,'#fff',20,12,11,12); oval(ctx,'#eaf7ff',24,21,8,9);
      oval(ctx,'#293b55',12,17,2,3); oval(ctx,'#293b55',22,17,2,3); rect(ctx,'#7a596b',14,24,7,2);
    } else {
      rect(ctx,'#64758a',0,0,32,32); rect(ctx,'#a6b7c7',3,3,26,5);
      if (icon) { ctx.strokeStyle='#e4d8ad'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(6,13); ctx.lineTo(19,22); ctx.stroke(); drawDesignedChainHead(ctx,13,13,18,enemyDesign,time); }
      else {
        oval(ctx,'#e4d8ad',16,16,4,4);
        if (revealContents) { ctx.strokeStyle='#c6c0aa'; ctx.lineWidth=2; for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(20+i*7,16,5,3,0,0,Math.PI*2);ctx.stroke();} drawDesignedChainHead(ctx,40,2,28,enemyDesign,time); }
      }
    }
    ctx.restore(); return;
  }
  if (id >= 70 && id <= 79) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
    if (id <= 73) {
      rect(ctx, '#65748a', icon ? 7 : 1, 1, icon ? 18 : 30, icon ? 8 : 30); rect(ctx, '#bcc6d4', icon ? 9 : 4, 3, icon ? 14 : 24, 3);
      const worldBall = chainBall(x / TILE, y / TILE, id, time);
      const ball = { ...worldBall, anchorX: 16, anchorY: 28, x: worldBall.x - x, y: worldBall.y - y };
      // Palette icons show the complete object; the field uses full-size geometry.
      if (icon) { Object.assign(ball, { anchorX: 16, anchorY: 5, x: 1, y: 17 }); ctx.translate(7, 4); ctx.scale(.55, .55); }
      if (enemyDesign) drawEnemyWings(ctx, enemyDesign, ball.x, ball.y, ball.w, ball.h, time);
      drawChainBall(ctx, ball);
      if (enemyDesign) drawEnemyFront(ctx, enemyDesign, ball.x, ball.y, ball.w, ball.h, time);
    } else if (id === 74) {
      oval(ctx, '#242a36', 7, 26, 7, 6); oval(ctx, '#242a36', 26, 26, 7, 6);
      oval(ctx, '#b9c4ce', 7, 26, 3, 3); oval(ctx, '#b9c4ce', 26, 26, 3, 3);
      rect(ctx, '#ec754d', 3, 13, 26, 9); rect(ctx, '#29354a', 10, 10, 13, 4); rect(ctx, '#444d60', 24, 5, 3, 10); rect(ctx, '#ffeaa1', 27, 14, 5, 4);
    } else if (id === 75) {
      oval(ctx, '#bacfe4', 16, 22, 16, 10); oval(ctx, '#f4fbff', 8, 18, 8, 10); oval(ctx, '#fff', 19, 12, 10, 12); oval(ctx, '#f4fbff', 26, 21, 6, 9); rect(ctx, '#f4fbff', 6, 20, 22, 10);
    } else if (id === 76 || id === 79) {
      rect(ctx, '#aa693d', 2, 9, 28, 23); rect(ctx, '#e5b666', 4, 11, 24, 17);
      ctx.save(); if (id === 79) { ctx.translate(1, 7); ctx.rotate(-.6); } rect(ctx, '#f3ce7c', 0, 4, 32, 6); ctx.restore();
      oval(ctx, '#4b984d', 16, 20, 5, 8); rect(ctx, '#c4e58b', 15, 15, 2, 9);
    } else if (id === 78) {
      rect(ctx, '#45904e', 13, 0, 6, 32); oval(ctx, '#78bf57', 8, 10, 8, 4); oval(ctx, '#94d56c', 24, 22, 8, 5);
    } else if (id === 77) {
      oval(ctx, '#f3c19b', 16, 9, 6, 6); rect(ctx, '#674e40', 10, 2, 12, 5); rect(ctx, '#26394e', 12, 7, 9, 3);
      oval(ctx, '#dc694c', 16, 21, 16, 6); rect(ctx, '#f5bd59', 3, 24, 26, 4); rect(ctx, '#f5bd59', 1, 11, 5, 12); rect(ctx, '#d9e9e9', 30, 12, 2, 18);
    }
    ctx.restore(); return;
  }

  if (!id) return;
  if (theme === 'castle' && id === 12) {
    ctx.save();ctx.translate(x,y);ctx.scale(size/TILE,size/TILE);
    rect(ctx,'#302b38',0,0,32,16);rect(ctx,'#93879a',0,0,32,3);
    rect(ctx,'#645968',1,3,30,9);rect(ctx,'#ba9d83',2,3,28,2);
    rect(ctx,'#423746',1,12,30,4);rect(ctx,'#382e3b',15,4,2,8);
    ctx.fillStyle='#514454';ctx.beginPath();ctx.moveTo(4,16);ctx.lineTo(9,23);ctx.lineTo(12,16);ctx.moveTo(20,16);ctx.lineTo(23,23);ctx.lineTo(28,16);ctx.fill();
    ctx.restore();return;
  }
  if (theme === 'castle' && id === 26) {
    ctx.save();ctx.translate(x,y);ctx.scale(size/TILE,size/TILE);
    rect(ctx,'#b93629',0,top?5:0,32,top?27:32);
    rect(ctx,'#ed6b2e',0,top?5:0,32,top?11:7);
    if(top){
      ctx.strokeStyle='#ffe076';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,6);
      for(let i=0;i<4;i++)ctx.quadraticCurveTo(i*8+4,6+Math.sin(time*3+i)*2,(i+1)*8,6);
      ctx.stroke();
    }
    for(let i=0;i<3;i++){
      const xx=(i*11+Math.floor(time*5))%28+2,yy=17+(i%2)*9;
      oval(ctx,'#f49238',xx,yy,3,1.5);oval(ctx,'#ffcc5a',xx-1,yy-.5,1,1);
    }
    ctx.restore();return;
  }
  if (theme === 'castle' && [1, 2, 65].includes(id)) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / TILE, size / TILE);
    ctx.beginPath(); ctx.rect(0, 0, 32, 32); ctx.clip();
    rect(ctx, '#25232e', 0, 0, 32, 32);
    for (let row = 0; row < 2; row++) {
      const offset = row * 16;
      for (let xx = -offset; xx < 32; xx += 32) {
        rect(ctx, row ? '#55515f' : '#615c6b', xx + 1, row * 16 + 1, 30, 14);
        rect(ctx, '#7c7486', xx + 2, row * 16 + 2, 28, 1);
        rect(ctx, '#393541', xx + 2, row * 16 + 13, 28, 2);
      }
    }
    ctx.restore(); return;
  }
  if ([66, 67, 68, 69].includes(id)) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / TILE, size / TILE);
    if (id === 68 || id === 69) {
      ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(id === 68 ? 32 : 0, 0); ctx.lineTo(32, 32); ctx.closePath(); ctx.clip();
    }
    paintTile(ctx, 65, 0, 0, TILE, theme);
    if (id === 68 || id === 69) {
      ctx.strokeStyle = '#bcc0b7'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(0, id === 68 ? 32 : 0); ctx.lineTo(32, id === 68 ? 0 : 32); ctx.stroke();
    } else if (id === 66) {
      // In play only a faint seam distinguishes the secret entrance from rock.
      ctx.strokeStyle = '#525b6260'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(10, 30); ctx.lineTo(10, 17); ctx.quadraticCurveTo(16, 7, 22, 17); ctx.lineTo(22, 30); ctx.stroke();
      if (icon || revealContents) {
        ctx.strokeStyle = '#ffe6a5'; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.fillStyle = '#ffe6a5'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', 16, 26);
      }
    } else {
      ctx.strokeStyle = '#424b56'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(3, 13); ctx.lineTo(12, 18); ctx.lineTo(8, 26); ctx.moveTo(27, 4); ctx.lineTo(22, 13); ctx.lineTo(27, 20); ctx.stroke();
      if (icon || revealContents) {
        ctx.strokeStyle = '#413d37'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(16, 6); ctx.lineTo(16, 25); ctx.moveTo(10, 19); ctx.lineTo(16, 25); ctx.lineTo(22, 19); ctx.stroke();
        ctx.strokeStyle = '#ffe6a5'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    ctx.restore(); return;
  }
  if ([62, 63, 64].includes(id)) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
    if (id === 64) {
      ctx.strokeStyle = '#81552e'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(10, 10, 6, 0, Math.PI * 2); ctx.moveTo(14, 14); ctx.lineTo(26, 26); ctx.stroke();
      ctx.strokeStyle = '#ffd45e'; ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.moveTo(23, 23); ctx.lineTo(27, 19); ctx.moveTo(19, 19); ctx.lineTo(23, 15); ctx.stroke();
      ctx.fillStyle = '#fff5bd'; ctx.fillRect(6, 6, 3, 3);
    } else {
      ctx.fillStyle = '#4d5365'; ctx.beginPath(); ctx.moveTo(1,32); ctx.lineTo(2,12); ctx.quadraticCurveTo(4,0,16,0); ctx.quadraticCurveTo(29,1,31,13); ctx.lineTo(32,32); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111322'; ctx.beginPath(); ctx.moveTo(6,32); ctx.lineTo(6,14); ctx.arc(16,14,10,Math.PI,0); ctx.lineTo(26,32); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7f899a'; ctx.fillRect(3,12,3,6); ctx.fillRect(10,3,5,3); ctx.fillRect(25,15,4,7);
      if (id === 63 && doorOpen < 1) {
        ctx.save(); ctx.beginPath(); ctx.rect(6,4,20*(1-doorOpen),28); ctx.clip();
        ctx.fillStyle = '#815333'; ctx.fillRect(6,5,20,27); ctx.strokeStyle = '#4b352b'; ctx.lineWidth = 1;
        for (const xx of [10,16,22]) { ctx.beginPath(); ctx.moveTo(xx,6); ctx.lineTo(xx,32); ctx.stroke(); }
        ctx.fillStyle = '#dfad4a'; ctx.fillRect(7,13,18,3); ctx.fillRect(7,27,18,2);
        ctx.strokeStyle = '#ffe19a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(16,19,3,Math.PI,0); ctx.stroke();
        ctx.fillStyle = '#f5c44f'; ctx.fillRect(12,19,8,7); ctx.fillStyle = '#67492b'; ctx.fillRect(15,21,2,3); ctx.restore();
      }
    }
    ctx.restore(); return;
  }
  if (id === 61) { drawCrusher(ctx, x, y, size); return; }
  if (PIPE_TYPES[id] && id >= 49) {
    const pipe = PIPE_TYPES[id], base = { decoration: 5, in: 32, out: 33, both: 34 }[pipe.mode];
    const angle = { down: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[pipe.opening];
    ctx.save(); ctx.translate(x + size / 2, y + size / 2); ctx.rotate(angle);
    drawTile(ctx, base, -size / 2, -size / 2, size, theme, { top, icon, time, character }); ctx.restore(); return;
  }

  if ([46, 47, 48].includes(id)) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
    if (id === 48) {
      ctx.strokeStyle = '#394b67'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(5, 12); ctx.lineTo(27, 12); ctx.stroke();
      for (const xx of [5, 27]) { ctx.fillStyle = '#f5bd45'; ctx.beginPath(); ctx.arc(xx, 12, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#e59535'; ctx.fillRect(12, 14, 5, 15);
    } else {
      ctx.fillStyle = '#34465e'; ctx.fillRect(0, 0, 32, 32); ctx.fillStyle = '#e6ab42'; ctx.fillRect(3, 3, 26, 26);
      ctx.strokeStyle = '#fff0b8'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, 22, 22);
      ctx.fillStyle = '#34465e'; ctx.font = 'bold 23px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(id === 46 ? '↑' : '↓', 16, 24);
    }
    ctx.restore(); return;
  }

  if (QUESTION_REWARDS[id] && (id !== 3 || revealContents)) {
    drawTile(ctx, 3, x, y, size, theme, { top, time, character });
    if (revealContents) {
      const badge = size * .5;
      ctx.save(); ctx.fillStyle = '#fff3d5';
      ctx.fillRect(x + size - badge, y + size - badge, badge, badge);
      drawTile(ctx, QUESTION_REWARDS[id], x + size - badge, y + size - badge, badge, theme, { icon: true, character });
      ctx.restore();
    }
    return;
  }
  if (id === FIREBAR_TILE) {
    ctx.save();ctx.translate(x,y);ctx.scale(size/32,size/32);
    if(icon){ctx.translate(16,16);ctx.scale(.29,.29);drawFirebar(ctx,{x:0,y:0,direction:1,phase:-.6},0);}
    else drawFirebar(ctx,{x:16,y:16,direction:(Math.floor(x/32)+Math.floor(y/32))%2?1:-1,phase:(Math.floor(x/32)%4)*Math.PI/2},time,{guide:revealContents});
    ctx.restore();return;
  }
  if (id === 97 || id === 98) { ctx.save(); ctx.translate(x + size * .08, y + size * .1); ctx.scale(size / 32, size / 32); drawHelmetBeetle(ctx, 0, 0, { spike: id === 98, time }); ctx.restore(); return; }
  if (hasTerrain() && (id === 2 || id === 1 && ['grass', 'night'].includes(theme))) {
    drawTerrain(ctx, id === 1 ? 'ground' : 'brick', x, y, size, {
      mask: mask ?? (top ? 0 : JOIN.up), variant: variant ?? terrainVariant(Math.floor(x / TILE), Math.floor(y / TILE), id)
    });
    if (theme === 'night') rect(ctx, '#182d5844', x, y, size, size);
    return;
  }
  if (hasLook()) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
    let drawn = true;
    if (id === 1 && theme === 'grass') drawLook(ctx, top ? `ground${Math.abs(Math.floor(x / TILE)) % 4}` : 'dirt', 0, 0, 32, 32);
    else if ([2, 3, 13].includes(id)) {
      if (id === 13) ctx.globalAlpha = .65;
      drawFrontCrate(ctx);
      if (id === 3) {
        oval(ctx, '#ffe083', 16, 15, 8, 9); ctx.strokeStyle = '#8b5727'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#594529'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', 16, 21);
      }
    } else if (id === 4) {
      const squeeze = icon ? 1 : .78 + Math.sin(time * 4) * .20;
      ctx.translate(16, 0); ctx.scale(squeeze, 1); drawLook(ctx, 'coin', -11, 4, 22, 24);
    } else if (id === 16) drawLook(ctx, 'dino:idle', 0, 0, 32, 32);
    else if (id === 31) {
      oval(ctx, '#bc6684', 16, 7, 6, 4); oval(ctx, '#ffce61', 16, 19, 10, 10);
      oval(ctx, '#ffe8a0', 13, 16, 4, 4); rect(ctx, '#805541', 12, 24, 8, 2);
    } else if (id === 7) drawLook(ctx, 'spikes', 0, 14, 32, 18);
    else if (id === 8) drawLook(ctx, 'spring', 3, 5, 26, 27);
    else if (id === 9) drawLook(ctx, 'mushroom', 2, 4, 28, 28);
    else if (id === 11) {
      if (icon) drawLook(ctx, 'flag', 2, 0, 28, 32);
      else {
        // Keep the base and height of the existing finish hitbox.
        rect(ctx, '#76573e', 4, -62, 3, 94);
        drawLook(ctx, 'flag', 4, -64, 45 + Math.sin(time * 2) * .8, 96);
      }
    } else if (id === 12 && ['grass', 'night'].includes(theme)) {
      if (theme === 'night') ctx.globalAlpha = .68;
      drawLook(ctx, 'island', 0, 0, 32, 32);
    }
    else drawn = false;
    ctx.restore(); if (drawn) return;
  }
  if (size === TILE && [1, 2, 3, 5, 7, 8, 9, 12, 13, 14, 15, 16, 19, 30, 31, 32, 33, 34, 65].includes(id)) {
    cachedSprite(ctx, `tile:${id}:${theme}:${top}`, x, y, (c, xx, yy) => paintTile(c, id, xx, yy, size, theme, { top, icon, time, character }));
  } else paintTile(ctx, id, x, y, size, theme, { top, icon, time, character });
}
function paintTile(ctx, id, x, y, size = TILE, theme = 'grass', { top = true, icon = false, time = 0, character = 'boaz' } = {}) {
  if (!id) return;
  const c = COLORS[theme];
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 32, size / 32);
  const r = (color, xx, yy, w, h) => rect(ctx, color, xx, yy, w, h);
  switch (id) {
    case 80: case 81:
      r('#4b5265', 0, 18, 32, 14); r('#a7b2c9', 2, 20, 28, 3);
      r('#737e96', 3, 25, 26, 5);
      ctx.save(); ctx.translate(16, 18); ctx.scale(1, id === 81 ? .18 : 1);
      ctx.beginPath(); ctx.arc(0, 0, 15, Math.PI, 2 * Math.PI); ctx.closePath();
      ctx.fillStyle = id === 81 ? '#28628f' : '#168def'; ctx.fill();
      ctx.strokeStyle = '#b7edff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('P', 0, -2);
      ctx.restore(); break;

    case 1:
      r(c.dirt, 0, 0, 32, 32); r(c.shade, 0, 30, 32, 2);
      r('#ddc4a0', 5, 11, 4, 3); r(c.shade, 19, 17, 3, 3); r('#ddc4a0', 12, 25, 4, 2); r(c.shade, 27, 9, 3, 3);
      if (top) { r(c.grass, 0, 0, 32, 7); r(theme === 'moon' ? '#e2e6ee' : theme === 'winter' ? '#ffffff' : isWaterTheme(theme) ? '#f6e7b9' : '#a5d08a', 0, 0, 32, 2); r(c.grass, 3, 5, 4, 5); r(c.grass, 20, 5, 4, 4); }
      if (theme === 'grass') {
        r('#80634135', 0, top ? 8 : 0, 32, top ? 3 : 1);
        r('#d0ae83', 5, 14, 8, 3); r('#c6a279', 23, 22, 6, 3);
        if (top) { r('#397c4a', 0, 5, 32, 2); r('#8fca69', 0, 0, 32, 2); r('#b8df83', 2, 0, 11, 1); r('#559347', 9, 6, 4, 5); r('#6eab51', 23, 5, 5, 4); }
      }
      break;
    case 65: {
      r('#505560', 0, 0, 32, 32); r('#81878c', 1, 1, 30, 30);
      const facet = (color, points) => { ctx.fillStyle = color; ctx.beginPath(); points.forEach(([xx, yy], i) => i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy)); ctx.closePath(); ctx.fill(); };
      facet('#a3a7a6', [[2,2],[15,1],[12,10],[3,13]]);
      facet('#929895', [[16,2],[29,3],[30,12],[23,15],[13,10]]);
      facet('#71787e', [[2,14],[12,11],[21,16],[18,27],[4,29]]);
      facet('#626a75', [[23,16],[30,13],[30,29],[19,30],[20,23]]);
      ctx.strokeStyle='#444c58';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(15,1);ctx.lineTo(12,10);ctx.lineTo(21,16);ctx.lineTo(18,25);ctx.lineTo(20,31);ctx.moveTo(12,10);ctx.lineTo(7,15);ctx.moveTo(21,16);ctx.lineTo(28,14);ctx.stroke();
      r('#b8b9af',3,3,8,1);r('#bdc0b5',4,4,2,3);r('#979d9b',5,20,3,2);r('#adb1a8',23,6,3,2);r('#515a66',25,25,3,2);r('#515a66',1,30,30,2);
      break;
    }
    case 2:
      r('#9b6a59', 0, 0, 32, 32); r('#d49a7f', 1, 1, 30, 29); r('#e7b39a', 2, 2, 28, 2);
      r('#a06e5b', 0, 10, 32, 2); r('#a06e5b', 0, 21, 32, 2); r('#a06e5b', 15, 0, 2, 11); r('#a06e5b', 7, 11, 2, 11); r('#a06e5b', 23, 11, 2, 11); r('#a06e5b', 15, 22, 2, 10);
      break;
    case 3: case 13:
      r(id === 3 ? '#c59446' : '#9f8c79', 0, 0, 32, 32); r(id === 3 ? '#f2c46a' : '#b8a58c', 2, 2, 28, 27);
      r(id === 3 ? '#ffe39c' : '#c8b59e', 3, 3, 26, 2);
      for (const xx of [4, 26]) for (const yy of [4, 25]) r('#b18b48', xx, yy, 2, 2);
      if (id === 3) { r('#987142', 11, 7, 11, 3); r('#987142', 19, 10, 3, 6); r('#987142', 14, 15, 8, 3); r('#987142', 14, 17, 3, 3); r('#987142', 14, 23, 3, 3); }
      break;
    case 4: {
      const squeeze = icon ? 1 : .75 + Math.sin(time * 4) * .2;
      ctx.translate(16, 0); ctx.scale(squeeze, 1); ctx.translate(-16, 0);
      r('#ceaa52', 11, 4, 10, 25); r('#f4d17c', 8, 7, 16, 19); r('#fff0b1', 10, 7, 3, 17); r('#d6ad57', 17, 9, 3, 14); r('#ffe8a0', 13, 5, 6, 3); break;
    }
    case 5: case 32: case 33: case 34:
      r('#468771', 4, 2, 24, 30); r('#72b395', 6, 3, 20, 29); r('#a1d3a8', 7, 3, 4, 29); r('#579b80', 22, 3, 4, 29);
      r('#468771', 0, 0, 32, 11); r('#89c3a1', 2, 2, 28, 6); r('#a6d9af', 3, 2, 4, 6); r('#579b80', 26, 2, 3, 6);
      if (id !== 5) {
        r('#315c55', 11, 12, 10, 17); r('#fff1b5', 15, 15, 2, 10);
        if (id === 32 || id === 34) { r('#fff1b5', 13, 23, 6, 2); r('#fff1b5', 11, 21, 10, 2); }
        if (id === 33 || id === 34) { r('#fff1b5', 13, 15, 6, 2); r('#fff1b5', 11, 17, 10, 2); }
      }
      break;
    case 6: drawMonsterArt(ctx,'walker',0,0,{time}); break;
    case 7:
      r('#787e85', 0, 27, 32, 5);
      for (const xx of [0, 11, 22]) { ctx.fillStyle = '#c9ced3'; ctx.beginPath(); ctx.moveTo(xx, 27); ctx.lineTo(xx + 5, 9); ctx.lineTo(xx + 10, 27); ctx.fill(); r('#edf0e8', xx + 5, 15, 2, 10); } break;
    case 8:
      r('#745b66', 5, 27, 22, 5); r('#ad8792', 6, 7, 20, 5); r('#e3b8c3', 5, 4, 22, 5); r('#f3cfce', 5, 4, 22, 2);
      r('#c2a5a3', 9, 12, 14, 3); r('#7d7183', 10, 15, 11, 3); r('#c2a5a3', 9, 19, 14, 3); r('#7d7183', 10, 23, 11, 3); break;
    case 9:
      r('#eedcc0', 10, 17, 12, 13); r('#e19d91', 9, 4, 14, 4); r('#da8379', 4, 8, 24, 14); r('#d2776f', 2, 13, 28, 10); r('#f9ead1', 7, 10, 6, 6); r('#f9ead1', 21, 13, 5, 6); r('#f9ead1', 16, 5, 5, 5); r('#645449', 13, 24, 2, 4); r('#645449', 19, 24, 2, 4); break;
    case 10:
      if (!icon) { ctx.fillStyle = '#fff5d272'; ctx.beginPath(); ctx.arc(16, 17, 20, 0, 7); ctx.fill(); }
      hero(ctx, 1, 0, 32, 1, false, 0, character); break;
    case 11: {
      const offset = icon ? 0 : -64, poleH = icon ? 32 : 96;
      r('#e8dfb8', 7, offset + 3, 3, poleH - 3); r('#b5a783', 9, offset + 3, 1, poleH - 3); r('#f5d685', 6, offset, 5, 5);
      r('#8973cc', 10, offset + 6, 19, 14); r('#ad98e2', 10, offset + 6, 19, 3); r('#f4e8bc', 16, offset + 10, 6, 2); r('#f4e8bc', 18, offset + 8, 2, 6);
      r('#ddd4b8', 3, 29, 12, 3); break;
    }
    case 12:
      r('#607f71', 0, 3, 32, 11); r('#9dc3a3', 1, 1, 30, 10); r('#c8deb0', 2, 1, 28, 3); r('#7da88a', 0, 10, 32, 4); r('#b29b7d', 4, 14, 4, 16); r('#b29b7d', 24, 14, 4, 16); r('#cfb599', 4, 14, 2, 15); r('#cfb599', 24, 14, 2, 15); break;
    case 14: case 30:
      if (id === 30) {
        const rainbowGradient = ctx.createLinearGradient(3, 2, 29, 29);
        RAINBOW_COLORS.forEach((color, i) => rainbowGradient.addColorStop(i / 5, color)); ctx.fillStyle = rainbowGradient;
      } else ctx.fillStyle = '#f4cf73';
      ctx.strokeStyle = id === 30 ? '#785fba' : '#ba944c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(16, 2); ctx.lineTo(20, 11); ctx.lineTo(30, 12); ctx.lineTo(23, 19); ctx.lineTo(25, 29); ctx.lineTo(16, 24); ctx.lineTo(7, 29); ctx.lineTo(9, 19); ctx.lineTo(2, 12); ctx.lineTo(12, 11); ctx.closePath(); ctx.fill(); ctx.stroke();
      r('#fff0a8', 14, 8, 3, 6); r('#655338', 12, 16, 2, 5); r('#655338', 19, 16, 2, 5); break;
    case 15:
    case 19:
      r('#5e9870', 15, 17, 3, 15); r('#7fb681', 6, 23, 9, 4); r('#7fb681', 18, 26, 9, 4);
      r(id === 19 ? '#6199c8' : '#cc755b', 9, 3, 15, 18); r(id === 19 ? '#8eddec' : '#e9a15e', 5, 7, 23, 10); r(id === 19 ? '#defaff' : '#ffe0a0', 10, 7, 13, 10); r('#fff1c0', 12, 7, 9, 3);
      r('#6a5246', 14, 11, 2, 4); r('#6a5246', 19, 11, 2, 4); break;
    case 16:
      r('#528568', 3, 19, 24, 10); r('#8bb87b', 6, 15, 20, 12); r('#4a795b', 18, 6, 13, 17); r('#91c481', 19, 4, 12, 15);
      r('#cddaa0', 22, 14, 10, 6); r('#fff2cb', 24, 6, 5, 6); r('#3f5445', 27, 7, 2, 4); r('#c7d7a0', 15, 21, 10, 6);
      r('#d99870', 8, 13, 9, 5); r('#bb805b', 9, 16, 9, 2); r('#567c59', 6, 27, 6, 5); r('#567c59', 22, 27, 6, 5); r('#79a571', 0, 18, 7, 5); break;
    case 17: drawRobot(ctx, 0, 0, .7, 1, time); break;
    case 18: drawFrog(ctx, 0, 0, 1, false, time); break;
    case 20: drawFrog(ctx, 0, 0, 1, false, time, true); break;
    case 21: drawRobot(ctx, 0, 0, .7, 1, time, true); break;
    case 22: drawTurtle(ctx, 0, 0, 'turtle', '', 1, time); break;
    case 23: drawDragon(ctx, 0, 0, 1, time); break;
    case 24: drawPlant(ctx, 0, 0, time); break;
    case 25: drawTurtle(ctx, 0, 0, 'skeleton', '', 1, time); break;
    case 26:
      r('#bf534a', 0, 7, 32, 25); r('#e67b45', 0, 5, 32, 7); r('#f9c66a', 0, 5, 32, 3);
      for (let i = 0; i < 4; i++) { const xx = (i * 9 + Math.floor(time * 9)) % 32; r('#f4ad50', xx, 15 + i % 2 * 8, 5, 3); } break;
    case 27: drawTurtle(ctx, 0, 0, 'spiky', '', 1, time); break;
    case 28: drawTurtle(ctx, 0, 0, 'hammer', '', 1, time); break;
    case 29: drawBomb(ctx, 0, 0, 1, time); break;
    case 45:
      drawMushroomHelper(ctx, 0, 0, { time: icon ? 0 : time, reducedMotion: icon }); break;
    case 44:
      drawRocket(ctx, 17, 14, { size: .48 }); break;
    case 43:
      drawReverseReward(ctx, 16, 16, icon ? 0 : time); break;
    case 42:
      drawBubbleGun(ctx, 15, 17, 1, 25); drawBubble(ctx, 25, 7, 3); break;
    case 41:
      // A small rainbow cloud is distinct from the existing rainbow star.
      ctx.fillStyle = '#fff6fc';
      oval(ctx, '#fff6fc', 16, 21, 13, 8); oval(ctx, '#fff6fc', 11, 15, 7, 7); oval(ctx, '#fff6fc', 21, 14, 8, 8);
      RAINBOW_COLORS.forEach((color, i) => {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(16, 18, 13 - i * 1.7, Math.PI, Math.PI * 2); ctx.stroke();
      });
      r('#6b5088', 11, 21, 2, 2); r('#6b5088', 20, 21, 2, 2); break;
    case 31:
      r('#a67d3f', 13, 2, 6, 5); r('#f5cb6f', 10, 7, 12, 5); r('#e8aa51', 7, 12, 18, 12);
      r('#ffe6a3', 9, 12, 4, 11); r('#bd853e', 5, 24, 22, 3); r('#f7d98c', 5, 23, 22, 3);
      r('#785640', 14, 26, 5, 4); r('#86614a', 15, 16, 2, 6); break;
  }
  ctx.restore();
}
function drawMachinery(ctx, state, guides = false) {
  ctx.save();
  for (const wall of state.movingWalls || []) {
    if (guides) { ctx.strokeStyle = '#b87928'; ctx.setLineDash([5, 5]); ctx.strokeRect(wall.x, Math.min(wall.startY, wall.endY), wall.w, Math.abs(wall.endY - wall.startY) + wall.h); ctx.setLineDash([]); }
    drawTile(ctx, wall.endY < wall.startY ? 46 : 47, wall.x, wall.y, wall.w);
  }
  for (const belt of state.belts || []) {
    const g = belt.geometry;
    ctx.strokeStyle = '#293d56'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(g.ax + g.nx * 12, g.ay + g.ny * 12); ctx.lineTo(g.bx + g.nx * 12, g.by + g.ny * 12);
    ctx.arc(g.bx, g.by, 12, Math.atan2(g.ny, g.nx), Math.atan2(-g.ny, -g.nx), true);
    ctx.lineTo(g.ax - g.nx * 12, g.ay - g.ny * 12); ctx.arc(g.ax, g.ay, 12, Math.atan2(-g.ny, -g.nx), Math.atan2(g.ny, g.nx), true); ctx.stroke();
    for (const p of belt.platforms) {
      ctx.fillStyle = '#d88830'; ctx.fillRect(p.x + 3, p.y, p.w - 6, p.h); ctx.fillStyle = '#fff0bb'; ctx.fillRect(p.x, p.y, p.w, 5);
      ctx.strokeStyle = '#704b2f'; ctx.lineWidth = 2; ctx.strokeRect(p.x + 3, p.y + 5, p.w - 6, p.h - 5);
    }
    for (const [x, y] of [[g.ax, g.ay], [g.bx, g.by]]) {
      ctx.fillStyle = '#e6ab42'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = belt.running ? '#397a63' : '#a24f45'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
export function drawWorld(ctx, level, { grid = true, game = null, time = 0, hover = null, beltStart = null, character = 'boaz', viewport = null, effects = null, reducedMotion = false, depthLayers = true, depthPanelCache = null, backgroundRaster = null } = {}) {
  const width = level.width * TILE, height = level.tiles.length * TILE;
  const left = Math.max(0, (viewport?.left || 0) - 96), right = Math.min(width, (viewport?.right ?? width) + 96);
  const firstColumn = Math.max(0, Math.floor(left / TILE)), lastColumn = Math.min(level.width - 1, Math.floor(right / TILE));
  // Keep a three-tile margin for artwork that extends beyond its own cell.
  const top = Math.max(0, (viewport?.top ?? 0) - 96), bottom = Math.min(height, (viewport?.bottom ?? height) + 96);
  const firstRow = Math.max(0, Math.floor(top / TILE)), lastRow = Math.min(level.tiles.length - 1, Math.floor(bottom / TILE));
  const visible = (body, margin = 96) => body.x + body.w >= left - margin && body.x <= right + margin;
  const theme = worldTheme(game, level.theme);
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, right - left, height); ctx.clip();
  const paintBackdrop = backdropCtx => {
    if (game?.caveState?.active !== null && game?.caveState?.active !== undefined) {
      backdropCtx.fillStyle = '#10111f'; backdropCtx.fillRect(left,0,right-left,height);
      const light = backdropCtx.createRadialGradient(width*.6,height*.65,10,width*.6,height*.65,width*.7); light.addColorStop(0,'#353047'); light.addColorStop(1,'#10111f'); backdropCtx.fillStyle=light;backdropCtx.fillRect(left,0,right-left,height);
      backdropCtx.fillStyle='#242535';
      for(let xx=0;xx<width;xx+=48){backdropCtx.beginPath();backdropCtx.moveTo(xx,52);backdropCtx.lineTo(xx+18,90+(xx%5)*8);backdropCtx.lineTo(xx+36,52);backdropCtx.fill();}
    } else if (game?.wonderland) drawWonderBackdrop(backdropCtx, game, left, right, height, reducedMotion, viewport?.left || 0, depthLayers, depthPanelCache);
    else background(backdropCtx, width, height - (level.undergroundDepth || 0) * TILE, theme, { left, right, camera: viewport?.left || 0, reducedMotion, depthLayers, depthPanelCache });
    if (level.background) drawCrazyBackground(backdropCtx, level.background, viewport, width, height);
    drawFartSky(backdropCtx, game, viewport, width, height);
    if (level.undergroundDepth) {
      const surface = height - (level.undergroundDepth + 2) * TILE;
      const shade = backdropCtx.createLinearGradient(0, surface, 0, height);
      shade.addColorStop(0, '#383044'); shade.addColorStop(1, '#171923');
      backdropCtx.fillStyle = shade; backdropCtx.fillRect(left, surface, right - left, height - surface);
      backdropCtx.fillStyle = '#464052';
      for (let x = Math.floor(left / 64) * 64; x < right; x += 64) {
        backdropCtx.beginPath(); backdropCtx.moveTo(x, surface + 64); backdropCtx.lineTo(x + 12, surface + 78 + (x / 64 % 3) * 9); backdropCtx.lineTo(x + 24, surface + 64); backdropCtx.fill();
      }
    }
  };
  if (!backgroundRaster?.draw(ctx, paintBackdrop)) paintBackdrop(ctx);
  const tiles = game ? game.tiles : level.tiles;
  for (let y = firstRow; y <= lastRow; y++) for (let x = firstColumn; x <= lastColumn; x++) {
    const id = tiles[y][x];
    if (!id || [46, 47, 99, 100, FIREBAR_TILE].includes(id) || (game && id === 10)) continue;
    const appearance = id === 1 || id === 2 ? terrainAppearance(level, x, y, tiles) : {};
    drawTile(ctx, id, x * TILE + (game?.crumbling?.some(b => b.x === x && b.y === y) && !reducedMotion ? Math.sin(time * 100) : 0), y * TILE, TILE, theme, { top: tiles[y - 1]?.[x] !== (id === 26 ? 26 : 1), ...appearance, time, character, enemyDesign: (game ? game.sceneLevel : level).enemyDesigns?.find(e => e.x === x && e.y === y && e.tileId === id)?.design, revealContents: !game, doorOpen: game?.keyReveal?.door.x === x && game?.keyReveal?.door.y === y ? Math.max(0, Math.min(1, (game.keyReveal.elapsed - .55) / .55)) : 0 });
    if (theme === 'grass' && id === 1 && !tiles[y - 1]?.[x]) {
      // Decoration belongs to the terrain surface; it adds no collision objects.
      const seed = (x * 13 + y * 7) % 11, xx = x * TILE, yy = y * TILE;
      if (seed < 4) {
        const sway = game && !reducedMotion ? Math.sin(time * 1.6 + x) * 1.2 : 0;
        ctx.strokeStyle = '#5c9b4e'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xx + 10, yy + 1); ctx.lineTo(xx + 7 + sway, yy - 5); ctx.moveTo(xx + 11, yy + 1); ctx.lineTo(xx + 13 + sway, yy - 7); ctx.stroke();
      }
      if (seed === 2 || seed === 8) {
        if (hasLook()) drawLook(ctx, 'flowers', xx + 16, yy - 12, 19, 12);
        else {
          rect(ctx, '#4e9253', xx + 22, yy - 5, 1, 6);
          rect(ctx, seed === 2 ? '#fff2c4' : '#e8b2a5', xx + 20, yy - 7, 5, 3); rect(ctx, '#edc76a', xx + 22, yy - 6, 1, 1);
        }
      }
      if (tiles[y + 1]?.[x] === 1 && (tiles[y]?.[x - 1] !== 1 || tiles[y]?.[x + 1] !== 1)) {
        const edgeX = xx + (tiles[y]?.[x - 1] !== 1 ? 1 : 28);
        rect(ctx, '#4c8756', edgeX, yy + 5, 3, 19); rect(ctx, '#72af62', edgeX, yy + 14, 5, 3);
      }
    }
  }
  if (!game) {
    for (const lock of caveLinks(tiles)) for (const point of [lock.door, lock.key].filter(Boolean)) {
      ctx.save(); ctx.fillStyle='#4b3f5c'; ctx.fillRect(point.x*TILE+5,point.y*TILE-11,22,10);ctx.fillStyle='#ffe397';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText(lock.label,point.x*TILE+16,point.y*TILE-3);ctx.restore();
    }
    const connections = pipeConnections(tiles);
    for (const { from, to, label } of connections) {
      for (const pipe of to && PIPE_TYPES[from.id].mode === 'in' ? [from, to] : [from]) {
        if (pipe.x < firstColumn || pipe.x > lastColumn) continue;
        ctx.save(); ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
        rect(ctx, to ? '#315c55' : '#95584e', pipe.x * TILE + 5, pipe.y * TILE - 11, 22, 10);
        ctx.fillStyle = '#fff3cd'; ctx.fillText(to ? label : '?', pipe.x * TILE + 16, pipe.y * TILE - 3); ctx.restore();
      }
    }
  }
  if (grid && !game) {
    ctx.strokeStyle = '#f4fcf342'; ctx.lineWidth = .7; ctx.beginPath();
    for (let x = firstColumn * TILE; x <= right; x += TILE) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = 0; y <= height; y += TILE) { ctx.moveTo(left, y); ctx.lineTo(right, y); }
    ctx.stroke();
  }
  for (const bar of (game || createFirebars(level)).firebars || []) {
    if(bar.x+FIREBAR_REACH<left||bar.x-FIREBAR_REACH>right||bar.y+FIREBAR_REACH<top||bar.y-FIREBAR_REACH>bottom)continue;
    drawFirebar(ctx,bar,game?game.time:time,{guide:!game,reducedMotion});
  }
  drawMachinery(ctx, game || createMechanisms(level), !game);
  drawSwingPlatforms(ctx, game || createSwingPlatforms(level), left, right, time, reducedMotion);
  if (game) {
    for (const p of game.players || [game.player]) drawFartTrail(ctx, p);
    for (const helper of game.helpers || []) if (helper.alive && visible(helper)) {
      const claimed = helper.givenTo.includes(game.players ? game.players.indexOf(game.player) : 0);
      drawMushroomHelper(ctx, helper.x - 3, helper.y - 2, { time, reducedMotion, given: claimed });
      if (helper.giftTime > 0) {
        ctx.save(); ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff7d8';
        ctx.strokeStyle = '#486578'; ctx.lineWidth = 2; ctx.strokeText('Veel plezier!', helper.x + helper.w / 2, helper.y - 8); ctx.fillText('Veel plezier!', helper.x + helper.w / 2, helper.y - 8); ctx.restore();
      } else if (!claimed) {
        ctx.save(); ctx.fillStyle = '#fff6dd'; ctx.beginPath(); ctx.arc(helper.x + helper.w / 2, helper.y - 13, 10, 0, Math.PI * 2); ctx.fill();
        drawTile(ctx, helper.reward, helper.x + helper.w / 2 - 7, helper.y - 20, 14, theme, { icon: true }); ctx.restore();
      }
    }
    for (const dino of game.dinos) if (dino.alive && visible(dino)) {
      const rider = (game.players || [game.player]).find(p => p.mounted === dino);
      if(isSeaMount(dino)) { drawSeaCreature(ctx,dino,time,theme==='underwater-night'); continue; }
      drawDino(ctx, game.reversed ? { ...dino, facing: visualFacing(game, dino) } : dino, { airborne: !dino.grounded, moving: !!rider && Math.abs(rider.vx) > 10, time, reducedMotion });
    }
    drawWonderMagic(ctx,game,reducedMotion);
    drawWonderArena(ctx,game,time,reducedMotion);
    for (const enemy of game.enemies) if (enemy.alive && (isSeaEnemy(enemy) ? visible({...enemy,x:enemy.x-110,w:enemy.w+220}) : visible(enemy))) {
      const facing = visualFacing(game, enemy);
      const designTime = enemy.frozen || reducedMotion ? 0 : time;
      drawEnemyWings(ctx, enemy.design, enemy.x - 3, enemy.y - 6, enemy.w + 6, enemy.h + 6, designTime);
      if (enemy.kind === 'frog' && enemy.tongueLength > 0) {
        const tongue = frogTongue(enemy); rect(ctx, '#ba7b87', tongue.x, tongue.y, tongue.w, tongue.h); rect(ctx, '#efb4b6', tongue.x, tongue.y + 1, tongue.w, tongue.h - 2);
      }
      if (enemy.kind === 'wonder') drawWonderFoe(ctx,enemy,designTime,reducedMotion);
      else if (!drawEnemySprite(ctx,enemy,designTime,{facing,night:theme==='underwater-night'})) drawEnemyBody(ctx,enemy,designTime,facing,reducedMotion,theme);
      if (enemy.kind === 'robot' && enemy.phase === 'charge' && !enemy.bubbled) {
        const charge=Math.min(1,enemy.phaseTime/5);rect(ctx,'#536374',enemy.x,enemy.y-12,26,4);rect(ctx,'#f6d186',enemy.x,enemy.y-12,Math.round(26*charge),4);
      }
      if (enemy.kind === 'spiky') { rect(ctx, '#665266', enemy.x, enemy.y - 12, enemy.w, 3); rect(ctx, '#dc9a83', enemy.x, enemy.y - 12, enemy.w * enemy.hp / (enemy.maxHp || 3), 3); }
      drawEnemyFront(ctx, enemy.design, enemy.x - 3, enemy.y - 6, enemy.w + 6, enemy.h + 6, designTime, ['shell', 'fallen'].includes(enemy.phase));
      if (enemy.frozen > 0) {
        rect(ctx, '#a8eafa88', enemy.x - 3, enemy.y - 6, 32, 34);
        ctx.strokeStyle = '#e5fbff'; ctx.lineWidth = 1; ctx.strokeRect(enemy.x - 3, enemy.y - 6, 32, 34);
      }
      if (enemy.bubbled) drawBubble(ctx, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2 - 2, Math.max(enemy.w, enemy.h) / 2 + 10);
    }
    for (const ball of game.fireballs) if (visible(ball)) {
      if (ball.kind === 'bubble') drawBubble(ctx, ball.x + ball.w / 2, ball.y + ball.h / 2, ball.w / 2);
      else drawFireball(ctx, ball.x - 1, ball.y - 1, 10, time, ball.kind === 'ice');
    }
    for (const hazard of game.hazards) {
      if (!visible(hazard) && hazard.kind !== 'chainhead') continue;
      if (hazard.kind === 'wonder') drawWonderHazard(ctx,hazard,time);
      else if (hazard.kind === 'chainhead') {
        ctx.strokeStyle = '#c6c0aa'; ctx.lineWidth = 3;
        const dx = hazard.x + 14 - hazard.anchorX, dy = hazard.y + 14 - hazard.anchorY, links = Math.max(1,Math.ceil(Math.hypot(dx,dy)/9));
        for (let i=0;i<links;i++) { ctx.beginPath(); ctx.ellipse(hazard.anchorX+dx*i/links,hazard.anchorY+dy*i/links,5,3,Math.atan2(dy,dx),0,Math.PI*2); ctx.stroke(); }
        drawDesignedChainHead(ctx,hazard.x,hazard.y,28,hazard.design,time);
      }
      else if (hazard.kind === 'ant') {
        ctx.save(); ctx.globalAlpha = hazard.blinking && Math.floor((5-hazard.life)*8)%2 ? .2 : 1;
        for (let i=0;i<3;i++) { const cx=hazard.x+3+i*4; ctx.strokeStyle='#a12430'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx-2,hazard.y+8); ctx.lineTo(cx,hazard.y+4); ctx.lineTo(cx+2,hazard.y+8); ctx.stroke(); oval(ctx,'#e93435',cx,hazard.y+3,3,3); }
        ctx.restore();
      }
      else if (hazard.kind === 'spikeegg') {
        ctx.fillStyle='#963f51';
        for (let i=0;i<8;i++) { const a=i*Math.PI/4,cx=hazard.x+7,cy=hazard.y+9; ctx.beginPath();ctx.moveTo(cx+Math.cos(a-.3)*6,cy+Math.sin(a-.3)*8);ctx.lineTo(cx+Math.cos(a)*10,cy+Math.sin(a)*12);ctx.lineTo(cx+Math.cos(a+.3)*6,cy+Math.sin(a+.3)*8);ctx.fill(); }
        oval(ctx,'#fff0cb',hazard.x+7,hazard.y+9,6,8); oval(ctx,'#d54b59',hazard.x+6,hazard.y+6,2,3);
      }
      else if (hazard.kind === 'fire') drawFireball(ctx, hazard.x, hazard.y, hazard.w, time);
      else if (hazard.kind === 'hammer') { ctx.save(); ctx.translate(hazard.x + 5, hazard.y + 5); ctx.rotate(time * 9); rect(ctx, '#9e7e5d', -1, -2, 3, 11); rect(ctx, '#566175', -6, -5, 13, 6); rect(ctx, '#bac7c7', -6, -5, 13, 2); ctx.restore(); }
      else { ctx.save(); ctx.globalAlpha = Math.min(1, hazard.life * 4); ctx.fillStyle = '#f5ae55'; ctx.beginPath(); ctx.arc(hazard.x + 48, hazard.y + 48, 46, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff0aa'; ctx.beginPath(); ctx.arc(hazard.x + 48, hazard.y + 48, 28, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    }
    for (const p of game.players || [game.player]) {
    if (p.respawn > 0 || !visible(p)) continue;
    const playerIndex = game.players ? game.players.indexOf(p) : 0;
    const facing = visualFacing(game, p);
    const visualMount = p.mounted && game.reversed ? { ...p.mounted, facing: visualFacing(game, p.mounted) } : p.mounted;
    if (p.rocketStage) drawPlayerRocket(ctx, p, facing, time, reducedMotion);
    if (p.parachute) drawParachute(ctx, p, p.character || character, time, reducedMotion);
    const column = Math.floor((p.x + p.w / 2) / TILE);
    for (let row = Math.max(0, Math.ceil((p.y + p.h) / TILE)); row < tiles.length; row++) {
      if (![1, 2, 3, 5, 8, 12, 13, 65, ...Object.keys(PIPE_TYPES).map(Number)].includes(tiles[row]?.[column])) continue;
      const distance = row * TILE - p.y - p.h;
      if (distance < 100) oval(ctx, '#254c3430', p.x + p.w / 2, row * TILE + 2, 11 * (1 - distance / 140), 2.5);
      break;
    }
    for (const point of p.trail || []) {
      ctx.save(); ctx.globalAlpha = point.life / .65 * .75;
      RAINBOW_COLORS.forEach((color, i) => rect(ctx, color, point.x - 5, point.y - 6 + i * 2, 10, 2)); ctx.restore();
    }
    if (p.star > 0 || p.rainbow > 0) {
      ctx.strokeStyle = `hsl(${Math.floor(time * 170) % 360} 70% 72%)`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.mounted ? 33 : 23, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const angle = time * 3 + i * Math.PI * 2 / 5;
        rect(ctx, ['#fff0a8', '#ecc2ed', '#c3eee6'][i % 3], p.x + p.w / 2 + Math.cos(angle) * 26, p.y + p.h / 2 + Math.sin(angle) * 22, 3, 3);
      }
    }
    if (!(p.invincible > 0 && Math.floor(time * 12) % 2)) {
      ctx.save();
      const magicGravity = game.wonderland?.gravity;
      if (magicGravity === 'up' || magicGravity === 'right') {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        ctx.translate(cx, cy); ctx.rotate(magicGravity === 'up' ? Math.PI : -Math.PI / 2); ctx.translate(-cx, -cy);
      }
      const frame = p.grounded && Math.abs(p.vx) > 10 ? Math.floor(time * 9) : 0;
      if (isSeaMount(p.mounted)) hero(ctx,p.x-2,p.y-2,32,facing,p.shield,0,p.character||character,{appearance:p.appearance});
      else if (p.mounted) drawRider(ctx, visualMount, p.character || character, p.cat, { appearance: p.appearance, airborne: !p.grounded, moving: Math.abs(p.vx) > 10, time, reducedMotion });
      else if (p.cat) drawCat(ctx, p.x - 3, p.y - 4, facing, frame, p.instinct > 0, { airborne: !p.grounded, moving: Math.abs(p.vx) > 10, vy: p.vy, time, reducedMotion, landing: reducedMotion ? 0 : effects?.landings[playerIndex] || 0 });
      else hero(ctx, p.x - 3 * (game.wonderland?.scale || 1), p.y - 4 * (game.wonderland?.scale || 1), 32 * (game.wonderland?.scale || 1), facing, p.shield, frame, p.character || character, { appearance: p.appearance, won: game.state === 'won', reducedMotion, speed: Math.abs(p.vx), running: p.grounded && Math.abs(p.vx) > 10 && !p.mounted, airborne: !p.grounded, time: reducedMotion ? 0 : time, landing: reducedMotion ? 0 : effects?.landings[playerIndex] || 0 });
      if (p.shellHelmet) drawShellHelmet(ctx, { ...p, facing, mounted: visualMount }, { airborne: !p.grounded, moving: Math.abs(p.vx) > 10, time, reducedMotion });
      if (p.rainbowShoes) RAINBOW_COLORS.forEach((color, i) => {
        rect(ctx, color, p.x + 1, p.y + p.h - 6 + i, 8, 1); rect(ctx, color, p.x + p.w - 9, p.y + p.h - 6 + i, 8, 1);
      });
      ctx.restore();
    }
    if (p.instinct > 0) { ctx.save(); ctx.font = 'bold 9px sans-serif'; ctx.fillStyle = '#ffe396'; ctx.textAlign = 'center'; ctx.fillText('Jachtinstinct!', p.x + p.w / 2, p.y - 19); ctx.restore(); }
    if (p.fire) drawFireball(ctx, p.x + p.w - 2, p.y - 10, 8, time);
    if (p.ice) drawFireball(ctx, p.x + p.w - 2, p.y - 10, 8, time, true);
    if (p.bubblegun) {
      const seat = p.mounted ? dinoPlacement(p.mounted, creatureFrame('dino', { airborne: !p.grounded, moving: Math.abs(p.vx) > 10, time, reducedMotion })) : null;
      const facing = p.mounted?.facing || p.facing;
      drawBubbleGun(ctx, (seat?.seatX ?? p.x + p.w / 2) + facing * 10, seat ? seat.seatY - 6 : p.y + p.h * .50, facing, 20);
    }
    if (p.shield) { ctx.strokeStyle = '#d8fad2a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x + 11, p.y + 14, 24, 0, Math.PI * 2); ctx.stroke(); }
    if (game.players) { ctx.save(); ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#463e65'; ctx.fillText(p.appearance?.name || CHARACTER_NAMES[p.character], p.x + p.w / 2, p.y - (p.shellHelmet ? 29 : 14)); ctx.restore(); }
    }
    for (const rocket of game.departingRockets || []) if (visible(rocket)) drawRocket(ctx, rocket.x, rocket.y, { firing: true, direction: Math.sign(rocket.vx), time, reducedMotion });
    effects?.draw(ctx, left, right);
    drawSeaEffects(ctx,game,time);
    drawReverseIntro(ctx, game, viewport, width, height, character, reducedMotion);
    drawRocketIntro(ctx, game, viewport, width, height, character, reducedMotion);
  }
  if (beltStart && !game) {
    ctx.save(); ctx.strokeStyle = '#fff4a8'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
    ctx.strokeRect(beltStart.x * TILE, beltStart.y * TILE, TILE, TILE);
    if (hover && (hover.x !== beltStart.x || hover.y !== beltStart.y)) {
      const pending = createMechanisms({ ...level, tiles: [], belts: [{ a: beltStart, b: hover }] });
      ctx.globalAlpha = .65; drawMachinery(ctx, pending);
    }
    ctx.restore();
  }
  if (hover && !game) {
    const { x, y, id } = hover;
    ctx.fillStyle = id === 0 ? '#e3887a50' : '#ffffff60'; ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    ctx.strokeStyle = id === 0 ? '#cb8171' : '#8b70c8'; ctx.lineWidth = 2; ctx.strokeRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
    if (id) { ctx.globalAlpha = .65; drawTile(ctx, id, x * TILE, y * TILE, [46, 47].includes(id) ? TILE * 2 : TILE, level.theme, { character, ...terrainAppearance(level, x, y, tiles, id), revealContents: true }); ctx.globalAlpha = 1; }
  }
  ctx.restore();
}
export function preview(canvas, level, { focusStart = false } = {}) {
  const ctx = canvas.getContext('2d');
  let left = 0, top = level.tiles.length * TILE - 280;
  if (focusStart) {
    const startY = level.tiles.findIndex(row => row.includes(10));
    const startX = startY < 0 ? 0 : level.tiles[startY].indexOf(10);
    left = Math.max(0, Math.min(level.width * TILE - 640, (startX - 3) * TILE));
    top = Math.max(0, Math.min(level.tiles.length * TILE - 280, (startY - 5) * TILE));
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save();
  ctx.scale(canvas.width / 640, canvas.height / 280); background(ctx, 640, 280, level.theme);
  if (level.background) drawCrazyBackground(ctx, level.background, null, 640, 280);
  ctx.translate(-left, -top);
  const first = Math.floor(left / TILE), last = Math.min(level.width, Math.ceil((left + 640) / TILE));
  for (let y = 0; y < level.tiles.length; y++) for (let x = first; x < last; x++) {
    if (![46, 47].includes(level.tiles[y][x])) drawTile(ctx, level.tiles[y][x], x * TILE, y * TILE, TILE, level.theme, { top: level.tiles[y - 1]?.[x] !== 1, ...terrainAppearance(level, x, y) });
  }
  drawMachinery(ctx, createMechanisms(level));
  ctx.restore();
}

export function introArt(canvas) {
  const ctx = canvas.getContext('2d');
  drawTile(ctx, 2, 35, 70); drawTile(ctx, 3, 68, 70); drawTile(ctx, 2, 101, 70);
  hero(ctx, 67, 33, 38); drawTile(ctx, 4, 123, 12, 28); drawTile(ctx, 4, 145, 36, 24);
  ctx.strokeStyle = '#c4d1bf'; ctx.lineWidth = 2; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(27, 62); ctx.quadraticCurveTo(27, 3, 67, 22); ctx.stroke();
}

function drawChainBall(ctx, ball) {
  const cx = ball.x + 15, cy = ball.y + 15;
  ctx.strokeStyle = '#c4d0df'; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const f = i / 8; ctx.beginPath(); ctx.ellipse(ball.anchorX + (cx - ball.anchorX) * f, ball.anchorY + (cy - ball.anchorY) * f, 3, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
  const fire = ball.id >= 72;
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; ctx.fillStyle = fire ? '#ff8b34' : '#d9e4ed'; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - .25) * 12, cy + Math.sin(a - .25) * 12); ctx.lineTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20); ctx.lineTo(cx + Math.cos(a + .25) * 12, cy + Math.sin(a + .25) * 12); ctx.fill(); }
  oval(ctx, fire ? '#ffb42e' : '#687b94', cx, cy, 15, 15); oval(ctx, fire ? '#ffe988' : '#9aacbf', cx - 4, cy - 5, 6, 4);
  if (ball.id % 2) { rect(ctx, '#fff', cx - 9, cy - 5, 7, 7); rect(ctx, '#fff', cx + 3, cy - 5, 7, 7); rect(ctx, '#222d40', cx - 5, cy - 3, 3, 4); rect(ctx, '#222d40', cx + 4, cy - 3, 3, 4); rect(ctx, '#653c39', cx - 5, cy + 7, 10, 3); }
}

export function releasePlatformSprites(){for(const sprite of spriteCache.values()){sprite.width=1;sprite.height=1;}spriteCache.clear();}

export function drawEnemyBody(ctx, enemy, designTime=0, facing=enemy.facing||1, reducedMotion=false, theme='grass') {
      if (enemy.kind === 'wonder') drawWonderFoe(ctx,enemy,designTime,reducedMotion);
      else if (isSeaEnemy(enemy)) drawSeaCreature(ctx,enemy,designTime,theme==='underwater-night');
      else if (enemy.kind === 'beetle' || enemy.kind === 'spikedbeetle') drawHelmetBeetle(ctx, enemy.x, enemy.y, { spike: enemy.kind === 'spikedbeetle', folded: enemy.phase === 'folded', facing, time: enemy.frozen || enemy.phase === 'folded' ? 0 : designTime });
      else if (enemy.kind === 'centipede') drawCentipede(ctx, enemy.x, enemy.y, enemy.w, enemy.phase, facing, designTime);
      else if (enemy.kind === 'cloud') drawTile(ctx, 82, enemy.x - 3, enemy.y - 3);
      else if (enemy.kind === 'crusher') drawCrusher(ctx, enemy.x, enemy.y, enemy.w, enemy.phase);
      else if (enemy.kind === 'robot') {
        const charge = enemy.phase === 'charge' ? Math.min(1, enemy.phaseTime / 5) : 0;
        drawRobot(ctx, enemy.x - 3, enemy.y - 6, charge, facing, designTime, enemy.variant === 'angry');
      } else if (enemy.kind === 'frog') {
        drawFrog(ctx, enemy.x - 3, enemy.y - 6, facing, enemy.phase === 'crawl', designTime, enemy.variant === 'red');
      } else if (enemy.boss && enemy.kind === 'spiky') {
        drawCastleBoss(ctx, enemy, facing, enemy.frozen ? 0 : designTime);
      } else if (['turtle', 'skeleton', 'spiky', 'hammer'].includes(enemy.kind)) {
        ctx.save(); ctx.translate(enemy.x - 3, enemy.y - (enemy.phase === 'fallen' ? 20 : enemy.phase === 'shell' ? 14 : 6));
        if (enemy.kind === 'spiky') ctx.scale(enemy.boss ? 1.8 : 1.35, enemy.boss ? 1.7 : 1.2);
        drawTurtle(ctx, 0, 0, enemy.kind, enemy.phase, facing, enemy.vx ? designTime : 0); ctx.restore();
      } else if (enemy.kind === 'plane') { ctx.save(); ctx.translate(enemy.x + (facing < 0 ? 32 : 0), enemy.y); ctx.scale(facing, 1); drawTile(ctx, 77, 0, 0); ctx.restore(); }
      else if (enemy.kind === 'dragon') drawDragon(ctx, enemy.x - 3, enemy.y - 6, facing, designTime);
      else if (enemy.kind === 'plant') { ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.scale(1, 1.5); drawPlant(ctx, 0, 0, enemy.frozen || reducedMotion ? 0 : enemy.phaseTime); ctx.restore(); }
      else if (enemy.kind === 'bomb') drawBomb(ctx, enemy.x - 3, enemy.y - 6, enemy.fuse, designTime);
      else drawMonsterArt(ctx, 'walker', enemy.x - 3, enemy.y - 6, { time: designTime, facing, moving: !!enemy.vx });
}
