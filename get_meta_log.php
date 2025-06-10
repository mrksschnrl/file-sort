<?php
// Datei: /var/www/html/v/packages/file-sort/get_meta_log.php

session_start();
header('Content-Type: application/json; charset=UTF-8');

// 1) Session-Check: Nur eingeloggte Benutzer dürfen ihren Meta-Log abrufen
if (!isset($_SESSION['username']) || $_SESSION['username'] === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht angemeldet']);
    exit;
}
$username = $_SESSION['username'];

// 2) Pfad zur Meta-Logdatei im Benutzerordner:
//    /var/www/html/v/users/accounts/<username>/meta-log.txt
$logPath = __DIR__ . "/../../users/accounts/$username/meta-log.txt";

// 3) Existenz prüfen
if (!file_exists($logPath)) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Kein Log gefunden']);
    exit;
}

// 4) Inhalt auslesen
$content = file_get_contents($logPath);
if ($content === false) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Konnte Log nicht lesen']);
    exit;
}

// 5) Log-Inhalt als JSON zurückgeben
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'log'    => $content
]);
