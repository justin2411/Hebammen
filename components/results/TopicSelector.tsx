'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { MODULE, MODUL_REIHENFOLGE } from '@/lib/calc/module';
import { cn } from '@/lib/utils';

interface TopicInsight {
  /** Headline-Zahl, z.B. "1.535 €/Jahr". */
  value: string;
  /** Kicker davor, z.B. "Du verschenkst". */
  kicker: string;
  /** Optionaler Tonbruch: positive Aussage, statt Mangel. */
  tone?: 'gap' | 'opportunity' | 'risk' | 'ok';
}

interface TopicSelectorProps {
  beratungId: string;
  insights: Record<string, TopicInsight>;
}

const TONE_STYLES = {
  gap: 'border-orange/30 bg-orange-soft/30',
  opportunity: 'border-berry/20 bg-white',
  risk: 'border-danger/40 bg-danger/5',
  ok: 'border-green/40 bg-green/5',
} as const;

const TONE_LABEL = {
  gap: 'Verschenktes Geld',
  opportunity: 'Hebel-Thema',
  risk: 'Existenz-Risiko',
  ok: 'Solide aufgestellt',
} as const;

export function TopicSelector({ beratungId, insights }: TopicSelectorProps) {
  return (
    <section className="mt-16">
      <Reveal delay={50}>
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-muted">
            Was willst du jetzt verstehen?
          </p>
          <h2 className="mt-2 font-serif text-3xl text-berry sm:text-4xl">
            Such dir aus, <span className="italic text-orange">wo&apos;s tief reingeht</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink/80">
            Jedes Thema mit deinen Zahlen, konkreten Beispielen und einer Checkliste,
            die du mitnimmst.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODUL_REIHENFOLGE.map((id, idx) => {
          const m = MODULE[id];
          const insight = insights[id];
          if (!insight) return null;
          const tone = insight.tone ?? 'opportunity';
          const Icon = m.icon;

          return (
            <Reveal key={id} delay={100 + idx * 60}>
              <Link
                href={`/beratung/${beratungId}/${m.slug}`}
                className={cn(
                  'group flex h-full flex-col gap-3 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md',
                  TONE_STYLES[tone],
                )}
              >
                <header className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon
                        className={cn(
                          'h-4.5 w-4.5',
                          m.accent === 'orange'
                            ? 'text-orange'
                            : m.accent === 'green'
                              ? 'text-green'
                              : 'text-berry',
                        )}
                      />
                    </span>
                    <h3 className="font-serif text-lg text-berry">{m.label}</h3>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide',
                      tone === 'gap'
                        ? 'bg-orange/15 text-orange-deep'
                        : tone === 'risk'
                          ? 'bg-danger/15 text-danger'
                          : tone === 'ok'
                            ? 'bg-green/20 text-green'
                            : 'bg-berry/10 text-berry',
                    )}
                  >
                    {TONE_LABEL[tone]}
                  </span>
                </header>

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {insight.kicker}
                  </p>
                  <p className="mt-1 font-serif text-2xl leading-tight text-berry tabular-nums">
                    {insight.value}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-ink/70">{m.subtitle}</p>

                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-orange-deep group-hover:gap-2">
                  Tiefer reingehen
                  <ArrowRight className="h-4 w-4 transition" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
