<?php
// Zelfstandige starter en router voor de ingebouwde PHP-webserver.
$root = realpath(__DIR__ . '/../public_html');

if (PHP_SAPI === 'cli-server') {
    // ES-modules hebben ook bij PHP het JavaScript MIME-type nodig.
    $path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
    $file = realpath($root . $path);
    if ($file !== false && str_starts_with($file, $root . DIRECTORY_SEPARATOR)
        && is_file($file) && strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'mjs') {
        header('Content-Type: text/javascript; charset=utf-8');
        readfile($file);
        return true;
    }
    return false;
}

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$port = getenv('PORT') ?: '8080';
if (!ctype_digit($port) || (int) $port < 1 || (int) $port > 65535) {
    fwrite(STDERR, "PORT moet tussen 1 en 65535 liggen.\n");
    exit(1);
}
echo "Bravios draait op http://localhost:$port (stop met Ctrl+C)\n";
$command = escapeshellarg(PHP_BINARY) . ' -S ' . escapeshellarg("0.0.0.0:$port")
    . ' -t ' . escapeshellarg($root) . ' ' . escapeshellarg(__FILE__);
passthru($command, $status);
exit($status);
