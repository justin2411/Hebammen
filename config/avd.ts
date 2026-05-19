/**
 * Altersvorsorgedepot (AVD) – Stand Mai 2026.
 * Bundestag-Beschluss: 27. März 2026, Bundesrat-Zustimmung: 8. Mai 2026.
 * Start: 1. Januar 2027.
 */
export const AVD_2027 = {
  startdatum: '2027-01-01',
  grundzulage: {
    stufe1: { bis: 360, prozent: 0.50 },   // 50 % bis 360 € Eigenbeitrag
    stufe2: { bis: 1800, prozent: 0.25 },  // 25 % bis 1.800 € Eigenbeitrag
    maxZulage: 540,
  },
  kinderzulage: {
    proKind: 300,
    erforderlicherEigenbeitragProKind: 300,
  },
  berufseinsteigerBonus: {
    alterMax: 25,
    betrag: 200,
    einmalig: true,
  },
  maxEinzahlbar: 6840,
  rechtsstand: '2026-05-08',
  letztePruefung: '2026-05-18',
} as const;
