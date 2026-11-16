import test from 'node:test';
import assert from 'node:assert/strict';
import { updateVitalsHUD, updateHUDCounters } from '../vitals-hud.mjs';

// Minimal DOM with a write ledger. Real browser MutationObserver checks also
// cover layout and paint boundaries; this guards the no-write update contract.
function documentFixture() {
  const writes = [];
  function element(tag = 'div') {
    const attrs = new Map(); let text = '';
    const node = { tag, children: [], className: '', hidden: false,
      append(...children) { this.children.push(...children); writes.push([this,'children']); },
      replaceChildren(...children) { this.children = children; writes.push([this,'children']); },
      get textContent() { return text; },
      set textContent(value) { text = value; writes.push([this,'text']); },
      setAttribute(key,value) { attrs.set(key,value); writes.push([this,key]); },
      getAttribute(key) { return attrs.get(key) ?? null; }
    };
    node.style = new Proxy({}, {set(target,key,value) { target[key] = value; writes.push([node,key]); return true; }});
    node.classList = {
      contains(name) { return node.className.split(' ').includes(name); },
      toggle(name,on) { node.className = node.className.split(' ').filter(x=>x!==name).concat(on?[name]:[]).join(' '); writes.push([node,'class']); }
    };
    return node;
  }
  return {writes,element,document:{createElement:element}};
}
const player = () => ({character:'anton',health:5,maxHealth:5,power:2.25,maxPower:5,fire:true});

test('stable vitals perform no DOM writes; recharge changes only its affected segment',()=>{
  const dom=documentFixture(), previous=globalThis.document;globalThis.document=dom.document;
  try {
    const container=dom.element(),p=player();updateVitalsHUD(container,[p],p);
    dom.writes.length=0;
    for(let i=0;i<100;i++)updateVitalsHUD(container,[p],p);
    assert.deepEqual(dom.writes,[]);
    const health=container.children[0].children[1],power=container.children[0].children[2];
    p.power=2.5;updateVitalsHUD(container,[p],p);
    assert.deepEqual(dom.writes.filter(([,key])=>key==='transform'),[[power.children[1].children[2].children[0],'transform']]);
    assert.ok(dom.writes.every(([node])=>node===power.children[1] || node===power.children[1].children[2].children[0]));
    assert.equal(health.children[2].textContent,'5/5');
    dom.writes.length=0;p.power=2.50001;updateVitalsHUD(container,[p],p);assert.deepEqual(dom.writes,[]);
    p.health=0;p.respawn=1;updateVitalsHUD(container,[p],p);
    assert.equal(health.children[2].textContent,'0/5');assert.equal(container.children[0].children[3].textContent,'Even wachten… je komt terug');
  } finally {globalThis.document=previous;}
});

test('co-op retains both meters when the local player switches and rebuilds renamed rows',()=>{
  const dom=documentFixture(),previous=globalThis.document;globalThis.document=dom.document;
  try {
    const container=dom.element(),a=player(),b={...player(),character:'boaz',health:6,maxHealth:6,maxPower:4,power:4};
    updateVitalsHUD(container,[a,b],a);const rows=[...container.children];
    updateVitalsHUD(container,[a,b],b);assert.deepEqual(container.children,rows);
    assert.ok(rows[1].classList.contains('vitals-local'));assert.ok(!rows[0].classList.contains('vitals-local'));
    assert.equal(rows[1].children[1].children[2].textContent,'6/6');
    b.appearance={name:'Speler twee'};updateVitalsHUD(container,[a,b],b);
    assert.equal(container.children[1].children[0].textContent,'Speler twee');
  } finally {globalThis.document=previous;}
});

test('counters preserve race/team rules, reserve lives, wallet, boss and countdown; stable values do not write',()=>{
  const dom=documentFixture(),nodes=new Map();
  const container={querySelector(id){if(!nodes.has(id))nodes.set(id,dom.element());return nodes.get(id);}};
  const value=id=>container.querySelector('#'+id).textContent;
  const game={coins:7,time:12.1,enemies:[]};updateHUDCounters(container,game);dom.writes.length=0;
  updateHUDCounters(container,{...game,time:12.9});assert.deepEqual(dom.writes,[]);
  assert.equal(value('lives-count'),'∞');assert.equal(value('game-time'),'0:12');
  updateHUDCounters(container,{...game,coins:8});assert.deepEqual(dom.writes,[[nodes.get('#coin-count'),'text']]);
  updateHUDCounters(container,{...game,enemies:[{boss:true,alive:true,hp:3}]},{lives:0,coins:50});
  assert.equal(value('lives-count'),'0');assert.equal(value('wallet-count'),'Tas ● 50');assert.equal(value('boss-count'),'Eindbaas ♥ 3');
  updateHUDCounters(container,{...game,challenge:{kind:'coin-team',target:20,seconds:60},pSwitch:{remaining:2.4}});
  assert.equal(value('coin-count'),'7 / 20');assert.equal(value('game-time'),'0:48 · P 3s');assert.equal(value('boss-count'),'');
  updateHUDCounters(container,{...game,challenge:{kind:'coin-race',seconds:60},players:[{character:'anton',coins:2},{character:'boaz',coins:5}]});
  assert.match(value('coin-count'),/anton 2 · Boaz 5/i);
});
