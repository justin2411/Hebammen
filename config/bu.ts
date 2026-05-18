/**
 * BU-Tarif-Annahmen – PLATZHALTER.
 *
 * TODO Phase 2: Echte Werte aus Tarifrechnern / Versicherer-Konditionen einpflegen.
 *
 * Für Hebammen gilt: aufgrund körperlich und psychisch belastendem Beruf
 * sind BU-Prämien typischerweise hoch. BU statistisch zwischen 44–56 Jahren,
 * Nervenerkrankungen als häufigste Ursache.
 *
 * In Phase 1 nutzt die App nur die qualitative Information "hat BU ja/nein".
 * Keine konkreten Prämien-Schätzungen.
 */
export const BU_ANNAHMEN = {
  // Beispiel-Struktur für Phase 2:
  // praemieProMonat: {
  //   alter25: { rente1500: 80, rente2000: 105 },
  //   alter35: { rente1500: 110, rente2000: 145 },
  //   alter45: { rente1500: 180, rente2000: 240 },
  // },
  hinweis:
    'BU-Prämien sind individuell und vom Gesundheitszustand abhängig. ' +
    'Konkrete Konditionen nur über echte Risikovoranfrage.',
  empfohleneRenteMinProzentNetto: 0.80, // 80 % vom Nettoeinkommen
  letztePruefung: '2026-05-18',
} as const;
