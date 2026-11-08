// Cosmetic parts have stable IDs; saved characters and room packets contain no image data.
export const CHARACTER_SHEETS = {
  heads: 'characters/custom/parts/heads.png', outfits: 'characters/custom/parts/outfits.png',
  shoes: 'characters/custom/parts/shoes.png', accessories: 'characters/custom/parts/accessories.png'
};
export const CHARACTER_PARTS = {
  head: [
    { id: 'dino', name: 'Dino' }, { id: 'grey', name: 'Vrouw · grijs haar en bril' },
    { id: 'blonde', name: 'Vrouw · blond haar en blauwe ogen' },
    { id: 'mohawk', name: 'Jongen van 7 · blonde hanenkam' }, { id: 'spikes', name: 'Jongen van 5 · Sonic-kapsel' }
  ],
  outfit: [
    { id: 'green-overalls', name: 'Groen tuinpak' }, { id: 'red-overalls', name: 'Rood tuinpak' },
    { id: 'princess', name: 'Prinsessenjurk' }, { id: 'red-hero', name: 'Rood superheldenpak' },
    { id: 'green-hero', name: 'Groen superheldenpak' }, { id: 'chicken', name: 'Kippenpak' }, { id: 'coat', name: 'Lange donkere jas' }
  ],
  shoes: [
    { id: 'clown', name: 'Clownschoenen' }, { id: 'heels', name: 'Naaldhakken' },
    { id: 'ice', name: 'Schaatsen' }, { id: 'roller', name: 'Rolschaatsen' }, { id: 'skis', name: "Ski’s" }
  ],
  accessories: [
    { id: 'glasses', name: 'Bril' }, { id: 'earrings', name: 'Oorbellen' },
    { id: 'paint', name: 'Schmink' }, { id: 'rainbow', name: 'Regenboog over je hoofd' },
    { id: 'bandana', name: 'Bandana', hat: true }, { id: 'red-cap', name: 'Rode pet', hat: true },
    { id: 'green-cap', name: 'Groene pet', hat: true }, { id: 'feathers', name: 'Hoed met veren', hat: true },
    { id: 'motor', name: 'Motorhelm', hat: true }, { id: 'mushroom', name: 'Paddenstoelhelm', hat: true }
  ]
};
export const DEFAULT_APPEARANCE = { name: 'Mijn held', head: 'mohawk', outfit: 'green-overalls', shoes: 'clown', accessories: [] };
export function normalizeAppearance(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = { name: typeof value.name === 'string' ? value.name.trim().slice(0, 32) || 'Mijn held' : 'Mijn held' };
  for (const key of ['head', 'outfit', 'shoes']) {
    if (!CHARACTER_PARTS[key].some(part => part.id === value[key])) return null;
    result[key] = value[key];
  }
  const requested = Array.isArray(value.accessories) ? value.accessories : [];
  let hat = false;
  result.accessories = CHARACTER_PARTS.accessories.filter(part => {
    if (!requested.includes(part.id) || part.hat && hat) return false;
    if (part.hat) hat = true;
    return true;
  }).map(part => part.id);
  return result;
}
export function toggleAccessory(appearance, id) {
  const part = CHARACTER_PARTS.accessories.find(part => part.id === id);
  if (!part) return normalizeAppearance(appearance);
  let accessories = appearance.accessories.filter(item => item !== id);
  if (!appearance.accessories.includes(id)) {
    if (part.hat) accessories = accessories.filter(item => !CHARACTER_PARTS.accessories.find(part => part.id === item)?.hat);
    accessories.push(id);
  }
  return normalizeAppearance({ ...appearance, accessories });
}
export function normalizeCharacters(entries) {
  if (!Array.isArray(entries)) return [];
  const seen = new Set();
  return entries.slice(0, 24).flatMap(entry => {
    const appearance = normalizeAppearance(entry?.appearance);
    if (!appearance || typeof entry.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(entry.id) || seen.has(entry.id)) return [];
    seen.add(entry.id); return [{ id: entry.id, appearance }];
  });
}
const makerSprites = new Map(), composedCharacters = new Map();
let characterArtPromise;
export function loadCharacterArt() {
  if (characterArtPromise) return characterArtPromise;
  characterArtPromise = Promise.all(Object.entries(CHARACTER_SHEETS).map(async ([sheet, path]) => {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve; image.onerror = () => reject(new Error('De tekeningen voor de karaktermaker konden niet worden geladen'));
      image.src = globalThis.braviosAssets?.[path] || new URL(path, new URL('../../', import.meta.url)).href;
    });
    const kind = { heads: 'head', outfits: 'outfit', shoes: 'shoes', accessories: 'accessories' }[sheet];
    const columns = sheet === 'heads' || sheet === 'shoes' ? 3 : 4, rows = sheet === 'accessories' ? 3 : 2;
    CHARACTER_PARTS[kind].forEach((part, index) => {
      let sx = Math.round(index % columns * image.width / columns), sy = Math.round(Math.floor(index / columns) * image.height / rows);
      let sw = Math.round(image.width / columns), sh = Math.round(image.height / rows);
      // The long ski tips extend into the intentionally empty adjacent cell.
      if (sheet === 'shoes' && part.id === 'skis') { sx = 490; sy = 512; sw = 650; sh = 490; }
      if (sheet === 'shoes' && part.id === 'clown') sw = 550;
      const surface = document.createElement('canvas'); surface.width = sw; surface.height = sh;
      const context = surface.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
      const pixels = context.getImageData(0, 0, sw, sh).data;
      let left = sw, right = -1, top = sh, bottom = -1;
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (pixels[(y * sw + x) * 4 + 3] > 32) {
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      makerSprites.set(`${kind}:${part.id}`, { surface, x: left, y: top, width: right - left + 1, height: bottom - top + 1 });
    });
  })).catch(error => { characterArtPromise = null; throw error; });
  return characterArtPromise;
}
function drawPart(context, kind, id, x, y, width, height, contain = true) {
  const sprite = makerSprites.get(`${kind}:${id}`); if (!sprite) return;
  if (contain) {
    const scale = Math.min(width / sprite.width, height / sprite.height);
    const w = sprite.width * scale, h = sprite.height * scale;
    x += (width - w) / 2; y += height - h; width = w; height = h;
  }
  context.drawImage(sprite.surface, sprite.x, sprite.y, sprite.width, sprite.height, x, y, width, height);
  return { x, y, width, height };
}
export function drawCharacterPart(canvas, kind, id) {
  const context = canvas.getContext('2d'); context.clearRect(0, 0, canvas.width, canvas.height);
  drawPart(context, kind, id, 8, 6, canvas.width - 16, canvas.height - 12);
}
export function characterSurface(value) {
  const appearance = normalizeAppearance(value); if (!appearance || !makerSprites.size) return null;
  const key = JSON.stringify(appearance);
  if (composedCharacters.has(key)) return composedCharacters.get(key);
  const surface = document.createElement('canvas'); surface.width = 320; surface.height = 400;
  const context = surface.getContext('2d');
  drawPart(context, 'outfit', appearance.outfit, 52, 171, 216, 160);
  const shoeWidth = appearance.shoes === 'skis' ? 210 : 140;
  drawPart(context, 'shoes', appearance.shoes, (320 - shoeWidth) / 2, 319, shoeWidth, 53, false);
  const head = drawPart(context, 'head', appearance.head, 78, 22, 164, 164);
  const { x, y, width: w, height: h } = head;
  const eye = y + h * ({ dino: .47, grey: .55, blonde: .55, mohawk: .61, spikes: .64 }[appearance.head]);
  for (const part of CHARACTER_PARTS.accessories.filter(part => appearance.accessories.includes(part.id))) {
    if (part.id === 'glasses') drawPart(context, 'accessories', part.id, x + w * .12, eye - h * .10, w * .76, h * .22, false);
    else if (part.id === 'earrings') drawPart(context, 'accessories', part.id, x + w * .06, eye + h * .10, w * .88, h * .22, false);
    else if (part.id === 'paint') drawPart(context, 'accessories', part.id, x + w * .13, eye - h * .18, w * .74, h * .45, false);
    else if (part.id === 'rainbow') drawPart(context, 'accessories', part.id, x - 12, y - 8, w + 24, h * .44, false);
    else if (['motor', 'mushroom'].includes(part.id)) drawPart(context, 'accessories', part.id, x - 14, y - 13, w + 28, h + 10, false);
    else drawPart(context, 'accessories', part.id, x - 14, y - 17, w + 28, h * (part.id === 'feathers' ? .7 : .42), false);
  }
  if (composedCharacters.size > 80) composedCharacters.clear();
  composedCharacters.set(key, surface); return surface;
}
export function drawCustomHero(context, appearance, x, y, width, facing = 1, pose = {}) {
  const surface = characterSurface(appearance); if (!surface) return false;
  const height = width * 1.37, bodyWidth = height * .8;
  // Dresses and coats keep their hem intact; only the feet below it swing.
  const split = appearance.outfit === 'princess' ? .86 : appearance.outfit === 'coat' ? .80 : .66;
  if (drawWalkingSprite(context, surface, { x: 0, y: 0, width: 320, height: 372 }, x + width / 2, y + width, bodyWidth, height, facing, pose, split)) return true;
  const bob = pose.running && !pose.reducedMotion ? Math.abs(Math.sin((pose.time || 0) * 18)) * width * .04 : 0;
  context.save(); context.translate(x + width / 2, y + width - bob); context.scale(facing, 1);
  if (pose.running && !pose.reducedMotion) context.rotate(Math.sin((pose.time || 0) * 18) * .04);
  context.drawImage(surface, 0, 0, 320, 372, -bodyWidth / 2, -height, bodyWidth, height); context.restore(); return true;
}

// Three image draws per moving hero, using the already prepared artwork.
// No extra canvases, pixel reads, or animation data enter the saved character.
export function drawWalkingSprite(context, surface, bounds, centerX, feetY, width, height, facing, pose = {}, split = .66) {
  if (!pose.running || pose.airborne || pose.won || pose.landing > .04 || pose.reducedMotion) return false;
  const phase = (pose.time || 0) * (12 + Math.min(320, Math.abs(pose.speed ?? 150)) * .04);
  const stride = Math.sin(phase), legHeight = height * (1 - split);
  context.save(); context.translate(centerX, feetY - Math.abs(Math.sin(phase * 2)) * height * .018); context.scale(facing, 1);
  context.rotate(.06);
  for (let leg = 0; leg < 2; leg++) {
    const side = leg ? 1 : -1, hip = side * width * .14;
    context.save(); context.translate(hip, -legHeight);
    context.rotate(side * stride * .48);
    context.drawImage(surface, bounds.x + leg * bounds.width / 2, bounds.y + bounds.height * split, bounds.width / 2, bounds.height * (1 - split), leg * width / 2 - width / 2 - hip, -1, width / 2, legHeight + 1);
    context.restore();
  }
  // Overlap the hips slightly so the leg joints stay hidden through each step.
  context.drawImage(surface, bounds.x, bounds.y, bounds.width, bounds.height * (split + .035), -width / 2, -height, width, height * (split + .035));
  context.restore(); return true;
}
export function characterPortrait(appearance) {
  const surface = characterSurface(appearance); if (!surface) return null;
  const portrait = document.createElement('canvas'); portrait.width = 96; portrait.height = 96;
  portrait.getContext('2d').drawImage(surface, 64, 0, 192, 192, 0, 0, 96, 96); return portrait.toDataURL('image/png');
}

export function setupCharacterMaker({ getState, save, useClassic, close }) {
  const dialog = document.querySelector('#character-maker-dialog');
  const name = document.querySelector('#custom-character-name');
  const preview = document.querySelector('#character-preview');
  const panels = document.querySelector('#character-part-panels');
  let draft = normalizeAppearance(DEFAULT_APPEARANCE), editingId = null;
  function render() {
    draft.name = name.value.trim().slice(0, 32) || 'Mijn held';
    const surface = characterSurface(draft), context = preview.getContext('2d');
    context.clearRect(0, 0, 320, 400); if (surface) context.drawImage(surface, 0, 0);
    const description = `${draft.name} · ${CHARACTER_PARTS.head.find(p => p.id === draft.head).name} · ${CHARACTER_PARTS.outfit.find(p => p.id === draft.outfit).name} · ${CHARACTER_PARTS.shoes.find(p => p.id === draft.shoes).name}`;
    preview.setAttribute('aria-label', description); document.querySelector('#character-preview-description').textContent = draft.name;
    for (const button of panels.querySelectorAll('[data-part]')) {
      const selected = button.dataset.kind === 'accessories' ? draft.accessories.includes(button.dataset.part) : draft[button.dataset.kind] === button.dataset.part;
      button.setAttribute('aria-pressed', String(selected));
    }
  }
  function selectTab(kind, focus = false) {
    for (const button of dialog.querySelectorAll('[data-parts-tab]')) {
      const active = button.dataset.partsTab === kind;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
      document.querySelector(`#parts-${button.dataset.partsTab}`).hidden = !active;
    }
  }
  for (const [kind, parts] of Object.entries(CHARACTER_PARTS)) {
    const panel = document.createElement('div'); panel.className = 'character-parts'; panel.id = `parts-${kind}`;
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `tab-${kind}`); panel.hidden = kind !== 'head';
    for (const part of parts) {
      const button = document.createElement('button'); button.className = 'character-part'; button.dataset.kind = kind; button.dataset.part = part.id;
      button.setAttribute('aria-pressed', 'false');
      const image = document.createElement('canvas'); image.width = 144; image.height = 112; image.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.textContent = part.name;
      button.append(image, label); panel.append(button);
      button.addEventListener('click', () => { draft = kind === 'accessories' ? toggleAccessory(draft, part.id) : { ...draft, [kind]: part.id }; render(); });
    }
    panels.append(panel);
  }
  const tabs = [...dialog.querySelectorAll('[data-parts-tab]')];
  for (const [index, button] of tabs.entries()) {
    button.addEventListener('click', () => selectTab(button.dataset.partsTab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.partsTab, true);
    });
  }
  name.addEventListener('input', render);
  function refreshCollection() {
    const list = document.querySelector('#custom-character-list'); list.replaceChildren();
    const { characters } = getState();
    if (!characters.length) { const empty = document.createElement('p'); empty.textContent = 'Jouw eerste held komt hier te staan.'; list.append(empty); }
    for (const entry of characters) {
      const button = document.createElement('button'); button.className = 'saved-character'; button.setAttribute('aria-pressed', String(entry.id === editingId));
      const image = document.createElement('canvas'); image.width = 80; image.height = 100; image.setAttribute('aria-hidden', 'true');
      const surface = characterSurface(entry.appearance); if (surface) image.getContext('2d').drawImage(surface, 0, 0, 80, 100);
      const label = document.createElement('span'); label.textContent = entry.appearance.name; button.append(image, label); list.append(button);
      button.addEventListener('click', () => { editingId = entry.id; draft = normalizeAppearance(entry.appearance); name.value = draft.name; refreshCollection(); render(); });
    }
  }
  document.querySelector('#fresh-character').addEventListener('click', () => { editingId = null; draft = normalizeAppearance(DEFAULT_APPEARANCE); name.value = draft.name; selectTab('head'); refreshCollection(); render(); name.focus(); });
  document.querySelector('#use-custom-character').addEventListener('click', () => { render(); if (save(editingId, normalizeAppearance(draft))) { dialog.close(); close(); } });
  for (const button of dialog.querySelectorAll('[data-classic-character]')) button.addEventListener('click', () => { useClassic(button.dataset.classicCharacter); dialog.close(); close(); });
  return {
    async open() {
      await loadCharacterArt();
      const { characters, selected } = getState(); const entry = characters.find(entry => entry.id === selected);
      editingId = entry?.id || null; draft = normalizeAppearance(entry?.appearance || DEFAULT_APPEARANCE); name.value = draft.name;
      for (const button of panels.querySelectorAll('[data-part]')) drawCharacterPart(button.querySelector('canvas'), button.dataset.kind, button.dataset.part);
      selectTab('head'); refreshCollection(); render(); dialog.showModal();
    }
  };
}

export function releaseCharacterComposites(){for(const surface of composedCharacters.values()){surface.width=1;surface.height=1;}composedCharacters.clear();}
