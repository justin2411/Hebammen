/**
 * Steuer-Parameter Stand 2026.
 * Quellen: §3 EStR, BMF-Schreiben, Lohnsteuerrichtlinien.
 * Bei Änderungen: letztePruefung aktualisieren und Audit-Log-Eintrag erstellen.
 */
export const STEUERN_2026 = {
  hebammenpauschale: {
    prozentVomUmsatz: 0.25,
    maxBetrag: 1535,
    rechtsgrundlage: 'EStR §3, BMF-Schreiben',
  },
  kilometerpauschale: 0.30,
  homeofficePauschale: {
    proTag: 6,
    maxTage: 210,
    maxBetrag: 1260,
  },
  werbungskostenPauschbetrag: 1230,
  ruerupHoechstbetrag: {
    ledig: 30826,
    verheiratet: 61652,
    absetzbarProzent: 1.00,
  },
  // Vereinfachte progressive Grenzsteuersatz-Schätzung.
  // Tatsächlicher Steuersatz aus Einkommen-Bereichen; gut genug für Beratungs-Cockpit.
  grenzsteuerStufen: [
    { bis: 12000, satz: 0.14 },
    { bis: 18000, satz: 0.20 },
    { bis: 25000, satz: 0.26 },
    { bis: 35000, satz: 0.32 },
    { bis: 50000, satz: 0.36 },
    { bis: 65000, satz: 0.40 },
    { bis: 280000, satz: 0.42 },
    { bis: Infinity, satz: 0.45 },
  ],
  letztePruefung: '2026-05-18',
} as const;
