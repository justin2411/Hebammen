import type { BeratungDaten } from './types';

export type EmpfehlungsBereich =
  | 'bu'
  | 'sparrate'
  | 'foerderungen'
  | 'steuern'
  | 'flexible_vorsorge';

export interface Empfehlung {
  bereich: EmpfehlungsBereich;
  prio: 1 | 2 | 3;
  title: string;
  why: string;
  impact: string;
  effort: 'niedrig' | 'mittel' | 'hoch';
  effortMins: number;
}

export interface EmpfehlungsInput {
  daten: BeratungDaten;
  steuerErsparnisProJahr: number;
  foerderSummeProJahr: number;
}

/**
 * Generiert die priorisierten Top-3-Empfehlungen.
 *
 * Reihenfolge der Bewertung (höhere Prio sticht):
 * 1. Keine BU → IMMER Prio 1 (existenziell für Hebammen, BU statistisch 44–56).
 * 2. Sparquote < 10 % → Sparrate erhöhen.
 * 3. Keine Förderungen genutzt → AVD-Setup ab 2027.
 * 4. Nicht steueroptimiert → Steuerberater / Belege.
 * 5. Keine flexible 3. Schicht → Depot/Nettopolice.
 *
 * Begründung "warum 3. Schicht?" siehe Briefing §12.1.
 */
export function generateEmpfehlungen(input: EmpfehlungsInput): Empfehlung[] {
  const { daten, steuerErsparnisProJahr, foerderSummeProJahr } = input;
  const empfehlungen: Empfehlung[] = [];

  if (!daten.hatBU) {
    empfehlungen.push({
      bereich: 'bu',
      prio: 1,
      title: 'Berufsunfähigkeit absichern',
      why: 'Statistisch werden Hebammen zwischen 44 und 56 berufsunfähig. ' +
        'Ohne BU greift nach 24 Monaten Krankengeld nur die EM-Rente – meist unter 1.000 €.',
      impact: 'Existenzielle Absicherung. Ohne BU steht alle weitere Vorsorge auf Sand.',
      effort: 'mittel',
      effortMins: 60,
    });
  }

  const sparQuote = daten.monatsbrutto > 0 ? daten.aktuelleSparrate / daten.monatsbrutto : 0;
  if (sparQuote < 0.10) {
    empfehlungen.push({
      bereich: 'sparrate',
      prio: 2,
      title: 'Sparrate auf mindestens 10 % erhöhen',
      why: `Aktuelle Sparrate liegt bei ${Math.round(sparQuote * 100)} % vom Brutto. ` +
        'Für eine tragfähige Altersvorsorge sollten es mindestens 10 % sein, bei früherem Ausstieg eher 15 %.',
      impact: `Über 30 Jahre macht jedes zusätzliche Prozent ${Math.round(
        daten.monatsbrutto * 0.01 * 12 * 30 * 1.8,
      ).toLocaleString('de-DE')} € Endkapital (bei 6 % Rendite).`,
      effort: 'niedrig',
      effortMins: 15,
    });
  }

  if (!daten.nutztFoerderungen && foerderSummeProJahr > 0) {
    empfehlungen.push({
      bereich: 'foerderungen',
      prio: 2,
      title: 'Förderungen einsammeln',
      why: 'Bisher werden vorhandene Förderungen (AVD, BAV, VL, ggf. GKV-Zuschlag) nicht genutzt.',
      impact: `Etwa ${foerderSummeProJahr.toLocaleString('de-DE')} €/Jahr geschenktes Geld liegen lassen.`,
      effort: 'mittel',
      effortMins: 45,
    });
  }

  if (!daten.steueroptimiert && steuerErsparnisProJahr > 200) {
    empfehlungen.push({
      bereich: 'steuern',
      prio: 3,
      title: 'Steuerlich sauber aufstellen',
      why: 'Hebammen-Pauschale (1.535 €) oder Einzelnachweis – je nach Aufwand. ' +
        'Belegführung sortieren, ggf. Steuerberater.',
      impact: `Ca. ${steuerErsparnisProJahr.toLocaleString('de-DE')} €/Jahr Steuerersparnis möglich.`,
      effort: 'mittel',
      effortMins: 90,
    });
  }

  if (!daten.hatFlexibleVorsorge) {
    empfehlungen.push({
      bereich: 'flexible_vorsorge',
      prio: 3,
      title: 'Flexible 3. Schicht aufbauen',
      why: 'AVD und Rürup sind vor 62/65 gesperrt. Bei Berufsausstieg mit 55 ist Geld nötig, ' +
        'das jederzeit verfügbar ist – ETF-Depot oder Nettopolice.',
      impact: 'Liquidität in der kritischen Phase zwischen Berufsende und Renteneintritt.',
      effort: 'niedrig',
      effortMins: 30,
    });
  }

  return empfehlungen
    .sort((a, b) => a.prio - b.prio)
    .slice(0, 3);
}
