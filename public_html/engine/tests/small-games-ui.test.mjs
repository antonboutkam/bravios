import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as games from '../small-games.mjs';
import { loadGamePack, SMALL_GAME_TYPES } from '../games/catalog.mjs';
import { GameSessionHost } from '../runtime/game-session.mjs';
import { participantRoster } from '../characters/roster.mjs';
import { characters3D } from '../games/platformer3d/access.mjs';
const settle=()=>new Promise(resolve=>setImmediate(resolve));

// Minimal DOM adapter: exercise the actual UI handlers and game state without a browser.
function setup({ fullscreen=false, denied=false, prepareCake=async()=>{} }={}) {
  let active, state, pendingFrame, resize, exits=0, requests=0, disposedViews=0;
  class Element {
    constructor(tag='div',attrs={}) {this.tag=tag;this.attrs=attrs;this.children=[];this.listeners={};this.style={};this.dataset={};this.hidden=false;for(const [key,value] of Object.entries(attrs))if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;}
    append(el){this.children.push(el);el.parent=this;}
    replaceChildren(...els){this.children=[];els.forEach(el=>this.append(el));}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
    setAttribute(key,value){this.attrs[key]=value;}
    setPointerCapture(){}
    closest(selector){return this.matches(selector)?this:null;}
    insertBefore(el){this.append(el);}
    set innerHTML(html){this.html=html;this.children=[];for(const match of html.matchAll(/<(div|button|span|strong|small)\b([^>]*)>([^<]*)/g)){const attrs=Object.fromEntries([...match[2].matchAll(/(data-[\w-]+)(?:="([^"]*)")?/g)].map(m=>[m[1],m[2]??'']));const el=new Element(match[1],attrs);el.textContent=match[3];this.append(el);}}
    cloneNode(){const el=new Element(this.tag,{...this.attrs});el.innerHTML=this.html;return el;}
    matches(selector){if(selector==='[data-small-kind]')return !!this.dataset.smallKind;if(selector.startsWith('.'))return this.attrs.class===selector.slice(1);const m=selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return m?m[1] in this.attrs&&(m[2]===undefined||this.attrs[m[1]]===m[2]):this.tag===selector;}
    querySelectorAll(selector){return this.children.flatMap(c=>[...(c.matches(selector)?[c]:[]),...c.querySelectorAll(selector)]);}
    querySelector(selector){return this.querySelectorAll(selector)[0];}
    addEventListener(name,fn){(this.listeners[name]||=[]).push(fn);}
    dispatch(name,event={}){for(const fn of this.listeners[name]||[])fn(event);}
    focus(){active=this;this.dispatch('focus');}
    click(){this.onclick?.();this.dispatch('click',{detail:0});}
    showModal(){this.open=true;}
    close(){this.open=false;this.dispatch('close');}
    getContext(){return {};}
  }
  const dialog=new Element('dialog');
  const add=(tag,attrs={})=>{const el=new Element(tag,attrs);dialog.append(el);return el;};
  add('h2');const menu=add('div',{'data-small-menu':''});const play=add('div',{'data-small-play':''});
  const stage=add('div',{class:'small-stage'});stage.clientWidth=1600;stage.clientHeight=600;
  const canvas=add('canvas');
  for(const attr of ['status','hint','result','fullscreen','back','retry'])add(attr==='fullscreen'||attr==='back'||attr==='retry'?'button':'p',{['data-small-'+attr]:''});
  const document=new Element();document.querySelector=()=>dialog;document.createElement=tag=>new Element(tag);document.documentElement={requestFullscreen:async()=>{requests++;if(denied)throw Error('denied');document.fullscreenElement=document.documentElement;}};
  document.fullscreenElement=fullscreen?document.documentElement:null;
  document.exitFullscreen=async()=>{exits++;document.fullscreenElement=null;document.dispatch('fullscreenchange');};
  const window=new Element();window.devicePixelRatio=2;
  const source=readFileSync(new URL('../games/shell.mjs',import.meta.url),'utf8').split('export function setupSmallGames')[1];
  const loadTestPack=async id=>{const pack=await loadGamePack(id);return {createSession(context){const session=pack.createSession({...context,services:{...context.services,createCakeStage:()=>({prepare:prepareCake,draw(){},dispose(){disposedViews++;}})}});state=session.state;session.render=()=>{};return session;}};};
  const ui=runInNewContext('function setupSmallGames'+source+'\nsetupSmallGames({load:loadTestPack});',{
    document,window,ResizeObserver:class{constructor(fn){resize=fn;}observe(){}},
    requestAnimationFrame:fn=>{pendingFrame=fn;return 1;},cancelAnimationFrame:()=>{pendingFrame=null;},
    SMALL_GAME_TYPES,GameSessionHost,participantRoster,characters3D,loadGamePack,loadTestPack,
  });
  return {ui,dialog,menu,play,canvas,stage,resize,document,window,
    get state(){return state;},get disposedViews(){return disposedViews;},get active(){return active;},get exits(){return exits;},get requests(){return requests;},
    frame(t){pendingFrame?.(t);},send(pressed=[],navigation={},second=[]){ui.handleController({pressed,navigation,controls:{}},{pressed:second});},
    async choose(kind){await menu.children.find(b=>b.dataset.smallKind===kind).onclick();await settle();},
  };
}

test('controller kiest, speelt, herstart en gaat terug zonder dubbele schermactie',async()=>{
  const h=setup();h.ui.open();await new Promise(resolve=>setImmediate(resolve));
  h.send(['right']);h.send(['right']);h.send(['jump']);await settle();assert.equal(h.state.kind,'aim');assert.equal(h.state.shots,0);
  h.send(['jump']);assert.equal(h.state.shots,1);
  h.send([], {up:true,right:true});h.state.ball=null;h.frame(100);h.frame(150);assert.ok(h.state.angle>55);assert.ok(h.state.power>560);
  h.state.state='won';h.send(['jump']);await settle();assert.equal(h.state.shots,0);
  h.send(['jump','fire']);assert.equal(h.menu.hidden,false);assert.equal(h.play.hidden,true);
  h.send(['fire']);assert.equal(h.ui.isOpen(),false);assert.equal(h.exits,1);
});

test('samen springen en Start-pauze werken voor beide controllers en gedeelde Y',async()=>{
  const h=setup();h.ui.open();await h.choose('rhythm-two');
  h.send(['mount']);assert.ok(h.state.players[1].vy>0);assert.equal(h.state.players[0].vy,0);
  await h.choose('rhythm-two');h.send(['jump'],{},['jump']);assert.ok(h.state.players.every(p=>p.vy>0));
  h.send(['pause']);assert.equal(h.state.paused,true);const before=h.state.time;h.frame(100);h.frame(150);assert.equal(h.state.time,before);
  h.send([],{},['pause']);assert.equal(h.state.paused,false);
  h.window.dispatch('blur');assert.equal(h.state.paused,true);h.send(['pause']);assert.equal(h.state.paused,false);
});

test('ballonnen kiezen en prikken, fruit bewegen en invoer loslaten',async()=>{
  const h=setup();h.ui.open();await h.choose('balloons');h.send(['right']);assert.equal(h.state.selected,1);h.send(['jump']);assert.equal(h.state.balloons[1].alive,false);
  await h.choose('catch');h.send([],{right:true});h.frame(100);h.frame(150);assert.ok(h.state.basket>400);
  h.send();const x=h.state.basket;h.frame(200);assert.equal(h.state.basket,x);
  h.ui.handleController({controls:{left:false,right:false,pipe:false},pressed:[],status:'waiting'});h.frame(250);assert.equal(h.state.basket,x);
});

test('fullscreenweigering blijft speelbaar en bestaand fullscreen blijft bij sluiten behouden',async()=>{
  for(const config of [{denied:true},{fullscreen:true}]){
    const h=setup(config);h.ui.open();await new Promise(resolve=>setImmediate(resolve));await h.choose('aim');h.send(['jump']);assert.equal(h.state.shots,1);
    h.dialog.close();assert.equal(h.exits,0);assert.equal(h.requests,config.fullscreen?0:1);
  }
  const h=setup();h.ui.open();h.dialog.close();await new Promise(resolve=>setImmediate(resolve));assert.equal(h.exits,1,'sluiten tijdens de fullscreenaanvraag ruimt fullscreen op');
});

test('canvas past in breed en smal venster, met dezelfde verhouding en scherpe bitmap',async()=>{
  const h=setup();h.ui.open();await h.choose('catch');
  for(const [width,height] of [[1600,600],[360,480],[800,180]]){
    h.stage.clientWidth=width;h.stage.clientHeight=height;h.resize();
    const w=parseFloat(h.canvas.style.width),v=parseFloat(h.canvas.style.height);
    assert.ok(w<=width+.001&&v<=height+.001);assert.ok(Math.abs(w/v-800/440)<.0001);
    assert.equal(h.canvas.width,Math.round(w*2));assert.equal(h.canvas.height,Math.round(v*2));
  }
});

test('tussenspel retourneert winst of annulering en stopt de canvas bij terugkeer',async()=>{
  const h=setup();const result=h.ui.play({game:'balloons',participants:participantRoster()});await settle();
  for(let i=0;i<10;i++)h.send(['jump']);assert.equal(h.state.state,'won');h.send(['jump']);
  assert.equal((await result).outcome,'won');assert.equal(h.ui.isOpen(),false);assert.equal(h.canvas.width,1);
  const cancelled=h.ui.play({game:'aim'});await settle();h.send(['fire']);assert.equal((await cancelled).outcome,'cancelled');
  await assert.rejects(h.ui.play({game:'missing'}),/Onbekend/);assert.equal(h.ui.isOpen(),false);
  const closed=h.ui.play({game:'rhythm'});h.dialog.close();assert.equal((await closed).outcome,'cancelled');await settle();assert.equal(h.canvas.width,1);
});

test('taartgooien kiest geschikte 3D-modellen en gebruikt een apart canvas; terugkeren herstelt de 2D-games',async()=>{
 const h=setup();h.ui.open();await h.choose('cake-throw-two');
 assert.match(h.dialog.querySelector('h2').textContent,/3D-personage/);
 assert.equal(h.state,undefined);assert.equal(h.menu.children.length,4);
 h.menu.children[0].click(); // Explicitly choose the other registered model.
 await h.menu.children[2].onclick();
 assert.equal(h.state.kind,'cake-throw');assert.equal(h.state.playerCount,2);assert.equal(h.state.players[0].character,characters3D()[1].id);
 assert.equal(h.canvas.hidden,true);assert.equal(h.stage.children.filter(child=>child.tag==='canvas').length,1);
 const old=h.state;old.players[0].cakes=1;h.send(['jump']);assert.equal(old.players[0].cakes,0);
 old.state='won';old.winner=0;h.send(['jump']);await settle();
 assert.equal(h.state.players[0].character,characters3D()[1].id,'opnieuw starten houdt de gekozen 3D-identiteit');assert.notEqual(h.state,old);
 h.send(['fire']);assert.equal(h.menu.hidden,false);assert.equal(h.canvas.hidden,false);assert.equal(h.stage.children.filter(child=>child.tag==='canvas').length,0);assert.ok(h.disposedViews>0);
 await h.choose('aim');h.send(['jump']);assert.equal(h.state.shots,1);
});
test('beide controllers en aanraakknoppen sturen de eigen taartgooier en pauze stopt de ronde',async()=>{
 const h=setup();h.ui.open();await h.choose('cake-throw-two');await h.menu.children[2].onclick();
 h.ui.handleController({pressed:[],navigation:{up:true},controls:{}},{pressed:[],navigation:{down:true}});h.frame(100);h.frame(200);
 assert.ok(h.state.players[0].z<0);assert.ok(h.state.players[1].z>0);
 h.state.players.forEach(p=>p.cakes=1);h.send(['jump'],{},['jump']);assert.deepEqual(h.state.cakes.map(c=>c.owner),[0,1]);
 h.send(['pause']);const time=h.state.time;h.frame(300);assert.equal(h.state.time,time);h.send(['pause']);
 const button=h.dialog.querySelectorAll('[data-mini-direction]').find(b=>b.dataset.miniPlayerIndex==='1'&&b.dataset.miniDirection==='right');
 button.dispatch('pointerdown',{preventDefault(){},pointerId:1});const x=h.state.players[1].x;h.frame(400);h.frame(500);assert.ok(h.state.players[1].x>x);button.dispatch('pointercancel');
 h.frame(600);const stopped=h.state.players[1].x;h.frame(700);assert.equal(h.state.players[1].x,stopped);
});
test('annuleren tijdens 3D-modellen laden kan een afgesloten taartspel niet alsnog openen',async()=>{
 let ready;const h=setup({prepareCake:()=>new Promise(resolve=>{ready=resolve;})});h.ui.open();await h.choose('cake-throw');
 const pending=h.menu.children[1].onclick();while(!ready)await settle();
 h.send(['fire']);assert.equal(h.menu.hidden,false);assert.equal(h.canvas.hidden,false);assert.ok(h.disposedViews>0);
 ready();await pending;assert.equal(h.play.hidden,true);assert.equal(h.stage.children.filter(child=>child.tag==='canvas').length,0);
});
