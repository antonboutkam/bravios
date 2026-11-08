import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, RAINBOW_FART_SECONDS, blankLevel, validateLevel, createGame, stepGame, positions, pipeConnections, clone, updateRainbowFart, rainbowFartHits } from '../engine.mjs';
import { CRAZY_FIELDS, crazyLevel } from '../levels.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

export function crazyControls(game, field, frame) {
  const p = game.player;
  let target = game.finish.x * TILE;
  if (field.route === 'down') {
    const floors = [];
    for (let y = 8; y < field.height - 5; y += 8) floors.push(y);
    const floor = floors.findIndex(y => p.y + p.h <= y * TILE + .1);
    if (floor >= 0) target = (floor % 2 === 0 ? field.width - 2 : 1) * TILE;
  }
  return { left: p.x > target + 8, right: p.x < target - 3, jump: frame % 100 < 65 };
}
test('tien gekke velden bewaren hun achtergrond, hebben veel buizen en alle reisbuizen hebben vrije partners', () => {
  assert.equal(CRAZY_FIELDS.length, 10);
  assert.equal(new Set(CRAZY_FIELDS.map(f => f.name)).size, 10);
  for (let index = 0; index < 10; index++) {
    const level = crazyLevel(index);
    assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
    assert.equal(positions(level, 10).length, 1); assert.equal(positions(level, 11).length, 1);
    assert.ok(level.tiles.flat().filter(id => [5, 32, 33, 34].includes(id)).length >= 15, level.name);
    assert.ok(positions(level, 41).length);
    for (const { from, to } of pipeConnections(level.tiles)) {
      assert.ok(to, `${level.name}: buis ${from.x},${from.y}`);
      assert.equal(level.tiles[to.y - 1][to.x], 0, `${level.name}: vrije uitgang`);
      assert.equal(level.tiles[to.y - 2][to.x], 0, `${level.name}: hoofdruimte`);
    }
    const start = positions(level, 10)[0], finish = positions(level, 11)[0];
    if (CRAZY_FIELDS[index].route === 'left') assert.ok(start.x > finish.x);
    if (CRAZY_FIELDS[index].route === 'down') assert.ok(start.y < finish.y - 16);
  }
  assert.throws(() => crazyLevel(10));
  assert.throws(() => validateLevel({ ...crazyLevel(), background: 'unknown' }));
});
test('alle tien gekke routes zijn met gewone sprongen bereikbaar, zonder buisverkorting of krachten', () => {
  CRAZY_FIELDS.forEach((field, index) => {
    const level = crazyLevel(index), original = clone(level), game = createGame(level);
    game.enemies = []; game.helpers = []; game.tiles = game.tiles.map(row => row.map(id => [41, 42, 43, 44, 45].includes(id) ? 0 : id));
    for (let frame = 0; frame < 120 * 100 && game.state === 'playing'; frame++) stepGame(game, crazyControls(game, field, frame));
    assert.equal(game.state, 'won', `${level.name}: ${game.player.x},${game.player.y}`);
    assert.deepEqual(level, original);
  });
});
function advance(game, seconds, input = {}) { for (let i = 0; i < Math.round(seconds * 120); i++) stepGame(game, input); }
function fartGame() {
  const level = blankLevel(120); level.tiles[13][2] = 10; level.tiles[13][3] = 41;
  const game = createGame(level); advance(game, .25); advance(game, .2, { right: true }); return game;
}
test('Rainbowfart is een aparte beloning, bouwt een begrensd lang spoor en verdwijnt na twintig seconden', () => {
  const level = blankLevel(40); level.tiles[13][5] = 41; assert.deepEqual(validateLevel(level), level);
  const game = fartGame(), p = game.player;
  assert.ok(p.rainbowFart > RAINBOW_FART_SECONDS - .5); assert.equal(p.rainbow, 0); assert.equal(p.rainbowShoes, false);
  advance(game, 2.5, { right: true });
  assert.ok(p.fartTrail.length > 20); const distance = p.fartTrail.at(-1).x - p.fartTrail[0].x;
  assert.ok(distance > 300 && distance <= 320.01, distance);
  game.state = 'paused'; const before = clone(game); advance(game, 2); assert.deepEqual(clone(game), before);
  game.state = 'playing'; p.rainbowFart = .1; advance(game, .2); assert.equal(p.rainbowFart, 0); assert.deepEqual(p.fartTrail, []);
});
test('het spoor verslaat tegenstanders achter de speler en mist tegenstanders buiten het lint', () => {
  const game = fartGame(); advance(game, 2, { right: true });
  const p = game.player, enemyLevel = blankLevel(120); enemyLevel.tiles[13][12] = 27;
  const enemy = createGame(enemyLevel).enemies[0]; enemy.x = p.x - 140; enemy.y = p.y;
  game.enemies = [enemy]; stepGame(game, {}); assert.equal(enemy.alive, false);
  assert.equal(rainbowFartHits(p, { x: p.x - 100, y: p.y - 120, w: 26, h: 26 }), false);
  assert.equal(rainbowFartHits(p, { x: p.x + 100, y: p.y, w: 26, h: 26 }), false);
  // Swept collisions also catch an enemy between sparse trail points.
  const ribbon = { rainbowFart: 1, fartTrail: [{ x: 0, y: 0 }, { x: 200, y: 0 }] };
  assert.equal(rainbowFartHits(ribbon, { x: 95, y: -10, w: 10, h: 20 }), true);
  const limit = { ...p, fartLength: 160, fartTrail: [] };
  for (let x = 0; x < 500; x += 10) { limit.x = x; updateRainbowFart(limit, 1 / 120); }
  assert.ok(limit.fartTrail.at(-1).x - limit.fartTrail[0].x <= 160.01);
});
test('buisreizen wissen het spoor en samen spelen bewaart de beloning zonder de andere speler kracht te geven', () => {
  const level = blankLevel(72); level.tiles[13][5] = 32; level.tiles[13][20] = 33;
  const game = createGame(level); advance(game, .2);
  Object.assign(game.player, { x: 5 * TILE + 5, y: 13 * TILE - 28, grounded: true, rainbowFart: 10, fartTrail: [{ x: 20, y: 420, life: 3 }] });
  stepGame(game, { pipe: true }); assert.ok(game.events.includes('pipe')); assert.ok(game.player.fartTrail.every(point => point.x > 600));
  const coopLevel = blankLevel(40); coopLevel.tiles[13][3] = 41;
  const coop = createCoopGame(coopLevel);
  for (let i = 0; i < 30; i++) stepCoopGame(coop, [{}, {}]);
  assert.equal(coop.players[0].rainbowFart, 0); assert.ok(coop.players[1].rainbowFart > 0);
  const restored = unpackCoopGame(packCoopGame(coop)); assert.deepEqual(restored.players, coop.players);
});

test('Rainbowfart verslaat alle vijandsoorten, geeft geen lavabescherming en herstarten wist de kracht', () => {
  for (const id of [6, 17, 18, 20, 21, 22, 23, 24, 25, 27, 28, 29]) {
    const game = fartGame(); advance(game, 2, { right: true });
    const level = blankLevel(120); level.tiles[13][9] = id;
    const enemy = createGame(level).enemies[0]; enemy.x = game.player.x - 100; enemy.y = game.player.y;
    game.enemies = [enemy]; stepGame(game, {}); assert.equal(enemy.alive, false, `vijand ${id}`);
  }
  const game = fartGame();
  game.tiles[13][Math.floor(game.player.x / TILE)] = 26;
  stepGame(game, {}); assert.equal(game.state, 'dead'); assert.equal(game.player.rainbowFart, 0); assert.deepEqual(game.player.fartTrail, []);
  const fresh = createGame(blankLevel(40)); assert.equal(fresh.player.rainbowFart, 0); assert.deepEqual(fresh.player.fartTrail, []);
});
