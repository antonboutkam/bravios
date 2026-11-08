import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, ROWS, RAINBOW_SECONDS, blankLevel, validateLevel, createGame, stepGame, pipeConnections, worldTheme, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame, remoteControls } from '../coop.mjs';

function advance(game, seconds, input = {}) {
  for (let i = 0; i < Math.round(seconds * 120); i++) stepGame(game, input);
}
function setup() { const game = createGame(blankLevel(40)); advance(game, .2); return game; }
function collect(game, id) { game.tiles[13][2] = id; stepGame(game, {}); }
function enemyAtPlayer(game) {
  return { kind: 'walker', x: game.player.x, y: game.player.y, w: 26, h: 26, vx: 0, vy: 0, alive: true };
}
function pipes(ids = [32, 33]) {
  const level = blankLevel(40); ids.forEach((id, i) => { level.tiles[13][5 + i * 8] = id; });
  const game = createGame(level); advance(game, .2);
  Object.assign(game.player, { x: 5 * TILE + 5, y: 13 * TILE - 28, grounded: true }); return game;
}

test('rainbow, belletje en buisvarianten blijven behouden bij export en import', () => {
  const level = blankLevel(40); [30, 31, 32, 33, 34].forEach((id, i) => { level.tiles[13][5 + i] = id; });
  assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
  level.tiles[0][0] = 48; assert.throws(() => validateLevel(level));
});
test('rainbow beschermt precies 2 minuten, schoenen blijven en een gewone ster verkort rainbow niet', () => {
  const game = setup(); collect(game, 30);
  assert.equal(game.player.rainbow, RAINBOW_SECONDS); assert.equal(game.tiles[13][2], 0);
  advance(game, 110); collect(game, 14); assert.ok(game.player.rainbow > 9);
  advance(game, 10.1); assert.equal(game.player.rainbow, 0); assert.equal(game.player.rainbowShoes, true);
  game.enemies.push(enemyAtPlayer(game)); stepGame(game, {}); assert.equal(game.state, 'dead');
  const exact = setup(); collect(exact, 30); advance(exact, 120); assert.equal(exact.player.rainbow, 0);
});
test('rainbow verslaat vijanden en beschermt tegen lava, stekels en bommen', () => {
  for (const hazard of [7, 26, 'enemy', 'blast']) {
    const game = setup(); collect(game, 30);
    if (typeof hazard === 'number') game.tiles[13][2] = hazard;
    if (hazard === 'enemy') game.enemies.push(enemyAtPlayer(game));
    if (hazard === 'blast') game.hazards.push({ kind: 'blast', ...enemyAtPlayer(game), life: .3 });
    stepGame(game, {}); assert.equal(game.state, 'playing', String(hazard));
    if (hazard === 'enemy') assert.equal(game.enemies[0].alive, false);
  }
});
test('rainbow redt uit gaten en zoekt nieuwe grond wanneer de vorige veilige plek verdwenen is', () => {
  const game = setup(); collect(game, 30);
  game.tiles[14][2] = 0; game.tiles[15][2] = 0;
  advance(game, 1); assert.equal(game.state, 'playing'); assert.ok(game.player.y < ROWS * TILE);
  assert.ok(game.player.x >= 3 * TILE || game.player.x < 2 * TILE);
});
test('rainbow spoor blijft na de timer werken en is begrensd; pauze bevriest alles', () => {
  const game = setup(); collect(game, 30); game.player.rainbow = .1;
  advance(game, 1, { right: true }); assert.equal(game.player.rainbow, 0); assert.ok(game.player.trail.length > 0); assert.ok(game.player.trail.length <= 18);
  game.state = 'paused'; const before = clone(game.player); advance(game, 5); assert.deepEqual(game.player, before);
  game.state = 'playing'; advance(game, 1); assert.equal(game.player.trail.length, 0);
});
test('belletje maakt een kat en nacht, met een veel hogere sprong dan normaal', () => {
  const normal = setup(), cat = setup(); collect(cat, 31);
  assert.equal(cat.player.cat, true); assert.equal(worldTheme(cat), 'night'); assert.equal(cat.theme, 'grass');
  advance(normal, .4, { jump: true }); advance(cat, .4, { jump: true });
  assert.ok(cat.player.y < normal.player.y - 100);
});
test('kat ontwijkt gaten ook zonder rainbow en verliest kattenvorm na een vijand', () => {
  const game = setup(); collect(game, 31); game.tiles[14][2] = 0; game.tiles[15][2] = 0;
  advance(game, 1); assert.equal(game.state, 'playing'); assert.ok(game.player.y < ROWS * TILE - 80);
  const hit = setup(); collect(hit, 31); hit.enemies.push(enemyAtPlayer(hit)); stepGame(hit, {});
  assert.equal(hit.state, 'playing'); assert.equal(hit.player.cat, false); assert.equal(worldTheme(hit), 'grass');
});
test('vliegende dingen nemen kort de kat over; daarna werkt eigen bediening ondanks hetzelfde doel', () => {
  for (const kind of ['dragon', 'hammer', 'fire', 'robot']) {
    const game = setup(); collect(game, 31);
    const flying = { x: game.player.x + 95, y: game.player.y - 55, w: 10, h: 10, vx: 0, vy: 0, life: 3, alive: true, kind, baseY: game.player.y - 55, phase: 'jump', phaseTime: 0, grounded: false };
    if (kind === 'dragon' || kind === 'robot') game.enemies.push(flying);
    else if (kind === 'hammer') game.hazards.push(flying);
    else game.fireballs.push(flying);
    stepGame(game, { left: true }); assert.ok(game.player.instinct > 0, kind); assert.ok(game.player.vx > 0, kind); assert.ok(game.player.vy < 0, kind);
    advance(game, .85, { left: true }); assert.equal(game.player.instinct, 0, kind); assert.ok(game.player.vx < 0, kind);
  }
  const quiet = setup(); collect(quiet, 31); stepGame(quiet, { right: true }); assert.equal(quiet.player.instinct, 0);
});
test('ingang naar uitgang werkt alleen met een bewuste actie en behoudt krachten', () => {
  const game = pipes(); game.player.cat = true; game.player.rainbow = 100; game.player.rainbowShoes = true;
  stepGame(game, {}); assert.ok(game.player.x < 6 * TILE);
  stepGame(game, { pipe: true }); assert.ok(game.player.x > 13 * TILE); assert.ok(game.player.y + game.player.h < 13 * TILE);
  assert.equal(game.player.cat, true); assert.equal(game.player.rainbowShoes, true); assert.ok(game.player.rainbow > 99);
  advance(game, 1.1, { pipe: true }); assert.ok(game.player.x > 13 * TILE);
});
test('uitgang, losse ingang en geblokkeerde uitgang vervoeren niemand', () => {
  for (const ids of [[33, 32], [32], [5, 33]]) {
    const game = pipes(ids); stepGame(game, { pipe: true }); assert.ok(game.player.x < 6 * TILE);
  }
  const blocked = pipes(); blocked.tiles[12][13] = 1; stepGame(blocked, { pipe: true }); assert.ok(blocked.player.x < 6 * TILE);
});
test('twee richtingen verbinden in paren, vasthouden stuurt je niet terug, loslaten wel', () => {
  const game = pipes([34, 34, 34, 34]);
  stepGame(game, { pipe: true }); assert.ok(game.player.x > 13 * TILE);
  advance(game, 1.1, { pipe: true }); assert.ok(game.player.x > 13 * TILE);
  stepGame(game, {}); stepGame(game, { pipe: true }); assert.ok(game.player.x < 6 * TILE);
  const routes = pipeConnections(game.tiles); assert.equal(routes[2].to.x, 29); assert.equal(routes[3].to.x, 21);
});
test('meerdere ingangen verbinden op volgorde zonder de gewone buis te veranderen', () => {
  const game = pipes([32, 33, 32, 33]); const routes = pipeConnections(game.tiles);
  assert.equal(routes[0].to.x, 13); assert.equal(routes[1].to.x, 29);
});
test('samen spelen deelt nacht en bewaart nieuwe krachten en spoor in de snapshot', () => {
  const game = createCoopGame(blankLevel(40)); stepCoopGame(game, [{}, {}]);
  Object.assign(game.players[1], { cat: true, rainbow: 120, rainbowShoes: true });
  const originalX = game.players[0].x; stepCoopGame(game, [{}, { right: true }]);
  assert.equal(worldTheme(game), 'night'); assert.equal(game.players[0].cat, false); assert.equal(game.players[0].x, originalX);
  const snapshot = packCoopGame(game), restored = unpackCoopGame(snapshot);
  assert.equal(restored.player.cat, true); assert.equal(restored.player.rainbowShoes, true); assert.equal(worldTheme(restored), 'night');
  assert.deepEqual(packCoopGame(restored), snapshot);
  game.players[1].respawn = 1; assert.equal(worldTheme(game), 'grass');
});
test('de tweede speler kan een buis gebruiken en snelle buistaps bereiken de host één keer', () => {
  const level = blankLevel(40); level.tiles[13][5] = 32; level.tiles[13][13] = 33;
  const game = createCoopGame(level); Object.assign(game.players[1], { x: 5 * TILE + 5, y: 13 * TILE - 28, grounded: true });
  stepCoopGame(game, [{}, { pipe: true }]); assert.ok(game.players[1].x > 13 * TILE); assert.ok(game.players[0].x < 3 * TILE);
  const taps = {}; assert.equal(remoteControls({ taps: { pipe: 1 } }, taps).pipe, true);
  assert.equal(remoteControls({ taps: { pipe: 1 } }, taps).pipe, false);
});
