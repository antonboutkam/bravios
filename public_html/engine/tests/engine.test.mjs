import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, blankLevel, exampleLevel, validateLevel, resizeLevel, createGame, stepGame, clone } from '../engine.mjs';

function advance(game, input = {}, seconds = .5) { for (let i = 0; i < seconds * 120; i++) stepGame(game, input, 1 / 120); }
function groundedGame() { const game = createGame(blankLevel(40)); advance(game, {}, .2); return game; }

test('voorbeeldlevels zijn geldige bestanden en spelen wijzigt het bouwveld niet', () => {
  for (const type of ['first', 'coins', 'night']) {
    const level = exampleLevel(type), before = clone(level); assert.deepEqual(validateLevel(level), level);
    const game = createGame(level); advance(game, { right: true }, 2); assert.deepEqual(level, before);
  }
});
test('ongeldige afmetingen, thema, blokjes en dubbele startplekken worden geweigerd', () => {
  for (const modify of [l => l.width = 9999, l => l.theme = '__proto__', l => l.tiles[0][0] = 13, l => l.tiles[2][2] = 10, l => l.tiles.pop(), l => l.tiles[0].pop(), l => l.name = '']) {
    const level = blankLevel(); modify(level); assert.throws(() => validateLevel(level));
  }
});
test('spelen vereist een startplek en een finish', () => {
  const level = blankLevel(); level.tiles[13][2] = 0; assert.throws(() => createGame(level));
  level.tiles[13][2] = 10; level.tiles[13][68] = 0; assert.throws(() => createGame(level));
});
test('speler landt op de grond en loopt er niet doorheen', () => {
  const game = groundedGame(); advance(game, { right: true }, 2);
  assert.equal(game.player.y + game.player.h, 14 * TILE); assert.equal(game.player.grounded, true); assert.equal(game.state, 'playing'); assert.ok(game.player.x > 400);
});
test('horizontale botsing houdt de speler tegen', () => {
  const level = blankLevel(40); level.tiles[13][5] = 5; const game = createGame(level);
  advance(game, { right: true }, 1); assert.equal(game.player.x + game.player.w, 5 * TILE);
});
test('springen werkt, langer vasthouden springt hoger, vasthouden veroorzaakt geen herhaalde sprong', () => {
  const held = groundedGame(), short = groundedGame();
  advance(held, { jump: true }, .1); advance(short, { jump: true }, .1);
  advance(held, { jump: true }, .25); advance(short, {}, .25);
  assert.ok(held.player.y < short.player.y - 20);
  advance(held, { jump: true }, 2); assert.equal(held.player.grounded, true);
});
test('muntjes verdwijnen en tellen maar eenmaal', () => {
  const level = blankLevel(40); level.tiles[13][4] = 4; const game = createGame(level);
  advance(game, { right: true }, .5); assert.equal(game.coins, 1); assert.equal(game.tiles[13][4], 0);
  advance(game, { left: true }, .5); assert.equal(game.coins, 1);
});
test('vraagblok geeft één muntje bij raken van onderen, ook over een bloknaad', () => {
  const level = blankLevel(40); level.tiles[10][2] = 3; level.tiles[10][3] = 1;
  const game = createGame(level); advance(game, {}, .2);
  game.player.x = 2 * TILE + 20;
  advance(game, { jump: true }, .4);
  assert.equal(game.coins, 1); assert.equal(game.tiles[10][2], 13); assert.ok(game.player.y >= 11 * TILE);
  advance(game, {}, 1); advance(game, { jump: true }, .5); assert.equal(game.coins, 1);
});
test('baksteen breekt wanneer de speler hem van onderen raakt', () => {
  const level = blankLevel(40); level.tiles[10][2] = 2;
  const game = createGame(level); advance(game, {}, .2); advance(game, { jump: true }, .5); assert.equal(game.tiles[10][2], 0);
});
test('springveer lanceert de speler', () => {
  const game = groundedGame(); game.tiles[13][4] = 8; game.player.x = 4 * TILE + 5; game.player.y = 11 * TILE; game.player.vy = 200;
  advance(game, {}, .3); assert.ok(game.player.vy < -400); assert.equal(game.state, 'playing');
});
test('finish aanraken wint en beëindigt de simulatie', () => {
  const game = groundedGame(); game.player.x = 36 * TILE + 5; stepGame(game, {});
  assert.equal(game.state, 'won'); const time = game.time; advance(game, { right: true }, 1); assert.equal(game.time, time);
});
test('ook de bovenkant van de finishvlag is bereikbaar tijdens een sprong', () => {
  const game = groundedGame(); game.player.x = 36 * TILE + 5; game.player.y = 11 * TILE;
  stepGame(game, {}); assert.equal(game.state, 'won');
});
test('vallen en stekels kosten een poging', () => {
  const falling = groundedGame(); for (const row of falling.tiles) row[2] = 0; advance(falling, {}, 1); assert.equal(falling.state, 'dead');
  const spikes = groundedGame(); spikes.tiles[13][2] = 7; spikes.player.shield = true; stepGame(spikes, {}); assert.equal(spikes.state, 'dead');
});
test('vijand aanraken kost een poging; paddenstoel beschermt eenmaal', () => {
  const unprotected = groundedGame(); unprotected.enemies.push({ ...unprotected.player, vx: -48, alive: true }); stepGame(unprotected, {}); assert.equal(unprotected.state, 'dead');
  const protectedGame = groundedGame(); protectedGame.tiles[13][2] = 9; stepGame(protectedGame, {}); assert.equal(protectedGame.player.shield, true);
  protectedGame.enemies.push({ ...protectedGame.player, vx: -48, alive: true }); stepGame(protectedGame, {});
  assert.equal(protectedGame.state, 'playing'); assert.equal(protectedGame.player.shield, false); assert.ok(protectedGame.player.invincible > 0);
});
test('op een vijand landen verslaat hem en laat de speler stuiteren', () => {
  const game = groundedGame(); const p = game.player; game.enemies.push({ x: p.x, y: 14 * TILE - 26, w: 26, h: 26, vx: -48, vy: 0, grounded: true, alive: true });
  p.y = 14 * TILE - 26 - p.h - 2; p.vy = 300; p.grounded = false;
  advance(game, {}, .05); assert.equal(game.enemies[0].alive, false); assert.equal(game.state, 'playing'); assert.ok(p.vy < 0);
});
test('vergroten houdt bestaande tegels en voegt grond toe zonder het origineel te veranderen', () => {
  const level = blankLevel(40), grown = resizeLevel(level, 72);
  assert.equal(level.width, 40); assert.equal(grown.tiles[13][36], 11); assert.equal(grown.tiles[14][71], 1); assert.equal(grown.tiles[0][71], 0); assert.deepEqual(validateLevel(grown), grown);
});
