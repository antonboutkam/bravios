import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectionRequest } from '../collection-server.mjs';
import { CollectionSync, mergeCollections } from '../collection-client.mjs';
import { blankLevel, resizeUnderground, clone } from '../engine.mjs';
import { createWorld, addWorldNode, configureWorldNode } from '../worlds.mjs';
const token = 'a'.repeat(64), other = 'b'.repeat(64);
function fixture() {
  const world = createWorld('Mijn wereld 🌍'); const node = addWorldNode(world,100,100);
  configureWorldNode(world,node.id,{name:'Onder de grond',theme:'grass',width:40,height:16,undergroundDepth:8});
  const three = addWorldNode(world,300,100);
  configureWorldNode(world,three.id,{name:'In 3D',theme:'grass',width:24,height:16,depth:24,kind:'platformer3d'});
  const level = resizeUnderground(blankLevel(40),8); level.tiles[13][2] = 0; // unfinished draft
  return {revision:0,levels:[{id:'legacy-1731000000000-0.123',saved:123,level}],worlds:[world]};
}
const phpFile = fileURLToPath(new URL('../collection.php',import.meta.url));
const phpRequest = args => {
  const result = JSON.parse(execFileSync('php',['-r', 'require $argv[1]; $a=json_decode(stream_get_contents(STDIN),true); try { echo json_encode(collectionRequest($a["directory"],$a["token"],$a["method"],$a["body"]??null)); } catch(Throwable $e) { echo json_encode(["error"=>$e->getMessage(),"code"=>$e->getCode()]); }',phpFile],{input:JSON.stringify(args),encoding:'utf8'}));
  if (result.error) throw Object.assign(new Error(result.error),{code:result.code});
  return result;
};
for (const [name, request] of [['Node',collectionRequest],['PHP',phpRequest]]) test(`${name}: persistente eigen collectie, ondergrond, 3D, heropenen, verwijderen en revisieconflict`,async()=>{
  const directory = await mkdtemp(path.join(tmpdir(),'bravios-collection-'));
  const call = (method,body,key=token) => request({directory,token:key,method,body});
  try {
    assert.deepEqual(await call('GET'),{revision:0,levels:[],worlds:[]});
    const data=fixture();assert.deepEqual(await call('PUT',data),{revision:1});
    assert.deepEqual(await call('GET'),{...data,revision:1});
    assert.deepEqual(await call('GET',null,other),{revision:0,levels:[],worlds:[]});
    await assert.rejects(async()=>call('PUT',data),error=>error.code===409);
    assert.equal((await call('GET')).worlds.length,1);
    // The other runtime can reopen the exact same persistent format.
    const readOther = name==='Node' ? phpRequest : collectionRequest;
    assert.deepEqual(await readOther({directory,token,method:'GET'}),{...data,revision:1});
    await call('PUT',{revision:1,levels:[],worlds:[]});
    assert.deepEqual(await call('GET'),{revision:2,levels:[],worlds:[]});
    await assert.rejects(async()=>call('GET',null,'../../x'),error=>error.code===401);
    await assert.rejects(async()=>call('PUT',{revision:2,levels:[{}],worlds:[]}),error=>error.code===400);
    assert.equal((await readdir(directory)).filter(name=>name.endsWith('.json')).length,1);
    assert.ok(!(await readdir(directory)).some(name=>name.endsWith('.lock')));
  } finally { await rm(directory,{recursive:true,force:true}); }
});
test('samenvoegen behoudt oude browsercollectie en kiest de nieuwste versie per veld of wereld',()=>{
  const data=fixture(), local=clone(data), remote=clone(data);
  local.levels[0].saved=200;local.levels[0].level.name='Lokaal bewerkt';
  remote.worlds[0].updated=300;remote.worlds[0].name='Op server bewerkt';
  remote.levels.push({id:'server-only',saved:1,level:blankLevel()});
  const result=mergeCollections(local,remote);
  assert.equal(result.levels.length,2);assert.equal(result.levels[0].level.name,'Lokaal bewerkt');assert.equal(result.worlds[0].name,'Op server bewerkt');
});
test('server bevestigt opslag; wijzigingen tijdens een verzoek worden daarna bewaard, fouten blijven opnieuw probeerbaar',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'bravios-sync-'));const states=[];
  let fail=false, release, started;
  const waiting = new Promise(resolve=>{started=resolve;});
  const request=async(_url,options)=>{
    if(options.method==='PUT' && !release) { started(); await new Promise(resolve=>{release=resolve;}); }
    if(fail)return {ok:false,status:500,json:async()=>({error:'Opslag niet bereikbaar'})};
    try {const data=await collectionRequest({directory,token,method:options.method,body:options.body?JSON.parse(options.body):null});return {ok:true,status:200,json:async()=>data};}
    catch(error){return {ok:false,status:error.code||500,json:async()=>({error:error.message})};}
  };
  try {
    const sync=new CollectionSync({endpoint:'test',token,request,status:state=>states.push(state)});
    const data=await sync.start(fixture());const saving=sync.save(data);await waiting;
    assert.equal(states.at(-1),'saving');const changed=clone(data);changed.levels[0].level.name='Laatste wijziging';sync.save(changed);release();await saving;
    assert.equal(states.at(-1),'saved');assert.equal((await collectionRequest({directory,token,method:'GET'})).levels[0].level.name,'Laatste wijziging');
    fail=true;changed.levels[0].level.name='Offline wijziging';assert.equal(await sync.save(changed),false);assert.equal(states.at(-1),'error');
    fail=false;assert.equal(await sync.save(changed),true);assert.equal(states.at(-1),'saved');
  } finally {await rm(directory,{recursive:true,force:true});}
});
