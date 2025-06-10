// File: js/folder-picker.js

/**
 * Kapselt die Verzeichnis-Auswahl und hält die Handles per Closure.
 * Registriert initFolderPicker als window.initFolderPicker, damit man es global nutzt.
 */
(function () {
  function initFolderPicker({
    selectSrcBtn,
    selectDestBtn,
    sourceManual,
    destManual,
    logMessage,
  }) {
    let srcDirHandle = null;
    let destDirHandle = null;

    selectSrcBtn.addEventListener("click", async () => {
      try {
        srcDirHandle = await window.showDirectoryPicker();
        logMessage(`📂 Quellordner ausgewählt: ${srcDirHandle.name}`);
        sourceManual.value = srcDirHandle.name;
      } catch {
        /* abort */
      }
    });

    selectDestBtn.addEventListener("click", async () => {
      try {
        destDirHandle = await window.showDirectoryPicker();
        logMessage(`📂 Zielordner ausgewählt: ${destDirHandle.name}`);
        destManual.value = destDirHandle.name;
      } catch {
        /* abort */
      }
    });

    sourceManual.addEventListener("change", () => {
      logMessage(`🔤 Manueller Quellpfad: ${sourceManual.value}`);
    });
    destManual.addEventListener("change", () => {
      logMessage(`🔤 Manueller Zielpfad: ${destManual.value}`);
    });

    return {
      getSrcDirHandle: () => srcDirHandle,
      getDestDirHandle: () => destDirHandle,
    };
  }

  // Globale Registrierung
  window.initFolderPicker = initFolderPicker;
})();
