import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, resizeLevel, clone } from '../engine.mjs';
import { ENEMY_KINDS, DEFAULT_ENEMY_DESIGN, saveEnemyDesign, pruneEnemyDesigns, validateEnemyDesigns } from '../enemy-design.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { normalizeLibrary } from '../storage.mjs';
const design = {...DEFAULT_ENEMY_DESIGN,head:'mushroom',body:'turtle',hat:'propeller',wings:'butterfly',wingColor:'pink',wingSize:'large'};
const levelWith = (id=22,custom=design) => {const l=blankLevel(40);l.tiles[10][12]=id;l.tiles[10][15]=id;saveEnemyDesign(l,12,10,custom);return l;};
const advance = (g,n,input={}) => { for(let i=0;i<n;i++)stepGame(g,input); };
test('one placed enemy changes, old levels and base enemy rules stay intact',()=>{
 const original=blankLevel(40);assert.deepEqual(validateLevel(original),original);
 for(const id of Object.keys(ENEMY_KINDS).map(Number)) {
  const l=levelWith(id);const g=createGame(l);assert.deepEqual(g.enemies[0].design,id===83?{...design,length:4}:design);assert.equal(g.enemies[1].design,null);
  assert.equal(g.enemies[0].kind,ENEMY_KINDS[id]);assert.equal(g.enemies[0].hp,id===27?3:1);
  g.enemies[0].design.hat='crown';assert.equal(l.enemyDesigns[0].design.hat,'propeller');
 }
});
test('file, library and two-player state round trips retain separate designs',()=>{
 const l=levelWith();assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(l))),l);
 assert.deepEqual(normalizeLibrary([{id:'test',saved:1,level:l}])[0].level,l);
 const g=createCoopGame(l);stepCoopGame(g,[{},{}]);const restored=unpackCoopGame(packCoopGame(g));
 assert.deepEqual(restored.enemies[0].design,design);assert.equal(restored.enemies[1].design,null);
 assert.deepEqual(restored.sceneLevel.enemyDesigns,l.enemyDesigns);
});
test('invalid, duplicate and orphaned metadata is rejected at import',()=>{
 const base=levelWith();const cases=[null,{},[null],Array(257).fill(base.enemyDesigns[0]),[...base.enemyDesigns,...base.enemyDesigns]];
 for(const entries of cases) assert.throws(()=>validateEnemyDesigns(entries,base.tiles));
 for(const change of [{x:-1},{x:13},{y:100},{tileId:6},{tileId:1},{design:{...design,hat:'<script>'}},{design:{...design,wingSize:100}},{design:{...design,fly:1}},{design:{...design,wings:'none',fly:true}}]) {
  const l=clone(base);Object.assign(l.enemyDesigns[0],change);assert.throws(()=>validateLevel(l));
 }
 for(const id of [23,24,61,77]) assert.throws(()=>levelWith(id,{...design,fly:true}));
});
test('resize shifts designs; cropping, deletion and replacement remove them; undo copies remain intact',()=>{
 const l=levelWith();const tall=resizeLevel(l,40,32);assert.equal(tall.enemyDesigns[0].y,26);assert.deepEqual(resizeLevel(tall,40,16),l);
 const edge=blankLevel(40);edge.tiles[10][35]=6;saveEnemyDesign(edge,35,10,design);assert.equal(resizeLevel(edge,20).enemyDesigns,undefined);
 const before=clone(l);l.tiles[10][12]=0;pruneEnemyDesigns(l);assert.equal(l.enemyDesigns,undefined);assert.deepEqual(validateLevel(before).enemyDesigns[0].design,design);
 const replacement=clone(before);replacement.tiles[10][12]=17;pruneEnemyDesigns(replacement);assert.equal(replacement.enemyDesigns,undefined);
 saveEnemyDesign(before,12,10,DEFAULT_ENEMY_DESIGN);assert.equal(before.enemyDesigns,undefined);
});
test('wings can remain cosmetic; flight rises, patrols, respects walls, ice and pause',()=>{
 const cosmetic=createGame(levelWith(6));advance(cosmetic,100);assert.ok(cosmetic.enemies[0].y>320);
 const l=levelWith(6,{...design,fly:true});for(let y=4;y<14;y++)l.tiles[y][9]=1;
 const g=createGame(l),e=g.enemies[0],start=e.y;advance(g,160);assert.ok(e.y<start-20);assert.ok(e.x>=10*32);assert.equal(e.flyDirection,1);
 e.frozen=1;const xy=[e.x,e.y];advance(g,30);assert.deepEqual([e.x,e.y],xy);
 g.state='paused';const frozen=e.frozen;advance(g,30);assert.equal(e.frozen,frozen);
});
test('flying hammer keeps throwing and flying bomb still explodes',()=>{
 const hammer=createGame(levelWith(28,{...design,fly:true}));advance(hammer,245);assert.ok(hammer.hazards.some(h=>h.kind==='hammer'));
 const bomb=createGame(levelWith(29,{...design,fly:true}));bomb.enemies[0].fuse=.05;advance(bomb,8);assert.equal(bomb.enemies[0].alive,false);assert.ok(bomb.hazards.some(h=>h.kind==='blast'));
});
test('flying turtle can be stomped into a grounded shell',()=>{
 const g=createGame(levelWith(22,{...design,fly:true})),e=g.enemies[0];
 Object.assign(g.player,{x:e.x,y:e.y-28-1,vy:200});stepGame(g,{});assert.equal(e.phase,'shell');
 advance(g,100);assert.ok(e.grounded);assert.equal(e.phase,'shell');
});

test('stars, flowers and chain objects keep designs without becoming enemies', () => {
 for (const id of [14,15,19,30,70,71,72,73,84]) {
  const l = levelWith(id), g = createGame(l);
  assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(l))), l);
  assert.equal(g.enemies.length, 0);
  assert.equal(g.tiles[10][12], id);
  assert.deepEqual(g.sceneLevel.enemyDesigns, l.enemyDesigns);
  assert.throws(() => levelWith(id, {...design, fly:true}));
  const restored = unpackCoopGame(packCoopGame(createCoopGame(l)));
  assert.deepEqual(restored.sceneLevel.enemyDesigns, l.enemyDesigns);
  if (id === 84) {
   assert.deepEqual(restored.hazards[0].design, design);
   assert.equal(restored.hazards[1].design, null);
  }
  saveEnemyDesign(l, 12, 10, DEFAULT_ENEMY_DESIGN);
  assert.equal(l.enemyDesigns, undefined);
 }
});
test('decorated stars and flowers still grant their original powers', () => {
 for (const [id, power] of [[14,'star'],[15,'fire'],[19,'ice'],[30,'rainbow']]) {
  const g = createGame(levelWith(id));
  Object.assign(g.player, {x:12*32, y:10*32, vy:0});
  stepGame(g, {});
  assert.ok(g.player[power]);
  assert.equal(g.tiles[10][12],0);
 }
});

test('chain decorations follow the moving ball, including scaled editor previews', async () => {
 const { drawTile } = await import('../art.mjs');
 const { chainBall } = await import('../engine.mjs');
 for (const id of [70,71,72,73]) {
  for (const time of [0,1]) {
   const calls = [], ctx = new Proxy({}, { get: (_,key) => (...args) => calls.push([key,...args]), set: () => true });
   drawTile(ctx,id,160,192,32,'grass',{enemyDesign:design,time});
   const ball = chainBall(5,6,id,time);
   assert.ok(calls.some(c => c[0] === 'translate' && c[1] === ball.x-160 && c[2] === ball.y-192));
   calls.length = 0;
   drawTile(ctx,id,40,40,54,'grass',{enemyDesign:design,time,icon:true});
   assert.ok(calls.some(c => c[0] === 'translate' && c[1] === 1 && c[2] === 17));
  }
 }
});
