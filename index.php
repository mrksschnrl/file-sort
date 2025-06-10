<?php
// Fehleranzeigen aktivieren
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Session & Theme laden
session_start();
if (!isset($_SESSION['theme'])) {
    $_SESSION['theme'] = 'theme_first';
}
$theme     = $_SESSION['theme'];
$themeBase = "/v/css/themes/{$theme}/css/";

// Seiten-Titel und Theme-Flag für header.php
$pageTitle    = "File Sort";
$loadThemeCSS = true;

// Header einbinden
include __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <form id="file-sort-form">

        <!-- === Ordner-Auswahl === -->
        <fieldset id="folder-picker-panel">
            <legend>Ordner-Auswahl</legend>
            <div>
                <label for="selectSrcBtn">Quellordner:</label>
                <button id="selectSrcBtn" type="button">Ordner auswählen</button>
                <input type="text" id="sourceManual" placeholder="Pfad manuell eingeben" />
            </div>
            <div>
                <label for="selectDestBtn">Zielordner:</label>
                <button id="selectDestBtn" type="button">Ordner auswählen</button>
                <input type="text" id="destManual" placeholder="Pfad manuell eingeben" />
            </div>
        </fieldset>

        <!-- === Datumsauswahl === -->
        <fieldset id="date-panel">
            <legend>Datumsauswahl</legend>
            <div>
                <label for="from-date">Von (Datum):</label>
                <input type="date" id="from-date" />
                <input type="text" id="from-raw" placeholder="YYYYMMDD" maxlength="8" />
            </div>
            <div>
                <label for="to-date">Bis (Datum):</label>
                <input type="date" id="to-date" />
                <input type="text" id="to-raw" placeholder="YYYYMMDD" maxlength="8" />
            </div>
            <div>
                <label for="custom-date">Benutzerdefiniert:</label>
                <input type="date" id="custom-date" />
                <input type="text" id="custom-raw" placeholder="YYYYMMDD" maxlength="8" />
            </div>
        </fieldset>

    </form>

    <!-- === Schnellauswahl Buttons === -->
    <div class="quick-buttons">
        <button id="btn-today" type="button">Heute</button>
        <button id="btn-yesterday" type="button">Gestern</button>
        <button id="btn-last7" type="button">Letzte 7 Tage</button>
    </div>

    <!-- === Workflow Buttons === -->
    <div class="workflow-buttons">
        <button id="btn-gen-meta" type="button">Metadaten erstellen</button>
        <button id="btn-sort-files" type="button" disabled>Dateien sortieren</button>
    </div>

    <!-- === Console (Echtzeit-Log) === -->
    <fieldset id="console-panel">
        <legend>Konsole</legend>
        <div id="log"></div>
    </fieldset>
</div>

<!-- Scripts: erst folder-picker.js, dann dein Modul -->
<script src="/v/packages/file-sort/js/folder-picker.js" defer></script>
<script type="module" src="/v/packages/file-sort/js/ui_handlers.js" defer></script>

<?php
// Optional: Footer-Template
// include __DIR__ . '/../../includes/footer.php';
?>
