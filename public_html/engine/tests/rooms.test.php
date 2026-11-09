<?php
declare(strict_types=1);
require __DIR__ . '/../room.php';
$directory = sys_get_temp_dir() . '/bravios-test-' . bin2hex(random_bytes(8));
$checks = 0;
function checkRoom(bool $ok, string $message): void { global $checks; if (!$ok) throw new Exception($message); $checks++; echo "✔ $message\n"; }
function failsRoom(callable $action, int $status): bool { try { $action(); return false; } catch (RuntimeException $e) { return $e->getCode() === $status; } }
$level = ['version' => 1, 'name' => 'Samen', 'width' => 40, 'theme' => 'grass', 'tiles' => array_fill(0, 16, array_fill(0, 40, 0))];
$level['tiles'][13][2] = 10; $level['tiles'][13][36] = 11;
foreach ([19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69] as $i => $id) $level['tiles'][8 + intdiv($i, 30)][5 + $i % 30] = $id;
$level['tiles'][14] = $level['tiles'][15] = array_fill(0, 40, 1);
try {
    $characterDirectory = $directory . '-characters';
    mkdir($characterDirectory . '/luna', 0700, true);
    try {
        file_put_contents($characterDirectory . '/luna/character.json', json_encode(['id' => 'luna']));
        checkRoom(roomCharacterIds($characterDirectory) === ['luna'], 'nieuw karakter wordt zonder vaste whitelist gevonden');
        file_put_contents($characterDirectory . '/luna/character.json', json_encode(['id' => 'other']));
        checkRoom(roomCharacterIds($characterDirectory) === [], 'karakter-ID moet overeenkomen met de mapnaam');
        file_put_contents($characterDirectory . '/luna/character.json', '{');
        checkRoom(roomCharacterIds($characterDirectory) === [], 'ongeldige karakter-JSON wordt geweigerd');
    } finally {
        unlink($characterDirectory . '/luna/character.json');
        rmdir($characterDirectory . '/luna'); rmdir($characterDirectory);
    }
    foreach (['underwater','underwater-night'] as $theme) foreach (range(85,96) as $id) {
        $sea = $level; $sea['theme'] = $theme; $sea['tiles'][5][15] = $id;
        checkRoom(roomLevel($sea) === $sea, 'zeedier en waterthema blijven in gedeeld level');
    }
    foreach ([14,15,19,30,70,71,72,73,84,97,98] as $id) {
        $custom = $level; $custom['tiles'][5][15] = $id;
        $custom['enemyDesigns'] = [['x'=>15,'y'=>5,'tileId'=>$id,'design'=>['hat'=>'crown']]];
        checkRoom(roomLevel($custom)['enemyDesigns'][0]['design']['hat'] === 'crown', 'onderdeelontwerp blijft bewaard');
        $custom['enemyDesigns'][0]['design']['wings'] = 'feather';
        $custom['enemyDesigns'][0]['design']['fly'] = true;
        checkRoom(failsRoom(fn() => roomLevel($custom), 400), 'onderdeel kan geen vijandvlucht krijgen');
    }
    foreach ([82,83,84,97,98,99,100,101] as $newId) {
        $newLevel = $level; $newLevel['tiles'][5][15] = $newId;
        checkRoom(roomLevel($newLevel) === $newLevel, 'nieuw onderdeel blijft in gedeeld level');
    }
    $longLevel = $level; $longLevel['tiles'][5][15] = 83;
    $longLevel['enemyDesigns'] = [['x'=>15,'y'=>5,'tileId'=>83,'design'=>['length'=>9]]];
    checkRoom(roomLevel($longLevel)['enemyDesigns'][0]['design']['length'] === 9, 'lengte duizendpoot blijft bewaard');
    $longLevel['enemyDesigns'][0]['design']['length'] = 11;
    checkRoom(failsRoom(fn() => roomLevel($longLevel), 400), 'ongeldige lengte geweigerd');
    $underground = $level;
    $underground['height'] = 32; $underground['undergroundDepth'] = 16;
    $underground['tiles'] = array_merge($level['tiles'], array_fill(0, 14, array_fill(0, 40, 0)), array_fill(0, 2, array_fill(0, 40, 65)));
    checkRoom(roomLevel($underground) === $underground, 'onderwereld en tussenlaag blijven bewaard');
    foreach ([0,3,17,-1,null,'16'] as $badDepth) {
        $badUnderground = $underground; $badUnderground['undergroundDepth'] = $badDepth;
        checkRoom(failsRoom(fn() => roomLevel($badUnderground), 400), 'ongeldige diepte geweigerd');
    }
    $switchLevel = $level; $switchLevel['tiles'][10][10] = 80;
    checkRoom(roomLevel($switchLevel) === $switchLevel, 'P-schakelaar kan in een gedeeld level');
    foreach ([78, 79, 81] as $internalTile) {
        $badSwitch = $switchLevel; $badSwitch['tiles'][10][10] = $internalTile;
        checkRoom(failsRoom(fn() => roomLevel($badSwitch), 400), 'interne spelonderdelen blijven uitgesloten van levelimport');
    }
    $customEnemyLevel = $level; $customEnemyLevel['tiles'][10][8] = 22;
    $enemyDesign = ['head' => 'mushroom', 'body' => 'turtle', 'hat' => 'party', 'wings' => 'butterfly', 'wingSize' => 'large', 'wingColor' => 'pink', 'fly' => true];
    $customEnemyLevel['enemyDesigns'] = [['x' => 8, 'y' => 10, 'tileId' => 22, 'design' => $enemyDesign]];
    checkRoom(roomLevel($customEnemyLevel) === $customEnemyLevel, 'eigen vijandontwerp en vlieggedrag blijven in gedeeld level');
    foreach ([null, [$customEnemyLevel['enemyDesigns'][0], $customEnemyLevel['enemyDesigns'][0]], [['x' => 8, 'y' => 9, 'tileId' => 22, 'design' => $enemyDesign]], [['x' => 8, 'y' => 10, 'tileId' => 22, 'design' => [...$enemyDesign, 'hat' => 'unknown']]], [['x' => 8, 'y' => 10, 'tileId' => 22, 'design' => [...$enemyDesign, 'wings' => 'none']]]] as $entries) {
        $badEnemy = $customEnemyLevel; $badEnemy['enemyDesigns'] = $entries;
        checkRoom(failsRoom(fn() => roomLevel($badEnemy), 400), 'ongeldige of losgeraakte vijandontwerpen worden geweigerd');
    }
    $appearance = ['name' => 'Dino', 'head' => 'dino', 'outfit' => 'chicken', 'shoes' => 'skis', 'accessories' => ['glasses', 'red-cap', 'motor', 'unknown']];
    $cleanAppearance = roomAppearance($appearance);
    checkRoom($cleanAppearance['accessories'] === ['glasses', 'red-cap'], 'karaktermaker deelt alleen bekende accessoires en één hoed');
    checkRoom(roomInput(['appearance' => $appearance])['appearance'] === $cleanAppearance, 'gast stuurt zijn eigen karakter mee met de bediening');
    checkRoom(roomAppearance([...$appearance, 'head' => 'unknown']) === null, 'onbekende karakteronderdelen vallen terug op Boaz of Ravi');
    checkRoom(roomAppearance(null) === null, 'bestaande spelers zonder eigen karakter blijven geldig');
    checkRoom(roomLevel($level) === $level, 'bestaande velden zonder hoogte blijven geldig');
    $level['height'] = 32;
    $level['tiles'] = array_merge(array_fill(0, 16, array_fill(0, 40, 0)), $level['tiles']);
    checkRoom(roomLevel($level) === $level, 'hoger veld behoudt alle rijen in de kamer');
    $badHeight = $level; $badHeight['height'] = 65;
    checkRoom(failsRoom(fn() => roomLevel($badHeight), 400), 'te grote hoogte wordt geweigerd');
    foreach (['winter', 'underwater'] as $theme) {
        $themed = $level; $themed['theme'] = $theme;
        $themed['challenge'] = ['kind' => 'coin-race', 'seconds' => 120, 'target' => 50];
        checkRoom(roomLevel($themed) === $themed, "$theme en muntjesregels blijven behouden in de kamer");
    }
    $invalidChallenge = $level; $invalidChallenge['challenge'] = ['kind' => 'coin-race', 'seconds' => 5, 'target' => 50];
    checkRoom(failsRoom(fn() => roomLevel($invalidChallenge), 400), 'ongeldige wedstrijdregels worden geweigerd');
    $level['terrainSeed'] = 3456789012;
    checkRoom(roomLevel($level) === $level, 'willekeurige blokkeuze blijft bewaard in het gedeelde level');
    foreach ([-1, 4294967296, 1.5, '1', null] as $seed) {
        $badSeed = $level; $badSeed['terrainSeed'] = $seed;
        checkRoom(failsRoom(fn() => roomLevel($badSeed), 400), 'ongeldige toevalswaarde voor blokken wordt geweigerd');
    }
    $level['background'] = 'space';
    checkRoom(roomLevel($level) === $level, 'gekke achtergrond en Rainbowfart zijn geldig voor kamers');
    $badBackground = $level; $badBackground['background'] = 'unknown';
    checkRoom(failsRoom(fn() => roomLevel($badBackground), 400), 'onbekende achtergrond wordt geweigerd');
    $level['belts'] = [['a' => ['x' => 5, 'y' => 20], 'b' => ['x' => 18, 'y' => 23]]];
    checkRoom(roomLevel($level) === $level, 'bewegende muren en bandassen blijven behouden');
    foreach ([null, [['a' => ['x' => 5, 'y' => 20], 'b' => ['x' => 5, 'y' => 20]]], [['a' => ['x' => -1, 'y' => 2], 'b' => ['x' => 6, 'y' => 3]]]] as $belts) {
        $badBelts = $level; $badBelts['belts'] = $belts;
        checkRoom(failsRoom(fn() => roomLevel($badBelts), 400), 'ongeldige bandassen worden geweigerd');
    }
    $badTool = $level; $badTool['tiles'][0][0] = 48;
    checkRoom(failsRoom(fn() => roomLevel($badTool), 400), 'bouwgereedschap is geen opgeslagen buistegel');
    $badWall = $level; $badWall['tiles'][31][39] = 46;
    checkRoom(failsRoom(fn() => roomLevel($badWall), 400), 'beweegblok buiten de veldrand wordt geweigerd');
    $host = roomHandle(['action' => 'create', 'level' => $level, 'character' => 'ravi'], $directory, 100);
    checkRoom(strlen($host['code']) === 6 && strlen($host['token']) === 48, 'kamer krijgt code en eigen toegangssleutel');
    $snapshot = ['state' => 'waiting', 'width' => 40, 'tiles' => $level['tiles'], 'players' => [['x' => 70, 'y' => 420, 'character' => 'ravi'], ['x' => 70, 'y' => 420, 'character' => 'boaz']], 'enemies' => [], 'dinos' => [], 'fireballs' => [], 'hazards' => []];
    $customSnapshot = $snapshot; $customSnapshot['players'][0]['appearance'] = $appearance;
    checkRoom(roomSnapshot($customSnapshot, 40, 32)['players'][0]['appearance'] === $cleanAppearance, 'eigen karakter blijft behouden in gedeelde spelstand');
    $caveSnapshot = $snapshot;
    $caveSnapshot['caveState'] = ['active' => '20,29', 'outside' => ['width' => 40, 'tiles' => $level['tiles']]];
    $caveSnapshot['sceneLevel'] = ['width' => 28, 'tiles' => array_fill(0, 16, array_fill(0, 28, 0))];
    $caveSnapshot['width'] = 28; $caveSnapshot['tiles'] = $caveSnapshot['sceneLevel']['tiles'];
    checkRoom(roomSnapshot($caveSnapshot, 40, 32) === $caveSnapshot, 'gedeelde grot accepteert eigen afmetingen en bewaart buitenwereld');
    $badCave = $caveSnapshot; $badCave['caveState']['outside']['width'] = 99;
    checkRoom(failsRoom(fn() => roomSnapshot($badCave, 40, 32), 400), 'grot zonder passende buitenwereld wordt geweigerd');
    $snapshot['helpers'] = [['x' => 163, 'y' => 418, 'w' => 26, 'h' => 30, 'alive' => true, 'reward' => 42, 'givenTo' => [0], 'giftTime' => 2.5]];
    $snapshot['movingWalls'] = [['x' => 300, 'y' => 200, 'w' => 64, 'h' => 64]];
    $snapshot['belts'] = [['platforms' => [['x' => 160, 'y' => 200, 'w' => 24, 'h' => 32]], 'running' => true]];
    $snapshot['mechanismTime'] = 1.5;
    $snapshot['vines'] = [['id' => 'vine-10-5', 'x' => 336, 'y' => 166, 'length' => 128, 'angle' => .4, 'omega' => .8]];
    $snapshot['players'][1]['vineId'] = 'vine-10-5';
    $snapshot['players'][1]['vineGrip'] = 110;
    $snapshot['players'][1]['vineCooldown'] = 0;
    $snapshot['donuts'] = [['id' => 'donut-17-11', 'kind' => 'donut', 'x' => 544, 'y' => 360, 'w' => 32, 'h' => 16, 'phase' => 'armed', 'remaining' => 2.5, 'vy' => 0]];
    $snapshot['firebars'] = [['x' => 400, 'y' => 304, 'direction' => 1, 'phase' => 0]];
    foreach (['vines','donuts','firebars'] as $mechanic) {
        $badMechanic = $snapshot; $badMechanic[$mechanic] = 'invalid';
        checkRoom(failsRoom(fn() => roomSnapshot($badMechanic, 40), 400), 'ongeldige mechaniekspelstand geweigerd');
    }
    roomHandle([...$host, 'action' => 'sync', 'snapshot' => $snapshot], $directory, 100.1);
    $guest = roomHandle(['action' => 'join', 'code' => strtolower($host['code'])], $directory, 101);
    checkRoom($guest['level'] === $level && $guest['snapshot'] === $snapshot && $guest['character'] === 'ravi', 'tweede speler ontvangt level, spelstand en juiste personageverdeling');
    checkRoom($guest['token'] !== $host['token'] && !isset($guest['host']), 'spelers hebben gescheiden toegangssleutels');
    checkRoom(failsRoom(fn() => roomHandle(['action' => 'join', 'code' => $host['code']], $directory, 101), 409), 'derde speler wordt geweigerd');
    checkRoom(failsRoom(fn() => roomHandle(['action' => 'sync', 'code' => $host['code'], 'token' => 'wrong'], $directory, 101), 403), 'een ongeldige toegangssleutel kan de kamer niet lezen');
    $input = ['right' => true, 'pipe' => true, 'taps' => ['jump' => 1, 'pipe' => 1]];
    roomHandle([...$guest, 'action' => 'sync', 'input' => $input], $directory, 101.1);
    $state = roomHandle([...$host, 'action' => 'sync'], $directory, 101.2);
    checkRoom($state['guestPresent'] && $state['input']['right'] && $state['input']['taps']['jump'] === 1 && $state['input']['pipe'] && $state['input']['taps']['pipe'] === 1, 'toetsen van tweede speler bereiken de host');
    $state = roomHandle([...$host, 'action' => 'sync'], $directory, 101.8);
    checkRoom(!$state['input']['right'] && $state['input']['taps']['jump'] === 1, 'oude toetsen stoppen na verbindingsverlies zonder sprongen te herhalen');
    $snapshot['state'] = 'playing'; $snapshot['players'][1]['x'] = 130;
    roomHandle([...$host, 'action' => 'sync', 'snapshot' => $snapshot], $directory, 102);
    $state = roomHandle([...$guest, 'action' => 'sync'], $directory, 102.1);
    checkRoom($state['snapshot']['players'][1]['x'] === 130 && $state['frame'] === 2, 'gedeelde bewegingen en opeenvolgende spelstanden bereiken de gast');
    roomHandle([...$guest, 'action' => 'sync', 'snapshot' => ['state' => 'won']], $directory, 102.2);
    $state = roomHandle([...$guest, 'action' => 'sync'], $directory, 102.3);
    checkRoom($state['snapshot']['state'] === 'playing', 'gast kan de gedeelde spelstand niet overschrijven');
    checkRoom(failsRoom(fn() => roomHandle(['action' => 'join', 'code' => '../../etc'], $directory, 102), 400), 'ongeldige kamer-code geeft geen toegang tot bestanden');
    $bad = $level; $bad['tiles'][29][2] = 0;
    checkRoom(failsRoom(fn() => roomHandle(['action' => 'create', 'level' => $bad], $directory, 102), 400), 'kamer vereist een speelbaar level met start en finish');
    roomHandle([...$guest, 'action' => 'leave'], $directory, 103);
    checkRoom(failsRoom(fn() => roomHandle([...$host, 'action' => 'sync'], $directory, 104), 410), 'kamer verlaten sluit de verbinding voor beide spelers');
    $host = roomHandle(['action' => 'create', 'level' => $level], $directory, 200);
    checkRoom(failsRoom(fn() => roomHandle(['action' => 'join', 'code' => $host['code']], $directory, 221), 410), 'verlaten host verloopt automatisch');
    echo "$checks kamertests geslaagd.\n";
} finally {
    foreach (glob($directory . '/*.json') ?: [] as $file) unlink($file);
    if (is_dir($directory)) rmdir($directory);
}
