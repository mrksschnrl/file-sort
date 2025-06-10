// File: js/sync-pair.js

/**
 * Synchronisiert zwei Dateipicker-Felder: wenn im Raw-Feld ein gültiges Datum eingegeben wird,
 * wird der Datepicker entsprechend gesetzt, und umgekehrt. Hervorhebungsfunktion „mark“ für visuelles Feedback.
 * Registriert syncPair global unter window.syncPair.
 *
 * Parameter:
 *   pickerId    – ID des <input type="date">-Felds
 *   rawId       – ID des zugehörigen Raw-Input-Felds (Format YYYYMMDD)
 *   isValidRaw  – Funktion, die prüft, ob ein Raw-Wert gültig ist (z. B. /^\d{8}$/)
 *   mark        – Funktion, um bei ungültigem Raw-Wert visuell zu markieren
 */
(function () {
  function syncPair(pickerId, rawId, isValidRaw, mark) {
    const dateInput = document.getElementById(pickerId);
    const rawInput = document.getElementById(rawId);

    if (!dateInput || !rawInput) {
      console.error(
        `syncPair: Element mit ID '${pickerId}' oder '${rawId}' nicht gefunden.`
      );
      return;
    }

    // Wenn der Datepicker geändert wird, das Raw-Feld mit YYYYMMDD füllen
    dateInput.addEventListener("change", () => {
      const v = dateInput.value; // Format: "YYYY-MM-DD"
      if (v) {
        rawInput.value = v.replace(/-/g, "");
        if (typeof mark === "function") {
          mark(rawInput, true); // Rohfeld ist gültig
        }
      }
    });

    // Wenn im Raw-Feld getippt wird, prüfen, ob der Wert gültig ist
    rawInput.addEventListener("input", () => {
      const rawVal = rawInput.value;
      if (typeof isValidRaw === "function" && isValidRaw(rawVal)) {
        // Format in YYYY-MM-DD umwandeln
        const formatted = `${rawVal.slice(0, 4)}-${rawVal.slice(
          4,
          6
        )}-${rawVal.slice(6)}`;
        dateInput.value = formatted;
        if (typeof mark === "function") {
          mark(rawInput, true); // Rohfeld ist gültig
        }
      } else {
        if (typeof mark === "function") {
          mark(rawInput, false); // Rohfeld ist ungültig
        }
      }
    });
  }

  // Globale Registrierung
  window.syncPair = syncPair;
})();
