<?php
// Datei: /var/www/html/v/packages/file-sort/meta_generator.php

session_start();
header('Content-Type: application/json; charset=UTF-8');

// 1) Session-Check: Nur eingeloggte Benutzer dürfen Metadaten generieren
if (!isset($_SESSION['username']) || $_SESSION['username'] === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Nicht angemeldet']);
    exit;
}
$username = $_SESSION['username'];

// 2) Pfad zur Meta-Logdatei im Benutzerordner:
//    /var/www/html/v/users/accounts/<username>/meta-log.txt
$logPath = __DIR__ . "/../../users/accounts/$username/meta-log.txt";

// 3) Optional: Existiert das Benutzerverzeichnis gar nicht, kann man es anlegen.
//    In der Regel existiert /var/www/html/v/users/accounts/<username>/ bereits aus deinem Login-System.
//    Falls nicht, bitte sicherstellen, dass das Verzeichnis angelegt wird.
$userDir = dirname($logPath);
if (!is_dir($userDir)) {
    // Falls der Benutzerordner wirklich ganz neu ist, können wir ihn automatisch anlegen:
    mkdir($userDir, 0755, true);
}

// 4) Beispiel: So kannst du den bisherigen Inhalt überschreiben oder anhängen.
//    Hier löschen wir erst den alten Log (falls vorhanden), um von vorne zu beginnen:
if (file_exists($logPath)) {
    unlink($logPath);
}

// 5) Hier kommt dein vorhandener Meta-Generator-Code hin.
//    Ersetze an allen Stellen, an denen du früher $_POST['username'] oder $_GET['username']
//    genutzt hast, durch $username. Baue Dateipfade so auf, dass du die Dateien hier
//    aus /var/www/html/v/users/accounts/<username>/... liest (z. B. Uploads oder Input-Ordner).
//
//    Im Folgenden ein sehr einfaches Platzhalter-Skelett. Kopiere dort deine echte Logik hinein:

/* ===========================================
   ===  BEGINN deines Meta-Generator-Blocks  ===
   =========================================== */

// Beispiel-Skelett (nur zur Veranschaulichung — bitte durch deinen Code ersetzen):
$logBuffer = '';

// Angenommen, deine zu verarbeitenden Dateien liegen in:
// /var/www/html/v/users/accounts/<username>/uploads/
$inputFolder = __DIR__ . "/../../users/accounts/$username/uploads";

if (is_dir($inputFolder)) {
    $files = array_diff(scandir($inputFolder), ['.', '..']);
    foreach ($files as $file) {
        $filePath = "$inputFolder/$file";
        if (is_file($filePath)) {
            // Beispiel: EXIF auslesen (nur für Bilder)
            $exif = @exif_read_data($filePath);
            if ($exif !== false) {
                $date = $exif['DateTime'] ?? 'n/a';
                $cam  = $exif['Model']    ?? 'unbekannte Kamera';
                $logBuffer .= "$file | Aufnahmedatum: $date | Kamera: $cam\n";
            } else {
                $logBuffer .= "$file | Fehler: Keine EXIF-Daten gefunden\n";
            }
            // Hier könntest du weitere Metadaten auslesen (z. B. IPTC, ID3 usw.)
        }
    }
    // Meta-Log in die Datei schreiben
    file_put_contents($logPath, $logBuffer);
    // Am Ende eine Erfolgsantwort zurückgeben:
    echo json_encode([
        'status'  => 'success',
        'message' => "Metadaten-Log erzeugt: $logPath"
    ]);
} else {
    // Falls der Input-Ordner nicht existiert, geben wir eine Fehlermeldung:
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => "Input-Ordner nicht gefunden: $inputFolder"
    ]);
}

/* =========================================
   ===  ENDE deines Meta-Generator-Blocks  ===
   ========================================= */
