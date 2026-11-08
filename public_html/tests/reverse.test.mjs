import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, REVERSE_INTRO_SECONDS, blankLevel, createGame, stepGame, validateLevel, clone, positions, pipeConnections, visualFacing } from '../engine.mjs';
import { CRAZY_FIELDS, crazyLevel } from '../levels.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
function advance(game, frames, input={}) { for(let i=0;i<frames;i++)stepGame(game,input); }
function setup() {const level=blankLevel(40);level.tiles[13][30]=43;level.tiles[13][12]=22;return {level,game:createGame(level)};}
function collect(game,where=positions({tiles:game.tiles},43)[0]) {
  Object.assign(game.player,{x:where.x*TILE+5,y:(where.y+1)*TILE-game.player.h,vy:0,grounded:true});
  stepGame(game,{});assert.equal(game.reversed,true);
}
test('Achterstevoren bewaart als beloning en ligt in elk gek veld vlak voor de finish',()=>{
  const {level}=setup();assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))),level);
  for(let i=0;i<10;i++){const level=crazyLevel(i),reward=positions(level,43);assert.equal(reward.length,1);const finish=positions(level,11)[0];if(CRAZY_FIELDS[i].route==='down'){assert.equal(reward[0].x,finish.x);assert.equal(reward[0].y,finish.y-3);}else{assert.equal(Math.abs(finish.x-reward[0].x),4);assert.equal(reward[0].y,finish.y);}}
});
test('oppakken wisselt de echte vlag en start; alleen de nieuwe finish kan winnen en het bronlevel blijft intact',()=>{
  const {game,level}=setup(),before=clone(level),oldStart=clone(game.start),oldFinish=clone(game.finish),vx=game.enemies[0].vx;
  collect(game);assert.deepEqual(game.finish,oldStart);assert.deepEqual(game.start,oldFinish);
  assert.equal(game.tiles[oldStart.y][oldStart.x],11);assert.equal(game.tiles[oldFinish.y][oldFinish.x],10);
  assert.equal(game.enemies[0].vx,-vx);assert.deepEqual(level,before);
  advance(game,Math.ceil(REVERSE_INTRO_SECONDS*120)+2);
  Object.assign(game.player,{x:oldFinish.x*TILE+5,y:oldFinish.y*TILE});stepGame(game,{});assert.equal(game.state,'playing');
  Object.assign(game.player,{x:oldStart.x*TILE+5,y:oldStart.y*TILE});stepGame(game,{});assert.equal(game.state,'won');
  const fresh=createGame(level);assert.equal(fresh.reversed,false);assert.deepEqual(fresh.finish,oldFinish);
});
test('portretintro bevriest de wereld en pauze bevriest de intro; de omkering blijft daarna permanent',()=>{
  const {game}=setup();collect(game);const p=clone(game.player),enemies=clone(game.enemies),time=game.time;
  advance(game,60,{right:true,fire:true,jump:true});assert.deepEqual(game.player,p);assert.deepEqual(game.enemies,enemies);assert.equal(game.time,time);
  assert.ok(game.reverseIntro<REVERSE_INTRO_SECONDS);game.state='paused';const paused=clone(game);advance(game,200);assert.deepEqual(clone(game),paused);
  game.state='playing';advance(game,250);assert.equal(game.reverseIntro,0);assert.equal(game.reversed,true);
  stepGame(game,{right:true});assert.equal(game.player.facing,1);assert.equal(visualFacing(game,game.player),-1);assert.ok(game.player.vx>0);
  game.tiles[13][30]=43;collect(game,{x:30,y:13});assert.equal(game.reverseIntro,0);assert.equal(game.finish.x,2);
});
test('vijanden blijven visueel achteruit lopen, ook na omkeren bij een muur',()=>{
  const {game}=setup();collect(game);advance(game,300);const enemy=game.enemies[0];
  assert.equal(visualFacing(game,enemy),-Math.sign(enemy.vx));
  enemy.x=game.width*TILE-enemy.w-1;enemy.vx=40;advance(game,10);
  assert.ok(enemy.vx<0);assert.equal(visualFacing(game,enemy),1);
});
test('hoge velden krijgen een vrije terugbuis zonder bestaande buisverbindingen te veranderen',()=>{
  for(const [i,field] of CRAZY_FIELDS.entries())if(field.route==='down'){
    const game=createGame(crazyLevel(i)),before=pipeConnections(game.tiles).filter(c=>c.from.id===34);
    collect(game);assert.ok(game.reverseReturnPipe);const after=pipeConnections(game.tiles);
    for(const connection of before){const kept=after.find(c=>c.from.x===connection.from.x&&c.from.y===connection.from.y);assert.deepEqual(kept.to,connection.to);}
    const entry=game.reverseReturnPipe,pair=after.find(c=>c.from.x===entry.x&&c.from.y===entry.y);assert.ok(pair.to.y<16);
    for(const y of [pair.to.y-1,pair.to.y-2])assert.equal(game.tiles[y][pair.to.x],0);
    advance(game,300);Object.assign(game.player,{x:entry.x*TILE+5,y:entry.y*TILE-game.player.h,grounded:true,vy:0});stepGame(game,{pipe:true});assert.ok(game.events.includes('pipe'));assert.ok(game.player.y<16*TILE);
  }
});
test('co-op deelt de omkering, de gekozen portretspeler en de nieuwe respawn; intro tikt eenmaal per stap',()=>{
  const {level}=setup(),game=createCoopGame(level),guest=game.players[1];
  Object.assign(guest,{x:30*TILE+5,y:14*TILE-guest.h,grounded:true,vy:0});stepCoopGame(game,[{},{}]);
  assert.equal(game.reversed,true);assert.equal(game.reverseCharacter,'ravi');assert.equal(game.reverseIntro,REVERSE_INTRO_SECONDS);
  stepCoopGame(game,[{},{}]);assert.ok(Math.abs(game.reverseIntro-(REVERSE_INTRO_SECONDS-1/120))<1e-8);
  for(const p of game.players)assert.equal(p.spawn.x,game.start.x*TILE+5);
  const restored=unpackCoopGame(packCoopGame(game));assert.equal(restored.reversed,true);assert.equal(restored.reverseCharacter,'ravi');assert.deepEqual(restored.finish,game.finish);assert.deepEqual(restored.tiles,game.tiles);
  Object.assign(game.players[0], { x: game.start.x*TILE-64, y: 14*TILE-game.players[0].h, vy: 0 });
  for(let i=0;i<300;i++)stepCoopGame(game,[{},{}]);
  guest.y=800;stepCoopGame(game,[{},{}]);assert.ok(guest.respawn>0);
  for(let i=0;i<190;i++)stepCoopGame(game,[{},{}]);
  assert.equal(guest.spawn.x,game.start.x*TILE+5);assert.equal(guest.x,guest.spawn.x);assert.equal(game.reversed,true);
});
test('alle tien gekke velden blijven na oppakken van de omkering echt uitspeelbaar',()=>{
  for(const [index,field] of CRAZY_FIELDS.entries()){
    const game=createGame(crazyLevel(index));game.enemies=[];game.helpers=[];game.tiles=game.tiles.map(row=>row.map(id=>[41,42,44].includes(id)?0:id));
    const reward=positions({tiles:game.tiles},43)[0];
    for(let frame=0;frame<120*180&&game.state==='playing';frame++){
      const p=game.player;let target=game.finish.x*TILE+5,jump=frame%100<65,pipe=false;
      if(!game.reversed){
        if(field.route==='down'){
          const floors=[];for(let y=8;y<field.height-5;y+=8)floors.push(y);
          const floor=floors.findIndex(y=>p.y+p.h<=y*TILE+.1);
          target=floor>=0?(floor%2===0?field.width-2:1)*TILE:reward.x*TILE+5;
        }else target=reward.x*TILE+5;
        if(Math.abs(p.x-target)<8){jump=false;}
      }else if(field.route==='down'){
        const entry=game.reverseReturnPipe;
        target=p.y>16*TILE?entry.x*TILE+5:game.finish.x*TILE+5;
        if(Math.abs(p.x-target)<8){jump=false;pipe=p.grounded&&p.y>16*TILE;}
      }
      stepGame(game,{left:p.x>target+4,right:p.x<target-4,jump,pipe});
    }
    assert.equal(game.reversed,true,field.name);assert.equal(game.state,'won',`${field.name}: ${game.player.x},${game.player.y}`);
  }
});
