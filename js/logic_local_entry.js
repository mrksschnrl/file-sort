// File: js/logic_local_entry.js

/**
 * Listet alle Dateien im übergebenen Verzeichnis-Handle auf und zeigt sie in der UI an.
 * Registriert initLocalEntry global unter window.initLocalEntry.
 *
 * Parameter:
 *   srcHandle   – FileSystemDirectoryHandle des Quellverzeichnisses
 *   fileListUI  – DOM-Element (z. B. <ul> oder <div>), in das die Dateien gelistet werden
 *   logMessage  – Funktion, um Meldungen in einen Log auszugeben
 */
(function () {
  async function initLocalEntry(srcHandle, fileListUI, logMessage) {
    if (!srcHandle) {
      logMessage("⚠️ Kein Quellverzeichnis-Handle übergeben.");
      return;
    }
    if (!fileListUI) {
      logMessage("⚠️ Kein UI-Container zum Anzeigen der Dateien übergeben.");
      return;
    }

    // Alte Liste löschen
    fileListUI.innerHTML = "";

    logMessage(`📂 Lese Einträge aus: ${srcHandle.name}`);

    try {
      // Über alle Einträge im Verzeichnis iterieren
      for await (const entry of srcHandle.values()) {
        // Nur Dateien anzeigen, keine Unterordner
        if (entry.kind === "file") {
          const li = document.createElement("li");
          li.textContent = entry.name;
          fileListUI.appendChild(li);
        }
      }
      logMessage("✅ Lokale Einträge erfolgreich aufgelistet.");
    } catch (err) {
      logMessage(`❌ Fehler beim Auflisten der Einträge: ${err.message}`);
    }
  }

  // Global verfügbar machen
  window.initLocalEntry = initLocalEntry;
})();
