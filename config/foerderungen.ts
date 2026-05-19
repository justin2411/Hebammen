/**
 * Weitere Förderungen für Hebammen – Stand Mai 2026.
 */
export const FOERDERUNGEN_2026 = {
  bav: {
    // Bei angestellten Hebammen: bis zu 4 % der BBG steuer-/sv-frei in BAV.
    sozialversicherungsfrei: 0.04, // 4 % der BBG (West)
    klinikzuschussTypisch: 0.15, // typisch 15 % AG-Zuschuss als Schätzung
    quelle: '§3 Nr. 63 EStG',
  },
  vl: {
    // Vermögenswirksame Leistungen
    maxArbeitgeberzuschussProMonat: 40,
    arbeitnehmerSparzulageEinkommensgrenze: { ledig: 40000, verheiratet: 80000 },
    quelle: '5. VermBG',
  },
  gkvSicherstellungszuschlag: {
    // GKV-Zuschlag bei Geburtshilfe (außerklinisch)
    proGeburtsfall: 700,
    voraussetzungen: 'Geburtshilfe-Tätigkeit, Mindestanzahl Geburten p.a.',
    quelle: 'GKV-Spitzenverband',
  },
  fruehstartRente: {
    // Geplante Maßnahme aus Koalitionsvertrag, Modellprojekt 2026.
    // Konkrete Konditionen noch nicht final.
    status: 'in_planung',
    geschaetzteJahresZulage: 0,
    quelle: 'BMAS-Eckpunktepapier 2025',
  },
  letztePruefung: '2026-05-18',
} as const;
