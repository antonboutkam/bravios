import {structureProfile,structureIs,structureTiles,structureFootprint} from './structures/runtime.mjs';
import { wonderEncounterHint } from './wonder-foes.mjs?v=1';
import { WONDERLAND_FIELDS, wonderlandState, wonderlandUnlocked, completeWonderland, wonderlandLevel, prepareWonderlandGame } from './wonderland.mjs?v=3';
import { setupWonderlandMap } from './wonderland-map.mjs?v=2';
import { wonderlandStatus } from './wonder-magic.mjs?v=14';
import { setupSmallGames } from './games/shell.mjs';
import { drawMiniPreview } from './games/preview.mjs';
import { createPlatformEncounters } from './games/platformer/encounters.mjs';
import { participantRoster, CHARACTER_PROFILES, DEFAULT_CHARACTER, nextCharacter } from './characters/roster.mjs';
import { normalizeWorlds, saveWorldNodeLevel } from './worlds.mjs?v=1';
import { setupWorldEditor } from './world-editor.mjs?v=1';
import { ADVENTURE_FIELDS, adventureState, adventureUnlocked, completeAdventure, adventureLevel, prepareAdventureGame } from './adventurers.mjs?v=5';
import { setupAdventureMap } from './adventure-map.mjs?v=4';
import { isWaterTheme } from './sea-life.mjs?v=4';
import { canEditDesign, saveEnemyDesign, pruneEnemyDesigns } from './enemy-design.mjs?v=5';
import { setupEnemyEditor } from './enemy-editor.mjs?v=7';
import { normalizeAppearance, normalizeCharacters, setupCharacterMaker, characterPortrait, loadCharacterArt, releaseCharacterComposites } from './character-maker.mjs?v=3';
import { beltNearCell, validateBelts } from './mechanisms.mjs?v=2';
import { TILE, ROWS, ITEMS, PIPE_TYPES, THEMES, PALETTE_GROUPS, rocketCountdown, nearbyShell, pipeUnderPlayer, challengeResult, clone, randomLevel, blankLevel, exampleLevel, validateLevel, positions, resizeLevel, resizeUnderground, createGame, stepGame, seedTerrainLevel } from './engine.mjs?v=44';
import { CAMPAIGN_FIELDS, CRAZY_FIELDS, TOGETHER_FIELDS, campaignLevel, crazyLevel, togetherLevel } from './levels.mjs?v=15';
import { drawTile, drawWorld, preview, CHARACTER_NAMES, assetURL, loadCrazyBackgrounds, hero, releasePlatformSprites } from './art.mjs?v=61';
import { loadLook } from './look.mjs?v=8';
import { normalizeLibrary, savedLevelDetail } from './storage.mjs?v=20';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame, remoteControls } from './coop.mjs?v=swing-9';
import { roomRequest, RoomConnection } from './network.mjs';
import { RenderQuality, FrameRateMeter, SceneEffects, followCamera, keyCameraFrame, viewportRenderSize, viewportWorldPoint } from './presentation.mjs?v=12';
import { GamepadInput, emptyGamepadControls } from './gamepad.mjs?v=4';
import { BackgroundRaster, DepthPanelCache } from './depth-backgrounds.mjs?v=9';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const canvas = $('#world'), ctx = canvas.getContext('2d'), scroll = $('#world-scroll');
const worldSpace = $('#world-space');
let renderResolution = 1, screenDensity = 1, worldDisplayWidth = 1, worldDisplayHeight = 1;
const STORAGE = 'super-bouwclub-v1';
let level = seedTerrainLevel(exampleLevel()), library = [], selected = 1, tool = 'paint', category = 'all', grid = true, sound = false;
let expandedGroup = null, beltStart = null;
const groupSelections = Object.fromEntries(PALETTE_GROUPS.map(g => [g.id, g.items[0]]));
let wonderland = wonderlandState(), wonderlandIndex = null;
let adventure = adventureState(), adventureIndex = null, adventureLaunching = false, adventureGameOver = false;
let worlds = [], selectedWorldId = null, worldEditing = null, worldPlaying = null, worldDraftBackup = null;
let playLevel = null, campaignIndex = null, campaignProgress = 0, campaignCompleted = false;
let campaignKind = 'regular', crazyProgress = 0, crazyCompleted = false;
const currentFields = () => campaignKind === 'crazy' ? CRAZY_FIELDS : CAMPAIGN_FIELDS;
const currentCampaignLevel = index => campaignKind === 'crazy' ? crazyLevel(index) : campaignLevel(index);
function activeLevel() { return game?.sceneLevel || networkLevel || playLevel || level; }
let game = null, hover = null, stroke = null, paletteDrag = null, undoStack = [], redoStack = [], toastTimer, saveTimer, audioContext;
let input = { left: false, right: false, jump: false, fire: false, mount: false, pipe: false }, keys = new Set(), touchKeys = new Map();
const controller = new GamepadInput();
const secondMiniController = new GamepadInput();
let controllerInput = emptyGamepadControls();
const pendingActions = new Set();
const actionKeys = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyF: 'fire', KeyX: 'fire', KeyR: 'mount', ArrowDown: 'pipe', KeyS: 'pipe' };
let lastTime = 0, accumulator = 0, pendingConfirmation = null, lastHudTime = -1;
const sceneEffects = new SceneEffects();
const frameRateMeter = new FrameRateMeter(), frameRateOutput = $('#frame-rate');
const renderQuality = new RenderQuality();
let renderProbe = new URLSearchParams(location.search).get('renderprobe') === '1';
let depthLayers = true;
let lightBackground = true;
let backgroundResolutionScale = .5;
const gameBackgroundRaster = new BackgroundRaster();
const gameDepthCache = new DepthPanelCache(1);
const optionalDepthPanels = { get: (...args) => gameDepthCache.getOrNull(...args) };
let probeResolutionScale = 1;
frameRateOutput.hidden = !renderProbe && new URLSearchParams(location.search).get('fps') !== '1';
const renderProbeControls = $('#render-probe-controls'), depthLayersButton = $('#toggle-depth-layers');
let renderProbeCost = { logicMs: 0, drawMs: 0 };
renderProbeControls.hidden = frameRateOutput.hidden;
function toggleDepthLayers() {
  renderProbe = true; depthLayers = !depthLayers;
  if (!depthLayers) gameDepthCache.dispose();
  renderQuality.reset(); frameRateMeter.reset();
  frameRateOutput.hidden = false; renderProbeControls.hidden = false;
  depthLayersButton.textContent = `Dieptelagen: ${depthLayers ? 'aan' : 'uit'} (F9)`;
  depthLayersButton.setAttribute('aria-pressed', String(depthLayers));
  frameRateOutput.textContent = `FPS meten… · dieptelagen ${depthLayers ? 'aan' : 'uit'}`;
}
depthLayersButton.addEventListener('click', () => { toggleDepthLayers(); canvas.focus({ preventScroll: true }); });
$('#toggle-depth-cache').addEventListener('change', event => {
  const selectedScale = Number(event.target.value);
  if (![1,.5,.35,.25].includes(selectedScale)) return;
  renderProbe = true; backgroundResolutionScale = selectedScale; lightBackground = selectedScale < 1;
  gameBackgroundRaster.resolutionScale = selectedScale;
  gameDepthCache.dispose(); gameBackgroundRaster.dispose(); renderQuality.reset(); frameRateMeter.reset();
  frameRateOutput.textContent = 'FPS meten…'; canvas.focus({ preventScroll: true });
});
$('#toggle-probe-resolution').addEventListener('change', event => {
  const selectedScale = Number(event.target.value);
  if (![1,.95,.9,.85,.75,.5].includes(selectedScale)) return;
  renderProbe = true; probeResolutionScale = selectedScale;
  renderQuality.reset(); frameRateMeter.reset(); resizeWorldRaster();
  frameRateOutput.textContent = 'FPS meten…'; canvas.focus({ preventScroll: true });
});
document.addEventListener('visibilitychange', () => { frameRateMeter.reset(); renderQuality.reset(); if (document.hidden) { gameDepthCache.dispose(); gameBackgroundRaster.dispose(); } });
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let cameraPosition = 0, keyCameraOrigin = null, viewedRoom = null;
let storageProblem = false;
let character = DEFAULT_CHARACTER, customCharacters = [], selectedCustomCharacter = null;
const selectedAppearance = () => customCharacters.find(entry => entry.id === selectedCustomCharacter)?.appearance || null;
const characterPortraits = {};
let room = null, networkLevel = null, remotePacket = {}, remoteTaps = {}, guestPresent = false, roomBusy = false;
const tapCounts = { jump: 0, fire: 0, mount: 0, pipe: 0 };
let lastRoomFrame = -1;
try {
  const raw = localStorage.getItem(STORAGE);
  if (raw) {
    const stored = JSON.parse(raw);
    level = validateLevel(stored.draft);
    if (!Array.isArray(stored.levels)) throw new Error('Ongeldige collectie');
    library = normalizeLibrary(stored.levels);
    if (Object.hasOwn(CHARACTER_NAMES, stored.character)) character = stored.character;
    if (Number.isInteger(stored.campaignProgress) && stored.campaignProgress >= 0 && stored.campaignProgress < CAMPAIGN_FIELDS.length) campaignProgress = stored.campaignProgress;
    customCharacters = normalizeCharacters(stored.customCharacters);
    selectedCustomCharacter = customCharacters.some(entry => entry.id === stored.selectedCustomCharacter) ? stored.selectedCustomCharacter : null;
    campaignCompleted = stored.campaignCompleted === true;
    if (Number.isInteger(stored.crazyProgress) && stored.crazyProgress >= 0 && stored.crazyProgress < CRAZY_FIELDS.length) crazyProgress = stored.crazyProgress;
    crazyCompleted = stored.crazyCompleted === true;
    adventure = adventureState(stored.adventure);
    wonderland = wonderlandState(stored.wonderland);
    worlds = normalizeWorlds(stored.worlds);
    selectedWorldId = worlds.find(w => w.id === stored.selectedWorldId)?.id || worlds[0]?.id || null;
    if (stored.worldEditing && worlds.find(w => w.id === stored.worldEditing.worldId)?.nodes.some(n => n.id === stored.worldEditing.nodeId && n.level)) {
      try {
        worldDraftBackup = validateLevel(stored.worldDraftBackup);
        worldEditing = { worldId: stored.worldEditing.worldId, nodeId: stored.worldEditing.nodeId };
      } catch { worldDraftBackup = null; }
    }
  }
} catch { storageProblem = true; }
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4300);
}
function persist() {
  clearTimeout(saveTimer);
  try {
    syncWorldDraft();
    localStorage.setItem(STORAGE, JSON.stringify({ draft: level, levels: library, character, customCharacters, selectedCustomCharacter, campaignProgress, campaignCompleted, crazyProgress, crazyCompleted, adventure, wonderland, worlds, selectedWorldId, worldEditing, worldDraftBackup }));
    $('#save-status').innerHTML = '<span class="status-dot"></span> Automatisch bewaard op dit apparaat';
    return true;
  } catch {
    $('#save-status').textContent = worlds.length ? 'Bewaren lukt niet · download je wereld en level' : 'Bewaren lukt niet · download je level';
    toast(worlds.length ? 'Bewaren in deze browser lukt niet. Download je wereld en je losse level als bestanden.' : 'Bewaren in deze browser lukt niet. Download je level als bestand.');
    return false;
  }
}
function scheduleSave() {
  $('#save-status').textContent = 'Even bewaren…'; clearTimeout(saveTimer); saveTimer = setTimeout(persist, 350);
}
function remember() { undoStack.push(clone(level)); if (undoStack.length > 70) undoStack.shift(); redoStack = []; }
function changed() { updateUI(); scheduleSave(); }
function syncWorldDraft() {
  if (!worldEditing) return;
  const world = worlds.find(w => w.id === worldEditing.worldId);
  if (world?.nodes.some(n => n.id === worldEditing.nodeId)) saveWorldNodeLevel(world, worldEditing.nodeId, level);
}
function replaceLevel(next) {
  syncWorldDraft(); worldEditing = null; worldDraftBackup = null;
  beltStart = null; stopGame(); remember(); level = clone(next); hover = null; scroll.scrollLeft = 0; changed(); scroll.scrollTop = worldDisplayHeight;
}
function resizeWorldRaster() {
  const pixelsPerUnit = worldDisplayWidth / (activeLevel().width * TILE);
  const raster = viewportRenderSize(scroll.clientWidth, scroll.clientHeight, pixelsPerUnit, Math.min(window.devicePixelRatio || 1, renderQuality.maxDensity), probeResolutionScale);
  renderResolution = raster.scale; screenDensity = raster.density;
  if (canvas.width !== raster.width) canvas.width = raster.width;
  if (canvas.height !== raster.height) canvas.height = raster.height;
  canvas.style.width = `${scroll.clientWidth}px`;
  canvas.style.height = `${scroll.clientHeight}px`;
}
function updateUI() {
  document.body.classList.toggle('playing', !!game);
  $('#back-to-world').hidden = !worldEditing && !worldPlaying;
  $('#world-menu-edit').disabled = !!room || roomBusy;
  $('#world-menu-play').disabled = !!room || roomBusy || !worlds.find(w => w.id === selectedWorldId)?.nodes.some(n => n.level);
  const displayLevel = activeLevel();
  const pixelsPerUnit = scroll.clientHeight / (ROWS * TILE);
  worldDisplayWidth = displayLevel.width * TILE * pixelsPerUnit;
  worldDisplayHeight = displayLevel.tiles.length * TILE * pixelsPerUnit;
  worldSpace.style.width = `${Math.max(scroll.clientWidth, worldDisplayWidth)}px`;
  worldSpace.style.height = `${Math.max(scroll.clientHeight, worldDisplayHeight)}px`;
  resizeWorldRaster();
  $('#level-name').value = level.name;
  $('#level-width').value = String(level.width);
  $('#level-height').value = String(level.tiles.length - (level.undergroundDepth || 0));
  $('#level-depth').value = String(level.undergroundDepth || 0);
  for (const option of $('#level-height').options) option.disabled = Number(option.value) + (level.undergroundDepth || 0) > 64;
  for (const option of $('#level-depth').options) option.disabled = Number(option.value) + level.tiles.length - (level.undergroundDepth || 0) > 64;
  $('#world-height').textContent = level.tiles.length;
  $('#vertical-position-slider').hidden = displayLevel.tiles.length === ROWS;
  $('#vertical-position-slider').max = Math.max(0, worldDisplayHeight - scroll.clientHeight);
  $('#vertical-position-slider').value = scroll.scrollTop;
  $('#world-width').textContent = level.width;
  $('#theme-label').textContent = THEMES[level.theme];
  $('#library-count').textContent = library.length;
  $('#campaign-progress').textContent = campaignCompleted ? 'Alle 10 velden uitgespeeld! Speel ze gerust opnieuw.' : `Verder bij veld ${campaignProgress + 1} van 10`;
  $('#crazy-progress').textContent = crazyCompleted ? 'Alle 10 gekke velden uitgespeeld! Speel ze gerust opnieuw.' : `Verder bij gek veld ${crazyProgress + 1} van 10`;
  for (const button of $$('[data-campaign], [data-crazy], [data-together], [data-together-room], #campaign-start, #crazy-start, #adventure-start')) button.disabled = !!game || roomBusy;
  const displayCharacter = room ? game.player.character : character;
  const appearance = room ? game.player.appearance : selectedAppearance();
  const displayName = appearance?.name || CHARACTER_NAMES[displayCharacter];
  $('#character-avatar').src = characterPortrait(appearance) || characterPortraits[displayCharacter] || assetURL(CHARACTER_PROFILES[displayCharacter].portrait);
  $('#character-button').setAttribute('aria-label', `Speler: ${displayName}. Wissel van speler`);
  $('#character-button').title = `Speel als ${displayName} · klik om te wisselen`;
  $('#character-button').disabled = !!game;
  $('#character-maker-button').disabled = !!game || !!room;
  $('#create-room').hidden = !!room; $('#join-room').hidden = !!room; $('#show-room').hidden = !room;
  $('#create-room').disabled = !!game || roomBusy;
  $('#join-room').disabled = !!game || roomBusy;
  $('#pause-button').disabled = room?.role === 'guest'; $('#restart-button').disabled = room?.role === 'guest';
  for (const button of $$('[data-character]')) {
    button.disabled = !!game; button.setAttribute('aria-pressed', button.dataset.character === character && !selectedCustomCharacter);
  }
  for (const button of $$('[data-theme]')) {
    const active = button.dataset.theme === level.theme; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active);
  }
  for (const [id, selector] of [[10, '#start-check'], [11, '#finish-check']]) {
    const exists = positions(level, id).length > 0; $(selector).classList.toggle('missing', !exists); $(`${selector} span`).textContent = exists ? '✓' : '!';
  }
  $('#undo').disabled = !undoStack.length || !!game;
  $('#redo').disabled = !redoStack.length || !!game;
  $('#level-name').disabled = !!game; $('#level-width').disabled = !!game; $('#level-height').disabled = !!game; $('#level-depth').disabled = !!game;
  for (const button of $$('[data-tool], [data-theme], [data-category]')) button.disabled = !!game;
  for (const button of $$('.palette-item, .palette-expand')) button.disabled = !!game;
  $('#grid-button').disabled = !!game;
  for (const control of $$('#new-level-form input, #new-level-form select, #new-level-form button')) control.disabled = !!game || !!room;
  $('#position-slider').max = Math.max(0, worldDisplayWidth - scroll.clientWidth);
  $('#position-slider').value = scroll.scrollLeft;
}
function makePalette() {
  const palette = $('#palette'); palette.replaceChildren();
  const variants = $('#palette-variants'); variants.replaceChildren(); variants.hidden = !expandedGroup;
  const seenGroups = new Set();
  ITEMS.filter(item => category === 'all' || item.category === category).forEach(item => {
    const group = PALETTE_GROUPS.find(g => g.items.includes(item.id));
    if (!group) { palette.append(paletteButton(item)); return; }
    if (seenGroups.has(group.id)) return;
    seenGroups.add(group.id);
    const wrapper = document.createElement('div'); wrapper.className = 'palette-group'; wrapper.setAttribute('role', 'group'); wrapper.setAttribute('aria-label', group.name);
    const main = paletteButton(ITEMS.find(i => i.id === groupSelections[group.id])); main.dataset.groupMain = group.id;
    updatePaletteButton(main, ITEMS.find(i => i.id === groupSelections[group.id]));
    const toggle = document.createElement('button'); toggle.className = 'palette-expand'; toggle.textContent = '▾'; toggle.disabled = !!game;
    toggle.dataset.expand = group.id; toggle.title = `${group.name}: kies een variant`; toggle.setAttribute('aria-label', toggle.title);
    toggle.setAttribute('aria-expanded', expandedGroup === group.id); toggle.setAttribute('aria-controls', 'palette-variants');
    toggle.addEventListener('click', () => { expandedGroup = expandedGroup === group.id ? null : group.id; makePalette(); $(`[data-expand="${group.id}"]`).focus(); });
    wrapper.append(main, toggle); palette.append(wrapper);
  });
  if (expandedGroup) {
    const group = PALETTE_GROUPS.find(g => g.id === expandedGroup);
    variants.setAttribute('aria-label', group.name);
    const heading = document.createElement('span'); heading.className = 'variants-label'; heading.textContent = group.name; variants.append(heading);
    group.items.forEach(id => { const button = paletteButton(ITEMS.find(i => i.id === id)); button.dataset.variant = group.id; variants.append(button); });
    const hint = document.createElement('p'); hint.className = 'variants-hint';
    hint.textContent = { sea: 'Zeedieren, twee vriendelijke rijdieren en gevaren. R / ↓: opstappen. Op een rijdier: springen omhoog, S omlaag. Zeepaardje: F / X om te blazen.', caves: 'Loop een grot in voor een aparte donkere wereld. Een verborgen grot lijkt op een rotsblok. Sleutels en sloten met dezelfde G-code horen bij elkaar.', mechanisms: 'Liaan: plaats het anker hoog; ← → slingert, springen laat los. Donut: veert en valt 3 seconden na de eerste landing. Blokken bewegen per 3 seconden. Band: klik twee assen; Escape annuleert. Gummen op de band verwijdert de hele band.', terrain: 'Kies grond, baksteen, rotsen, instortende stenen (↓), glijhellingen (↙ / ↘), platforms of lava.', questions: 'Kies wat er in het vraagblok zit. Tik het van onderen aan voor één beloning.', pipes: 'Koppelcodes staan boven de buizen. Houd de opening vrij. Beweeg erin of gebruik S / de buisknop.', stars: 'Gewoon: 10 seconden. Rainbow: 2:00 bescherming en blijvende rainbow schoenen.', enemies: 'Kies een vijand en plaats of sleep hem in je veld.', rewards: 'Muntjes, bloemen, de bubblegun, Jetpack, Achterstevoren, Rainbowfart, het kattenbelletje en de dino voor jullie avontuur.' }[group.id];
    variants.append(hint);
  }
}
function itemDescription(item) {
  const variations = item.id === 2 || item.id === 1 && level.theme === 'grass';
  return item.description + (variations ? ' Het spel kiest willekeurig een variant met passende aansluitranden.' : '');
}
function updatePaletteButton(button, item) {
  button.dataset.item = item.id; button.title = itemDescription(item);
  button.classList.toggle('active', selected === item.id); button.setAttribute('aria-pressed', selected === item.id);
  const image = button.querySelector('canvas'); image.getContext('2d').clearRect(0, 0, 40, 40);
  drawTile(image.getContext('2d'), item.id, 3, 3, 34, level.theme, { icon: true, character });
  const group = PALETTE_GROUPS.find(g => g.id === button.dataset.groupMain);
  button.querySelector('span').textContent = group && ['sea', 'terrain', 'questions', 'enemies', 'rewards', 'mechanisms', 'caves'].includes(group.id) ? group.name : item.name;
  button.setAttribute('aria-label', group && ['sea', 'terrain', 'questions', 'enemies', 'rewards', 'mechanisms', 'caves'].includes(group.id) ? `${group.name}: ${item.name}` : item.name);
}
function paletteButton(item) {
    const button = document.createElement('button'); button.className = `palette-item${selected === item.id ? ' active' : ''}`;
    button.dataset.item = item.id; button.title = itemDescription(item); button.setAttribute('aria-pressed', selected === item.id);
    const image = document.createElement('canvas'); image.width = 40; image.height = 40; image.setAttribute('aria-hidden', 'true');
    drawTile(image.getContext('2d'), item.id, 3, 3, 34, level.theme, { icon: true, character });
    const text = document.createElement('span'); text.textContent = item.name;
    button.append(image, text); button.disabled = !!game;
    button.addEventListener('click', () => {
      selectItem(Number(button.dataset.item));
      if (button.dataset.variant) { const groupId = button.dataset.variant; expandedGroup = null; makePalette(); $(`[data-group-main="${groupId}"]`).focus(); }
    });
    button.addEventListener('pointerdown', event => {
      if (game || event.button !== 0) return;
      const id = Number(button.dataset.item);
      selectItem(id); event.preventDefault(); button.setPointerCapture(event.pointerId);
      paletteDrag = { id, x: event.clientX, y: event.clientY, moved: false, ghost: null, pointerId: event.pointerId };
    });
    button.addEventListener('pointermove', event => {
      if (!paletteDrag || paletteDrag.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - paletteDrag.x, event.clientY - paletteDrag.y) > 6) paletteDrag.moved = true;
      if (!paletteDrag.moved) return;
      if (!paletteDrag.ghost) {
        const ghost = document.createElement('canvas'); ghost.width = 42; ghost.height = 42; ghost.className = 'drag-ghost'; ghost.setAttribute('aria-hidden', 'true');
        drawTile(ghost.getContext('2d'), paletteDrag.id, 0, 0, 42, level.theme, { icon: true }); document.body.append(ghost); paletteDrag.ghost = ghost;
      }
      paletteDrag.ghost.style.left = `${event.clientX - 21}px`; paletteDrag.ghost.style.top = `${event.clientY - 21}px`;
      const point = worldPoint(event); hover = point ? { ...point, id: selected } : null;
      if (point) {
        const box = scroll.getBoundingClientRect(); if (event.clientX > box.right - 35) scroll.scrollLeft += 12; if (event.clientX < box.left + 35) scroll.scrollLeft -= 12;
      }
    });
    button.addEventListener('pointerup', event => {
      if (!paletteDrag) return;
      const point = worldPoint(event);
      if (point && paletteDrag.moved) { if (paletteDrag.id === 48) placeBeltAxis(point); else { remember(); putTile(point.x, point.y, paletteDrag.id); changed(); } }
      endDrag();
    });
    button.addEventListener('pointercancel', endDrag);
    return button;
}
function endDrag() { paletteDrag?.ghost?.remove(); paletteDrag = null; hover = null; }
function selectCharacter(next) {
  if (game || !Object.hasOwn(CHARACTER_NAMES, next)) return;
  selectedCustomCharacter = null; character = next; makePalette(); updateUI(); persist(); toast(`Je speelt nu als ${CHARACTER_NAMES[character]}!`);
}
const characterOptions = $('.character-options');
characterOptions.replaceChildren();
for (const profile of Object.values(CHARACTER_PROFILES)) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'character-option'; button.dataset.character = profile.id;
  button.setAttribute('aria-pressed', String(profile.id === character));
  const image = document.createElement('img'); image.src = assetURL(profile.portrait); image.alt = ''; image.width = 48; image.height = 48;
  const label = document.createElement('span'); label.textContent = profile.name;
  button.append(image, label); button.addEventListener('click', () => selectCharacter(profile.id));
  characterOptions.append(button);
}
$('#character-button').addEventListener('click', () => selectCharacter(nextCharacter(character)));
const classicCharacterOptions = $('.saved-characters .menu-actions');
classicCharacterOptions.replaceChildren();
for (const profile of Object.values(CHARACTER_PROFILES)) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'button';
  button.dataset.classicCharacter = profile.id; button.textContent = `Speel als ${profile.name}`;
  classicCharacterOptions.append(button);
}
const characterMaker = setupCharacterMaker({
  getState: () => ({ characters: customCharacters, selected: selectedCustomCharacter }),
  save(id, appearance) {
    if (!appearance) return false;
    if (!id && customCharacters.length >= 24) { toast('Er zijn al 24 helden. Kies een bestaande held om aan te passen.'); return false; }
    const previous = customCharacters, previousSelection = selectedCustomCharacter;
    const nextId = id || globalThis.crypto?.randomUUID?.() || `hero-${Date.now()}`;
    customCharacters = id ? customCharacters.map(entry => entry.id === id ? { id, appearance } : entry) : [...customCharacters, { id: nextId, appearance }];
    selectedCustomCharacter = nextId;
    if (!persist()) { customCharacters = previous; selectedCustomCharacter = previousSelection; return false; }
    makePalette(); updateUI(); toast(`Je speelt nu als ${appearance.name}!`); return true;
  },
  useClassic: selectCharacter,
  close: () => canvas.focus({ preventScroll: true })
});
$('#character-maker-button').addEventListener('click', async () => {
  if (game || room) return;
  try { await characterMaker.open(); closeMenu(); }
  catch (error) { toast(error.message); }
});

let pendingCharacterLaunch = null;
function chooseStartingCharacter(launch) {
  if (room || roomBusy) return;
  closeMenu();
  const list = $('#starting-character-list');
  list.replaceChildren();
  const choices = [
    ...Object.entries(CHARACTER_NAMES).map(([id, name]) => ({ id, name })),
    ...customCharacters.map(entry => ({ id: entry.id, name: entry.appearance.name, appearance: entry.appearance }))
  ];
  for (const choice of choices) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'character-option';
    const selected = choice.appearance ? selectedCustomCharacter === choice.id : !selectedCustomCharacter && character === choice.id;
    button.setAttribute('aria-pressed', String(selected));
    const image = document.createElement('img'); image.width = 56; image.height = 56; image.alt = '';
    image.src = choice.appearance ? characterPortrait(choice.appearance) : characterPortraits[choice.id] || assetURL(CHARACTER_PROFILES[choice.id].portrait);
    const name = document.createElement('span'); name.textContent = choice.name;
    button.append(image, name);
    button.addEventListener('click', () => {
      if (choice.appearance) { selectedCustomCharacter = choice.id; makePalette(); updateUI(); persist(); }
      else selectCharacter(choice.id);
      const next = pendingCharacterLaunch; pendingCharacterLaunch = null;
      $('#starting-character-dialog').close(); next?.();
    });
    list.append(button);
  }
  pendingCharacterLaunch = launch;
  $('#starting-character-dialog').showModal();
  (list.querySelector('[aria-pressed="true"]') || list.firstElementChild)?.focus();
}
$('#starting-character-dialog').addEventListener('close', () => { pendingCharacterLaunch = null; });
$('#starting-character-dialog').addEventListener('keydown', event => {
  const direction = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 }[event.key];
  if (!direction) return;
  const buttons = [...$('#starting-character-list').children];
  const index = buttons.indexOf(document.activeElement);
  if (index < 0) return;
  event.preventDefault(); buttons[(index + direction + buttons.length) % buttons.length].focus();
});

function selectItem(id) {
  if (id !== selected) beltStart = null;
  selected = id; setTool('paint');
  const group = PALETTE_GROUPS.find(g => g.items.includes(id));
  if (group) {
    groupSelections[group.id] = id;
    const main = $(`[data-group-main="${group.id}"]`); if (main) updatePaletteButton(main, ITEMS.find(i => i.id === id));
  }
  for (const button of $$('.palette-item')) { const active = Number(button.dataset.item) === id; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); }
  $('#item-description').textContent = itemDescription(ITEMS.find(item => item.id === id));
}
function setTool(next) {
  if (next !== tool) beltStart = null;
  tool = next;
  for (const button of $$('[data-tool]')) { const active = button.dataset.tool === tool; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); }
  canvas.style.cursor = tool === 'erase' ? 'cell' : 'crosshair';
}
function worldPoint(event) {
  const box = canvas.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
  if (event.clientX < viewport.left || event.clientX >= viewport.right || event.clientY < viewport.top || event.clientY >= viewport.bottom - 5) return null;
  const { x, y } = viewportWorldPoint(event.clientX, event.clientY, box, scroll.scrollLeft, scroll.scrollTop, worldDisplayWidth / level.width);
  return x >= 0 && x < level.width && y >= 0 && y < level.tiles.length ? { x, y } : null;
}
function placeBeltAxis(point) {
  if (!beltStart) { beltStart = point; toast('Eerste as staat klaar. Klik het tweede vakje voor de lopende band.'); return; }
  try {
    const next = validateBelts([...(level.belts || []), { a: beltStart, b: point }], level.width, level.tiles.length);
    remember(); level.belts = next; beltStart = null; changed(); toast('Lopende band geplaatst! Druk op Spelen om mee te liften.');
  } catch (error) { toast(error.message); }
}
const enemyEditor = setupEnemyEditor({
  onSave(target, design) {
    if (game || level.tiles[target.y]?.[target.x] !== target.tileId) throw new Error('Dit onderdeel staat niet meer op deze plek.');
    const next = clone(level); saveEnemyDesign(next, target.x, target.y, design);
    remember(); level = next; changed(); toast('Je eigen onderdeel is bewaard!');
  },
  onError: message => toast(message)
});
function editEnemy(point) {
  const tileId = level.tiles[point.y]?.[point.x];
  if (!canEditDesign(tileId)) { toast('Klik op een vijand, ster, bloem of kettingobject in je veld.'); return; }
  hover = null; beltStart = null;
  enemyEditor.open({ ...point, tileId, theme: level.theme, name: ITEMS.find(item => item.id === tileId).name, design: level.enemyDesigns?.find(e => e.x === point.x && e.y === point.y)?.design });
}
function putTile(x, y, id) {
  if (id === 48) return;
  if (id === 0 && level.belts) level.belts = level.belts.filter(b => !beltNearCell(b, x, y));
  const footprint=structureFootprint(id);
  if(structureIs(id,'moving-wall')){
    if(x+footprint.width>level.width||y+footprint.height>level.tiles.length){toast(`Het blok heeft ${footprint.width} bij ${footprint.height} vrije vakjes binnen het veld nodig.`);return;}
    for(let yy=y;yy<y+footprint.height;yy++)for(let xx=x;xx<x+footprint.width;xx++)if(structureIs(level.tiles[yy][xx],'start')||structureIs(level.tiles[yy][xx],'finish')){toast('Houd de startplek en de finish vrij.');return;}
  }
  for(const tile of structureTiles('moving-wall'))for(const anchor of positions(level,tile)){
    const other=structureFootprint(tile);
    if(x<anchor.x+other.width&&x+footprint.width>anchor.x&&y<anchor.y+other.height&&y+footprint.height>anchor.y)level.tiles[anchor.y][anchor.x]=0;
  }
  if(structureIs(id,'moving-wall'))for(let yy=y;yy<y+footprint.height;yy++)for(let xx=x;xx<x+footprint.width;xx++)level.tiles[yy][xx]=0;

  if (level.tiles[y][x] === id) { pruneEnemyDesigns(level); return; }
  if(structureIs(id,'start')||structureIs(id,'finish'))for(const point of structureTiles(structureProfile(id).kind).flatMap(tile=>positions(level,tile))) level.tiles[point.y][point.x] = 0;
  level.tiles[y][x] = id;
  pruneEnemyDesigns(level);
}
canvas.addEventListener('pointerdown', event => {
  if (game || (event.button !== 0 && event.button !== 2)) return;
  const point = worldPoint(event); if (!point) return;
  event.preventDefault(); canvas.focus({ preventScroll: true });
  if (event.button === 0 && (tool === 'enemy' || tool === 'paint' && selected !== 48 && canEditDesign(level.tiles[point.y][point.x]))) { editEnemy(point); return; }
  canvas.setPointerCapture(event.pointerId);
  if (event.button === 0 && tool === 'paint' && selected === 48) { placeBeltAxis(point); hover = { ...point, id: 48 }; return; }
  beltStart = null;
  remember(); stroke = { id: event.button === 2 || tool === 'erase' ? 0 : selected, last: point, pointerId: event.pointerId };
  putTile(point.x, point.y, stroke.id); hover = { ...point, id: stroke.id }; updateUI();
});
canvas.addEventListener('pointermove', event => {
  if (game) return;
  const point = worldPoint(event); hover = point && tool !== 'enemy' && !canEditDesign(level.tiles[point.y][point.x]) ? { ...point, id: tool === 'erase' ? 0 : selected } : null;
  if (!stroke || !point || stroke.pointerId !== event.pointerId) return;
  const dx = point.x - stroke.last.x, dy = point.y - stroke.last.y, steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i++) putTile(Math.round(stroke.last.x + dx * (steps ? i / steps : 0)), Math.round(stroke.last.y + dy * (steps ? i / steps : 0)), stroke.id);
  stroke.last = point;
});
function endStroke() { if (stroke) { stroke = null; changed(); } }
canvas.addEventListener('pointerup', endStroke); canvas.addEventListener('pointercancel', endStroke);
canvas.addEventListener('lostpointercapture', endStroke);
canvas.addEventListener('pointerleave', () => { hover = null; }); canvas.addEventListener('contextmenu', event => event.preventDefault());
scroll.addEventListener('wheel', event => {
  if (game || event.ctrlKey || (level.tiles.length > ROWS && !event.shiftKey) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (worldDisplayWidth <= scroll.clientWidth) return;
  event.preventDefault(); scroll.scrollLeft += event.deltaY;
}, { passive: false });
const slider = document.createElement('input'); slider.type = 'range'; slider.id = 'position-slider'; slider.min = 0; slider.value = 0; slider.setAttribute('aria-label', 'Scroll naar een andere plek in je level');
$('.canvas-footer').insertBefore(slider, $('.canvas-footer').lastElementChild);
slider.addEventListener('input', () => { scroll.scrollLeft = Number(slider.value); });
scroll.addEventListener('scroll', () => { slider.value = scroll.scrollLeft; verticalSlider.value = scroll.scrollTop; });
const verticalSlider = $('#vertical-position-slider');
verticalSlider.addEventListener('input', () => { scroll.scrollTop = Number(verticalSlider.value); });
new ResizeObserver(updateUI).observe(scroll);
document.addEventListener('fullscreenchange', updateUI);
for (const button of $$('[data-tool]')) button.addEventListener('click', () => { if (!game) setTool(button.dataset.tool); });
for (const button of $$('[data-category]')) button.addEventListener('click', () => {
  category = button.dataset.category; for (const tab of $$('[data-category]')) tab.classList.toggle('active', tab === button); makePalette();
});
for (const button of $$('[data-theme]')) button.addEventListener('click', () => {
  if (game || button.dataset.theme === level.theme) return;
  remember(); level.theme = button.dataset.theme; makePalette(); changed();
});
$('#level-name').addEventListener('change', () => { remember(); level.name = $('#level-name').value.trim() || 'Mijn avontuur'; changed(); });
$('#level-name').addEventListener('input', () => { $('#save-status').textContent = 'Naam wijzigen…'; });
function undo(redo = false) {
  beltStart = null;
  if (game) return;
  const source = redo ? redoStack : undoStack, target = redo ? undoStack : redoStack;
  if (!source.length) return; target.push(clone(level)); level = source.pop(); hover = null; changed(); makePalette();
}
$('#undo').addEventListener('click', () => undo()); $('#redo').addEventListener('click', () => undo(true));
$('#grid-button').addEventListener('click', () => { grid = !grid; $('#grid-button').setAttribute('aria-pressed', grid); $('#grid-button').innerHTML = `<span aria-hidden="true">▦</span> Raster ${grid ? 'aan' : 'uit'}`; });
$('#sound-button').addEventListener('click', () => { sound = !sound; $('#sound-button').setAttribute('aria-pressed', sound); $('#sound-button').innerHTML = `<span aria-hidden="true">♫</span> Geluid ${sound ? 'aan' : 'uit'}`; if (sound) { unlockAudio(); playSound('coin'); } });
$('#fullscreen-button').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { toast('Volledig scherm is niet beschikbaar in deze browser.'); }
});
function toggleInterface() {
  const hidden = document.body.classList.toggle('interface-hidden');
  $('#interface-button').setAttribute('aria-pressed', hidden);
  $('#interface-button').setAttribute('aria-label', hidden ? 'Werkbalk tonen' : 'Werkbalk verbergen');
  $('#interface-button').title = `${hidden ? 'Werkbalk tonen' : 'Werkbalk verbergen'} (H)`;
  $('#interface-button').textContent = hidden ? '⌄' : '⌃';
}
$('#interface-button').addEventListener('click', toggleInterface);
$('#menu-button').addEventListener('click', () => { pauseForDialog(); $('#settings-dialog').showModal(); });
function closeMenu() { $('#settings-dialog').close(); }
function confirmAction(title, copy, action, label = 'Doorgaan') {
  closeMenu();
  pauseForDialog(); $('#confirm-title').textContent = title; $('#confirm-copy').textContent = copy; $('#confirm-action').textContent = label; pendingConfirmation = action; $('#confirm-dialog').showModal();
}
$('#confirm-action').addEventListener('click', () => { $('#confirm-dialog').close(); const action = pendingConfirmation; pendingConfirmation = null; action?.(); });
$('#level-width').addEventListener('change', () => {
  const width = Number($('#level-width').value);
  const resize = () => {
    const previous = clone(level); remember(); beltStart = null; level = resizeLevel(level, width);
    for (const id of [10, 11]) if (positions(previous, id).length && !positions(level, id).length) {
      const x = id === 10 ? 2 : width - 4;
      const floor = level.tiles.length - 3;
      for (let y = floor - 2; y <= floor; y++) level.tiles[y][x] = 0;
      level.tiles[floor][x] = id;
    }
    changed(); scroll.scrollLeft = Math.min(scroll.scrollLeft, worldDisplayWidth);
  };
  if (width < level.width) { $('#level-width').value = level.width; confirmAction('Een kleiner avontuur?', 'De blokjes rechts buiten de nieuwe breedte verdwijnen. Een startplek of finish die daar staat, verplaatsen we. Je kunt dit ongedaan maken.', resize, 'Maak kleiner'); }
  else resize();
});
$('#level-height').addEventListener('change', () => {
  const height = Number($('#level-height').value) + (level.undergroundDepth || 0);
  const resize = () => {
    const previous = clone(level); remember(); beltStart = null; level = resizeLevel(level, level.width, height);
    for (const id of [10, 11]) if (positions(previous, id).length && !positions(level, id).length) {
      const x = id === 10 ? 2 : level.width - 4, y = height - 3;
      for (let row = y - 2; row <= y; row++) level.tiles[row][x] = 0;
      level.tiles[y][x] = id;
    }
    changed(); scroll.scrollTop = (height - (level.undergroundDepth || 0) - ROWS) * worldDisplayHeight / height; hover = null;
  };
  if (height < level.tiles.length) {
    $('#level-height').value = level.tiles.length - (level.undergroundDepth || 0);
    confirmAction('Een lager veld?', 'De bovenste rijen buiten de nieuwe hoogte verdwijnen. Een startplek of finish die daar staat, verplaatsen we naar beneden. Je kunt dit ongedaan maken.', resize, 'Maak lager');
  } else resize();
});
$('#level-depth').addEventListener('change', () => {
  const depth = Number($('#level-depth').value), oldDepth = level.undergroundDepth || 0;
  const resize = () => {
    const previous = clone(level); remember(); beltStart = null; level = resizeUnderground(level, depth);
    for (const id of [10,11]) if (positions(previous,id).length && !positions(level,id).length) {
      const x = id === 10 ? 2 : level.width - 4, y = level.tiles.length - 3;
      for (let row=y-2;row<=y;row++) level.tiles[row][x] = 0;
      level.tiles[y][x] = id;
    }
    changed(); hover = null;
    scroll.scrollTop = Math.max(0, (level.tiles.length - depth - ROWS) * worldDisplayHeight / level.tiles.length);
    toast(depth ? 'De holte is klaar. Gum een doorgang door de grond en scroll naar beneden.' : 'De onderwereld is weggehaald.');
  };
  if (depth < oldDepth) {
    $('#level-depth').value = oldDepth;
    confirmAction('De onderwereld minder diep maken?', 'De onderste rijen verdwijnen. Een startplek of finish daar verplaatsen we. Je kunt dit ongedaan maken.', resize, 'Pas diepte aan');
  } else resize();
});
$('#random-level-button').addEventListener('click', () => {
  if (game || room) return;
  replaceLevel(randomLevel(Number($('#new-level-width').value), Number($('#new-level-height').value), $('#new-level-theme').value));
  makePalette(); toast('Je willekeurige veld is klaar! Je vorige veld staat bij Ongedaan maken.');
});
$('#new-level-form').addEventListener('submit', event => {
  event.preventDefault();
  if (game || room) return;
  const next = blankLevel(Number($('#new-level-width').value), Number($('#new-level-height').value));
  next.name = $('#new-level-name').value.trim() || 'Mijn nieuwe avontuur';
  next.theme = $('#new-level-theme').value;
  confirmAction('Een nieuw avontuur?', `Je maakt ‘${next.name}’ in ${THEMES[next.theme]} van ${next.width} × ${next.tiles.length} blokjes. Je huidige veld kun je terughalen met Ongedaan maken.`, () => {
    replaceLevel(seedTerrainLevel(next)); makePalette(); toast('Je nieuwe veld is klaar. Veel bouwplezier!');
  }, 'Maak nieuw veld');
});
$('#general-help-button').addEventListener('click', () => $('#help-button').click());
for (const button of $$('[data-example]')) button.addEventListener('click', () => confirmAction('Dit voorbeeld verbouwen?', 'Het voorbeeld wordt je nieuwe bouwveld. Je vorige veld kun je terughalen met Ongedaan maken.', () => { replaceLevel(seedTerrainLevel(exampleLevel(button.dataset.example))); makePalette(); toast('Veel bouwplezier! Maak dit voorbeeld helemaal van jullie.'); }, 'Open voorbeeld'));
$('#save-button').addEventListener('click', () => {
  if (library.length >= 100) { toast('Je hebt 100 levels. Download of verwijder eerst een level.'); return; }
  const entry = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, saved: Date.now(), level: clone(level) };
  library.unshift(entry); if (!persist()) { library.shift(); return; }
  closeMenu();
  updateUI(); toast(`‘${level.name}’ staat nu in Mijn levels!`);
});
function showLibrary() {
  closeMenu();
  library = normalizeLibrary(library);
  pauseForDialog(); const list = $('#library-list'); list.replaceChildren();
  if (!library.length) { const empty = document.createElement('p'); empty.className = 'dialog-note'; empty.textContent = 'Nog geen levels. Bouw iets moois en klik op Bewaar level!'; list.append(empty); }
  for (const entry of library) {
    const row = document.createElement('div'); row.className = 'library-row';
    const info = document.createElement('div'), name = document.createElement('strong'), detail = document.createElement('small');
    name.textContent = entry.level.name;
    detail.textContent = `${THEMES[entry.level.theme]} · ${savedLevelDetail(entry)}`;
    info.append(name, detail);
    const actions = document.createElement('div'); actions.className = 'library-actions';
    const load = document.createElement('button'); load.className = 'button'; load.textContent = 'Open'; load.setAttribute('aria-label', `Open ${entry.level.name}`);
    load.addEventListener('click', () => { $('#library-dialog').close(); replaceLevel(entry.level); makePalette(); toast('Level geopend. Klaar om te spelen of te verbouwen!'); });
    const remove = document.createElement('button'); remove.className = 'icon-button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Verwijder ${entry.level.name}`);
    remove.addEventListener('click', () => {
      $('#library-dialog').close(); confirmAction('Dit level verwijderen?', `‘${entry.level.name}’ verdwijnt uit Mijn levels. Een gedownload bestand blijft gewoon bestaan.`, () => { const previous = library; library = library.filter(item => item.id !== entry.id); if (!persist()) library = previous; updateUI(); showLibrary(); }, 'Verwijder');
    });
    actions.append(load, remove); row.append(info, actions); list.append(row);
  }
  $('#library-dialog').showModal();
}
$('#library-button').addEventListener('click', showLibrary);
$('#help-button').addEventListener('click', () => { closeMenu(); pauseForDialog(); $('#help-dialog').showModal(); });
for (const button of $$('[data-close]')) button.addEventListener('click', () => button.closest('dialog').close());
for (const dialog of $$('dialog')) dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
$('#export-button').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(level, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `${level.name.replace(/[^a-zA-Z0-9à-ÿ -]/g, '').trim() || 'mijn-level'}.bravios.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Je level wordt gedownload. Je kunt het op een ander apparaat openen.');
});
$('#import-button').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 150000) throw new Error('Dit bestand is te groot voor een level.');
    const imported = validateLevel(JSON.parse(await file.text()));
    confirmAction('Levelbestand openen?', `Open ‘${imported.name}’ als nieuw bouwveld. Je huidige veld kun je terughalen met Ongedaan maken.`, () => { replaceLevel(imported); makePalette(); toast('Levelbestand geopend!'); }, 'Open level');
  } catch (error) { toast(error instanceof SyntaxError ? 'Dit bestand bevat geen geldig level. Kies een .bravios.json-bestand.' : error.message); }
  event.target.value = '';
});
function unlockAudio() {
  if (!sound) return;
  try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); audioContext.resume(); } catch { /* Sound is optional. */ }
}
function playSound(event) {
  if (!sound || !audioContext) return;
  const melodies = { coin: [880, 1320], jump: [280, 440], spring: [320, 660, 880], parachute: [330, 550, 770], stomp: [160, 100], break: [120, 80], powerup: [440, 550, 660, 880], star: [660, 880, 1100, 1320], rainbow: [523, 659, 784, 1046, 1318, 1568], rainbowfart: [130, 165, 220, 330, 523, 784], bell: [1568, 2093, 1568], pipe: [440, 330, 220], catinstinct: [740, 988], catrescue: [440, 880], rainbowrescue: [659, 1046], bubbleshoot: [420, 650], rocketintro: [523, 659, 784, 1046], rockettick: [660], rocketlaunch: [110, 220, 440, 880], rocketdetach: [880, 660], reverse: [880, 740, 659, 440, 523, 784], bubblecatch: [550, 880, 1100], shoot: [240, 130], freeze: [1200, 900, 1500], hammer: [180, 260], explode: [90, 65, 45], respawn: [440, 660], cave: [440, 330, 220], key: [880, 1100, 1320], unlock: [330, 660, 990], rockland: [110, 75], helpergift: [523, 659, 784, 1046], helmet: [330, 440, 660], mount: [330, 490], dismount: [490, 330], robotjump: [100, 160], tongue: [220, 180], hurt: [190, 140], dead: [330, 280, 220, 140], win: [523, 659, 784, 1046] };
  const notes = melodies[event] || [];
  notes.forEach((hz, i) => {
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), at = audioContext.currentTime + i * .09;
    oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(hz, at); gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(.09, at + .01); gain.gain.exponentialRampToValueAtTime(.0001, at + .13);
    oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(at); oscillator.stop(at + .15);
  });
}
function resetInput() { controllerInput = emptyGamepadControls(); keys.clear(); touchKeys.clear(); pendingActions.clear(); input = { left: false, right: false, jump: false, fire: false, mount: false, pipe: false }; }
function queueAction(action) {
  if (action === 'left' || action === 'right') pendingActions.delete(action === 'left' ? 'right' : 'left');
  pendingActions.add(action);
  if (room?.role === 'guest' && action in tapCounts) tapCounts[action]++;
}
function updateInput() {
  const touches = [...touchKeys.values()];
  input = { left: keys.has('ArrowLeft') || keys.has('KeyA') || touches.includes('left'), right: keys.has('ArrowRight') || keys.has('KeyD') || touches.includes('right'), jump: keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW') || touches.includes('jump'), fire: keys.has('KeyF') || keys.has('KeyX') || touches.includes('fire'), mount: keys.has('KeyR') || keys.has('ArrowDown') || touches.includes('mount'), pipe: keys.has('ArrowDown') || keys.has('KeyS') || touches.includes('pipe') };
  for (const action of Object.keys(controllerInput)) input[action] ||= controllerInput[action];
}
function updatePowers() {
  const p = game?.player;
  const powers = [];
  if (p?.helperGift) powers.push(`Cadeautje van je paddenstoelenvriend: ${ITEMS.find(item => item.id === p.helperGift.id)?.name || 'beloning'}!`);
  if (p?.star > 0) powers.push(`★ Onoverwinnelijk: ${Math.ceil(p.star)} s`);
  if (p?.rainbow > 0) { const seconds = Math.ceil(p.rainbow); powers.push(`🌈 Rainbow: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`); }
  if (p?.rainbowFart > 0) powers.push(`🌈 Rainbowfart: ${Math.ceil(p.rainbowFart)} s · je spoor verslaat vijanden`);
  if (p?.rainbowShoes) powers.push('🌈 Rainbow schoenen');
  if (p?.cat) powers.push(p.instinct > 0 ? '🐱 Jachtinstinct neemt even over!' : '🐱 Kat · hoge sprong & redding uit gaten');
  if (game?.reversed) powers.push(game.reverseReturnPipe ? 'Achterstevoren · terug naar de startvlag via de nieuwe buis · ↓ / S' : 'Achterstevoren · de finish staat nu bij de oude start!');
  if (p?.bubblegun) powers.push('Bubblegun · F / X · vang tegenstanders in luchtbellen');
  if (p?.fire) powers.push('✿ Vuurballen · F / X');
  if (p?.ice) powers.push('❄ IJsballen · F / X');
  if (p?.rocketStage) powers.push(p.rocketStage === 'fuse' ? `Jetpack · ${rocketCountdown(p)} · klaar voor de lancering!` : 'Jetpack · lancering naar boven!');
  if (p?.parachute) powers.push('Parachute · rustig dalen · stuur met ← →');
  if (p?.shellHelmet) powers.push('Schildpadhelm · beschermt tegen één vijandaanraking');
  if (p?.mounted) powers.push('Dino · R / ↓ afstappen');
  if (p?.mounted?.kind === 'dolphin' || p?.mounted?.kind === 'seahorse') powers.push('R / ↓: afstappen · springen: omhoog · S: omlaag' + (p.mounted.kind==='seahorse' ? ' · F / X: wegblazen' : ''));
  if (isWaterTheme(game?.theme)) powers.push('≈ Houd springen vast om omhoog te zwemmen');
  const status = powers.join(' · ');
  if ($('#power-status').textContent !== status) $('#power-status').textContent = status;
  $('#power-status').hidden = !status;
  $('#touch-fire').hidden = !p?.fire && !p?.ice && !p?.bubblegun;
  $('#touch-fire').textContent = p?.bubblegun ? 'Bellen ○' : p?.ice ? 'IJs ❄' : 'Vuur ●';
  $('#touch-fire').setAttribute('aria-label', p?.bubblegun ? 'Schiet een luchtbel' : p?.ice ? 'Gooi een ijsbal' : 'Gooi een vuurbal');
  const shell = game && nearbyShell(game);
  $('#touch-mount').hidden = !shell && !game?.dinos.some(d => d.alive);
  $('#touch-mount').textContent = shell ? 'Helm ↓' : p?.mounted ? 'Afstap ↓' : 'Dino ↓';
  $('#touch-mount').setAttribute('aria-label', shell ? 'Zet het schild op als helm' : 'Stap op of van de dino');
  const nearby = p && !p.respawn && !p.mounted && game.dinos.some(d => d.alive && !game.players?.some(other => other.mounted === d) && d.grounded && Math.abs(d.x - p.x) < 46 && Math.abs(d.y + d.h - p.y - p.h) < 38);
  const pipe = game && pipeUnderPlayer(game);
  $('#touch-pipe').hidden = !game?.tiles.some(row => row.some(id => ['in', 'both'].includes(PIPE_TYPES[id]?.mode)));
  const lockedCave = game && positions({ tiles: game.tiles }, 63).some(d => Math.abs(p.x + p.w / 2 - (d.x + .5) * TILE) < 40 && Math.abs(p.y + p.h - (d.y + 1) * TILE) < 40);
  $('#context-hint').hidden = !p?.vineId && !nearby && !pipe && !shell && !lockedCave;
  $('#context-hint').textContent = p?.vineId ? '← → · Slinger! Springen · Loslaten' : lockedCave ? 'Grot op slot · Zoek de sleutel' : pipe ? pipe.to ? `${{ up: '↓', down: '↑', left: '→', right: '←' }[PIPE_TYPES[pipe.from.id].opening]} / S · Ga de buis in` : 'Deze buis heeft nog geen uitgang' : shell ? 'R / ↓ · Zet het schild op als helm' : 'R / ↓ · Stap op de dino';
  $('#network-status').hidden = !room;
  $('#field-status').hidden = wonderlandIndex === null && adventureIndex === null && campaignIndex === null && !game?.challenge && game?.caveState?.active == null;
  $('#field-status').textContent = wonderlandIndex !== null ? `Wonderland · ${WONDERLAND_FIELDS[wonderlandIndex].name} · ${[wonderlandStatus(game),wonderEncounterHint(game)||WONDERLAND_FIELDS[wonderlandIndex].hint].filter(Boolean).join(' · ')}` : adventureIndex !== null ? `De avonturiers · ${adventureIndex + 1}. ${ADVENTURE_FIELDS[adventureIndex].name}${adventureLaunching ? ' · Raketlancering' : ''}` : game?.caveState?.active != null ? 'Grot · De uitgang is links' : campaignIndex !== null ? `${campaignKind === 'crazy' ? 'Gek veld' : 'Veld'} ${campaignIndex + 1} / 10 · ${currentFields()[campaignIndex].name}` : game?.challenge ? activeLevel().name : '';
  if (room) $('#network-status').textContent = `${room.code} · Jij bent ${(p?.appearance?.name || CHARACTER_NAMES[p?.character || character])}${p?.respawn > 0 ? ' · Terug bij de start…' : ''}`;
}
function updateGameHud() {
  if (!game) return;
  // Status widgets scan the world for nearby items; 15 updates/s keeps them current
  // without forcing those scans and DOM writes into every render frame.
  if (game.state === 'playing' && game.events.length === 0 && game.time >= lastHudTime && game.time - lastHudTime < 1 / 15) return;
  lastHudTime = game.time;
  $('#coin-count').textContent = game.challenge?.kind === 'coin-race' && game.players ? game.players.map(p => `${(p.appearance?.name || CHARACTER_NAMES[p.character])} ● ${p.coins || 0}`).join(' · ') : `● ${game.coins}${game.challenge?.kind === 'coin-team' ? ` / ${game.challenge.target}` : ''}`;
  const remaining = game.challenge ? game.challenge.seconds - game.time : 0;
  const seconds = game.challenge ? remaining > 1e-8 ? Math.ceil(remaining) : 0 : Math.floor(game.time);
  $('#game-time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  if (game.pSwitch) $('#game-time').textContent += ` · P ${Math.ceil(game.pSwitch.remaining)}s`;
  if (adventureIndex !== null) {
    const boss = game.enemies.find(e => e.boss && e.alive);
    $('#coin-count').textContent += ` · Tas ● ${adventure.coins} · ♥ ${adventure.lives}${boss ? ' · Eindbaas ♥ '+boss.hp : ''}`;
  }
  updatePowers();
}
function startGame() {
  endStroke(); endDrag(); beltStart = null;
  try {
    if (room?.role === 'guest') return;
    game = room ? createCoopGame(networkLevel, character) : createGame(networkLevel || playLevel || level);
    if (room) {
      game.players[0].appearance = normalizeAppearance(selectedAppearance());
      game.players[1].appearance = normalizeAppearance(remotePacket.appearance);
    } else game.player.appearance = normalizeAppearance(selectedAppearance());
    if (wonderlandIndex !== null) prepareWonderlandGame(game, wonderlandIndex);
    if (adventureIndex !== null) {
      if (adventureLaunching) {
        Object.assign(game.player, { rocketStage: 'fuse', rocketFuse: 6.6, rocketLastCount: 6 }); game.rocketIntro = 2.4;
      } else { prepareAdventureGame(game, adventureIndex, adventure); adventure.power = null; persist(); }
    }
    if (room && !guestPresent) game.state = 'waiting';
  } catch (error) { toast(error.message); return; }
  prepareGameUI();
}
function prepareGameUI() {
  viewedRoom = null; keyCameraOrigin = null; lastHudTime = -1;
  resetInput(); accumulator = 0; hover = null; unlockAudio();
  sceneEffects.reset(game);
  $('#game-overlay').hidden = true; $('#game-hud').hidden = false; $('#mode-label').textContent = 'SPEELMODUS';
  $('#play-button').innerHTML = room ? 'Kamer verlaten' : '<span aria-hidden="true">▦</span> Verder bouwen'; $('#restart-button').hidden = false;
  $('#pause-button').hidden = false; $('#pause-button').disabled = false;
  $('#canvas-hint').textContent = 'Spring op vijanden om ze te verslaan';
  $('#touch-controls').hidden = false; slider.disabled = true; scroll.style.overflowX = 'hidden'; scroll.style.overflowY = 'hidden';
  updateUI();
  scroll.scrollLeft = Math.max(0, (game.player.x / (activeLevel().width * TILE) * worldDisplayWidth) - scroll.clientWidth / 3);
  cameraPosition = scroll.scrollLeft;
  scroll.scrollTop = Math.max(0, game.player.y * worldDisplayHeight / (activeLevel().tiles.length * TILE) - scroll.clientHeight * .6);
  updateUI(); updateGameHud(); canvas.focus({ preventScroll: true });
}
function stopGame() {
  if (!game) return;
  room?.close(); room = null; networkLevel = null; guestPresent = false; remotePacket = {}; remoteTaps = {};
  $('#room-dialog').close();
  wonderlandIndex = null;
  adventureIndex = null; adventureLaunching = false; adventureGameOver = false;
  worldPlaying = null;
  game = null; playLevel = null; campaignIndex = null; resetInput(); $('#game-overlay').hidden = true; $('#game-hud').hidden = true;
  sceneEffects.reset();
  $('#mode-label').textContent = 'BOUWMODUS'; $('#play-button').innerHTML = '<span aria-hidden="true">▶</span> Speel je level'; $('#restart-button').hidden = true;
  $('#pause-button').hidden = true;
  $('#canvas-hint').innerHTML = '<span aria-hidden="true">↔</span> Scroll opzij voor méér avontuur';
  $('#touch-controls').hidden = true; $('#context-hint').hidden = true; slider.disabled = false; scroll.style.overflowX = 'auto'; scroll.style.overflowY = 'auto'; updateUI();
}
function showResult() {
  if (!game) return;
  resetInput(); const state = game.state;
  $('#pause-button').disabled = room?.role === 'guest' || state !== 'paused';
  $('#game-overlay').hidden = false;
  $('#result-icon').textContent = state === 'won' ? '✦' : state === 'paused' ? 'Ⅱ' : '↻';
  $('#result-title').textContent = state === 'won' ? 'Hoera, de finish!' : state === 'paused' ? 'Even pauze' : 'Nog een sprong proberen?';
  $('#result-copy').textContent = state === 'won' ? `${room ? 'Jullie hebben' : 'Jij hebt'} ${game.coins} van de ${game.totalCoins} muntjes verzameld in ${Math.floor(game.time)} seconden.` : state === 'paused' ? (room?.role === 'guest' ? 'De andere speler heeft gepauzeerd. Jullie gaan samen verder.' : 'Je avontuur wacht op je. Ga verder wanneer je er klaar voor bent.') : 'Oefening baart helden. Probeer het opnieuw of maak je level iets makkelijker.';
  $('#retry-button').disabled = room?.role === 'guest';
  $('#return-button').textContent = room ? 'Kamer verlaten' : 'Verder bouwen';
  $('#retry-button').textContent = state === 'paused' ? 'Verder spelen ▶' : 'Nog een keer';
  $('#next-level').hidden = state !== 'won' || campaignIndex === null || campaignIndex >= currentFields().length - 1;
  if (state === 'won' && campaignIndex !== null) {
    if (campaignKind === 'crazy') {
      crazyProgress = Math.max(crazyProgress, Math.min(campaignIndex + 1, CRAZY_FIELDS.length - 1));
      if (campaignIndex === CRAZY_FIELDS.length - 1) crazyCompleted = true;
    } else {
      campaignProgress = Math.max(campaignProgress, Math.min(campaignIndex + 1, CAMPAIGN_FIELDS.length - 1));
      if (campaignIndex === CAMPAIGN_FIELDS.length - 1) campaignCompleted = true;
    }
    persist();
    $('#result-title').textContent = campaignIndex === 9 ? (campaignKind === 'crazy' ? 'Alle 10 gekke velden uitgespeeld!' : 'Alle 10 velden uitgespeeld!') : `Veld ${campaignIndex + 1} gehaald!`;
    $('#result-copy').textContent += campaignIndex === 9 ? ' Boaz en Ravi zijn echte avonturiers!' : ' Klaar voor het volgende avontuur?';
  }
  if (adventureIndex !== null) {
    const index = adventureIndex;
    $('#return-button').textContent = 'Terug naar de wereldkaart';
    $('#next-level').hidden = state !== 'won';
    $('#next-level').textContent = 'Verder op de wereldkaart ▶';
    if (!game.adventureSettled && state === 'won') {
      completeAdventure(adventure, index, game.coins); game.adventureSettled = true; persist();
    } else if (!game.adventureSettled && state === 'dead') {
      game.adventureSettled = true;
      if (adventure.lives > 0) adventure.lives--; else adventureGameOver = true;
      persist();
    }
    if (state === 'won') {
      $('#result-title').textContent = index === 11 ? 'De lavakoning is verslagen!' : `${ADVENTURE_FIELDS[index].name} gehaald!`;
      $('#result-copy').textContent += ' Je nieuwe routes staan op de wereldkaart. Muntjes tellen bij de eerste voltooiing mee voor je tas.';
    } else if (state === 'dead') {
      $('#result-copy').textContent = adventureGameOver ? 'Je levens zijn op. Rust even uit op de wereldkaart; daarna begin je met drie nieuwe extra levens.' : `Je hebt nog ${adventure.lives} extra levens. Probeer dit veld opnieuw of bezoek een winkel.`;
      if (adventureGameOver) $('#retry-button').textContent = 'Naar de wereldkaart';
    }
  } else $('#next-level').textContent = 'Volgend veld ▶';
  if (wonderlandIndex !== null) {
    $('#return-button').textContent = 'Terug naar Wonderland';
    $('#next-level').hidden = state !== 'won';
    $('#next-level').textContent = 'Verder door Wonderland ▶';
    if (state === 'won' && !game.wonderlandSettled) {
      completeWonderland(wonderland, wonderlandIndex); game.wonderlandSettled = true; persist();
      $('#result-title').textContent = wonderlandIndex === 14 ? 'Wonderland is gered!' : `${WONDERLAND_FIELDS[wonderlandIndex].name} gehaald!`;
      $('#result-copy').textContent += ' '+(game.wonderland.bossOutcome||'')+' Volg de nieuwe fonkelende routes op de kaart.';
    }
  }
  if (worldPlaying) {
    $('#return-button').textContent = 'Terug naar mijn wereld';
    $('#next-level').hidden = state !== 'won';
    $('#next-level').textContent = 'Verder op mijn wereldkaart ▶';
    if (state === 'won' && !game.worldSettled) {
      const world = worlds.find(w => w.id === worldPlaying.worldId);
      if (world && !world.completed.includes(worldPlaying.nodeId)) world.completed.push(worldPlaying.nodeId);
      game.worldSettled = true; persist();
    }
  }
  if (state === 'won' && game.challenge) {
    const result = challengeResult(game), players = game.players || [game.player];
    if (result.kind === 'coin-race') {
      $('#result-title').textContent = players.length === 1 ? 'Muntjesjacht klaar!' : result.winners.length > 1 ? 'Gelijkspel!' : `${(players[result.winners[0]].appearance?.name || CHARACTER_NAMES[players[result.winners[0]].character])} wint!`;
      $('#result-copy').textContent = players.map((p, i) => `${(p.appearance?.name || CHARACTER_NAMES[p.character || character])}: ${result.scores[i]} muntjes`).join(' · ');
    } else {
      $('#result-title').textContent = result.success ? 'Samen de schat gevonden!' : 'Nog een gezamenlijke poging?';
      $('#result-copy').textContent = `${game.coins} van de ${game.challenge.target} muntjes verzameld in ${Math.floor(game.time)} seconden.`;
    }
  }
}
const worldEditor = setupWorldEditor({
  worlds: () => worlds, selectedWorld: () => selectedWorldId,
  selectWorld: id => { selectedWorldId = id; }, save: persist, warn: toast, confirm: confirmAction,
  editField: (world, node) => {
    const backup = worldDraftBackup || clone(level);
    replaceLevel(node.level);
    worldDraftBackup = backup; worldEditing = { worldId: world.id, nodeId: node.id };
    undoStack = []; redoStack = []; makePalette(); updateUI(); persist();
    toast(`Je richt ‘${node.level.name}’ in. Gebruik Wereldkaart om terug te gaan.`);
    canvas.focus({ preventScroll: true });
  },
  playField: (world, node) => {
    if (!positions(node.level,10).length || !positions(node.level,11).length) {
      toast('Plaats eerst een startplek en een finishvlag in dit veld.');
      worldEditor.open('edit',world.id); return;
    }
    worldPlaying = { worldId: world.id, nodeId: node.id };
    playLevel = clone(node.level); campaignIndex = null; startGame();
  }
});
function openWorldMap(mode = 'edit') {
  if (room || roomBusy) { toast('Verlaat eerst de speelkamer om je wereld te openen.'); return; }
  const context = worldPlaying || worldEditing;
  syncWorldDraft();
  if (worldEditing && worldDraftBackup) {
    const backup = clone(worldDraftBackup); replaceLevel(backup); undoStack = []; redoStack = []; makePalette();
  } else stopGame();
  if (context) selectedWorldId = context.worldId;
  closeMenu(); persist(); updateUI(); worldEditor.open(mode);
}
$('#world-menu-edit').addEventListener('click',() => openWorldMap('edit'));
$('#world-menu-play').addEventListener('click',() => openWorldMap('play'));
$('#back-to-world').addEventListener('click',() => openWorldMap(worldPlaying ? 'play' : 'edit'));
const smallGames = setupSmallGames({services:{hero,drawTile},participants:count=>participantRoster(count,{character,appearance:selectedAppearance()})});
const encounterFlow=createPlatformEncounters({
  getGame:()=>game,isOnline:()=>!!room||roomBusy,
  participants:()=>participantRoster(1,{character:game?.player.character||character,appearance:game?.player.appearance||selectedAppearance()}),
  release(){
    resetInput();accumulator=0;gameDepthCache.dispose();gameBackgroundRaster.dispose();
    releasePlatformSprites();releaseCharacterComposites();canvas.width=1;canvas.height=1;
  },
  restore(){resetInput();accumulator=0;lastTime=performance.now();updateUI();canvas.focus({preventScroll:true});},
  launch:request=>smallGames.play(request)
});
// Entry point for future pipe/door encounters. Rewards remain the caller's responsibility.
async function startMiniGameEncounter(gameId,origin,options={}){
  return encounterFlow.enter(gameId,origin,options);
}
let homeIndex = 0;
const homeButtons = () => $$('[data-home]');
function openHome() {
  pauseForDialog();
  $('[data-home-progress="wonderland"]').textContent = `${wonderland.completed.length} / ${WONDERLAND_FIELDS.length} velden gehaald`;
  $('[data-home-progress="adventure"]').textContent = `${adventure.completed.length} / 12 velden gehaald`;
  $('[data-home-progress="regular"]').textContent = campaignCompleted ? 'Alle 10 gehaald · speel opnieuw' : `Verder bij veld ${campaignProgress + 1} van 10`;
  $('[data-home-progress="crazy"]').textContent = crazyCompleted ? 'Alle 10 gehaald · speel opnieuw' : `Verder bij veld ${crazyProgress + 1} van 10`;
  $('#start-screen').showModal();homeButtons()[homeIndex].focus();
}
function moveHome(direction) {
  const delta = {left:-1,right:1,up:-2,down:2}[direction];
  homeIndex=(homeIndex+delta+homeButtons().length)%homeButtons().length;homeButtons()[homeIndex].focus();
}
$('#home-button').addEventListener('click',openHome);
$('#start-screen').addEventListener('focusin',event=>{const i=homeButtons().indexOf(event.target);if(i>=0)homeIndex=i;});
$('#start-screen').addEventListener('keydown',event=>{const dir={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.code];if(dir){event.preventDefault();moveHome(dir);}});
for(const button of homeButtons())button.addEventListener('click',()=>{
  $('#start-screen').close();
  const kind=button.dataset.home;
  if(!['settings','builder'].includes(kind))stopGame();
  const launch = () => {
  if(kind==='wonderland')wonderlandMap.open();
  else if(kind==='adventure')adventureMap.open();
  else if(kind==='worlds')openWorldMap('edit');
  else if(kind==='regular')startCampaign(campaignCompleted?0:campaignProgress,'regular',false);
  else if(kind==='crazy')startCampaign(crazyCompleted?0:crazyProgress,'crazy',false);
  else if(kind==='minis')smallGames.open();
  else if(kind==='builder'){stopGame();canvas.focus();}
  else {
    $('#settings-dialog').showModal();
    if(kind==='together') { const section=$('[data-section="together"]').closest('details');section.open=true;section.parentElement.closest('details').open=true; }
  }
  };
  if(['wonderland','adventure','regular','crazy','minis','worlds','together'].includes(kind))chooseStartingCharacter(launch);
  else launch();
});
const wonderlandMap = setupWonderlandMap({state:()=>wonderland,save:persist,launch:startWonderland});
function returnWonderlandMap() { stopGame(); wonderlandMap.open(); }
function startWonderland(index) {
  if(game || room || !wonderlandUnlocked(wonderland,index))return;
  wonderlandIndex=index; wonderland.position=index; campaignIndex=null;
  playLevel=seedTerrainLevel(wonderlandLevel(index)); persist(); startGame();
}
$('#wonderland-start').addEventListener('click',()=>{if(game||room)return;chooseStartingCharacter(()=>wonderlandMap.open());});
const adventureMap = setupAdventureMap({ state: () => adventure, save: persist, launch: startAdventure, character: () => character, appearance: selectedAppearance });
function returnAdventureMap() {
  const exhausted = adventureGameOver; stopGame();
  if (exhausted) { adventure.lives = 3; persist(); }
  adventureMap.open();
}
function startAdventure(index) {
  if (game || room || !adventureUnlocked(adventure, index)) return;
  adventureIndex = index; adventure.position = index; campaignIndex = null;
  adventureLaunching = ADVENTURE_FIELDS[index].kind === 'moon'; adventureGameOver = false;
  if (adventure.lives === 0) adventure.lives = 3;
  if (adventureLaunching) {
    playLevel = blankLevel(40); playLevel.name = 'Raketbasis · Op weg naar de maan';
    playLevel.tiles[13][7] = 44;
  } else playLevel = seedTerrainLevel(adventureLevel(index));
  persist(); startGame();
}
$('#adventure-start').addEventListener('click', () => { if (game || room) return; chooseStartingCharacter(()=>adventureMap.open()); });
function startCampaign(index, kind = 'regular', choose = true) {
  if (game || room) return;
  if (choose) { chooseStartingCharacter(() => startCampaign(index, kind, false)); return; }
  closeMenu(); campaignKind = kind; campaignIndex = index; playLevel = seedTerrainLevel(currentCampaignLevel(index)); startGame();
}
function makePlayMenu() {
  CAMPAIGN_FIELDS.forEach((field, i) => {
    const button = document.createElement('button'); button.className = 'campaign-field'; button.dataset.campaign = i;
    const title = document.createElement('strong'); title.textContent = `${i + 1}. ${field.name}`;
    const hint = document.createElement('small'); hint.textContent = field.hint;
    const image = document.createElement('canvas'); image.width = 320; image.height = 140; image.dataset.campaignPreview = i; image.setAttribute('aria-hidden', 'true');
    button.append(image, title, hint); $('#campaign-fields').append(button);
  });
  CRAZY_FIELDS.forEach((field, i) => {
    const button = document.createElement('button'); button.className = 'campaign-field'; button.dataset.crazy = i;
    const title = document.createElement('strong'); title.textContent = `${i + 1}. ${field.name}`;
    const hint = document.createElement('small'); hint.textContent = field.hint;
    const image = document.createElement('canvas'); image.width = 320; image.height = 140; image.dataset.crazyPreview = i; image.setAttribute('aria-hidden', 'true');
    button.append(image, title, hint); $('#crazy-fields').append(button);
  });
  TOGETHER_FIELDS.forEach(field => {
    const card = document.createElement('article'); card.className = 'together-card';
    const title = document.createElement('h3'); title.textContent = field.name;
    const hint = document.createElement('p'); hint.textContent = field.hint;
    const actions = document.createElement('div'); actions.className = 'menu-actions';
    const practice = document.createElement('button'); practice.className = 'button'; practice.dataset.together = field.id; practice.textContent = 'Alleen oefenen';
    const together = document.createElement('button'); together.className = 'button primary'; together.dataset.togetherRoom = field.id; together.textContent = 'Maak een kamer';
    actions.append(practice, together); card.append(title, hint, actions); $('#together-fields').append(card);
  });
}
makePlayMenu();
$('#campaign-start').addEventListener('click', () => startCampaign(campaignCompleted ? 0 : campaignProgress));
$('#crazy-start').addEventListener('click', () => startCampaign(crazyCompleted ? 0 : crazyProgress, 'crazy'));
for (const button of $$('[data-crazy]')) button.addEventListener('click', () => startCampaign(Number(button.dataset.crazy), 'crazy'));
$('#next-level').addEventListener('click', () => {
  if (wonderlandIndex !== null) { returnWonderlandMap(); return; }
  if (worldPlaying) { openWorldMap('play'); return; }
  if (adventureIndex !== null) { returnAdventureMap(); return; }
  if (game?.state !== 'won' || campaignIndex === null || campaignIndex >= 9) return;
  campaignIndex++; playLevel = seedTerrainLevel(currentCampaignLevel(campaignIndex)); startGame();
});
for (const button of $$('[data-campaign]')) button.addEventListener('click', () => startCampaign(Number(button.dataset.campaign)));
for (const button of $$('[data-together]')) button.addEventListener('click', () => {
  if (game || room) return;
  chooseStartingCharacter(() => { playLevel = seedTerrainLevel(togetherLevel(button.dataset.together)); startGame(); });
});
for (const button of $$('[data-together-room]')) button.addEventListener('click', () => enterRoom('create', '', seedTerrainLevel(togetherLevel(button.dataset.togetherRoom))));
function togglePause() {
  if (room?.role === 'guest') return;
  if (!game || (game.state !== 'playing' && game.state !== 'paused')) return;
  if (game.state === 'playing') { game.state = 'paused'; showResult(); }
  else { game.state = 'playing'; resetInput(); $('#game-overlay').hidden = true; canvas.focus({ preventScroll: true }); }
}
function pauseForDialog() { if (game?.state === 'playing') togglePause(); }
$('#play-button').addEventListener('click', () => worldPlaying ? openWorldMap('play') : game ? stopGame() : chooseStartingCharacter(startGame));
$('#restart-button').addEventListener('click', startGame);
$('#pause-button').addEventListener('click', togglePause);
$('#retry-button').addEventListener('click', () => adventureGameOver ? returnAdventureMap() : game?.state === 'paused' ? togglePause() : startGame());
$('#return-button').addEventListener('click', () => wonderlandIndex !== null ? returnWonderlandMap() : worldPlaying ? openWorldMap('play') : adventureIndex !== null ? returnAdventureMap() : stopGame());
function roomError(message = '') { $('#room-error').textContent = message; $('#room-error').hidden = !message; }
function showRoom() {
  closeMenu(); roomError();
  $('#join-room-form').hidden = !!room; $('#room-details').hidden = !room;
  if (room) { $('#room-code').textContent = room.code; $('#start-room').hidden = room.role === 'guest'; }
  $('#room-dialog').showModal();
}
function receiveRoom(result) {
  if (!room) return;
  if (result.reconnecting) { $('#network-status').textContent = `${room.code} · Verbinding herstellen…`; return; }
  if (room.role === 'host') {
    guestPresent = result.guestPresent; remotePacket = result.input || {};
    if (guestPresent) game.players[1].appearance = normalizeAppearance(remotePacket.appearance);
    $('#room-message').textContent = guestPresent ? `${(game.players[1].appearance?.name || CHARACTER_NAMES[game.players[1].character])} is aangesloten. Jullie kunnen samen spelen!` : 'Wachten op de tweede speler…';
    $('#start-room').disabled = !guestPresent || game.state === 'playing';
    if (!guestPresent && game.state === 'playing') togglePause();
  } else {
    $('#room-message').textContent = 'Je bent aangesloten. De andere speler start het avontuur.';
    if (!result.hostPresent) { $('#network-status').textContent = `${room.code} · Wachten op de andere speler…`; return; }
    if (result.snapshot && result.frame > lastRoomFrame) {
      lastRoomFrame = result.frame;
      const previous = game.state, previousAppearance = JSON.stringify(game.player.appearance);
      game = unpackCoopGame(result.snapshot);
      if (JSON.stringify(game.player.appearance) !== previousAppearance) updateUI();
      if (game.state === 'playing') { $('#game-overlay').hidden = true; $('#room-dialog').close(); }
      else if (game.state !== previous && ['paused', 'won'].includes(game.state)) showResult();
      updateGameHud();
    }
  }
}
async function enterRoom(action, code = '', sourceLevel = level) {
  if (roomBusy || room || game) return;
  roomBusy = true; roomError(); updateUI(); $('#join-room-form button').disabled = true;
  try {
    if (action === 'create') createGame(sourceLevel);
    const sharedLevel = clone(sourceLevel);
    const result = await roomRequest(action === 'create' ? { action, level: sharedLevel, character } : { action, code });
    networkLevel = action === 'create' ? sharedLevel : validateLevel(result.level);
    guestPresent = false; remotePacket = {}; remoteTaps = {}; lastRoomFrame = -1;
    Object.assign(tapCounts, { jump: 0, fire: 0, mount: 0, pipe: 0 });
    game = result.snapshot ? unpackCoopGame(result.snapshot) : createCoopGame(networkLevel, action === 'create' ? character : result.character);
    if (!result.snapshot) game.state = 'waiting';
    if (action === 'join') game.player = game.players[1];
    else game.players[0].appearance = normalizeAppearance(selectedAppearance());
    room = new RoomConnection(result,
      () => room.role === 'host' ? { snapshot: packCoopGame(game) } : { input: { ...input, appearance: selectedAppearance(), taps: { ...tapCounts } } },
      receiveRoom, error => { stopGame(); toast(error.message || 'De verbinding is verbroken. Maak een nieuwe kamer.'); });
    prepareGameUI(); showRoom();
    $('#room-message').textContent = room.role === 'host' ? 'Wachten op de tweede speler…' : 'Je bent aangesloten. De andere speler start het avontuur.';
    $('#start-room').disabled = true;
    room.poll();
  } catch (error) { roomError(error.message); toast(error.message); }
  finally { roomBusy = false; $('#join-room-form button').disabled = false; updateUI(); }
}
$('#create-room').addEventListener('click', () => enterRoom('create'));
$('#join-room').addEventListener('click', showRoom);
$('#show-room').addEventListener('click', showRoom);
$('#join-room-form').addEventListener('submit', event => { event.preventDefault(); enterRoom('join', $('#room-code-input').value.trim().toUpperCase()); });
$('#start-room').addEventListener('click', () => {
  if (room?.role !== 'host' || !guestPresent) return;
  if (game.state === 'paused') togglePause(); else startGame();
  $('#room-dialog').close(); $('#start-room').disabled = true;
});
$('#leave-room').addEventListener('click', stopGame);
document.addEventListener('keydown', event => {
  if (event.code === 'F9' && !event.repeat) {
    event.preventDefault(); toggleDepthLayers(); return;
  }
  if (event.code === 'F8' && !event.repeat) {
    event.preventDefault(); frameRateOutput.hidden = !frameRateOutput.hidden;
    renderProbeControls.hidden = frameRateOutput.hidden;
    frameRateMeter.reset(); frameRateOutput.textContent = 'FPS meten…'; return;
  }
  if ($('#world-shell').inert) return;
  if ($('dialog[open]') || event.target.matches('input,select,textarea')) return;
  if (!game && beltStart && event.code === 'Escape') { beltStart = null; toast('Plaatsen van de band geannuleerd.'); return; }
  if (!game && expandedGroup && event.code === 'Escape') {
    const groupId = expandedGroup; expandedGroup = null; makePalette(); $(`[data-expand="${groupId}"]`).focus(); return;
  }
  if (!event.ctrlKey && !event.metaKey && event.code === 'KeyH') { toggleInterface(); return; }
  if (event.code === 'Escape') { togglePause(); return; }
  if (game) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyF', 'KeyX', 'KeyR', 'Space'].includes(event.code)) {
      event.preventDefault();
      if (game.state === 'playing' && !keys.has(event.code) && actionKeys[event.code]) queueAction(actionKeys[event.code]);
      if (game.state === 'playing' && !keys.has(event.code) && event.code === 'ArrowDown') queueAction('mount');
      keys.add(event.code); updateInput();
    }
  } else {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') { event.preventDefault(); undo(event.shiftKey); }
    else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyY') { event.preventDefault(); undo(true); }
    else if (!event.ctrlKey && !event.metaKey && event.code === 'KeyV') setTool('enemy');
    else if (!event.ctrlKey && !event.metaKey && event.code === 'KeyB') setTool('paint');
    else if (!event.ctrlKey && !event.metaKey && event.code === 'KeyE') setTool('erase');
  }
});
document.addEventListener('keyup', event => { keys.delete(event.code); updateInput(); });
for (const button of $$('[data-key]')) {
  button.addEventListener('pointerdown', event => { if (!game || game.state !== 'playing') return; event.preventDefault(); button.setPointerCapture(event.pointerId); touchKeys.set(event.pointerId, button.dataset.key); if (['left', 'right', 'jump', 'fire', 'mount', 'pipe'].includes(button.dataset.key)) queueAction(button.dataset.key); updateInput(); });
  const release = event => { touchKeys.delete(event.pointerId); updateInput(); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
}
window.addEventListener('blur', () => { resetInput(); pauseForDialog(); endStroke(); endDrag(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { resetInput(); pauseForDialog(); persist(); } });
window.addEventListener('pagehide', () => { persist(); room?.close(); });
function pollController() {
  const characterOpen = $('#starting-character-dialog').open;
  const wonderOpen = wonderlandMap.isOpen(), mapOpen = adventureMap.isOpen(), homeOpen = $('#start-screen').open, miniOpen = smallGames.isOpen();
  const enabled = !document.hidden && document.hasFocus() && (characterOpen || wonderOpen || mapOpen || homeOpen || miniOpen || !$('#world-shell').inert && !$('dialog[open]') && !document.activeElement?.matches('input,select,textarea'));
  const sample = controller.poll(navigator, enabled);
  const secondMiniSample = secondMiniController.poll(navigator, enabled && miniOpen, controller.index);
  const status = $('#controller-status');
  const label = sample.status === 'connected' ? `Controller verbonden: ${sample.name}`
    : sample.status === 'unsupported' ? 'Deze controller heeft geen standaardindeling. Gebruik een controller met Xbox- of PlayStation-indeling.'
    : sample.status === 'unavailable' ? 'Controller niet beschikbaar. Open Bravios via HTTPS of localhost en probeer opnieuw.'
    : 'Verbind je controller en druk op een knop om hem te activeren.';
  if (status.textContent !== label) status.textContent = label;
  if (characterOpen) {
    controllerInput = emptyGamepadControls(); updateInput();
    const buttons = [...$('#starting-character-list').children];
    for (const action of sample.pressed) {
      const direction = { left: -1, right: 1, up: -1, pipe: 1 }[action];
      const index = Math.max(0, buttons.indexOf(document.activeElement));
      if (direction) buttons[(index + direction + buttons.length) % buttons.length]?.focus();
      else if (action === 'jump' || action === 'pause') buttons[index]?.click();
      else if (action === 'fire') $('#starting-character-dialog').close();
    }
    return;
  }
  if (homeOpen || miniOpen) {
    controllerInput=emptyGamepadControls();updateInput();
    if(miniOpen)smallGames.handleController(sample, secondMiniSample);
    else for(const action of sample.pressed) { const dir={left:'left',right:'right',up:'up',pipe:'down'}[action];if(dir)moveHome(dir);else if(action==='jump'||action==='pause')homeButtons()[homeIndex].click();else if(action==='fire')$('#start-screen').close(); }
    return;
  }
  if (wonderOpen) { wonderlandMap.handleController(sample); controllerInput = emptyGamepadControls(); updateInput(); return; }
  if (mapOpen) { adventureMap.handleController(sample); controllerInput = emptyGamepadControls(); updateInput(); return; }
  if (sample.pressed.includes('pause')) {
    if (!game) startGame();
    else togglePause();
  } else if (sample.pressed.includes('jump') && game && ['won', 'dead'].includes(game.state) && room?.role !== 'guest') {
    if (!$('#next-level').hidden) $('#next-level').click();
    else $('#retry-button').click();
  }
  controllerInput = game?.state === 'playing' ? sample.controls : emptyGamepadControls();
  updateInput();
  if (game?.state === 'playing') {
    for (const action of sample.pressed) if (['left', 'right', 'jump', 'fire', 'mount', 'pipe'].includes(action)) queueAction(action);
  }
}
function animate(timestamp) {
  if (!frameRateOutput.hidden && !document.hidden) {
    const measurement = frameRateMeter.sample(timestamp);
    if (measurement) frameRateOutput.textContent = `${measurement.fps.toFixed(1)} FPS · langste beeld ${Math.round(measurement.longestMs)} ms` + (renderProbe ? ` · dieptelagen ${depthLayers ? 'aan' : 'uit'} · achtergrond ${lightBackground ? (gameBackgroundRaster.failedSize ? '100% (terugval)' : `${Math.round(backgroundResolutionScale * 100)}%`) : '100%'} · ${canvas.width}×${canvas.height} · laatste spel/UI ${renderProbeCost.logicMs.toFixed(1)} ms · tekenaanroepen ${renderProbeCost.drawMs.toFixed(1)} ms` : '');
  }
  const probeStarted = renderProbe ? performance.now() : 0;
  pollController();
  const elapsed = Math.min((timestamp - lastTime) / 1000 || 0, .05); lastTime = timestamp;
  if (game?.state === 'playing') {
    if (room?.role !== 'guest') {
      game.bubbleViewTop = scroll.scrollTop / (worldDisplayWidth / (activeLevel().width * TILE));
      const reach = scroll.clientWidth / (worldDisplayWidth / (activeLevel().width * TILE)) * .5;
      for (const p of game.players || [game.player]) p.fartLength = reach;
    }
    accumulator += room?.role === 'guest' ? 0 : elapsed;
    while (accumulator >= 1 / 120 && game.state === 'playing') {
      // Keep quick taps until the next physics step, even if released between frames.
      const stepInput = { ...input };
      for (const action of pendingActions) stepInput[action] = true;
      pendingActions.clear();
      if (room) stepCoopGame(game, [stepInput, remoteControls(remotePacket, remoteTaps)], 1 / 120);
      else stepGame(game, stepInput, 1 / 120);
      accumulator -= 1 / 120;
      for (const event of game.events) playSound(event);
    }
    if (adventureLaunching && !game.player.rocketStage && game.rocketIntro <= 0) {
      adventureLaunching = false; playLevel = seedTerrainLevel(adventureLevel(adventureIndex)); startGame();
    }
    const roomView = game.caveState?.active ?? 'outside';
    if (viewedRoom !== roomView) { viewedRoom = roomView; updateUI(); sceneEffects.reset(game); cameraPosition = 0; scroll.scrollTop = 0; }
    cameraPosition = followCamera(cameraPosition, game.player, worldDisplayWidth / (activeLevel().width * TILE), scroll.clientWidth, worldDisplayWidth, elapsed, motionPreference.matches);
    scroll.scrollLeft = cameraPosition;
    const scale = worldDisplayHeight / (activeLevel().tiles.length * TILE);
    scroll.scrollTop = Math.max(0, Math.min(worldDisplayHeight - scroll.clientHeight, (game.player.y + game.player.h / 2) * scale - scroll.clientHeight * .6));
    if (game.keyReveal) {
      keyCameraOrigin ||= { x: scroll.scrollLeft, y: scroll.scrollTop };
      const door = game.keyReveal.door;
      const target = { x: Math.max(0, Math.min(worldDisplayWidth - scroll.clientWidth, (door.x + .5) * TILE * scale - scroll.clientWidth / 2)), y: Math.max(0, Math.min(worldDisplayHeight - scroll.clientHeight, (door.y + .5) * TILE * scale - scroll.clientHeight / 2)) };
      const frame = keyCameraFrame(game.keyReveal, keyCameraOrigin, target, motionPreference.matches);
      scroll.scrollLeft = frame.x; scroll.scrollTop = frame.y; cameraPosition = frame.x;
    } else keyCameraOrigin = null;
    sceneEffects.observe(game, motionPreference.matches);
    updateGameHud();
    if (game.state !== 'playing') showResult();
  } else accumulator = 0;
  if ($('#start-screen').open || smallGames.isOpen() || document.hidden) { gameDepthCache.dispose(); gameBackgroundRaster.dispose(); renderQuality.reset(); requestAnimationFrame(animate); return; }
  if ($('dialog[open]')) renderQuality.reset();
  // Keep the raster fixed during the layer comparison: change one variable only.
  else if (!renderProbe && renderQuality.observe(timestamp, screenDensity)) resizeWorldRaster();
  const pixelsPerUnit = worldDisplayWidth / (activeLevel().width * TILE);
  const probeDrawStarted = renderProbe ? performance.now() : 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(renderResolution, 0, 0, renderResolution, -scroll.scrollLeft * screenDensity, -scroll.scrollTop * screenDensity);
  gameDepthCache.scale = renderResolution * backgroundResolutionScale;
  drawWorld(ctx, activeLevel(), { grid, game, beltStart, time: game ? game.time : timestamp / 1000, hover, character, effects: sceneEffects, reducedMotion: motionPreference.matches, depthLayers, depthPanelCache: lightBackground ? optionalDepthPanels : null, backgroundRaster: lightBackground ? gameBackgroundRaster : null, viewport: { left: scroll.scrollLeft / pixelsPerUnit, right: (scroll.scrollLeft + scroll.clientWidth) / pixelsPerUnit, top: scroll.scrollTop / pixelsPerUnit, bottom: (scroll.scrollTop + scroll.clientHeight) / pixelsPerUnit } });
  if (renderProbe) renderProbeCost = { logicMs: probeDrawStarted - probeStarted, drawMs: performance.now() - probeDrawStarted };
  requestAnimationFrame(animate);
}
for (const image of $$('img[data-asset]')) image.src = assetURL(image.dataset.asset);
async function startIllustratedGame() {
  $('#loading-retry').hidden = true;
  $('#loading-status').textContent = 'Je avontuur wordt klaargezet…';
  try {
    await Promise.all([loadLook(), loadCrazyBackgrounds(), loadCharacterArt()]);
    renderResolution = 2;
    for (const name of Object.keys(CHARACTER_PROFILES)) characterPortraits[name] = assetURL(CHARACTER_PROFILES[name].portrait);
    for (const button of $$('[data-character]')) button.querySelector('img').src = characterPortraits[button.dataset.character];
    document.body.classList.add('illustrated-look');
    makePalette(); updateUI();
    for (const canvas of $$('[data-preview]')) preview(canvas, exampleLevel(canvas.dataset.preview));
    preview($('#home-regular-preview'), campaignLevel(0), { focusStart:true });
    preview($('#home-crazy-preview'), crazyLevel(0), { focusStart:true });
    preview($('#home-together-preview'), togetherLevel(), { focusStart:true });
    drawMiniPreview($('#home-mini-preview').getContext('2d'),480,200);
    preview($('#featured-preview'), campaignLevel(0));
    preview($('#crazy-preview'), crazyLevel(0), { focusStart: true });
    for (const image of $$('[data-campaign-preview]')) preview(image, campaignLevel(Number(image.dataset.campaignPreview)), { focusStart: true });
    for (const image of $$('[data-crazy-preview]')) preview(image, crazyLevel(Number(image.dataset.crazyPreview)), { focusStart: true });
    // Reveal only after the first complete frame uses the prepared artwork.
    requestAnimationFrame(timestamp => {
      animate(timestamp);
      $('#world-shell').style.removeProperty('visibility');
      $('#world-shell').inert = false;
      $('#loading-screen').hidden = true;
      openHome();
      if (storageProblem) toast('De vorige sessie kon niet worden geladen. Je kunt een gedownload levelbestand openen.');
    });
  } catch (error) {
    $('#loading-status').textContent = `${error.message}. Probeer de afbeeldingen opnieuw te laden.`;
    $('#loading-retry').hidden = false;
  }
}
$('#loading-retry').addEventListener('click', startIllustratedGame);
startIllustratedGame();
