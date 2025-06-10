// File: js/logic_meta_server.js

/**
 * Generiert Meta-Dateien im Server-Mode über fetch() → meta_generator.php.
 * Registriert generateServerMeta global unter window.generateServerMeta.
 *
 * Parameter:
 *   srcHandle    – FileSystemDirectoryHandle der Quelle
 *   serverPath   – Zielpfad auf dem Server (z. B. UNC, SFTP-Pfad o. Ä.)
 *   onComplete   – Callback, der ausgeführt wird, wenn der Upload fertig ist
 */
(function () {
  async function generateServerMeta(srcHandle, serverPath, onComplete) {
    const logMessage = (msg) => {
      const log = document.getElementById("log");
      if (log) {
        log.textContent += `\n${msg}`;
        log.scrollTop = log.scrollHeight;
      }
    };

    // Datumspicker abrufen (IDs: from-date, to-date)
    const fromPicker = document.getElementById("from-date");
    const toPicker = document.getElementById("to-date");
    if (!fromPicker || !toPicker) {
      logMessage("❌ Datumspicker nicht gefunden (IDs ‚from-date‘/‘to-date‘).");
      return;
    }

    const fromIso = fromPicker.value;
    const toIso = toPicker.value;
    if (!fromIso || !toIso) {
      logMessage("⚠️ Bitte Datum im Kalender auswählen.");
      return;
    }

    const fromTs = Date.parse(fromIso);
    // Wir nehmen das Ende des Tages (23:59:59), damit Dateien des gesamten Tages eingeschlossen sind
    const toTs = Date.parse(`${toIso}T23:59:59`);

    // Dateien im Zeitraum sammeln
    const files = [];
    async function walk(folder) {
      for await (const entry of folder.values()) {
        // macOS-Systemdateien überspringen
        if (entry.name.startsWith("._")) continue;
        if (entry.kind === "file") {
          try {
            const file = await entry.getFile();
            if (file.lastModified >= fromTs && file.lastModified <= toTs) {
              files.push({
                name: entry.name,
                size: file.size,
                lastModified: new Date(file.lastModified).toISOString(),
              });
            }
          } catch (err) {
            console.warn(
              `generateServerMeta: Fehler beim Lesen von ${entry.name}: ${err.message}`
            );
          }
        } else if (entry.kind === "directory") {
          await walk(entry);
        }
      }
    }
    await walk(srcHandle);

    if (files.length === 0) {
      logMessage("⚠️ Keine Dateien im gewählten Zeitraum.");
      return;
    }

    // JSON-Payload an PHP senden
    try {
      const res = await fetch("/meta_generator.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          from: fromIso,
          to: toIso,
          destPath: serverPath, // übergebe hier den Server-Zielpfad
        }),
      });

      const result = await res.json();
      if (res.ok) {
        logMessage(
          `✅ Server generierte ${result.count} Meta-Dateien in ${serverPath}`
        );
      } else {
        logMessage(`❌ Server-Fehler: ${result.error}`);
      }

      if (typeof onComplete === "function") {
        onComplete();
      }
    } catch (err) {
      console.error(err);
      logMessage(`❌ Fetch-Fehler: ${err.message}`);
    }
  }

  // Globale Registrierung
  window.generateServerMeta = generateServerMeta;
})();
