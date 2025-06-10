// File: js/date-ui.js

/**
 * Kapselt Datumspicker ↔ Raw-Input-Sync und Schnellwahl-Buttons.
 * Registriert initDateUI global unter window.initDateUI.
 */
(function () {
  function initDateUI({
    fromInput,
    toInput,
    fromRawInput,
    toRawInput,
    customInput,
    customRawInput,
    btnToday,
    btnYesterday,
    btnLast7,
  }) {
    // 1) Date-Picker ↔ Raw-Input synchronisieren
    function syncDateAndRaw(dateEl, rawEl) {
      dateEl.addEventListener("change", () => {
        rawEl.value = dateEl.value.replace(/-/g, "");
      });
      rawEl.addEventListener("input", () => {
        const v = rawEl.value;
        if (/^\d{8}$/.test(v)) {
          dateEl.value = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
        }
      });
    }

    syncDateAndRaw(fromInput, fromRawInput);
    syncDateAndRaw(toInput, toRawInput);
    syncDateAndRaw(customInput, customRawInput);

    // 2) Helper-Funktion: Setzt beide Date-Picker & Raw-Inputs
    function setDateRange(a, b) {
      const A = a.toISOString().slice(0, 10);
      const B = b.toISOString().slice(0, 10);
      fromInput.value = A;
      toInput.value = B;
      fromRawInput.value = A.replace(/-/g, "");
      toRawInput.value = B.replace(/-/g, "");
    }

    // 3) Schnellwahl-Buttons
    btnToday.addEventListener("click", () => {
      const now = new Date();
      setDateRange(now, now);
    });

    btnYesterday.addEventListener("click", () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      setDateRange(d, d);
    });

    btnLast7.addEventListener("click", () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      setDateRange(start, end);
    });

    customInput.addEventListener("change", () => {
      const d = new Date(customInput.value);
      setDateRange(d, d);
    });

    // 4) Initial-Fill: direkt nach Laden einmal synchronisieren
    const initDate = () => {
      const a = fromInput.value ? new Date(fromInput.value) : new Date();
      const b = toInput.value ? new Date(toInput.value) : new Date();
      setDateRange(a, b);
    };

    setTimeout(() => {
      if (!customInput.value) {
        const today = new Date().toISOString().slice(0, 10);
        customInput.value = today;
        customRawInput.value = today.replace(/-/g, "");
      }
      initDate();
    }, 0);
  }

  // Globale Registrierung
  window.initDateUI = initDateUI;
})();
