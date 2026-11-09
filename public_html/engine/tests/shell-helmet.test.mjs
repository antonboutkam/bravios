import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, blankLevel, createGame, stepGame, nearbyShell, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { drawShellHelmet } from '../art.mjs';

function step(game, input = {}) { game.players ? stepCoopGame(game, [input, {}]) : stepGame(game, input); }
function advance(game, frames, input = {}) { for (let i = 0; i < frames; i++) step(game, input); }
function shellGame(coop = false) {
  const level = blankLevel(40); level.tiles[13][14] = 22;
  const game = coop ? createCoopGame(level) : createGame(level);
  advance(game, 24);
  const shell = game.enemies[0], p = game.player;
  Object.assign(p, { x: shell.x + 3, y: shell.y - p.h - 2, vy: 300, grounded: false });
  advance(game, 5); assert.equal(shell.phase, 'shell');
  Object.assign(p, { x: shell.x - 35, y: 14 * TILE - p.h, vy: 0, grounded: true });
  return game;
}
test('één sprong maakt een schild dat de speler met een bewuste actie als helm opzet', () => {
  const game = shellGame(), shell = nearbyShell(game);
  assert.ok(shell); assert.equal(game.player.shellHelmet, false);
  step(game, { mount: true });
  assert.equal(game.player.shellHelmet, true); assert.equal(shell.alive, false);
  assert.ok(game.events.includes('helmet')); assert.equal(nearbyShell(game), null);
  advance(game, 120, { mount: true }); assert.equal(game.player.shellHelmet, true);
});
test('aanraken blijft wegschoppen; lopende, bewegende, bevroren en verre schildpadden kun je niet opzetten', () => {
  const game = shellGame(), shell = game.enemies[0], p = game.player;
  for (const change of [{ phase: 'walk' }, { vx: 240 }, { frozen: 2 }, { x: 30 * TILE }]) {
    const original = clone(shell); Object.assign(shell, change); assert.equal(nearbyShell(game), null); Object.assign(shell, original);
  }
  p.x = shell.x - p.w + 1; step(game);
  assert.ok(shell.vx > 0); assert.equal(p.shellHelmet, false);
});
test('helm vangt één vijandaanraking op en behoudt andere krachten', () => {
  const game = shellGame(); step(game, { mount: true });
  const p = game.player; p.fire = true; p.shield = true;
  game.hazards.push({ kind: 'hammer', x: p.x, y: p.y, w: 10, h: 10, vx: 0, vy: 0, life: 2 });
  step(game); assert.equal(game.state, 'playing'); assert.equal(p.shellHelmet, false);
  assert.ok(p.invincible > 1); assert.equal(p.fire, true); assert.equal(p.shield, true);
});
test('pauze bevriest de helm; lava en herstarten ruimen hem op', () => {
  const game = shellGame(); step(game, { mount: true });
  game.state = 'paused'; const before = clone(game); advance(game, 120); assert.deepEqual(clone(game), before);
  game.state = 'playing'; game.tiles[13][Math.floor(game.player.x / TILE)] = 26;
  step(game); assert.equal(game.state, 'dead'); assert.equal(game.player.shellHelmet, false);
  assert.equal(createGame(blankLevel(40)).player.shellHelmet, false);
});
test('beide spelers kunnen een helm dragen; hetzelfde schild kan maar één keer worden opgepakt', () => {
  const game = shellGame(true), shell = game.enemies[0];
  Object.assign(game.players[1], { x: game.player.x, y: game.player.y, grounded: true, vy: 0 });
  stepCoopGame(game, [{ mount: true }, { mount: true }]);
  assert.equal(game.players[0].shellHelmet, true); assert.equal(game.players[1].shellHelmet, false); assert.equal(shell.alive, false);
  const second = { ...shell, alive: true, x: game.players[1].x + 35 }; game.enemies.push(second);
  stepCoopGame(game, [{}, {}]); stepCoopGame(game, [{}, { mount: true }]);
  assert.equal(game.players[1].shellHelmet, true);
  const restored = unpackCoopGame(packCoopGame(game)); assert.deepEqual(restored.players, game.players);
  game.players[1].y = 800; stepCoopGame(game, [{}, {}]); advance(game, 190);
  assert.equal(game.players[1].shellHelmet, false); assert.equal(game.players[0].shellHelmet, true);
});
test('de helm reist mee door een buis en verandert de hitbox niet', () => {
  const game = shellGame(); step(game, { mount: true });
  const p = game.player, shape = [p.w, p.h];
  game.tiles[13][5] = 32; game.tiles[13][20] = 33;
  Object.assign(p, { x: 5 * TILE + 5, y: 13 * TILE - p.h, grounded: true });
  step(game, { pipe: true }); assert.ok(game.events.includes('pipe')); assert.equal(p.shellHelmet, true); assert.deepEqual([p.w, p.h], shape);
});
test('de helm wordt boven het hoofd getekend en volgt bewegen, omdraaien en kattenvorm', () => {
  for (const facing of [-1, 1]) for (const cat of [false, true]) {
    const calls = [], ctx = new Proxy({}, { get: (_, key) => (...args) => calls.push([key, ...args]), set: () => true });
    const p = { x: 100, y: 200, w: 22, h: 28, facing, cat }, before = clone(p);
    drawShellHelmet(ctx, p, { moving: true, time: .1 });
    assert.ok(calls.some(([method, , y]) => method === 'translate' && y < p.y - 20));
    assert.deepEqual(p, before);
  }
});
