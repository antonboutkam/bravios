<?php
declare(strict_types=1);

// Permanent private collections. Kept outside public_html and never expired like rooms.
function collectionError(int $code, string $message): never { throw new RuntimeException($message, $code); }
function collectionId(mixed $id): bool { return is_string($id) && preg_match('/^[a-zA-Z0-9_-]{1,80}$/D', $id) === 1; }
function collectionInteger(mixed $value, int $min, int $max): bool { return is_int($value) && $value >= $min && $value <= $max; }
function collectionName(mixed $name): bool { return is_string($name) && trim($name) !== '' && strlen($name) <= 192; }
function collectionField(mixed $level): void {
    if (!is_array($level) || ($level['version'] ?? null) !== 1 || !collectionName($level['name'] ?? null)) collectionError(400, 'Ongeldig veld.');
    $three = ($level['kind'] ?? '') === 'platformer3d';
    if (!collectionInteger($level['width'] ?? null, 20, $three ? 80 : 360) || !collectionInteger($level['height'] ?? 16, 16, $three ? 32 : 64)
        || !in_array($level['theme'] ?? '', $three ? ['grass','winter','castle','sunset'] : ['grass','sunset','night','castle','winter','underwater','underwater-night','moon'], true)) collectionError(400, 'Ongeldige veldafmetingen of omgeving.');
    if ($three) {
        if (!collectionInteger($level['depth'] ?? null, 20, 80) || !is_array($level['objects'] ?? null) || !array_is_list($level['objects']) || count($level['objects']) > 600) collectionError(400, 'Ongeldig 3D-veld.');
        $ids = [];
        foreach ($level['objects'] as $object) {
            if (!is_array($object) || !collectionId($object['id'] ?? null) || isset($ids[$object['id']]) || !in_array($object['type'] ?? '', ['block','coin','start','finish','enemy','lava'], true)) collectionError(400, 'Ongeldig 3D-onderdeel.');
            $ids[$object['id']] = true;
            foreach (['x'=>'width','y'=>'height','z'=>'depth'] as $axis=>$limit) if (!collectionInteger($object[$axis] ?? null, 0, $level[$limit]-1)) collectionError(400, 'Onderdeel buiten het veld.');
            if (in_array($object['type'], ['block','lava'], true)) foreach (['w'=>['x','width'],'h'=>['y','height'],'d'=>['z','depth']] as $size=>[$axis,$limit]) if (!collectionInteger($object[$size] ?? null, 1, 80) || $object[$axis]+$object[$size] > $level[$limit]) collectionError(400, 'Ongeldig 3D-blok.');
        }
    } else {
        $height = $level['height'] ?? 16;
        if (isset($level['undergroundDepth']) && !collectionInteger($level['undergroundDepth'], 4, $height-16)) collectionError(400, 'Ongeldige ondergrondse diepte.');
        if (!is_array($level['tiles'] ?? null) || !array_is_list($level['tiles']) || count($level['tiles']) !== $height) collectionError(400, 'Ongeldig bouwveld.');
        foreach ($level['tiles'] as $row) {
            if (!is_array($row) || !array_is_list($row) || count($row) !== $level['width']) collectionError(400, 'Ongeldige rij.');
            foreach ($row as $tile) if (!collectionInteger($tile, 0, 101) || in_array($tile, [13,48,78,79,81], true)) collectionError(400, 'Ongeldig blokje.');
        }
        // Incomplete drafts are allowed: a missing start or finish must not prevent saving.
    }
}
function collectionValidate(mixed $data): array {
    if (!is_array($data) || !collectionInteger($data['revision'] ?? null, 0, PHP_INT_MAX-1)
        || !is_array($data['levels'] ?? null) || !array_is_list($data['levels']) || count($data['levels']) > 100
        || !is_array($data['worlds'] ?? null) || !array_is_list($data['worlds']) || count($data['worlds']) > 20) collectionError(400, 'Ongeldige collectie.');
    $ids = [];
    foreach ($data['levels'] as $entry) {
        if (!is_array($entry) || !is_string($entry['id'] ?? null) || strlen($entry['id']) < 1 || strlen($entry['id']) > 640 || isset($ids[$entry['id']]) || !collectionInteger($entry['saved'] ?? null, 0, PHP_INT_MAX)) collectionError(400, 'Ongeldig opgeslagen veld.');
        $ids[$entry['id']] = true; collectionField($entry['level'] ?? null);
    }
    $ids = [];
    foreach ($data['worlds'] as $world) {
        if (!is_array($world) || ($world['version'] ?? null) !== 1 || !collectionId($world['id'] ?? null) || isset($ids[$world['id']]) || !collectionName($world['name'] ?? null)
            || !is_array($world['nodes'] ?? null) || !array_is_list($world['nodes']) || count($world['nodes']) > 40
            || !is_array($world['links'] ?? null) || !array_is_list($world['links']) || count($world['links']) > 780) collectionError(400, 'Ongeldige wereld.');
        $ids[$world['id']] = true; $nodes = [];
        foreach ($world['nodes'] as $node) {
            if (!is_array($node) || !collectionId($node['id'] ?? null) || isset($nodes[$node['id']]) || !is_numeric($node['x'] ?? null) || !is_numeric($node['y'] ?? null) || $node['x'] < 32 || $node['x'] > 968 || $node['y'] < 32 || $node['y'] > 540) collectionError(400, 'Ongeldig wereldveld.');
            $nodes[$node['id']] = true; if (isset($node['level'])) collectionField($node['level']);
        }
        foreach ($world['links'] as $pair) if (!is_array($pair) || count($pair) !== 2 || !isset($nodes[$pair[0] ?? ''], $nodes[$pair[1] ?? '']) || $pair[0] === $pair[1]) collectionError(400, 'Ongeldige verbinding.');
    }
    return ['revision'=>$data['revision'], 'levels'=>$data['levels'], 'worlds'=>$data['worlds']];
}
function collectionRequest(string $directory, string $token, string $method, mixed $body = null): array {
    if (!preg_match('/^[a-f0-9]{64}$/D', $token)) collectionError(401, 'De collectiesleutel ontbreekt.');
    if (!in_array($method, ['GET','PUT'], true)) collectionError(405, 'Gebruik GET of PUT.');
    $filename = $directory . '/' . hash('sha256', $token) . '.json';
    $read = static function () use ($filename): array {
        if (!is_file($filename)) return ['revision'=>0,'levels'=>[],'worlds'=>[]];
        return json_decode((string)file_get_contents($filename), true, 128, JSON_THROW_ON_ERROR);
    };
    if ($method === 'GET') return $read();
    $data = collectionValidate($body);
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) collectionError(500, 'De server kan de opslagmap niet maken.');
    $lock = $filename . '.lock';
    if (!@mkdir($lock, 0700)) collectionError(503, 'De collectie wordt al bewaard. Probeer opnieuw.');
    $temporary = $filename . '.' . bin2hex(random_bytes(8)) . '.tmp';
    try {
        $current = $read();
        if ($current['revision'] !== $data['revision']) collectionError(409, 'De collectie is ondertussen gewijzigd.');
        $data['revision']++;
        if (file_put_contents($temporary, json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)) === false) collectionError(500, 'Schrijven is mislukt.');
        chmod($temporary, 0600);
        if (!rename($temporary, $filename)) collectionError(500, 'Bewaren is mislukt.');
        return ['revision'=>$data['revision']];
    } finally { if (is_file($temporary)) unlink($temporary); rmdir($lock); }
}
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
    try {
        $method = $_SERVER['REQUEST_METHOD'] ?? '';
        $raw = '';
        if ($method === 'PUT') {
            if (!preg_match('/^application\/json\b/i', $_SERVER['CONTENT_TYPE'] ?? '')) collectionError(415, 'Gebruik JSON.');
            $raw = file_get_contents('php://input', false, null, 0, 32*1024*1024+1);
            if (strlen($raw) > 32*1024*1024) collectionError(413, 'De collectie is te groot.');
            try { $body = json_decode($raw, true, 128, JSON_THROW_ON_ERROR); } catch (JsonException) { collectionError(400, 'Ongeldige JSON.'); }
        }
        echo json_encode(collectionRequest(getenv('BRAVIOS_DATA_DIR') ?: dirname(__DIR__, 2).'/data/collections', $_SERVER['HTTP_X_BRAVIOS_COLLECTION'] ?? '', $method, $body ?? null), JSON_THROW_ON_ERROR);
    } catch (Throwable $error) {
        $code = $error->getCode(); http_response_code($code >= 400 && $code <= 599 ? $code : 500);
        echo json_encode(['error'=>$code >= 400 && $code < 500 ? $error->getMessage() : 'De server kon de collectie niet bewaren.']);
    }
}
