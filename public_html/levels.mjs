import { blankLevel, positions } from './engine.mjs?v=44';

export const CAMPAIGN_FIELDS = [
  { name: 'De groene start', theme: 'grass', width: 40, hint: 'Leer springen en volg de muntjes.' },
  { name: 'Bakstenen bij zonsondergang', theme: 'sunset', width: 72, hint: 'Trappen, vraagblokken en je eerste gaten.' },
  { name: 'Sneeuwpret', theme: 'winter', width: 72, hint: 'Spring door de sneeuw en probeer de ijsbloem.' },
  { name: 'De blauwe baai', theme: 'underwater', width: 72, hint: 'Houd de springknop vast om omhoog te zwemmen.' },
  { name: 'Katten in de nacht', theme: 'night', width: 72, hint: 'Volg de hoge route met het kattenbelletje.' },
  { name: 'Dino door de vallei', theme: 'grass', width: 72, hint: 'Neem een dino mee langs buizen en heuvels.' },
  { name: 'De bevroren bergpas', theme: 'winter', width: 96, hint: 'Kies tussen de hoge en lage route.' },
  { name: 'De lichtgevende diepzee', theme: 'underwater-night', width: 96, hint: 'Zwem over ruïnes en zoek het goud.' },
  { name: 'De robotfabriek', theme: 'sunset', width: 96, hint: 'Ontwijk robots, bommen en kleine lavapoelen.' },
  { name: 'De rainbow finale', theme: 'night', width: 120, hint: 'Alle krachten komen samen in het laatste veld!' }
];
export function campaignLevel(index = 0) {
  if (!Number.isInteger(index) || !CAMPAIGN_FIELDS[index]) throw new Error('Onbekend spelveld.');
  const field = CAMPAIGN_FIELDS[index], level = blankLevel(field.width);
  level.name = `${index + 1}. ${field.name}`; level.theme = field.theme;
  const put = (x, y, id) => { level.tiles[y][x] = id; };
  const line = (x, y, length, id) => { for (let i = 0; i < length; i++) put(x + i, y, id); };
  const gap = (x, length = 2) => { line(x, 14, length, 0); line(x, 15, length, 0); };
  const shelf = (x, y, length = 3) => { line(x, y, length, 12); line(x, y - 1, length, 4); };
  // A clear start and finish, with rewards leading along the main route.
  for (let x = 6; x < level.width - 6; x += 6) put(x, 12, 4);
  put(4, 13, 9);
  switch (index) {
    case 0:
      shelf(9, 12); line(17, 10, 3, 3); put(25, 13, 6); shelf(29, 12); break;
    case 1:
      for (const x of [10, 30, 50]) { put(x, 13, 2); line(x + 1, 12, 2, 2); put(x + 1, 11, 4); }
      gap(22); gap(44); line(57, 10, 3, 3); put(38, 13, 22); break;
    case 2:
      put(5, 13, 19); shelf(12, 12, 4); shelf(30, 11, 4); shelf(51, 12, 4);
      put(24, 13, 17); put(45, 13, 20); gap(39); break;
    case 3:
      for (const x of [14, 30, 47]) { for (let y = 9; y < 14; y++) put(x, y, 2); line(x - 3, 7, 7, 4); }
      shelf(20, 5, 4); shelf(38, 3, 4); put(55, 8, 23); put(6, 13, 19); break;
    case 4:
      put(5, 13, 31); put(11, 13, 8); shelf(15, 9, 4); shelf(27, 7, 4); shelf(40, 9, 4);
      gap(24); gap(46); put(36, 7, 23); put(56, 13, 25); break;
    case 5:
      put(5, 13, 16); put(8, 13, 15); gap(20); gap(42, 3);
      shelf(26, 12, 4); shelf(49, 12, 4); put(32, 13, 32); put(57, 13, 33); put(62, 13, 22); break;
    case 6:
      put(5, 13, 19); for (const x of [14, 31, 48, 65, 79]) shelf(x, 11, 5);
      put(23, 13, 18); put(40, 13, 17); put(57, 13, 20); put(73, 13, 25); gap(36); gap(69); break;
    case 7:
      put(5, 13, 19); for (const x of [18, 38, 58, 78]) { for (let y = 7; y < 14; y++) put(x, y, 2); line(x - 4, 5, 9, 4); }
      shelf(26, 10, 4); shelf(48, 3, 4); shelf(68, 10, 4); put(51, 7, 23); put(85, 8, 23); break;
    case 8:
      put(5, 13, 15); put(7, 13, 14); for (const x of [18, 42, 67]) { shelf(x, 11, 4); put(x + 8, 13, 21); }
      for (const x of [32, 56, 80]) { line(x, 13, 2, 26); shelf(x - 1, 11, 4); }
      put(48, 13, 29); put(73, 13, 28); break;
    case 9:
      put(5, 13, 30); put(7, 13, 31); put(9, 13, 19); put(12, 13, 16);
      for (const x of [20, 40, 60, 80, 100]) { shelf(x, 11, 4); put(x + 8, 13, [22, 27, 25, 21, 28][(x / 20) - 1]); }
      gap(34); gap(74); put(52, 9, 23); put(88, 13, 24); put(95, 13, 30);
      put(44, 13, 34); put(66, 13, 34); break;
  }
  if (index === 3 || index === 7) {
    for (const row of level.tiles) for(let x=0;x<row.length;x++) if([6,17,18,20,21,22,23,24,25,27,28,29].includes(row[x])) row[x]=0;
    const creatures = index === 3 ? [[7,11,89],[12,6,86],[23,9,85],[34,11,88],[42,13,93],[51,8,95],[59,13,96],[63,12,92]] : [[7,11,90],[12,8,87],[23,12,91],[33,13,94],[43,7,86],[54,8,85],[65,12,92],[73,10,88],[82,13,93],[88,9,95]];
    for(const [x,y,id] of creatures) if(level.tiles[y][x]===0 || level.tiles[y][x]===4) level.tiles[y][x]=id;
  }
  return level;
}

// A separate campaign: pipe playgrounds, reverse routes and downward switchbacks.
export const CRAZY_FIELDS = [
  { name: 'Theepotten en buizen', width: 72, height: 16, route: 'right', background: 'teapots', hint: '→ Spring over het buizenbos. Druk ↓ op een reisbuis.' },
  { name: 'Achterstevoren door snoepland', width: 72, height: 16, route: 'left', background: 'candy', hint: '← De finish staat links! Volg de muntjes terug.' },
  { name: 'De omgekeerde theetoren', width: 24, height: 48, route: 'down', background: 'teapots', hint: '↓ Begin bovenaan. Spring heen en weer en daal af.' },
  { name: 'De klokkenkelder', width: 40, height: 32, route: 'down', background: 'space', hint: '↓ Kruis elke verdieping en zoek de opening aan de andere kant.' },
  { name: 'Kwallen in de achteruit', width: 96, height: 16, route: 'left', background: 'jellyfish', hint: '← Reis door buizen onder zwevende kwallen.' },
  { name: 'De diepe snoepschacht', width: 24, height: 64, route: 'down', background: 'candy', hint: '↓ Een lange afdaling met afwisselend links en rechts een doorgang.' },
  { name: 'De buizenplaneet', width: 96, height: 16, route: 'right', background: 'space', hint: '→ Een hele planeet vol buizen en springroutes.' },
  { name: 'De kwallenwaterval', width: 32, height: 64, route: 'down', background: 'jellyfish', hint: '↓ Spring van buis naar buis, steeds een verdieping lager.' },
  { name: 'Terug naar de theepot', width: 120, height: 16, route: 'left', background: 'teapots', hint: '← Het langste achterstevorenparcours. De vlag wacht helemaal links.' },
  { name: 'De grote gekke afdaling', width: 32, height: 64, route: 'down', background: 'space', hint: '↓ De finale! Zigzag langs buizen naar de vlag op de bodem.' }
];
export function crazyLevel(index = 0) {
  if (!Number.isInteger(index) || !CRAZY_FIELDS[index]) throw new Error('Onbekend gek spelveld.');
  const field = CRAZY_FIELDS[index], level = blankLevel(field.width, field.height);
  level.name = `${index + 1}. ${field.name}`;
  level.background = field.background;
  level.theme = ['space', 'jellyfish'].includes(field.background) ? 'night' : 'sunset';
  const put = (x, y, id) => { level.tiles[y][x] = id; };
  // Remove the default markers before placing the route-specific start and finish.
  put(2, field.height - 3, 0); put(field.width - 4, field.height - 3, 0);
  if (field.route === 'down') {
    // Solid ledges alternate their openings: crossing the room is required to descend.
    const floors = [];
    for (let y = 8; y < field.height - 5; y += 8) floors.push(y);
    floors.forEach((y, floor) => {
      const openingRight = floor % 2 === 0;
      for (let x = 0; x < field.width; x++) {
        if (openingRight ? x < field.width - 4 : x >= 4) put(x, y, 12);
      }
      for (let x = 6; x < field.width - 5; x += 4) {
        put(x, y - 1, 5); put(x, y - 3, 4);
      }
      // Two-way pipes provide optional detours between the ledges.
      put(5, y - 1, 34);
      for (let x = 3; x < field.width - 3; x += 3) put(x, y - 4, 4);
    });
    // Keep every travel pipe paired, even with an odd number of ledges.
    if (floors.length % 2) put(5, field.height - 3, 34);
    put(2, 7, 10);
    const finishX = floors.length % 2 ? field.width - 3 : 2;
    put(finishX, field.height - 3, 11);
    for (let x = 8; x < field.width - 5; x += 4) put(x, field.height - 3, 5);
    put(3, 6, 41);
    if (index === 5) put(7, 7, 42);
    if (index === 9) put(6, field.height - 3, 44);
    put(9, 7, 45); put(7, floors[Math.floor(floors.length / 2)] - 1, 45);
    floors.forEach((y, n) => { if (n % 2 === 0) put(field.width - 7, y - 1, 22); });
  } else {
    const floor = field.height - 2;
    for (let x = 8, n = 0; x < field.width - 7; x += 5, n++) {
      const tall = n % 3 === 1;
      put(x, floor - 1, 5);
      if (tall) put(x, floor - 2, 5);
      put(x, floor - (tall ? 4 : 3), 4);
      // Paired entrance/exit, with headroom above both ends.
      if (n % 2 === 0 && x + 3 < field.width - 5) {
        put(x, floor - (tall ? 2 : 1), 32);
        put(x + 3, floor - 1, 33);
      }
    }
    for (let x = 12; x < field.width - 10; x += 15) {
      for (let dx = 0; dx < 3; dx++) { put(x + dx, 8, 12); put(x + dx, 7, 4); }
    }
    put(2, floor - 1, 10); put(field.width - 3, floor - 1, 11); put(4, floor - 1, 41);
    for (let x = 20; x < field.width - 8; x += 20) put(x, floor - 1, 22);
    if ([1, 8].includes(index)) put(6, floor - 1, 42);
    if ([0, 6].includes(index)) put(6, floor - 1, 44);
    for (const desired of [10, Math.floor(field.width * .55)]) {
      for (const offset of [0, 1, -1, 2, -2, 3, -3]) {
        const x = desired + offset;
        if (level.tiles[floor - 1][x] !== 0 || [x - 1, x + 1].some(xx => [6, 17, 18, 20, 21, 22, 24, 25, 27, 28, 29].includes(level.tiles[floor - 1][xx]))) continue;
        put(x, floor - 1, 45); break;
      }
    }
    if (field.route === 'left') level.tiles = level.tiles.map(row => row.reverse());
  }
  const finish = positions(level, 11)[0];
  const rewardX = finish.x < field.width / 2 ? finish.x + 4 : finish.x - 4;
  if (field.route === 'down') put(finish.x, finish.y - 3, 43);
  else put(rewardX, finish.y, 43);
  return level;
}

export const TOGETHER_FIELDS = [
  { id: 'coin-meadow', name: 'Wie pakt het meeste goud?', theme: 'sunset', hint: 'Muntjeswedstrijd · 2 minuten · twee gelijke kanten' },
  { id: 'coin-diving', name: 'Duiken naar de schat', theme: 'underwater', hint: 'Muntjeswedstrijd · 2 minuten · goud op alle hoogtes' },
  { id: 'snow-team', name: 'Samen door de sneeuw', theme: 'winter', hint: 'Samenwerking · verzamel samen 50 muntjes in 2:30' }
];
export function togetherLevel(id = 'coin-meadow') {
  const field = TOGETHER_FIELDS.find(f => f.id === id);
  if (!field) throw new Error('Onbekend samenspeelveld.');
  const level = blankLevel(96); level.name = field.name; level.theme = field.theme;
  level.tiles[13][2] = 0; level.tiles[13][47] = 10;
  level.challenge = { kind: id === 'snow-team' ? 'coin-team' : 'coin-race', seconds: id === 'snow-team' ? 150 : 120, target: 50 };
  for (let x = 7; x <= 42; x += 5) {
    const mirror = 95 - x;
    for (const side of [x, mirror]) {
      for (const y of id === 'coin-diving' ? [3, 6, 9, 12] : [10, 12, 13]) {
        for (let offset = 0; offset < 3; offset++) level.tiles[y][side + (x === side ? offset : -offset)] = 4;
      }
      if (id !== 'coin-diving') level.tiles[11][side] = 12;
    }
  }
  for (const x of [44, 51]) level.tiles[13][x] = id === 'snow-team' ? 31 : 14;
  // The finish remains for compatibility; coin challenges end by timer/target.
  level.challenge.target = Math.min(level.challenge.target, positions(level, 4).length);
  return level;
}
