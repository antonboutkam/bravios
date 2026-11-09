import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, FREEZE_SECONDS } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame, remoteControls } from '../coop.mjs';
import { CHARACTER_PROFILES } from '../characters/roster.mjs';

function advance(game, seconds, inputs = []) {
  for (let i = 0; i < Math.round(seconds * 120); i++) {
    if (game.players) stepCoopGame(game, inputs); else stepGame(game, inputs);
  }
}
test('ijsbloem vervangt vuur; vuurbloem vervangt ijs', () => {
  const game = createGame(blankLevel(40)); advance(game, .2, {});
  game.player.fire = true; game.tiles[13][2] = 19; stepGame(game, {});
  assert.equal(game.player.ice, true); assert.equal(game.player.fire, false);
  game.tiles[13][2] = 15; stepGame(game, {});
  assert.equal(game.player.ice, false); assert.equal(game.player.fire, true);
});
test('ijsbal bevriest een vijand vier seconden en stopt bij muren', () => {
  const level = blankLevel(40); level.tiles[13][6] = 21;
  const game = createGame(level); game.player.ice = true;
  advance(game, .4, { fire: true });
  const robot = game.enemies[0]; assert.equal(robot.alive, true); assert.ok(robot.frozen > FREEZE_SECONDS - .2);
  game.fireballs = [];
  const x = robot.x, phase = robot.phaseTime;
  advance(game, 3, {}); assert.equal(robot.x, x); assert.equal(robot.phaseTime, phase);
  advance(game, 1.2, {}); assert.equal(robot.frozen, 0); assert.ok(robot.phaseTime > phase);
  game.player.fireCooldown = 0; game.tiles[13][4] = 1; stepGame(game, { fire: true });
  advance(game, .3, {}); assert.equal(game.fireballs.length, 0);
});
test('bevroren kikker doet geen pijn met lijf of tong; ijsbescherming vangt één aanraking op', () => {
  const level = blankLevel(40); level.tiles[13][8] = 20;
  const game = createGame(level); advance(game, .5, {});
  const frog = game.enemies[0]; frog.frozen = 4;
  game.player.x = frog.x; stepGame(game, {}); assert.equal(game.state, 'playing'); assert.equal(frog.tongueLength, 0);
  game.player.ice = true; frog.frozen = 0; stepGame(game, {});
  assert.equal(game.state, 'playing'); assert.equal(game.player.ice, false); assert.ok(game.player.invincible > 0);
});
test('rode kikker en boze robot houden dezelfde timers als hun gewone varianten', () => {
  const level = blankLevel(40); [17, 21, 18, 20].forEach((id, i) => level.tiles[13][15 + i * 3] = id);
  const game = createGame(level, { random: () => .9 }); advance(game, 3, {});
  const robots = game.enemies.filter(e => e.kind === 'robot'), frogs = game.enemies.filter(e => e.kind === 'frog');
  assert.deepEqual(frogs.map(e => e.phase), ['crawl', 'crawl']); assert.equal(frogs[1].variant, 'red');
  advance(game, 2, {}); assert.deepEqual(robots.map(e => e.phase), ['jump', 'jump']);
  assert.ok(robots.every(e => e.vx > 0)); assert.equal(robots[1].variant, 'angry');
});
test('twee spelers hebben eigen bediening; wereld en vijandtimers lopen één keer', () => {
  const level = blankLevel(40); level.tiles[13][20] = 17;
  const ids = Object.keys(CHARACTER_PROFILES), primary = ids.at(-1);
  const game = createCoopGame(level, primary); advance(game, .2);
  const [p, q] = game.players, x = p.x, y = q.x;
  advance(game, 1, [{ right: true }, { left: true }]);
  assert.ok(p.x > x + 190); assert.ok(q.x < y); assert.equal(p.character, primary); assert.equal(q.character, ids[0]);
  assert.ok(Math.abs(game.time - 1.2) < 1e-8); assert.ok(Math.abs(game.enemies[0].phaseTime - 1.2) < 1e-8);
});
test('tweede speler begint naast de eerste, tenzij daar terrein of gevaar staat', () => {
  const level = blankLevel(40), open = createCoopGame(level);
  assert.ok(open.players[1].x > open.players[0].x);
  for (const id of [1, 26, 27]) {
    level.tiles[13][3] = id; const game = createCoopGame(level);
    assert.equal(game.players[1].x, game.players[0].x);
  }
});
test('muntjes en bloemen worden gedeeld en kunnen slechts eenmaal worden opgepakt', () => {
  const game = createCoopGame(blankLevel(40)); advance(game, .2);
  game.tiles[13][2] = 4; stepCoopGame(game, [{}, {}]); assert.equal(game.coins, 1);
  game.tiles[13][2] = 19; stepCoopGame(game, [{}, {}]);
  assert.equal(game.players.filter(p => p.ice).length, 1); assert.equal(game.tiles[13][2], 0);
});
test('slechts één speler kan op dezelfde dino rijden', () => {
  const level = blankLevel(40); level.tiles[13][3] = 16;
  const game = createCoopGame(level); advance(game, .2);
  stepCoopGame(game, [{ mount: true }, { mount: true }]);
  assert.equal(game.players.filter(p => p.mounted).length, 1);
  const rider = game.players.find(p => p.mounted), dino = rider.mounted;
  advance(game, .5, [{ right: true }, {}]); assert.equal(dino.x, rider.x);
});
test('vallen kost alleen die speler een poging en geeft daarna een veilige nieuwe start', () => {
  const game = createCoopGame(blankLevel(40)); advance(game, .2);
  game.players[0].y = 600; stepCoopGame(game, [{}, { right: true }]);
  assert.equal(game.state, 'playing'); assert.ok(game.players[0].respawn > 0);
  const x = game.players[1].x; advance(game, 1.6, [{}, { right: true }]);
  assert.equal(game.players[0].respawn, 0); assert.equal(game.players[0].x, game.players[0].spawn.x);
  assert.ok(game.players[0].invincible > 0); assert.ok(game.players[1].x > x + 200);
});
test('bij een gedeelde finish wint het team; pauze bevriest beide spelers', () => {
  const game = createCoopGame(blankLevel(40)); advance(game, .2);
  game.state = 'paused'; const snapshot = packCoopGame(game); advance(game, 2, [{ right: true }, { right: true }]);
  assert.deepEqual(packCoopGame(game), snapshot);
  game.state = 'playing'; game.players[1].x = game.finish.x * 32 + 5; stepCoopGame(game, [{}, {}]);
  assert.equal(game.state, 'won');
});
test('netwerksnapshot herstelt spelers en de gedeelde dino zonder de bron te wijzigen', () => {
  const level = blankLevel(40); level.tiles[13][3] = 16;
  const game = createCoopGame(level); advance(game, .2); stepCoopGame(game, [{ mount: true }, {}]);
  const snapshot = packCoopGame(game), copy = unpackCoopGame(JSON.parse(JSON.stringify(snapshot)));
  assert.equal(copy.player, copy.players[1]); assert.equal(copy.players[0].mounted, copy.dinos[0]);
  assert.deepEqual(packCoopGame(copy), snapshot); copy.tiles[0][0] = 1; assert.equal(game.tiles[0][0], 0);
});
test('korte netwerktoetsen worden eenmaal uitgevoerd en vastgehouden toetsen blijven actief', () => {
  const taps = {}, packet = { taps: { jump: 1, fire: 1, mount: 1 } };
  assert.equal(remoteControls(packet, taps).jump, true); assert.equal(remoteControls(packet, taps).mount, false);
  assert.equal(remoteControls({ ...packet, fire: true }, taps).fire, true);
  packet.taps.mount++; assert.equal(remoteControls(packet, taps).mount, true);
  assert.equal(remoteControls({}, {}).right, false);
});
