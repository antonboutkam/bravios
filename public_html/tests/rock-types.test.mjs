import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, clone, PALETTE_GROUPS } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

const advance = (g, count, input = {}) => { for (let i = 0; i < count; i++) stepGame(g, input); };
function stand(p, x, floor) { Object.assign(p, { x, y: floor - p.h, vx: 0, vy: 0, grounded: true }); }
function slopeLevel(id) {
  const l = blankLevel(40);
  for (let i = 0; i < 6; i++) l.tiles[7 + i][id === 69 ? 10 + i : 15 - i] = id;
  return l;
}

test('nieuwe rotsen blijven bewaarbaar en staan in de juiste bouwgroepen', () => {
  const l = blankLevel(40);
  [66, 67, 68, 69].forEach((id, i) => l.tiles[12][10 + i] = id);
  assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(l))), l);
  assert.ok(PALETTE_GROUPS.find(g => g.id === 'caves').items.includes(66));
  assert.ok([67, 68, 69].every(id => PALETTE_GROUPS.find(g => g.id === 'terrain').items.includes(id)));
});

test('verborgen grot reist naar binnen en terug zonder meteen opnieuw naar binnen te gaan', () => {
  const l = blankLevel(40); l.tiles[13][10] = 66;
  const g = createGame(l); stand(g.player, 10 * 32 + 5, 448); stepGame(g, {});
  assert.equal(g.caveState.active, '10,13'); assert.equal(g.theme, 'night');
  stand(g.player, 2 * 32 + 5, 448); stepGame(g, {});
  assert.equal(g.caveState.active, null); assert.equal(g.tiles[13][10], 66);
  advance(g, 60); assert.equal(g.caveState.active, null);
});

test('instortende steen reageert alleen op erop lopen, pauze bevriest en herstart herstelt', () => {
  const l = blankLevel(40); l.tiles[10][10] = 67;
  const g = createGame(l);
  stand(g.player, 10 * 32 - g.player.w, 11 * 32); advance(g, 40, { right: true });
  assert.equal(g.tiles[10][10], 67); assert.equal(g.crumbling.length, 0);
  const safe = clone(g.player.safeSpot);
  stand(g.player, 10 * 32 + 5, 320); stepGame(g, {});
  assert.equal(g.crumbling.length, 1); assert.deepEqual(g.player.safeSpot, safe);
  const remaining = g.crumbling[0].remaining; g.state = 'paused'; advance(g, 120);
  assert.equal(g.crumbling[0].remaining, remaining); g.state = 'playing';
  advance(g, 28); assert.equal(g.tiles[10][10], 0); assert.ok(g.player.y > 320 - g.player.h);
  assert.equal(createGame(l).tiles[10][10], 67); assert.equal(l.tiles[10][10], 67);
});

for (const id of [68, 69]) {
  const sign = id === 68 ? -1 : 1;
  test(`helling ${id}: landt op de diagonaal en glijdt zonder invoer over zes aansluitingen`, () => {
    const g = createGame(slopeLevel(id)); const x = (id === 69 ? 10 : 15) * 32 + 5;
    Object.assign(g.player, { x, y: 5 * 32, vx: 0, vy: 0 });
    let landed = false, surfaceChecks = 0;
    for (let i = 0; i < 130; i++) {
      stepGame(g, {});
      if (g.player.slope) {
        landed = true; surfaceChecks++;
        assert.equal(g.player.slope, sign); assert.ok(g.player.grounded);
      }
    }
    assert.ok(landed); assert.ok(surfaceChecks > 30);
    assert.ok((g.player.x - x) * sign > 140); assert.ok(g.player.y > 10 * 32);
  });
  test(`helling ${id}: glijdt ook onder water omlaag`, () => {
    const l = slopeLevel(id); l.theme = 'underwater'; const g = createGame(l);
    const x = (id === 69 ? 10 : 15) * 32 + 5;
    Object.assign(g.player, { x, y: 5 * 32, vx: 0, vy: 0 });
    advance(g, 200);
    assert.ok((g.player.x - x) * sign > 90);
  });
  test(`helling ${id}: springen, vrije driehoek en massieve onderkant`, () => {
    const l = blankLevel(40); l.tiles[10][10] = id;
    const g = createGame(l); stand(g.player, 10 * 32 + 5, 320 - 1); g.player.grounded = false;
    advance(g, 20); assert.equal(g.player.slope, sign);
    const y = g.player.y; stepGame(g, { jump: true });
    assert.ok(g.player.y < y); assert.equal(g.player.grounded, false);
    Object.assign(g.player, { x: 325, y: 353, vx: 0, vy: -300, grounded: false });
    stepGame(g, { jump: true }); assert.equal(g.player.y, 352); assert.equal(g.player.vy, 0);
  });
}

test('co-op deelt instorting en bewaart timers bij snapshots en grotreizen', () => {
  const l = blankLevel(40); l.tiles[10][10] = 67; l.tiles[13][20] = 66;
  const g = createCoopGame(l); stand(g.players[1], 325, 320);
  stepCoopGame(g, [{}, {}]); assert.equal(g.crumbling.length, 1);
  const restored = unpackCoopGame(packCoopGame(g)); assert.deepEqual(restored.crumbling, g.crumbling);
  for (let i = 0; i < 28; i++) stepCoopGame(restored, [{}, {}]);
  assert.equal(restored.tiles[10][10], 0);
  stand(g.players[1], 645, 448); stepCoopGame(g, [{}, {}]);
  assert.equal(g.caveState.active, '20,13'); assert.equal(g.crumbling.length, 0);
  stand(g.players[0], 69, 448); stepCoopGame(g, [{}, {}]);
  assert.equal(g.caveState.active, null); assert.equal(g.crumbling.length, 1);
});
