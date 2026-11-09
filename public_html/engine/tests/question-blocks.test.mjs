import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, ITEMS, PALETTE_GROUPS, QUESTION_REWARDS, blankLevel, validateLevel, createGame, stepGame, STAR_SECONDS, RAINBOW_SECONDS } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { drawTile } from '../art.mjs';

function hit(game, player = game.player) {
  Object.assign(player, { x: 3 * TILE + 5, y: 11 * TILE + 2, vy: -400, grounded: false });
  if (game.players) stepCoopGame(game, [{}, { jump: true }]);
  else stepGame(game, { jump: true });
}
const checks = {
  3: p => assert.equal(p.coins, 1),
  35: p => assert.equal(p.shield, true),
  36: p => { assert.equal(p.fire, true); assert.equal(p.ice, false); },
  37: p => { assert.equal(p.ice, true); assert.equal(p.fire, false); },
  38: p => assert.equal(p.star, STAR_SECONDS),
  39: p => { assert.equal(p.rainbow, RAINBOW_SECONDS); assert.equal(p.rainbowShoes, true); },
  40: p => { assert.equal(p.cat, true); assert.equal(p.instinctCooldown, 0); }
};
for (const id of Object.keys(checks).map(Number)) {
  test(`vraagblok ${id} is stevig en geeft één keer zijn eigen beloning`, () => {
    const level = blankLevel(40); level.tiles[10][3] = id;
    const game = createGame(level);
    Object.assign(game.player, { ice: true, fire: true });
    hit(game); checks[id](game.player);
    assert.equal(game.tiles[10][3], 13); assert.equal(level.tiles[10][3], id);
    const coins = game.coins;
    hit(game); assert.equal(game.events.length, 0); assert.equal(game.coins, coins);
    assert.ok(game.player.y >= 11 * TILE);
  });
  test(`vraagblok ${id} beloont in co-op de speler die het raakt`, () => {
    const level = blankLevel(40); level.tiles[10][3] = id;
    const game = createCoopGame(level);
    hit(game, game.players[1]); checks[id](game.players[1]);
    assert.equal(game.players[0].coins, 0);
    assert.equal(game.players[0].shield, false); assert.equal(game.players[0].fire, false);
    assert.equal(game.players[0].ice, false); assert.equal(game.players[0].star, 0);
    assert.equal(game.players[0].rainbow, 0); assert.equal(game.players[0].cat, false);
    assert.equal(game.tiles[10][3], 13);
    const restored = unpackCoopGame(packCoopGame(game));
    assert.deepEqual(restored.players, game.players); assert.equal(restored.tiles[10][3], 13);
  });
}
test('alle varianten blijven behouden bij export; groepen overlappen niet', () => {
  const level = blankLevel(40);
  Object.keys(QUESTION_REWARDS).forEach((id, i) => level.tiles[10][i + 3] = Number(id));
  assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
  const groups = PALETTE_GROUPS.flatMap(group => group.items);
  assert.equal(new Set(groups).size, groups.length);
  assert.deepEqual(PALETTE_GROUPS.find(g => g.id === 'questions').items, [...Object.keys(QUESTION_REWARDS).map(Number), 76]);
  assert.deepEqual(PALETTE_GROUPS.find(g => g.id === 'terrain').items, [1, 2, 65, 67, 68, 69, 75, 12, 26]);
  groups.forEach(id => assert.ok(ITEMS.some(item => item.id === id)));
  level.tiles[0][0] = 48; assert.throws(() => validateLevel(level));
});
function paint(id, revealContents) {
  const calls = [];
  const ctx = new Proxy({ createLinearGradient: () => ({ addColorStop() {} }) }, { get: (target, key) => key in target ? target[key] : (...args) => calls.push([key, ...args]) });
  drawTile(ctx, id, 0, 0, 34, 'grass', { revealContents });
  return calls;
}
test('vraagblokken verbergen hun inhoud tijdens het spelen en tonen die in de bouwer', () => {
  const hidden = paint(3, false);
  for (const id of Object.keys(QUESTION_REWARDS).map(Number)) {
    assert.deepEqual(paint(id, false), hidden);
    assert.notDeepEqual(paint(id, true), hidden);
  }
});
