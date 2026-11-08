import { blankLevel, TILE } from './engine.mjs?v=44';

// Each predecessor is an alternative: both branches rejoin at the next castle.
export const ADVENTURE_FIELDS = [
  { name: 'De wijde weiden', theme: 'grass', x: 12, y: 66, from: [], kind: 'field' },
  { name: 'Het verdronken dorp', theme: 'underwater', x: 32, y: 79, from: [0], kind: 'water' },
  { name: 'Kasteel Vuursteen', theme: 'castle', x: 29, y: 44, from: [1], kind: 'castle' },
  { name: 'Het wolkenpad', theme: 'sunset', x: 48, y: 40, from: [2], kind: 'sky' },
  { name: 'De eerste maanreis', theme: 'moon', x: 52, y: 81, from: [2], kind: 'moon' },
  { name: 'Kasteel van de tweesprong', theme: 'castle', x: 60, y: 63, from: [3, 4], kind: 'castle' },
  { name: 'Het groene hoogland', theme: 'grass', x: 64, y: 36, from: [5], kind: 'field' },
  { name: 'De lichtgevende oceaan', theme: 'underwater-night', x: 70, y: 74, from: [5], kind: 'water' },
  { name: 'Het hoge luchtschip', theme: 'sunset', x: 81, y: 45, from: [6], kind: 'sky' },
  { name: 'De verre maankolonie', theme: 'moon', x: 87, y: 81, from: [7], kind: 'moon' },
  { name: 'Kasteel aan de sterrenrand', theme: 'castle', x: 89, y: 65, from: [8, 9], kind: 'castle' },
  { name: 'De troon van de lavakoning', theme: 'castle', x: 90, y: 24, from: [10], kind: 'castle' }
];
export const ADVENTURE_SHOPS = [{ name: 'De reizigerswinkel', x: 21, y: 62, from: [1] }, { name: 'De sterrenwinkel', x: 58, y: 29, from: [5] }];
export const ADVENTURE_GOODS = [
  { id: 'life', name: 'Extra leven', price: 15 },
  { id: 'fire', name: 'Vuurbloem', price: 12 },
  { id: 'shield', name: 'Paddenstoelschild', price: 8 },
  { id: 'ice', name: 'IJsbloem', price: 12 },
  { id: 'bubblegun', name: 'Bubblegun', price: 12 }
];
export function adventureState(raw = {}) {
  const completed = [...new Set((Array.isArray(raw.completed) ? raw.completed : []).filter(i => Number.isInteger(i) && ADVENTURE_FIELDS[i]))];
  // Reject disconnected progress in damaged/old saves.
  const reachable = new Set();
  for (const i of completed.sort((a,b) => a-b)) if (!i || ADVENTURE_FIELDS[i].from.some(p => reachable.has(p))) reachable.add(i);
  return { completed: [...reachable], coins: Math.max(0, Math.min(999999, Math.floor(Number(raw.coins) || 0))), lives: Math.max(0, Math.min(99, Math.floor(Number(raw.lives ?? 3) || 0))), power: ADVENTURE_GOODS.some(g => g.id === raw.power && g.id !== 'life') ? raw.power : null, position: Number.isInteger(raw.position) && ADVENTURE_FIELDS[raw.position] && (!raw.position || ADVENTURE_FIELDS[raw.position].from.some(p => reachable.has(p))) ? raw.position : 0 };
}
export function adventureUnlocked(state, index) {
  const f = ADVENTURE_FIELDS[index];
  return !!f && (!f.from.length || f.from.some(p => state.completed.includes(p)));
}
export function buyAdventureGood(state, id) {
  const good = ADVENTURE_GOODS.find(g => g.id === id);
  if (!good || state.coins < good.price || (id === 'life' ? state.lives >= 99 : state.power === id)) return false;
  state.coins -= good.price;
  if (id === 'life') state.lives++; else state.power = id;
  return true;
}
export function completeAdventure(state, index, coins) {
  if (!adventureUnlocked(state, index)) return false;
  // Replays remain fun, but cannot mint the same level's wallet reward again.
  if (!state.completed.includes(index)) {
    state.completed.push(index); state.coins += Math.max(0, Math.floor(coins));
  }
  state.position = index;
  return true;
}
export function adventureLevel(index) {
  const f = ADVENTURE_FIELDS[index];
  if (!f) throw new Error('Onbekend avonturiersveld.');
  const width = 240 + Math.floor(index / 3) * 24, height = f.kind === 'sky' || f.kind === 'moon' ? 32 : 16;
  const result = blankLevel(width, height), floor = height - 2;
  result.name = `${index + 1}. ${f.name}`; result.theme = f.theme;
  const put = (x,y,id) => { result.tiles[y][x] = id; };
  const line = (x,y,n,id) => { for (let j=0;j<n;j++) put(x+j,y,id); };
  const shelf = (x,y,n=5) => { line(x,y,n,12); line(x,y-1,n,4); };
  if (f.kind === 'castle') {
    for (const y of [0, 1, 2, floor, floor + 1]) line(0,y,width,65);
  }
  put(5,floor-1,9); put(8,floor-1,45);
  for (let x=12; x<width-(f.kind === 'castle' ? 40 : 14); x+=24) {
    line(x,floor-2,7,4); put(x+2,floor-5,3); shelf(x+9,floor-3);
    if (f.kind === 'water') {
      for(let y=floor-5;y<floor;y++) put(x+16,y,2);
      line(x+12,floor-8,8,4); put(x+20,floor-6,[85,86,88,89,92][Math.floor(x/24)%5]);
    } else if (f.kind === 'castle') {
      const poolWidth=index>=10?6:5;
      for(const y of [floor,floor+1])line(x,y,poolWidth,26);
      shelf(x-1,floor-3,poolWidth+2);
      // A high crossing offers an alternative to timing the rotating flames below.
      if(Math.floor(x/24)%2===0){
        for(let xx=x+9;xx<x+14;xx++){put(xx,floor-3,0);put(xx,floor-4,0);}
        shelf(x+9,floor-4,7);put(x+12,floor-2,101);
      }
      put(x+17,floor-1,Math.floor(x/24)%2 ? 25 : 28);
    } else if (f.kind === 'sky') {
      line(x+16,floor,3,0); line(x+16,floor+1,3,0);
      shelf(x+14,floor-3,7); shelf(x+3,floor-7); put(x+20,floor-8,23);
      for(let t=0;t<12;t++) put(x+t,floor,75);
    } else if (f.kind === 'moon') {
      put(x+17,floor-1,67); put(x+20,floor-1,17); shelf(x+2,floor-9,7);
    } else {
      put(x+16,floor-1,97); put(x+20,floor-1,index > 0 ? 98 : 6); shelf(x+2,floor-6);
    }
  }
  if (f.kind === 'castle') {
    put(6,floor-1,15);
    // A clear arena with spare flowers; the spiked boss requires fire or a star.
    for(let x=width-34;x<width-5;x++) for(let y=3;y<floor;y++) put(x,y,0);
    for(const x of [width-33,width-26,width-18]) put(x,floor-1,15);
    put(width-12,floor-1,27);
  }
  return result;
}
export function prepareAdventureGame(game, field, state) {
  if (state.power) game.player[state.power] = true;
  if (ADVENTURE_FIELDS[field].kind === 'castle') {
    const boss = game.enemies.find(e => e.tileId === 27);
    boss.boss = true; boss.hp = field === 11 ? 9 : 5;
    boss.arenaLeft = (game.width - 30) * TILE; boss.arenaRight = (game.width - 7) * TILE;
    boss.maxHp = boss.hp; boss.w = 52; boss.h = 48; boss.y = (game.tiles.length-2)*TILE-boss.h;
  }
}
