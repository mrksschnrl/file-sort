// File: js/quick-buttons.js

/**
 * Initialisiert Schnellbuttons für häufige Aktionen (z. B. Presets laden, Presets speichern, etc.).
 * Registriert initQuickButtons global unter window.initQuickButtons.
 *
 * Parameter (Beispiel):
 *   savePresetBtn   – DOM-Element (<button>), um ein Preset zu speichern
 *   loadPresetBtn   – DOM-Element (<button>), um ein Preset zu laden
 *   presetNameInput – DOM-Element (<input>), in dem der Preset-Name steht
 *   logMessage      – Funktion, um Meldungen in den Log auszugeben
 */
(function () {
  async function initQuickButtons({
    savePresetBtn,
    loadPresetBtn,
    presetNameInput,
    logMessage,
  }) {
    if (!savePresetBtn || !loadPresetBtn || !presetNameInput) {
      logMessage("⚠️ Quick-Buttons: Fehlende DOM-Elemente.");
      return;
    }

    // Speichere ein Preset: sendet an backend /save-preset.php
    savePresetBtn.addEventListener("click", async () => {
      const presetName = presetNameInput.value.trim();
      if (!presetName) {
        alert("Bitte Preset-Namen eingeben.");
        return;
      }
      // Beispiel: Erzeuge Preset-Data (z. B. aktueller Zustand der UI)
      const presetData = JSON.stringify({
        // Hier alle benötigten Zustände sammeln, z. B.:
        timestamp: new Date().toISOString(),
        // … weitere Einstellungen …
      });
      try {
        const response = await fetch("/v/packages/file-sort/save-preset.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: new URLSearchParams({
            presetName,
            presetData,
          }),
        });
        const data = await response.json();
        if (data.status === "success") {
          logMessage(`✅ Preset "${presetName}" gespeichert.`);
        } else {
          throw new Error(data.message || "Unbekannter Fehler");
        }
      } catch (err) {
        logMessage(`❌ Fehler beim Speichern des Presets: ${err.message}`);
      }
    });

    // Lade ein Preset: ruft backend /load-preset.php auf
    loadPresetBtn.addEventListener("click", async () => {
      const presetName = presetNameInput.value.trim();
      if (!presetName) {
        alert("Bitte Preset-Namen eingeben.");
        return;
      }
      try {
        const response = await fetch(
          `/v/packages/file-sort/load-preset.php?presetName=${encodeURIComponent(
            presetName
          )}`,
          {
            method: "GET",
            headers: { Accept: "application/json; charset=UTF-8" },
          }
        );
        const data = await response.json();
        if (data.status === "success") {
          logMessage(`📥 Preset "${presetName}" geladen.`);
          const preset = data.data;
          // Beispiel: wende preset auf die UI an
          // if (preset.timestamp) { /* … */ }
          // … weitere Einstellungen rücksetzen …
        } else {
          throw new Error(data.message || "Preset nicht gefunden");
        }
      } catch (err) {
        logMessage(`❌ Fehler beim Laden des Presets: ${err.message}`);
      }
    });
  }

  // Globale Registrierung
  window.initQuickButtons = initQuickButtons;
})();
