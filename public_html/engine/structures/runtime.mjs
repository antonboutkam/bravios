import { STRUCTURE_CATALOG } from './catalog.mjs';
let keys,tiles,kinds;
function index(){if(keys&&keys.size===STRUCTURE_CATALOG.length)return;keys=new Map();tiles=new Map();kinds=new Map();for(const c of STRUCTURE_CATALOG){keys.set(c.key,c);for(const id of c.tileIds)tiles.set(id,c);if(!kinds.has(c.kind))kinds.set(c.kind,c);}}
export function replaceStructureCatalog(profiles){STRUCTURE_CATALOG.splice(0,STRUCTURE_CATALOG.length,...profiles);keys=null;}
export function structureProfile(id){index();return typeof id==='string'?keys.get(id)||kinds.get(id):tiles.get(id);}
export function structureSetting(id,key,fallback){return structureProfile(id)?.settings[key] ?? fallback;}
export function structureIs(id,kind){return structureProfile(id)?.kind===kind;}
export function structureCollision(id){return structureProfile(id)?.collision;}
export function structureAssets(){return [...new Set(STRUCTURE_CATALOG.flatMap(c=>[...Object.values(c.visuals).map(v=>v.image),...(c.terrain?[c.terrain.image]:[])]))];}
export function structurePipes(){return Object.fromEntries(STRUCTURE_CATALOG.filter(c=>c.kind==='pipe').flatMap(c=>c.tileIds.map(id=>[id,{...c.pipe}])));}
export function structureRewards(){return Object.fromEntries(STRUCTURE_CATALOG.filter(c=>c.kind==='question').flatMap(c=>c.tileIds.map(id=>[id,c.settings.reward])));}
export function structureTiles(kind){return STRUCTURE_CATALOG.filter(c=>c.kind===kind).flatMap(c=>c.tileIds);}

export function structureSolidTile(id){const c=structureProfile(id);return !!c?.collision.solid&&!['moving-wall','belt','vine','donut','firebar'].includes(c.kind);}
export function structureFootprint(id){const c=structureProfile(id);return c?.kind==='moving-wall'?{width:Math.ceil((c.settings.width??64)/32),height:Math.ceil((c.settings.height??64)/32)}:{width:1,height:1};}
