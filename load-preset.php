<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
// Authentifizierungsprüfung: Nur eingeloggte Benutzer dürfen Presets laden
if (!isset($_SESSION['username']) || $_SESSION['username'] === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht angemeldet']);
    exit;
}
$username = $_SESSION['username'];

// Nur GET-Requests sind hier vorgesehen
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Nur GET erlaubt']);
    exit;
}

// Preset-Name aus dem Query-Parameter
$presetName = trim($_GET['presetName'] ?? '');
if (!preg_match('/^[A-Za-z0-9_-]+$/', $presetName)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ungültiger Preset-Name']);
    exit;
}

// Datei: /var/www/html/v/users/accounts/<username>/presets/<presetName>.json
$filePath = __DIR__ . "/../../users/accounts/$username/presets/$presetName.json";
if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Preset nicht gefunden']);
    exit;
}

// Dateiinhalt auslesen
$content = file_get_contents($filePath);
if ($content === false) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Konnte Preset nicht lesen']);
    exit;
}

// JSON-Daten zurückliefern
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'data'   => json_decode($content, true)
]);
