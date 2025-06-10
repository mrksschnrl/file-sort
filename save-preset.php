<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
// Authentifizierungsprüfung: Nur eingeloggte Benutzer dürfen Presets speichern
if (!isset($_SESSION['username']) || $_SESSION['username'] === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht angemeldet']);
    exit;
}
$username = $_SESSION['username'];

// Nur POST-Requests sind erlaubt
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Nur POST erlaubt']);
    exit;
}

// Preset-Daten aus dem Request
$presetName = trim($_POST['presetName'] ?? '');
$presetData = $_POST['presetData'] ?? '';

// Nur alphanumerische Preset-Namen (+ Unterstrich, Bindestrich) erlauben
if (!preg_match('/^[A-Za-z0-9_-]+$/', $presetName)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ungültiger Preset-Name']);
    exit;
}

// Verzeichnis: /var/www/html/v/users/accounts/<username>/presets
$presetDir = __DIR__ . "/../../users/accounts/$username/presets";
if (!is_dir($presetDir)) {
    mkdir($presetDir, 0755, true);
}

// JSON-Daten in Datei schreiben
$filePath = "$presetDir/$presetName.json";
if (false === file_put_contents($filePath, $presetData)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Konnte Preset nicht speichern']);
    exit;
}

// Erfolgreiche Rückmeldung
http_response_code(200);
echo json_encode(['status' => 'success', 'message' => 'Preset gespeichert']);
