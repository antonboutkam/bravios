import { THEMES } from './engine.mjs?v=40';
import { WORLD_MAP, worldId, createWorld, validateWorld, addWorldNode, toggleWorldLink, removeWorldNode, configureWorldNode } from './worlds.mjs?v=1';

export function setupWorldEditor({ worlds, selectedWorld, selectWorld, save, editField, playField, warn, confirm }) {
  const dialog = document.querySelector('#world-editor-dialog');
  const $ = selector => dialog.querySelector(selector);
  const svg = $('[data-world-map]'), form = $('#world-field-form');
  const menuSelect = document.querySelector('#world-menu-select');
  const menuEdit = document.querySelector('#world-menu-edit'), menuPlay = document.querySelector('#world-menu-play');
  let mode = 'edit', tool = 'field', selectedNode = null, linkStart = null, gesture = null;
  const current = () => worlds().find(w => w.id === selectedWorld());
  const node = () => current()?.nodes.find(n => n.id === selectedNode);
  const message = text => { $('[data-world-status]').textContent = text; };
  function attempt(action) { try { action(); } catch (error) { message(error.message); warn(error.message); } }
  function refreshMenu() {
    for (const select of [menuSelect,$('#world-select')]) {
      select.replaceChildren();
      if (!worlds().length) select.add(new Option('Nog geen eigen werelden', ''));
      for (const world of worlds()) select.add(new Option(world.name,world.id));
      select.value = current()?.id || ''; select.disabled = !worlds().length;
    }
    menuEdit.textContent = worlds().length ? '✎ Wereld bewerken' : '＋ Maak een wereld';
    menuPlay.disabled = !current()?.nodes.some(n => n.level);
  }
  const ns = 'http://www.w3.org/2000/svg';
  function element(tag, attributes, text) {
    const el = document.createElementNS(ns,tag);
    for (const [name,value] of Object.entries(attributes)) el.setAttribute(name,value);
    if (text !== undefined) el.textContent = text;
    return el;
  }
  const themeColors = { grass:'#7ca56c', sunset:'#d99b67', night:'#6b648d', castle:'#625e72', winter:'#a7ccd7', underwater:'#4e9cba', 'underwater-night':'#385b86', moon:'#979cad' };
  function paintMap() {
    const focused = document.activeElement?.getAttribute('data-world-node');
    svg.replaceChildren();
    const world = current(); if (!world) return;
    for (const [a,b] of world.links) {
      const from = world.nodes.find(n => n.id === a), to = world.nodes.find(n => n.id === b);
      svg.append(element('line',{x1:from.x,y1:from.y,x2:to.x,y2:to.y,'class':'world-link'}));
    }
    if (linkStart && gesture?.point) {
      const from = world.nodes.find(n => n.id === linkStart);
      if (from) svg.append(element('line',{x1:from.x,y1:from.y,x2:gesture.point.x,y2:gesture.point.y,'class':'world-link world-link-preview'}));
    }
    for (const [index,field] of world.nodes.entries()) {
      const complete = world.completed.includes(field.id);
      const label = field.level?.name || `Veld ${index+1} · nog instellen`;
      const group = element('g',{'data-world-node':field.id,transform:`translate(${field.x} ${field.y})`,tabindex:0,role:'button','aria-label':`${label}${complete ? ' · gehaald' : ''}`,'aria-pressed':field.id===selectedNode,'class':`world-node${field.id===selectedNode ? ' selected' : ''}${field.id===linkStart ? ' linking' : ''}`});
      group.append(element('circle',{r:25,fill:themeColors[field.level?.theme] || '#ede5d6'}));
      group.append(element('text',{y:6,'text-anchor':'middle','class':'world-node-number'},complete ? '✓' : index+1));
      group.append(element('text',{y:46,'text-anchor':'middle','class':'world-node-label'},label.length > 25 ? label.slice(0,23)+'…' : label));
      svg.append(group);
    }
    if (focused) [...svg.querySelectorAll('[data-world-node]')].find(el => el.dataset.worldNode === focused)?.focus({preventScroll:true});
  }
  function details() {
    const field = node();
    $('#world-node-select').value = selectedNode || '';
    form.hidden = mode !== 'edit' || !field;
    $('[data-world-empty-selection]').hidden = !!field || mode !== 'edit';
    $('[data-world-play-details]').hidden = mode !== 'play';
    if (mode === 'play') {
      $('[data-world-play-name]').textContent = field?.level?.name || 'Kies een veld op de kaart';
      $('[data-world-play-info]').textContent = field?.level ? `${THEMES[field.level.theme]} · ${field.level.width} × ${field.level.tiles.length} blokjes` : field ? 'Dit veld is nog niet ingericht. Kies Bewerken om het klaar te maken.' : 'Klik op een ingericht veld. De lijntjes wijzen de routes tussen je velden aan.';
      $('[data-world-play-field]').disabled = !field?.level;
    }
    if (mode === 'edit' && field) {
      $('#world-field-name').value = field.level?.name || `Veld ${current().nodes.indexOf(field)+1}`;
      $('#world-field-theme').value = field.level?.theme || 'grass';
      $('#world-field-width').value = field.level?.width || 72;
      $('#world-field-height').value = field.level?.tiles.length || 16;
      $('[data-world-build-field]').disabled = !field.level;
      $('[data-world-field-note]').textContent = field.level ? 'Instellingen bewaren houdt je bouwwerk vast. Bij verkleinen verdwijnen blokjes buiten de nieuwe grootte.' : 'Kies eerst de omgeving en grootte en klik op Instellingen bewaren. Daarna kun je het veld inrichten.';
    }
  }
  function render() {
    refreshMenu();
    const world = current();
    const fieldSelect = $('#world-node-select');
    fieldSelect.replaceChildren(new Option('Kies een veld…',''));
    for (const [index,field] of (world?.nodes || []).entries()) fieldSelect.add(new Option(`${index+1}. ${field.level?.name || 'Nog instellen'}`,field.id));
    fieldSelect.value = selectedNode || '';
    $('[data-world-content]').hidden = !world;
    $('[data-world-no-worlds]').hidden = !!world;
    $('[data-world-edit-controls]').hidden = mode !== 'edit';
    $('[data-world-create]').hidden = mode !== 'edit';
    $('[data-world-name-row]').hidden = mode !== 'edit' || !world;
    if (world) $('#world-name').value = world.name;
    for (const button of dialog.querySelectorAll('[data-world-mode]')) button.setAttribute('aria-pressed',button.dataset.worldMode===mode);
    for (const button of dialog.querySelectorAll('[data-world-tool]')) button.setAttribute('aria-pressed',button.dataset.worldTool===tool);
    $('[data-world-instructions]').textContent = mode === 'play' ? 'Kies een veld en druk op Speel dit veld. Na de finish keer je terug naar deze kaart.' : tool === 'link' ? 'Klik op twee rondjes of trek een lijn van het ene rondje naar het andere. Herhaal dezelfde verbinding om haar weg te halen.' : tool === 'move' ? 'Sleep een rondje naar een andere plek. Klik op een rondje om het veld in te stellen.' : 'Klik op een lege plek voor een nieuw rondje. Klik op een rondje om de omgeving en grootte te kiezen.';
    paintMap(); details();
  }
  function changed(text) { const saved=save(); render(); if(saved===false)message('Bewaren lukt niet. Download je wereld om een kopie te bewaren.');else if(text)message(text); }
  function choose(id) {
    selectedNode = id;
    if (mode === 'edit' && tool === 'link') {
      if (linkStart && linkStart !== id) { toggleWorldLink(current(),linkStart,id); linkStart = null; changed('Verbinding bijgewerkt.'); return; }
      linkStart = linkStart === id ? null : id;
      message(linkStart ? 'Kies nu het andere rondje.' : 'Verbinding geannuleerd.');
    }
    paintMap(); details();
  }
  function open(nextMode = 'edit', id = selectedWorld()) {
    selectWorld(worlds().some(w => w.id === id) ? id : worlds()[0]?.id || null);
    mode = nextMode; selectedNode = null; linkStart = null; gesture = null;
    render(); message(''); if (!dialog.open) dialog.showModal();
  }
  for (const select of [menuSelect,$('#world-select')]) select.addEventListener('change',() => { selectWorld(select.value); selectedNode=null;linkStart=null;save();render();message(''); });
  $('#world-node-select').addEventListener('change',event => { if(event.target.value)choose(event.target.value); });
  for (const button of dialog.querySelectorAll('[data-world-mode]')) button.addEventListener('click',() => { mode=button.dataset.worldMode;linkStart=null;render();message(''); });
  for (const button of dialog.querySelectorAll('[data-world-tool]')) button.addEventListener('click',() => { tool=button.dataset.worldTool;linkStart=null;render();message(''); });
  $('[data-world-create]').addEventListener('submit',event => {
    event.preventDefault();
    attempt(() => {
      if (worlds().length >= WORLD_MAP.maxWorlds) throw new Error('Je kunt maximaal 20 werelden bewaren.');
      const world=createWorld($('#world-create-name').value);worlds().push(world);selectWorld(world.id);selectedNode=null;linkStart=null;
      $('#world-create-name').value='';changed('Wereld gemaakt. Klik op de kaart om je eerste veld te plaatsen.');
    });
  });
  $('#world-name').addEventListener('change',() => { if(current()) { current().name=$('#world-name').value.trim().slice(0,48)||'Mijn wereld';changed(); } });
  form.addEventListener('submit',event => {
    event.preventDefault();
    attempt(() => {
      configureWorldNode(current(),selectedNode,{name:$('#world-field-name').value,theme:$('#world-field-theme').value,width:Number($('#world-field-width').value),height:Number($('#world-field-height').value)});
      changed('Instellingen bewaard. Je kunt nu het veld inrichten.');
    });
  });
  function build() {
    if(!node()?.level)return;
    // Apply the visible settings before leaving for the builder.
    if(!form.reportValidity())return;
    attempt(() => {
      configureWorldNode(current(),selectedNode,{name:$('#world-field-name').value,theme:$('#world-field-theme').value,width:Number($('#world-field-width').value),height:Number($('#world-field-height').value)});
      save();const world=current(),field=node();dialog.close();editField(world,field);
    });
  }
  $('[data-world-build-field]').addEventListener('click',build);
  $('[data-world-play-field]').addEventListener('click',() => { if(node()?.level) { const world=current(),field=node();dialog.close();playField(world,field); } });
  $('[data-world-remove-field]').addEventListener('click',() => {
    const world=current(),field=node();if(!field)return;
    confirm('Veld verwijderen?',`Het rondje, de verbindingen en het bouwwerk van ‘${field.level?.name || 'dit veld'}’ verdwijnen.`,() => { removeWorldNode(world,field.id);selectedNode=null;linkStart=null;changed('Veld verwijderd.'); },'Verwijder veld');
  });
  $('[data-world-delete]').addEventListener('click',() => {
    const world=current();if(!world)return;
    confirm('Wereld verwijderen?',`‘${world.name}’ en alle velden in deze wereld verdwijnen uit deze browser.`,() => { const index=worlds().indexOf(world);if(index>=0)worlds().splice(index,1);selectWorld(worlds()[0]?.id||null);selectedNode=null;linkStart=null;changed('Wereld verwijderd.'); },'Verwijder wereld');
  });
  const point = event => { const rect=svg.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width*1000,y:(event.clientY-rect.top)/rect.height*600}; };
  const hit = p => current()?.nodes.find(n => Math.hypot(n.x-p.x,n.y-p.y)<=30);
  svg.addEventListener('pointerdown',event => {
    if(event.button!==0 || !current())return;
    const p=point(event),field=hit(p);
    gesture={id:field?.id,point:p,start:p,original:field?{x:field.x,y:field.y}:null,moved:false};
    if(mode==='edit' && tool==='link' && field && !linkStart)linkStart=field.id;
    svg.setPointerCapture(event.pointerId);event.preventDefault();
  });
  svg.addEventListener('pointermove',event => {
    if(!gesture)return;
    const p=point(event);gesture.point=p;
    gesture.moved ||= Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>5;
    if(mode==='edit' && tool==='move' && gesture.id && gesture.moved) {
      const field=current().nodes.find(n=>n.id===gesture.id);field.x=Math.max(32,Math.min(968,p.x));field.y=Math.max(32,Math.min(540,p.y));
    }
    paintMap();
  });
  svg.addEventListener('pointerup',event => {
    if(!gesture)return;
    const g=gesture,p=point(event),field=hit(p);gesture=null;
    if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);
    attempt(() => {
      if(mode==='edit' && tool==='move' && g.id && g.moved) {
        const moved=current().nodes.find(n=>n.id===g.id);
        if(current().nodes.some(n=>n.id!==moved.id && Math.hypot(n.x-moved.x,n.y-moved.y)<65)) {Object.assign(moved,g.original);message('Zet de rondjes iets verder uit elkaar.');paintMap();return;}
        selectedNode=g.id;changed('Veld verplaatst.');
      } else if(mode==='edit' && tool==='link') {
        // The first tap starts a connection; a drag or second tap completes it.
        if(field && field.id!==linkStart)choose(field.id);
        else if(field) {selectedNode=field.id;paintMap();details();message('Kies nu het andere rondje.');}
      } else if(field)choose(field.id);
      else if(mode==='edit' && tool==='field' && !g.moved) {selectedNode=addWorldNode(current(),p.x,p.y).id;changed('Nieuw veld. Kies rechts de omgeving en grootte.');$('#world-field-name').focus();}
    });
  });
  svg.addEventListener('pointercancel',() => {if(gesture?.id && tool==='move')Object.assign(current().nodes.find(n=>n.id===gesture.id),gesture.original);gesture=null;linkStart=null;paintMap();});
  svg.addEventListener('keydown',event => {
    if(event.key==='Escape' && linkStart){event.preventDefault();event.stopPropagation();linkStart=null;paintMap();message('Verbinding geannuleerd.');return;}
    const id=event.target.closest('[data-world-node]')?.dataset.worldNode;
    if(id && ['Enter',' '].includes(event.key)){event.preventDefault();choose(id);}
  });
  $('[data-world-add-field]').addEventListener('click',() => attempt(() => {
    const world=current();
    // A keyboard alternative to placing circles with a pointer.
    for(let y=100;y<=500;y+=100)for(let x=100;x<=900;x+=100)if(!world.nodes.some(n=>Math.hypot(n.x-x,n.y-y)<65)) {selectedNode=addWorldNode(world,x,y).id;changed('Nieuw veld geplaatst.');$('#world-field-name').focus();return;}
  }));
  $('[data-world-download]').addEventListener('click',() => {
    if(!current())return;
    const world=current(),url=URL.createObjectURL(new Blob([JSON.stringify(world,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=`${world.name.replace(/[^a-zA-Z0-9à-ÿ -]/g,'').trim()||'mijn-wereld'}.bravios-world.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  $('[data-world-import]').addEventListener('click',() => $('#world-import-file').click());
  $('#world-import-file').addEventListener('change',async event => {
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try {
      if(worlds().length>=WORLD_MAP.maxWorlds)throw new Error('Je kunt maximaal 20 werelden bewaren.');
      if(file.size>16000000)throw new Error('Dit wereldbestand is te groot.');
      const world=validateWorld(JSON.parse(await file.text()));world.id=worldId();worlds().push(world);selectWorld(world.id);selectedNode=null;linkStart=null;changed('Wereld geopend als een nieuwe kopie.');
    } catch(error){message(error.message);warn(error.message);}
  });
  for(const [theme,label] of Object.entries(THEMES))$('#world-field-theme').add(new Option(label,theme));
  refreshMenu();
  return { open, refreshMenu };
}
