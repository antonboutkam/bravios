<?php
declare(strict_types=1);

// A two-player relay: the host browser runs the game, PHP exchanges inputs and snapshots.
function roomCharacterIds(?string $root = null): array {
    $characters = [];
    foreach (glob(($root ?? __DIR__ . '/../gameplay/characters') . '/*/character.json') ?: [] as $filename) {
        $config = json_decode((string)file_get_contents($filename), true);
        $id = basename(dirname($filename));
        if (is_array($config) && preg_match('/^[a-z][a-z0-9-]{0,39}$/D', $id)
            && !in_array($id, ['custom', 'shared', '__proto__', 'constructor', 'prototype'], true)
            && ($config['id'] ?? null) === $id) $characters[] = $id;
    }
    sort($characters, SORT_STRING);
    return $characters;
}

function roomFail(int $status, string $message): never {
    throw new RuntimeException($message, $status);
}
function roomLevel(mixed $level): array {
    if (!is_array($level) || ($level['version'] ?? null) !== 1 || !is_int($level['width'] ?? null)
        || $level['width'] < 20 || $level['width'] > 360 || !in_array($level['theme'] ?? '', ['grass', 'sunset', 'night', 'castle', 'winter', 'underwater', 'underwater-night', 'moon'], true)
        || !is_string($level['name'] ?? null) || strlen($level['name']) > 192 || trim($level['name']) === '') roomFail(400, 'Ongeldig level.');
    if (isset($level['background']) && !in_array($level['background'], ['teapots', 'candy', 'space', 'jellyfish'], true)) roomFail(400, 'Onbekende achtergrond.');
    $height = $level['height'] ?? 16;
    if (!is_int($height) || $height < 16 || $height > 64) roomFail(400, 'Ongeldige veldhoogte.');
    if (array_key_exists('undergroundDepth', $level) && (!is_int($level['undergroundDepth']) || $level['undergroundDepth'] < 4 || $height - $level['undergroundDepth'] < 16)) roomFail(400, 'Ongeldige ondergrondse diepte.');
    if (array_key_exists('terrainSeed', $level) && (!is_int($level['terrainSeed']) || $level['terrainSeed'] < 0 || $level['terrainSeed'] > 4294967295)) roomFail(400, 'Ongeldige blokvariatie.');
    if (!is_array($level['tiles'] ?? null) || count($level['tiles']) !== $height) roomFail(400, 'Ongeldig bouwveld.');
    $start = 0; $finish = 0;
    foreach ($level['tiles'] as $y => $row) {
        if (!is_array($row) || count($row) !== $level['width']) roomFail(400, 'Ongeldig bouwveld.');
        foreach ($row as $x => $tile) {
            if (!is_int($tile) || $tile < 0 || ($tile > 77 && !in_array($tile, [80,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101], true)) || $tile === 13 || $tile === 48) roomFail(400, 'Ongeldig onderdeel.');
            if (in_array($tile, [46, 47], true) && ($x + 1 >= $level['width'] || $y + 1 >= $height)) roomFail(400, 'Beweegblok buiten het veld.');
            $start += (int) ($tile === 10); $finish += (int) ($tile === 11);
        }
    }
    if (array_key_exists('enemyDesigns', $level)) $level['enemyDesigns'] = roomEnemyDesigns($level['enemyDesigns'], $level['tiles']);
    if (array_key_exists('belts', $level)) {
        if (!is_array($level['belts']) || count($level['belts']) > 32) roomFail(400, 'Ongeldige lopende banden.');
        foreach ($level['belts'] as $belt) {
            foreach (['a', 'b'] as $axis) {
                $p = $belt[$axis] ?? null;
                if (!is_array($p) || !is_int($p['x'] ?? null) || !is_int($p['y'] ?? null) || $p['x'] < 0 || $p['x'] >= $level['width'] || $p['y'] < 0 || $p['y'] >= $height) roomFail(400, 'Ongeldige as.');
            }
            if ($belt['a']['x'] === $belt['b']['x'] && $belt['a']['y'] === $belt['b']['y']) roomFail(400, 'Kies twee verschillende assen.');
        }
    }
    if ($start !== 1 || $finish !== 1) roomFail(400, 'Plaats eerst een startplek en een finishvlag.');
    if (isset($level['challenge'])) {
        $c = $level['challenge'];
        if (!is_array($c) || !in_array($c['kind'] ?? '', ['coin-race', 'coin-team'], true)
            || !is_int($c['seconds'] ?? null) || $c['seconds'] < 30 || $c['seconds'] > 300
            || !is_int($c['target'] ?? null) || $c['target'] < 1 || $c['target'] > 2000) roomFail(400, 'Ongeldige muntjesuitdaging.');
    }
    return $level;
}
function roomEnemyDesigns(mixed $entries, array $tiles): array {
    if (!is_array($entries) || !array_is_list($entries) || count($entries) > 256) roomFail(400, 'Maximaal 256 bewerkte vijanden per veld.');
    $options = [
        'head' => ['original', 'mushroom', 'turtle', 'robot'], 'body' => ['original', 'turtle', 'mushroom', 'robot'],
        'hat' => ['none', 'party', 'top', 'crown', 'propeller'], 'wings' => ['none', 'feather', 'bat', 'butterfly'],
        'wingSize' => ['small', 'medium', 'large'], 'wingColor' => ['cream', 'pink', 'blue', 'green', 'purple', 'orange']
    ];
    $defaults = ['head' => 'original', 'body' => 'original', 'hat' => 'none', 'wings' => 'none', 'wingSize' => 'medium', 'wingColor' => 'cream'];
    $seen = []; $result = [];
    foreach ($entries as $entry) {
        if (!is_array($entry) || !is_int($entry['x'] ?? null) || !is_int($entry['y'] ?? null) || !is_int($entry['tileId'] ?? null)
            || !in_array($entry['tileId'], [6,14,15,17,18,19,20,21,22,23,24,25,27,28,29,30,61,70,71,72,73,77,82,83,84,85,86,87,88,91,92,93,94,95,96,97,98], true)
            || ($tiles[$entry['y']][$entry['x']] ?? null) !== $entry['tileId']) roomFail(400, 'Ontwerp zonder bijbehorende vijand.');
        $key = $entry['x'] . ',' . $entry['y'];
        if (isset($seen[$key])) roomFail(400, 'Dubbel vijandontwerp.');
        $seen[$key] = true;
        if (!is_array($entry['design'] ?? null)) roomFail(400, 'Ongeldig vijandontwerp.');
        $design = [];
        foreach ($options as $field => $allowed) {
            $value = $entry['design'][$field] ?? $defaults[$field];
            if (!in_array($value, $allowed, true)) roomFail(400, 'Onbekend vijandonderdeel.');
            $design[$field] = $value;
        }
        if ($entry['tileId'] === 83) {
            $design['length'] = $entry['design']['length'] ?? 4;
            if (!is_int($design['length']) || $design['length'] < 2 || $design['length'] > 10) roomFail(400, 'Ongeldige lengte.');
        }
        $design['fly'] = $entry['design']['fly'] ?? false;
        if (!is_bool($design['fly']) || ($design['fly'] && ($design['wings'] === 'none' || in_array($entry['tileId'], [14,15,19,23,24,30,61,70,71,72,73,77,82,83,84,85,86,87,88,91,92,93,94,95,96,97,98], true)))) roomFail(400, 'Ongeldig vlieggedrag.');
        $result[] = ['x' => $entry['x'], 'y' => $entry['y'], 'tileId' => $entry['tileId'], 'design' => $design];
    }
    return $result;
}
function roomAppearance(mixed $appearance): ?array {
    if (!is_array($appearance)) return null;
    $parts = [
        'head' => ['dino', 'grey', 'blonde', 'mohawk', 'spikes'],
        'outfit' => ['green-overalls', 'red-overalls', 'princess', 'red-hero', 'green-hero', 'chicken', 'coat'],
        'shoes' => ['clown', 'heels', 'ice', 'roller', 'skis'],
    ];
    $result = [];
    foreach ($parts as $key => $allowed) {
        if (!in_array($appearance[$key] ?? null, $allowed, true)) return null;
        $result[$key] = $appearance[$key];
    }
    $name = is_string($appearance['name'] ?? null) ? trim($appearance['name']) : 'Mijn held';
    preg_match('/^.{0,32}/us', $name, $match);
    $result['name'] = ($match[0] ?? '') ?: 'Mijn held';
    $result['accessories'] = []; $hat = false;
    $requested = is_array($appearance['accessories'] ?? null) ? $appearance['accessories'] : [];
    foreach (['glasses', 'earrings', 'paint', 'rainbow', 'bandana', 'red-cap', 'green-cap', 'feathers', 'motor', 'mushroom'] as $index => $id) {
        if (!in_array($id, $requested, true) || ($index >= 4 && $hat)) continue;
        if ($index >= 4) $hat = true;
        $result['accessories'][] = $id;
    }
    return $result;
}
function roomInput(mixed $input): array {
    $input = is_array($input) ? $input : []; $result = ['appearance' => roomAppearance($input['appearance'] ?? null)];
    foreach (['left', 'right', 'jump', 'fire', 'mount', 'pipe'] as $key) $result[$key] = ($input[$key] ?? false) === true;
    foreach (['jump', 'fire', 'mount', 'pipe'] as $key) {
        $value = $input['taps'][$key] ?? 0;
        $result['taps'][$key] = is_int($value) && $value >= 0 && $value <= 100000000 ? $value : 0;
    }
    return $result;
}
function roomSnapshot(mixed $snapshot, int $width, int $height = 16): array {
    if (is_array($snapshot) && isset($snapshot['caveState']['active'])) {
        $outside = $snapshot['caveState']['outside'] ?? null;
        $scene = $snapshot['sceneLevel'] ?? null;
        if (!is_array($outside) || ($outside['width'] ?? null) !== $width || count($outside['tiles'] ?? []) !== $height || !is_array($scene) || ($scene['width'] ?? null) !== 28 || count($scene['tiles'] ?? []) !== 16) roomFail(400, 'Ongeldige grotwereld.');
        $width = 28; $height = 16;
    }

    if (!is_array($snapshot) || ($snapshot['width'] ?? 0) !== $width || !in_array($snapshot['state'] ?? '', ['waiting', 'playing', 'paused', 'won'], true)
        || !is_array($snapshot['players'] ?? null) || count($snapshot['players']) !== 2
        || !is_array($snapshot['tiles'] ?? null) || count($snapshot['tiles']) !== $height) roomFail(400, 'Ongeldige spelstand.');
    foreach ($snapshot['players'] as &$p) {
        if (!is_array($p) || !is_numeric($p['x'] ?? null) || !is_numeric($p['y'] ?? null) || !in_array($p['character'] ?? '', roomCharacterIds(), true)) roomFail(400, 'Ongeldige speler.');
        if (array_key_exists('appearance', $p)) $p['appearance'] = roomAppearance($p['appearance']);
    }
    unset($p);
    foreach (['movingWalls', 'belts', 'vines', 'donuts', 'firebars'] as $key) if (array_key_exists($key, $snapshot) && !is_array($snapshot[$key])) roomFail(400, 'Ongeldige mechanieken.');
    if (array_key_exists('helpers', $snapshot) && !is_array($snapshot['helpers'])) roomFail(400, 'Ongeldige helpers.');
    foreach (['enemies', 'dinos', 'fireballs', 'hazards'] as $key) if (!is_array($snapshot[$key] ?? null)) roomFail(400, 'Ongeldige spelstand.');
    return $snapshot;
}
function roomHandle(array $body, string $directory, ?float $clock = null): array {
    $now = $clock ?? microtime(true); $action = $body['action'] ?? '';
    if (!in_array($action, ['create', 'join', 'sync', 'leave'], true)) roomFail(400, 'Onbekende kameractie.');
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) roomFail(503, 'Kamers kunnen nu niet worden bewaard.');
    if ($action === 'create') {
        $level = roomLevel($body['level'] ?? null);
        $character = $body['character'] ?? (roomCharacterIds()[0] ?? '');
        if (!in_array($character, roomCharacterIds(), true)) roomFail(400, 'Kies een beschikbaar karakter.');
        // Expired rooms are temporary data, never level-library files.
        foreach (glob($directory . '/*.json') ?: [] as $old) if ((filemtime($old) ?: 0) < $now - 7200) @unlink($old);
        for ($attempt = 0; $attempt < 10; $attempt++) {
            $code = ''; $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            for ($i = 0; $i < 6; $i++) $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            $file = @fopen($directory . '/' . $code . '.json', 'x+');
            if ($file !== false) break;
        }
        if ($file === false) roomFail(503, 'Een nieuwe kamer maken lukt nu niet.');
        $host = bin2hex(random_bytes(24));
        $room = ['code' => $code, 'level' => $level, 'character' => $character, 'host' => $host, 'guest' => null,
            'hostSeen' => $now, 'guestSeen' => 0, 'inputSeen' => 0, 'input' => roomInput([]), 'snapshot' => null, 'frame' => 0, 'closed' => false];
        flock($file, LOCK_EX); fwrite($file, json_encode($room, JSON_THROW_ON_ERROR)); fflush($file); flock($file, LOCK_UN); fclose($file);
        return ['code' => $code, 'token' => $host, 'role' => 'host'];
    }
    $code = strtoupper(trim((string) ($body['code'] ?? '')));
    if (!preg_match('/^[A-HJ-NP-Z2-9]{6}$/D', $code)) roomFail(400, 'Vul de kamer-code van 6 tekens in.');
    $file = @fopen($directory . '/' . $code . '.json', 'r+');
    if ($file === false) roomFail(404, 'Deze kamer bestaat niet meer. Maak een nieuwe kamer.');
    if (!flock($file, LOCK_EX)) { fclose($file); roomFail(503, 'De kamer is even bezet.'); }
    try {
        $room = json_decode(stream_get_contents($file), true, 64, JSON_THROW_ON_ERROR);
        if ($room['closed'] || $now - $room['hostSeen'] > 20) roomFail(410, 'De kamer is gesloten. Maak een nieuwe kamer.');
        if ($action === 'join') {
            if ($room['guest'] !== null) roomFail(409, 'Deze kamer heeft al twee spelers.');
            $room['guest'] = bin2hex(random_bytes(24)); $room['guestSeen'] = $now;
            $result = ['code' => $code, 'token' => $room['guest'], 'role' => 'guest', 'character' => $room['character'], 'level' => $room['level'], 'snapshot' => $room['snapshot'], 'frame' => $room['frame']];
        } else {
            $token = $body['token'] ?? '';
            $role = is_string($token) && hash_equals($room['host'], $token) ? 'host' :
                (is_string($token) && is_string($room['guest']) && hash_equals($room['guest'], $token) ? 'guest' : null);
            if ($role === null) roomFail(403, 'Deze speler hoort niet bij de kamer.');
            if ($action === 'leave') { $room['closed'] = true; $result = ['closed' => true]; }
            else {
                $room[$role . 'Seen'] = $now;
                if ($role === 'host' && isset($body['snapshot'])) {
                    $room['snapshot'] = roomSnapshot($body['snapshot'], $room['level']['width'], count($room['level']['tiles'])); $room['frame']++;
                }
                if ($role === 'guest') { $room['input'] = roomInput($body['input'] ?? []); $room['inputSeen'] = $now; }
                $result = ['code' => $code, 'guestPresent' => $room['guest'] !== null && $now - $room['guestSeen'] < 10,
                    'hostPresent' => $now - $room['hostSeen'] < 6, 'frame' => $room['frame']];
                if ($role === 'host') $result['input'] = $now - $room['inputSeen'] < .5 ? $room['input'] : roomInput(['taps' => $room['input']['taps'], 'appearance' => $room['input']['appearance'] ?? null]);
                else $result['snapshot'] = $room['snapshot'];
            }
        }
        rewind($file); ftruncate($file, 0); fwrite($file, json_encode($room, JSON_THROW_ON_ERROR)); fflush($file);
        return $result;
    } finally { flock($file, LOCK_UN); fclose($file); }
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    try {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') roomFail(405, 'Gebruik POST voor kamers.');
        $raw = file_get_contents('php://input', false, null, 0, 1500001);
        if (strlen($raw) > 1500000) roomFail(413, 'Dit kamerbericht is te groot.');
        $body = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        if (!is_array($body)) roomFail(400, 'Ongeldig kamerbericht.');
        $directory = sys_get_temp_dir() . '/bravios-rooms-' . substr(hash('sha256', __DIR__), 0, 16);
        echo json_encode(roomHandle($body, $directory), JSON_THROW_ON_ERROR);
    } catch (JsonException $error) { http_response_code(400); echo json_encode(['error' => 'Ongeldig kamerbericht.']); }
    catch (RuntimeException $error) { http_response_code($error->getCode() >= 400 ? $error->getCode() : 503); echo json_encode(['error' => $error->getMessage()]); }
}
