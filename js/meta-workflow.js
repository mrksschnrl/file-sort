// File: js/meta-workflow.js

/**
 * Initialisiert den Meta-Workflow. Registriert initMetaWorkflow global.
 * Beim Klick auf den Button (#btn-gen-meta) wird das Backend per AJAX
 * (meta_generator.php) aufgerufen und anschließend pollt man get_meta_log.php.
 */
(function () {
  function initMetaWorkflow({
    btnGenMeta,
    btnSortFiles,
    fromInput,
    toInput,
    logMessage,
    getSrcDirHandle,
    getDestDirHandle,
  }) {
    // 1) Klick auf "Metadaten generieren"
    if (btnGenMeta) {
      btnGenMeta.addEventListener("click", (e) => {
        e.preventDefault();
        startMetaWorkflow();
      });
    }

    // 2) Klick auf "Dateien sortieren" (falls benötigt)
    if (btnSortFiles) {
      btnSortFiles.addEventListener("click", (e) => {
        e.preventDefault();
        // Hier kannst du deine Sortier-Logik starten, z.B. ein anderes PHP aufrufen
        console.log("Datei-Sortier-Workflow starten");
      });
    }

    // 3) Funktion, die das Meta-Generator-Skript aufruft
    function startMetaWorkflow() {
      console.log("Meta-Workflow gestartet");
      fetch("/v/packages/file-sort/meta_generator.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Optional kannst du hier z.B. die Datumsfilter aus fromInput/toInput mitschicken:
          from: fromInput ? fromInput.value : null,
          to: toInput ? toInput.value : null,
          // Und ggf. Source/Target-Ordner, falls File-System-Access genutzt wird
          // srcDir: getSrcDirHandle ? await getSrcDirHandle() : null,
          // destDir: getDestDirHandle ? await getDestDirHandle() : null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            console.log("Meta-Generator gestartet:", data.message);
            // Polling starten, um den Log in #meta-log-output anzuzeigen
            pollMetaLog();
          } else {
            console.error(
              "Fehler beim Starten des Meta-Generators:",
              data.message
            );
          }
        })
        .catch((err) => console.error("Fetch-Fehler meta_generator:", err));
    }

    // 4) Polling-Funktion: Liest alle 2 Sekunden das Backend-Log aus
    function pollMetaLog() {
      const interval = setInterval(() => {
        fetch("/v/packages/file-sort/get_meta_log.php")
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              // Hier nehmen wir an, dass es ein <pre id="meta-log-output"> gibt
              const logContainer = document.getElementById("meta-log-output");
              if (logContainer) {
                logContainer.textContent = data.log;
              }
              // Optional: Erkennungslogik, ob der Workflow abgeschlossen ist,
              // damit clearInterval(interval) ausgeführt wird.
              // Z.B. wenn data.log eine bestimmte Nachricht enthält.
            } else if (
              data.status === "error" &&
              data.message === "Kein Log gefunden"
            ) {
              // Log existiert noch nicht → kein Fehler anzeigen
            } else {
              console.error("Fehler beim Abrufen des Meta-Logs:", data.message);
            }
          })
          .catch((err) => console.error("Fetch-Fehler get_meta_log:", err));
      }, 2000);
    }
  }

  // Globale Registrierung
  window.initMetaWorkflow = initMetaWorkflow;
})();
