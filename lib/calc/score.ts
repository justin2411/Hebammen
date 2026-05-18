import type { BeratungDaten } from './types';

export interface ScoreSubs {
  sparquote: number;
  buSchutz: number;
  foerderquote: number;
  steuerOptimierung: number;
  flexibilitaet: number;
}

export interface ScoreResult {
  /** Vorsorge-Score 0..100. */
  total: number;
  subs: ScoreSubs;
}

/**
 * Berechnet den Vorsorge-Score (0..100) aus 5 gleichgewichteten Sub-Scores.
 *
 * Briefing §5:
 * - Sparquote (in % vom Einkommen)
 * - BU-Schutz (binär ja/nein → 95/15)
 * - Förderquote (genutzt vs. nicht)
 * - Steueroptimierung (ja/nein)
 * - Flexibilität (3. Schicht vorhanden ja/nein)
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

  // BU binär: ja → 95, nein → 15.
  // Nicht 100/0, weil "hat BU" allein keine vollständige Absicherung garantiert
  // und "keine BU" mit Erspartem nicht totaler Ausfall ist.
  const buScore = daten.hatBU ? 95 : 15;

  const foerderScore = daten.nutztFoerderungen ? 90 : 20;
  const steuerScore = daten.steueroptimiert ? 90 : 25;
  const flexScore = daten.hatFlexibleVorsorge ? 90 : 30;

  const subs: ScoreSubs = {
    sparquote: sparquoteScore,
    buSchutz: buScore,
    foerderquote: foerderScore,
    steuerOptimierung: steuerScore,
    flexibilitaet: flexScore,
  };

  const total = Math.round(
    (subs.sparquote +
      subs.buSchutz +
      subs.foerderquote +
      subs.steuerOptimierung +
      subs.flexibilitaet) /
      5,
  );

  return { total, subs };
}
