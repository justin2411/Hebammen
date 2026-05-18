import type { BeratungDaten } from './types';

export interface VorsorgeInput {
  alter: number;
  ausstiegsalter: number;
  aktuelleSparrate: number;
  startCapital: number;
  /** Jährlich freigesetztes Potenzial (€) aus Steuer + Förderungen. */
  freigesetztesPotenzial: number;
  /** Erwartete Nominal-Rendite p.a. (Default 0.06). */
  renditeNominal?: number;
  /** Inflationsrate p.a. zur Realwert-Berechnung (Default 0.02). */
  inflation?: number;
}

export interface SzenarioResult {
  endkapital: number;
  endkapitalReal: number;
  monatlicheRente30Jahre: number;
  monatlicheRente30JahreReal: number;
  monatlicheRate: number;
}

export interface BuStressResult {
  /** Alter, ab dem keine Beiträge mehr fließen. */
  buAlter: number;
  /** Endkapital, wenn ab buAlter nicht mehr eingezahlt wird (nur Verzinsung). */
  endkapital: number;
  /** Wieviel Prozent vom regulären Maximum bleiben übrig. */
  anteilOhneStress: number;
}

export interface VorsorgeResult {
  jahreBisAusstieg: number;
  parameter: {
    renditeNominal: number;
    inflation: number;
  };
  aktuell: SzenarioResult;
  optimiert: SzenarioResult;
  maximal: SzenarioResult;
  /** Endkapital minus konservativer Lebens-Bedarf (1.500 €/Monat × 30 Jahre). */
  versorgungsluecke: number;
  /** "Was passiert, wenn du mit 50 BU wirst" – kritisches Szenario. */
  buStress: BuStressResult;
}

const DEFAULT_RENDITE = 0.06;
const DEFAULT_INFLATION = 0.02;
const BU_STRESS_ALTER = 50;
const ENTNAHME_MONATE = 30 * 12;

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
 * Rechnet einen nominalen Endbetrag in heutige Kaufkraft um.
 */
export function realwert(nominal: number, jahre: number, inflation: number): number {
  if (jahre <= 0) return nominal;
  return nominal / Math.pow(1 + inflation, jahre);
}

/**
 * Berechnet die drei Szenarien (Briefing §5) und den BU-Stresstest.
 *
 * Szenarien:
 * - aktuell:   nur die bestehende Sparrate.
 * - optimiert: aktuelle Sparrate + 70 % des freigesetzten Potenzials.
 * - maximal:   aktuelle Sparrate + 100 % des freigesetzten Potenzials.
 *
 * Jeder Wert kommt nominal UND real (in heutiger Kaufkraft) zurück.
 * BU-Stress: Beiträge stoppen ab Alter 50, nur Verzinsung läuft weiter.
 */
export function calcAltersvorsorge(input: VorsorgeInput): VorsorgeResult {
  const jahreBisAusstieg = Math.max(0, input.ausstiegsalter - input.alter);
  const rendite = input.renditeNominal ?? DEFAULT_RENDITE;
  const inflation = input.inflation ?? DEFAULT_INFLATION;

  const ratenMonatlich = {
    aktuell: input.aktuelleSparrate,
    optimiert: input.aktuelleSparrate + (input.freigesetztesPotenzial / 12) * 0.70,
    maximal: input.aktuelleSparrate + input.freigesetztesPotenzial / 12,
  };

  const toResult = (monatlich: number): SzenarioResult => {
    const nominal = computeWealth(monatlich, jahreBisAusstieg, rendite, input.startCapital);
    const real = realwert(nominal, jahreBisAusstieg, inflation);
    return {
      endkapital: Math.round(nominal),
      endkapitalReal: Math.round(real),
      monatlicheRente30Jahre: Math.round(nominal / ENTNAHME_MONATE),
      monatlicheRente30JahreReal: Math.round(real / ENTNAHME_MONATE),
      monatlicheRate: Math.round(monatlich),
    };
  };

  const aktuell = toResult(ratenMonatlich.aktuell);
  const optimiert = toResult(ratenMonatlich.optimiert);
  const maximal = toResult(ratenMonatlich.maximal);

  // BU-Stresstest: Beiträge bis 50, dann nur noch Verzinsung des Kapitals.
  // Wenn die Hebamme schon älter als 50 ist, ist das Szenario nicht mehr relevant
  // (Vergangenheit) → gleich dem regulären "optimiert"-Szenario.
  let buStress: BuStressResult;
  if (input.alter >= BU_STRESS_ALTER) {
    buStress = {
      buAlter: BU_STRESS_ALTER,
      endkapital: optimiert.endkapital,
      anteilOhneStress: 1,
    };
  } else {
    const jahreEinzahlung = Math.min(BU_STRESS_ALTER, input.ausstiegsalter) - input.alter;
    const jahreNurZinsen = Math.max(0, input.ausstiegsalter - BU_STRESS_ALTER);
    const kapitalBeiBU = computeWealth(
      ratenMonatlich.optimiert,
      jahreEinzahlung,
      rendite,
      input.startCapital,
    );
    const kapitalAmEnde = kapitalBeiBU * Math.pow(1 + rendite, jahreNurZinsen);
    buStress = {
      buAlter: BU_STRESS_ALTER,
      endkapital: Math.round(kapitalAmEnde),
      anteilOhneStress: optimiert.endkapital > 0 ? kapitalAmEnde / optimiert.endkapital : 0,
    };
  }

  // Versorgungslücke gegen 1.500 €/Monat × 30 Jahre Bedarf (in heutiger Kaufkraft).
  const bedarfHeutigeKaufkraft = 1500 * 12 * 30;
  const versorgungsluecke = aktuell.endkapitalReal - bedarfHeutigeKaufkraft;

  return {
    jahreBisAusstieg,
    parameter: { renditeNominal: rendite, inflation },
    aktuell,
    optimiert,
    maximal,
    versorgungsluecke,
    buStress,
  };
}

export function vorsorgeInputFromBeratung(
  daten: BeratungDaten,
  freigesetztesPotenzial: number,
  overrides?: Pick<VorsorgeInput, 'renditeNominal' | 'inflation'>,
): VorsorgeInput {
  return {
    alter: daten.alter,
    ausstiegsalter: daten.ausstiegsalter,
    aktuelleSparrate: daten.aktuelleSparrate,
    startCapital: daten.startCapital,
    freigesetztesPotenzial,
    ...overrides,
  };
}
