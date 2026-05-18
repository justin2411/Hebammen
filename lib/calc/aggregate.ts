import { calcSteuern } from './steuern';
import { calcFoerderungen } from './foerderungen';
import { calcAltersvorsorge, vorsorgeInputFromBeratung } from './altersvorsorge';
import { calcRuerup, ruerupInputFromBeratung } from './ruerup';
import { calcBuLuecke } from './bu';
import { calcScore } from './score';
import { generateEmpfehlungen } from './empfehlungen';
import type { BeratungDaten } from './types';

export interface AggregateOverrides {
  renditeNominal?: number;
  inflation?: number;
}

/**
 * Führt alle Berechnungen aus den BeratungDaten zusammen.
 * Ein Aufruf liefert alles für die Auswertungsseite + Detail-Views.
 */
export function aggregate(daten: BeratungDaten, overrides?: AggregateOverrides) {
  const steuern = calcSteuern({
    status: daten.status,
    monatsbrutto: daten.monatsbrutto,
    verheiratet: daten.verheiratet,
    kilometer: daten.kilometer,
    homeofficeTage: daten.homeofficeTage,
    fortbildungen: daten.fortbildungen,
    equipment: daten.equipment,
  });

  const foerderungen = calcFoerderungen({
    alter: daten.alter,
    status: daten.status,
    geburtshilfe: daten.geburtshilfe,
    kinder: daten.kinder,
    kinderUeber6: daten.kinderUeber6,
    monatsbrutto: daten.monatsbrutto,
  });

  const ruerup = calcRuerup(ruerupInputFromBeratung(daten));
  const buLuecke = calcBuLuecke({
    monatsbrutto: daten.monatsbrutto,
    bestehendeBU: daten.bestehendeBU,
  });

  const freigesetzt = steuern.ersparnisProJahr + foerderungen.gesamtProJahr;
  const altersvorsorge = calcAltersvorsorge(
    vorsorgeInputFromBeratung(daten, freigesetzt, overrides),
  );

  const score = calcScore(daten);
  const empfehlungen = generateEmpfehlungen({
    daten,
    steuerErsparnisProJahr: steuern.ersparnisProJahr,
    foerderSummeProJahr: foerderungen.gesamtProJahr,
  });

  return {
    steuern,
    foerderungen,
    ruerup,
    buLuecke,
    altersvorsorge,
    score,
    empfehlungen,
    freigesetztesPotenzialJahr: freigesetzt,
  };
}

export type AggregateResult = ReturnType<typeof aggregate>;
