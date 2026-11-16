import test from 'node:test';
import assert from 'node:assert/strict';
import { loadImageAsset, requestImageAsset, onImageProblems } from '../image-loader.mjs';

async function withImages(run){
  const previous={Image:globalThis.Image,fetch:globalThis.fetch,assets:globalThis.braviosAssets};
  const pending=[];let response={status:404,ok:false},networkFailure=false;
  globalThis.Image=class {set src(url){this.url=url;pending.push(this);}};
  globalThis.fetch=async()=>{if(networkFailure)throw new Error('offline');return response;};
  globalThis.braviosAssets=new Proxy({}, {get:(_,path)=>'https://images.test/'+path});
  try{await run({pending,status(code){response={status:code,ok:code===200};},offline(){networkFailure=true;}});}
  finally{if(previous.Image===undefined)delete globalThis.Image;else globalThis.Image=previous.Image;globalThis.fetch=previous.fetch;if(previous.assets===undefined)delete globalThis.braviosAssets;else globalThis.braviosAssets=previous.assets;}
}

test('missing character pose reports the person, path and 404; retry clears the error',async()=>withImages(async({pending})=>{
  const path='gameplay/characters/anton/images/platform/side.png';let errors=[];const unsubscribe=onImageProblems(value=>{errors=value;});
  try{
    const first=loadImageAsset(path);await pending[0].onerror();await assert.rejects(first,error=>error.path===path&&/anton/.test(error.message)&&/404/.test(error.message));
    const second=loadImageAsset(path);await pending[1].onerror();await assert.rejects(second);assert.equal(errors.filter(e=>e.path===path).length,1);
    const retry=loadImageAsset(path);pending[2].onload();assert.equal(await retry,pending[2]);assert.ok(!errors.some(e=>e.path===path));
  }finally{unsubscribe();}
}));
test('corrupt image and connection failure have different actionable messages',async()=>withImages(async({pending,status,offline})=>{
  status(200);const corrupt=loadImageAsset('assets/corrupt.png');await pending[0].onerror();await assert.rejects(corrupt,/niet als afbeelding lezen/);
  offline();const disconnected=loadImageAsset('assets/disconnected.png');await pending[1].onerror();await assert.rejects(disconnected,/verbinding/);
}));
test('a hanging lazy sprite reports a timeout without an unhandled rejection',async()=>withImages(async()=>{
  let errors=[];const unsubscribe=onImageProblems(value=>{errors=value;});
  try{requestImageAsset('assets/hanging.png','Bouwonderdeel',{timeoutMs:5});await new Promise(r=>setTimeout(r,20));assert.ok(errors.some(e=>e.path==='assets/hanging.png'&&/te lang/.test(e.message)));}
  finally{unsubscribe();}
}));
test('a delayed error from an older request cannot replace a successful retry',async()=>withImages(async({pending})=>{
  let finishCheck;globalThis.fetch=()=>new Promise(resolve=>{finishCheck=resolve;});let errors=[];const unsubscribe=onImageProblems(value=>{errors=value;});
  try{const path='assets/replaced.png',old=loadImageAsset(path);const failure=pending[0].onerror();const retry=loadImageAsset(path);pending[1].onload();await retry;finishCheck({ok:false,status:404});await failure;await assert.rejects(old);assert.ok(!errors.some(e=>e.path===path));}
  finally{unsubscribe();}
}));
