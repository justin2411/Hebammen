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

export interface BuPraemienSchaetzung {
  /** Alter, für das geschätzt wurde (gerundet auf Tabellen-Stützstelle). */
  fuerAlter: number;
  /** Untere Schätzung €/Monat. */
  unten: number;
  /** Mittlere Schätzung €/Monat. */
  mitte: number;
  /** Obere Schätzung €/Monat (Gesundheitseinschränkungen). */
  oben: number;
}

/**
 * Interpoliert eine grobe Monatsprämie für eine gewünschte BU-Rente bei
 * gegebenem Alter. Streuung ±40 % wegen Gesundheitseinschluss.
 *
 * Hinweis: keine Bedingungsdetails, keine konkreten Tarife. Reine
 * Hausnummer für das Gespräch, in der Realität immer Risikovoranfrage.
 */
export function schaetzeBuPraemie(input: {
  alter: number;
  rente: number;
}): BuPraemienSchaetzung {
  const tabelle = BU_ANNAHMEN.praemieJeAlter;
  const stuetzstellen = Object.keys(tabelle).map(Number).sort((a, b) => a - b);

  // nächstgelegene Stützstelle finden
  const alterClamped = Math.max(stuetzstellen[0], Math.min(stuetzstellen.at(-1)!, input.alter));
  const fuerAlter = stuetzstellen.reduce((prev, curr) =>
    Math.abs(curr - alterClamped) < Math.abs(prev - alterClamped) ? curr : prev,
  );
  const basisPraemie = tabelle[fuerAlter];

  // Rentenhöhen-Faktor: linearer Anstieg pro 500 € über 1.500 € Basis-Rente
  const stufenUeberBasis = Math.max(0, (input.rente - 1500) / 500);
  const renteFaktor = Math.pow(BU_ANNAHMEN.faktorPro500MehrRente, stufenUeberBasis);
  const mitte = Math.round(basisPraemie * renteFaktor);

  return {
    fuerAlter,
    unten: Math.round(mitte * 0.7),
    mitte,
    oben: Math.round(mitte * 1.4),
  };
}
