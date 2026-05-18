import { RUERUP_2026 } from '@/config/ruerup';
import type { BeratungDaten } from './types';

export interface RuerupInput {
  monatsbrutto: number;
  verheiratet: boolean;
  drvPflicht: boolean;
}

export interface RuerupResult {
  /** Voller Höchstbetrag (ohne Anrechnung). */
  hoechstbetragBrutto: number;
  /** Angenommene DRV-Pflichtbeiträge (AN + AG, Hebamme als Pflichtmitglied). */
  drvBeitragGeschaetzt: number;
  /** Verbleibender Höchstbetrag nach DRV-Anrechnung. */
  hoechstbetragVerfuegbar: number;
  /** Empfohlener Eigenbeitrag (= verfügbarer Höchstbetrag, gecappt bei 12k €). */
  empfohlenerEigenbeitragJahr: number;
}

/**
 * Berechnet den tatsächlich nutzbaren Rürup-Höchstbetrag.
 *
 * Hebammen sind als Pflegende grundsätzlich rentenversicherungspflichtig.
 * Pflichtbeiträge zur DRV (≈ 18,6 % vom Brutto, AN+AG) werden auf den
 * Rürup-Höchstbetrag angerechnet — sonst rechnen wir Potenzial zu hoch.
 *
 * §10 Abs. 1 Nr. 2 EStG.
 */
export function calcRuerup(input: RuerupInput): RuerupResult {
  const hoechstbetragBrutto = input.verheiratet
    ? RUERUP_2026.hoechstbetrag.verheiratet
    : RUERUP_2026.hoechstbetrag.ledig;

  // DRV-Beitragssatz 2026: 18,6 % (AN + AG zusammen).
  // Bei Pflichtmitgliedschaft trägt die Hebamme den vollen Satz selbst
  // (freiberuflich) oder geteilt (angestellt) – für Anrechnung zählt Brutto.
  const drvBeitragGeschaetzt = input.drvPflicht
    ? Math.round(input.monatsbrutto * 12 * 0.186)
    : 0;

  const hoechstbetragVerfuegbar = Math.max(0, hoechstbetragBrutto - drvBeitragGeschaetzt);

  // Praktisches Cap: > 12.000 € Rürup/Jahr ist für Hebammen-Einkommen
  // selten sinnvoll, weil Kapital bis 65 gebunden ist.
  const empfohlenerEigenbeitragJahr = Math.min(hoechstbetragVerfuegbar, 12000);

  return {
    hoechstbetragBrutto,
    drvBeitragGeschaetzt,
    hoechstbetragVerfuegbar,
    empfohlenerEigenbeitragJahr,
  };
}

export function ruerupInputFromBeratung(daten: BeratungDaten): RuerupInput {
  return {
    monatsbrutto: daten.monatsbrutto,
    verheiratet: daten.verheiratet,
    drvPflicht: daten.drvPflicht,
  };
}
