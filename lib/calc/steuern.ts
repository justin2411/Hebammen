import { STEUERN_2026 } from '@/config/steuern';
import type { BeratungDaten } from './types';

export type SteuerEmpfehlung = 'pauschale' | 'einzelnachweis';

export interface SteuerInput {
  status: BeratungDaten['status'];
  monatsbrutto: number;
  verheiratet: boolean;
  kilometer: number;
  homeofficeTage: number;
  fortbildungen: number;
  equipment: number;
}

export interface SteuerResult {
  /** Empfehlung welche Methode günstiger ist. */
  empfehlung: SteuerEmpfehlung;
  /** Betriebsausgaben/Werbungskosten nach gewählter Methode (€/Jahr). */
  bestBA: number;
  /** Hebammenpauschale (€). */
  pauschale: number;
  /** Einzelnachweis-Summe (€). */
  einzelnachweis: {
    kilometer: number;
    homeoffice: number;
    fortbildungen: number;
    equipment: number;
    summe: number;
  };
  /** Geschätzter Grenzsteuersatz (0..1). */
  grenzsteuersatz: number;
  /** Geschätzte Steuerersparnis pro Jahr (€). */
  ersparnisProJahr: number;
}

/**
 * Schätzt den Grenzsteuersatz aus dem zu versteuernden Einkommen.
 *
 * Bewusst vereinfacht (Stufenfunktion statt §32a-Formel) – die Beratung will
 * eine plausible Größenordnung, keine cent-genaue Lohnsteuer.
 */
export function grenzsteuersatz(zvE: number, verheiratet: boolean): number {
  // Splitting-Vorteil grob: bei Verheirateten zählt die Hälfte des Einkommens
  // für die Stufenermittlung (Annahme: ein Verdiener oder ähnlich verteilt).
  const referenz = verheiratet ? zvE / 2 : zvE;
  for (const stufe of STEUERN_2026.grenzsteuerStufen) {
    if (referenz <= stufe.bis) return stufe.satz;
  }
  return 0.45;
}

/**
 * Berechnet, ob die Hebammen-Pauschale oder der Einzelnachweis günstiger ist,
 * und schätzt die jährliche Steuerersparnis.
 *
 * Logik (Briefing §5):
 * - Pauschale: 25 % vom Umsatz, gedeckelt auf 1.535 €.
 * - Einzelnachweis: Kilometer (0,30 €/km) + Homeoffice (6 €/Tag, max 1.260 €) +
 *   Fortbildungen + Equipment.
 * - Ersparnis = bestBA × Grenzsteuersatz.
 *
 * Für Angestellte: nur Werbungskostenpauschbetrag vs. Einzelnachweis,
 * keine Hebammen-Betriebsausgabenpauschale.
 */
export function calcSteuern(input: SteuerInput): SteuerResult {
  const jahresUmsatz = input.monatsbrutto * 12;
  const istFreiberuflich =
    input.status === 'freiberuflich' || input.status === 'beleg' || input.status === 'kombi';

  const pauschale = istFreiberuflich
    ? Math.min(
        jahresUmsatz * STEUERN_2026.hebammenpauschale.prozentVomUmsatz,
        STEUERN_2026.hebammenpauschale.maxBetrag,
      )
    : STEUERN_2026.werbungskostenPauschbetrag;

  const kilometer = input.kilometer * STEUERN_2026.kilometerpauschale;
  const homeoffice = Math.min(
    input.homeofficeTage * STEUERN_2026.homeofficePauschale.proTag,
    STEUERN_2026.homeofficePauschale.maxBetrag,
  );
  const fortbildungen = input.fortbildungen;
  const equipment = input.equipment;
  const einzelSumme = kilometer + homeoffice + fortbildungen + equipment;

  const empfehlung: SteuerEmpfehlung = einzelSumme > pauschale ? 'einzelnachweis' : 'pauschale';
  const bestBA = empfehlung === 'einzelnachweis' ? einzelSumme : pauschale;

  // Grenzsteuersatz auf Basis Brutto minus angesetzte Ausgaben.
  const zvE = Math.max(0, jahresUmsatz - bestBA);
  const satz = grenzsteuersatz(zvE, input.verheiratet);

  // Ersparnis = Differenz zwischen "nichts angesetzt" und "bestBA angesetzt"
  // × Grenzsteuersatz. Das ist der reale Hebel der Optimierung.
  const ersparnisProJahr = Math.round(bestBA * satz);

  return {
    empfehlung,
    bestBA: Math.round(bestBA),
    pauschale: Math.round(pauschale),
    einzelnachweis: {
      kilometer: Math.round(kilometer),
      homeoffice: Math.round(homeoffice),
      fortbildungen: Math.round(fortbildungen),
      equipment: Math.round(equipment),
      summe: Math.round(einzelSumme),
    },
    grenzsteuersatz: satz,
    ersparnisProJahr,
  };
}
