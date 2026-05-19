import { formatEuro } from '@/lib/utils';
import { calcEinkommensPhasen } from './einkommensphasen';
import type { AggregateResult } from './aggregate';
import type { ModulId } from './module';
import type { BeratungDaten } from './types';

export type Tone = 'gap' | 'opportunity' | 'risk' | 'ok';

export interface TopicInsight {
  kicker: string;
  value: string;
  tone: Tone;
}

/**
 * Pro Modul: eine ehrliche, kurze Aussage mit Hebammen-relevanter Zahl.
 * Tonalität bewusst gewählt — „verschenkst" für ungenutzte Hebel,
 * „Existenz-Risiko" für BU-Lücke. Niemals reißerisch oder verkaufend.
 */
export function buildTopicInsights(
  result: AggregateResult,
  daten?: BeratungDaten,
): Record<ModulId, TopicInsight> {
  const jahreBisAusstieg = Math.max(1, result.altersvorsorge.jahreBisAusstieg);

  const steuern: TopicInsight =
    result.steuern.ersparnisProJahr > 200
      ? {
          kicker: 'Du verschenkst pro Jahr',
          value: formatEuro(result.steuern.ersparnisProJahr),
          tone: 'gap',
        }
      : {
          kicker: 'Status quo wirkt gut',
          value: 'Steuern weitgehend optimiert',
          tone: 'ok',
        };

  const foerderungen: TopicInsight =
    result.foerderungen.gesamtProJahr > 500
      ? {
          kicker: 'Du lässt jährlich liegen',
          value: formatEuro(result.foerderungen.gesamtProJahr),
          tone: 'gap',
        }
      : {
          kicker: 'Stand der Förderungen',
          value: 'wenig Hebel hier',
          tone: 'ok',
        };

  const av = result.altersvorsorge.optimiert.endkapital;
  const altersvorsorge: TopicInsight = {
    kicker: 'Mögliches Endkapital (optimiert)',
    value: formatEuro(av),
    tone: 'opportunity',
  };

  // Vermögensaufbau = Schicht 3, mit BU-Stresstest als Spannung
  const bleibt = result.altersvorsorge.buStress.endkapital;
  const vermoegensaufbau: TopicInsight =
    bleibt < av * 0.5
      ? {
          kicker: 'Bei BU mit 50 bleibt nur',
          value: formatEuro(bleibt),
          tone: 'opportunity',
        }
      : {
          kicker: 'Vermögen über 30 Jahre',
          value: formatEuro(av),
          tone: 'opportunity',
        };

  // BU-Schutz — wenn Daten vorhanden, nutze die starke „Verlust gesamte BU"-Zahl
  const bu = result.buLuecke;
  let buInsight: TopicInsight;
  if (daten && bu.status !== 'gut') {
    const phasen = calcEinkommensPhasen(daten);
    buInsight = {
      kicker: 'Verlust bei BU bis zur Rente',
      value: formatEuro(phasen.verlustBisRente),
      tone: 'risk',
    };
  } else if (bu.status === 'fehlt') {
    buInsight = {
      kicker: 'BU-Schutz fehlt komplett',
      value: `Lücke ${formatEuro(bu.luecke)}/Mon`,
      tone: 'risk',
    };
  } else if (bu.status === 'unterversorgt') {
    buInsight = {
      kicker: 'BU-Lücke pro Monat',
      value: formatEuro(bu.luecke),
      tone: 'risk',
    };
  } else if (bu.status === 'ok') {
    buInsight = {
      kicker: 'BU-Schutz fast komplett',
      value: `noch ${formatEuro(Math.max(0, bu.luecke))}/Mon offen`,
      tone: 'opportunity',
    };
  } else {
    buInsight = {
      kicker: 'BU-Schutz',
      value: 'solide aufgestellt',
      tone: 'ok',
    };
  }

  // Kumulativ über Jahre — als Subline-Variante wenn ersparnis gering ist
  void jahreBisAusstieg;

  return {
    steuern,
    foerderungen,
    altersvorsorge,
    vermoegensaufbau,
    'bu-schutz': buInsight,
  };
}
