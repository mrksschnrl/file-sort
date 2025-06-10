// File: js/utils-date.js

/**
 * Hilfsfunktionen rund um Datummanipulation.
 * Registriert window.getDateRange, sodass andere Skripte es direkt verwenden können.
 */
(function () {
  /**
   * Erzeugt ein Array von Datumsstrings (im Format YYYYMMDD) von startRaw bis endRaw (inklusive).
   * @param {string} startRaw – "YYYYMMDD"
   * @param {string} endRaw   – "YYYYMMDD"
   * @returns {string[]} Array mit Datumsstrings (z.B. ["20250101", "20250102", …])
   */
  function getDateRange(startRaw, endRaw) {
    // startRaw und endRaw müssen jeweils 8 Ziffern haben: "YYYYMMDD"
    const start = new Date(
      parseInt(startRaw.slice(0, 4), 10),
      parseInt(startRaw.slice(4, 6), 10) - 1,
      parseInt(startRaw.slice(6, 8), 10)
    );
    const end = new Date(
      parseInt(endRaw.slice(0, 4), 10),
      parseInt(endRaw.slice(4, 6), 10) - 1,
      parseInt(endRaw.slice(6, 8), 10)
    );
    const dates = [];
    let curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear().toString();
      const mm = (curr.getMonth() + 1).toString().padStart(2, "0");
      const dd = curr.getDate().toString().padStart(2, "0");
      dates.push(`${yyyy}${mm}${dd}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }

  // Globale Registrierung
  window.getDateRange = getDateRange;
})();
