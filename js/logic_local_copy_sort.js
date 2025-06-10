// File: js/logic_local_copy_sort.js

/**
 * Initialisiert das Kopier-/Sortier-Verhalten im „Local Mode“ ausschließlich
 * basierend auf dem lastModified-Zeitstempel.
 *
 * Erwartete Parameter:
 *  - srcHandle   : FileSystemDirectoryHandle (Quellordner)
 *  - destHandle  : FileSystemDirectoryHandle (Zielordner)
 *  - startDate   : Date (Untergrenze, inklusive)
 *  - endDate     : Date (Obergrenze, inklusive)
 *  - mode        : 'copy' oder 'move' (Standard: 'copy')
 *  - logMessage  : Funktion zum Loggen (empfängt einen String)
 */
(function () {
  async function initLocalCopySort({
    srcHandle,
    destHandle,
    startDate,
    endDate,
    mode = "copy",
    logMessage,
  }) {
    if (!srcHandle || !destHandle) {
      logMessage("⚠️ Quell- oder Ziel-Handle fehlt.");
      return;
    }
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      logMessage("⚠️ Ungültige Datumsangaben.");
      return;
    }

    logMessage("🔄 Starte lokalen Copy/Sort-Workflow (nach lastModified)…");
    logMessage(`📂 Quelle: ${srcHandle.name}`);
    logMessage(`📁 Ziel: ${destHandle.name}`);

    try {
      // Dateigröße zählen
      let totalFiles = 0;
      for await (const entry of srcHandle.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          const lm = file.lastModified;
          if (lm >= startDate.getTime() && lm <= endDate.getTime()) {
            totalFiles++;
          }
        }
      }

      if (totalFiles === 0) {
        logMessage("⚠️ Keine Dateien im gewählten Zeitraum gefunden.");
        return;
      }

      // Fortschrittsbar initialisieren (falls vorhanden)
      const progressBar = document.getElementById("progress-bar");
      if (progressBar) {
        progressBar.value = 0;
        progressBar.max = totalFiles;
      }

      let processed = 0;
      // Dateien erneut durchgehen und kopieren/verschieben
      for await (const entry of srcHandle.values()) {
        if (entry.kind !== "file") continue;

        const filename = entry.name;
        const file = await entry.getFile();
        const lm = file.lastModified;

        // Nur Dateien im Datumsbereich bearbeiten
        if (lm < startDate.getTime() || lm > endDate.getTime()) {
          continue;
        }

        try {
          // Ziel-DateiHandle anlegen (im Zielordner ohne Unterordner)
          const destFileHandle = await destHandle.getFileHandle(filename, {
            create: true,
          });
          const writable = await destFileHandle.createWritable();
          await file.stream().pipeTo(writable);

          logMessage(
            `✅ ${mode === "move" ? "Verschoben" : "Kopiert"}: ${filename}`
          );

          // Bei Verschieben: Datei im Quellordner löschen (sofern unterstützt)
          if (mode === "move" && "removeEntry" in srcHandle) {
            await srcHandle.removeEntry(filename);
          }
        } catch (err) {
          logMessage(`❌ Fehler bei ${filename}: ${err.message}`);
        }

        processed++;
        if (progressBar) {
          progressBar.value = processed;
        }
        logMessage(`📊 Fortschritt: ${processed}/${totalFiles}`);
      }

      logMessage("✅ Copy/Sort-Workflow abgeschlossen.");
    } catch (err) {
      logMessage(`❌ Unerwarteter Fehler: ${err.message}`);
    }
  }

  // Globale Registrierung
  window.initLocalCopySort = initLocalCopySort;
})();
