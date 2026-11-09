import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadStructureCatalog,validateStructureTiles} from '../public_html/engine/structures/load-catalog.mjs';
import {discoverStructures} from './prepare-structures.mjs';
const root=new URL('../public_html/',import.meta.url),files=new Map();
const index=JSON.parse(await readFile(new URL('gameplay/structures.json',root)));files.set('gameplay/structures.json',index);
await Promise.all(Object.entries(index).flatMap(([group,ids])=>ids.map(async id=>{const file=`gameplay/${id}/structure.json`;files.set(file,JSON.parse(await readFile(new URL(file,root))));})));
const load=(change=()=>{})=>{const data=structuredClone(files);change(data);return loadStructureCatalog(async file=>data.get(file));};
const spring='gameplay/interactables/spring/structure.json';
test('alle structuurmappen, PNG-afmetingen en terreinvellen zijn geldig',async()=>{const profiles=await discoverStructures();assert.equal(profiles.length,73);assert.ok(profiles.every(c=>c.visuals.default.image.startsWith(`gameplay/${c.category}/${c.id}/`)));});
test('onveilige of dubbele mappen worden afgewezen',async()=>{for(const id of ['../spring','platforms','platforms/constructor','platforms/../rock','assets/rock','interactables/spring'])await assert.rejects(load(data=>data.get('gameplay/structures.json').mechanisms.push(id)),/Ongeldige|unieke/);});
test('ongeldige botsingen, beelden, buizen en tijden noemen hun bronbestand',async()=>{
 for(const mutate of [c=>c.collision.solid='yes',c=>c.visuals.default.image='../other.png',c=>c.visuals.default.frames=1.5,c=>c.settings.bounceSpeed=Infinity])await assert.rejects(load(data=>mutate(data.get(spring))),/spring\/structure.json:/);
 await assert.rejects(load(data=>data.get('gameplay/obstacles/firebar/structure.json').settings.periodSeconds=0),/periodSeconds/);
 await assert.rejects(load(data=>data.get('gameplay/interactables/pipe-up/structure.json').pipe.opening='diagonal'),/buisrichting/);
});
test('tegelnummers zijn uniek en mogen geen vijanden overschrijven',async()=>{
 await assert.rejects(load(data=>data.get(spring).tileIds=[1]),/Dubbel tegelnummer/);
 await assert.rejects(load(data=>data.get(spring).tileIds=[17]),/gereserveerde/);
 const profiles=await load();assert.throws(()=>validateStructureTiles(profiles,[{tileIds:[8]}]),/Dubbel tegelnummer/);
});


test('categorieën veranderen geen bestaande profiel-ID of tegelnummer',async()=>{
 const profiles=await load();
 for(const [id,category,key,tile] of [['rock','platforms','terrain/rock',65],['spikes','obstacles','terrain/spikes',7],['pipe-up','interactables','pipes/pipe-up',5],['swing','platforms','wonderland/swing',null]]){
  const c=profiles.find(profile=>profile.key===key);assert.ok(c,key);assert.equal(c.id,id);assert.equal(c.category,category);if(tile!==null)assert.ok(c.tileIds.includes(tile));
 }
});
test('dubbele logische ID of dezelfde map in twee groepen wordt afgewezen',async()=>{
 await assert.rejects(load(data=>data.get('gameplay/structures.json').terrain.push('interactables/rock')),/Dubbele structuurmap/);
 await assert.rejects(load(data=>data.get('gameplay/structures.json').terrain.push('interactables/spring')),/Dubbele structuurmap/);
});
