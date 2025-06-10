<?php
session_start();
// Authentifizierungsprüfung: Nur eingeloggte Benutzer dürfen hochladen
if (!isset($_SESSION['username']) || $_SESSION['username'] === '') {
    http_response_code(401);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => 'Nicht angemeldet']);
    exit;
}
$username = $_SESSION['username'];

// Nur POST-Requests erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => 'Nur POST erlaubt']);
    exit;
}

// Basis-Verzeichnis: /var/www/html/v/users/accounts/<username>/uploads
$baseDir = __DIR__ . "/../../users/accounts/$username/uploads";
if (!is_dir($baseDir)) {
    mkdir($baseDir, 0755, true);
}

// Prüfen, ob eine Datei übergeben wurde
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => 'Fehler beim Datei-Upload']);
    exit;
}

// Optional: Dateigrößen-Limit prüfen (z. B. max. 20 MB)
// if ($_FILES['file']['size'] > 20 * 1024 * 1024) {
//     http_response_code(413);
//     header('Content-Type: application/json; charset=UTF-8');
//     echo json_encode(['status' => 'error', 'message' => 'Datei zu groß (max. 20 MB)']);
//     exit;
// }

// Optional: Dateityp-Whitelist (z. B. Nur Bilder/Dokumente)
// $allowedExt = ['jpg','jpeg','png','pdf','txt','mp3'];
// $filename_safe = basename($_FILES['file']['name']);
// $ext = strtolower(pathinfo($filename_safe, PATHINFO_EXTENSION));
// if (!in_array($ext, $allowedExt)) {
//     http_response_code(415);
//     header('Content-Type: application/json; charset=UTF-8');
//     echo json_encode(['status' => 'error', 'message' => 'Dateityp nicht erlaubt']);
//     exit;
// }

$filename   = basename($_FILES['file']['name']);
$destination = "$baseDir/$filename";

// Verschiebe die Datei in das Upload-Verzeichnis des eingeloggten Nutzers
if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'error', 'message' => 'Konnte Datei nicht speichern']);
    exit;
}

// Erfolgreiche Antwort (Pfad relativ zur Web-Root)
http_response_code(200);
header('Content-Type: application/json; charset=UTF-8');
echo json_encode([
    'status' => 'success',
    'path'   => "/v/users/accounts/$username/uploads/$filename"
]);
