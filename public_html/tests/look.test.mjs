import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LOOK_REGIONS, LOOK_SHEETS, LOOK_ATLASES, atlasRegions, alphaBounds, sheetCutout } from '../look.mjs';
import { CHARACTER_PROFILES } from '../characters/roster.mjs';
import { creatureFrame, dinoPlacement } from '../art.mjs';
import { blankLevel } from '../engine.mjs';
import { createCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

test('witte en lichtblauwe achtergronden verdwijnen, witte kleding binnen een omtrek blijft intact', () => {
  const width = 12, pixels = new Uint8ClampedArray(width * width * 4);
  const set = (x,y,color) => pixels.set(color, (y * width + x) * 4);
  for (let y=0;y<width;y++) for(let x=0;x<width;x++) set(x,y,[230,244,255,255]);
  for (let y=3;y<10;y++) for(let x=3;x<9;x++) set(x,y,[20,30,45,255]);
  set(5,5,[255,255,255,255]); set(6,6,[40,95,180,255]);
  set(1,1,[20,20,20,255]); // A detached caption fragment.
  assert.deepEqual(sheetCutout(pixels,width,width),{x:3,y:3,width:6,height:7});
  assert.equal(pixels[3],0);
  assert.equal(pixels[(5*width+5)*4+3],255);
  assert.equal(pixels[(6*width+6)*4+3],255);
  assert.equal(pixels[(1*width+1)*4+3],0);
});

test('lichte rode achtergrond wordt verwijderd en lege uitsneden worden afgewezen', () => {
  const pixels = new Uint8ClampedArray(4*4*4);
  for(let i=0;i<16;i++)pixels.set([255,235,231,255],i*4);
  assert.equal(sheetCutout(pixels,4,4),null);
  assert.equal(sheetCutout(new Uint8ClampedArray(4*4*4),4,4),null);
});

test('alle uitsneden passen binnen de daadwerkelijk meegeleverde PNG-bestanden', async () => {
  const sizes = {};
  for(const [name,path] of Object.entries(LOOK_SHEETS)) {
    const data=await readFile(new URL(`../${path}`,import.meta.url));
    assert.equal(data.subarray(1,4).toString(),'PNG');
    sizes[name]=[data.readUInt32BE(16),data.readUInt32BE(20)];
  }
  for(const [name,[sheet,x,y,w,h]] of Object.entries(LOOK_REGIONS)) {
    assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=sizes[sheet][0]&&y+h<=sizes[sheet][1],name);
  }
  for (const sheet of Object.keys(LOOK_ATLASES)) {
    const [width, height] = sizes[sheet];
    const frames = Object.values(atlasRegions(sheet, width, height));
    assert.equal(frames.reduce((area, [, , , w, h]) => area + w * h, 0), width * height, 'ook oneven PNG-afmetingen geven volledige, niet overlappende cellen');
    for (const [, x, y, w, h] of frames) assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height);
    const data = await readFile(new URL(`../${LOOK_SHEETS[sheet]}`, import.meta.url));
    assert.equal(data[25], 6, `${sheet} heeft echte RGBA-transparantie`);
  }
});

test('alpha-uitsneden bewaren lichte vacht en losse snorharen zonder kleurfloodfill', () => {
  const pixels = new Uint8ClampedArray(4 * 4 * 4);
  pixels.set([255, 255, 255, 255], (1 * 4 + 1) * 4);
  pixels.set([255, 255, 255, 100], (2 * 4 + 3) * 4);
  const before = pixels.slice();
  assert.deepEqual(alphaBounds(pixels, 4, 4), { x: 1, y: 1, width: 3, height: 2 });
  assert.deepEqual(pixels, before);
  assert.equal(alphaBounds(new Uint8ClampedArray(64), 4, 4), null);
});

test('kat en dino volgen bewegen, omhoog springen, vallen en minder beweging', () => {
  assert.equal(creatureFrame('cat', { airborne: true, vy: -300 }), 'jump');
  assert.equal(creatureFrame('cat', { airborne: true, vy: 300 }), 'fall');
  assert.equal(creatureFrame('cat', { landing: .1 }), 'land');
  assert.equal(creatureFrame('cat', { moving: true, time: .2 }), 'run2');
  assert.equal(creatureFrame('cat', { moving: true, time: .2, reducedMotion: true }), 'idle');
  assert.equal(creatureFrame('dino', { moving: true, time: .125 }), 'walk1');
  assert.equal(creatureFrame('dino', { airborne: true, moving: true }), 'jump');
  assert.equal(creatureFrame('dino', { moving: true, reducedMotion: true }), 'idle');
});

test('de zadelpositie spiegelt met de dino, volgt gast-snapshots en verandert geen botsingen', () => {
  const level = blankLevel(40); level.tiles[13][3] = 16;
  const game = createCoopGame(level), dino = game.dinos[0]; game.players[1].mounted = dino;
  const before = packCoopGame(game);
  const right = dinoPlacement(dino);
  const left = dinoPlacement({ ...dino, facing: -1 });
  assert.equal(right.bottom, dino.y + dino.h);
  assert.equal(right.seatY, left.seatY);
  assert.equal(right.x - right.seatX, left.seatX - left.x);
  assert.ok(right.seatY > right.bottom - right.height && right.seatY < dino.y + dino.h);
  const guest = unpackCoopGame(before);
  assert.equal(guest.players[1].mounted, guest.dinos[0]);
  assert.deepEqual(dinoPlacement(guest.players[1].mounted), right);
  assert.deepEqual(packCoopGame(game), before);
});


test('vaste helden gebruiken volledige transparante PNGs per houding, ook op de dino', async () => {
  const poses = ['idle', 'side', 'run', 'jump', 'victory', 'land', 'ride'];
  for (const profile of Object.values(CHARACTER_PROFILES)) {
    assert.deepEqual(Object.keys(profile.views.side.poses).sort(), [...poses].sort());
    for (const pose of poses) {
      const path = profile.views.side.poses[pose];
      assert.equal(LOOK_SHEETS[`${profile.id}:${pose}`], path);
      const png = await readFile(new URL(`../${path}`, import.meta.url));
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(png[25], 6, `${profile.id}:${pose} must preserve alpha`);
      assert.ok(png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0);
    }
  }
});
