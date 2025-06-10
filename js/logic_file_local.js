// File: js/logic_file_local.js

/**
 * Kopiert oder verschiebt Dateien im Local Mode.
 * Registriert processLocalFiles als globale Funktion unter window.processLocalFiles.
 */
(function () {
  async function processLocalFiles(
    sourceHandle,
    destinationHandle,
    mode = "copy"
  ) {
    const log = document.getElementById("log");
    const progress = document.getElementById("progress-bar");
    const outputList = document.getElementById("copy-progress");
    const fileLog = document.getElementById("toggle-file-log");

    const logMessage = (msg) => {
      if (log) {
        log.textContent += "\n" + msg;
        log.scrollTop = log.scrollHeight;
      } else {
        console.log("[LOG]", msg);
      }
    };

    if (!sourceHandle || !destinationHandle) {
      logMessage("⚠️ Quell- oder Zielordner fehlen.");
      return;
    }

    logMessage(`📦 Starte ${mode === "copy" ? "Kopieren" : "Verschieben"}...`);
    logMessage(`📂 Quelle: ${sourceHandle.name}`);
    logMessage(`📁 Ziel: ${destinationHandle.name}`);

    // Zähle Dateien im Quellordner
    let fileCount = 0;
    for await (const entry of sourceHandle.values()) {
      if (entry.kind === "file") fileCount++;
    }
    if (fileCount === 0) {
      logMessage("⚠️ Keine Dateien im Quellordner gefunden.");
      return;
    }

    // Fortschrittsbalken initialisieren
    if (progress) {
      progress.value = 0;
      progress.max = fileCount;
    }

    let completed = 0;

    for await (const entry of sourceHandle.values()) {
      if (entry.kind !== "file") continue;

      const filename = entry.name;
      const srcFile = await entry.getFile();
      let skip = false;

      // Existenz- und Größenprüfung
      try {
        const existingFH = await destinationHandle.getFileHandle(filename, {
          create: false,
        });
        const existingFile = await existingFH.getFile();

        if (existingFile.size === srcFile.size) {
          logMessage(
            `⚠️ Datei bereits vorhanden (gleiche Größe): ${filename} – übersprungen`
          );
          skip = true;
        } else {
          logMessage(
            `⚠️ Datei vorhanden, Größe unterscheidet sich: ${filename} – wird ersetzt`
          );
        }
      } catch {
        // Datei existiert nicht → kopieren
      }

      if (skip) {
        if (progress) progress.value = ++completed;
        continue;
      }

      try {
        // Datei kopieren/verschieben
        const destFH = await destinationHandle.getFileHandle(filename, {
          create: true,
        });
        const writable = await destFH.createWritable();
        await srcFile.stream().pipeTo(writable);

        if (mode === "move" && "removeEntry" in sourceHandle) {
          await sourceHandle.removeEntry(filename);
        }

        if (fileLog?.checked && outputList) {
          const item = document.createElement("li");
          item.textContent = `✅ ${
            mode === "copy" ? "Kopiert" : "Verschoben"
          }: ${filename}`;
          outputList.appendChild(item);
        }

        completed++;
        if (progress) progress.value = completed;
        logMessage(`✅ Verarbeitet: ${filename}`);
      } catch (err) {
        if (outputList) {
          const item = document.createElement("li");
          item.textContent = `❌ Fehler bei ${filename}: ${err.message}`;
          item.style.color = "red";
          outputList.appendChild(item);
        }
        logMessage(`❌ Fehler bei ${filename}: ${err.message}`);
        completed++;
        if (progress) progress.value = completed;
      }
    }

    logMessage(
      `✅ Vorgang abgeschlossen. ${completed} von ${fileCount} Datei(en) verarbeitet.`
    );
  }

  // Globale Registrierung
  window.processLocalFiles = processLocalFiles;
})();
