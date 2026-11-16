import { CHARACTER_PROFILES } from './characters/roster.mjs';
import { vitalLimits } from './player-vitals.mjs';

const views = new WeakMap();
// Leave unchanged DOM alone: textContent and even identical attributes can
// otherwise invalidate the HUD on every status update.
export function setHUDText(node, value) {
  const text = String(value);
  if (node.textContent !== text) node.textContent = text;
}
export function setHUDHidden(node, hidden) {
  if (node.hidden !== !!hidden) node.hidden = !!hidden;
}
export function setHUDAttribute(node, name, value) {
  const text = String(value);
  if (node.getAttribute(name) !== text) node.setAttribute(name, text);
}
export function updateHUDCounters(container, game, adventure = null) {
  const set = (id, text) => setHUDText(container.querySelector(`#${id}`), text);
  set('coin-count', game.challenge?.kind === 'coin-race' && game.players
    ? game.players.map(p => `${p.appearance?.name || CHARACTER_PROFILES[p.character]?.name || 'Speler'} ${p.coins || 0}`).join(' · ')
    : `${game.coins}${game.challenge?.kind === 'coin-team' ? ` / ${game.challenge.target}` : ''}`);
  const remaining = game.challenge ? game.challenge.seconds - game.time : 0;
  const seconds = game.challenge ? remaining > 1e-8 ? Math.ceil(remaining) : 0 : Math.floor(game.time);
  set('game-time', `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}${game.pSwitch ? ` · P ${Math.ceil(game.pSwitch.remaining)}s` : ''}`);
  set('lives-label', adventure ? 'Extra levens' : 'Levens');
  set('lives-count', adventure ? adventure.lives : '∞');
  setHUDAttribute(container.querySelector('#lives-count'), 'title', adventure ? 'Extra pogingen na dit leven' : 'Je kunt dit veld onbeperkt opnieuw proberen');
  const boss = adventure && game.enemies.find(e => e.boss && e.alive);
  set('wallet-count', adventure ? `Tas ● ${adventure.coins}` : '');
  set('boss-count', boss ? `Eindbaas ♥ ${boss.hp}` : '');
  setHUDHidden(container.querySelector('#wallet-count'), !adventure);
  setHUDHidden(container.querySelector('#boss-count'), !boss);
}
export function updateVitalsHUD(container, players, localPlayer) {
  const identities = players.map(p => p.appearance?.name || CHARACTER_PROFILES[p.character]?.name || 'Speler');
  const key = JSON.stringify(identities);
  let view = views.get(container);
  if (!view || view.key !== key) {
    container.replaceChildren();
    const rows = players.map((p,index) => {
      const row = document.createElement('section'); row.className = 'player-vitals';
      const title = document.createElement('strong'); title.className = 'vitals-name'; title.textContent = identities[index];
      row.append(title);
      const meters = {};
      for (const [kind,label] of [['health','Leven'],['power','Schietkracht']]) {
        const wrap = document.createElement('div'); wrap.className = `vital-meter vital-${kind}`;
        const caption = document.createElement('span'); caption.className = 'vital-label'; caption.textContent = label;
        const track = document.createElement('div'); track.className = 'vital-track'; track.setAttribute('role','meter'); track.setAttribute('aria-label',`${identities[index]} · ${label}`); track.setAttribute('aria-valuemin','0');
        const count = document.createElement('span'); count.className = 'vital-count'; count.setAttribute('aria-hidden','true');
        wrap.append(caption,track,count); row.append(wrap); meters[kind] = { track, count, segments: [], signature: '' };
      }
      const hint = document.createElement('span'); hint.className = 'vitals-hint'; row.append(hint); container.append(row);
      return { row, hint, meters };
    });
    view = { key, rows }; views.set(container,view);
  }
  players.forEach((p,index) => {
    const row = view.rows[index], defaults = vitalLimits(p.character);
    const local = players.length>1 && p===localPlayer;
    if (row.row.classList.contains('vitals-local') !== local) row.row.classList.toggle('vitals-local',local);
    for (const [kind,max] of [['health',p.maxHealth || defaults.maxHealth],['power',p.maxPower || defaults.maxPower]]) {
      const meter = row.meters[kind], value = Math.max(0,Math.min(max,p[kind] ?? max));
      const available = Math.floor(value+1e-9), signature = `${max}:${available}:${Math.round(value*20)}`;
      if (meter.signature === signature) continue;
      meter.signature = signature;
      if (meter.segments.length !== max) {
        meter.track.replaceChildren(); meter.segments = Array.from({length:max},()=>{
          const segment=document.createElement('span'),fill=document.createElement('i');segment.append(fill);meter.track.append(segment);return { fill, fraction: null };
        });
      }
      const displayed = Math.round(value*20)/20;
      meter.segments.forEach((segment,i)=>{
        const fraction = Math.max(0,Math.min(1,displayed-i));
        if (segment.fraction !== fraction) { segment.fill.style.transform=`scaleX(${fraction})`; segment.fraction=fraction; }
      });
      setHUDText(meter.count, `${available}/${max}`);
      setHUDAttribute(meter.track,'aria-valuemax',max); setHUDAttribute(meter.track,'aria-valuenow',displayed);
      setHUDAttribute(meter.track,'aria-valuetext',`${available} van ${max}${kind==='power'?' schoten beschikbaar':' levenspunten'}`);
    }
    const armed = p.fire || p.ice || p.bubblegun || p.mounted?.kind==='seahorse';
    const hint = p.health===0 ? p.respawn>0 ? 'Even wachten… je komt terug' : 'Geen leven meer' : !armed ? 'Pak een vuurbloem, ijsbloem of bubblegun' : p.power<1-1e-9 ? 'Schietkracht laadt op…' : 'F / X · schieten';
    if (row.hint.textContent!==hint) row.hint.textContent=hint;
  });
}
