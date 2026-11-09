const GROUPS=['terrain','blocks','pipes','mechanisms','caves','markers','wonderland'];
const CATEGORIES=['platforms','obstacles','powerups','interactables'];
const ID=/^[a-z][a-z0-9-]{0,39}$/;
const RESERVED=new Set(['constructor','prototype','__proto__']);
const ORIGINAL=new Set([1,2,3,5,7,8,10,11,12,13,26,32,33,34,35,36,37,38,39,40,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,62,63,65,66,67,68,69,70,71,72,73,75,76,78,79,80,81,84,99,100,101]);
const KINDS=['ground','brick','question','pipe','spikes','spring','start','finish','platform','spent-block','lava','moving-wall','belt','cave','rock','crumbling','slope','chain-ball','cloud-block','beanstalk-box','beanstalk','used-beanstalk-box','p-switch','pressed-switch','chainhead-anchor','vine','donut','firebar',...['lowRoof','heavy','swing','bossStep','fading','shrink','grow','reverse','up','right','down','portal','switch','color','red','yellow','blue'].map(k=>'wonder-'+k)];
export function validateStructureTiles(profiles,enemies=[]){
 const seen=new Set(enemies.flatMap(c=>c.tileIds));
 for(const c of profiles)for(const id of c.tileIds){if(seen.has(id))throw new Error(`Dubbel tegelnummer bij structuren/vijanden: ${id}`);seen.add(id);}
}
export async function loadStructureCatalog(readJSON){
 const index=await readJSON('gameplay/structures.json');
 if(!index||Array.isArray(index)||Object.keys(index).some(g=>!GROUPS.includes(g)))throw new Error('gameplay/structures.json: ongeldige structuurgroepen.');
 const entries=[],paths=new Set(),keys=new Set();
 for(const group of GROUPS){
  const folders=index[group];if(!Array.isArray(folders)||new Set(folders).size!==folders.length)throw new Error(`gameplay/structures.json: ${group} moet een lijst met unieke mappen zijn.`);
  for(const folder of folders){
   const [category,id,...extra]=typeof folder==='string'?folder.split('/'):[];
   if(!CATEGORIES.includes(category)||typeof id!=='string'||!ID.test(id)||RESERVED.has(id)||extra.length)throw new Error(`Ongeldige structuurmap: ${folder}. Gebruik bijvoorbeeld platforms/rock.`);
   const key=`${group}/${id}`;
   if(paths.has(folder)||keys.has(key))throw new Error(`Dubbele structuurmap: ${folder}`);
   paths.add(folder);keys.add(key);entries.push({category,group,id,file:`gameplay/${folder}/structure.json`});
  }
 }
 if(!entries.length)throw new Error('Geen structuren gevonden.');
 const raw=await Promise.all(entries.map(e=>readJSON(e.file)));
 const profiles=entries.map(({category,group,id,file},i)=>{
  const c=raw[i],base=`gameplay/${category}/${id}/`;
  const fail=message=>{throw new Error(`${file}: ${message}`);};
  const number=(n,min,max,label)=>{if(!Number.isFinite(n)||n<min||n>max)fail(`Ongeldige ${label}.`);};
  const bool=(v,label)=>{if(typeof v!=='boolean')fail(`${label} moet true of false zijn.`);};
  const image=p=>{if(typeof p!=='string'||!/^images\/[a-zA-Z0-9_-]+\.png$/.test(p))fail('Afbeeldingen moeten PNG-bestanden binnen images/ zijn.');return base+p;};
  if(!c||c.id!==id||typeof c.name!=='string'||!c.name.trim()||typeof c.description!=='string')fail('Geef een naam, beschrijving en id gelijk aan de mapnaam.');
  if(!KINDS.includes(c.kind))fail('Onbekende gedragscontroller.');
  if(!Array.isArray(c.tileIds)||new Set(c.tileIds).size!==c.tileIds.length||c.tileIds.some(n=>!Number.isInteger(n)||n<1||n>255||n<=101&&!ORIGINAL.has(n)))fail('Ongeldige of gereserveerde tileIds.');
  if(c.kind.startsWith('wonder-')&&c.tileIds.length)fail('Wonderland-objecten gebruiken geen editor-tegelnummers.');
  if(!c.editor||!['none','terrain','questions','pipes','caves','mechanisms'].includes(c.editor.group))fail('Ongeldige editorgroep.');bool(c.editor.visible,'editor.visible');
  if(!c.collision)fail('collision ontbreekt.');
  for(const key of ['solid','oneWay','breakFromBelow','damage','lethal'])bool(c.collision[key],`collision.${key}`);
  number(c.collision.topOffset,0,31,'topOffset');bool(c.pSwitchConvertible,'pSwitchConvertible');
  if(!c.settings||typeof c.settings!=='object'||Array.isArray(c.settings))fail('settings moet een object zijn.');
  for(const [key,value]of Object.entries(c.settings)){
   number(value,-10000,10000,`settings.${key}`);
   if(/Seconds$/.test(key)&&value<0)fail(`${key} mag niet negatief zijn.`);
   if(['periodSeconds','travelSeconds','runSeconds','spacing','diameter','radius','length','width','height','platformWidth','platformHeight'].includes(key)&&value<=0)fail(`${key} moet positief zijn.`);
  }
  if(c.settings.flames!==undefined&&(!Number.isInteger(c.settings.flames)||c.settings.flames<1||c.settings.flames>16))fail('Kies 1 tot 16 vlammen.');
  if(c.kind==='question'&&![4,9,14,15,19,30,31,41,42,43,44].includes(c.settings.reward))fail('Onbekende vraagblokbeloning.');
  if(c.kind==='pipe'&&(!c.pipe||!['up','down','left','right'].includes(c.pipe.opening)||!['decoration','in','out','both'].includes(c.pipe.mode)))fail('Ongeldige buisrichting of verbindingswijze.');
  if(c.imageOpening!==undefined&&!['up','down','left','right'].includes(c.imageOpening))fail('Ongeldige imageOpening.');
  if(c.kind==='cave'&&(c.settings.openSeconds??0)>(c.settings.revealSeconds??Infinity))fail('openSeconds mag niet groter zijn dan revealSeconds.');
  if(c.kind==='slope'&&![-1,1].includes(c.settings.direction))fail('Een helling heeft richting -1 of 1.');
  if(c.kind==='moving-wall'&&![-1,1].includes(c.settings.direction))fail('Een beweegblok heeft richting -1 of 1.');
  if(!c.visuals||typeof c.visuals!=='object'||!c.visuals.default)fail('Geef minimaal een default-afbeelding.');
  const visuals={};
  for(const [state,v]of Object.entries(c.visuals)){
   if(!/^[a-z][a-z0-9-]{0,79}$/.test(state)||!v)fail('Ongeldige beeldtoestand.');
   for(const key of ['frameWidth','frameHeight','frames']){number(v[key],1,key==='frames'?64:4096,key);if(!Number.isInteger(v[key]))fail(`${key} moet geheel zijn.`);}
   number(v.fps,0,60,'fps');if(!Array.isArray(v.bounds)||v.bounds.length!==4)fail('bounds moet [links,boven,breedte,hoogte] zijn.');v.bounds.forEach(n=>number(n,-4096,4096,'bounds'));if(v.bounds[2]<=0||v.bounds[3]<=0)fail('Ongeldige beeldafmetingen.');
   visuals[state]={...v,image:image(v.image)};
  }
  let terrain;
  if(c.terrain){if(!['ground','brick'].includes(c.terrain.material)||c.terrain.columns!==5||c.terrain.rows!==4||c.terrain.variants!==20)fail('Terreintexturen gebruiken 20 varianten in een raster van 5 bij 4.');terrain={...c.terrain,image:image(c.terrain.image)};}
  return {...c,category,group,key:`${group}/${id}`,visuals,...(terrain?{terrain}:{})};
 });
 validateStructureTiles(profiles);return profiles;
}
