import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_MAP, createWorld, validateWorld, normalizeWorlds, addWorldNode, toggleWorldLink, removeWorldNode, configureWorldNode, saveWorldNodeLevel } from '../worlds.mjs';
import { clone, positions, createGame, stepGame } from '../engine.mjs';

const fixture = () => { const world=createWorld('Mijn route');const a=addWorldNode(world,100,150),b=addWorldNode(world,350,150);return {world,a,b}; };
test('rondjes en ongerichte verbindingen bewaren zonder dubbele lijnen of losse verwijzingen',()=>{
 const {world,a,b}=fixture();
 assert.equal(toggleWorldLink(world,a.id,a.id),false);assert.equal(toggleWorldLink(world,a.id,'missing'),false);
 assert.equal(toggleWorldLink(world,a.id,b.id),true);assert.deepEqual(world.links,[[a.id,b.id]]);
 toggleWorldLink(world,b.id,a.id);assert.deepEqual(world.links,[]);
 toggleWorldLink(world,a.id,b.id);
 const copy=validateWorld(clone(world));assert.deepEqual(copy,world);
 copy.nodes[0].x=700;assert.equal(a.x,100);
 removeWorldNode(world,a.id);assert.deepEqual(world.links,[]);assert.equal(world.nodes.length,1);
});
test('eerst omgeving en grootte kiezen, daarna een echt speelbaar veld inrichten',()=>{
 const {world,a}=fixture();assert.equal(a.level,null);
 configureWorldNode(world,a.id,{name:'De kasteelzaal',theme:'castle',width:120,height:24});
 assert.equal(a.level.width,120);assert.equal(a.level.height,24);assert.equal(a.level.theme,'castle');
 for(const y of [0,1,2,22,23])assert.ok(a.level.tiles[y].every(id=>id===65));
 assert.equal(positions(a.level,10).length,1);assert.equal(positions(a.level,11).length,1);
 const game=createGame(a.level);game.enemies=[];
 Object.assign(game.player,{x:game.finish.x*32+5,y:game.finish.y*32});stepGame(game,{});assert.equal(game.state,'won');
});
test('veldinstellingen behouden het bouwwerk en verplaatsen start en finish na verkleinen',()=>{
 const {world,a}=fixture();
 configureWorldNode(world,a.id,{name:'Eerste veld',theme:'grass',width:120,height:32});
 a.level.tiles[29][7]=3;
 configureWorldNode(world,a.id,{name:'Mijn sneeuwveld',theme:'winter',width:40,height:16});
 assert.equal(a.level.tiles[13][7],3);assert.equal(a.level.name,'Mijn sneeuwveld');assert.equal(a.level.theme,'winter');
 assert.equal(positions(a.level,10).length,1);assert.equal(positions(a.level,11).length,1);
 assert.deepEqual(validateWorld(clone(world)),world);
});
test('autobewaren wijzigt alleen het gekozen wereldveld en houdt de levelkopie onafhankelijk',()=>{
 const {world,a,b}=fixture();
 for(const n of [a,b])configureWorldNode(world,n.id,{name:'Veld',theme:'grass',width:40,height:16});
 const untouched=clone(b.level),draft=clone(a.level);draft.tiles[10][10]=4;
 world.completed=[a.id,b.id];saveWorldNodeLevel(world,a.id,draft);
 assert.deepEqual(b.level,untouched);assert.equal(a.level.tiles[10][10],4);assert.deepEqual(world.completed,[b.id]);
 draft.tiles[10][10]=0;assert.equal(a.level.tiles[10][10],4);
 world.completed.push(a.id);saveWorldNodeLevel(world,a.id,clone(a.level));assert.ok(world.completed.includes(a.id));
 removeWorldNode(world,a.id);assert.deepEqual(world.completed,[b.id]);
});
test('oude opslag zonder werelden blijft geldig en beschadigde entries verbergen geen andere werelden',()=>{
 const {world}=fixture();assert.deepEqual(normalizeWorlds(undefined),[]);
 assert.deepEqual(normalizeWorlds([null,{},world,world,{...world,id:'other',links:[['missing','nope']]}]),[world]);
 assert.throws(()=>validateWorld({...world,nodes:[world.nodes[0],world.nodes[0]]}));
 assert.throws(()=>validateWorld({...world,nodes:[{...world.nodes[0],x:NaN}]}));
 assert.throws(()=>validateWorld({...world,nodes:[{...world.nodes[0],level:{}}]}));
});
test('kaartgrenzen en veldlimieten blokkeren ongeldige gegevens',()=>{
 const world=createWorld('Grenzen');const first=addWorldNode(world,-100,1000);assert.equal(first.x,32);assert.equal(first.y,540);
 assert.throws(()=>addWorldNode(world,32,540));assert.throws(()=>addWorldNode(world,NaN,5));
 assert.throws(()=>configureWorldNode(world,first.id,{name:'Fout',theme:'__proto__',width:40,height:16}));
 for(const [width,height] of [[19,16],[361,16],[40,15],[40,65],[40.5,16]])assert.throws(()=>configureWorldNode(world,first.id,{name:'Fout',theme:'grass',width,height}));
 for(let i=1;i<WORLD_MAP.maxNodes;i++)world.nodes.push({id:`node-${i}`,x:100,y:100,level:null});
 assert.throws(()=>addWorldNode(world,900,500));
});
