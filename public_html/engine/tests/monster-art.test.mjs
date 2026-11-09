import test from 'node:test';
import assert from 'node:assert/strict';
import {drawMonsterArt,monsterPose} from '../monster-art.mjs';
import {drawRobot,drawFrog,drawTurtle,drawDragon,drawPlant,drawBomb,drawTile} from '../art.mjs';

function recordingContext(){
  const calls=[];let depth=0;
  const ctx=new Proxy({calls,get depth(){return depth;}},{get(target,key){
    if(key in target)return target[key];
    return (...args)=>{if(key==='save')depth++;if(key==='restore')depth--;assert.ok(depth>=0);for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg));calls.push([key,...args]);};
  },set(target,key,value){calls.push(['set',key,value]);target[key]=value;return true;}});
  return ctx;
}
test('alle monsterhoudingen tekenen met gebalanceerde canvasstatus en eindige coordinaten',()=>{
  for(const kind of ['walker','robot','frog','turtle','skeleton','spiky','hammer','dragon','plant','bomb']){
    for(const phase of ['', 'shell', 'fallen'])for(const facing of [-1,1])for(const time of [0,.17,.3,1.6]){
      const ctx=recordingContext();const options={phase,facing,time,charge:.9,fuse:.5};const before={...options};
      drawMonsterArt(ctx,kind,3,7,options);assert.equal(ctx.depth,0,kind);assert.ok(ctx.calls.some(call=>call[0]==='fill'),kind);assert.deepEqual(options,before);
    }
  }
});
test('speciale houdingen en waarschuwingen blijven onderscheidbaar',()=>{
  const render=(kind,options)=>{const ctx=recordingContext();drawMonsterArt(ctx,kind,0,0,options);return ctx.calls;};
  assert.notDeepEqual(render('turtle',{}),render('turtle',{phase:'shell'}));
  assert.notDeepEqual(render('skeleton',{}),render('skeleton',{phase:'fallen'}));
  assert.notDeepEqual(render('robot',{charge:0}),render('robot',{charge:1}));
  assert.notDeepEqual(render('bomb',{fuse:0}),render('bomb',{fuse:.5}));
  assert.notDeepEqual(render('plant',{time:0}),render('plant',{time:1.6}));
  assert.deepEqual(monsterPose('frog',{moving:false,time:900}),monsterPose('frog',{moving:false,time:0}));
});
test('bestaande tekenfuncties en palette blijven bruikbaar met nieuwe monstertekeningen',()=>{
  for(const paint of [drawRobot,drawFrog,drawTurtle,drawDragon,drawPlant,drawBomb]){
    const ctx=recordingContext();paint(ctx,0,0);assert.equal(ctx.depth,0);assert.ok(ctx.calls.length>20);
  }
  for(const size of [24,32,64]){const ctx=recordingContext();drawTile(ctx,6,0,0,size);assert.equal(ctx.depth,0);}
});
test('de spritecache deelt richtingen, hergebruikt poses en gebruikt vaste animatiestappen',()=>{
  const previous=globalThis.OffscreenCanvas,created=[];
  globalThis.OffscreenCanvas=class{constructor(w,h){this.width=w;this.height=h;this.c=recordingContext();created.push(this);}getContext(){return this.c;}};
  try{
    drawMonsterArt(recordingContext(),'dragon',0,0,{time:.11});
    drawMonsterArt(recordingContext(),'dragon',40,0,{time:.19,facing:-1});
    assert.equal(created.length,1,'omkeren maakt geen tweede sprite');
    drawMonsterArt(recordingContext(),'dragon',0,0,{time:.21});assert.equal(created.length,2);
    assert.equal(created[0].width,96);assert.equal(created[0].height,96);
  }finally{if(previous===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=previous;}
});
