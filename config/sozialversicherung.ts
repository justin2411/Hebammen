/**
 * Sozialversicherungs- und Steuersätze 2026 (Arbeitnehmer-Anteil).
 *
 * Quellen:
 * - Beitragsbemessungsgrenzen 2026: Bundesregierung Verordnung
 * - Grundfreibetrag 2026: §32a EStG (geschätzt 12.084 €)
 * - Kirchensteuer: 8 % in BW + BY, 9 % in restlichen Bundesländern
 * - Solidaritätszuschlag entfällt für 90 % der Steuerzahler seit 2021
 */
export const SV_BEITRAGE_2026 = {
  // Arbeitnehmer-Anteile (bei Angestellten)
  krankenversicherung: {
    basis: 0.073, // 7,3 % AN
    zusatzbeitragDurchschnitt: 0.017, // 1,7 % AN (kassenabhängig)
  },
  pflegeversicherung: {
    basis: 0.018, // 1,8 % AN (2026)
    zuschlagKinderlos: 0.006, // +0,6 % für Kinderlose ab 23
    abschlagJeKind: 0.0025, // -0,25 % pro Kind ab 2. Kind
  },
  rentenversicherung: 0.093, // 9,3 % AN
  arbeitslosenversicherung: 0.013, // 1,3 % AN
  // Beitragsbemessungsgrenzen Monat
  bbgKv: 5512.5, // KV/PV 2026 (66.150 € / Jahr)
  bbgRv: 8050, // RV/AV 2026 (96.600 € / Jahr, West)
} as const;

export const LOHNSTEUER_2026 = {
  grundfreibetrag: 12084, // §32a EStG, ledig
  // Kinderfreibetrag pro Elternteil und Kind (Lohnsteuer-relevant über Steuerklasse, vereinfacht)
  kinderfreibetragJeKind: 4194,
  solidaritaetsfreigrenze: 19950, // ZvE bis hier kein Soli
  solidaritaetssatz: 0.055, // 5,5 % auf ESt darüber (vereinfacht)
} as const;

export const KIRCHENSTEUER = {
  bayern: 0.08,
  badenWuerttemberg: 0.08,
  rest: 0.09,
} as const;

/** Aktueller Rentenwert DRV 2026 (West). */
export const RENTENWERT_2026 = 39.32;

/** Erwerbsminderungsrente — Faustformel als Anteil vom Brutto. */
export const EM_RENTE_FAKTOREN = {
  voll: 0.34, // < 3h Restleistungsvermögen
  halb: 0.17, // 3–6h Restleistungsvermögen
  keine: 0, // ≥ 6h Restleistungsvermögen
} as const;

export const ENTGELTFORTZAHLUNG = {
  wochen: 6, // §3 EFZG: 100 % Brutto für 6 Wochen
} as const;

export const KRANKENGELD = {
  wochen: 72, // max. 72 Wochen innerhalb 3 Jahren wegen derselben Krankheit
  prozentBrutto: 0.7, // §47 SGB V: 70 % Regelentgelt
  prozentNettoCap: 0.9, // gedeckelt bei 90 % Netto
  // SV-Abzug vom Krankengeld: RV + AV + PV (KV trägt die Kasse selbst)
  svAbzug: 0.122, // ca. 12,2 % (RV 9,3 % + AV 1,3 % + PV ~1,6 %)
} as const;
