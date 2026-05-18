/**
 * Basisrente (Rürup) – Stand 2026.
 * Pflichtbeiträge zur DRV werden auf den Höchstbetrag angerechnet
 * (relevant für angestellte Hebammen).
 */
export const RUERUP_2026 = {
  hoechstbetrag: {
    ledig: 30826,
    verheiratet: 61652,
  },
  absetzbarProzent: 1.00, // 100 % seit 2023
  rechtsgrundlage: '§10 Abs. 1 Nr. 2 EStG',
  letztePruefung: '2026-05-18',
} as const;
