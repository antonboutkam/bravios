import { populateWonderFoes } from './wonder-foes.mjs?v=1';
import { blankLevel, TILE } from './engine.mjs?v=44';

export const WONDERLAND_FIELDS = [
  { name:'Het paddenstoeldorp', area:'forest', x:9,y:84, from:[], magic:'bounce', hint:'Spring op de reuzenpaddenstoelen. Volg de gouden muntjes.' },
  { name:'Het kleine deurtje', area:'forest', x:17,y:79, from:[0], magic:'shrink', hint:'Pak de blauwe paddenstoel. Klein pas je door de lage tunnel!' },
  { name:'De reuzentuin', area:'forest', x:23,y:72, from:[0], magic:'grow', hint:'De roze paddenstoel maakt je groot. Duw de zware steen opzij.' },
  { name:'Het onderstebovenkasteel', area:'forest', x:20,y:27, from:[1,2], magic:'teleport', castle:true, hint:'Paarse paddenstoelen brengen je naar een andere plek. Wacht bij Tick-Tock op twaalf!' },
  { name:'De omgekeerde laan', area:'chess', x:33,y:40, from:[3], magic:'reverse', hint:'De toverspiegel wisselt links en rechts 6 seconden om.' },
  { name:'De dansende schaakstukken', area:'chess', x:40,y:24, from:[4], magic:'switch', hint:'Raak de gele knop aan om het schaakpad te verplaatsen.' },
  { name:'Het plafondpad', area:'chess', x:51,y:39, from:[4], magic:'up', hint:'Het blauwe kristal trekt je naar het plafond. Spring om los te komen.' },
  { name:'Het wandelende schaakkasteel', area:'chess', x:47,y:15, from:[5,6], magic:'switch', castle:true, hint:'Open de route met de knop. Blubberus is terug: spring na zijn nies op de kroon!' },
  { name:'De theekopjeshaven', area:'sea', x:53,y:53, from:[7], magic:'boat', hint:'Spring over de drijvende theekopjes. Daarna gaat de boot varen.' },
  { name:'De verloren boot', area:'sea', x:72,y:65, from:[8], magic:'reverse', hint:'Een glinsterende draaikolk! Na dit veld opent een geheime bootroute.' },
  { name:'Het geheime droomeiland', area:'sea', x:67,y:82, from:[9], magic:'bonus', secret:true, hint:'Een bonusreis! Verzamel de sterrenmuntjes en vaar daarna terug.' },
  { name:'De regenboogaanlegplaats', area:'crystal', x:82,y:59, from:[9], magic:'bridge', hint:'Tik rood, geel en blauw aan, in die volgorde. Dan verschijnt de brug.' },
  { name:'De kristalwand', area:'crystal', x:92,y:50, from:[11], magic:'right', hint:'Het kristal trekt je naar rechts. Links en rechts sturen langs de wand.' },
  { name:'De kleurenbrug', area:'crystal', x:84,y:42, from:[11], magic:'color', hint:'Kies de groene kleur met de knop. Groene platforms worden vast.' },
  { name:'Het regenboogkristalkasteel', area:'crystal', x:87,y:22, from:[12,13], magic:'bridge', castle:true, hint:'Rood → geel → blauw opent de finale. Activeer bij Wobbleflap beide sterrenplaten en raak zijn kroon!' }
];
export function wonderlandUnlocked(state,index) {
  const node=WONDERLAND_FIELDS[index];
  return !!node && (!node.from.length || node.from.some(i=>state.completed.includes(i)));
}
export function wonderlandState(raw={}) {
  const completed=[];
  for(const i of (Array.isArray(raw?.completed)?[...new Set(raw.completed)]:[]).filter(i=>Number.isInteger(i)&&WONDERLAND_FIELDS[i]).sort((a,b)=>a-b)) {
    if(wonderlandUnlocked({completed},i))completed.push(i);
  }
  const s={completed,position:0,stars:completed.filter(i=>WONDERLAND_FIELDS[i].secret).length};
  if(Number.isInteger(raw?.position)&&wonderlandUnlocked(s,raw.position))s.position=raw.position;
  return s;
}
export function completeWonderland(state,index) {
  if(!wonderlandUnlocked(state,index))return false;
  if(!state.completed.includes(index))state.completed.push(index);
  state.completed.sort((a,b)=>a-b);
  state.position=index;state.stars=state.completed.filter(i=>WONDERLAND_FIELDS[i].secret).length;
  return true;
}
export function wonderlandNodes(state) {
  return WONDERLAND_FIELDS.map((node,i)=>({...node,...(i===7 && state.completed.includes(8)?{x:57,y:33}:{} )}));
}
export function wonderlandEdges(state) {
  const edges=WONDERLAND_FIELDS.flatMap((n,i)=>n.from.map(p=>({a:p,b:i,kind:n.secret?'whirlpool':(p===8||p===9)?'boat':'path'})));
  // Completing the chess switch reveals a shortcut, while the old path stays usable.
  if(state.completed.includes(5))edges.push({a:5,b:8,kind:'swing'});
  if(state.completed.includes(7))edges.push({a:7,b:9,kind:'swing'});
  if(state.completed.includes(9))edges.push({a:8,b:10,kind:'whirlpool'});
  return edges.filter(e=>wonderlandUnlocked(state,e.a)&&wonderlandUnlocked(state,e.b));
}
export function wonderlandRoute(state,from,to) {
  if(!wonderlandUnlocked(state,from)||!wonderlandUnlocked(state,to))return null;
  const edges=wonderlandEdges(state),queue=[[from]],seen=new Set([from]);
  while(queue.length){const path=queue.shift(),end=path.at(-1);if(end===to)return path;
    for(const e of edges){const next=e.a===end?e.b:e.b===end?e.a:null;if(next!==null&&!seen.has(next)){seen.add(next);queue.push([...path,next]);}}
  }return null;
}
// Triple the horizontal play space; keep jump heights and object sizes familiar.
export const WONDERLAND_WIDTH = 192;
const wonderX = x => x * 3;

export function wonderlandLevel(index) {
  const f=WONDERLAND_FIELDS[index];if(!f)throw new Error('Onbekend Wonderlandveld.');
  const l=blankLevel(WONDERLAND_WIDTH,20);l.name=`Wonderland · ${f.name}`;l.theme=f.area==='chess'?'castle':f.area==='sea'?'night':f.area==='crystal'?'sunset':'grass';
  // A safe floor, ceiling and side walls make temporary gravity/size effects forgiving.
  l.tiles=l.tiles.map((r,y)=>r.map((_,x)=>y>=18||y===0||x===0||x===l.width-1?(f.area==='chess'?65:1):0));
  l.tiles[17][2]=10;l.tiles[17][l.width-4]=11;
  for(let x=6;x<l.width-5;x+=4)l.tiles[16][x]=4;
  for(let base=18;base<l.width-12;base+=18){const x=base+index%3,y=14-index%3;for(let j=0;j<4;j++)l.tiles[y][x+j]=12;for(let j=0;j<4;j++)l.tiles[y-1][x+j]=4;}
  if(f.magic==='bounce')for(let x=10;x<l.width-10;x+=16)l.tiles[17][x]=8;
  if(f.magic==='shrink') { for(let x=wonderX(17);x<wonderX(17)+9;x++)for(let y=1;y<=16;y++)l.tiles[y][x]=2; }
  if(f.magic==='boat'||f.magic==='bonus')for(let x=12;x<l.width-10;x+=16){l.tiles[17][x]=8;l.tiles[15][x+1]=4;}
  if(f.area==='chess')for(const x of [26,44])l.tiles[17][wonderX(x)]=17;
  if(f.castle){l.tiles[17][5]=15;l.tiles[17][wonderX(49)]=15;}
  return l;
}
export function prepareWonderlandGame(game,index) {
  const f=WONDERLAND_FIELDS[index],objects=[];
  const add=(kind,x,y=17,extra={})=>objects.push({kind,x:wonderX(x)*TILE,y:y*TILE,w:TILE,h:TILE,used:false,...extra});
  const kind={shrink:'shrink',grow:'grow',teleport:'portal',reverse:'reverse',up:'up',right:'right',switch:'switch',bridge:'red',color:'color'}[f.magic];
  if(kind)add(kind,9);
  if(f.magic==='shrink')add('lowRoof',17,17,{w:9*TILE,h:14});
  if(f.magic==='bounce'||f.magic==='boat')add('swing',29,12,{w:96,h:12,baseX:wonderX(29)*TILE,baseY:12*TILE,previousX:wonderX(29)*TILE,previousY:12*TILE,dx:0,dy:0,oneWay:true});
  if(f.area==='forest'&&f.magic!=='shrink')add('fading',34,13,{w:96,h:12,active:true,oneWay:true});
  if(f.magic==='teleport')add('portal',37,17,{target:9});
  if(f.magic==='grow')add('heavy',22,16,{w:48,h:64});
  if(['bridge'].includes(f.magic)){add('yellow',19);add('blue',29);}
  if(f.magic==='up'||f.magic==='right')add('down',39,f.magic==='right'?8:17);
  game.wonderland={index,area:f.area,objects,gateX:wonderX(42),reverse:0,sizeTime:0,scale:1,gravity:'down',gravityTime:0,sequence:0,locked:['bridge','switch','color'].includes(f.magic),color:0,bridge:[]};
  if(['bridge','switch','color'].includes(f.magic)){
    // The gate is a genuine obstacle; the puzzle changes an elevated path too.
    for(let y=1;y<18;y++)game.tiles[y][game.wonderland.gateX]=65;
    for(let x=wonderX(32);x<=wonderX(40);x++){game.tiles[14][x]=0;game.wonderland.bridge.push({x,y:14});}
  }
  populateWonderFoes(game,index);
  return game;
}
