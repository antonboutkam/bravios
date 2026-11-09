import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, P_SWITCH_BLOCKS } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

function level() {
  const l = blankLevel(40);
  l.tiles[10][5] = 80; l.tiles[10][8] = 4; l.tiles[10][9] = 2;
  [...P_SWITCH_BLOCKS].forEach((id, x) => { l.tiles[6][x] = id; });
  return l;
}
function stand(p) { Object.assign(p, { x: 5 * 32 + 5, y: 10 * 32 - p.h, vx: 0, vy: 0, grounded: true }); }
function activate(g) { stand(g.player); stepGame(g, {}); }
function tick(g, n) { for (let i = 0; i < n; i++) stepGame(g, {}, 1 / 30); }

test('P-schakelaar kan worden opgeslagen en activeert alleen van boven', () => {
  const l = blankLevel(40); l.tiles[10][5] = 80;
  assert.deepEqual(validateLevel(l), l);
  const g = createGame(l);
  Object.assign(g.player, { x: 5 * 32 + 5, y: 11 * 32, vy: -200 });
  stepGame(g, {}); assert.equal(g.pSwitch, null);
  activate(g); assert.equal(g.tiles[10][5], 81); assert.equal(g.pSwitch.remaining, 30);
});

test('alle vaste bloksoorten wisselen, resterende tiles keren na exact 30 seconden terug', () => {
  const l = level(), g = createGame(l); activate(g);
  [...P_SWITCH_BLOCKS].forEach((id, x) => assert.equal(g.tiles[6][x], 4));
  assert.equal(g.tiles[10][8], 2);
  tick(g, 899); assert.ok(g.pSwitch); assert.equal(g.tiles[10][9], 4);
  tick(g, 1); assert.equal(g.pSwitch, null);
  assert.deepEqual(g.tiles[6], l.tiles[6]); assert.equal(g.tiles[10][8], 4);
  assert.equal(g.tiles[10][5], 81); tick(g, 2); assert.equal(g.pSwitch, null);
  assert.equal(l.tiles[10][5], 80);
});

test('opgepakte muntjes en kapotte tijdelijke bakstenen blijven weg', () => {
  const g = createGame(level()); activate(g);
  Object.assign(g.player, { x: 9 * 32 + 5, y: 10 * 32, vy: 0 });
  stepGame(g, {}); assert.equal(g.tiles[10][9], 0); assert.ok(g.coins > 0);
  Object.assign(g.player, { x: 8 * 32 + 5, y: 11 * 32, vy: -200 });
  stepGame(g, {}); assert.equal(g.tiles[10][8], 0);
  stand(g.player); tick(g, 900);
  assert.equal(g.tiles[10][9], 0); assert.equal(g.tiles[10][8], 0);
});

test('pauze bevriest de timer en opnieuw starten herstelt het level', () => {
  const l = level(), g = createGame(l); activate(g); g.state = 'paused'; tick(g, 120);
  assert.equal(g.pSwitch.remaining, 30); assert.equal(createGame(l).tiles[10][5], 80);
});

test('tweede speler kan activeren, snapshot bewaart timer en timer loopt eenmaal per frame', () => {
  const g = createCoopGame(level()); stand(g.players[1]);
  stepCoopGame(g, [{}, {}]); assert.equal(g.tiles[10][5], 81);
  stand(g.players[0]);
  const copy = unpackCoopGame(packCoopGame(g));
  assert.deepEqual(copy.pSwitch, g.pSwitch);
  const before = g.pSwitch.remaining; stepCoopGame(g, [{}, {}], 1 / 30);
  assert.ok(Math.abs(g.pSwitch.remaining - (before - 1 / 30)) < 1e-8);
});

test('timer herstelt ook een wereld die tijdelijk buiten beeld is', () => {
  const g = createGame(level()); activate(g);
  const outside = { tiles: structuredClone(g.tiles), pSwitch: structuredClone(g.pSwitch) };
  g.caveState.outside = outside; g.caveState.active = 'cave'; g.pSwitch = null;
  outside.pSwitch.remaining = 1 / 30;
  stepGame(g, {}, 1 / 30);
  assert.equal(outside.pSwitch, null); assert.equal(outside.tiles[10][8], 4);
});
