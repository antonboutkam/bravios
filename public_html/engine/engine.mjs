import { STRUCTURE_CATALOG } from './structures/catalog.mjs';
import { structureProfile, structureSetting, structureIs, structureCollision, structurePipes, structureRewards, structureTiles, structureSolidTile } from './structures/runtime.mjs';
import { ENEMY_CATALOG } from './enemies/catalog.mjs';
import { enemyProfile, enemySetting, stompResponse } from './enemies/runtime.mjs';
import { createFirebars, firebarHits } from './firebars.mjs?v=1';
import { createSwingPlatforms, stepSwingPlatforms, bounceDonut, moveOnVine, clearVine } from './swing-platforms.mjs?v=1';
import { stepWonderFoe, meetWonderFoe, hitWonderFoe, wonderFoeContact, stepWonderExits } from './wonder-foes.mjs?v=1';
import { stepWonderMagic, moveWonderGravity, wonderBodies } from './wonder-magic.mjs?v=7';
import { SEA_ITEMS, SEA_KINDS, SEA_MOUNTS, isWaterTheme, isSeaEnemy, isSeaMount, initSeaEnemy, updateSeaEnemy, seaBodies, seaCurrent, blowSeaEnemies } from './sea-life.mjs?v=4';
import { ENEMY_KINDS, validateEnemyDesigns, pruneEnemyDesigns } from './enemy-design.mjs?v=5';
import { validateBelts, createMechanisms, mechanismBodies, stepMechanisms } from './mechanisms.mjs?v=2';
import { terrainChoice } from './terrain-rules.mjs?v=1';
export const TILE = 32;
export const ROWS = 16;
export const P_SWITCH_SECONDS = structureSetting(80,'durationSeconds',30);
export const P_SWITCH_BLOCKS = new Set(STRUCTURE_CATALOG.filter(c=>c.pSwitchConvertible).flatMap(c=>c.tileIds));
export const STAR_SECONDS = 10;
export const RAINBOW_SECONDS = 120;
export const FREEZE_SECONDS = 4;
export const RAINBOW_FART_SECONDS = 20;
export const REVERSE_INTRO_SECONDS = 2.4;
export const PARACHUTE_DROP = 3 * TILE;
export const PARACHUTE_SPEED = 160;
export const ROCKET_FUSE_SECONDS = 5.6;
export const THEMES = { moon: 'Maanlandschap', grass: 'Groene heuvels', sunset: 'Zonsondergang', night: 'Sterrennacht', castle: 'Binnen in het kasteel', winter: 'Winterlandschap', underwater: 'Onder water', 'underwater-night': 'Onder water bij nacht' };
export const CRAZY_BACKGROUNDS = ['teapots', 'candy', 'space', 'jellyfish'];
export const HELPER_REWARDS = [9, 14, 19, 42, 31, 41];
export const PIPE_TYPES = structurePipes();
export const PIPE_NORMALS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
export const ITEMS = [
  { id: 101, name: 'Vuurmolen', category: 'build', description: 'Vier vlammen draaien in 6 seconden rond een vast anker. Houd rondom drie vakjes vrij. Wacht op een opening of spring via een hoger platform.' },
  { id: 99, name: 'Liaan', category: 'build', description: 'Plaats het anker hoog, met vier vakjes vrije ruimte eronder. Raak de liaan in de lucht om vast te pakken. Links/rechts slingert; springen laat los; ↓ laat je afspringen.' },
  { id: 100, name: 'Donutplatform', category: 'build', description: 'Een verende ring: landen geeft een iets hogere sprong. Vanaf de eerste landing telt hij 3 seconden af en valt dan weg, ook als je al bent afgesprongen.' },
  { id: 97, name: 'Helmtor', category: 'fun', description: 'Een tor met gele helm. Spring erop: hij klapt 3 seconden in en doet dan niets. Daarna springt hij weer op!' },
  { id: 98, name: 'Helmtor met punt', category: 'fun', description: 'Een tor met een punt op zijn gele helm. Je kunt niet veilig op hem springen. Gebruik vuur of ijs, of ontwijk hem.' },
  ...SEA_ITEMS,
  { id: 82, name: 'Stekeleiwolkje', category: 'fun', description: 'Zweeft en gooit stekeleieren. Rode mieren knipperen na 3 seconden en verdwijnen na 5 seconden.' },
  { id: 83, name: 'Duizendpoot', category: 'fun', description: 'Ga op zijn rug staan: hij kijkt boos naar je en rent weg! Pas de lengte aan met Vijand bewerken.' },
  { id: 84, name: 'Kettinghoofd', category: 'build', description: 'Een gek hoofd hopt naar de held, tot de ketting strak staat.' },
  { id: 80, name: 'P-schakelaar', category: 'build', description: 'Ga op de blauwe P staan: vaste blokken worden 30 seconden muntjes en muntjes worden bakstenen. Verzamelde muntjes blijven weg. De schakelaar werkt één keer.' },
  { id: 70, name: 'Ketting · stekelbal', category: 'build', description: 'Een slingerende stekelbal aan een stevig blok.' },
  { id: 71, name: 'Ketting · stekelbal met gezicht', category: 'build', description: 'Een slingerende stekelbal met een boos gezicht.' },
  { id: 72, name: 'Ketting · vuurbal', category: 'build', description: 'Een vurige bal aan een slingerende ketting.' },
  { id: 73, name: 'Ketting · vuurbal met gezicht', category: 'build', description: 'Een vurige kettingbal met een boos gezicht.' },
  { id: 74, name: 'Quad', category: 'fun', description: 'Spring erop of druk dichtbij op R / ↓ om te rijden. Met R / ↓ stap je af.' },
  { id: 75, name: 'Wolkenblok', category: 'build', description: 'Een stevig, zacht uitziend wolkje om op te staan.' },
  { id: 76, name: 'Bonenstaakdoosje', category: 'build', description: 'Spring tegen de onderkant. De doos klapt open en een bonenstaak groeit omhoog. Houd springen vast om te klimmen; ↓ om te dalen.' },
  { id: 77, name: 'Vliegtuigje met piloot', category: 'fun', description: 'Vliegt steeds heen en weer en laat vuurballen vallen.' },

  { id: 62, name: 'Grot · open', category: 'build', description: 'Loop de opening in naar een kleine donkere grot. De deur in de grot brengt je terug. In samenspel reizen jullie samen.' },
  { id: 63, name: 'Grot · op slot', category: 'build', description: 'Zoek eerst de bijbehorende sleutel. De camera laat zien hoe het slot opengaat. Sleutels en sloten koppelen van links naar rechts.' },
  { id: 66, name: 'Grot · verborgen rots', category: 'build', description: 'Een bijna onzichtbare grotingang met dezelfde steenstructuur als een rotsblok. Loop ertegenaan om binnen te gaan. In de ontwerptool zie je een kleine ingangmarkering.' },
  { id: 64, name: 'Grotsleutel', category: 'fun', description: 'Opent één afgesloten grot. Sleutels en sloten koppelen van links naar rechts; de codes tonen welke bij elkaar horen.' },
  { id: 46, name: 'Beweegblok · eerst omhoog', category: 'build', description: 'Een blok van 2 bij 2 vakjes. Beweegt 3 vakjes omhoog in 3 seconden en daarna weer terug.' },
  { id: 47, name: 'Beweegblok · eerst omlaag', category: 'build', description: 'Een blok van 2 bij 2 vakjes. Beweegt 3 vakjes omlaag in 3 seconden en daarna weer terug.' },
  { id: 48, name: 'Lopende band', category: 'build', description: 'Klik twee verschillende vakjes voor de assen. Staande platformen draaien 3 seconden en stoppen 2 seconden. Escape annuleert de eerste as.' },
  { id: 1, name: 'Grond', category: 'build', description: 'De stevige basis voor je avontuur.' },
  { id: 65, name: 'Rotsblok', category: 'build', description: 'Een stevig blok met ruwe steen en scheuren. Bouw er rotswanden, grotten of platforms mee. Het breekt niet als je er van onderen tegen springt.' },
  { id: 67, name: 'Rotsblok · instortend', category: 'build', description: 'Stort kort na het betreden in en blijft weg tot je het level opnieuw start. De pijl omlaag is alleen zichtbaar in de ontwerptool.' },
  { id: 68, name: 'Rotshelling · glijden naar links ↙', category: 'build', description: 'Een stenen helling van 45 graden. Je glijdt vanzelf naar links omlaag. Stapel ze diagonaal voor een lange helling.' },
  { id: 69, name: 'Rotshelling · glijden naar rechts ↘', category: 'build', description: 'Een stenen helling van 45 graden. Je glijdt vanzelf naar rechts omlaag. Stapel ze diagonaal voor een lange helling.' },
  { id: 2, name: 'Baksteen', category: 'build', description: 'Een blok om op te springen. Tik het van onderen kapot!' },
  { id: 3, name: 'Vraagblok · muntje', category: 'build', description: 'Spring er van onderen tegenaan voor een extra muntje.' },
  { id: 5, name: 'Buis', category: 'build', description: 'Een stevig obstakel. Stapel buizen om ze hoger te maken.' },
  { id: 12, name: 'Platform', category: 'build', description: 'Een zwevend blok voor de mooiste sprongen.' },
  { id: 8, name: 'Springveer', category: 'build', description: 'Land op de veer en stuiter extra hoog!' },
  { id: 4, name: 'Muntje', category: 'fun', description: 'Een gouden beloning. Hoeveel kunnen jullie verzamelen?' },
  { id: 61, name: 'Boos stekelrotsblok', category: 'fun', description: 'Hangt stil tot je eronder loopt, valt omlaag en blijft 5 seconden beneden. Gaat daarna weer omhoog. Aanraken kost een leven, ook met een schild of gewone ster.' },
  { id: 6, name: 'Vijand', category: 'fun', description: 'Pas op! Spring op zijn hoofd om hem te verslaan.' },
  { id: 45, name: 'Paddenstoelenmannetje', category: 'fun', description: 'Een vriendelijke helper! Loop naar hem toe voor één cadeautje per speler per veld.' },
  { id: 9, name: 'Paddenstoel', category: 'fun', description: 'Geeft een schild dat je één keer beschermt tegen een vijand.' },
  { id: 7, name: 'Stekels', category: 'fun', description: 'Au! Spring over de stekels heen.' },
  { id: 10, name: 'Startplek', category: 'fun', description: 'Hier begint het avontuur. Elk level heeft één startplek.' },
  { id: 11, name: 'Finishvlag', category: 'fun', description: 'Raak de vlag om te winnen. Elk level heeft één finish.' },
  { id: 14, name: 'Ster', category: 'fun', description: '10 seconden onoverwinnelijk! Raak vijanden om ze te verslaan.' },
  { id: 15, name: 'Vuurbloem', category: 'fun', description: 'Gooi vuurballen met F of X. Op een tablet gebruik je de vuurknop.' },
  { id: 16, name: 'Dino', category: 'fun', description: 'Spring op zijn rug of druk dichtbij op R / ↓. Met R / ↓ stap je weer af.' },
  { id: 17, name: 'Robot', category: 'fun', description: 'Laadt 5 seconden op en springt dan willekeurig naar links of rechts.' },
  { id: 18, name: 'Kikker', category: 'fun', description: 'Steekt 3 seconden zijn tong uit, kruipt daarna 3 seconden langzaam vooruit.' },
  { id: 19, name: 'IJsbloem', category: 'fun', description: 'Gooi ijsballen met F / X. Vijanden bevriezen 4 seconden.' },
  { id: 20, name: 'Rode kikker', category: 'fun', description: 'Een rode kikker: 3 seconden tong uitsteken, daarna 3 seconden kruipen.' },
  { id: 21, name: 'Boze robot', category: 'fun', description: 'Een boze robot: 5 seconden opladen, daarna willekeurig links of rechts springen.' },
  { id: 22, name: 'Schildpad', category: 'fun', description: 'Spring op zijn rug: hij kruipt in zijn schild. Raak het schild om het weg te schoppen.' },
  { id: 23, name: 'Vliegende draak', category: 'fun', description: 'Vliegt heen en weer en beweegt op en neer. Pas op voor zijn vleugels!' },
  { id: 24, name: 'Tweekoppige plant', category: 'fun', description: 'Een vleesetende plant met twee koppen die om de beurt happen. Spring eroverheen!' },
  { id: 25, name: 'Skeletschildpad', category: 'fun', description: 'Valt uit elkaar als je erop springt en staat na 5 seconden weer op. Vuur helpt niet; ijs en sterren wel.' },
  { id: 26, name: 'Lava', category: 'build', description: 'Gloeiendhete lava. Ook met een gewone ster gevaarlijk; alleen rainbow bescherming helpt!' },
  { id: 27, name: 'Dikke stekelschildpad', category: 'fun', description: 'Een dikke boze schildpad met rugstekels. Versla hem met 3 vuurballen of een ster; ijs bevriest hem.' },
  { id: 28, name: 'Hamerschildpad', category: 'fun', description: 'Loopt heen en weer en gooit elke 2 seconden een hamer naar een speler.' },
  { id: 29, name: 'Lopende bom', category: 'fun', description: 'Gaat aftellen als je dichtbij komt. Na 3 seconden ontploft hij. Spring erop of raak hem met vuur voor een kortere lont.' },
  { id: 30, name: 'Rainbow ster', category: 'fun', description: '2:00 onoverwinnelijk, ook tegen lava en gaten! Je houdt rainbow schoenen met een regenboogspoor.' },
  { id: 31, name: 'Kattenbelletje', category: 'fun', description: 'Word een kat: hoge sprongen, redding uit gaten en kort jachtinstinct bij vliegende dingen. Het wordt meteen nacht!' },
  { id: 32, name: 'Buis naar binnen ↓', category: 'build', description: 'Ga bovenop staan en druk ↓. Ingangen en uitgangen worden van links naar rechts gekoppeld. Houd de uitgang vrij.' },
  { id: 33, name: 'Buis naar buiten ↑', category: 'build', description: 'Hier kom je uit een ingang. Houd de ruimte boven de buis vrij; omhoog gaat vanzelf.' },
  { id: 34, name: 'Buis twee richtingen ↕', category: 'build', description: 'Ingang én uitgang. Twee van deze buizen verbinden elkaar. Ga bovenop staan en druk ↓.' },
  { id: 35, name: 'Vraagblok · paddenstoel', category: 'build', description: 'Spring er van onderen tegenaan om één keer de paddenstoel te krijgen.' },
  { id: 36, name: 'Vraagblok · vuurbloem', category: 'build', description: 'Spring er van onderen tegenaan om één keer de vuurbloem te krijgen.' },
  { id: 37, name: 'Vraagblok · ijsbloem', category: 'build', description: 'Spring er van onderen tegenaan om één keer de ijsbloem te krijgen.' },
  { id: 38, name: 'Vraagblok · ster', category: 'build', description: 'Spring er van onderen tegenaan om één keer de ster te krijgen.' },
  { id: 39, name: 'Vraagblok · rainbow ster', category: 'build', description: 'Spring er van onderen tegenaan om één keer de rainbow ster te krijgen.' },
  { id: 44, name: 'Jetpack', category: 'fun', description: 'Een vuurpijl op je rug! Tel af van 5 naar 0, vlieg naar boven en daal met je parachute.' },
  { id: 43, name: 'Achterstevoren', category: 'fun', description: 'Een wervelwind met twee pijlen! Wissel start en finish en loop tot het einde achterstevoren.' },
  { id: 42, name: 'Bubblegun', category: 'fun', description: 'Schiet met F / X luchtbellen die tegenstanders vangen en omhoog laten zweven!' },
  { id: 41, name: 'Rainbowfart', category: 'fun', description: '20 seconden een regenboog aan de hemel en een lang spoor dat vijanden verslaat!' },
  { id: 40, name: 'Vraagblok · kattenbelletje', category: 'build', description: 'Spring er van onderen tegenaan om één keer de kattenbelletje te krijgen.' }
];
// Catalog entries also supply names and new enemy tiles to the editor.
for(const profile of ENEMY_CATALOG)for(const id of profile.tileIds){
  const item=ITEMS.find(item=>item.id===id);
  if(item){item.name=profile.name;if(profile.description)item.description=profile.description;}
  else ITEMS.push({id,name:profile.name,category:'fun',description:profile.description||'Vijand uit de vijandencatalogus.'});
}
for (const [id, pipe] of Object.entries(PIPE_TYPES)) {
  if (Number(id) < 49) continue;
  const direction = { down: 'onder', left: 'links', right: 'rechts' }[pipe.opening];
  const mode = { decoration: '', in: ' · ingang', out: ' · uitgang', both: ' · twee richtingen' }[pipe.mode];
  ITEMS.push({ id: Number(id), name: `Buis opening ${direction}${mode}`, category: 'build', description: pipe.mode === 'decoration' ? `Een stevige buis met de opening naar ${direction}.` : `Opening naar ${direction}. Ingangen en uitgangen koppelen op volgorde; tweerichtingsbuizen per paar. Houd de opening vrij. Beweeg de opening in of gebruik de buisknop / S.` });
}
export const QUESTION_REWARDS = structureRewards();
for(const profile of STRUCTURE_CATALOG)for(const id of profile.tileIds){
 const item=ITEMS.find(item=>item.id===id);
 if(profile.editor.visible){if(item){item.name=profile.name;item.description=profile.description;}else ITEMS.push({id,name:profile.name,description:profile.description,category:'build'});}
}
export const PALETTE_GROUPS = [
  { id: 'sea', name: 'Onderwaterleven', items: SEA_ITEMS.map(item => item.id) },
  { id: 'caves', name: 'Grotten en sleutels', items: [62, 63, 66, 64] },
  { id: 'mechanisms', name: 'Mechanieken', items: [101, 99, 100, 84, 80, 46, 47, 48, 70, 71, 72, 73] },
  { id: 'terrain', name: 'Grond en blokken', items: [1, 2, 65, 67, 68, 69, 75, 12, 26] },
  { id: 'questions', name: 'Vraagblokken', items: [3, 35, 36, 37, 38, 39, 40, 76] },
  { id: 'pipes', name: 'Buizen', items: Object.keys(PIPE_TYPES).map(Number) },
  { id: 'stars', name: 'Sterren', items: [14, 30] },
  { id: 'enemies', name: 'Vijanden', items: ENEMY_CATALOG.filter(c=>c.group==='game'&&!Object.values(SEA_KINDS).includes(c.kind)).flatMap(c=>c.tileIds) },
  { id: 'rewards', name: 'Beloningen', items: [4, 9, 15, 19, 31, 16, 74, 41, 42, 43, 44] }
];
for(const profile of STRUCTURE_CATALOG)if(profile.editor.visible){
 const group=PALETTE_GROUPS.find(g=>g.id===profile.editor.group);
 if(group)for(const id of profile.tileIds)if(!group.items.includes(id))group.items.push(id);
}
const enemyKinds = ENEMY_KINDS;
const solidIds = new Set(STRUCTURE_CATALOG.filter(c=>c.collision.solid&&!['slope','moving-wall','belt','vine','donut','firebar'].includes(c.kind)).flatMap(c=>c.tileIds));
const editableIds = new Set([0, ...ITEMS.filter(item => item.id !== 48).map(item => item.id)]);
export const clone = value => JSON.parse(JSON.stringify(value));
export function seedTerrainLevel(level, random = Math.random) {
  return { ...level, terrainSeed: Math.floor(random() * 4294967296) >>> 0 };
}
export function terrainAppearance(level, x, y, tiles = level.tiles, id = tiles[y]?.[x]) {
  return terrainChoice(tiles, x, y, level.terrainSeed ?? 0, id);
}
export function blankLevel(width = 72, height = ROWS) {
  if (!Number.isInteger(height) || height < ROWS || height > 64) throw new Error('Kies een hoogte van 16 tot 64 blokjes.');
  const level = { version: 1, name: 'Mijn nieuwe avontuur', width, theme: 'grass', tiles: Array.from({ length: height }, () => Array(width).fill(0)) };
  if (height !== ROWS) level.height = height;
  for (let y = height - 2; y < height; y++) level.tiles[y].fill(1);
  level.tiles[height - 3][2] = 10;
  level.tiles[height - 3][width - 4] = 11;
  return level;
}
export function exampleLevel(type = 'first') {
  const level = blankLevel(type === 'first' ? 72 : 72);
  level.name = { first: 'De eerste sprong', coins: 'De muntjesjacht', night: 'Onder de sterren', powers: 'De grote krachtentest', villains: 'Het slechterikenparcours' }[type] || 'Mijn eerste avontuur';
  level.theme = type === 'night' ? 'night' : type === 'coins' ? 'sunset' : 'grass';
  const put = (x, y, id) => { level.tiles[y][x] = id; };
  for (const x of [8, 9, 10, 11, 12]) put(x, 10, x === 10 ? 3 : 2);
  for (const x of [8, 10, 12]) put(x, 8, 4);
  for (const x of [5, 6, 7]) put(x, 12, 4);
  put(17, 13, 5); put(17, 12, 5); put(18, 13, 5); put(18, 12, 5);
  put(23, 13, 6);
  for (const x of [25, 26, 27, 28]) put(x, 10, 12);
  put(26, 9, 9); put(28, 8, 4);
  put(32, 13, 8);
  for (const x of [35, 36, 37]) put(x, 8, 12);
  for (const x of [35, 36, 37]) put(x, 6, 4);
  for (const x of [43, 44, 45, 46]) put(x, 11, 2);
  put(45, 9, 4); put(50, 13, 6);
  for (const x of [55, 56, 57, 58, 59]) put(x, 12, 4);
  if (['coins', 'night'].includes(type)) {
    for (let x = 39; x <= 41; x++) { put(x, 14, 0); put(x, 15, 0); }
    put(47, 13, 7); put(48, 13, 7);
    for (const x of [20, 21, 22, 30, 31, 60, 61, 62]) put(x, 11, 4);
    put(58, 13, 6); put(59, 10, 3); put(60, 10, 3);
  }
  if (type === 'powers') {
    put(4, 13, 15); put(6, 13, 14); put(14, 13, 16); put(9, 13, 42); put(12, 13, 44); put(15, 13, 45);
    put(24, 13, 17); put(40, 13, 18); put(48, 13, 14); put(60, 13, 17);
    put(30, 13, 19); put(44, 13, 20); put(54, 13, 21);
    put(8, 13, 30); put(11, 13, 31); put(18, 12, 32); put(35, 7, 33);
    put(56, 13, 34); put(64, 13, 34); put(29, 7, 23);
  }
  if (type === 'villains') {
    put(4, 13, 15); put(6, 13, 14); put(14, 13, 22); put(20, 8, 23); put(24, 13, 24);
    put(30, 13, 19); put(38, 13, 25); put(40, 13, 26); put(41, 13, 26);
    put(48, 13, 14); put(51, 13, 27); put(57, 13, 28); put(63, 13, 29);
  }
  return level;
}
export function validateLevel(data) {
  if (!data || data.version !== 1 || !Number.isInteger(data.width) || data.width < 20 || data.width > 360 || !Object.hasOwn(THEMES, data.theme) || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 48) throw new Error('Dit is geen geldig Bravios-level.');
  const height = data.height ?? ROWS;
  if (!Number.isInteger(height) || height < ROWS || height > 64) throw new Error('Ongeldige veldhoogte.');
  if (!Array.isArray(data.tiles) || data.tiles.length !== height || data.tiles.some(row => !Array.isArray(row) || row.length !== data.width || row.some(id => !editableIds.has(id)))) throw new Error('Het levelbestand heeft ongeldige blokjes.');
  const count = id => data.tiles.flat().filter(tile => tile === id).length;
  if (structureTiles('start').reduce((n,id)=>n+count(id),0)>1||structureTiles('finish').reduce((n,id)=>n+count(id),0)>1) throw new Error('Een level mag maar één startplek en één finish hebben.');
  const level = { version: 1, name: data.name.trim(), width: data.width, theme: data.theme, tiles: clone(data.tiles) };
  data.tiles.forEach((row, y) => row.forEach((id, x) => { if (structureIs(id,'moving-wall') && (x*32+structureSetting(id,'width',64)>data.width*32||y*32+structureSetting(id,'height',64)>height*32)) throw new Error('Het beweegblok moet helemaal binnen het veld staan.'); }));
  if (data.undergroundDepth !== undefined) {
    if (!Number.isInteger(data.undergroundDepth) || data.undergroundDepth < 4 || height - data.undergroundDepth < ROWS) throw new Error('Ongeldige ondergrondse diepte.');
    level.undergroundDepth = data.undergroundDepth;
  }
  if (data.enemyDesigns !== undefined) level.enemyDesigns = validateEnemyDesigns(data.enemyDesigns, data.tiles);
  if (data.belts !== undefined) level.belts = validateBelts(data.belts, data.width, height);
  if (data.background !== undefined) {
    if (!CRAZY_BACKGROUNDS.includes(data.background)) throw new Error('Onbekende achtergrond.');
    level.background = data.background;
  }
  if (data.terrainSeed !== undefined) {
    if (!Number.isInteger(data.terrainSeed) || data.terrainSeed < 0 || data.terrainSeed > 4294967295) throw new Error('Ongeldige blokvariatie.');
    level.terrainSeed = data.terrainSeed;
  }
  if (height !== ROWS) level.height = height;
  if (data.challenge !== undefined) {
    const c = data.challenge;
    if (!c || !['coin-race', 'coin-team'].includes(c.kind) || !Number.isInteger(c.seconds) || c.seconds < 30 || c.seconds > 300 || !Number.isInteger(c.target) || c.target < 1 || c.target > 2000) throw new Error('Ongeldige muntjesuitdaging.');
    level.challenge = { kind: c.kind, seconds: c.seconds, target: c.target };
  }
  return level;
}
export function positions(level, id) {
  const found = [];
  level.tiles.forEach((row, y) => row.forEach((tile, x) => { if (tile === id) found.push({ x, y }); }));
  return found;
}
export function resizeLevel(level, width, height = level.tiles.length) {
  if (!Number.isInteger(width) || width < 20 || width > 360 || !Number.isInteger(height) || height < ROWS || height > 64) throw new Error('Ongeldige veldafmetingen.');
  if (height - (level.undergroundDepth || 0) < ROWS) throw new Error('De bovenwereld moet minstens 16 blokjes hoog blijven.');
  const copy = clone(level), previousHeight = level.tiles.length, offset = height - previousHeight;
  copy.width = width;
  if (height !== ROWS) copy.height = height; else delete copy.height;
  copy.tiles = Array.from({ length: height }, (_, y) => {
    const row = level.tiles[y - offset];
    return Array.from({ length: width }, (_, x) => row ? row[x] ?? (y >= height - 2 ? (level.undergroundDepth ? 65 : 1) : level.undergroundDepth && y >= height - level.undergroundDepth - 2 && y < height - level.undergroundDepth ? 1 : 0) : 0);
  });
  copy.tiles.forEach((row, y) => row.forEach((id, x) => { if (structureIs(id,'moving-wall') && (x*32+structureSetting(id,'width',64)>width*32||y*32+structureSetting(id,'height',64)>height*32)) row[x] = 0; }));
  if (copy.belts) copy.belts = copy.belts.map(b => ({ a: { x: b.a.x, y: b.a.y + offset }, b: { x: b.b.x, y: b.b.y + offset } })).filter(b => [b.a, b.b].every(p => p.x < width && p.y >= 0 && p.y < height));
  if (copy.enemyDesigns) { copy.enemyDesigns.forEach(e => { e.y += offset; }); pruneEnemyDesigns(copy); }
  return copy;
}
// Add space below the existing surface without shifting placed objects.
export function resizeUnderground(level, depth) {
  const oldDepth = level.undergroundDepth || 0, above = level.tiles.length - oldDepth;
  if (!Number.isInteger(depth) || depth < 0 || (depth > 0 && depth < 4) || above + depth > 64) throw new Error('Kies 0 of minstens 4 blokjes diepte; samen met de hoogte maximaal 64.');
  const copy = clone(level);
  if (depth === oldDepth) return copy;
  const height = above + depth;
  // Move the plain generated rock floor down, retaining other placed objects.
  if (oldDepth && depth > oldDepth) for (let y = copy.tiles.length - 2; y < copy.tiles.length; y++) copy.tiles[y] = copy.tiles[y].map(id => id === 65 ? 0 : id);
  copy.tiles = Array.from({ length: height }, (_, y) => copy.tiles[y] || Array(level.width).fill(0));
  if (depth) {
    copy.undergroundDepth = depth;
    for (let y = height - 2; y < height; y++) copy.tiles[y] = copy.tiles[y].map(id => id === 0 ? 65 : id);
  } else delete copy.undergroundDepth;
  if (height === ROWS) delete copy.height; else copy.height = height;
  copy.tiles.forEach((row,y) => row.forEach((id,x) => { if(structureIs(id,'moving-wall')&&y*32+structureSetting(id,'height',64)>height*32) row[x] = 0; }));
  if (copy.belts) copy.belts = copy.belts.filter(b => b.a.y < height && b.b.y < height);
  pruneEnemyDesigns(copy);
  return copy;
}
export function createGame(level, { random = Math.random } = {}) {
  const start = structureTiles('start').flatMap(id=>positions(level,id))[0];
  if (!start || !structureTiles('finish').flatMap(id=>positions(level,id)).length) throw new Error('Plaats eerst een startplek én een finishvlag.');
  const tiles = clone(level.tiles);
  const player = { vineId: null, vineGrip: 0, vineCooldown: 0, inkTime: 0, inkX: 0, inkY: 0, blowTime: 0, x: start.x * TILE + 5, y: start.y * TILE + 4, w: 22, h: 28, vx: 0, vy: 0, grounded: false, fallDistance: 0, parachute: false, coyote: 0, buffer: 0, facing: 1, shield: false, shellHelmet: false, invincible: 0, star: 0, rainbow: 0, rainbowShoes: false, rainbowFart: 0, fartTrail: [], fartLength: 320, trail: [], trailTime: 0, cat: false, instinct: 0, instinctCooldown: 0, instinctX: 0, pipeCooldown: 0, pipeHeld: false, swimCooldown: 0, coins: 0, safeSpot: { x: start.x * TILE + 5, y: start.y * TILE + 4 }, helperGift: null, rocketStage: null, rocketFuse: 0, rocketTime: 0, rocketDuration: 0, rocketStartX: 0, rocketStartY: 0, rocketDirection: 1, rocketLastCount: 6, fire: false, ice: false, bubblegun: false, fireCooldown: 0, mounted: null, mountCooldown: 0 };
  const enemies = Object.keys(enemyKinds).map(Number).flatMap(id => positions(level, id).map(({ x, y }) => {
    const kind = enemyKinds[id], profile = enemyProfile({kind,tileId:id}), width = kind === 'centipede' ? (level.enemyDesigns?.find(e => e.x === x && e.y === y)?.design.length ?? 4) * 24 : profile.size[0];
    const height = profile.size[1];
    return { catalogId: profile.key, design: clone(level.enemyDesigns?.find(e => e.x === x && e.y === y && e.tileId === id)?.design || null), kind, tileId: id, variant: id === 20 ? 'red' : id === 21 ? 'angry' : 'normal', x: kind === 'centipede' ? Math.min(x * TILE, level.width * TILE - width) : x * TILE + (32 - width) / 2, y: (y + 1) * TILE - height, w: width, h: height,
      vx: ['walker', 'turtle', 'skeleton', 'hammer', 'bomb', 'spiky', 'beetle', 'spikedbeetle'].includes(kind) ? -profile.movement.speed : kind === 'dragon' ? -profile.movement.speed : 0,
      vy: 0, facing: -1, phase: kind === 'crusher' ? 'waiting' : kind === 'frog' ? 'tongue' : 'charge', phaseTime: 0, tongueLength: 0, frozen: 0,
      baseY: (y + 1) * TILE - height, hp: profile.combat.health, maxHp: profile.combat.health, hitCooldown: 0, fuse: 0, safe: 0, grounded: false, alive: true };
  }));
  enemies.forEach(initSeaEnemy);
  const helpers = positions(level, 45).map(({ x, y }, index) => ({
    x: x * TILE + 3, y: (y + 1) * TILE - 30, w: 26, h: 30, vx: 0, vy: 0, grounded: false, alive: true,
    reward: HELPER_REWARDS[(Math.floor(x / 3) + Math.floor(y / 3) + level.width % 7 + level.tiles.length % 5 + index) % HELPER_REWARDS.length],
    givenTo: [], giftTime: 0
  }));
  for (const { x, y } of positions(level, 45)) tiles[y][x] = 0;
  const dinos = [16, 74, 89, 90].flatMap(id => positions(level, id).map(({ x, y }) => ({ kind: SEA_MOUNTS[id] || (id === 74 ? 'quad' : 'dino'), x: x * TILE + 2, y: y * TILE + 8, w: id === 89 ? 48 : 28, h: 24, vx: 0, vy: 0, facing: 1, grounded: false, alive: true })));
  for (const id of Object.keys(enemyKinds).map(Number)) for (const { x, y } of positions(level, id)) tiles[y][x] = 0;
  dinos.forEach(d => { tiles[Math.floor(d.y / TILE)][Math.floor(d.x / TILE)] = 0; });
  for (const id of structureTiles('moving-wall')) for (const { x, y } of positions(level, id)) tiles[y][x] = 0;
  return { pSwitch: null, crumbling: [], sceneLevel: clone(level), caveState: { active: null, outside: null, rooms: {}, returns: [] }, caveLocks: caveLinks(level.tiles), keyReveal: null, ...createMechanisms(level), ...createSwingPlatforms(level), ...createFirebars(level), player, enemies, helpers, dinos, fireballs: [], hazards: positions(level, 84).map(({ x, y }) => ({ kind: 'chainhead', design: clone(level.enemyDesigns?.find(e => e.x === x && e.y === y && e.tileId === 84)?.design || null), anchorX: x * TILE + 16, anchorY: y * TILE + 16, x: x * TILE + 40, y: y * TILE, w: 28, h: 28, vx: 0, vy: 0, life: 1, hopTime: 0, grounded: false })), departingRockets: [], rocketIntro: 0, rocketCharacter: null, random, tiles, start: { ...start }, reversed: false, reverseIntro: 0, reverseCharacter: null, reverseReturnPipe: null, finish: structureTiles('finish').flatMap(id=>positions(level,id))[0], width: level.width, theme: level.theme, terrainSeed: level.terrainSeed ?? 0, challenge: level.challenge ? clone(level.challenge) : null, coins: 0, totalCoins: positions(level, 4).length + positions(level, 3).length, time: 0, state: 'playing', lastJump: false, lastMount: false, events: [] };
}
export function caveLinks(tiles) {
  const scan = id => positions({ tiles }, id).sort((a, b) => a.x - b.x || a.y - b.y);
  const keys = scan(64);
  return structureTiles('cave').filter(id=>structureSetting(id,'locked',0)).flatMap(scan).sort((a,b)=>a.x-b.x||a.y-b.y).map((door, i) => ({ door, key: keys[i] || null, label: `G${i + 1}`, unlocked: false }));
}
const CAVE_WORLD_FIELDS = ['sceneLevel', 'tiles', 'width', 'theme', 'terrainSeed', 'enemies', 'helpers', 'dinos', 'fireballs', 'hazards', 'departingRockets', 'movingWalls', 'belts', 'mechanismTime', 'firebars', 'vines', 'donuts', 'start', 'finish', 'reversed', 'reverseReturnPipe', 'caveLocks', 'crumbling', 'pSwitch'];
function caveWorld(game) { return clone(Object.fromEntries(CAVE_WORLD_FIELDS.map(key => [key, game[key] ?? null]))); }
function caveRoomLevel() {
  const room = blankLevel(28); room.name = 'De donkere grot'; room.theme = 'night';
  for (let y = 0; y < 14; y++) { room.tiles[y][0] = 2; room.tiles[y][27] = 2; }
  room.tiles[0].fill(2); room.tiles[1].fill(2);
  room.tiles[13][2] = 62; room.tiles[13][4] = 10;
  for (const x of [8, 9, 10, 16, 17, 18, 22]) room.tiles[10][x] = 12;
  for (const x of [7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 22]) room.tiles[9][x] = 4;
  for (const x of [7, 11, 14, 19, 22]) room.tiles[13][x] = 4;
  room.tiles[13][23] = 9; return room;
}
function visitCave(game, door) {
  const players = game.players || [game.player], state = game.caveState;
  for (const p of players) { p.mounted = null; p.w = 22; p.h = 28; }
  if (state.active === null) {
    const id = `${door.x},${door.y}`;
    state.returns = players.map(p => ({ x: p.x, y: p.y, safeSpot: clone(p.safeSpot), spawn: p.spawn ? clone(p.spawn) : null }));
    state.outside = caveWorld(game);
    if (!state.rooms[id]) {
      const room = createGame(caveRoomLevel()); room.tiles[13][24] = 0; room.finish = { x: -100, y: -100 };
      state.rooms[id] = caveWorld(room); game.totalCoins += room.totalCoins;
    }
    Object.assign(game, clone(state.rooms[id])); state.active = id;
    players.forEach((p, i) => Object.assign(p, { x: (4 + i) * TILE + 5, y: 14 * TILE - p.h, safeSpot: { x: (4 + i) * TILE + 5, y: 14 * TILE - p.h }, spawn: p.spawn ? { x: (4 + i) * TILE + 5, y: 14 * TILE - p.h } : undefined, caveTouch: null }));
  } else {
    state.rooms[state.active] = caveWorld(game); Object.assign(game, clone(state.outside));
    players.forEach((p, i) => { const back = state.returns[i]; Object.assign(p, back, { caveTouch: state.active }); if (!back.spawn) delete p.spawn; });
    state.active = null; state.outside = null;
  }
  for (const p of players) Object.assign(p, { vineId: null, vineGrip: 0, vineCooldown: .35, vx: 0, vy: 0, grounded: false, fallDistance: 0, parachute: false, trail: [], fartTrail: [], coyote: 0, buffer: 0, jumpCut: false, rocketStage: null });
  game.events.push('cave');
}
function findCaveKey(game, x, y) {
  game.tiles[y][x] = 0;
  const lock = game.caveLocks.find(lock => !lock.unlocked && lock.key?.x === x && lock.key?.y === y);
  game.events.push('key');
  if (lock) game.keyReveal = { door: { ...lock.door }, elapsed: 0, duration: structureSetting(game.tiles[lock.door.y][lock.door.x],'revealSeconds',1.8),openAfter:structureSetting(game.tiles[lock.door.y][lock.door.x],'openSeconds',1.1),opened: false };
}
function stepKeyReveal(game, dt) {
  const reveal = game.keyReveal;
  reveal.elapsed += dt;
  if (!reveal.opened && reveal.elapsed >= (reveal.openAfter ?? 1.1) - 1e-8) {
    game.tiles[reveal.door.y][reveal.door.x] = 62;
    const lock = game.caveLocks.find(lock => lock.door.x === reveal.door.x && lock.door.y === reveal.door.y);
    if (lock) lock.unlocked = true;
    reveal.opened = true; game.events.push('unlock');
  }
  if (reveal.elapsed >= reveal.duration - 1e-8) game.keyReveal = null;
}
function meetCaves(game) {
  const p = game.player;
  const door = structureTiles('cave').filter(id=>!structureSetting(id,'locked',0)).flatMap(id=>positions({tiles:game.tiles},id)).find(d => overlap(p, { x: d.x * TILE + 4, y: d.y * TILE, w: 24, h: 32 }));
  const touch = door ? `${door.x},${door.y}` : null;
  if (door && touch !== p.caveTouch && !p.respawn && !p.rocketStage) { visitCave(game, door); return true; }
  p.caveTouch = touch; return false;
}
// Remember each original tile so collected coins and broken temporary bricks stay gone.
function pressPSwitch(game, x, y) {
  if (game.pSwitch) return;
  const switchId=game.tiles[y][x];
  game.tiles[y][x] = structureSetting(switchId,'pressedTile',81);
  const changes = [];
  game.tiles.forEach((row, yy) => row.forEach((id, xx) => {
    if (id !== 4 && !P_SWITCH_BLOCKS.has(id)) return;
    const temporary = id === 4 ? 2 : 4;
    changes.push({ x: xx, y: yy, original: id, temporary });
    row[xx] = temporary;
  }));
  game.crumbling = [];
  game.pSwitch = { remaining: structureSetting(switchId,'durationSeconds',P_SWITCH_SECONDS), changes };
  game.events.push('powerup');
}
function stepPSwitches(game, dt) {
  const state = game.caveState;
  const worlds = [game, state?.outside, ...Object.entries(state?.rooms || {}).filter(([id]) => id !== state.active).map(([, world]) => world)];
  for (const world of worlds) {
    if (!world?.pSwitch) continue;
    world.pSwitch.remaining -= dt;
    if (world.pSwitch.remaining > 1e-8) continue;
    for (const { x, y, original, temporary } of world.pSwitch.changes) {
      if (world.tiles[y]?.[x] === temporary) world.tiles[y][x] = original;
    }
    world.pSwitch = null;
  }
}
function collectCoin(game) { game.coins++; game.player.coins = (game.player.coins || 0) + 1; game.events.push('coin'); }
export function challengeResult(game) {
  if (!game.challenge) return null;
  const players = game.players || [game.player], scores = players.map(p => p.coins || 0);
  const best = Math.max(...scores), winners = scores.map((score, i) => score === best ? i : -1).filter(i => i >= 0);
  return { kind: game.challenge.kind, scores, winners, success: game.coins >= game.challenge.target };
}
function finishChallenge(game) {
  if (!game.challenge || game.state !== 'playing') return;
  const { kind, seconds, target } = game.challenge;
  if (game.time >= seconds - 1e-8 || game.coins >= (kind === 'coin-team' ? target : game.totalCoins)) { game.state = 'won'; game.events.push('win'); }
}
function tileAt(game, x, y) { return game.tiles[y]?.[x] ?? 0; }
function solidAt(game, x, y) { return x < 0 || x >= game.width || (structureSolidTile(tileAt(game,x,y))&&!structureIs(tileAt(game,x,y),'slope')); }
function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function slopeSurface(id, x, y, entity) {
  // Use the highest point under the feet, including at joins with flat blocks.
  const local = Math.max(0, Math.min(TILE, structureSetting(id,'direction',1) < 0 ? entity.x + entity.w - x * TILE : entity.x - x * TILE));
  return y * TILE + (structureSetting(id,'direction',1) < 0 ? TILE - local : local);
}
function stepCrumbling(game, dt) {
  game.crumbling = (game.crumbling || []).filter(block => {
    block.remaining -= dt;
    if (block.remaining > 1e-8) return true;
    if (structureIs(tileAt(game, block.x, block.y),'crumbling')) { game.tiles[block.y][block.x] = 0; game.events.push('break'); }
    return false;
  });
}
function bodyStructureCollision(body){return structureCollision(body.tileId||body.catalogId||(body.kind==='donut'?'donut':'wonder-'+body.kind));}
function move(game, entity, dt, isPlayer = false) {
  const passesWalls = entity.kind === 'turtle' && entity.phase === 'shell' && entity.vx !== 0;
  const previousTop = entity.y, previousBottom = entity.y + entity.h;
  const wasOnSlope = entity.grounded && entity.slope;
  entity.slope = 0;
  entity.x += entity.vx * dt;
  let left = Math.floor(entity.x / TILE), right = Math.floor((entity.x + entity.w - .01) / TILE);
  let top = Math.floor(entity.y / TILE), bottom = Math.floor((entity.y + entity.h - .01) / TILE);
  let wall = false;
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    if (passesWalls && x >= 0 && x < game.width) continue;
    const id = tileAt(game, x, y), slope = structureIs(id,'slope')&&structureCollision(id)?.solid;
    if(structureCollision(id)?.oneWay)continue;
    if (slope && previousBottom <= slopeSurface(id, x, y, entity) + Math.abs(entity.vx * dt) + .5) continue;
    if (!slope && !solidAt(game, x, y)) continue;
    if(isPlayer&&entity===game.player&&structureCollision(id)?.damage)hurt(game,structureCollision(id)?.lethal);
    if (entity.vx > 0) entity.x = x * TILE - entity.w;
    else if (entity.vx < 0) entity.x = (x + 1) * TILE;
    wall = true;
  }
  for (const body of [...mechanismBodies(game), ...wonderBodies(game)]) if (!body.oneWay && !passesWalls && overlap(entity, body)) {
    if(isPlayer&&entity===game.player&&bodyStructureCollision(body)?.damage)hurt(game,bodyStructureCollision(body)?.lethal);
    if (entity.vx > 0) entity.x = body.x - entity.w;
    else if (entity.vx < 0) entity.x = body.x + body.w;
    wall = true;
  }
  if (wall) entity.vx = isPlayer ? 0 : -entity.vx;
  entity.y += entity.vy * dt;
  entity.grounded = false;
  left = Math.floor(entity.x / TILE); right = Math.floor((entity.x + entity.w - .01) / TILE);
  top = Math.floor(entity.y / TILE); bottom = Math.floor((entity.y + entity.h - .01) / TILE);
  const touched = new Set(), movingDown = entity.vy >= 0;
  let landed = false, ceiling = false;
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    if (x < 0 || x >= game.width || !structureSolidTile(tileAt(game,x,y))||structureIs(tileAt(game,x,y),'slope')) continue;
    // A travelling shell may overlap a wall; only newly crossed floors/ceilings stop its fall/jump.
    if (passesWalls && (movingDown ? previousBottom > y * TILE + .01 : previousTop < (y + 1) * TILE - .01)) continue;
    const id = tileAt(game, x, y),collision=structureCollision(id);
    if(collision?.oneWay&&(!movingDown||previousBottom>y*TILE+collision.topOffset+.1))continue;
    if(isPlayer&&entity===game.player&&collision?.damage)hurt(game,collision.lethal);
    if (movingDown) {
      entity.y = y * TILE + (structureCollision(id)?.topOffset ?? 0) - entity.h;
      entity.grounded = true;
      landed = true;
      if (isPlayer && entity === game.player && structureIs(id,'spring')) { entity.vy = -structureSetting(id,'bounceSpeed',940); entity.grounded = false; entity.jumpCut = false; game.events.push('spring'); return { wall, landed: false, ceiling }; }
      entity.vy = 0;
      if (isPlayer && entity === game.player && structureIs(id,'p-switch') && previousBottom <= y * TILE + .01) { pressPSwitch(game, x, y); entity.y += structureCollision(game.tiles[y][x])?.topOffset ?? 0; }
    } else {
      entity.y = (y + 1) * TILE;
      ceiling = true;
      if (isPlayer && entity === game.player && !touched.has(`${x},${y}`)) {
        touched.add(`${x},${y}`);
        if (QUESTION_REWARDS[id]) { game.tiles[y][x] = structureSetting(id,'spentTile',13); collectReward(game, QUESTION_REWARDS[id]); }
        if (structureIs(id,'beanstalk-box')) { game.tiles[y][x] = structureSetting(id,'spentTile',79); for (let row = y - 1; row >= 0 && game.tiles[row][x] === 0; row--) game.tiles[row][x] = structureSetting(id,'vineTile',78); game.events.push('break'); }
        if (structureCollision(id)?.breakFromBelow) { game.tiles[y][x] = 0; game.events.push('break'); }
      }
      entity.vy = 0;
    }
  }
  // Slopes have triangular collision; empty space above the diagonal stays free.
  if (!passesWalls) {
    const reach = Math.abs(entity.vx * dt) + 1;
    const lastRow = Math.floor((entity.y + entity.h + (wasOnSlope && movingDown ? reach : 0)) / TILE);
    let support = null;
    for (let y = top; y <= lastRow; y++) for (let x = left; x <= right; x++) {
      const id = tileAt(game, x, y);
      if (!structureIs(id,'slope')||!structureCollision(id)?.solid) continue;
      const surface = slopeSurface(id, x, y, entity);
      if (movingDown && previousBottom <= surface + reach && entity.y + entity.h + (wasOnSlope ? reach : 0) >= surface) {
        if (!support || surface < support.surface) support = { surface, direction: structureSetting(id,'direction',1),tileId:id };
      } else if (!movingDown && previousTop >= (y + 1) * TILE - .1 && entity.y < (y + 1) * TILE) {
        entity.y = (y + 1) * TILE; entity.vy = 0; ceiling = true;
      }
    }
    if (support && (!entity.grounded || support.surface <= entity.y + entity.h + .1)) {
      entity.y = support.surface - entity.h; entity.vy = 0; entity.grounded = true;
      if(isPlayer&&entity===game.player&&structureCollision(support.tileId)?.damage)hurt(game,structureCollision(support.tileId)?.lethal);
      entity.slope = support.direction; entity.slopeTile=support.tileId; landed = true;
    }
  }
  if (isPlayer && entity.grounded) {
    const y = Math.round((entity.y + entity.h) / TILE);
    if (Math.abs(y * TILE - entity.y - entity.h) < .1) for (let x = left; x <= right; x++) {
      if (structureIs(tileAt(game, x, y),'crumbling') && !game.crumbling.some(b => b.x === x && b.y === y)) game.crumbling.push({ x, y, remaining: structureSetting(tileAt(game,x,y),'delaySeconds',.22) });
    }
  }
  for (const body of [...mechanismBodies(game), ...wonderBodies(game)]) {
    if (entity.x + entity.w <= body.x || entity.x >= body.x + body.w) continue;
    if (movingDown && previousBottom <= body.y + .1 && entity.y + entity.h >= body.y) {
      if(isPlayer&&entity===game.player&&bodyStructureCollision(body)?.damage)hurt(game,bodyStructureCollision(body)?.lethal);
      entity.y = body.y - entity.h; entity.vy = 0; entity.grounded = true; landed = true;
      if (isPlayer && body.kind === 'donut') { bounceDonut(game, body, entity); landed = false; }
    } else if (!body.oneWay && !movingDown && previousTop >= body.y + body.h - .1 && entity.y < body.y + body.h) {
      if(isPlayer&&entity===game.player&&bodyStructureCollision(body)?.damage)hurt(game,bodyStructureCollision(body)?.lethal);
      entity.y = body.y + body.h; entity.vy = 0; ceiling = true;
    }
  }
  return { wall, landed, ceiling };
}
function collectReward(game, id) {
  const p = game.player;
  if (id === 4) collectCoin(game);
  else if (id === 9) { p.shield = true; game.events.push('powerup'); }
  else if (id === 14) { p.star = STAR_SECONDS; game.events.push('star'); }
  else if (id === 44) {
    if (!p.rocketStage) {
      if (p.mounted) dismountDino(game);
      Object.assign(p, { rocketStage: 'fuse', rocketFuse: ROCKET_FUSE_SECONDS, rocketTime: 0, rocketLastCount: 6, vx: 0 });
      game.rocketIntro = 2.4; game.rocketCharacter = p.character || null; game.events.push('rocketintro');
    }
  }
  else if (id === 43) reverseAdventure(game);
  else if (id === 42) { p.bubblegun = true; p.fire = false; p.ice = false; game.events.push('powerup'); }
  else if (id === 41) { p.rainbowFart = RAINBOW_FART_SECONDS; p.fartTrail = []; game.events.push('rainbowfart'); }
  else if (id === 30) { p.rainbow = RAINBOW_SECONDS; p.rainbowShoes = true; game.events.push('rainbow'); }
  else if (id === 31) { p.cat = true; p.instinct = 0; p.instinctCooldown = 0; game.events.push('bell'); }
  else if (id === 15) { p.fire = true; p.ice = false; p.bubblegun = false; game.events.push('powerup'); }
  else if (id === 19) { p.ice = true; p.fire = false; p.bubblegun = false; game.events.push('powerup'); }
}
function updateHelpers(game, dt) {
  for (const helper of game.helpers || []) if (helper.alive) {
    helper.giftTime = Math.max(0, helper.giftTime - dt);
    helper.vy = Math.min(900, helper.vy + (game.theme === 'moon' ? 300 : 1800) * dt); move(game, helper, dt);
    if (helper.y > game.tiles.length * TILE + 64) helper.alive = false;
  }
}
function meetHelpers(game) {
  const p = game.player, index = game.players ? game.players.indexOf(p) : 0;
  for (const helper of game.helpers || []) {
    if (!helper.alive || helper.givenTo.includes(index) || Math.abs(helper.x + helper.w / 2 - p.x - p.w / 2) > 42
      || Math.abs(helper.y + helper.h - p.y - p.h) > 44) continue;
    helper.givenTo.push(index); helper.giftTime = 3;
    collectReward(game, helper.reward);
    p.helperGift = { id: helper.reward, remaining: 3 }; game.events.push('helpergift');
  }
}
export function rocketCountdown(p) {
  return Math.max(0, Math.ceil((p.rocketFuse || 0) - .6 - 1e-8));
}
function launchRocket(game, p) {
  Object.assign(p, { rocketStage: 'flight', rocketTime: 0, rocketStartX: p.x, rocketStartY: p.y,
    rocketDuration: Math.max(.65, Math.min(3, Math.abs(p.y - 8) / 780)), rocketDirection: p.facing,
    parachute: false, fallDistance: 0, grounded: false, vx: 0, vy: 0, trail: [], fartTrail: [] });
  game.events.push('rocketlaunch');
}
function flyRocket(game, p, dt) {
  p.rocketTime += dt;
  const t = Math.min(1, p.rocketTime / p.rocketDuration), y = p.y, x = p.x;
  const bend = Math.min(48, p.rocketDirection > 0 ? game.width * TILE - p.w - p.rocketStartX : p.rocketStartX);
  p.y = p.rocketStartY + (8 - p.rocketStartY) * (t * .75 + t * t * .25);
  p.x = p.rocketStartX + p.rocketDirection * Math.max(0, bend) * t * t;
  p.vx = (p.x - x) / dt; p.vy = (p.y - y) / dt; p.grounded = false;
  if (t >= 1) {
    (game.departingRockets ||= []).push({ x: p.x + p.w / 2, y: p.y + 12, w: 12, h: 34, vx: p.rocketDirection * 70, vy: -500, life: 1.2 });
    Object.assign(p, { rocketStage: null, rocketFuse: 0, vx: p.rocketDirection * 50, vy: 60, fallDistance: 0, parachute: false });
    game.events.push('rocketdetach');
  }
}
function updateDepartingRockets(game, dt) {
  game.departingRockets = (game.departingRockets || []).filter(rocket => {
    rocket.x += rocket.vx * dt; rocket.y += rocket.vy * dt; rocket.life -= dt; return rocket.life > 0;
  });
}
export function visualFacing(game, body) {
  return (game?.reversed ? -1 : 1) * body.facing;
}
function reverseAdventure(game) {
  if (game.reversed) return;
  const oldStart = game.start, oldFinish = game.finish;
  game.start = { ...oldFinish }; game.finish = { ...oldStart };
  game.tiles[oldStart.y][oldStart.x] = 11; game.tiles[oldFinish.y][oldFinish.x] = 10;
  game.reversed = true; game.reverseIntro = REVERSE_INTRO_SECONDS;
  game.reverseCharacter = game.player.character || null;
  for (const p of game.players || [game.player]) {
    p.safeSpot = { x: game.start.x * TILE + 5, y: game.start.y * TILE + 4 };
    if (p.spawn) p.spawn = { ...p.safeSpot };
  }
  for (const enemy of game.enemies) if (enemy.alive && !enemy.bubbled) {
    enemy.vx *= -1; enemy.facing *= -1;
  }
  // Downward switchbacks need a return route. Add a clear pair before the existing
  // two-way pipes in their x-order, so their existing connections stay intact.
  if (oldFinish.y - oldStart.y > 8) {
    const firstPipeX = Math.min(game.width, ...positions({ tiles: game.tiles }, 34).map(p => p.x));
    for (const x of [1, 0]) {
      const clear = x < firstPipeX && [oldStart.y, oldFinish.y].every(y =>
        game.tiles[y]?.[x] === 0 && game.tiles[y - 1]?.[x] === 0 && game.tiles[y - 2]?.[x] === 0 && solidIds.has(game.tiles[y + 1]?.[x]));
      if (!clear) continue;
      game.tiles[oldStart.y][x] = 34; game.tiles[oldFinish.y][x] = 34;
      game.reverseReturnPipe = { x, y: oldFinish.y }; break;
    }
  }
  game.events.push('reverse');
}
function canOccupy(game, body) {
  if ((game.movingWalls||[]).some(wall=>structureCollision(wall.tileId||wall.catalogId||46)?.solid&&!wall.oneWay&&overlap(body,wall)) || wonderBodies(game).some(obstacle => overlap(body, obstacle))) return false;
  for (let y = Math.floor(body.y / TILE); y <= Math.floor((body.y + body.h - .01) / TILE); y++) {
    for (let x = Math.floor(body.x / TILE); x <= Math.floor((body.x + body.w - .01) / TILE); x++) {
      const id = tileAt(game, x, y);
      if(structureCollision(id)?.oneWay)continue;
      if (solidAt(game, x, y) || (structureIs(id,'slope')&&structureCollision(id)?.solid) && body.y + body.h > slopeSurface(id, x, y, body) + .01) return false;
    }
  }
  return true;
}
export function worldTheme(game, fallback = 'grass') {
  if ((game?.theme || fallback) === 'castle') return 'castle';
  return (game?.players || (game ? [game.player] : [])).some(p => p.cat && !p.respawn) ? (isWaterTheme(game?.theme || fallback) ? 'underwater-night' : 'night') : game?.theme || fallback;
}
// Pair entrances and exits in left-to-right order. Bidirectional pipes pair in twos.
export function pipeConnections(tiles) {
  const pipes = [];
  tiles.forEach((row, y) => row.forEach((id, x) => { if (PIPE_TYPES[id] && PIPE_TYPES[id].mode !== 'decoration') pipes.push({ x, y, id }); }));
  pipes.sort((a, b) => a.x - b.x || a.y - b.y);
  const entrances = pipes.filter(p => PIPE_TYPES[p.id].mode === 'in'), exits = pipes.filter(p => PIPE_TYPES[p.id].mode === 'out'), both = pipes.filter(p => PIPE_TYPES[p.id].mode === 'both');
  return [
    ...entrances.map((from, i) => ({ from, to: exits[i] || null, label: `A${i + 1}` })),
    ...both.map((from, i) => ({ from, to: both[i % 2 ? i - 1 : i + 1] || null, label: `B${Math.floor(i / 2) + 1}` }))
  ];
}
export function pipeUnderPlayer(game) {
  const p = game.player;
  if (p.respawn) return null;
  return pipeConnections(game.tiles).find(({ from }) => {
    const opening = PIPE_TYPES[from.id].opening;
    const cx = (from.x + .5) * TILE, cy = (from.y + .5) * TILE;
    if (opening === 'up') return p.grounded && Math.abs(p.y + p.h - from.y * TILE) < 2 && Math.abs(p.x + p.w / 2 - cx) < 13;
    if (opening === 'down') return Math.abs(p.y - (from.y + 1) * TILE) < 6 && Math.abs(p.x + p.w / 2 - cx) < 13;
    return Math.abs((opening === 'left' ? p.x + p.w - from.x * TILE : p.x - (from.x + 1) * TILE)) < 6 && Math.abs(p.y + p.h / 2 - cy) < 15;
  }) || null;
}
function usePipe(game, connection) {
  const p = game.player, to = connection.to;
  if (!to) return false;
  const normal = PIPE_NORMALS[PIPE_TYPES[to.id].opening];
  const body = { x: (to.x + .5) * TILE + normal.x * (TILE + p.w) / 2 - p.w / 2, y: (to.y + .5) * TILE + normal.y * (TILE + p.h) / 2 - p.h / 2, w: p.w, h: p.h };
  if (body.x < 0 || body.y < 0 || body.x + body.w > game.width * TILE || body.y + body.h > game.tiles.length * TILE || !canOccupy(game, body)) return false;
  Object.assign(p, body, { vx: normal.x * 180, vy: normal.y * 180, grounded: false, coyote: 0, buffer: 0, jumpCut: false, pipeCooldown: 1, fallDistance: 0, parachute: false, trail: [], fartTrail: [] });
  p.safeSpot = { x: p.x, y: p.y };
  game.events.push('pipe'); return true;
}
// Keep a bounded trail along the actual path, including jumps; never bridge a pipe trip.
export function updateRainbowFart(p, dt) {
  if (!(p.rainbowFart > 0) || p.respawn > 0) { p.fartTrail = []; return; }
  p.fartTrail = (p.fartTrail || []).filter(point => (point.life -= dt) > 0);
  const point = { x: p.x + p.w / 2 - p.facing * 10, y: p.y + p.h * .6, life: 3 };
  const last = p.fartTrail.at(-1);
  if (!last || Math.hypot(point.x - last.x, point.y - last.y) >= 5) p.fartTrail.push(point);
  let length = 0;
  for (let i = p.fartTrail.length - 1; i > 0; i--) {
    const a = p.fartTrail[i], b = p.fartTrail[i - 1], segment = Math.hypot(a.x - b.x, a.y - b.y);
    const remaining = Math.max(0, (p.fartLength || 320) - length);
    if (segment > remaining) {
      const t = remaining / segment;
      p.fartTrail[i - 1] = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, life: b.life };
      p.fartTrail.splice(0, i - 1); break;
    }
    length += segment;
  }
}
export function rainbowFartHits(p, enemy) {
  if (!(p.rainbowFart > 0) || p.respawn > 0) return false;
  const trail = p.fartTrail || [];
  // Clip each segment against the enemy rectangle expanded by the visible ribbon radius.
  for (let i = 0; i < trail.length; i++) {
    const a = trail[i], b = trail[i + 1] || a;
    let enter = 0, leave = 1;
    for (const [axis, size] of [['x', 'w'], ['y', 'h']]) {
      const delta = b[axis] - a[axis], lo = enemy[axis] - 18, hi = enemy[axis] + enemy[size] + 18;
      if (!delta) { if (a[axis] < lo || a[axis] > hi) { enter = 2; break; } }
      else {
        const t1 = (lo - a[axis]) / delta, t2 = (hi - a[axis]) / delta;
        enter = Math.max(enter, Math.min(t1, t2)); leave = Math.min(leave, Math.max(t1, t2));
      }
    }
    if (enter <= leave) return true;
  }
  return false;
}
function safeGround(game, body) {
  if (!canOccupy(game, body)) return false;
  const floor = Math.floor((body.y + body.h + 1) / TILE);
  const left = Math.floor(body.x / TILE), right = Math.floor((body.x + body.w - .01) / TILE);
  if (![left, right].every(x => !structureIs(tileAt(game,x,floor),'crumbling')&&structureSolidTile(tileAt(game,x,floor))&&!structureCollision(tileAt(game,x,floor))?.damage)) return false;
  for (let y = Math.floor(body.y / TILE); y < floor; y++) for (let x = left; x <= right; x++) if (structureCollision(tileAt(game,x,y))?.damage)return false;
  return true;
}
function rescueFromPit(game) {
  const p = game.player;
  if (p.vineId) clearVine(p);
  let spot = p.safeSpot && { ...p.safeSpot, w: p.w, h: p.h };
  if (!spot || !safeGround(game, spot)) {
    const candidates = [];
    game.tiles.forEach((row, y) => row.forEach((id, x) => {
      if (!solidIds.has(id)) return;
      const body = { x: x * TILE + (TILE - p.w) / 2, y: y * TILE - p.h, w: p.w, h: p.h };
      if (safeGround(game, body)) candidates.push(body);
    }));
    spot = candidates.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
  }
  // A level may contain no remaining ground at all: the rainbow still protects.
  spot ||= { x: p.safeSpot?.x ?? p.x, y: Math.min(p.safeSpot?.y ?? 0, 12 * TILE), w: p.w, h: p.h };
  Object.assign(p, spot, { vx: 0, vy: p.cat ? -900 : -300, grounded: false, coyote: 0, jumpCut: false, fallDistance: 0, parachute: false, trail: [], fartTrail: [] });
  game.events.push(p.cat ? 'catrescue' : 'rainbowrescue');
}
function catControls(game, input, dt) {
  const p = game.player;
  p.instinct = Math.max(0, p.instinct - dt); p.instinctCooldown = Math.max(0, p.instinctCooldown - dt);
  if (!p.cat) return input;
  if (p.instinctCooldown <= 0) {
    const airborne = [
      ...game.enemies.filter(e => e.alive && !e.bubbled && !e.frozen && (e.kind === 'dragon' || (e.kind === 'robot' && e.phase === 'jump'))),
      ...game.hazards.filter(h => h.kind === 'hammer' && h.life > 0),
      ...game.fireballs.filter(b => b.alive)
    ].filter(e => Math.abs(e.x - p.x) < 160 && Math.abs(e.y - p.y) < 150);
    const target = airborne.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
    if (target) { p.instinct = .8; p.instinctCooldown = 4; p.instinctX = target.x; game.lastJump = false; game.events.push('catinstinct'); }
  }
  if (p.instinct > 0) return { ...input, left: p.instinctX < p.x - 8, right: p.instinctX > p.x + 8, jump: true, mount: false, pipe: false };
  return input;
}
function updateRainbowTrail(p, dt) {
  p.trail = (p.trail || []).filter(point => (point.life -= dt) > 0);
  p.trailTime = Math.max(0, p.trailTime - dt);
  if (p.rainbowShoes && !p.respawn && p.trailTime <= 0 && (Math.abs(p.vx) > 10 || Math.abs(p.vy) > 30)) {
    p.trail.push({ x: p.x + p.w / 2, y: p.y + p.h - 3, life: .65 }); p.trailTime = .04;
  }
}
function mountDino(game, dino) {
  const p = game.player;
  const body = { x: dino.x, y: dino.y + dino.h - 48, w: dino.w, h: 48 };
  if (!canOccupy(game, body)) return false;
  Object.assign(p, body); p.mounted = dino; p.vy = dino.vy; p.grounded = dino.grounded;
  game.events.push('mount'); return true;
}
function dismountDino(game) {
  const p = game.player, dino = p.mounted;
  if (!dino) return;
  const sides = [p.facing, -p.facing].map(side => ({ x: dino.x + (side > 0 ? dino.w + 3 : -25), y: dino.y + dino.h - 28, w: 22, h: 28 }));
  const body = sides.find(candidate => canOccupy(game, candidate)) || { x: p.x + 3, y: p.y, w: 22, h: 28 };
  Object.assign(p, body); p.mounted = null; p.mountCooldown = .5; p.grounded = false; p.coyote = 0; p.vy = -180; p.jumpCut = false;
  game.events.push('dismount');
}
export function frogTongue(enemy) {
  const length = enemy.tongueLength || 0;
  return { x: enemy.facing > 0 ? enemy.x + enemy.w : enemy.x - length, y: enemy.y + 11, w: length, h: 6 };
}
function hitEnemy(game, enemy, kind = 'fire') {
  if (enemy.kind === 'wonder') { hitWonderFoe(game,enemy,kind); return; }
  const combat=enemyProfile(enemy)?.combat;
  if (enemy.bubbled || enemy.kind==='crusher' || kind==='fire' && combat?.fireResponse === 'ignore') return;
  if (combat?.fireResponse === 'ignite') { enemy.fuse = enemy.fuse > 0 ? Math.min(enemy.fuse, .5) : .5; return; }
  if (enemy.kind === 'skeleton') {
    collapseSkeleton(enemy); return;
  }
  if (combat?.fireResponse === 'collapse') { collapseSkeleton(enemy); return; }
  if (enemy.hitCooldown > 0) return;
  enemy.hp=(enemy.hp ?? combat?.health ?? 1)-1; enemy.hitCooldown=combat?.hitCooldown ?? 0;
  if(enemy.hp>0){game.events.push('hurt');return;}
  enemy.alive = false; game.events.push('stomp');
}
function collapseSkeleton(enemy) {
  if (enemy.phase !== 'fallen') { const height=Math.min(enemy.h,12);enemy.y+=enemy.h-height;enemy.h=height; }
  enemy.phase = 'fallen'; enemy.phaseTime = 0; enemy.vx = 0;
}
export function nearbyShell(game) {
  const p = game.player;
  if (p.respawn || p.shellHelmet) return null;
  return game.enemies.find(enemy => enemy.alive && !enemy.bubbled && enemy.kind === 'turtle' && enemy.phase === 'shell'
    && !enemy.vx && !enemy.frozen
    && Math.abs(enemy.x + enemy.w / 2 - p.x - p.w / 2) < 46
    && Math.abs(enemy.y + enemy.h - p.y - p.h) < 38) || null;
}
function stompEnemy(game, enemy) {
  const p = game.player;
  if (enemy.frozen > 0) { p.vy = -430; p.jumpCut = false; game.events.push('stomp'); return; }
  const response=stompResponse(enemy);
  if (response === 'hurt') { if(enemyProfile(enemy)?.combat.contactDamage)hurt(game); return; }
  if (response === 'fold') {
    if (enemy.phase !== 'folded') { const height=Math.min(enemy.h,14);enemy.y+=enemy.h-height;enemy.h=height;enemy.phase = 'folded'; enemy.phaseTime = 0; enemy.vx = 0; enemy.vy = 0; }
  } else if (response === 'collapse') collapseSkeleton(enemy);
  else if (response === 'ignite') { enemy.fuse = enemy.fuse > 0 ? Math.min(enemy.fuse, .8) : .8; enemy.vx = 0; }
  else if (response === 'shell') {
    if (enemy.phase !== 'shell') { const height=Math.min(enemy.h,18);enemy.y+=enemy.h-height;enemy.h=height;enemy.phase = 'shell'; enemy.vx = 0; }
    else enemy.vx = enemy.vx ? 0 : p.facing * 240;
    enemy.safe = .2;
  } else if(response === 'damage') { enemy.hp=(enemy.hp ?? 1)-1; if(enemy.hp<=0)enemy.alive=false; }
  p.vy = -430; p.jumpCut = false; game.events.push('stomp');
}
function updateHazards(game, dt) {
  const newborn = [];
  for (const hazard of game.hazards) {
    hazard.life -= dt;
    if (hazard.kind === 'chainhead') {
      hazard.life = 1; hazard.hopTime -= dt; stepEnemyShooting(game,hazard,dt);
      const target = (game.players || [game.player]).filter(p => !p.respawn).sort((a,b) => Math.abs(a.x-hazard.x)-Math.abs(b.x-hazard.x))[0];
      if (target && hazard.hopTime <= 0 && (hazard.grounded || Math.abs(Math.hypot(hazard.x + 14 - hazard.anchorX, hazard.y + 14 - hazard.anchorY) - enemySetting(hazard,'chainLength',112)) < 1)) {
        hazard.vx = Math.sign(target.x + target.w / 2 - hazard.x - 14) * (enemyProfile(hazard)?.movement.speed ?? 160); hazard.vy = -enemySetting(hazard,'jumpSpeed',300); hazard.hopTime = enemySetting(hazard,'jumpInterval',.8);
      }
      hazard.vy = Math.min(700, hazard.vy + 900 * dt); move(game, hazard, dt);
      const dx = hazard.x + 14 - hazard.anchorX, dy = hazard.y + 14 - hazard.anchorY, distance = Math.hypot(dx,dy);
      const chainLength=enemySetting(hazard,'chainLength',112);
      if (distance > chainLength) { hazard.x = hazard.anchorX + dx / distance * chainLength - 14; hazard.y = hazard.anchorY + dy / distance * chainLength - 14; hazard.vx = 0; hazard.vy = 0; }
    }
    if (hazard.kind === 'ant' || hazard.kind === 'spikeegg') {
      if (hazard.life <= 1e-8) { hazard.life = 0; continue; }
      hazard.vy = Math.min(900, hazard.vy + 900 * dt);
      const collision = move(game, hazard, dt);
      if (hazard.kind === 'ant') { hazard.blinking = hazard.life <= enemySetting(hazard,'blinkSeconds',2) + 1e-8; if (collision.wall) hazard.vx *= -1; }
      else if (collision.landed) {
        hazard.life = 0;
        for (const direction of [-1, 1]) newborn.push({ kind: 'ant', x: hazard.x, y: hazard.y + hazard.h - 8, w: 14, h: 8, vx: direction * (enemyProfile({kind:'ant'})?.movement.speed ?? 65), vy: 0, life: enemySetting({kind:'ant'},'lifeSeconds',5), blinking: false });
      }
      if (hazard.y > game.tiles.length * TILE + 32) hazard.life = 0;
    }
    if (hazard.kind === 'wonder') {
      const collision = move(game,hazard,dt,true);
      if (collision.wall || hazard.y > game.tiles.length*TILE) hazard.life=0;
    }
    if (hazard.kind === 'hammer' || hazard.kind === 'fire') {
      hazard.vy += (game.theme === 'moon' ? 150 : 900) * dt;
      const collision = move(game, hazard, dt, true);
      if (collision.wall || collision.landed || collision.ceiling || hazard.y > game.tiles.length * TILE + 32) hazard.life = 0;
    }
  }
  game.hazards = game.hazards.filter(h => h.life > 0).concat(newborn);
}
function updateCrusher(game, enemy, dt) {
  enemy.previousY = enemy.y;
  enemy.vx = 0;
  if (enemy.phase === 'waiting') {
    const below = (game.players || [game.player]).some(p => {
      if (p.respawn || p.x + p.w <= enemy.x || p.x >= enemy.x + enemy.w || p.y < enemy.y + enemy.h) return false;
      const center = Math.floor((Math.max(p.x, enemy.x) + Math.min(p.x + p.w, enemy.x + enemy.w)) / 2 / TILE);
      for (let row = Math.ceil((enemy.y + enemy.h) / TILE); row < Math.floor(p.y / TILE); row++) if (solidAt(game, center, row)) return false;
      return !mechanismBodies(game).some(body => body.x < p.x + p.w && body.x + body.w > p.x && body.y >= enemy.y + enemy.h && body.y + body.h <= p.y);
    });
    if (below) { enemy.phase = 'falling'; enemy.vy = 0; }
  }
  if (enemy.phase === 'falling') {
    enemy.vy = Math.min(720, enemy.vy + 2400 * dt);
    const collision = move(game, enemy, dt);
    const floor = game.tiles.length * TILE - enemy.h;
    if (collision.landed || enemy.y >= floor) {
      enemy.y = Math.min(enemy.y, floor); enemy.vy = 0; enemy.phase = 'rest'; enemy.phaseTime = 0; game.events.push('rockland');
    }
  } else if (enemy.phase === 'rest') {
    enemy.phaseTime += dt;
    if (enemy.phaseTime >= enemySetting(enemy,'restSeconds',5) - 1e-8) { enemy.phase = 'rising'; enemy.phaseTime = 0; }
  } else if (enemy.phase === 'rising') {
    enemy.y = Math.max(enemy.baseY, enemy.y - enemySetting(enemy,'riseSpeed',90) * dt); enemy.vy = -enemySetting(enemy,'riseSpeed',90);
    if (enemy.y <= enemy.baseY) { enemy.phase = 'waiting'; enemy.vy = 0; }
  }
}
function stepEnemyShooting(game,enemy,dt) {
  const s=enemyProfile(enemy)?.shooting;
  if(!s?.enabled||enemy.kind==='wonder')return;
  enemy.shotTime=(enemy.shotTime||0)+dt;
  if(enemy.shotTime<s.interval-1e-8)return;
  enemy.shotTime=Math.max(0,enemy.shotTime-s.interval);
  const target=(game.players||[game.player]).filter(p=>!p.respawn).sort((a,b)=>Math.abs(a.x-enemy.x)-Math.abs(b.x-enemy.x))[0];
  if(s.aim==='player'&&!target)return;
  const direction=s.aim==='down'?0:target.x>=enemy.x?1:-1;
  game.hazards.push({kind:s.projectile,x:enemy.x+(s.projectile==='spikeegg'?6:9),y:s.aim==='down'?enemy.y+enemy.h:enemy.y-8,w:s.projectile==='spikeegg'?14:s.projectile==='fire'?12:10,h:s.projectile==='spikeegg'?18:s.projectile==='fire'?12:10,vx:direction*s.speed,vy:s.verticalSpeed,life:s.life});
  if(s.projectile==='hammer')game.events.push('hammer');
}
function updateEnemy(game, enemy, dt) {
  if (enemy.kind === 'wonder') { stepWonderFoe(game,enemy,dt,move); return; }
  const profile=enemyProfile(enemy);
  const flight = (enemy.design?.fly || profile?.movement.type==='fly'&&!['dragon','cloud','plane'].includes(enemy.kind)) && !enemy.frozen && !enemy.bubbled && !['shell', 'fallen'].includes(enemy.phase);
  const x = enemy.x, y = enemy.y;
  if(!enemy.frozen&&!enemy.bubbled)stepEnemyShooting(game,enemy,dt);
  updateEnemyBase(game, enemy, dt);
  if (!flight || !enemy.alive || ['shell', 'fallen'].includes(enemy.phase)) return;
  // Keep attacks, fuses and type-specific timers; replace only locomotion.
  enemy.x = x; enemy.y = y;
  enemy.flyTime = (enemy.flyTime || 0) + dt;
  enemy.flyDirection ||= enemy.facing || -1;
  enemy.vx = enemy.flyDirection * (enemy.design?.fly ? 60 : profile?.movement.speed ?? 60);
  const targetY = Math.max(8, enemy.baseY - 48) + Math.sin(enemy.flyTime * (profile?.movement.frequency ?? 2.4)) * (profile?.movement.amplitude ?? 18);
  enemy.vy = Math.max(-100, Math.min(100, (targetY - enemy.y) / dt));
  const hit = move(game, enemy, dt);
  if (hit.wall) enemy.flyDirection *= -1;
  enemy.facing = enemy.flyDirection;
}
function updateEnemyBase(game, enemy, dt) {
  if (enemy.kind === 'crusher') enemy.previousY = enemy.y;
  if (enemy.bubbled) {
    enemy.bubbleTime += dt;
    enemy.x += Math.sin(enemy.bubbleTime * 2.5) * 12 * dt;
    enemy.vy = Math.max(-180, enemy.vy - 35 * dt); enemy.y += enemy.vy * dt;
    if (enemy.y + enemy.h < enemy.bubbleExitY) enemy.alive = false;
    return;
  }
  if (enemy.frozen > 0) { enemy.frozen = Math.max(0, enemy.frozen - dt); enemy.tongueLength = 0; return; }
  if (isSeaEnemy(enemy)) { enemy.safe = Math.max(0, (enemy.safe || 0)-dt); enemy.hitCooldown = Math.max(0, (enemy.hitCooldown || 0)-dt); updateSeaEnemy(game, enemy, dt, move); return; }
  if (enemy.pushTime > 0) { enemy.pushTime = Math.max(0,enemy.pushTime-dt); enemy.vx=enemy.pushVx; enemy.vy=-70; move(game,enemy,dt); return; }
  if (enemy.kind === 'crusher') { updateCrusher(game, enemy, dt); return; }
  enemy.hitCooldown = Math.max(0, (enemy.hitCooldown || 0) - dt); enemy.safe = Math.max(0, (enemy.safe || 0) - dt);
  if (enemy.kind === 'beetle' && enemy.phase === 'folded') {
    enemy.phaseTime += dt;
    if (enemy.phaseTime >= enemySetting(enemy,'reviveSeconds',3) - 1e-8 && canOccupy(game, { ...enemy, y: enemy.y + enemy.h - (enemyProfile(enemy)?.size[1] ?? 26), h: enemyProfile(enemy)?.size[1] ?? 26 })) {
      const height=enemyProfile(enemy)?.size[1] ?? 26;enemy.y+=enemy.h-height;enemy.h=height; enemy.phase = 'walk'; enemy.phaseTime = 0;
      enemy.vx = enemy.facing * (enemyProfile(enemy)?.movement.speed ?? 44); enemy.vy = -220; game.events.push('robotjump');
    }
    enemy.vy = Math.min(900, enemy.vy + (game.theme === 'moon' ? 300 : 1800) * dt); move(game, enemy, dt);
    if (enemy.y > game.tiles.length * TILE + 64) enemy.alive = false;
    return;
  }
  if (enemy.kind === 'skeleton' && enemy.phase === 'fallen') {
    enemy.phaseTime += dt;
    if (enemy.phaseTime >= enemySetting(enemy,'reviveSeconds',5) - 1e-8 && canOccupy(game, { ...enemy, y: enemy.y + enemy.h - (enemyProfile(enemy)?.size[1] ?? 26), h: enemyProfile(enemy)?.size[1] ?? 26 })) {
      const height=enemyProfile(enemy)?.size[1] ?? 26;enemy.y+=enemy.h-height;enemy.h=height; enemy.phase = 'walk'; enemy.vx = enemy.facing * (enemyProfile(enemy)?.movement.speed ?? 40); enemy.phaseTime = 0;
    }
    enemy.vy = Math.min(900, enemy.vy + (game.theme === 'moon' ? 300 : 1800) * dt); move(game, enemy, dt);
    if (enemy.y > game.tiles.length * TILE + 64) enemy.alive = false;
    return;
  }
  if (enemy.kind === 'plant') { enemy.phaseTime += dt; enemy.biteHead = Math.floor(enemy.phaseTime / 1.5) % 2; return; }
  if (enemy.kind === 'centipede') {
    enemy.previousX = enemy.x; enemy.previousY = enemy.y;
    if (enemy.phase === 'look') { enemy.phaseTime += dt; if (enemy.phaseTime >= enemySetting(enemy,'lookSeconds',.8)) enemy.phase = 'angry'; }
    enemy.vx = enemy.phase === 'look' ? 0 : enemy.facing * (enemy.phase === 'angry' ? enemySetting(enemy,'angrySpeed',190) : (enemyProfile(enemy)?.movement.speed ?? 32));
    enemy.vy = Math.min(900, enemy.vy + 1800 * dt);
    if (move(game, enemy, dt).wall) enemy.facing *= -1;
    if (enemy.y > game.tiles.length * TILE + 64) enemy.alive = false;
    return;
  }
  if (enemy.kind === 'cloud' && enemyProfile(enemy)?.movement.type==='fly') {
    enemy.phaseTime += dt; enemy.floatTime = (enemy.floatTime || 0) + dt;
    enemy.x += enemy.facing * enemyProfile(enemy).movement.speed * dt; enemy.y = enemy.baseY + Math.sin(enemy.floatTime * enemyProfile(enemy).movement.frequency) * enemyProfile(enemy).movement.amplitude;
    if (enemy.x < 0 || enemy.x + enemy.w > game.width * TILE) { enemy.x = Math.max(0, Math.min(game.width * TILE - enemy.w, enemy.x)); enemy.facing *= -1; }
    return;
  }
  if (enemy.kind === 'plane' && enemyProfile(enemy)?.movement.type==='fly') {
    enemy.phaseTime += dt; enemy.x += enemy.facing * enemyProfile(enemy).movement.speed * dt;
    if (enemy.x < 0 || enemy.x + enemy.w > game.width * TILE) { enemy.x = Math.max(0, Math.min(game.width * TILE - enemy.w, enemy.x)); enemy.facing *= -1; }
    return;
  }
  if (enemy.kind === 'dragon' && enemyProfile(enemy)?.movement.type==='fly') {
    enemy.phaseTime += dt;
    enemy.vy = (enemy.baseY + Math.sin(enemy.phaseTime * enemyProfile(enemy).movement.frequency) * enemyProfile(enemy).movement.amplitude - enemy.y) / dt;
    move(game, enemy, dt); enemy.facing = Math.sign(enemy.vx) || enemy.facing; return;
  }
  if (enemy.kind === 'bomb') {
    if (enemy.fuse <= 0 && (game.players || [game.player]).some(p => !p.respawn && Math.abs(p.x - enemy.x) < enemySetting(enemy,'triggerRange',110) && Math.abs(p.y - enemy.y) < 64)) enemy.fuse = enemySetting(enemy,'fuseSeconds',3);
    if (enemy.fuse > 0) {
      enemy.fuse -= dt;
      if (enemy.fuse <= 1e-8) {
        enemy.alive = false;
        game.hazards.push({ kind: 'blast', x: enemy.x + enemy.w / 2 - 48, y: enemy.y + enemy.h / 2 - 48, w: 96, h: 96, life: .35 });
        game.events.push('explode'); return;
      }
    }
  }
  if (enemy.kind === 'robot') {
    if (enemy.phase === 'charge') {
      enemy.phaseTime += dt; enemy.vx = 0;
      if (enemy.phaseTime >= enemySetting(enemy,'chargeSeconds',5) - 1e-8 && enemy.grounded) {
        enemy.facing = game.random() < .5 ? -1 : 1;
        enemy.vx = enemy.facing * (enemyProfile(enemy)?.movement.speed ?? 150); enemy.vy = -enemySetting(enemy,'jumpSpeed',550);
        enemy.grounded = false; enemy.phase = 'jump'; enemy.phaseTime = 0; game.events.push('robotjump');
      }
    }
  } else if (enemy.kind === 'frog') {
    enemy.phaseTime += dt;
    if (enemy.phaseTime >= enemySetting(enemy,'tongueSeconds',3) - 1e-8) {
      enemy.phaseTime = Math.max(0, enemy.phaseTime - enemySetting(enemy,'tongueSeconds',3));
      enemy.phase = enemy.phase === 'tongue' ? 'crawl' : 'tongue';
      if (enemy.phase === 'tongue') game.events.push('tongue');
    }
    enemy.vx = enemy.phase === 'crawl' ? enemy.facing * (enemyProfile(enemy)?.movement.speed ?? 22) : 0;
  }
  const locomotion=enemyProfile(enemy)?.movement;
  if(locomotion?.type==='stationary'){enemy.vx=0;enemy.vy=0;return;}
  else if(locomotion && enemy.vx && !['robot','frog'].includes(enemy.kind)&&!['shell','fallen','folded'].includes(enemy.phase))enemy.vx=enemy.facing*(locomotion?.speed ?? Math.abs(enemy.vx));
  if (enemyProfile(enemy)?.movement.turnAtEdges && enemy.grounded && enemy.vx && !(enemy.kind === 'turtle' && enemy.phase === 'shell')) {
    const ahead = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w + 4 : -4)) / TILE);
    const floor = Math.floor((enemy.y + enemy.h + 2) / TILE);
    if (!solidAt(game, ahead, floor)) { enemy.vx *= -1; enemy.facing = Math.sign(enemy.vx); }
  }
  if (enemy.boss && Number.isFinite(enemy.arenaLeft) && Number.isFinite(enemy.arenaRight)) {
    const nextX = enemy.x + enemy.vx * dt;
    if (nextX < enemy.arenaLeft) { enemy.x = enemy.arenaLeft; enemy.vx = Math.abs(enemy.vx); }
    else if (nextX + enemy.w > enemy.arenaRight) { enemy.x = enemy.arenaRight - enemy.w; enemy.vx = -Math.abs(enemy.vx); }
  }
  enemy.vy = Math.min(900, enemy.vy + (game.theme === 'moon' ? 300 : 1800) * dt);
  const collision = move(game, enemy, dt);
  if (enemy.kind === 'turtle' && enemy.phase === 'shell' && Math.abs(enemy.vx) > 0) {
    for (const other of game.enemies) if (other !== enemy && other.alive && overlap(enemy, other)) hitEnemy(game, other, 'shell');
  }
  if (enemy.vx) enemy.facing = Math.sign(enemy.vx);
  if (enemy.kind === 'robot' && enemy.phase === 'jump' && collision.landed) { enemy.phase = 'charge'; enemy.phaseTime = 0; enemy.vx = 0; }
  if (enemy.kind === 'frog') {
    const reach = enemy.phase === 'tongue' && enemy.grounded ? enemySetting(enemy,'tongueReach',88) * Math.min(1, enemy.phaseTime / .25, (enemySetting(enemy,'tongueSeconds',3) - enemy.phaseTime) / .25) : 0;
    enemy.tongueLength = 0;
    for (let length = 4; length <= reach; length += 4) {
      const x = enemy.facing > 0 ? enemy.x + enemy.w + length : enemy.x - length;
      if (solidAt(game, Math.floor(x / TILE), Math.floor((enemy.y + 14) / TILE))) break;
      enemy.tongueLength = length;
    }
  }
  if (enemy.y > game.tiles.length * TILE + 64) enemy.alive = false;
}
function updateFireballs(game, dt) {
  for (const ball of game.fireballs) {
    if (!ball.alive) continue;
    ball.life -= dt; ball.vy = ball.kind === 'bubble' ? Math.max(-65, ball.vy - 20 * dt) : Math.min(650, ball.vy + 850 * dt);
    const collision = move(game, ball, dt, true);
    if (collision.wall || collision.ceiling || ball.life <= 0 || ball.y > game.tiles.length * TILE + 32) { ball.alive = false; continue; }
    if (collision.landed) { if (ball.kind === 'bubble') { ball.alive = false; continue; } ball.vy = -270; }
    for (const enemy of game.enemies) if (enemy.alive && !enemy.bubbled && overlap(ball, enemy)) {
      if (enemy.kind === 'wonder' && enemy.boss && !['ice','bubble'].includes(ball.kind)) { hitWonderFoe(game,enemy,ball.kind); }
      else if (ball.kind === 'bubble' && enemyProfile(enemy)?.combat.bubbleable) {
        Object.assign(enemy, { bubbled: true, bubbleTime: 0, bubbleExitY: (game.bubbleViewTop ?? Math.max(0, game.player.y - 300)) - 48, vx: 0, vy: -100, grounded: false, frozen: 0, fuse: 0, tongueLength: 0 });
        game.events.push('bubblecatch');
      }
      else if (ball.kind === 'ice' && enemyProfile(enemy)?.combat.freezeable) { enemy.frozen = FREEZE_SECONDS; enemy.tongueLength = 0; game.events.push('freeze'); }
      else if(ball.kind==='fire')hitEnemy(game, enemy);
      ball.alive = false; break;
    }
  }
  game.fireballs = game.fireballs.filter(ball => ball.alive);
}
function hurt(game, lethal = false) {
  const p = game.player;
  if (p.rocketStage) return;
  if (p.rainbow > 0 || (!lethal && (p.invincible > 0 || p.star > 0))) return;
  if (p.vineId) clearVine(p);
  if (!lethal && p.shellHelmet) { p.shellHelmet = false; p.invincible = 1.5; game.events.push('hurt'); return; }
  if (!lethal && p.mounted) { dismountDino(game); p.invincible = 1.5; game.events.push('hurt'); return; }
  if (!lethal && p.shield) { p.shield = false; p.invincible = 1.5; p.vy = -280; game.events.push('hurt'); return; }
  if (!lethal && p.fire) { p.fire = false; p.invincible = 1.5; p.vy = -280; p.jumpCut = false; game.events.push('hurt'); return; }
  if (!lethal && p.ice) { p.ice = false; p.invincible = 1.5; p.vy = -280; p.jumpCut = false; game.events.push('hurt'); return; }
  if (!lethal && p.bubblegun) { p.bubblegun = false; p.invincible = 1.5; p.vy = -280; p.jumpCut = false; game.events.push('hurt'); return; }
  if (!lethal && p.cat) { p.cat = false; p.instinct = 0; p.invincible = 1.5; p.vy = -280; p.jumpCut = false; game.events.push('hurt'); return; }
  p.parachute = false; p.fallDistance = 0;
  p.bubblegun = false; p.shellHelmet = false; p.rainbowFart = 0; p.fartTrail = [];
  game.state = 'dead'; game.events.push('dead');
}
export function stepGame(game, input, dt = 1 / 120, advanceWorld = true) {
  if (game.state !== 'playing') return;
  dt = Math.min(dt, 1 / 30);
  game.events = [];
  if (game.keyReveal) { if (advanceWorld) stepKeyReveal(game, dt); return; }
  if (game.reverseIntro > 0 || game.rocketIntro > 0) {
    if (advanceWorld) { game.reverseIntro = Math.max(0, (game.reverseIntro || 0) - dt); game.rocketIntro = Math.max(0, (game.rocketIntro || 0) - dt); }
    return;
  }
  if (advanceWorld) { game.time += dt; stepPSwitches(game, dt); stepCrumbling(game, dt); }
  const p = game.player;
  if (advanceWorld) stepWonderExits(game,dt);
  p.wonderSlow=Math.max(0,(p.wonderSlow||0)-dt);
  input = stepWonderMagic(game, input, dt, canOccupy);
  if (advanceWorld) for (const enemy of game.enemies) if (enemy.alive && enemy.kind === 'centipede') updateEnemy(game, enemy, dt);
  const ride = game.enemies.find(e => e.alive && e.kind === 'centipede' && p.grounded && Math.abs(p.y + p.h - (e.previousY ?? e.y)) < 2 && p.x + p.w > (e.previousX ?? e.x) && p.x < (e.previousX ?? e.x) + e.w);
  if (ride) { p.x += ride.x - (ride.previousX ?? ride.x); p.y += ride.y - (ride.previousY ?? ride.y); }
  if (p.helperGift) { p.helperGift.remaining -= dt; if (p.helperGift.remaining <= 0) p.helperGift = null; }
  p.inkTime = Math.max(0,(p.inkTime || 0)-dt); p.blowTime = Math.max(0,(p.blowTime || 0)-dt);
  p.invincible = Math.max(0, p.invincible - dt);
  p.star = Math.max(0, p.star - dt); p.fireCooldown = Math.max(0, p.fireCooldown - dt); p.mountCooldown = Math.max(0, p.mountCooldown - dt);
  p.rainbowFart = Math.max(0, (p.rainbowFart || 0) - dt);
  p.rainbow = p.rainbow - dt > 1e-8 ? p.rainbow - dt : 0; p.pipeCooldown = Math.max(0, p.pipeCooldown - dt);
  p.swimCooldown = Math.max(0, (p.swimCooldown || 0) - dt);
  if (advanceWorld) { stepMechanisms(game, dt); stepSwingPlatforms(game, dt); updateHazards(game, dt); updateDepartingRockets(game, dt); updateHelpers(game, dt); }
  if (advanceWorld) for (const dino of game.dinos) if (dino.alive && dino !== p.mounted && !game.players?.some(other => other.mounted === dino)) {
    if (isSeaMount(dino) && isWaterTheme(game.theme)) { dino.vx=0; dino.vy=0; continue; }
    dino.vy = Math.min(900, dino.vy + (game.theme === 'moon' ? 300 : 1800) * dt); move(game, dino, dt);
    if (dino.y > game.tiles.length * TILE + 64) dino.alive = false;
  }
  if (p.respawn > 0) {
    p.respawn = Math.max(0, p.respawn - dt);
    if (advanceWorld) { for (const enemy of game.enemies) if (enemy.alive) updateEnemy(game, enemy, dt); updateFireballs(game, dt); }
    finishChallenge(game);
    return;
  }
  if (p.grounded && p.rocketStage !== 'flight') {
    const surface = [...mechanismBodies(game), ...wonderBodies(game).filter(b=>b.kind==='swing')].find(b => Math.abs(p.y + p.h - b.previousY) < .5 && p.x + p.w > b.previousX && p.x < b.previousX + b.w);
    if (surface) { p.x += surface.dx; p.y += surface.dy; if (!canOccupy(game, { ...p, y: p.y - .01 })) hurt(game, true); }
  }
  for (const wall of game.movingWalls || []) if (overlap(p, wall) && p.rocketStage !== 'flight') {
    if (wall.dy < 0 && p.y + p.h <= wall.previousY + 2) p.y = wall.y - p.h;
    else if (wall.dy > 0 && p.y >= wall.previousY + wall.h - 2) p.y = wall.y + wall.h;
    else if (p.x + p.w / 2 < wall.x + wall.w / 2) p.x = wall.x - p.w;
    else p.x = wall.x + wall.w;
    if (!canOccupy(game, { ...p, y: p.y - .01 })) hurt(game, true);
  }
  if (game.state !== 'playing') return;
  if (p.rocketStage === 'fuse') {
    p.rocketFuse = Math.max(0, p.rocketFuse - dt);
    const count = rocketCountdown(p);
    if (count !== p.rocketLastCount) { p.rocketLastCount = count; game.events.push('rockettick'); }
    if (p.rocketFuse <= 0) launchRocket(game, p);
  }
  if (p.rocketStage === 'flight') {
    flyRocket(game, p, dt);
    if (advanceWorld) { for (const enemy of game.enemies) if (enemy.alive) updateEnemy(game, enemy, dt); updateFireballs(game, dt); }
    finishChallenge(game); return;
  }
  input = p.rocketStage === 'fuse' ? { left: false, right: false, jump: false, fire: false, mount: false, pipe: false } : catControls(game, input, dt);
  const pipe = pipeUnderPlayer(game), opening = pipe && PIPE_TYPES[pipe.from.id].opening;
  const pipePressed = !!(input.pipe || pipe && (opening === 'down' && input.jump || opening === 'left' && input.right || opening === 'right' && input.left));
  const enteredPipe = pipePressed && !p.pipeHeld && p.pipeCooldown <= 0 && pipe && usePipe(game, pipe);
  p.pipeHeld = pipePressed;
  if (!enteredPipe && !(pipe && pipePressed) && input.mount && !game.lastMount) {
    const shell = nearbyShell(game);
    if (shell) { shell.alive = false; p.shellHelmet = true; game.events.push('helmet'); }
    else if (p.mounted) dismountDino(game);
    else if (p.mountCooldown <= 0) {
      const dino = game.dinos.find(d => d.alive && !game.players?.some(other => other.mounted === d) && (d.grounded || isSeaMount(d) && isWaterTheme(game.theme)) && Math.abs((d.x + d.w / 2) - (p.x + p.w / 2)) < 46 && Math.abs(d.y + d.h - p.y - p.h) < 38);
      if (dino) mountDino(game, dino);
    }
  }
  game.lastMount = !!input.mount;
  const underwater = isWaterTheme(game.theme);
  const waterRide = underwater && isSeaMount(p.mounted);
  const vineMoved = moveOnVine(game, input, dt, canOccupy);
  const wonderMoved = !vineMoved && moveWonderGravity(game, input, dt, move);
  if (!wonderMoved && !vineMoved) {
    p.coyote = p.grounded ? .10 : Math.max(0, p.coyote - dt);
    if (input.jump && !game.lastJump) p.buffer = .12;
    else p.buffer = Math.max(0, p.buffer - dt);
    game.lastJump = !!input.jump;
    const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const sliding = p.grounded && p.slope;
    const target = (sliding ? p.slope * (underwater ? structureSetting(p.slopeTile,'waterSlideSpeed',150) : structureSetting(p.slopeTile,'slideSpeed',300)) + direction * structureSetting(p.slopeTile,'steerSpeed',75) : direction * (waterRide ? p.mounted.kind === 'dolphin' ? 310 : 210 : underwater ? 165 : p.mounted?.kind === 'quad' ? 330 : p.mounted ? 265 : 220)) * (p.wonderSlow > 0 ? .5 : 1);
    // Direction changes on foot should take effect this step, instead of first
    // spending ~100 ms braking in the old direction. Keep special locomotion
    // and the extra momentum of a vine launch on their existing acceleration.
    const vineLaunch = p.vineCooldown > 0 && Math.abs(p.vx) > 220;
    const responsive = !underwater && !p.mounted && !sliding && !vineLaunch;
    if (responsive && direction && p.vx * direction < 0) p.vx = 0;
    const acceleration = (responsive ? p.grounded ? 9000 : 6000 : p.grounded ? 2400 : 1400) * dt;
    p.vx += Math.max(-acceleration, Math.min(acceleration, target - p.vx));
    if (direction) p.facing = direction;
    if (underwater && input.jump && p.swimCooldown <= 0) { p.vy = p.cat ? -340 : -260; p.swimCooldown = .25; p.grounded = false; p.buffer = 0; p.jumpCut = false; game.events.push('swim'); }
    else if (!underwater && p.buffer > 0 && p.coyote > 0) { p.vy = p.cat ? -980 : p.mounted ? -730 : -660; p.buffer = 0; p.coyote = 0; p.grounded = false; p.jumpCut = true; game.events.push('jump'); }
    if (!underwater && p.jumpCut && !input.jump && p.vy < -260) p.vy += 2200 * dt;
    if (underwater || p.grounded || p.vy < 0) { p.parachute = false; p.fallDistance = 0; }
    p.vy = Math.min(underwater ? 150 : p.parachute ? PARACHUTE_SPEED : 900, p.vy + (underwater ? 500 : game.theme === 'moon' ? 300 : 1800) * dt);
    if (waterRide) { p.vy = input.jump ? -190 : input.pipe ? 160 : 0; p.grounded=false; }
    const climbTile=tileAt(game,Math.floor((p.x+p.w/2)/TILE),Math.floor((p.y+p.h/2)/TILE));
    const climbing=!p.mounted&&structureIs(climbTile,'beanstalk');
    if (climbing) { p.vy = input.jump ? -structureSetting(climbTile,'climbSpeed',160) : input.mount ? structureSetting(climbTile,'climbSpeed',160) : 0; p.parachute = false; p.jumpCut = false; }
  }
  const previousY = p.y, previousBottom = p.y + p.h;
  if (!wonderMoved && !vineMoved) move(game, p, dt, true);
  if (!vineMoved) seaCurrent(game,p,dt,move);
  if (isWaterTheme(game.theme) || p.grounded || p.vy <= 0) { p.parachute = false; p.fallDistance = 0; }
  else {
    p.fallDistance = (p.fallDistance || 0) + Math.max(0, p.y - previousY);
    if (p.fallDistance > PARACHUTE_DROP) {
      if (!p.parachute) game.events.push('parachute');
      p.parachute = true; p.vy = Math.min(p.vy, PARACHUTE_SPEED);
    }
  }
  if ((underwater || game.theme === 'moon') && p.y < 0) { p.y = 0; p.vy = Math.max(0, p.vy); }
  if (p.grounded && safeGround(game, p)) p.safeSpot = { x: p.x, y: p.y };
  if (!p.mounted && p.mountCooldown === 0 && p.vy > 0) {
    const dino = game.dinos.find(d => d.alive && !game.players?.some(other => other.mounted === d) && previousBottom <= d.y + 6 && p.y + p.h >= d.y && p.x < d.x + d.w && p.x + p.w > d.x);
    if (dino) mountDino(game, dino);
  }
  if (p.mounted) { p.mounted.x = p.x; p.mounted.y = p.y + p.h - p.mounted.h; p.mounted.facing = p.facing; p.mounted.grounded = p.grounded; }
  const left = Math.floor(p.x / TILE), right = Math.floor((p.x + p.w) / TILE);
  const top = Math.floor(p.y / TILE), bottom = Math.floor((p.y + p.h) / TILE);
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    const id = tileAt(game, x, y), block = { x: x * TILE + 4, y: y * TILE + 4, w: 24, h: 28 };
    if (structureIs(id,'lava') && structureCollision(id)?.damage && overlap(p, { x: x * TILE, y: y * TILE + 5, w: 32, h: 27 })) hurt(game, structureCollision(id)?.lethal);
    if (!overlap(p, block)) continue;
    if (!['lava','spikes','chain-ball','firebar'].includes(structureProfile(id)?.kind) && structureCollision(id)?.damage)hurt(game,structureCollision(id)?.lethal);
    if (id === 64) { findCaveKey(game, x, y); if (game.keyReveal) return; }
    if ([4, 9, 14, 15, 19, 30, 31, 41, 42, 43, 44].includes(id)) { game.tiles[y][x] = 0; collectReward(game, id); }
    if (structureIs(id,'spikes') && structureCollision(id)?.damage && p.star <= 0 && overlap(p, { ...block, y: y * TILE + 13, h: 19 })) hurt(game, structureCollision(id)?.lethal);
  }
  if (game.keyReveal) return;
  if (game.state === 'playing' && meetCaves(game)) return;
  if (game.state === 'playing') meetHelpers(game);
  if (game.reverseIntro > 0 || game.rocketIntro > 0) return;
  updateRainbowFart(p, dt);
  for (const enemy of game.enemies) {
    if (!enemy.alive) continue;
    if (advanceWorld && enemy.kind !== 'centipede') updateEnemy(game, enemy, dt);
    if (advanceWorld && !['geyser','seaweed','moray','whale'].includes(enemy.kind)) seaCurrent(game,enemy,dt,move);
    if (game.state !== 'playing' || !enemy.alive || enemy.bubbled) continue;
    if (enemy.kind === 'wonder') {
      meetWonderFoe(game,enemy);
      wonderFoeContact(game,enemy,previousBottom,hurt);
      continue;
    }
    if (isSeaEnemy(enemy)) {
      if (seaBodies(enemy).some(body => overlap(p,body)) && !enemy.safe) {
        if (p.star>0 || p.rainbow>0 || rainbowFartHits(p,enemy)) { if(enemy.kind!=='whale')enemy.alive=false; }
        else if(enemyProfile(enemy)?.combat.stompable && p.vy>0 && previousBottom<=enemy.y+10)stompEnemy(game,enemy);
        else if(enemyProfile(enemy)?.combat.contactDamage)hurt(game,enemyProfile(enemy)?.combat.lethalContact);
      }
      continue;
    }
    if (stompResponse(enemy) === 'ride' && p.vy >= 0 && previousBottom <= enemy.y + 8 && p.y + p.h >= enemy.y && p.x + p.w > enemy.x && p.x < enemy.x + enemy.w) {
      p.y = enemy.y - p.h; p.vy = 0; p.grounded = true; p.parachute = false; p.fallDistance = 0;
      if (!['look', 'angry'].includes(enemy.phase)) { enemy.phase = 'look'; enemy.phaseTime = 0; }
      continue;
    }
    if (rainbowFartHits(p, enemy)) { enemy.alive = false; game.events.push('stomp'); continue; }
    if (enemy.kind === 'crusher') {
      const swept = { ...enemy, y: Math.min(enemy.previousY ?? enemy.y, enemy.y), h: enemy.h + Math.abs(enemy.y - (enemy.previousY ?? enemy.y)) };
      if (overlap(p, swept)) {
        if(enemyProfile(enemy)?.combat.stompable && p.vy>0 && previousBottom<=enemy.y+10)stompEnemy(game,enemy);
        else if(enemyProfile(enemy)?.combat.contactDamage!==false)hurt(game,enemyProfile(enemy)?.combat.lethalContact);
      }
      continue;
    }
    if (enemy.kind === 'beetle' && enemy.phase === 'folded' && p.star <= 0 && p.rainbow <= 0) continue;
    if (overlap(p, enemy)) {
      if (p.star > 0 || p.rainbow > 0) { enemy.alive = false; game.events.push('stomp'); }
      else if (p.vy > 0 && previousBottom <= enemy.y + 10) stompEnemy(game, enemy);
      else if (enemy.kind === 'turtle' && enemy.phase === 'shell' && !enemy.vx && !enemy.frozen) { enemy.vx = (p.x < enemy.x ? 1 : -1) * 240; enemy.safe = .2; }
      else if (!enemy.frozen && !(enemy.kind === 'skeleton' && enemy.phase === 'fallen') && !enemy.safe && enemyProfile(enemy)?.combat.contactDamage!==false) hurt(game,enemyProfile(enemy)?.combat.lethalContact);
    }
    if (enemy.alive && !enemy.frozen && enemy.kind === 'frog' && enemyProfile(enemy)?.combat.contactDamage && enemy.tongueLength > 0 && overlap(p, frogTongue(enemy))) hurt(game);
  }
  for (const bar of game.firebars || []) if (firebarHits(bar, game.time, p)) hurt(game,structureCollision(bar.tileId||'firebar')?.lethal);
  for (const ball of chainBalls(game)) if (structureCollision(ball.id)?.damage&&overlap(p, ball)) hurt(game,structureCollision(ball.id)?.lethal);
  for (const hazard of game.hazards) if (game.state === 'playing' && overlap(p, hazard)) {
    if(hazard.kind==='wonder'&&hazard.effect==='slow')p.wonderSlow=.6;
    else { const combat=enemyProfile(hazard)?.combat; if(combat?.contactDamage!==false)hurt(game,combat?.lethalContact ?? hazard.kind==='ant'); }
  }
  if (input.fire && waterRide && p.mounted.kind === 'seahorse' && p.fireCooldown <= 0 && game.state === 'playing') blowSeaEnemies(game,p);
  if (input.fire && (p.fire || p.ice || p.bubblegun) && p.fireCooldown <= 0 && game.fireballs.length < (game.players ? 10 : 5) && game.state === 'playing') {
    const size = p.bubblegun ? 16 : 8;
    game.fireballs.push({ kind: p.bubblegun ? 'bubble' : p.ice ? 'ice' : 'fire', x: p.facing > 0 ? p.x + p.w + 1 : p.x - size - 1, y: p.y + (p.bubblegun ? 10 : 12), w: size, h: size, vx: p.facing * (p.bubblegun ? 280 : 350), vy: p.bubblegun ? -15 : -80, life: p.bubblegun ? 1.6 : 3, alive: true });
    p.fireCooldown = p.bubblegun ? .35 : .3; game.events.push(p.bubblegun ? 'bubbleshoot' : 'shoot');
  }
  if (advanceWorld) updateFireballs(game, dt);
  if ((p.cat && p.vy > 0 && p.y + p.h > game.tiles.length * TILE - 24) || (p.rainbow > 0 && p.y > game.tiles.length * TILE + 24)) {
    rescueFromPit(game);
    if (p.mounted) { p.mounted.x = p.x; p.mounted.y = p.y + p.h - p.mounted.h; }
  }
  else if (p.y > game.tiles.length * TILE + 48) hurt(game, true);
  if (p.vy <= 0 || game.state !== 'playing') { p.parachute = false; p.fallDistance = 0; }
  updateRainbowTrail(p, dt);
  const finish = { x: game.finish.x * TILE + 4, y: game.finish.y * TILE - 64, w: 48, h: 96 };
  if (!game.challenge && !game.wonderland?.locked && !game.enemies.some(e => e.boss && e.alive) && game.state === 'playing' && overlap(p, finish)) { game.state = 'won'; game.events.push('win'); }
  finishChallenge(game);
}

// Shared geometry keeps the rendered pendulum and collision body in sync.
export function chainBall(x, y, id, time = 0) {
  const anchorX = x * TILE + 16, anchorY = y * TILE + 28;
  const angle=Math.sin(time*structureSetting(id,'frequency',1.8)+x*.7)*structureSetting(id,'amplitude',.9),length=structureSetting(id,'length',76),diameter=structureSetting(id,'diameter',30);
  return { id, anchorX, anchorY, x: anchorX + Math.sin(angle) * length - diameter/2, y: anchorY + Math.cos(angle) * length - diameter/2, w: diameter, h: diameter };
}
export function chainBalls(game) {
  const balls = [];
  game.tiles.forEach((row, y) => row.forEach((id, x) => { if (structureIs(id,'chain-ball')) balls.push(chainBall(x, y, id, game.time)); }));
  return balls;
}
export function randomLevel(width = 72, height = ROWS, theme = 'grass', random = Math.random) {
  const level = blankLevel(width, height); level.theme = theme; level.name = 'Verrassingsavontuur';
  // Keep the floor and three rows above it clear: a complete walkable route.
  for (let x = 7; x < width - 6; x += 5 + Math.floor(random() * 4)) {
    const y = height - 6 - Math.floor(random() * 3);
    for (let dx = 0; dx < 3; dx++) level.tiles[y][x + dx] = random() < .45 ? 75 : 12;
    level.tiles[y - 1][x + 1] = 4;
    level.tiles[height - 3][x] = 4;
    if (random() < .5) level.tiles[height - 6][x] = 76;
  }
  level.tiles[height - 3][4] = isWaterTheme(theme) ? 89 : 74;
  return seedTerrainLevel(level, random);
}
