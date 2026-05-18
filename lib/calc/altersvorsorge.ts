import type { BeratungDaten } from './types';

export interface VorsorgeInput {
  alter: number;
  ausstiegsalter: number;
  aktuelleSparrate: number;
  startCapital: number;
  /** Jährlich freigesetztes Potenzial (€) aus Steuer + Förderungen. */
  freigesetztesPotenzial: number;
}

export interface SzenarioResult {
  endkapital: number;
  monatlicheRente30Jahre: number;
}

export interface VorsorgeResult {
  jahreBisAusstieg: number;
  aktuell: SzenarioResult;
  optimiert: SzenarioResult;
  maximal: SzenarioResult;
  versorgungsluecke: number;
}

const DEFAULT_RATE = 0.06; // 6 % p.a. realistische Mischfondsrendite vor Inflation
const ENTNAHMEFAKTOR_MONATLICH = 1 / (30 * 12); // 30 Jahre Entnahme linear

/**
 * Compound interest mit monatlicher Sparrate.
 * Pure Funktion, keine Side-Effects.
 */
export function computeWealth(
  monthly: number,
  years: number,
  rate: number,
  startCapital = 0,
): number {
  if (years <= 0) return startCapital;
  const r = rate / 12;
  const n = years * 12;
  if (r === 0) return startCapital + monthly * n;
  const futureStart = startCapital * Math.pow(1 + r, n);
  const futureContrib = monthly * ((Math.pow(1 + r, n) - 1) / r);
  return futureStart + futureContrib;
}

/**
 * Berechnet die drei Szenarien aus dem Briefing (§5):
 * - aktuell:   nur die bestehende Sparrate.
 * - optimiert: aktuelle Sparrate + 70 % des freigesetzten Potenzials.
 * - maximal:   aktuelle Sparrate + 100 % des freigesetzten Potenzials.
 *
 * Versorgungslücke = Endkapital "aktuell" minus eines konservativen
 * Bedarfsschätzers (1.500 €/Monat × 30 Jahre = 540.000 €).
 * Negativ = Lücke.
 */
export function calcAltersvorsorge(input: VorsorgeInput): VorsorgeResult {
  const jahreBisAusstieg = Math.max(0, input.ausstiegsalter - input.alter);

  const ratenMonatlich = {
    aktuell: input.aktuelleSparrate,
    optimiert: input.aktuelleSparrate + (input.freigesetztesPotenzial / 12) * 0.70,
    maximal: input.aktuelleSparrate + input.freigesetztesPotenzial / 12,
  };

  const toResult = (monatlich: number): SzenarioResult => {
    const endkapital = Math.round(
      computeWealth(monatlich, jahreBisAusstieg, DEFAULT_RATE, input.startCapital),
    );
    return {
      endkapital,
      monatlicheRente30Jahre: Math.round(endkapital * ENTNAHMEFAKTOR_MONATLICH),
    };
  };

  const aktuell = toResult(ratenMonatlich.aktuell);
  const optimiert = toResult(ratenMonatlich.optimiert);
  const maximal = toResult(ratenMonatlich.maximal);

  const bedarfsschaetzer = 1500 * 12 * 30;
  const versorgungsluecke = aktuell.endkapital - bedarfsschaetzer;

  return {
    jahreBisAusstieg,
    aktuell,
    optimiert,
    maximal,
    versorgungsluecke,
  };
}

export function vorsorgeInputFromBeratung(
  daten: BeratungDaten,
  freigesetztesPotenzial: number,
): VorsorgeInput {
  return {
    alter: daten.alter,
    ausstiegsalter: daten.ausstiegsalter,
    aktuelleSparrate: daten.aktuelleSparrate,
    startCapital: daten.startCapital,
    freigesetztesPotenzial,
  };
}
