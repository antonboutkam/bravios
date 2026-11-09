// Shared by browser startup and the Node/offline preparation step.
const ID = /^[a-z][a-z0-9-]{0,39}$/;
const RESERVED = new Set(['constructor', 'prototype', '__proto__']);
export async function loadEnemyCatalog(readJSON) {
  const index = await readJSON('enemies/enemies.json');
  if (!index || Object.keys(index).some(key => !['game','bosses'].includes(key))) throw new Error('enemies/enemies.json: verwacht game en bosses.');
  const catalog = [];
  for (const group of ['game','bosses']) {
    if (!Array.isArray(index[group]) || !index[group].length || new Set(index[group]).size !== index[group].length) throw new Error(`enemies/enemies.json: ${group} moet een lijst met unieke mapnamen zijn.`);
    for (const id of index[group]) {
      if (typeof id !== 'string' || !ID.test(id) || RESERVED.has(id)) throw new Error(`Ongeldige vijandmap: ${id}`);
      const base = `enemies/${group}/${id}/`, file = base + 'enemy.json';
      const c = await readJSON(file);
      const fail = message => { throw new Error(`${file}: ${message}`); };
      const number = (value, min, max, label) => { if (!Number.isFinite(value) || value < min || value > max) fail(`Ongeldige ${label}.`); };
      const choice = (value, values, label) => { if (!values.includes(value)) fail(`Ongeldige ${label}.`); };
      const bool = (value, label) => { if (typeof value !== 'boolean') fail(`${label} moet true of false zijn.`); };
      if (!c || c.id !== id || typeof c.name !== 'string' || !c.name.trim()) fail('Geef een id gelijk aan de mapnaam en een naam.');
      choice(c.kind, ['walker','robot','frog','turtle','dragon','plant','skeleton','spiky','hammer','bomb','crusher','plane','cloud','centipede','beetle','spikedbeetle','whale','jellyfish','bonefish','squid','seaweed','geyser','flatfish','moray','seastar','crab','wonder'], 'kind');
      if (!Array.isArray(c.tileIds) || c.tileIds.some(n => !Number.isInteger(n) || n < 1 || n > 255)) fail('Ongeldige tileIds.');
      if (!Array.isArray(c.size) || c.size.length !== 2) fail('size moet [breedte, hoogte] zijn.');
      c.size.forEach(n => number(n, 1, 512, 'afmeting'));
      if (c.kind === 'wonder') { number(c.wonderType,0,7,'wonderType'); if (!Number.isInteger(c.wonderType)) fail('wonderType moet geheel zijn.'); }
      const m=c.movement, combat=c.combat, s=c.shooting;
      if (!m || !combat || !s || !c.settings || typeof c.settings !== 'object' || Array.isArray(c.settings)) fail('movement, combat, shooting en settings zijn verplicht.');
      choice(m.type,['walk','fly','swim','stationary'],'movement.type'); number(m.speed,0,1000,'snelheid'); bool(m.turnAtEdges,'turnAtEdges'); number(m.amplitude,0,500,'amplitude'); number(m.frequency,0,30,'frequency');
      number(combat.health,1,10000,'health'); if (!Number.isInteger(combat.health)) fail('health moet geheel zijn.');
      for(const key of ['contactDamage','lethalContact','stompable','freezeable','bubbleable']) bool(combat[key],key);
      choice(combat.stompResponse,['hurt','damage','fold','collapse','ignite','shell','ride'],'stompResponse'); choice(combat.fireResponse,['ignore','ignite','collapse','damage'],'fireResponse'); number(combat.hitCooldown,0,10,'hitCooldown');
      bool(s.enabled,'shooting.enabled'); choice(s.projectile,['fire','hammer','spikeegg','wonder'],'projectile'); number(s.interval,.05,120,'schietinterval'); number(s.speed,0,2000,'projectielsnelheid'); number(s.verticalSpeed,-2000,2000,'verticalSpeed'); number(s.life,.05,120,'projectielduur'); choice(s.aim,['player','down'],'aim');
      for(const [key,value] of Object.entries(c.settings)) number(value,0,10000,`settings.${key}`);
      if(c.boss) for(const key of ['restSeconds','warningSeconds','attackSeconds','exposedSeconds']) number(c.boss[key],.05,120,`boss.${key}`);
      if(group==='bosses' && c.kind==='wonder' && (!c.metadata || c.metadata.number!==c.wonderType+1 || typeof c.metadata.id!=='string' || typeof c.metadata.primary_color!=='string')) fail('Wonderland-baas mist geldige metadata.');
      if(!c.animations || typeof c.animations!=='object' || !c.animations.idle) fail('Geef minimaal een idle-animatie.');
      const animations = {};
      for(const [state,a] of Object.entries(c.animations)) {
        if(!ID.test(state) || !a || typeof a.image!=='string' || !/^images\/[a-zA-Z0-9_-]+\.png$/.test(a.image)) fail(`Ongeldig PNG-pad voor ${state}.`);
        for(const key of ['frameWidth','frameHeight','frames','bodyWidth','bodyHeight']) { number(a[key],1,key==='frames'?64:2048,`${state}.${key}`); if(!Number.isInteger(a[key])) fail(`${state}.${key} moet geheel zijn.`); }
        number(a.fps,0,60,`${state}.fps`);
        if(!Array.isArray(a.bounds)||a.bounds.length!==4) fail(`Ongeldige bounds voor ${state}.`);
        a.bounds.forEach(n=>number(n,-2048,2048,'bounds')); if(a.bounds[2]<=0||a.bounds[3]<=0) fail('bounds moeten positieve afmetingen hebben.');
        animations[state]={...a,image:base+a.image};
      }
      catalog.push({...c,group,key:`${group}/${id}`,animations});
    }
  }
  const tiles = new Set(), wonders = new Set();
  for(const c of catalog) {
    for(const tile of c.tileIds) { if(tiles.has(tile)) throw new Error(`Dubbele vijandtegel: ${tile}`); tiles.add(tile); }
    if(c.kind==='wonder'){const key=`${c.group}/${c.wonderType}`;if(wonders.has(key))throw new Error(`Dubbele Wonderland-vijand: ${key}`);wonders.add(key);}
  }
  for(let type=0;type<8;type++)for(const group of ['game','bosses'])if(!wonders.has(`${group}/${type}`))throw new Error(`Ontbrekende Wonderland-vijand: ${group}/${type}`);
  return catalog;
}
