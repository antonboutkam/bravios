import { SMALL_GAME_TYPES, loadGamePack } from './catalog.mjs';
import { GameSessionHost } from '../runtime/game-session.mjs';
import { participantRoster } from '../characters/roster.mjs';
import { characters3D } from './platformer3d/access.mjs';
export function setupSmallGames({services={},participants=count=>participantRoster(count),load=loadGamePack}={}) {
  const dialog=document.querySelector('#small-games-dialog'),menu=dialog.querySelector('[data-small-menu]'),play=dialog.querySelector('[data-small-play]'),baseCanvas=dialog.querySelector('canvas'),ctx=baseCanvas.getContext('2d'),hud=dialog.querySelector('[data-small-status]'),hint=dialog.querySelector('[data-small-hint]'),result=dialog.querySelector('[data-small-result]');
  let canvas=baseCanvas,current=null,frame,last=0,held={},padHeld={},secondPadHeld={},menuIndex=0,dragging=false,choosingModels=false,generation=0;
  const host=new GameSessionHost(load);
  let session=null,loading=false,embedded=null,currentRoster=null;
  function releaseSession(){generation++;cancelAnimationFrame(frame);host.stop();session=null;current=null;loading=false;held={};padHeld={};secondPadHeld={};dragging=false;canvas.width=1;canvas.height=1;if(canvas!==baseCanvas){canvas.remove();canvas=baseCanvas;}baseCanvas.hidden=false;}
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
    if(current)session?.render(session.viewport.view==='3d'?null:ctx,canvas.width,canvas.height);
  }
  new ResizeObserver(resizeSmallCanvas).observe(stage);
  const rhythmControls=document.createElement('div');rhythmControls.className='rhythm-controls';rhythmControls.hidden=true;
  rhythmControls.innerHTML='<button class="button primary" data-jump="0">Speler 1 · Spring</button><button class="button primary" data-jump="1">Speler 2 · Spring</button><button class="button" data-rhythm-pause>Pauze</button>';
  play.insertBefore(rhythmControls,hint);
  for(const b of rhythmControls.querySelectorAll('[data-jump]'))b.addEventListener('pointerdown',e=>{e.preventDefault();if(session?.capabilities.jumpButtons)session.action(Number(b.dataset.jump));});
  for(const b of rhythmControls.querySelectorAll('[data-jump]'))b.addEventListener('click',e=>{if(e.detail===0&&session?.capabilities.jumpButtons)session.action(Number(b.dataset.jump));});
  const pauseButton=rhythmControls.querySelector('[data-rhythm-pause]');
  pauseButton.onclick=()=>{if(session?.capabilities.pause){session.togglePause();last=0;pauseButton.textContent=current.paused?'Verder':'Pauze';canvas.focus();}};
  const movementControls=document.createElement('div');movementControls.className='mini-movement-controls';movementControls.hidden=true;
  movementControls.innerHTML=[0,1].map(player=>`<div data-mini-player="${player}" class="mini-movement-player"><strong>Speler ${player+1}</strong>${[['left','←'],['up','↑'],['down','↓'],['right','→']].map(([dir,label])=>`<button class="button" data-mini-player-index="${player}" data-mini-direction="${dir}" aria-label="Speler ${player+1}: ${dir}">${label}</button>`).join('')}</div>`).join('');
  play.insertBefore(movementControls,hint);
  for(const button of movementControls.querySelectorAll('[data-mini-direction]')){
    button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);session?.control?.(Number(button.dataset.miniPlayerIndex),button.dataset.miniDirection,true);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>session?.control?.(Number(button.dataset.miniPlayerIndex),button.dataset.miniDirection,false));
  }
  function refreshSmallUI(){if(!current)return;const ui=session.ui();hud.textContent=ui.status;hint.textContent=ui.hint;result.hidden=current.state==='playing';result.textContent=ui.result;if(session.capabilities.pause)pauseButton.textContent=current.paused?'Verder':'Pauze';}
  function renderSmall(t){if(!dialog.open||!current)return;session.update({left:held.left||padHeld.left,right:held.right||padHeld.right,up:held.up||padHeld.up,down:held.down||padHeld.down,players:[padHeld,secondPadHeld]},last?Math.min((t-last)/1000,.25):0);last=t;session?.render(session.viewport.view==='3d'?null:ctx,canvas.width,canvas.height);refreshSmallUI();frame=requestAnimationFrame(renderSmall);}
  async function begin(kind,players=1,roster=null){
    if(!SMALL_GAME_TYPES.some(type=>type.id===kind))throw new Error('Onbekend klein spel.');
    const rosterForRound=roster||embedded?.request.participants||participants(players);
    releaseSession();const requestGeneration=generation;choosingModels=false;loading=true;last=0;menu.hidden=true;play.hidden=false;result.hidden=true;
    hud.textContent='Spel laden…';hint.textContent='';rhythmControls.hidden=true;movementControls.hidden=true;
    if(SMALL_GAME_TYPES.find(type=>type.id===kind).renderer==='webgl'){canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','3D-speelveld voor taartgooien');stage.append(canvas);baseCanvas.hidden=true;bindPointer(canvas);}
    dialog.querySelector('h2').textContent=SMALL_GAME_TYPES.find(t=>t.id===kind).name;
    try{
      const loaded=await host.start(kind,{view:SMALL_GAME_TYPES.find(type=>type.id===kind).view,playerCount:players,participants:rosterForRound,services,options:embedded?.request.options||{}});
      if(!loaded)return;
      session=loaded;
      if(session.mount)await session.mount(canvas);
      if(requestGeneration!==generation||!loaded.state)return;
      current=session.state;currentRoster=rosterForRound;loading=false;
      rhythmControls.hidden=!session.capabilities.jumpButtons;pauseButton.hidden=!session.capabilities.pause;rhythmControls.querySelector('[data-jump="1"]').hidden=players!==2;pauseButton.textContent='Pauze';
      for(const button of rhythmControls.querySelectorAll('[data-jump]'))button.textContent=`Speler ${Number(button.dataset.jump)+1} · ${session.capabilities.actionLabel||'Spring'}`;
      movementControls.hidden=!session.capabilities.movementButtons;movementControls.querySelector('[data-mini-player="1"]').hidden=players!==2;
      dialog.querySelector('[data-small-retry]').textContent=embedded?'Terug naar avontuur':'Opnieuw spelen ↻';

      resizeSmallCanvas();refreshSmallUI();canvas.focus();frame=requestAnimationFrame(renderSmall);
    }catch(error){
      if(requestGeneration!==generation)return;
      releaseSession();
      if(leaveEmbedded({game:kind,outcome:'error'}))return;
      showMenu();result.hidden=false;hud.textContent='';
      menu.querySelector('button')?.focus();
      dialog.querySelector('h2').textContent=`Laden mislukt: ${error.message}`;
    }
  }
  function showMenu(){if(leaveEmbedded(session?.result()||{game:current?.kind||embedded?.request.game,outcome:'cancelled'}))return;rhythmControls.hidden=true;movementControls.hidden=true;choosingModels=false;releaseSession();renderMenu();menu.hidden=false;play.hidden=true;dialog.querySelector('h2').textContent='Kleine games';menu.querySelectorAll('[data-small-kind]')[menuIndex]?.focus();}
  function renderMenu(){
    menu.replaceChildren();
    for(const type of SMALL_GAME_TYPES){const b=document.createElement('button');b.className='small-choice';b.dataset.smallKind=type.id;b.innerHTML=`<span>${type.icon}</span><strong>${type.name}</strong><small>${type.hint}</small>`;b.addEventListener('focus',()=>{menuIndex=[...menu.querySelectorAll('button')].indexOf(b);});b.onclick=()=>chooseGame(type.id);menu.append(b);if(type.players.includes(2)){const two=b.cloneNode(true);two.dataset.smallKind=`${type.id}-two`;two.querySelector('strong').textContent=`${type.name} · samen`;two.querySelector('small').textContent=type.twoPlayerHint||'Twee spelers op één scherm. Spatie en ↑, A en Y, of twee controllers.';two.addEventListener('focus',()=>{menuIndex=[...menu.querySelectorAll('button')].indexOf(two);});two.onclick=()=>chooseGame(type.id,2);menu.append(two);}}
  }
  function chooseGame(kind,players=1){
    if(SMALL_GAME_TYPES.find(type=>type.id===kind)?.renderer!=='webgl')return begin(kind,players);
    releaseSession();choosingModels=true;menu.hidden=false;play.hidden=true;menu.replaceChildren();
    dialog.querySelector('h2').textContent='Taartgooien · kies je 3D-personage';
    const profiles=characters3D(),roster=embedded?.request.participants||participants(players);
    const chosen=Array.from({length:players},(_,index)=>Math.max(0,profiles.findIndex(p=>p.id===roster[index]?.character&&!roster[index]?.appearance)));
    const add=(label,handler)=>{const b=document.createElement('button');b.className='small-choice';b.textContent=label;b.onclick=handler;b.addEventListener('focus',()=>{menuIndex=[...menu.querySelectorAll('button')].indexOf(b);});menu.append(b);return b;};
    if(!profiles.length){add('Geen 3D-personages beschikbaar · terug',showMenu);return;}
    for(let index=0;index<players;index++){
      const label=()=>`Speler ${index+1}: ${profiles[chosen[index]].name} · wissel personage`;
      const b=add(label(),()=>{chosen[index]=(chosen[index]+1)%profiles.length;b.textContent=label();});
    }
    add(players===2?'Start met twee spelers':'Start tegen de computer',()=>begin(kind,players,chosen.map((value,index)=>({id:`player-${index+1}`,character:profiles[value].id,appearance:null}))));
    add('Terug naar kleine games',showMenu);menuIndex=0;menu.querySelector('button')?.focus();
  }
  renderMenu();
  function action(){if(!current)return;if(current.state!=='playing'){if(!leaveEmbedded(session.result()))void begin(current.kind,current.playerCount||1,currentRoster);return;}session.action();}
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*(session?.viewport.width||800)/r.width,y:(e.clientY-r.top)*(session?.viewport.height||440)/r.height};};
  function bindPointer(target){
    target.addEventListener('pointerdown',e=>{e.preventDefault();target.focus();target.setPointerCapture(e.pointerId);if(!current||current.state!=='playing')return;dragging=true;session.pointer('down',point(e),dragging);});
    target.addEventListener('pointermove',e=>session?.pointer('move',point(e),dragging));
    target.addEventListener('pointerup',e=>{session?.pointer('up',point(e),dragging);dragging=false;});
    target.addEventListener('pointercancel',()=>{dragging=false;});
  }
  bindPointer(baseCanvas);
  dialog.addEventListener('keydown',e=>{if(e.code==='Escape'&&(current||loading)){e.preventDefault();showMenu();return;}if(!e.target.closest('button')&&session?.key?.(e,true)){e.preventDefault();return;}if(session?.capabilities.upAction&&['Space','ArrowUp','KeyP'].includes(e.code)&&!e.target.closest('button')){e.preventDefault();if(!e.repeat){if(e.code==='KeyP')pauseButton.click();else session.action(e.code==='ArrowUp'&&current.playerCount===2?1:0);}return;}if(!current&&!loading&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();const buttons=[...menu.querySelectorAll('button')];menuIndex=(menuIndex+(['ArrowLeft','ArrowUp'].includes(e.code)?-1:1)+buttons.length)%buttons.length;buttons[menuIndex].focus();return;}if(e.target.closest('button'))return;const dir={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'}[e.code];if(dir){e.preventDefault();held[dir]=true;if(!e.repeat)session?.direction(dir);}else if(['Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)action();}});
  dialog.addEventListener('keyup',e=>{if(session?.key?.(e,false)){e.preventDefault();return;}const dir={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'}[e.code];if(dir)held[dir]=false;});
  dialog.querySelector('[data-small-back]').onclick=showMenu;dialog.querySelector('[data-small-retry]').onclick=()=>{if(!leaveEmbedded(session?.result()||{game:current?.kind||embedded?.request.game,outcome:'cancelled'})&&current)void begin(current.kind,current.playerCount||1,currentRoster);};
  dialog.addEventListener('cancel',e=>{if(current||loading||choosingModels){e.preventDefault();showMenu();}});
  dialog.addEventListener('close',()=>{const request=embedded;embedded=null;releaseSession();request?.resolve({game:request.request.game,outcome:'cancelled'});if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;});function pauseRhythm(){if(session?.capabilities.pause&&current.state==='playing'){session.pause();pauseButton.textContent='Verder';}held={};padHeld={};secondPadHeld={};last=0;}
  window.addEventListener('blur',pauseRhythm);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseRhythm();});
  return {
    open(){dialog.showModal();showMenu();void enterFullscreen();},
    play(request){
      if(dialog.open)return Promise.reject(new Error('Er is al een minigame geopend.'));
      const type=SMALL_GAME_TYPES.find(type=>type.id===request.game);
      if(!type)return Promise.reject(new Error('Onbekend klein spel.'));
      const players=request.participants?.length||1;
      if(!type.players.includes(players))return Promise.reject(new Error('Dit spel ondersteunt dit aantal spelers niet.'));
      return new Promise(resolve=>{embedded={request,resolve};dialog.showModal();void enterFullscreen();void chooseGame(request.game,players);});
    },
    isOpen:()=>dialog.open,
    handleController(sample,secondSample={pressed:[]}){
      if(!dialog.open)return;
      secondPadHeld=secondSample.navigation||{};
      padHeld=sample.navigation||{...sample.controls,up:sample.pressed.includes('up'),down:sample.controls.pipe};
      // Handle transitions once, so a simultaneous A/B press cannot start the next screen.
      if((sample.pressed.includes('fire')||sample.pressed.includes('cancel'))){if(current||loading||choosingModels)showMenu();else dialog.close();return;}
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
