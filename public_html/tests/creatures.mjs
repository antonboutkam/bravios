import { blankLevel, createGame, stepGame, worldTheme } from '../engine.mjs?v=12';
import { drawWorld, creatureFrame } from '../art.mjs?v=13';
import { loadLook } from '../look.mjs?v=8';
import { SceneEffects } from '../presentation.mjs?v=2';

const canvas = document.querySelector('#world'), ctx = canvas.getContext('2d');
const detail = document.querySelector('#detail').getContext('2d'), effects = new SceneEffects();
let level, game, mode = 'boaz', movement = null, movementUntil = 0;
function reset(nextMode) {
  mode = nextMode; level = blankLevel(40);
  level.tiles[13][3] = 16;
  if (mode.startsWith('cat')) level.tiles[13][4] = 31;
  game = createGame(level); game.player.character = mode === 'ravi' ? 'ravi' : 'boaz';
  if (mode.startsWith('cat')) game.player.x = 4 * 32 + 5;
  for (let i = 0; i < 30; i++) stepGame(game, {});
  if (mode !== 'cat') { stepGame(game, { mount: true }); stepGame(game, {}); }
  effects.reset(game); movement = null; movementUntil = 0;
}
for (const button of document.querySelectorAll('[data-mode]')) button.addEventListener('click', () => reset(button.dataset.mode));
for (const button of document.querySelectorAll('[data-action]')) button.addEventListener('click', () => {
  const action = button.dataset.action;
  if (['left', 'right'].includes(action)) { movement = action; movementUntil = game.time + .5; }
  else { stepGame(game, { [action]: true }); stepGame(game, {}); }
});
let last = 0, accumulator = 0;
function frame(timestamp) {
  accumulator += Math.min((timestamp - last) / 1000 || 0, .05); last = timestamp;
  while (accumulator >= 1 / 120) {
    stepGame(game, movement && game.time < movementUntil ? { [movement]: true } : {});
    accumulator -= 1 / 120;
  }
  effects.observe(game);
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  drawWorld(ctx, level, { game, time: game.time, character: game.player.character, effects, viewport: { left: 0, right: 960 } });
  detail.clearRect(0, 0, 320, 320); detail.imageSmoothingEnabled = true;
  detail.drawImage(canvas, (game.player.x + game.player.w / 2 - 40) * 2, (game.player.y - 20) * 2, 160, 160, 0, 0, 320, 320);
  const p = game.player, cat = p.cat ? 'echt katje' : p.character === 'ravi' ? 'Ravi' : 'Boaz';
  const pose = creatureFrame(p.cat && !p.mounted ? 'cat' : 'dino', { airborne: !p.grounded, moving: Math.abs(p.vx) > 10, vy: p.vy, time: game.time });
  document.querySelector('#status').textContent = `${cat} · ${p.mounted ? 'op de dino' : 'op eigen voeten'} · ${p.facing < 0 ? 'links' : 'rechts'} · ${worldTheme(game)} · ${pose}`;
  requestAnimationFrame(frame);
}
try {
  await loadLook(); reset(mode);
  for (const button of document.querySelectorAll('button')) button.disabled = false;
  requestAnimationFrame(frame);
} catch (error) { document.querySelector('#status').textContent = error.message; }
