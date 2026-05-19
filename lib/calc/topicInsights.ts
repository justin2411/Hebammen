import { formatEuro } from '@/lib/utils';
import type { AggregateResult } from './aggregate';
import type { ModulId } from './module';

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

  // BU-Schutz
  const bu = result.buLuecke;
  const buInsight: TopicInsight =
    bu.status === 'fehlt'
      ? {
          kicker: 'BU-Schutz fehlt komplett',
          value: `Lücke ${formatEuro(bu.luecke)}/Mon`,
          tone: 'risk',
        }
      : bu.status === 'unterversorgt'
        ? {
            kicker: 'BU-Lücke pro Monat',
            value: formatEuro(bu.luecke),
            tone: 'risk',
          }
        : bu.status === 'ok'
          ? {
              kicker: 'BU-Schutz fast komplett',
              value: `noch ${formatEuro(Math.max(0, bu.luecke))}/Mon offen`,
              tone: 'opportunity',
            }
          : {
              kicker: 'BU-Schutz',
              value: 'solide aufgestellt',
              tone: 'ok',
            };

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
