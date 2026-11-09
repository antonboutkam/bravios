import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, exampleLevel, validateLevel, createGame, stepGame, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

function advance(game, seconds) { for (let i = 0; i < Math.round(seconds * 120); i++) game.players ? stepCoopGame(game, [{}, {}]) : stepGame(game, {}); }
function setup(id, row = 13) { const level = blankLevel(40); level.tiles[row][14] = id; const game = createGame(level); advance(game, .2); return game; }
function dropOn(game, enemy) { Object.assign(game.player, { x: enemy.x + 3, y: enemy.y - game.player.h - 2, vy: 300, grounded: false }); advance(game, .04); }
function shootAt(game, enemy, kind = 'fire') { game.fireballs.push({ kind, x: enemy.x + 8, y: enemy.y + Math.min(5, enemy.h - 9), w: 8, h: 8, vx: 0, vy: 0, life: 3, alive: true }); stepGame(game, {}); }

test('alle slechteriken en lava kunnen worden bewaard; grote sprites verwijderen de juiste editorcel', () => {
  const level = blankLevel(40); [22, 23, 24, 25, 26, 27, 28, 29].forEach((id, i) => level.tiles[13][10 + i * 2] = id);
  const before = clone(level); assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
  const game = createGame(level); assert.equal(game.enemies.length, 7); assert.equal(game.tiles[13][18], 26);
  assert.equal(game.tiles[13][14], 0); assert.equal(game.tiles[12][14], 0); assert.equal(game.tiles[13][20], 0);
  assert.deepEqual(level, before); assert.deepEqual(validateLevel(exampleLevel('villains')), exampleLevel('villains'));
});
test('schildpad trekt zich terug, kan worden geschopt en raakt andere vijanden', () => {
  const game = setup(22), turtle = game.enemies[0]; dropOn(game, turtle);
  assert.equal(turtle.alive, true); assert.equal(turtle.phase, 'shell'); assert.equal(turtle.h, 18); assert.equal(turtle.vx, 0);
  Object.assign(game.player, { x: turtle.x - 15, y: 420, vy: 0, grounded: true }); stepGame(game, {});
  assert.ok(turtle.vx > 0); assert.equal(game.state, 'playing');
  game.player.x = 64;
  game.enemies.push({ x: turtle.x + 50, y: 422, w: 26, h: 26, vx: 0, vy: 0, grounded: true, alive: true });
  advance(game, .3); assert.equal(game.enemies[1].alive, false);
});
test('een bewegend schild is gevaarlijk en kan met een sprong worden gestopt', () => {
  const game = setup(22), turtle = game.enemies[0]; dropOn(game, turtle);
  turtle.vx = 240; turtle.safe = 0; dropOn(game, turtle); assert.equal(turtle.vx, 0);
  turtle.vx = -240; turtle.safe = 0;
  Object.assign(game.player, { x: turtle.x + 2, y: 420, vy: 0, grounded: true }); stepGame(game, {});
  assert.equal(game.state, 'dead');
});
test('weggeschopte schilden gaan in beide richtingen door dikke muren en buizen en blijven op de grond', () => {
  for (const direction of [-1, 1]) for (const material of [1, 2, 3, 5, 12, 32, 33, 34]) {
    const game = setup(22), turtle = game.enemies[0]; dropOn(game, turtle);
    game.player.x = 64; game.player.y = 420;
    for (let y = 8; y < 14; y++) for (let x = 18; x <= 20; x++) game.tiles[y][x] = material;
    Object.assign(turtle, { x: (direction > 0 ? 16 : 23) * 32, y: 448 - turtle.h, vy: 0, vx: direction * 240, grounded: true });
    advance(game, 1.2);
    assert.equal(turtle.vx, direction * 240, `richting ${direction}, muur ${material}`);
    assert.ok(direction > 0 ? turtle.x > 21 * 32 : turtle.x + turtle.w < 18 * 32);
    assert.equal(turtle.y + turtle.h, 448); assert.equal(turtle.grounded, true);
  }
});
test('lopende schildpadden botsen op muren; schilden keren nog om aan de veldrand en vallen in gaten', () => {
  const walking = setup(22), walker = walking.enemies[0];
  walker.x = 16 * 32; walker.vx = 40;
  for (let y = 8; y < 14; y++) walking.tiles[y][18] = 1;
  advance(walking, 1.2); assert.ok(walker.vx < 0); assert.ok(walker.x + walker.w <= 18 * 32);
  const game = setup(22), turtle = game.enemies[0]; dropOn(game, turtle);
  game.player.x = 64; game.player.y = 420;
  Object.assign(turtle, { x: 40 * 32 - turtle.w - 2, y: 448 - turtle.h, vy: 0, vx: 240 });
  advance(game, .1); assert.equal(turtle.vx, -240); assert.ok(turtle.x + turtle.w <= 40 * 32);
  for (let y = 14; y < 16; y++) for (let x = 30; x < 40; x++) game.tiles[y][x] = 0;
  advance(game, 1); assert.equal(turtle.alive, false);
});
test('draak vliegt heen en weer en blijft zweven in plaats van op de vloer te vallen', () => {
  const game = setup(23, 8), dragon = game.enemies[0], firstY = dragon.y;
  advance(game, 1); assert.notEqual(dragon.y, firstY); assert.ok(Math.abs(dragon.y - dragon.baseY) <= 18.1);
  advance(game, 9); assert.ok(dragon.x >= 0 && dragon.x + dragon.w <= game.width * 32); assert.ok(dragon.y < 320); assert.equal(dragon.alive, true);
});
test('plant staat stil, hapt om de beurt met beide koppen en kan niet worden platgesprongen', () => {
  const game = setup(24), plant = game.enemies[0], x = plant.x, y = plant.y;
  assert.equal(plant.biteHead, 0); advance(game, 1.4); assert.equal(plant.biteHead, 1);
  assert.equal(plant.x, x); assert.equal(plant.y, y); dropOn(game, plant); assert.equal(game.state, 'dead');
});
test('skeletschildpad valt uit elkaar en staat na vijf seconden weer op; vuur verslaat hem niet', () => {
  const game = setup(25), skeleton = game.enemies[0]; dropOn(game, skeleton);
  assert.equal(skeleton.phase, 'fallen'); assert.equal(skeleton.alive, true);
  game.player.x = 64; game.player.y = 420; shootAt(game, skeleton); assert.equal(skeleton.alive, true);
  advance(game, 4.8); assert.equal(skeleton.phase, 'fallen');
  advance(game, .3); assert.equal(skeleton.phase, 'walk'); assert.equal(skeleton.h, 26);
  game.player.star = 5; game.player.x = skeleton.x; stepGame(game, {}); assert.equal(skeleton.alive, false);
});
test('ijs bevriest ook een gevallen skeletschildpad en pauzeert zijn herstel', () => {
  const game = setup(25), skeleton = game.enemies[0]; dropOn(game, skeleton);
  game.player.x = 64; shootAt(game, skeleton, 'ice'); const time = skeleton.phaseTime;
  advance(game, 3); assert.equal(skeleton.phaseTime, time); assert.equal(skeleton.phase, 'fallen');
});
test('lava blijft gevaarlijk met een ster, vuurkracht, schild of dino', () => {
  for (const power of ['star', 'fire', 'shield', 'mounted']) {
    const game = createGame(blankLevel(40)); advance(game, .2);
    if (power === 'star') game.player.star = 10;
    else if (power === 'mounted') game.player.mounted = { x: 69, y: 424, h: 24, alive: true };
    else game.player[power] = true;
    game.tiles[13][2] = 26; stepGame(game, {}); assert.equal(game.state, 'dead', power);
  }
});
test('dikke stekelschildpad heeft drie levens en een gevaarlijke rug', () => {
  const stomp = setup(27); dropOn(stomp, stomp.enemies[0]); assert.equal(stomp.state, 'dead');
  const game = setup(27), boss = game.enemies[0]; boss.vx = 0;
  shootAt(game, boss); assert.equal(boss.hp, 2); assert.equal(boss.alive, true); advance(game, .2);
  shootAt(game, boss); assert.equal(boss.hp, 1); advance(game, .2);
  shootAt(game, boss); assert.equal(boss.alive, false);
});
test('bevriezen maakt een stekelschildpad tijdelijk ongevaarlijk', () => {
  const game = setup(27), boss = game.enemies[0]; shootAt(game, boss, 'ice'); dropOn(game, boss);
  assert.equal(game.state, 'playing'); assert.equal(boss.hp, 3); assert.ok(boss.frozen > 0);
});
test('hamerschildpad gooit elke twee seconden een hamer; hamers raken spelers en stoppen bij terrein', () => {
  const game = setup(28); advance(game, 1.7); assert.equal(game.hazards.length, 0);
  advance(game, .1); assert.equal(game.hazards[0].kind, 'hammer'); assert.ok(game.hazards[0].vx < 0);
  game.hazards = [{ kind: 'hammer', x: game.player.x + 3, y: game.player.y + 3, w: 10, h: 10, vx: 0, vy: 0, life: 3 }];
  stepGame(game, {}); assert.equal(game.state, 'dead');
  const blocked = setup(28); blocked.hazards = [{ kind: 'hammer', x: 6 * 32 - 11, y: 420, w: 10, h: 10, vx: 160, vy: 0, life: 3 }]; blocked.tiles[13][6] = 1;
  advance(blocked, .02); assert.equal(blocked.hazards.length, 0);
});
test('bom gaat dichtbij een speler aftellen en ontploft na drie seconden', () => {
  const game = setup(29), bomb = game.enemies[0]; bomb.vx = 0;
  advance(game, 3); assert.equal(bomb.fuse, 0); assert.equal(bomb.alive, true);
  game.player.star = 10; game.player.x = bomb.x - 75;
  advance(game, 2.9); assert.equal(bomb.alive, true); assert.ok(bomb.fuse > 0);
  advance(game, .1); assert.equal(bomb.alive, false); assert.equal(game.hazards[0].kind, 'blast'); assert.equal(game.state, 'playing');
});
test('vuur verkort de bomlont; ijs bevriest de lont en pauze bevriest alle gevaren', () => {
  const game = setup(29), bomb = game.enemies[0]; bomb.vx = 0;
  shootAt(game, bomb); assert.ok(bomb.fuse <= .5 && bomb.fuse > 0);
  shootAt(game, bomb, 'ice'); const fuse = bomb.fuse; advance(game, 2); assert.equal(bomb.fuse, fuse);
  game.state = 'paused'; const before = clone(game); advance(game, 3); assert.deepEqual(clone(game), before);
});
test('explosies raken beide spelers in co-op en blijven in de gedeelde spelstand staan', () => {
  const game = createCoopGame(blankLevel(40)); advance(game, .2);
  game.hazards.push({ kind: 'blast', x: 50, y: 390, w: 96, h: 96, life: .35 });
  stepCoopGame(game, [{}, {}]); assert.ok(game.players.every(p => p.respawn > 0)); assert.equal(game.state, 'playing');
  const snapshot = packCoopGame(game); assert.deepEqual(unpackCoopGame(snapshot).hazards, game.hazards);
});
