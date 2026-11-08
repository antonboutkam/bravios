import { SMALL_GAME_TYPES, loadGamePack } from './catalog.mjs';
import { GameSessionHost } from '../runtime/game-session.mjs';
import { participantRoster } from '../characters/roster.mjs';
export function setupSmallGames({services={},participants=count=>participantRoster(count),load=loadGamePack}={}) {
  const dialog=document.querySelector('#small-games-dialog'),menu=dialog.querySelector('[data-small-menu]'),play=dialog.querySelector('[data-small-play]'),canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),hud=dialog.querySelector('[data-small-status]'),hint=dialog.querySelector('[data-small-hint]'),result=dialog.querySelector('[data-small-result]');
  let current=null,frame,last=0,held={},padHeld={},menuIndex=0,dragging=false;
  const host=new GameSessionHost(load);
  let session=null,loading=false,embedded=null;
  function releaseSession(){cancelAnimationFrame(frame);host.stop();session=null;current=null;loading=false;held={};padHeld={};dragging=false;canvas.width=1;canvas.height=1;}
  function leaveEmbedded(outcome){if(!embedded)return false;const resolve=embedded.resolve;embedded=null;dialog.close();resolve(outcome);return true;}
  let ownsFullscreen=false;
  const fullscreenButton=dialog.querySelector('[data-small-fullscreen]');
  function updateFullscreen(){
    fullscreenButton.textContent=document.fullscreenElement?'Verlaat volledig scherm':'Volledig scherm';
    fullscreenButton.hidden=!document.documentElement.requestFullscreen;
    if(!document.fullscreenElement)ownsFullscreen=false;
  }
  async function enterFullscreen(){
    if(document.fullscreenElement||!document.documentElement.requestFullscreen)return;
    try {
      await document.documentElement.requestFullscreen();
      ownsFullscreen=true;
      if(!dialog.open){await document.exitFullscreen();ownsFullscreen=false;}
    } catch { /* The viewport layout also works when the browser denies fullscreen. */ }
    updateFullscreen();
  }
  fullscreenButton.onclick=async()=>{
    if(document.fullscreenElement){try{await document.exitFullscreen();}catch{}}
    else await enterFullscreen();
    updateFullscreen();
  };
  document.addEventListener('fullscreenchange',updateFullscreen);
  updateFullscreen();
  const stage=dialog.querySelector('.small-stage');
  function resizeSmallCanvas(){
    const {width:logicalWidth,height:logicalHeight}=session?.viewport||{width:800,height:440};
    const scale=Math.min(stage.clientWidth/logicalWidth,stage.clientHeight/logicalHeight);
    if(scale<=0)return;
    const width=logicalWidth*scale,height=logicalHeight*scale,density=Math.min(window.devicePixelRatio||1,2);
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
    if(current)session?.render(ctx,canvas.width,canvas.height);
  }
  new ResizeObserver(resizeSmallCanvas).observe(stage);
  const rhythmControls=document.createElement('div');rhythmControls.className='rhythm-controls';rhythmControls.hidden=true;
  rhythmControls.innerHTML='<button class="button primary" data-jump="0">Speler 1 · Spring</button><button class="button primary" data-jump="1">Speler 2 · Spring</button><button class="button" data-rhythm-pause>Pauze</button>';
  play.insertBefore(rhythmControls,hint);
  for(const b of rhythmControls.querySelectorAll('[data-jump]'))b.addEventListener('pointerdown',e=>{e.preventDefault();if(session?.capabilities.jumpButtons)session.action(Number(b.dataset.jump));});
  for(const b of rhythmControls.querySelectorAll('[data-jump]'))b.addEventListener('click',e=>{if(e.detail===0&&session?.capabilities.jumpButtons)session.action(Number(b.dataset.jump));});
  const pauseButton=rhythmControls.querySelector('[data-rhythm-pause]');
  pauseButton.onclick=()=>{if(session?.capabilities.pause){session.togglePause();last=0;pauseButton.textContent=current.paused?'Verder':'Pauze';canvas.focus();}};
  function refreshSmallUI(){if(!current)return;const ui=session.ui();hud.textContent=ui.status;hint.textContent=ui.hint;result.hidden=current.state==='playing';result.textContent=ui.result;}
  function renderSmall(t){if(!dialog.open||!current)return;session.update({left:held.left||padHeld.left,right:held.right||padHeld.right,up:held.up||padHeld.up,down:held.down||padHeld.down},last?Math.min((t-last)/1000,.25):0);last=t;session?.render(ctx,canvas.width,canvas.height);refreshSmallUI();frame=requestAnimationFrame(renderSmall);}
  async function begin(kind,players=1){
    if(!SMALL_GAME_TYPES.some(type=>type.id===kind))throw new Error('Onbekend klein spel.');
    releaseSession();loading=true;last=0;menu.hidden=true;play.hidden=false;result.hidden=true;
    hud.textContent='Spel laden…';hint.textContent='';rhythmControls.hidden=true;
    dialog.querySelector('h2').textContent=SMALL_GAME_TYPES.find(t=>t.id===kind).name;
    try{
      const loaded=await host.start(kind,{view:SMALL_GAME_TYPES.find(type=>type.id===kind).view,playerCount:players,participants:embedded?.request.participants||participants(players),services,options:embedded?.request.options||{}});
      if(!loaded)return;
      session=loaded;current=session.state;loading=false;
      rhythmControls.hidden=!session.capabilities.jumpButtons;pauseButton.hidden=!session.capabilities.pause;rhythmControls.querySelector('[data-jump="1"]').hidden=players!==2;pauseButton.textContent='Pauze';
      dialog.querySelector('[data-small-retry]').textContent=embedded?'Terug naar avontuur':'Opnieuw spelen ↻';

      resizeSmallCanvas();refreshSmallUI();canvas.focus();frame=requestAnimationFrame(renderSmall);
    }catch(error){
      releaseSession();
      if(leaveEmbedded({game:kind,outcome:'error'}))return;
      showMenu();result.hidden=false;hud.textContent='';
      menu.querySelector('button')?.focus();
      dialog.querySelector('h2').textContent='Laden mislukt · kies opnieuw';
    }
  }
  function showMenu(){if(leaveEmbedded(session?.result()||{game:current?.kind||embedded?.request.game,outcome:'cancelled'}))return;rhythmControls.hidden=true;releaseSession();menu.hidden=false;play.hidden=true;dialog.querySelector('h2').textContent='Kleine games';menu.querySelectorAll('[data-small-kind]')[menuIndex]?.focus();}
  for(const type of SMALL_GAME_TYPES){const b=document.createElement('button');b.className='small-choice';b.dataset.smallKind=type.id;b.innerHTML=`<span>${type.icon}</span><strong>${type.name}</strong><small>${type.hint}</small>`;b.addEventListener('focus',()=>{menuIndex=[...menu.querySelectorAll('button')].indexOf(b);});b.onclick=()=>begin(type.id);menu.append(b);if(type.players.includes(2)){const two=b.cloneNode(true);two.dataset.smallKind=`${type.id}-two`;two.querySelector('strong').textContent=`${type.name} · samen`;two.querySelector('small').textContent='Twee spelers op één scherm. Spatie en ↑, A en Y, of twee controllers.';two.addEventListener('focus',()=>{menuIndex=[...menu.querySelectorAll('button')].indexOf(two);});two.onclick=()=>begin(type.id,2);menu.append(two);}}
  function action(){if(!current)return;if(current.state!=='playing'){if(!leaveEmbedded(session.result()))void begin(current.kind,current.playerCount||1);return;}session.action();}
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*(session?.viewport.width||800)/r.width,y:(e.clientY-r.top)*(session?.viewport.height||440)/r.height};};
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.focus();canvas.setPointerCapture(e.pointerId);if(!current||current.state!=='playing')return;dragging=true;session.pointer('down',point(e),dragging);});
  canvas.addEventListener('pointermove',e=>session?.pointer('move',point(e),dragging));
  canvas.addEventListener('pointerup',e=>{session?.pointer('up',point(e),dragging);dragging=false;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;});
  dialog.addEventListener('keydown',e=>{if(e.code==='Escape'&&(current||loading)){e.preventDefault();showMenu();return;}if(session?.capabilities.upAction&&['Space','ArrowUp','KeyP'].includes(e.code)&&!e.target.closest('button')){e.preventDefault();if(!e.repeat){if(e.code==='KeyP')pauseButton.click();else session.action(e.code==='ArrowUp'&&current.playerCount===2?1:0);}return;}if(!current&&!loading&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();const buttons=[...menu.querySelectorAll('button')];menuIndex=(menuIndex+(['ArrowLeft','ArrowUp'].includes(e.code)?-1:1)+buttons.length)%buttons.length;buttons[menuIndex].focus();return;}if(e.target.closest('button'))return;const dir={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'}[e.code];if(dir){e.preventDefault();held[dir]=true;if(!e.repeat)session?.direction(dir);}else if(['Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)action();}});
  dialog.addEventListener('keyup',e=>{const dir={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'}[e.code];if(dir)held[dir]=false;});
  dialog.querySelector('[data-small-back]').onclick=showMenu;dialog.querySelector('[data-small-retry]').onclick=()=>{if(!leaveEmbedded(session?.result()||{game:current?.kind||embedded?.request.game,outcome:'cancelled'})&&current)void begin(current.kind,current.playerCount||1);};
  dialog.addEventListener('cancel',e=>{if(current||loading){e.preventDefault();showMenu();}});
  dialog.addEventListener('close',()=>{const request=embedded;embedded=null;releaseSession();request?.resolve({game:request.request.game,outcome:'cancelled'});if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;});function pauseRhythm(){if(session?.capabilities.pause&&current.state==='playing'){session.pause();pauseButton.textContent='Verder';}held={};padHeld={};last=0;}
  window.addEventListener('blur',pauseRhythm);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseRhythm();});
  return {
    open(){dialog.showModal();showMenu();void enterFullscreen();},
    play(request){
      if(dialog.open)return Promise.reject(new Error('Er is al een minigame geopend.'));
      const type=SMALL_GAME_TYPES.find(type=>type.id===request.game);
      if(!type)return Promise.reject(new Error('Onbekend klein spel.'));
      const players=request.participants?.length||1;
      if(!type.players.includes(players))return Promise.reject(new Error('Dit spel ondersteunt dit aantal spelers niet.'));
      return new Promise(resolve=>{embedded={request,resolve};dialog.showModal();void enterFullscreen();void begin(request.game,players);});
    },
    isOpen:()=>dialog.open,
    handleController(sample,secondSample={pressed:[]}){
      if(!dialog.open)return;
      padHeld=sample.navigation||{...sample.controls,up:sample.pressed.includes('up'),down:sample.controls.pipe};
      // Handle transitions once, so a simultaneous A/B press cannot start the next screen.
      if(sample.pressed.includes('fire')){if(current||loading)showMenu();else dialog.close();return;}
      if(loading)return;
      if(!current){
        const buttons=[...menu.querySelectorAll('button')];
        for(const a of sample.pressed){
          if(['left','up','right','pipe'].includes(a)){
            menuIndex=(menuIndex+(['left','up'].includes(a)?-1:1)+buttons.length)%buttons.length;
            buttons[menuIndex].focus();
          }else if(a==='jump'||a==='pause'){buttons[menuIndex].click();return;}
        }
        return;
      }
      if(session.capabilities.pause&&current.state==='playing'&&
        (sample.pressed.includes('pause')||secondSample.pressed.includes('pause'))){pauseButton.click();return;}
      if(current.state!=='playing'){
        if(sample.pressed.includes('jump')||sample.pressed.includes('pause'))action();
        return;
      }
      if(sample.pressed.includes('jump'))action();
      if(current.playerCount===2&&
        (sample.pressed.includes('mount')||secondSample.pressed.includes('jump')))session.action(1);
      for(const a of sample.pressed)if(['left','right','up','pipe'].includes(a))session.direction(a==='pipe'?'down':a);
    }
  };
}
