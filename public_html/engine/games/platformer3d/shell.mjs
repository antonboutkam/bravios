import { movement3D } from './input.mjs';
import { createStage3D } from './render.mjs?v=babylon-1';
import { validateLevel3D, OBJECTS_3D } from './level.mjs';
import { createGame3D, stepGame3D, initializePhysics3D, disposeGame3D } from './model.mjs';
import { characters3D, enemies3D, assert3DCharacter } from './access.mjs';
import { GamepadInput } from '../../gamepad.mjs';
const copy=value=>JSON.parse(JSON.stringify(value));
export async function openPlatformer3D({level,identity,mode='play',onSave=()=>true,onComplete=()=>{},onExit=()=>{}}) {
  if(document.querySelector('#platformer3d-dialog'))throw new Error('Er staat al een 3D-veld open.');
  let draft=validateLevel3D(level),game=null,editing=mode==='edit',closed=false,frame=0,last=0,accumulator=0,selected=null,placing='block',jumpPending=false;
  let undo=[],redo=[],pointerStart=null,paused=false,wonReported=false;
  const keys=new Set(),touch=new Set(),controller=new GamepadInput(),scope=new AbortController();
  const dialog=document.createElement('dialog');dialog.id='platformer3d-dialog';dialog.className='platformer3d-dialog';
  dialog.innerHTML=`<div class="three-header"><div><span class="eyebrow">BRAVIOS · 3D</span><h2 data-title></h2></div><div class="three-header-actions"><button type="button" class="button" data-view-models>Personages in 3D</button><button type="button" class="button primary" data-test>▶ Proefspelen</button><button type="button" class="button" data-pause>Pauze</button><button type="button" class="button" data-retry>Opnieuw</button><button type="button" class="button" data-back>Terug naar wereldkaart</button></div></div>
<div class="three-workspace"><aside class="three-tools" data-editor><h3>Bouw je 3D-veld</h3><p>Klik om te plaatsen. Rechts slepen: draaien. Scrollen: zoomen.</p><label for="three-tool">Onderdeel</label><select id="three-tool"><option value="select">Selecteren / verplaatsen</option></select><label for="three-enemy">Vijand met 3D-model</label><select id="three-enemy"></select><div class="three-dimensions"><label>X<input id="three-x" type="number" min="0" step="1" value="4"></label><label>Hoogte Y<input id="three-y" type="number" min="0" step="1" value="1"></label><label>Z<input id="three-z" type="number" min="0" step="1" value="4"></label></div><div class="three-dimensions" data-block-size><label>Breedte<input id="three-w" type="number" min="1" max="80" value="1"></label><label>Hoogte<input id="three-h" type="number" min="1" max="32" value="1"></label><label>Diepte<input id="three-d" type="number" min="1" max="80" value="1"></label></div><div class="three-tool-actions"><button class="button" data-place>Plaats op deze plek</button><button class="button" data-apply>Verplaats / pas aan</button><button class="button" data-rotate>Draai blok 90°</button><button class="button" data-delete>Verwijder selectie</button><button class="button" data-undo>Ongedaan</button><button class="button" data-redo>Opnieuw uitvoeren</button></div><label for="three-object-list">Geplaatste onderdelen</label><select id="three-object-list"><option value="">Kies een onderdeel</option></select><p data-selection></p><p class="dialog-note">Alleen vijanden met een 3D-model en ondersteund gedrag staan in deze lijst. Je wereld wordt automatisch bewaard.</p></aside><div class="three-stage"><canvas tabindex="0" aria-label="3D-speelveld"></canvas><div class="three-overlay" data-overlay hidden><h3 data-overlay-title></h3><p data-overlay-copy></p><button class="button primary" data-overlay-action>Verder</button></div><div class="three-hud" data-hud role="status"></div><div class="three-touch" data-touch><button data-control="up" aria-label="Vooruit">↑</button><button data-control="left" aria-label="Links">←</button><button data-control="down" aria-label="Achteruit">↓</button><button data-control="right" aria-label="Rechts">→</button><button data-control="jump">Spring</button></div></div></div><footer class="three-footer"><span data-status role="status">3D-modellen laden…</span><div><button class="text-button" data-camera-left aria-label="Camera naar links">↶ Camera</button><button class="text-button" data-camera-right aria-label="Camera naar rechts">Camera ↷</button></div><span data-hint></span></footer>`;
  document.body.append(dialog);
  const $=selector=>dialog.querySelector(selector),canvas=$('canvas');
  const listen=(target,type,handler,options={})=>target.addEventListener(type,handler,{...options,signal:scope.signal});
  const status=message=>{$('[data-status]').textContent=message;};
  function attempt(fn){try{fn();}catch(error){status(error.message);}}
  let stage;
  function close(){if(closed)return;closed=true;cancelAnimationFrame(frame);scope.abort();disposeGame3D(game);stage?.dispose();dialog.remove();onExit({won:!!wonReported,level:draft});}
  listen(dialog,'close',close);listen(dialog,'cancel',event=>{event.preventDefault();dialog.close();});
  listen($('[data-back]'),'click',()=>dialog.close());dialog.showModal();
  try{stage=createStage3D(canvas);await stage.prepare(draft,identity?.character);await initializePhysics3D();if(closed)return;}
  catch(error){if(!closed){status(error.message);$('[data-test]').disabled=true;$('[data-retry]').disabled=true;$('[data-editor]').hidden=true;}return;}
  function refresh(){
    $('[data-title]').textContent=draft.name;
    $('[data-editor]').hidden=!editing;$('[data-touch]').hidden=editing;$('[data-test]').hidden=mode!=='edit';$('[data-test]').textContent=editing?'▶ Proefspelen':'✎ Verder bouwen';
    $('[data-pause]').hidden=editing;$('[data-retry]').hidden=editing;$('[data-view-models]').disabled=!editing&&game?.state==='playing'&&!paused;
    $('[data-hint]').textContent=editing?'Bouwhoogte: Y · rechts slepen: camera · scrollen: zoomen':'WASD / pijltjes: lopen · spatie / A: springen · Q/E: camera · P / Start: pauze';
    $('[data-block-size]').hidden=!['block','lava'].includes(placing)&&!['block','lava'].includes(draft.objects.find(o=>o.id===selected)?.type);
    $('#three-enemy').disabled=placing!=='enemy';$('[data-apply]').disabled=!selected;$('[data-delete]').disabled=!selected;$('[data-undo]').disabled=!undo.length;$('[data-redo]').disabled=!redo.length;
    const list=$('#three-object-list');list.replaceChildren(new Option('Kies een onderdeel',''));for(const o of draft.objects)list.add(new Option(`${OBJECTS_3D[o.type]} · ${o.x}, ${o.y}, ${o.z}`,o.id));list.value=selected||'';
    $('[data-selection]').textContent=selected?`Geselecteerd: ${OBJECTS_3D[draft.objects.find(o=>o.id===selected)?.type]||''}`:'Selecteer een onderdeel om het te verplaatsen.';
  }
  // All palette models are loaded up front so placing a new supported enemy is synchronous.
  try{for(const profile of enemies3D())await stage.load(profile);if(closed)return;}
  catch(error){status(error.message);return;}
  function commit(next,remember=true){
    const validated=validateLevel3D(next);
    if(remember){undo.push(copy(draft));if(undo.length>60)undo.shift();redo=[];}
    draft=validated;if(selected&&!draft.objects.some(o=>o.id===selected))selected=null;
    const saved=onSave(copy(draft));stage.setLevel(draft,{editing:true});stage.setLayer(Number($('#three-y').value));refresh();status(saved===false?'Bewaren lukt niet. Download je wereld voordat je afsluit.':'Bewaard · '+draft.objects.length+' onderdelen');
  }
  function values(type,id){
    const result={id,type,x:Number($('#three-x').value),y:Number($('#three-y').value),z:Number($('#three-z').value)};
    if(['block','lava'].includes(type))for(const n of ['w','h','d'])result[n]=Number($('#three-'+n).value);
    if(type==='enemy')result.enemy=$('#three-enemy').value;
    return result;
  }
  function place(){if(!editing||placing==='select')return;const id=globalThis.crypto?.randomUUID?.()||`part-${Date.now()}-${Math.random().toString(36).slice(2)}`;const next=copy(draft);if(['start','finish'].includes(placing))next.objects=next.objects.filter(o=>o.type!==placing);next.objects.push(values(placing,id));selected=id;commit(next);}
  function select(id){selected=id;const o=draft.objects.find(o=>o.id===id);if(o){for(const key of ['x','y','z','w','h','d'])if(o[key]!=null)$('#three-'+key).value=o[key];if(o.enemy)$('#three-enemy').value=o.enemy;stage.setLayer(o.y);}refresh();}
  for(const [value,label] of Object.entries(OBJECTS_3D)){if(value==='enemy'&&!enemies3D().length)continue;$('#three-tool').add(new Option(label,value));}
  $('#three-tool').value=placing;for(const p of enemies3D())$('#three-enemy').add(new Option(p.name,p.key));
  listen($('#three-tool'),'change',()=>{placing=$('#three-tool').value;selected=null;refresh();});
  listen($('#three-object-list'),'change',()=>select($('#three-object-list').value||null));
  listen($('#three-y'),'input',()=>stage.setLayer(Number($('#three-y').value)||0));
  listen($('[data-place]'),'click',()=>attempt(place));
  listen($('[data-apply]'),'click',()=>attempt(()=>{const next=copy(draft),index=next.objects.findIndex(o=>o.id===selected);if(index>=0){next.objects[index]=values(next.objects[index].type,selected);commit(next);}}));
  listen($('[data-delete]'),'click',()=>attempt(()=>{if(selected)commit({...draft,objects:draft.objects.filter(o=>o.id!==selected)});}));
  listen($('[data-rotate]'),'click',()=>{const w=$('#three-w').value;$('#three-w').value=$('#three-d').value;$('#three-d').value=w;status('Breedte en diepte omgewisseld. Klik Plaats of Pas aan.');});
  listen($('[data-undo]'),'click',()=>attempt(()=>{if(!undo.length)return;const next=undo.pop();redo.push(copy(draft));commit(next,false);}));
  listen($('[data-redo]'),'click',()=>attempt(()=>{if(!redo.length)return;const next=redo.pop();undo.push(copy(draft));commit(next,false);}));
  listen(canvas,'pointerdown',event=>{if(event.button===0)pointerStart={x:event.clientX,y:event.clientY};});
  listen(canvas,'pointerup',event=>{if(!pointerStart)return;const start=pointerStart;pointerStart=null;if(!editing||Math.hypot(start.x-event.clientX,start.y-event.clientY)>5)return;attempt(()=>{if(placing==='select')select(stage.pick(event));else{const p=stage.point(event,Number($('#three-y').value));if(!p)return;$('#three-x').value=p.x;$('#three-z').value=p.z;place();}});});
  function resetInput(){keys.clear();touch.clear();jumpPending=false;}
  function startPlay(){assert3DCharacter(identity);disposeGame3D(game);game=createGame3D(draft,identity);editing=false;paused=false;resetInput();accumulator=0;stage.setLevel(draft,{character:identity.character});stage.follow(game.player,true);$('[data-overlay]').hidden=true;refresh();canvas.focus();status('Haal de vlag aan de overkant.');}
  function returnToEdit(){editing=true;disposeGame3D(game);game=null;paused=false;resetInput();$('[data-overlay]').hidden=true;stage.setLevel(draft,{editing:true});stage.frameLevel(draft);refresh();status('Verder bouwen · wijzigingen zijn bewaard.');}
  function togglePause(){if(editing||game?.state!=='playing')return;paused=!paused;resetInput();$('[data-pause]').textContent=paused?'Verder':'Pauze';refresh();}
  listen($('[data-test]'),'click',()=>attempt(()=>editing?startPlay():returnToEdit()));
  listen($('[data-retry]'),'click',()=>attempt(startPlay));listen($('[data-pause]'),'click',togglePause);
  listen($('[data-overlay-action]'),'click',()=>{if(game?.state==='won'&&mode==='play')dialog.close();else attempt(startPlay);});
  listen($('[data-camera-left]'),'click',()=>stage.orbit(.35));listen($('[data-camera-right]'),'click',()=>stage.orbit(-.35));
  listen(dialog,'keydown',event=>{
    if(event.target.matches('input,select,textarea'))return;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(event.code)){event.preventDefault();keys.add(event.code);if(event.code==='Space'&&!event.repeat)jumpPending=true;}
    if(event.code==='KeyP'&&!event.repeat){event.preventDefault();togglePause();}
  });
  listen(window,'keyup',event=>keys.delete(event.code));
  listen(window,'blur',()=>{resetInput();if(!editing&&game?.state==='playing'&&!paused)togglePause();});
  listen(document,'visibilitychange',()=>{if(document.hidden){resetInput();if(!editing&&game?.state==='playing'&&!paused)togglePause();}});
  for(const button of dialog.querySelectorAll('[data-control]')){
    listen(button,'pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);touch.add(button.dataset.control);if(button.dataset.control==='jump')jumpPending=true;});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(button,type,()=>touch.delete(button.dataset.control));
  }
  listen($('[data-view-models]'),'click',()=>attempt(()=>openModelGallery3D(dialog)));
  function animate(now){
    if(closed)return;
    const dt=Math.min(.05,(now-last)/1000||0);last=now;
    const enabled=!document.hidden&&document.hasFocus()&&document.querySelector('dialog[open]:last-of-type')===dialog;
    const sample=controller.poll(navigator,enabled&&!editing);
    if(sample.pressed.includes('pause'))togglePause();
    if((sample.pressed.includes('fire')||sample.pressed.includes('cancel'))&&!editing){if(mode==='edit')returnToEdit();else dialog.close();}
    if(sample.pressed.includes('jump')&&game&&game.state!=='playing'){if(game.state==='won'&&mode==='play')dialog.close();else attempt(startPlay);}
    if(closed)return;
    if(!editing&&game){
      if(enabled&&!paused&&game.state==='playing'){
        const {x,z}=movement3D(keys,touch,sample);
        if(keys.has('KeyQ'))stage.orbit(dt*1.6);if(keys.has('KeyE'))stage.orbit(-dt*1.6);
        const direction=stage.inputDirection(x,z);accumulator+=dt;
        while(accumulator>=1/60){stepGame3D(game,{...direction,jump:jumpPending||keys.has('Space')||touch.has('jump')||sample.controls.jump},1/60);jumpPending=false;accumulator-=1/60;}
        stage.follow(game.player);
      }else accumulator=0;
      const hud=paused?'Gepauzeerd · P / Start om verder te gaan':`● ${game.coins} / ${draft.objects.filter(o=>o.type==='coin').length} · ${Math.floor(game.time)} s`;if($('[data-hud]').textContent!==hud)$('[data-hud]').textContent=hud;
      if(game.state!=='playing'&&$('[data-overlay]').hidden){
        $('[data-overlay]').hidden=false;$('[data-overlay-title]').textContent=game.state==='won'?'Vlag bereikt!':'Nog een poging?';$('[data-overlay-copy]').textContent=game.message;
        $('[data-overlay-action]').textContent=game.state==='won'&&mode==='play'?'Verder op de wereldkaart':'Probeer opnieuw';if(game.state==='won'&&mode==='play'&&!wonReported){wonReported=true;onComplete();}
      }
    }else {const hud='3D-bouwer · '+draft.objects.length+' onderdelen';if($('[data-hud]').textContent!==hud)$('[data-hud]').textContent=hud;}
    if(!document.hidden)stage.draw(game,paused||game?.state!=='playing'?0:dt);frame=requestAnimationFrame(animate);
  }
  stage.setLevel(draft,{editing:true});stage.frameLevel(draft);refresh();
  if(mode==='play')attempt(startPlay);else status('Bouw op de gekozen hoogte. Begin met een grasblok.');
  frame=requestAnimationFrame(animate);
  return {close};
}

export async function openModelGallery3D(parent=null) {
  const dialog=document.createElement('dialog');dialog.className='three-gallery';
  dialog.innerHTML='<div class="dialog-heading"><h2>Personages en vijanden in 3D</h2><button class="button" data-close>Sluiten</button></div><label>Model <select data-model></select></label><label>Aanzicht <select data-view><option value="perspective">Perspectief</option><option value="front">Voorkant</option><option value="back">Achterkant</option><option value="left">Linkerkant</option><option value="right">Rechterkant</option></select></label><canvas aria-label="Draaibaar 3D-model"></canvas><button class="button" data-export-view>Download dit aanzicht</button><p data-status role="status">Model laden…</p><p>Sleep met de rechtermuisknop om rond te kijken. Scroll om te zoomen.</p>';
  document.body.append(dialog);dialog.showModal();const $=s=>dialog.querySelector(s),profiles=[...characters3D(),...enemies3D()];
  profiles.forEach((p,i)=>$('[data-model]').add(new Option(p.name,String(i))));
  let stage,frame=0,closed=false,request=0;
  function close(){if(closed)return;closed=true;request++;cancelAnimationFrame(frame);stage?.dispose();dialog.remove();}
  dialog.addEventListener('close',close);$('[data-close]').onclick=()=>dialog.close();
  try{stage=createStage3D($('canvas'));}catch(error){$('[data-status]').textContent=error.message;return;}
  async function show(){const token=++request,profile=profiles[Number($('[data-model]').value)];if(!profile){$('[data-status]').textContent='Er zijn nog geen 3D-modellen.';return;}try{await stage.load(profile);if(closed||token!==request)return;stage.preview(profile,$('[data-view]').value);$('[data-status]').textContent=profile.name+' · '+profile.model3d.file;}catch(error){if(!closed)$('[data-status]').textContent=error.message;}}
  $('[data-export-view]').onclick=()=>{const profile=profiles[Number($('[data-model]').value)];if(!profile)return;const a=document.createElement('a');a.href=stage.capture();a.download=profile.id+'-'+$('[data-view]').value+'.png';a.click();};
  $('[data-model]').onchange=show;$('[data-view]').onchange=show;
  await show();function draw(){if(closed)return;stage.draw();frame=requestAnimationFrame(draw);}draw();
}
