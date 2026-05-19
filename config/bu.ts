/**
 * BU-Tarif-Annahmen für Hebammen (Berufsgruppe „medizinisch, körperlich/psychisch belastet").
 *
 * Werte sind grobe Marktdurchschnitte aus öffentlichen Tarifrechnern (Stand 2026),
 * Endalter 67, Beruf Hebamme/Pflege (Risikoklasse 3–4 je Anbieter).
 * Konkret in der Beratung: immer Risikovoranfrage stellen, da Gesundheitszustand
 * die Prämie um Faktor 1,5–3 streuen kann.
 *
 * Für Hebammen gilt: aufgrund körperlich und psychisch belastendem Beruf
 * sind BU-Prämien typischerweise hoch. BU statistisch zwischen 44–56 Jahren,
 * Nervenerkrankungen häufigste Ursache.
 */
export const BU_ANNAHMEN = {
  empfohleneRenteMinProzentNetto: 0.8,
  rechtsklasseHebamme: '3–4 (mittlere bis erhöhte Risikogruppe)',
  /**
   * Geschätzte Monatsprämien in € für 1.500 €/Monat Rente, Endalter 67, gesund.
   * Pro 500 € Rentenerhöhung steigt die Prämie um ca. 55–65 %.
   */
  praemieJeAlter: {
    25: 55,
    30: 75,
    35: 100,
    40: 140,
    45: 195,
    50: 285,
    55: 415,
  } as Record<number, number>,
  /** Faktor pro 500 € Mehrrente (multiplikativ). */
  faktorPro500MehrRente: 1.6,
  letztePruefung: '2026-05-19',
  hinweis:
    'BU-Prämien sind individuell. Konkrete Konditionen nur über Risikovoranfrage.',
} as const;
