import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, exampleLevel, validateLevel, createGame, stepGame, clone, frogTongue, STAR_SECONDS } from '../engine.mjs';

function advance(game, seconds, input = {}) { for (let i = 0; i < Math.round(seconds * 120); i++) stepGame(game, input); }
function setup(id, x = 20, random = () => .1) {
  const level = blankLevel(40); if (id) level.tiles[13][x] = id;
  const game = createGame(level, { random }); advance(game, .2); return game;
}
function contactEnemy(game) {
  const p = game.player;
  return { x: p.x, y: 14 * 32 - 26, w: 26, h: 26, vx: 0, vy: 0, alive: true, grounded: true };
}

test('nieuwe onderdelen zijn exporteerbaar; bestaande levels blijven geldig', () => {
  const level = blankLevel(); [14, 15, 16, 17, 18, 19, 20, 21].forEach((id, i) => level.tiles[13][i + 5] = id);
  assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
  assert.deepEqual(validateLevel(blankLevel()), blankLevel());
  level.tiles[0][0] = 13; assert.throws(() => validateLevel(level));
  level.tiles[0][0] = 48; assert.throws(() => validateLevel(level));
});
test('het voorbeeld met nieuwe krachten is geldig; spelen verandert geen bouwonderdelen', () => {
  const level = exampleLevel('powers'), before = clone(level);
  assert.deepEqual(validateLevel(level), level);
  const game = createGame(level); advance(game, 2, { right: true, fire: true }); assert.deepEqual(level, before);
});
test('ster verslaat vijanden, beschermt tegen stekels en verliest zijn kracht na 10 seconden', () => {
  const game = setup(); game.tiles[13][2] = 14; stepGame(game, {});
  assert.equal(game.player.star, STAR_SECONDS); assert.equal(game.tiles[13][2], 0);
  game.enemies.push(contactEnemy(game)); stepGame(game, {});
  assert.equal(game.enemies[0].alive, false); assert.equal(game.state, 'playing');
  game.tiles[13][2] = 7; advance(game, .5); assert.equal(game.state, 'playing');
  game.tiles[13][2] = 0; advance(game, 10); assert.equal(game.player.star, 0);
  game.enemies.push(contactEnemy(game)); stepGame(game, {}); assert.equal(game.state, 'dead');
});
test('een ster houdt de speler niet tegen als hij in een gat valt', () => {
  const game = setup(); game.player.star = 10;
  for (const row of game.tiles) row[2] = 0;
  advance(game, 1); assert.equal(game.state, 'dead');
});
test('vuurbloem geeft vuurballen met een afkoeltijd en schiet in de kijkrichting', () => {
  const game = setup(); stepGame(game, { fire: true }); assert.equal(game.fireballs.length, 0);
  game.tiles[13][2] = 15; stepGame(game, {}); assert.equal(game.player.fire, true);
  stepGame(game, { fire: true }); assert.equal(game.fireballs.length, 1); assert.ok(game.fireballs[0].vx > 0);
  advance(game, .1, { fire: true }); assert.equal(game.fireballs.length, 1);
  advance(game, .3, { fire: true }); assert.equal(game.fireballs.length, 2);
  game.player.facing = -1; game.player.fireCooldown = 0; stepGame(game, { fire: true }); assert.ok(game.fireballs.some(ball => ball.vx < 0));
});
test('een vuurbal verslaat een robot en verdwijnt bij een muur', () => {
  const game = setup(17, 6); game.player.fire = true;
  advance(game, .45, { fire: true }); assert.equal(game.enemies[0].alive, false);
  const blocked = setup(); blocked.player.fire = true; blocked.tiles[13][4] = 1;
  stepGame(blocked, { fire: true }); advance(blocked, .3); assert.equal(blocked.fireballs.length, 0); assert.equal(blocked.tiles[13][4], 1);
});
test('vuurkracht absorbeert een aanraking met een vijand', () => {
  const game = setup(); game.player.fire = true; game.enemies.push(contactEnemy(game)); stepGame(game, {});
  assert.equal(game.player.fire, false); assert.equal(game.state, 'playing'); assert.ok(game.player.invincible > 0);
});
test('op een dino stappen, samen lopen en afstappen werkt', () => {
  const game = setup(16, 3), dino = game.dinos[0];
  stepGame(game, { mount: true }); assert.equal(game.player.mounted, dino); assert.equal(game.player.h, 48);
  const x = game.player.x; advance(game, .5, { right: true }); assert.ok(game.player.x > x + 90);
  assert.equal(dino.x, game.player.x); assert.equal(dino.y + dino.h, game.player.y + game.player.h);
  stepGame(game, { mount: true }); assert.equal(game.player.mounted, null); assert.equal(game.player.h, 28); assert.equal(game.state, 'playing');
});
test('op de rug landen stapt automatisch op een dino', () => {
  const game = setup(16, 10), dino = game.dinos[0], p = game.player;
  p.x = dino.x + 2; p.y = dino.y - p.h - 2; p.vy = 240; p.grounded = false;
  advance(game, .05); assert.equal(p.mounted, dino);
});
test('opstappen onder een laag plafond stopt het personage niet in een blok', () => {
  const game = setup(16, 3); game.tiles[12][3] = 1; stepGame(game, { mount: true });
  assert.equal(game.player.mounted, null); assert.equal(game.player.h, 28);
});
test('een aanraking op de dino laat je afstappen met tijdelijke bescherming', () => {
  const game = setup(16, 3); stepGame(game, { mount: true });
  game.enemies.push(contactEnemy(game)); stepGame(game, {});
  assert.equal(game.player.mounted, null); assert.equal(game.state, 'playing'); assert.ok(game.player.invincible > 0); assert.equal(game.dinos[0].alive, true);
});
test('robot laadt precies 5 seconden op en kan beide kanten op springen', () => {
  for (const random of [() => .1, () => .9]) {
    const game = setup(17, 20, random), robot = game.enemies[0];
    advance(game, 4.7); assert.equal(robot.phase, 'charge'); assert.equal(robot.vx, 0);
    advance(game, .1); assert.equal(robot.phase, 'jump'); assert.ok(robot.vy < 0);
    assert.equal(Math.sign(robot.vx), random() < .5 ? -1 : 1);
    advance(game, .8); assert.equal(robot.phase, 'charge'); assert.ok(robot.phaseTime < .4);
    const remaining = 5 - robot.phaseTime;
    advance(game, remaining - .02); assert.equal(robot.phase, 'charge');
    advance(game, .03); assert.equal(robot.phase, 'jump');
  }
});
test('kikker wisselt 3 seconden tong met 3 seconden langzaam kruipen af', () => {
  const game = setup(18), frog = game.enemies[0], x = frog.x;
  advance(game, 2.7); assert.equal(frog.phase, 'tongue'); assert.equal(frog.x, x); assert.ok(frog.tongueLength > 0);
  advance(game, .1); assert.equal(frog.phase, 'crawl'); assert.equal(frog.tongueLength, 0);
  advance(game, 2.9); assert.ok(frog.x < x - 60); assert.ok(frog.x > x - 70);
  advance(game, .1); assert.equal(frog.phase, 'tongue');
  const stopped = frog.x; advance(game, .5); assert.equal(frog.x, stopped); assert.ok(frog.tongueLength > 0);
});
test('tong raakt spelers op afstand, maar een ster beschermt', () => {
  for (const star of [0, 5]) {
    const game = setup(18), frog = game.enemies[0]; advance(game, .2);
    game.player.x = frog.x - 60; game.player.star = star;
    stepGame(game, {}); assert.equal(game.state, star ? 'playing' : 'dead');
  }
});
test('de kikkertong gaat niet door een muur', () => {
  const game = setup(18, 10); game.tiles[13][8] = 5; advance(game, .2);
  const tongue = frogTongue(game.enemies[0]); assert.ok(tongue.x >= 9 * 32); assert.ok(tongue.w < 88);
});
test('pauze bevriest sterren en de timers van robot en kikker', () => {
  const level = blankLevel(40); level.tiles[13][20] = 17; level.tiles[13][25] = 18;
  const game = createGame(level); game.player.star = 10; advance(game, .5);
  const star = game.player.star, phases = game.enemies.map(e => e.phaseTime);
  game.state = 'paused'; advance(game, 5);
  assert.equal(game.player.star, star); assert.deepEqual(game.enemies.map(e => e.phaseTime), phases);
});
