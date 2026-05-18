import { BU_ANNAHMEN } from '@/config/bu';
import type { BeratungDaten } from './types';

export type EmpfehlungsBereich =
  | 'bu'
  | 'bu_luecke'
  | 'sparrate'
  | 'notgroschen'
  | 'foerderungen'
  | 'steuern'
  | 'flexible_vorsorge'
  | 'riester_check';

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
 * Reihenfolge der Bewertung (Prio sticht):
 * 1. Existenz: Notgroschen < 3 Monate (vor allem anderen)
 *              Keine BU → existenziell für Hebammen.
 * 2. Substanz: zu niedrige Sparrate, ungenutzte Förderungen.
 * 3. Feinjustage: Steueroptimierung, flexible 3. Schicht.
 *
 * Begründung "warum 3. Schicht?" siehe Briefing §12.1.
 */
export function generateEmpfehlungen(input: EmpfehlungsInput): Empfehlung[] {
  const { daten, steuerErsparnisProJahr, foerderSummeProJahr } = input;
  const empfehlungen: Empfehlung[] = [];

  // Existenz-Layer ---------------------------------------------------------
  if (daten.notgroschenMonate < 3) {
    empfehlungen.push({
      bereich: 'notgroschen',
      prio: 1,
      title: 'Notgroschen auf 3–6 Monatsnettos aufbauen',
      why:
        'Liquide Reserve geht vor Vorsorge. Bei Krankheit, Auftragsflaute oder ' +
        'spontanen Anschaffungen verhindert sie, dass Altersvorsorge oder ETF ' +
        'verfrüht aufgelöst werden.',
      impact:
        'Schützt vor Notverkäufen und teurem Dispo. Voraussetzung für jeden weiteren Aufbau.',
      effort: 'niedrig',
      effortMins: 10,
    });
  }

  if (!daten.bestehendeBU.hat) {
    empfehlungen.push({
      bereich: 'bu',
      prio: 1,
      title: 'Berufsunfähigkeit absichern',
      why:
        'Statistisch werden Hebammen zwischen 44 und 56 berufsunfähig. ' +
        'Ohne BU greift nach Krankengeld nur die Erwerbsminderungsrente – meist unter 1.000 €.',
      impact: 'Existenzielle Absicherung. Ohne BU steht alle weitere Vorsorge auf Sand.',
      effort: 'mittel',
      effortMins: 60,
    });
  } else {
    const empfohleneRente = Math.round(
      daten.monatsbrutto * 0.65 * BU_ANNAHMEN.empfohleneRenteMinProzentNetto,
    );
    if (daten.bestehendeBU.monatsRente < empfohleneRente * 0.7) {
      empfehlungen.push({
        bereich: 'bu_luecke',
        prio: 1,
        title: 'BU-Rente erhöhen oder Zusatzvertrag prüfen',
        why:
          `Bestehende BU-Rente (${daten.bestehendeBU.monatsRente.toLocaleString('de-DE')} €) ` +
          `deutlich unter empfohlenem Mindest-Niveau (≈ ${empfohleneRente.toLocaleString('de-DE')} €, ` +
          '80 % vom Netto).',
        impact:
          'BU-Lücke kann im Ernstfall zu Sozialhilfe führen, selbst bei aktiver BU.',
        effort: 'mittel',
        effortMins: 45,
      });
    }
  }

  // Substanz-Layer ---------------------------------------------------------
  const sparQuote =
    daten.monatsbrutto > 0 ? daten.aktuelleSparrate / daten.monatsbrutto : 0;
  if (sparQuote < 0.10) {
    empfehlungen.push({
      bereich: 'sparrate',
      prio: 2,
      title: 'Sparrate auf mindestens 10 % erhöhen',
      why:
        `Aktuelle Sparrate liegt bei ${Math.round(sparQuote * 100)} % vom Brutto. ` +
        'Für eine tragfähige Altersvorsorge sollten es mindestens 10 % sein, ' +
        'bei früherem Ausstieg eher 15 %.',
      impact: `Jedes zusätzliche Prozent macht über 30 Jahre ${Math.round(
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
      why:
        'Bisher werden vorhandene Förderungen (AVD, BAV, VL, ggf. GKV-Zuschlag) nicht genutzt.',
      impact: `Etwa ${foerderSummeProJahr.toLocaleString('de-DE')} €/Jahr geschenktes Geld liegen lassen.`,
      effort: 'mittel',
      effortMins: 45,
    });
  }

  if (daten.bestehenderRiester) {
    empfehlungen.push({
      bereich: 'riester_check',
      prio: 2,
      title: 'Riester-Vertrag prüfen (Bestandsschutz vs. AVD)',
      why:
        'Bestehender Riester läuft mit Bestandsschutz weiter, ab 2027 keine Neuabschlüsse. ' +
        'Je nach Vertrag günstiger weiter zu besparen ODER beitragsfrei stellen und AVD parallel starten.',
      impact: 'Abhängig von Vertragskonditionen – Einzelfall-Prüfung beim Anbieter.',
      effort: 'mittel',
      effortMins: 30,
    });
  }

  // Feinjustage-Layer ------------------------------------------------------
  if (!daten.steueroptimiert && steuerErsparnisProJahr > 200) {
    empfehlungen.push({
      bereich: 'steuern',
      prio: 3,
      title: 'Steuerlich sauber aufstellen',
      why:
        'Hebammen-Pauschale (1.535 €) oder Einzelnachweis – je nach Aufwand. ' +
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
      why:
        'AVD und Rürup sind vor 62/65 gesperrt. Bei Berufsausstieg mit 55 ist Geld nötig, ' +
        'das jederzeit verfügbar ist – ETF-Depot oder Nettopolice.',
      impact: 'Liquidität in der kritischen Phase zwischen Berufsende und Renteneintritt.',
      effort: 'niedrig',
      effortMins: 30,
    });
  }

  return empfehlungen.sort((a, b) => a.prio - b.prio).slice(0, 3);
}
