import { EDITABLE_OBJECT_IDS, ENEMY_OPTIONS, DEFAULT_ENEMY_DESIGN, canGiveFlight, validateEnemyDesign } from './enemy-design.mjs?v=5';
import { drawTile } from './art.mjs?v=61';
export function setupEnemyEditor({ onSave, onError }) {
  const dialog = document.querySelector('#enemy-editor-dialog');
  const form = dialog.querySelector('form'), previewCanvas = dialog.querySelector('.enemy-preview canvas');
  const fields = dialog.querySelector('.enemy-fields');
  const labels = { head: 'Hoofd', body: 'Lijf', hat: 'Hoed', wings: 'Vleugels', wingSize: 'Grootte', wingColor: 'Kleur', fly: 'Vliegen' };
  let target = null, design = { ...DEFAULT_ENEMY_DESIGN };
  const choices = [];
  for (const [key, options] of Object.entries({ ...ENEMY_OPTIONS, fly: { no: 'Op de grond', yes: 'Vliegen' } })) {
    const group = document.createElement('fieldset'); group.className = 'enemy-choice-group'; group.dataset.key = key;
    const legend = document.createElement('legend'); legend.textContent = labels[key]; group.append(legend);
    const row = document.createElement('div'); row.className = 'enemy-choice-row'; group.append(row);
    for (const [value, name] of Object.entries(options)) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'enemy-choice';
      button.setAttribute('aria-label', `${labels[key]}: ${name}`); button.title = name;
      const canvas = document.createElement('canvas'); canvas.width = 120; canvas.height = 100; canvas.setAttribute('aria-hidden', 'true');
      const caption = document.createElement('span'); caption.textContent = name;
      const check = document.createElement('span'); check.className = 'enemy-choice-check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true');
      button.append(canvas, caption, check); row.append(button);
      button.addEventListener('click', () => {
        design[key] = key === 'fly' ? value === 'yes' : value;
        if (key === 'wings') design.fly = value !== 'none' && canGiveFlight(target.tileId);
        refresh();
      });
      choices.push({ key, value, button, canvas });
    }
    fields.append(group);
  }
  function paintChoice({ key, value, canvas }) {
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 120, 100);
    const sample = { ...design, [key]: value };
    if (['wingSize', 'wingColor', 'fly'].includes(key) && sample.wings === 'none') sample.wings = 'feather';
    // Show one change at a time, using the same artwork as the finished enemy.
    let size = 42, y = 40;
    if (key === 'head' || key === 'body') { sample.hat = 'none'; sample.wings = 'none'; size = 54; y = 30; }
    if (key === 'hat') { sample.wings = 'none'; y = 43; }
    if (key === 'fly') {
      sample.fly = value === 'yes'; if (!sample.fly) sample.wings = 'none';
      y = sample.fly ? 25 : 48;
      ctx.fillStyle = '#8cba82'; ctx.fillRect(12, 91, 96, 5);
      if (sample.fly) { ctx.strokeStyle = '#5e97bd'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(46 + i * 14, 78); ctx.lineTo(46 + i * 14, 87); ctx.stroke(); } }
    }
    drawTile(ctx, target.tileId, (120 - size) / 2, y, size, target.theme, { enemyDesign: sample, icon: true });
    if (value === 'none') {
      ctx.strokeStyle = '#bf4055'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(103, 15, 10, 0, Math.PI * 2); ctx.moveTo(96, 22); ctx.lineTo(110, 8); ctx.stroke();
    }
  }
  const lengthLabel = document.createElement('label'); lengthLabel.textContent = 'Lengte duizendpoot (2–10 delen) ';
  const lengthInput = document.createElement('input'); lengthInput.type = 'number'; lengthInput.min = '2'; lengthInput.max = '10'; lengthInput.step = '1';
  lengthLabel.append(lengthInput); fields.prepend(lengthLabel);
  lengthInput.addEventListener('input', () => { design.length = Number(lengthInput.value); refresh(); });
  function refresh() {
    if (!target) return;
    for (const group of fields.querySelectorAll('fieldset')) group.hidden = target.tileId === 83 || (group.dataset.key === 'fly' && EDITABLE_OBJECT_IDS.includes(target.tileId));
    lengthLabel.hidden = target.tileId !== 83; lengthInput.value = design.length ?? 4;
    const wings = design.wings !== 'none', flightAllowed = wings && canGiveFlight(target.tileId);
    if (!flightAllowed) design.fly = false;
    for (const choice of choices) {
      const { key, value, button } = choice;
      button.disabled = ['wingSize', 'wingColor'].includes(key) && !wings || key === 'fly' && value === 'yes' && !flightAllowed;
      button.setAttribute('aria-pressed', String(key === 'fly' ? design.fly === (value === 'yes') : design[key] === value));
      paintChoice(choice);
    }
    dialog.querySelector('#enemy-behavior-note').textContent = target.tileId >= 85 ? 'Dit onderwateronderdeel houdt zijn eigen gedrag. Hoofd, lijf, hoed en vleugels zijn versiering.' : EDITABLE_OBJECT_IDS.includes(target.tileId) ? 'Hoofd, lijf, hoed en vleugels zijn versiering. De beloning of kettingbeweging blijft hetzelfde.' : target.tileId === 83 ? 'Kies hoeveel delen je duizendpoot heeft. Als je op zijn rug landt, kijkt hij boos en gaat hij hard lopen.' : !canGiveFlight(target.tileId)
      ? 'Deze vijand houdt zijn eigen vlieg-, hap- of valgedrag. De extra vleugels zijn versiering.'
      : design.fly ? 'Je vijand vliegt! Zijn aanvallen blijven hetzelfde.' : wings ? 'Je hebt het vliegen uitgezet. Kies Vliegen om het weer aan te zetten.' : 'Geef je vijand vleugels, dan gaat hij automatisch vliegen.';
    const ctx = previewCanvas.getContext('2d'); ctx.clearRect(0, 0, 240, 200);
    ctx.fillStyle = '#e8f0ed'; ctx.fillRect(0, 0, 240, 200);
    ctx.fillStyle = '#8cba82'; ctx.fillRect(24, 174, 192, 5);
    drawTile(ctx, target.tileId, 84, design.fly ? 65 : 108, 72, target.theme, { enemyDesign: design, icon: true });
  }
  dialog.querySelector('[data-enemy-reset]').addEventListener('click', () => { design = { ...DEFAULT_ENEMY_DESIGN }; refresh(); });
  dialog.querySelector('[data-enemy-cancel]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { target = null; });
  form.addEventListener('submit', event => {
    event.preventDefault(); if (!target) return;
    try { onSave(target, validateEnemyDesign(design, target.tileId)); dialog.close(); } catch (error) { onError(error.message); }
  });
  return { open({ x, y, tileId, design: savedDesign, theme, name }) {
    target = { x, y, tileId, theme }; design = { ...DEFAULT_ENEMY_DESIGN, ...savedDesign };
    dialog.querySelector('#enemy-editor-name').textContent = name; refresh(); dialog.showModal();
  } };
}
