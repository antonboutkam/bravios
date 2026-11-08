import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { followCamera } from '../presentation.mjs';
function settled(level=blankLevel(72)) {const g=createGame(level);for(let i=0;i<60;i++)stepGame(g,{});return g;}
test('lopen begint in de eerste stap en bereikt de bestaande topsnelheid binnen 33 ms',()=>{
 for(const dt of [1/120,1/60,1/30])for(const direction of [-1,1]){
  const g=settled(),p=g.player,x=p.x,input=direction<0?{left:true}:{right:true};
  stepGame(g,input,dt);assert.ok((p.x-x)*direction>=.5);assert.ok(p.vx*direction>0);
  for(let i=1;i<Math.ceil((1/30)/dt);i++)stepGame(g,input,dt);
  assert.equal(p.vx,direction*220);
 }
});
test('omkeren reageert meteen op de grond en in de lucht, zonder doorlopen in de oude richting',()=>{
 for(const airborne of [false,true])for(const direction of [-1,1]){
  const g=settled(),p=g.player;Object.assign(p,{x:500,vx:-direction*220,grounded:!airborne});if(airborne)p.y=200;
  const x=p.x;stepGame(g,direction<0?{left:true}:{right:true});assert.ok((p.x-x)*direction>0);assert.equal(p.facing,direction);
 }
});
test('loslaten remt op de grond binnen 25 ms en houdt het doorschuiven kort',()=>{
 const g=settled(),p=g.player;p.vx=220;const x=p.x;
 for(let i=0;i<3;i++)stepGame(g,{});
 assert.equal(p.vx,0);assert.ok(p.x-x<3);
 const stop=p.x;stepGame(g,{});assert.equal(p.x,stop);
});
test('water en de extra vaart van een liaansprong behouden hun eigen beweging',()=>{
 const l=blankLevel(72);l.theme='underwater';const water=settled(l);stepGame(water,{right:true});assert.equal(water.player.vx,20);
 const launch=settled();Object.assign(launch.player,{x:500,y:200,vx:400,grounded:false,vineCooldown:.3});stepGame(launch,{right:true});
 assert.ok(launch.player.vx>380,'de liaansprong wordt niet abrupt tot loopsnelheid afgeremd');
});
test('beide bro’s krijgen dezelfde directe besturing en snapshots blijven geldig',()=>{
 const g=createCoopGame(blankLevel(72));for(let i=0;i<60;i++)stepCoopGame(g,[{},{}]);
 g.players[0].x=300;g.players[1].x=600;g.players[0].vx=-220;g.players[1].vx=220;
 stepCoopGame(g,[{right:true},{left:true}]);assert.ok(g.players[0].x>300);assert.ok(g.players[1].x<600);
 assert.deepEqual(packCoopGame(unpackCoopGame(packCoopGame(g))),packCoopGame(g));
});
test('camera sluit binnen 150 ms aan zonder de bestaande grenzen of teleportafhandeling te wijzigen',()=>{
 const p={x:520,w:22,vx:0},target=followCamera(100,p,1,640,2304,0,true);let camera=100;
 for(let i=0;i<18;i++)camera=followCamera(camera,p,1,640,2304,1/120);
 assert.ok(Math.abs(camera-target)<Math.abs(100-target)*.1);
 assert.equal(followCamera(camera,p,1,640,2304,0),camera);
});
