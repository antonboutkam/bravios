import { enemies3D } from './access.mjs';
export const OBJECTS_3D = { block: 'Grasblok', coin: 'Munt', start: 'Start', finish: 'Finish', enemy: 'Vijand', lava: 'Lava' };
export function validateLevel3D(raw) {
  const fail = message => { throw new Error(`3D-veld: ${message}`); };
  const integer = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
  if (!raw || raw.kind !== 'platformer3d' || raw.version !== 1 || typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 48) fail('ongeldige naam of versie.');
  if (!integer(raw.width,20,80) || !integer(raw.depth,20,80) || !integer(raw.height,16,32)) fail('kies breedte/diepte 20–80 en hoogte 16–32.');
  if (!['grass','winter','castle','sunset'].includes(raw.theme)) fail('onbekende omgeving.');
  if (!Array.isArray(raw.objects) || raw.objects.length > 600) fail('maximaal 600 onderdelen.');
  const ids = new Set(), unique = new Set();
  const objects = raw.objects.map(object => {
    if (!object || typeof object.id !== 'string' || !/^[\w-]{1,80}$/.test(object.id) || ids.has(object.id) || !Object.hasOwn(OBJECTS_3D,object.type)) fail('ongeldig of dubbel onderdeel.');
    ids.add(object.id);
    for (const [axis,limit] of [['x',raw.width],['y',raw.height],['z',raw.depth]]) if (!integer(object[axis],0,limit-1)) fail('onderdeel buiten het veld.');
    const result = { id:object.id,type:object.type,x:object.x,y:object.y,z:object.z };
    if (['block','lava'].includes(object.type)) {
      for (const [size,axis,limit] of [['w','x',raw.width],['h','y',raw.height],['d','z',raw.depth]]) {
        if (!integer(object[size],1,80) || object[axis]+object[size]>limit) fail('ongeldige blokafmetingen.');
        result[size]=object[size];
      }
    }
    if (['start','finish'].includes(object.type)) {
      if (unique.has(object.type)) fail('gebruik maar één start en één finish.');
      unique.add(object.type);
    }
    if (object.type==='enemy') {
      if (!enemies3D().some(profile=>profile.key===object.enemy)) fail('deze vijand heeft geen geschikt 3D-model.');
      result.enemy=object.enemy;
    }
    return result;
  });
  return {kind:'platformer3d',version:1,name:raw.name.trim(),theme:raw.theme,width:raw.width,height:raw.height,depth:raw.depth,objects};
}
export function assertPlayable3D(level) {
  const checked=validateLevel3D(level);
  for(const type of ['start','finish']) {
    const marker=checked.objects.find(object=>object.type===type);
    if(!marker)throw new Error('Plaats eerst een start en een finish in je 3D-veld.');
    if(checked.objects.some(b=>b.type==='block'&&marker.x+.8>b.x&&marker.x+.2<b.x+b.w&&marker.z+.8>b.z&&marker.z+.2<b.z+b.d&&marker.y+1.4>b.y&&marker.y<b.y+b.h))throw new Error('Maak ruimte boven de start en de finish.');
  }
  return checked;
}
export function createLevel3D(name='De zwevende tuinen', theme='grass', width=24, height=16, depth=24) {
  const objects=[
    {id:'island',type:'block',x:2,y:0,z:3,w:8,h:1,d:8},
    {id:'step',type:'block',x:11,y:1,z:6,w:4,h:1,d:4},
    {id:'finish-island',type:'block',x:16,y:2,z:4,w:6,h:1,d:8},
    {id:'start',type:'start',x:4,y:1,z:7},
    {id:'finish',type:'finish',x:19,y:3,z:7},
    ...[6,8,12,17].map((x,i)=>({id:`coin-${i}`,type:'coin',x,y:i<2?1:i===2?2:3,z:7}))
  ];
  const enemy=enemies3D()[0];
  if(enemy)objects.push({id:'walker',type:'enemy',enemy:enemy.key,x:19,y:3,z:10});
  // Minimum dimensions still fit the sample course.
  if(width<24)for(const o of objects){if(o.x>=16)o.x-=4;}
  return validateLevel3D({kind:'platformer3d',version:1,name,theme,width,height,depth,objects});
}
export function resizeLevel3D(level,{name,theme,width,height,depth}) {
  const next={...level,name,theme,width,height,depth};
  // Never silently remove a built platform, start or enemy when shrinking.
  return validateLevel3D(next);
}
