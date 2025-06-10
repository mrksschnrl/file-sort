// File: js/logic_meta_local.js
(function () {
  /**
   * Durchsucht srcDirHandle rekursiv nach Dateien, filtert sie nach dem
   * Änderungsdatum (lastModified) zwischen startDate und endDate und
   * schreibt eine "meta.txt" ins Zielverzeichnis destDirHandle.
   *
   * @param {FileSystemDirectoryHandle} srcDirHandle   – Quellverzeichnis
   * @param {FileSystemDirectoryHandle} destDirHandle  – Zielverzeichnis
   * @param {Date} startDate                           – Anfangsdatum (inklusive)
   * @param {Date} endDate                             – Enddatum (inklusive)
   */
  async function generateMetaInRange(
    srcDirHandle,
    destDirHandle,
    startDate,
    endDate
  ) {
    if (!srcDirHandle || !destDirHandle) {
      console.error(
        "generateMetaInRange: srcDirHandle oder destDirHandle fehlt."
      );
      return;
    }
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      console.error(
        "generateMetaInRange: startDate und endDate müssen Date-Objekte sein."
      );
      return;
    }

    /**
     * Generator-Funktion, die rekursiv alle Dateien unterhalb von dirHandle
     * durchläuft und [relativerPfad, handle] zurückgibt.
     *
     * @param {FileSystemDirectoryHandle} dirHandle
     * @param {string} prefix
     */
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

    // Array, in das wir alle Metazeilen sammeln
    const lines = [];

    // 1) Dateien sammeln
    for await (const [relativePath, handle] of walkFiles(srcDirHandle)) {
      try {
        const file = await handle.getFile();
        const lm = file.lastModified; // Millisekunden seit 1970
        const lmDate = new Date(lm);
        // Prüfen, ob lmDate zwischen startDate und endDate liegt (inklusive)
        if (lmDate >= startDate && lmDate <= endDate) {
          // Formatiere Datum und Uhrzeit zu "YYYY-MM-DD HH:MM:SS"
          const yyyy = lmDate.getFullYear();
          const mm = String(lmDate.getMonth() + 1).padStart(2, "0");
          const dd = String(lmDate.getDate()).padStart(2, "0");
          const hh = String(lmDate.getHours()).padStart(2, "0");
          const mi = String(lmDate.getMinutes()).padStart(2, "0");
          const ss = String(lmDate.getSeconds()).padStart(2, "0");
          const timestamp = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
          // Dateigröße in Bytes
          const size = file.size;
          // Eine Zeile: "relativerPfad | timestamp | size"
          lines.push(`${relativePath} | ${timestamp} | ${size}`);
        }
      } catch (readErr) {
        console.warn(
          `generateMetaInRange: Fehler beim Lesen von ${relativePath}: ${readErr.message}`
        );
      }
    }

    // 2) Wenn keine Dateien gefunden wurden, dennoch eine leere meta.txt erzeugen
    if (lines.length === 0) {
      lines.push("Keine Dateien im angegebenen Zeitraum gefunden.");
    }

    // 3) Erzeuge (oder überschreibe) meta.txt im Zielverzeichnis
    try {
      // Hole oder erstelle den FileHandle für "meta.txt"
      const metaFH = await destDirHandle.getFileHandle("meta.txt", {
        create: true,
      });
      const writable = await metaFH.createWritable();
      // Schreibe alle Zeilen, getrennt durch "\n"
      const content = lines.join("\n");
      await writable.write(content);
      await writable.close();
      console.log("generateMetaInRange: meta.txt erfolgreich geschrieben.");
    } catch (writeErr) {
      console.error(
        "generateMetaInRange: Fehler beim Schreiben von meta.txt:",
        writeErr
      );
    }
  }

  // Globale Registrierung
  window.generateMetaInRange = generateMetaInRange;
})();
