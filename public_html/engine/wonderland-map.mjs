import { assetURL } from './paths.mjs';
import { WONDERLAND_FIELDS, wonderlandUnlocked, wonderlandNodes, wonderlandEdges, wonderlandRoute } from './wonderland.mjs?v=3';

export function setupWonderlandMap({state,save,launch}) {
  const dialog=document.querySelector('#wonderland-map'),terrain=dialog.querySelector('.wonderland-terrain'),svg=terrain.querySelector('svg'),info=dialog.querySelector('[data-wonder-info]'),status=dialog.querySelector('[data-wonder-status]'),enter=dialog.querySelector('[data-wonder-enter]');
  terrain.style.backgroundImage=`url("${assetURL('assets/backgrounds/worlds/wonderland/world-inspiration.png')}")`;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0,walking=false,journey=0,swingTimer;
  const hero=document.createElement('span');hero.className='wonderland-traveller';hero.textContent='✦';hero.setAttribute('aria-hidden','true');terrain.append(hero);
  const buttons=WONDERLAND_FIELDS.map((n,i)=>{
    const b=document.createElement('button');b.className='wonderland-node';b.textContent=n.castle?'🏰':n.secret?'★':String(i+1);b.setAttribute('aria-label',`${i+1}. ${n.name}`);b.addEventListener('click',()=>travel(i));terrain.append(b);return b;
  });
  function place(x,y){hero.style.left=`${x}%`;hero.style.top=`${y}%`;}
  function refresh(){const s=state(),nodes=wonderlandNodes(s),n=nodes[selected];
    status.textContent=`${s.completed.length} / ${nodes.length} velden gehaald · ★ ${s.stars} droomster${s.stars===1?'':'ren'}${s.completed.includes(14)?' · Wonderland gered!':''}`;
    nodes.forEach((node,i)=>{const b=buttons[i];b.hidden=node.secret&&!wonderlandUnlocked(s,i);b.disabled=walking||!wonderlandUnlocked(s,i);b.style.left=`${node.x}%`;b.style.top=`${node.y}%`;b.classList.toggle('completed',s.completed.includes(i));b.classList.toggle('selected',i===selected);b.title=`${node.name}${b.disabled?' · Speel eerst het vorige veld uit':''}`;b.setAttribute('aria-current',i===selected?'location':'false');});
    svg.replaceChildren();
    for(const e of wonderlandEdges(s)){
      const a=nodes[e.a],b=nodes[e.b],path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M ${a.x} ${a.y} Q ${(a.x+b.x)/2+3} ${(a.y+b.y)/2-4} ${b.x} ${b.y}`);path.dataset.kind=e.kind;svg.append(path);
    }
    info.textContent=walking?'Je bent onderweg…':`${n.name} · ${n.hint}`;
    enter.disabled=walking;enter.textContent=s.completed.includes(selected)?'Speel opnieuw ▶':'Ga het veld in ▶';
    dialog.querySelector('[data-wonder-swing]').hidden=!s.completed.includes(7)||walking;
    if(!walking)place(n.x,n.y);
  }
  async function travel(to,forcedKind=null){if(walking)return;const s=state(),route=wonderlandRoute(s,selected,to);if(!route)return;
    const token=++journey,nodes=wonderlandNodes(s);walking=true;refresh();
    for(let step=1;step<route.length;step++){
      const a=nodes[route[step-1]],b=nodes[route[step]],edge=wonderlandEdges(s).find(e=>(e.a===route[step-1]&&e.b===route[step])||(e.b===route[step-1]&&e.a===route[step]));
      const kind=forcedKind||edge?.kind;hero.textContent=['boat','whirlpool'].includes(kind)?'⛵':kind==='swing'?'🌸':'✦';
      info.textContent=kind==='whirlpool'?'Een magische draaikolk brengt je naar het geheime eiland!':kind==='boat'?'De toverboot vaart naar de volgende aanlegplaats.':kind==='swing'?'De bloemenplank zwaait naar jouw gekozen pad.':'Volg het fonkelende pad…';
      await new Promise(resolve=>{let start;function stride(now){if(token!==journey){resolve();return;}start??=now;const t=reduced.matches?1:Math.min(1,(now-start)/850),u=1-t;
        place(u*u*a.x+2*u*t*((a.x+b.x)/2+3)+t*t*b.x,u*u*a.y+2*u*t*((a.y+b.y)/2-4)+t*t*b.y-(kind==='swing'?Math.sin(t*Math.PI)*9:0));
        if(t<1)requestAnimationFrame(stride);else resolve();}requestAnimationFrame(stride);});
      if(token!==journey)return;
    }
    selected=to;s.position=to;walking=false;hero.textContent='✦';save();refresh();enter.focus({preventScroll:true});
  }
  function updateSwing(){const choices=[5,7,9].filter(i=>wonderlandUnlocked(state(),i));if(choices.length)dialog.querySelector('[data-wonder-swing]').textContent=`🌸 Zwaai naar ${WONDERLAND_FIELDS[choices[Math.floor(performance.now()/1800)%choices.length]].name}`;}
  function move(direction){if(walking)return;const nodes=wonderlandNodes(state()),axis=['left','right'].includes(direction)?'x':'y',sign=['left','up'].includes(direction)?-1:1;
    const next=nodes.map((_,i)=>i).filter(i=>i!==selected&&wonderlandUnlocked(state(),i)&&(nodes[i][axis]-nodes[selected][axis])*sign>0).sort((a,b)=>Math.hypot(nodes[a].x-nodes[selected].x,nodes[a].y-nodes[selected].y)-Math.hypot(nodes[b].x-nodes[selected].x,nodes[b].y-nodes[selected].y))[0];if(next!==undefined)travel(next);
  }
  enter.addEventListener('click',()=>{if(!walking){dialog.close();launch(selected);}});
  dialog.querySelector('[data-wonder-swing]').addEventListener('click',()=>{if(walking)return;const s=state();const choices=[5,7,9].filter(i=>wonderlandUnlocked(s,i));const next=choices[Math.floor(performance.now()/1800)%choices.length];if(next===selected){info.textContent='De bloemenplank wijst nu naar jouw pad. Wacht even op de volgende zwaai!';return;}travel(next,'swing');});
  dialog.addEventListener('keydown',e=>{const dir={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'}[e.code];if(dir){e.preventDefault();e.stopPropagation();move(dir);}else if(['Enter','Space'].includes(e.code)&&!e.target.closest('button')){e.preventDefault();enter.click();}});
  dialog.addEventListener('close',()=>{journey++;walking=false;clearInterval(swingTimer);});
  return {open(){selected=state().position;walking=false;refresh();updateSwing();clearInterval(swingTimer);swingTimer=setInterval(updateSwing,250);dialog.showModal();enter.focus();},isOpen:()=>dialog.open,handleController(sample){for(const a of sample.pressed){const dir={left:'left',right:'right',up:'up',pipe:'down'}[a];if(dir)move(dir);else if(a==='jump')enter.click();else if(['pause','back','cancel'].includes(a))dialog.close();}}};
}
