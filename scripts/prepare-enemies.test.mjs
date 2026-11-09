import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadEnemyCatalog} from '../public_html/engine/enemies/load-catalog.mjs';
import {discoverEnemies} from './prepare-enemies.mjs';
const root=new URL('../public_html/',import.meta.url), files=new Map();
const index=JSON.parse(await readFile(new URL('gameplay/enemies/enemies.json',root)));
files.set('gameplay/enemies/enemies.json',index);
for(const [group,ids]of Object.entries(index))for(const id of ids){const file=`gameplay/enemies/${group}/${id}/enemy.json`;files.set(file,JSON.parse(await readFile(new URL(file,root))));}
const load=(change=()=>{})=>{const data=structuredClone(files);change(data);return loadEnemyCatalog(async path=>{if(!data.has(path))throw new Error('Ontbreekt: '+path);return data.get(path);});};
const walker='gameplay/enemies/game/walker/enemy.json';
test('alle vijandmappen en PNG-frameafmetingen zijn geldig',async()=>{
 const profiles=await discoverEnemies();assert.equal(profiles.length,index.game.length+index.bosses.length);assert.ok(profiles.every(c=>c.animations.idle.image.startsWith(`gameplay/enemies/${c.group}/${c.id}/`)));
});
test('onveilige en dubbele mappen worden geweigerd',async()=>{
 for(const value of ['../walker','constructor','walker'])await assert.rejects(load(data=>data.get('gameplay/enemies/enemies.json').game.push(value)),/Ongeldige|unieke/);
});
test('verkeerde paden, health en schietintervallen falen met bestandsnaam',async()=>{
 for(const change of [c=>c.combat.health=0,c=>c.combat.stompable='yes',c=>c.shooting.interval=0,c=>c.animations.idle.image='../other.png',c=>c.animations.idle.frames=1.5,c=>c.movement.speed=-1])await assert.rejects(load(data=>change(data.get(walker))),/enemies\/game\/walker\/enemy.json:/);
});
test('dubbele tegels en ontbrekende Wonderland-typen worden geweigerd',async()=>{
 await assert.rejects(load(data=>data.get(walker).tileIds=[17]),/Dubbele vijandtegel/);
 await assert.rejects(load(data=>data.get('gameplay/enemies/enemies.json').bosses.shift()),/Ontbrekende Wonderland/);
});
test('een nieuwe variant met bestaand gedrag kan via de lijst worden toegevoegd',async()=>{
 const profiles=await load(data=>{const c=structuredClone(data.get(walker));c.id='blue-walker';c.name='Blauwe wandelaar';c.tileIds=[];data.set('gameplay/enemies/game/blue-walker/enemy.json',c);data.get('gameplay/enemies/enemies.json').game.push(c.id);});
 assert.equal(profiles.at(index.game.length).key,'game/blue-walker');
});
