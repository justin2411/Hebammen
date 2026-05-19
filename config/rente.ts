/**
 * Renten-Berechnungs-Parameter 2026.
 *
 * Quellen:
 *  - Aktueller Rentenwert West 1.7.2026 (geschätzt): 39,32 €
 *  - Durchschnittsentgelt 2026 (DRV vorläufig): 47.000 €
 *  - Erwerbsminderungsrente-Faktoren §43 SGB VI
 */
export const RENTE_2026 = {
  rentenwertWest: 39.32,
  durchschnittsentgeltJahr: 47000,
  /** Hebammen-DRV-Pflichtbeitragssatz (gesetzliche Rentenversicherung). */
  pflichtBeitragssatz: 0.186,
  /** Lebenserwartung-Bandbreite Frauen DRV-Statistik. */
  lebenserwartung: {
    frauen: 89,
    maenner: 84,
  },
} as const;
