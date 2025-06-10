// File: js/copy-workflow.js

/**
 * Startet den Copy-Workflow, der alle Dateien im Datumsbereich aus srcHandle
 * in destHandle kopiert oder verschiebt. Arbeitet parallel mit Max-Limit.
 * Registriert sich global unter window.startCopyWorkflow.
 */
(function () {
  // 1) Hilfsfunktion: rekursiver Dateiwalk
  async function* walkFiles(dirHandle, prefix = "") {
    for await (const [name, handle] of dirHandle.entries()) {
      const rel = prefix ? `${prefix}/${name}` : name;
      if (handle.kind === "file") {
        yield [rel, handle];
      } else if (handle.kind === "directory") {
        yield* walkFiles(handle, rel);
      }
    }
  }

  // 2) Hilfsfunktion: führt mehrere Tasks parallel mit maximal `limit` gleichzeitig aus
  async function parallelLimit(tasks, limit) {
    const executing = new Set();
    for (const task of tasks) {
      const p = Promise.resolve().then(() => task());
      executing.add(p);
      p.then(() => executing.delete(p)).catch(() => executing.delete(p));
      if (executing.size >= limit) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);
  }

  // 3) Hilfsfunktion: getDateRange holen wir nun aus window.getDateRange (aus js/utils-date.js)
  //    copyAndVerifyFile und moveIfVerified holen wir aus window.copyAndVerifyFile / window.moveIfVerified

  /**
   * Führt den Copy/Move-Workflow aus:
   *   – srcHandle: FileSystemDirectoryHandle (Quelle)
   *   – destHandle: FileSystemDirectoryHandle (Ziel)
   *   – startDate, endDate: Date-Objekte (nur Dateien im Zeitraum)
   *   – mode: "copy" oder "move"
   *   – logMessage: Funktion, um Meldungen ins Log zu schreiben
   */
  async function startCopyWorkflow(
    srcHandle,
    destHandle,
    startDate,
    endDate,
    mode,
    logMessage
  ) {
    if (!srcHandle || !destHandle) {
      logMessage("⚠️ Quell- oder Zielordner fehlt.");
      return;
    }
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      logMessage("⚠️ Ungültiges Datum.");
      return;
    }

    // 3.1) Erzeuge Array aller Datumsstrings im Format "YYYYMMDD"
    const startRaw = startDate.toISOString().slice(0, 10).replace(/-/g, "");
    const endRaw = endDate.toISOString().slice(0, 10).replace(/-/g, "");
    const dateRange = window.getDateRange(startRaw, endRaw);

    // 3.2) Dateien sammeln, die ins Datumfenster fallen
    const tasks = [];
    for await (const [relPath, handle] of walkFiles(srcHandle)) {
      try {
        const file = await handle.getFile();
        const lastModRaw = new Date(file.lastModified)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        // Wenn lastModRaw innerhalb von dateRange ist, Task anlegen
        if (dateRange.includes(lastModRaw)) {
          tasks.push(async () => {
            if (mode === "move") {
              await window.moveIfVerified(
                handle,
                srcHandle,
                destHandle,
                relPath
              );
              logMessage(`🚚 Verschoben: ${relPath}`);
            } else {
              await window.copyAndVerifyFile(handle, destHandle, relPath);
              logMessage(`📄 Kopiert: ${relPath}`);
            }
          });
        }
      } catch (err) {
        logMessage(`❌ Fehler beim Einlesen von ${relPath}: ${err.message}`);
      }
    }

    if (tasks.length === 0) {
      logMessage("⚠️ Keine Dateien im gewählten Zeitraum gefunden.");
      return;
    }

    // 3.3) Paralleles Ausführen der Tasks (maximal 6 gleichzeitig oder nach Bedarf anpassen)
    await parallelLimit(tasks, 6);

    logMessage(`🏁 Copy-Workflow abgeschlossen (${tasks.length} Dateien).`);
  }

  // 4) Globale Registrierung
  window.startCopyWorkflow = startCopyWorkflow;
})();
