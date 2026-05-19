/**
 * Hebammenhilfevertrag (HHV) – Stand Mai 2026.
 * Schiedsspruch April 2025, in Kraft seit 1.11.2025, aktualisiert 1.4.2026.
 * Quellen: GKV-Spitzenverband, Deutscher Hebammenverband (DHV).
 */
export const HHV = {
  inkraftSeit: '2025-11-01',
  letzteAenderung: '2026-04-01',
  stundensatzAusserklinisch: 74.28,
  stundensatzBeleg: 59.40,
  abrechnungstakt: 5,
  beleghebammen: {
    parallelBetreuung: { erste: 0.80, zweite: 0.30, dritte: 0.30 },
    einbussePotenziellBisZu: 0.30,
  },
  studie2025: {
    quelle: 'opta data Hebammenstudie 2025',
    berufswechselGedanken: 0.436,
  },
  letztePruefung: '2026-05-18',
} as const;
