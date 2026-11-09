import { CHARACTER_PROFILES } from './characters/roster.mjs';
import { ADVENTURE_FIELDS, ADVENTURE_SHOPS, ADVENTURE_GOODS, adventureUnlocked, buyAdventureGood } from './adventurers.mjs?v=4';
import { characterPortrait } from './character-maker.mjs?v=3';
import { lookPortrait } from './look.mjs?v=8';
// Asset lookup also works in the standalone build, without depending on the renderer.
const adventureAssetURL = path => globalThis.braviosAssets?.[path] || path;

export function setupAdventureMap({ state, save, launch, character: getCharacter, appearance }) {
  const dialog = document.querySelector('#adventure-map');
  const terrain = dialog.querySelector('.adventure-terrain');
  const status = dialog.querySelector('[data-adventure-status]');
  const info = dialog.querySelector('[data-adventure-info]');
  const enter = dialog.querySelector('[data-adventure-enter]');
  const shop = dialog.querySelector('[data-adventure-shop]');
  const hero = document.createElement('img'); hero.className = 'adventure-hero'; hero.alt = 'Jouw avonturier';
  terrain.append(hero);
  terrain.style.backgroundImage = `url("${adventureAssetURL('worlds/adventure/adventure-map.png')}")`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0, walking = false, walkTimer, walkFrame, browsingShop = false, shopIndex = 0;
  const nodes = [...ADVENTURE_FIELDS, ...ADVENTURE_SHOPS];
  const icons = { field: '🌳', water: '🌊', castle: '🏰', sky: '☁️', moon: '🚀' };
  const svg = terrain.querySelector('svg');
  const curves = new Map();
  function curve(a,b) {
    const key=[a,b].sort((x,y)=>x-y).join('-');
    if(!curves.has(key)) {
      const left=nodes[Math.min(a,b)],right=nodes[Math.max(a,b)];
      const bend=Math.abs(left.x-right.x)>Math.abs(left.y-right.y)?3:-3;
      curves.set(key,{a:Math.min(a,b),x:(left.x+right.x)/2+bend,y:(left.y+right.y)/2-bend});
    }
    return curves.get(key);
  }
  nodes.forEach((node,i) => {
    node.from.forEach(p => {
      const line = document.createElementNS('http://www.w3.org/2000/svg','path');
      const c=curve(p,i);line.setAttribute('d',`M ${nodes[p].x} ${nodes[p].y} Q ${c.x} ${c.y} ${node.x} ${node.y}`);
      line.dataset.predecessor = p; svg.append(line);
    });
    const button = document.createElement('button'); button.className = 'adventure-node';
    button.style.left = `${node.x}%`; button.style.top = `${node.y}%`; button.dataset.node = i;
    button.innerHTML = `<span aria-hidden="true">${i<12 ? icons[node.kind] : '🏪'}</span><b>${i<12 ? i+1 : 'Winkel'}</b>`;
    button.dataset.kind = node.kind || 'shop';
    button.setAttribute('aria-label', i<12 ? `${i+1}. ${node.name}` : node.name);
    button.addEventListener('click', () => travel(i)); terrain.append(button);
  });
  const available = i => i<12 ? adventureUnlocked(state(),i) : nodes[i].from.some(p => state().completed.includes(p));
  const edges = i => [...new Set([...nodes[i].from, ...nodes.flatMap((n,j)=>n.from.includes(i)?[j]:[])])].filter(available);
  function route(from,to) {
    const queue = [[from]], seen = new Set([from]);
    while(queue.length) { const path=queue.shift(), end=path.at(-1); if(end===to)return path;
      for(const next of edges(end)) if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}
    }
    return null;
  }
  function refresh() {
    const s = state(), n=nodes[selected];
    status.textContent = `● ${s.coins} muntjes · ♥ ${s.lives} extra levens · ${s.completed.length} / 12 gehaald${s.power ? ' · In je tas: '+ADVENTURE_GOODS.find(g=>g.id===s.power).name : ''}`;
    for(const b of terrain.querySelectorAll('[data-node]')) {
      const i=Number(b.dataset.node); b.disabled=!available(i)||walking;
      b.classList.toggle('completed',s.completed.includes(i)); b.classList.toggle('selected',i===selected);
      b.title = `${nodes[i].name}${available(i) ? s.completed.includes(i) ? ' · Gehaald' : '' : ' · Speel eerst het vorige veld uit'}`;
    }
    for(const line of svg.querySelectorAll('[data-predecessor]')) line.classList.toggle('open',s.completed.includes(Number(line.dataset.predecessor)));
    enter.hidden=false; enter.disabled=walking||!available(selected);
    enter.textContent = selected>=12 ? (browsingShop ? 'Verlaat de winkel' : 'Open de winkel') : n.kind==='moon' ? 'Stap in de raket 🚀' : s.completed.includes(selected) ? 'Speel opnieuw ▶' : 'Ga het veld in ▶';
    info.textContent = walking ? 'Je avonturier is onderweg…' : n.name + (n.kind==='castle' ? ' · Versla de eindbaas met vuur om de vlag vrij te spelen.' : n.kind==='moon' ? ' · Eerst opstijgen, daarna op avontuur op de maan.' : n.kind==='sky' ? ' · Spring over de wolken, hoog boven de wereld.' : '');
    shop.hidden=selected<12||walking||!browsingShop;
    for(const b of shop.querySelectorAll('[data-good]')) { const g=ADVENTURE_GOODS.find(g=>g.id===b.dataset.good); b.disabled=s.coins<g.price||(g.id==='life'?s.lives>=99:s.power===g.id); b.classList.toggle('controller-selected',browsingShop && Number(b.dataset.goodIndex)===shopIndex); }
  }
  function placeHero(i) { hero.style.left=`${nodes[i].x}%`;hero.style.top=`${nodes[i].y}%`; }
  function travel(i) {
    if(walking||!available(i))return;
    const path=route(selected,i);if(!path)return;
    walking=true;browsingShop=false;refresh();
    let step=1;
    function walk() {
      if(step>=path.length){selected=i;walking=false;if(i<12)state().position=i;save();refresh();terrain.focus({preventScroll:true});return;}
      const from=nodes[path[step-1]],to=nodes[path[step]],c=curve(path[step-1],path[step]);step++;
      let origin;
      function stride(now) {
        origin ??= now;const t=reducedMotion.matches?1:Math.min(1,(now-origin)/500),u=1-t;
        hero.style.left=`${u*u*from.x+2*u*t*c.x+t*t*to.x}%`;
        hero.style.top=`${u*u*from.y+2*u*t*c.y+t*t*to.y}%`;
        hero.style.marginTop=`${reducedMotion.matches?0:-Math.abs(Math.sin(t*Math.PI*6))*3}px`;
        if(t<1)walkFrame=requestAnimationFrame(stride);else {hero.style.marginTop='0';walkTimer=setTimeout(walk,50);}
      }
      walkFrame=requestAnimationFrame(stride);
    }
    walk();
  }
  for(const [goodIndex, good] of ADVENTURE_GOODS.entries()) {
    const b=document.createElement('button');b.className='button';b.dataset.good=good.id;b.dataset.goodIndex=goodIndex;b.textContent=`${good.name} · ${good.price} ●`;
    b.addEventListener('click',()=>{shopIndex=goodIndex;if(selected>=12&&!walking&&browsingShop&&buyAdventureGood(state(),good.id)){save();refresh();if(b.disabled)chooseGood('right');else b.focus({preventScroll:true});}});shop.append(b);
  }
  shop.addEventListener('focusin',event=>{const button=event.target.closest('[data-good-index]');if(button){shopIndex=Number(button.dataset.goodIndex);refresh();}});
  function moveOnMap(direction) {
    if(walking)return;
    const axis=['left','right'].includes(direction)?'x':'y',sign=['right','down'].includes(direction)?1:-1;
    const next=nodes.map((_,i)=>i).filter(i=>i!==selected && available(i) && (nodes[i][axis]-nodes[selected][axis])*sign>0)
      .sort((a,b)=>Math.abs(nodes[a][axis]-nodes[selected][axis])-Math.abs(nodes[b][axis]-nodes[selected][axis]))[0];
    if(next!==undefined)travel(next);
  }
  function chooseGood(direction) {
    const buttons=[...shop.querySelectorAll('[data-good]')];
    const delta=['right','down'].includes(direction)?1:-1;
    for(let offset=1;offset<=buttons.length;offset++) {
      const index=(shopIndex+delta*offset+buttons.length*2)%buttons.length;
      if(!buttons[index].disabled){shopIndex=index;refresh();buttons[index].focus({preventScroll:true});return;}
    }
  }
  function activate() {
    if(walking)return;
    if(selected>=12) {
      if(!browsingShop){
        browsingShop=true;refresh();
        const button=shop.querySelector('button:not(:disabled)');
        if(button){shopIndex=Number(button.dataset.goodIndex);refresh();button.focus({preventScroll:true});}
        else enter.focus({preventScroll:true});
      }else shop.querySelector(`[data-good-index="${shopIndex}"]:not(:disabled)`)?.click();
    }else enter.click();
  }
  function leaveShop() { browsingShop=false;refresh();terrain.focus({preventScroll:true}); }
  dialog.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    const direction={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'}[event.code];
    if(direction){event.preventDefault();event.stopPropagation();if(browsingShop)chooseGood(direction);else moveOnMap(direction);}
    else if(event.code==='Enter'||event.code==='Space'){
      if(event.target.closest('[data-close]')||event.target===enter)return;
      event.preventDefault();event.stopPropagation();if(!event.repeat){const target=event.target.closest('[data-node]');if(target && Number(target.dataset.node)!==selected)travel(Number(target.dataset.node));else activate();}
    }else if(event.code==='Escape'&&browsingShop){event.preventDefault();event.stopPropagation();leaveShop();}
  });
  enter.addEventListener('click',()=>{
    if(walking||!available(selected))return;
    if(selected>=12){if(browsingShop)leaveShop();else activate();return;}
    dialog.close();launch(selected);
  });
  dialog.addEventListener('close',()=>{clearTimeout(walkTimer);cancelAnimationFrame(walkFrame);walking=false;});
  return {
    isOpen: () => dialog.open,
    handleController(sample) {
      if(!dialog.open)return false;
      for(const action of sample.pressed) {
        const direction={left:'left',right:'right',up:'up',pipe:'down'}[action];
        if(direction){if(browsingShop)chooseGood(direction);else moveOnMap(direction);}
        else if(action==='jump'||action==='pause')activate();
        else if(action==='fire'){if(browsingShop)leaveShop();else dialog.close();}
      }
      return true;
    },
    open() { selected=state().position;walking=false;browsingShop=false;hero.src=characterPortrait(appearance())||lookPortrait(getCharacter())||adventureAssetURL(CHARACTER_PROFILES[getCharacter()].portrait);hero.style.transition='none';placeHero(selected);dialog.showModal();requestAnimationFrame(()=>{hero.style.transition='';});refresh();terrain.focus(); } };
}
