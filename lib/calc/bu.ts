import { BU_ANNAHMEN } from '@/config/bu';
import type { BeratungDaten } from './types';

export interface BuLueckeInput {
  monatsbrutto: number;
  bestehendeBU: BeratungDaten['bestehendeBU'];
}

export interface BuLueckeResult {
  /** Empfohlene Mindest-BU-Rente (80 % vom Netto). */
  empfohleneMonatsRente: number;
  /** Bestehende monatliche BU-Rente. */
  bestehend: number;
  /** Absolute Lücke (€/Monat). Negativ falls überversorgt. */
  luecke: number;
  /** Lücke als Anteil (0..1) der empfohlenen Rente. */
  lueckeProzent: number;
  /** Empfehlung: Was tun? */
  status: 'fehlt' | 'unterversorgt' | 'ok' | 'gut';
}

/**
 * Schätzt die BU-Lücke einer Hebamme.
 *
 * Vereinfachung: Netto ≈ Brutto × 0,65 (Faustformel Lohnsteuerklasse I).
 * Empfehlung: 80 % vom Netto als BU-Rente.
 *
 * Status-Schwellen:
 *   < 30 % der Empfehlung → fehlt
 *   30–70 %               → unterversorgt
 *   70–100 %              → ok
 *   ≥ 100 %               → gut
 */
export function calcBuLuecke(input: BuLueckeInput): BuLueckeResult {
  const netto = input.monatsbrutto * 0.65;
  const empfohlen = Math.round(netto * BU_ANNAHMEN.empfohleneRenteMinProzentNetto);
  const bestehend = input.bestehendeBU.hat ? input.bestehendeBU.monatsRente : 0;
  const luecke = empfohlen - bestehend;
  const lueckeProzent = empfohlen > 0 ? luecke / empfohlen : 0;

  const deckung = empfohlen > 0 ? bestehend / empfohlen : 0;
  const status: BuLueckeResult['status'] =
    deckung >= 1 ? 'gut' : deckung >= 0.7 ? 'ok' : deckung >= 0.3 ? 'unterversorgt' : 'fehlt';

  return {
    empfohleneMonatsRente: empfohlen,
    bestehend,
    luecke,
    lueckeProzent,
    status,
  };
}
