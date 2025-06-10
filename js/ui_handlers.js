// File: js/ui_handlers.js

/**
 * Initialisiert alle UI-Handler, sobald das DOM bereit ist.
 * Verwendet globale Funktionen:
 *  - window.initDateUI
 *  - window.initMetaWorkflow
 *  - window.initFolderPicker
 *  - window.processLocalFiles
 *  - window.doFileOperation
 *  - window.initLocalCopySort
 *  - window.initLocalEntry
 *  - window.initQuickButtons
 *  - window.initSyncPair
 *  - window.uploadToServer
 */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // ===== Variablen für globale Handles =====
    let srcDirHandle = null;
    let destDirHandle = null;
    let useServerOutput = false;
    let serverPath = "";
    let showFileLog = true;

    // ===== DOM-Elemente auslesen =====
    // Datumspicker und Raw-Inputs
    const fromInput = document.getElementById("from-date");
    const toInput = document.getElementById("to-date");
    const fromRawInput = document.getElementById("from-date-raw");
    const toRawInput = document.getElementById("to-date-raw");
    const customInput = document.getElementById("btn-custom-date");
    const customRawInput = document.getElementById("btn-custom-date-raw");
    const btnToday = document.getElementById("btn-today");
    const btnYesterday = document.getElementById("btn-yesterday");
    const btnLast7 = document.getElementById("btn-last7");

    // Meta-Workflow Buttons
    const btnGenMeta = document.getElementById("generate-meta");
    const btnSortFiles = document.getElementById("sort-files");

    // Modus-Wahl (copy/move)
    const modeSelect = document.getElementById("mode");

    // File-Log Toggle
    const toggleFileLogCb = document.getElementById("toggle-file-log");

    // Folder-Picker Buttons & Manual Inputs
    const selectSrcBtn = document.getElementById("select-folder");
    const sourceManual = document.getElementById("source-manual");
    const selectDestBtn = document.getElementById("select-destination");
    const destManual = document.getElementById("destination-manual");

    // Server-Output Buttons
    const setServerBtn = document.getElementById("set-server-output");
    const revertLocalBtn = document.getElementById("revert-local-output");

    // File-List und Progress
    const fileListUI = document.getElementById("file-list");
    const progressBar = document.getElementById("progress-bar");
    const copyProgressUI = document.getElementById("copy-progress");

    // Preset-Buttons and Input for Quick-Buttons
    const savePresetBtn = document.getElementById("save-preset-btn");
    const loadPresetBtn = document.getElementById("load-preset-btn");
    const presetNameInput = document.getElementById("preset-name-input");

    // Local-Entry UI
    const localEntryList = document.getElementById("local-entry-list");

    // Sync-Pair UI
    const syncSrcBtn = document.getElementById("sync-src-btn");
    const syncDestBtn = document.getElementById("sync-dest-btn");
    const syncBtn = document.getElementById("sync-btn");
    const syncLogUI = document.getElementById("sync-log");

    // Log-Ausgabe
    const logUI = document.getElementById("log");

    // ===== Initialzustände =====
    if (btnGenMeta) btnGenMeta.disabled = true;
    if (btnSortFiles) btnSortFiles.disabled = true;

    // ===== Utility-Logging =====
    function logMessage(msg) {
      const time = new Date().toLocaleTimeString();
      if (logUI) {
        logUI.textContent += `\n[${time}] ${msg}`;
        logUI.scrollTop = logUI.scrollHeight;
      } else {
        console.log(`[${time}] ${msg}`);
      }
    }

    // ===== Date ↔ Raw Synchronisation =====
    function syncDateAndRaw(dateEl, rawEl) {
      if (!dateEl || !rawEl) return;
      dateEl.addEventListener("change", () => {
        rawEl.value = dateEl.value.replace(/-/g, "");
      });
      rawEl.addEventListener("input", () => {
        const v = rawEl.value;
        if (/^\d{8}$/.test(v)) {
          dateEl.value = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6)}`;
        }
      });
    }
    syncDateAndRaw(fromInput, fromRawInput);
    syncDateAndRaw(toInput, toRawInput);
    syncDateAndRaw(customInput, customRawInput);

    // ===== Schnellwahl-Buttons =====
    if (btnToday)
      btnToday.addEventListener("click", () => {
        const today = new Date().toISOString().slice(0, 10);
        if (fromInput) fromInput.value = today;
        if (toInput) toInput.value = today;
        if (fromRawInput) fromRawInput.value = today.replace(/-/g, "");
        if (toRawInput) toRawInput.value = today.replace(/-/g, "");
        fromInput?.dispatchEvent(new Event("change"));
        toInput?.dispatchEvent(new Event("change"));
        logMessage("🔘 Schnellwahl: Heute");
      });

    if (btnYesterday)
      btnYesterday.addEventListener("click", () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const day = d.toISOString().slice(0, 10);
        if (fromInput) fromInput.value = day;
        if (toInput) toInput.value = day;
        if (fromRawInput) fromRawInput.value = day.replace(/-/g, "");
        if (toRawInput) toRawInput.value = day.replace(/-/g, "");
        fromInput?.dispatchEvent(new Event("change"));
        toInput?.dispatchEvent(new Event("change"));
        logMessage("🔘 Schnellwahl: Gestern");
      });

    if (btnLast7)
      btnLast7.addEventListener("click", () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);
        if (fromInput) fromInput.value = startStr;
        if (toInput) toInput.value = endStr;
        if (fromRawInput) fromRawInput.value = startStr.replace(/-/g, "");
        if (toRawInput) toRawInput.value = endStr.replace(/-/g, "");
        logMessage("🔘 Schnellwahl: Letzte 7 Tage");
      });

    if (customInput)
      customInput.addEventListener("change", () => {
        const val = customInput.value;
        if (fromInput) fromInput.value = val;
        if (toInput) toInput.value = val;
        if (fromRawInput) fromRawInput.value = val.replace(/-/g, "");
        if (toRawInput) toRawInput.value = val.replace(/-/g, "");
        fromInput?.dispatchEvent(new Event("change"));
        toInput?.dispatchEvent(new Event("change"));
        logMessage(`🔘 Bestimmter Tag: ${val}`);
      });

    // ===== Folder-Picker =====
    if (typeof window.initFolderPicker === "function") {
      // Wir übergeben Buttons, Manual-Inputs und logMessage an initFolderPicker
      window.initFolderPicker({
        selectSrcBtn,
        selectDestBtn,
        sourceManual,
        destManual,
        logMessage,
      });
      // Die globale Funktion initFolderPicker setzt window.srcDirHandle, window.destDirHandle
      // sobald ein Ordner gewählt wird.
      // Damit überschreiben wir die lokalen Variablen:
      window.srcDirHandle = null;
      window.destDirHandle = null;
      // Wir binden Listener, um das Ergebnis zu den lokalen Handles zu schreiben:
      selectSrcBtn?.addEventListener("click", () => {
        srcDirHandle = window.srcDirHandle;
        if (srcDirHandle && destDirHandle && btnGenMeta)
          btnGenMeta.disabled = false;
      });
      selectDestBtn?.addEventListener("click", () => {
        destDirHandle = window.destDirHandle;
        if (srcDirHandle && destDirHandle && btnGenMeta)
          btnGenMeta.disabled = false;
      });
    } else {
      console.error(
        "initFolderPicker nicht definiert. folder-picker.js muss vor ui_handlers.js geladen werden."
      );
    }

    // ===== Manuelle Pfadangaben =====
    if (sourceManual)
      sourceManual.addEventListener("change", () => {
        logMessage(`🔤 Manueller Quellpfad eingegeben: ${sourceManual.value}`);
      });
    if (destManual)
      destManual.addEventListener("change", () => {
        serverPath = destManual.value;
        logMessage(`🔤 Manueller Zielpfad eingegeben: ${serverPath}`);
      });

    // ===== Server-Output Switch =====
    if (setServerBtn)
      setServerBtn.addEventListener("click", () => {
        useServerOutput = true;
        logMessage("🌐 Server-Ziel aktiviert");
      });
    if (revertLocalBtn)
      revertLocalBtn.addEventListener("click", () => {
        useServerOutput = false;
        logMessage("💾 Lokaler Zielordner aktiv");
      });

    // ===== File-Log Toggle =====
    if (toggleFileLogCb)
      toggleFileLogCb.addEventListener("change", () => {
        showFileLog = toggleFileLogCb.checked;
      });

    // ===== Meta-Workflow =====
    if (btnGenMeta) {
      btnGenMeta.addEventListener("click", async () => {
        if (!srcDirHandle && !window.srcDirHandle) {
          return alert("Bitte Quellordner wählen.");
        }
        if (!srcDirHandle) srcDirHandle = window.srcDirHandle;

        if (!destDirHandle && !useServerOutput && !window.destDirHandle) {
          return alert("Bitte Zielordner wählen.");
        }
        if (!destDirHandle) destDirHandle = window.destDirHandle;

        if (!fromInput?.value || !toInput?.value) {
          return alert("Bitte Start- und End-Datum wählen.");
        }

        const startDate = new Date(fromInput.value);
        const endDate = new Date(toInput.value);

        try {
          if (typeof window.generateMetaInRange === "function") {
            await window.generateMetaInRange(
              srcDirHandle,
              destDirHandle,
              startDate,
              endDate
            );
            if (btnSortFiles) btnSortFiles.disabled = false;
          } else {
            throw new Error("generateMetaInRange nicht definiert");
          }
        } catch (err) {
          console.error(err);
          alert("Fehler beim Erstellen der Meta-Datei: " + err.message);
        }
      });
    }

    // ===== Dateien kopieren/verschieben =====
    if (btnSortFiles) {
      btnSortFiles.addEventListener("click", async () => {
        if (!srcDirHandle && !window.srcDirHandle) {
          return alert("Quellordner fehlt.");
        }
        if (!srcDirHandle) srcDirHandle = window.srcDirHandle;

        if (!destDirHandle && !useServerOutput && !window.destDirHandle) {
          return alert("Zielordner fehlt.");
        }
        if (!destDirHandle) destDirHandle = window.destDirHandle;

        btnSortFiles.disabled = true;
        if (fileListUI) fileListUI.innerHTML = "";
        if (copyProgressUI) copyProgressUI.innerHTML = "";
        logMessage(
          `🚀 Start ${
            modeSelect?.value === "move" ? "Verschieben" : "Kopieren"
          }`
        );

        // Dateien sammeln, die im Datumsbereich liegen
        const files = [];
        const start = new Date(fromInput.value).getTime();
        const end = new Date(toInput.value).getTime();
        for await (const [name, handle] of srcDirHandle.entries()) {
          if (handle.kind !== "file") continue;
          const file = await handle.getFile();
          if (file.lastModified >= start && file.lastModified <= end) {
            files.push({ name, handle });
          }
        }

        if (progressBar) {
          progressBar.max = files.length;
          progressBar.value = 0;
        }

        for (const { name, handle } of files) {
          if (showFileLog && copyProgressUI) {
            const li = document.createElement("li");
            li.textContent = name;
            copyProgressUI.appendChild(li);
          }
          try {
            if (useServerOutput) {
              if (typeof window.uploadToServer === "function") {
                await window.uploadToServer(await handle.getFile(), serverPath);
                logMessage(`🌐 Hochgeladen: ${name}`);
              } else {
                throw new Error("uploadToServer nicht definiert");
              }
            } else if (modeSelect?.value === "move") {
              if (typeof window.moveIfVerified === "function") {
                await window.moveIfVerified(
                  handle,
                  srcDirHandle,
                  destDirHandle,
                  name
                );
                logMessage(`🚚 Verschoben: ${name}`);
              } else {
                throw new Error("moveIfVerified nicht definiert");
              }
            } else {
              if (typeof window.copyAndVerifyFile === "function") {
                await window.copyAndVerifyFile(handle, destDirHandle, name);
                logMessage(`📄 Kopiert: ${name}`);
              } else {
                throw new Error("copyAndVerifyFile nicht definiert");
              }
            }
          } catch (err) {
            console.error(err);
            logMessage(`❌ Fehler bei ${name}: ${err.message}`);
          }
          if (progressBar) progressBar.value++;
        }
        logMessage(`🏁 Vorgang abgeschlossen (${files.length} Dateien)`);
      });
    }

    // ===== Local Entry ====
    if (localEntryList && typeof window.initLocalEntry === "function") {
      const btnListLocal = document.getElementById("btn-list-local");
      if (btnListLocal) {
        btnListLocal.addEventListener("click", async () => {
          if (!srcDirHandle && window.srcDirHandle) {
            srcDirHandle = window.srcDirHandle;
          }
          await window.initLocalEntry(srcDirHandle, localEntryList, logMessage);
        });
      }
    }

    // ===== Local Copy/Sort Workflow (nach lastModified) ====
    if (typeof window.initLocalCopySort === "function") {
      const btnLocalCopySort = document.getElementById("btn-local-copy-sort");
      if (btnLocalCopySort) {
        btnLocalCopySort.addEventListener("click", async () => {
          // Handle prüfen
          if (!srcDirHandle && window.srcDirHandle) {
            srcDirHandle = window.srcDirHandle;
          }
          if (!destDirHandle && window.destDirHandle) {
            destDirHandle = window.destDirHandle;
          }
          if (!srcDirHandle || !destDirHandle) {
            return alert("Quell- oder Zielordner fehlt.");
          }

          // Datum prüfen
          const fromVal = fromInput?.value;
          const toVal = toInput?.value;
          if (!fromVal || !toVal) {
            return alert("Bitte Start- und End-Datum wählen.");
          }
          const startDate = new Date(fromVal);
          const endDate = new Date(toVal);

          // Modus (Kopieren vs. Verschieben)
          const mode = modeSelect ? modeSelect.value : "copy";

          // Log & Fortschritt zurücksetzen
          copyProgressUI?.replaceChildren();
          logUI?.replaceChildren();
          if (progressBar) {
            progressBar.value = 0;
            progressBar.max = 0;
          }

          // Aufrufen der Funktion, die nach lastModified sortiert
          await window.initLocalCopySort({
            srcHandle,
            destHandle,
            startDate,
            endDate,
            mode,
            logMessage,
          });
        });
      }
    }

    // ===== Quick Buttons (Presets) ====
    if (typeof window.initQuickButtons === "function") {
      window.initQuickButtons({
        savePresetBtn,
        loadPresetBtn,
        presetNameInput,
        logMessage,
      });
    }

    // ===== Sync-Pair Workflow ====
    if (typeof window.initSyncPair === "function") {
      window.initSyncPair({
        syncSrcBtn,
        syncDestBtn,
        syncBtn,
        syncLogUI,
        logMessage,
      });
    }
  });
})();
