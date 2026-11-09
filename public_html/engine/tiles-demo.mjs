import { loadLook } from './look.mjs?v=8';
import { terrainAppearance } from './engine.mjs?v=40';
import { TERRAIN_VARIANTS, matchingTerrainVariants, terrainFits } from './terrain-rules.mjs?v=1';
import { TERRAIN_COUNT, terrainSprite, drawTerrain } from './terrain.mjs?v=3';

const demoBoard = document.getElementById('board'), demoCtx = demoBoard.getContext('2d');
let demoTiles, demoChoices, demoMaterial = 1, demoSeed = 0, demoDragging = false, demoCursor = null;
const demoWidth = 18, demoHeight = 8, demoCell = 48;

function resetDemo() {
  demoTiles = Array.from({ length: demoHeight }, () => Array(demoWidth).fill(0));
  demoChoices = Array.from({ length: demoHeight }, () => Array(demoWidth).fill(null));
  for (let x = 0; x < demoWidth; x++) { demoTiles[6][x] = 1; demoTiles[7][x] = 1; }
  for (let x = 1; x < 8; x++) for (let y = 5 - Math.floor(x / 3); y < 6; y++) demoTiles[y][x] = 1;
  for (let y = 2; y < 6; y++) for (let x = 11; x < 16; x++) if (y === 2 || x === 11 || x === 15) demoTiles[y][x] = 2;
  for (let x = 1; x < 6; x++) demoTiles[1][x] = 2;
  demoSeed = 0; renderDemo();
}

function renderDemo() {
  demoCtx.setTransform(2, 0, 0, 2, 0, 0);
  const sky = demoCtx.createLinearGradient(0, 0, 0, demoHeight * demoCell); sky.addColorStop(0, '#bbdeed'); sky.addColorStop(1, '#e5efd1');
  demoCtx.fillStyle = sky; demoCtx.fillRect(0, 0, demoWidth * demoCell, demoHeight * demoCell);
  for (let y = 0; y < demoHeight; y++) for (let x = 0; x < demoWidth; x++) {
    const id = demoTiles[y][x]; if (!id) continue;
    const appearance = terrainAppearance({ tiles: demoTiles, terrainSeed: demoSeed }, x, y);
    const preference = demoChoices[y][x];
    if (preference !== null && matchingTerrainVariants(appearance.mask, TERRAIN_VARIANTS[appearance.variant].codes).includes(preference)) appearance.variant = preference;
    drawTerrain(demoCtx, id === 1 ? 'ground' : 'brick', x * demoCell, y * demoCell, demoCell, appearance);
  }
  if (demoCursor) {
    demoCtx.strokeStyle = '#ffffff'; demoCtx.lineWidth = 2;
    demoCtx.strokeRect(demoCursor.x * demoCell + 2, demoCursor.y * demoCell + 2, demoCell - 4, demoCell - 4);
  }
}

function stampDemo(x, y, erase = false) {
  if (x < 0 || x >= demoWidth || y < 0 || y >= demoHeight) return;
  demoCursor = { x, y }; demoTiles[y][x] = erase ? 0 : demoMaterial;
  const choice = document.getElementById('variant').value;
  demoChoices[y][x] = choice === 'auto' ? null : Number(choice); renderDemo();
}

// Check every permitted pairing against the actual prepared pixels.
function checkDemoSeams() {
  let checks = 0;
  for (const material of ['ground', 'brick']) {
    const surfaces = Array.from({ length: TERRAIN_COUNT }, (_, variant) => {
      const c = terrainSprite(material, variant, 15);
      return c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    });
    const size = terrainSprite(material, 0, 15).width;
    for (const [av, a] of surfaces.entries()) for (const [bv, b] of surfaces.entries()) {
      const horizontal = terrainFits(av, bv, 'right'), vertical = terrainFits(av, bv, 'down');
      for (let i = 0; i < size; i++) for (let channel = 0; channel < 4; channel++) {
        if (horizontal && a[(i * size + size - 1) * 4 + channel] !== b[i * size * 4 + channel] ||
            vertical && a[((size - 1) * size + i) * 4 + channel] !== b[i * 4 + channel]) throw new Error('Aansluitcontrole mislukt.');
      }
      checks += Number(horizontal) + Number(vertical);
    }
    // The illustrated grass strip must also join horizontally.
    const topSurfaces = Array.from({ length: TERRAIN_COUNT }, (_, v) => terrainSprite(material, v, 14).getContext('2d').getImageData(0, 0, size, size).data);
    for (const [av, a] of topSurfaces.entries()) for (const [bv, b] of topSurfaces.entries()) {
      if (!terrainFits(av, bv, 'right')) continue;
      for (let y = 0; y < size; y++) for (let channel = 0; channel < 4; channel++) {
        if (a[(y * size + size - 1) * 4 + channel] !== b[y * size * 4 + channel]) throw new Error('Bovenrand sluit niet aan.');
      }
    }
  }
  return checks;
}

try {
  await loadLook();
  for (let i = 0; i < TERRAIN_COUNT; i++) {
    const option = document.createElement('option'); option.value = i; option.textContent = `Variant ${i + 1}`; document.getElementById('variant').append(option);
    for (const material of ['ground', 'brick']) {
      const figure = document.createElement('figure'), canvas = document.createElement('canvas'), caption = document.createElement('figcaption');
      canvas.width = 96; canvas.height = 96; caption.textContent = `Variant ${i + 1}`;
      drawTerrain(canvas.getContext('2d'), material, 0, 0, 96, { mask: 0, variant: i });
      figure.append(canvas, caption); document.getElementById(material).append(figure);
    }
  }
  resetDemo();
  for (const button of document.querySelectorAll('[data-material]')) button.addEventListener('click', () => {
    demoMaterial = Number(button.dataset.material);
    for (const b of document.querySelectorAll('[data-material]')) b.setAttribute('aria-pressed', b === button);
  });
  document.getElementById('mix').addEventListener('click', () => { demoSeed++; renderDemo(); });
  document.getElementById('reset').addEventListener('click', resetDemo);
  const point = event => {
    const box = demoBoard.getBoundingClientRect();
    return { x: Math.floor((event.clientX - box.left) / box.width * demoWidth), y: Math.floor((event.clientY - box.top) / box.height * demoHeight) };
  };
  demoBoard.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    demoDragging = true; demoBoard.setPointerCapture(event.pointerId); demoBoard.focus(); const p = point(event); stampDemo(p.x, p.y);
  });
  demoBoard.addEventListener('pointermove', event => { if (demoDragging) { const p = point(event); stampDemo(p.x, p.y); } });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) demoBoard.addEventListener(type, () => { demoDragging = false; });
  demoBoard.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Delete', 'Backspace'].includes(event.key)) return;
    event.preventDefault(); demoCursor ??= { x: 0, y: 0 };
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (direction) { demoCursor.x = Math.max(0, Math.min(demoWidth - 1, demoCursor.x + direction[0])); demoCursor.y = Math.max(0, Math.min(demoHeight - 1, demoCursor.y + direction[1])); renderDemo(); }
    else stampDemo(demoCursor.x, demoCursor.y, ['Delete', 'Backspace'].includes(event.key));
  });
  document.getElementById('status').textContent = `40 varianten geladen · ${checkDemoSeams()} passende horizontale en verticale aansluitingen gecontroleerd. De engine kiest automatisch.`;
} catch (error) { document.getElementById('status').textContent = error.message; }
