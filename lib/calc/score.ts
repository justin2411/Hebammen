import type { BeratungDaten } from './types';

export interface ScoreSubs {
  sparquote: number;
  buSchutz: number;
  foerderquote: number;
  steuerOptimierung: number;
  flexibilitaet: number;
  liquidPuffer: number;
}

export interface ScoreResult {
  /** Vorsorge-Score 0..100. */
  total: number;
  subs: ScoreSubs;
}

/**
 * Berechnet den Vorsorge-Score (0..100) aus 6 gleichgewichteten Sub-Scores.
 *
 * Briefing §5 + Phase-2-Erweiterung:
 * - Sparquote (% vom Einkommen)
 * - BU-Schutz (ja+Höhe / nein)
 * - Förderquote (genutzt vs. nicht)
 * - Steueroptimierung (ja/nein)
 * - Flexibilität (3. Schicht ja/nein)
 * - Liquider Puffer (Notgroschen in Monatsnettos)
 *
 * Score-Skala bewusst grob, weil sie einen Gesprächsanker bildet,
 * keine prädiktive Kennzahl.
 */
export function calcScore(daten: BeratungDaten): ScoreResult {
  const jahresBrutto = Math.max(1, daten.monatsbrutto * 12);
  const jahresSparrate = daten.aktuelleSparrate * 12;
  const sparQuote = jahresSparrate / jahresBrutto;

  // Sparquote: 0 % → 0 Punkte, 15 %+ → 100 Punkte (linear).
  const sparquoteScore = Math.min(100, Math.round((sparQuote / 0.15) * 100));

  // BU: nach Höhe und Vorhandensein.
  // Empfehlung: ≥ 80 % vom Nettoeinkommen. Skalierung:
  //   keine BU → 15, BU mit ≥ 1500 € → 95, dazwischen linear.
  const buScore = daten.bestehendeBU.hat
    ? Math.min(95, 50 + Math.round((daten.bestehendeBU.monatsRente / 1500) * 45))
    : 15;

  const foerderScore = daten.nutztFoerderungen ? 90 : 20;
  const steuerScore = daten.steueroptimiert ? 90 : 25;
  const flexScore = daten.hatFlexibleVorsorge ? 90 : 30;

  // Liquid-Puffer: < 1 Monat → 10, 3-5 Monate → 70, ≥ 6 Monate → 100.
  const liquidScore =
    daten.notgroschenMonate >= 6
      ? 100
      : daten.notgroschenMonate >= 3
        ? 70
        : daten.notgroschenMonate >= 1
          ? 40
          : 10;

  const subs: ScoreSubs = {
    sparquote: sparquoteScore,
    buSchutz: buScore,
    foerderquote: foerderScore,
    steuerOptimierung: steuerScore,
    flexibilitaet: flexScore,
    liquidPuffer: liquidScore,
  };

  const total = Math.round(
    (subs.sparquote +
      subs.buSchutz +
      subs.foerderquote +
      subs.steuerOptimierung +
      subs.flexibilitaet +
      subs.liquidPuffer) /
      6,
  );

  return { total, subs };
}
