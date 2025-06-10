// File: js/logic_file_ops.js

/**
 * Beispielhafte Datei-Operations-Logik (z.h., Kopieren, Umbenennen, Löschen lokal).
 * Registriert alle öffentlich nutzbaren Funktionen unter window, z.B. window.doFileOperation.
 */
(function () {
  /**
   * Führt eine Operation auf einer Datei im Quellordner durch und speichert sie vielleicht im Ziel.
   * @param {FileSystemFileHandle} fileHandle – Handle zur Datei
   * @param {string} operation – "delete", "rename", "copy" o. Ä.
   * @param {Object} options – weitere Optionen (z. B. neues Ziel, neuer Name)
   */
  async function doFileOperation(fileHandle, operation, options = {}) {
    const log = document.getElementById("log");
    const logMessage = (msg) => {
      if (log) {
        log.textContent += "\n" + msg;
        log.scrollTop = log.scrollHeight;
      } else {
        console.log("[FileOps][LOG]", msg);
      }
    };

    if (!fileHandle) {
      logMessage("⚠️ Kein FileHandle übergeben.");
      return;
    }

    try {
      switch (operation) {
        case "delete":
          if ("removeEntry" in fileHandle) {
            // Wenn fileHandle ein DirectoryHandle wäre, könnte man removeEntry nutzen.
            // Bei FileHandle selbst braucht man ParentDirectoryHandle, hier als Beispiel:
            const parent = options.parentDirHandle;
            if (parent && parent.removeEntry) {
              await parent.removeEntry(fileHandle.name);
              logMessage(`🗑️ Datei gelöscht: ${fileHandle.name}`);
            } else {
              logMessage(
                `❌ Löschen nicht möglich, Parent-Handle fehlt oder unterstützt nicht removeEntry`
              );
            }
          }
          break;

        case "rename":
          // Umbenennen eines FileHandles: darf nur über Copy+Delete oder move erfolgen.
          // Beispiel: Kopiere in Ziel mit neuem Namen, lösche altes File
          const newName = options.newName;
          const parentDir = options.parentDirHandle;
          if (parentDir && newName) {
            // Alte Datei lesen
            const fileData = await fileHandle.getFile();
            const existingData = await fileData.arrayBuffer();

            // Neues File anlegen und schreiben
            const newFH = await parentDir.getFileHandle(newName, {
              create: true,
            });
            const writable = await newFH.createWritable();
            await writable.write(existingData);
            await writable.close();

            // Danach altes File löschen
            await parentDir.removeEntry(fileHandle.name);
            logMessage(`✏️ Datei umbenannt: ${fileHandle.name} → ${newName}`);
          } else {
            logMessage(
              `❌ Umbenennen nicht möglich, Parent-Handle oder neuer Name fehlt`
            );
          }
          break;

        case "copy":
          // Kopieren ins Zielverzeichnis
          const destDir = options.destDirHandle;
          if (destDir) {
            const fileDataCopy = await fileHandle.getFile();
            // Dateiname beibehalten oder ändern?
            const copyName = options.copyName || fileHandle.name;
            const copyFH = await destDir.getFileHandle(copyName, {
              create: true,
            });
            const writableCopy = await copyFH.createWritable();
            await fileDataCopy.stream().pipeTo(writableCopy);
            logMessage(`📋 Datei kopiert: ${fileHandle.name} → ${copyName}`);
          } else {
            logMessage(`❌ Kopieren nicht möglich, Zielverzeichnis fehlt`);
          }
          break;

        default:
          logMessage(`❌ Unbekannte Operation: ${operation}`);
      }
    } catch (err) {
      logMessage(
        `❌ Fehler bei Operation "${operation}" auf ${fileHandle.name}: ${err.message}`
      );
    }
  }

  // Globale Registrierung
  window.doFileOperation = doFileOperation;
})();
