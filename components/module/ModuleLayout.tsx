'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { MODULE, MODUL_REIHENFOLGE, type ModulId } from '@/lib/calc/module';
import { cn } from '@/lib/utils';

interface ModuleLayoutProps {
  beratungId: string;
  modulId: ModulId;
  /** Eine ehrliche, kurze Aussage für die Hebamme – z.B. „Du verschenkst 1.535 €/Jahr". */
  headlineKicker: string;
  /** Die Kernzahl/-aussage. */
  headlineValue: string;
  /** Untertitel, gibt Kontext zur Headline. */
  headlineHint?: string;
  children: React.ReactNode;
}

export function ModuleLayout({
  beratungId,
  modulId,
  headlineKicker,
  headlineValue,
  headlineHint,
  children,
}: ModuleLayoutProps) {
  const meta = MODULE[modulId];
  const Icon = meta.icon;
  const accentColor =
    meta.accent === 'orange'
      ? 'text-orange'
      : meta.accent === 'green'
        ? 'text-green'
        : 'text-berry';

  return (
    <div className="min-h-full bg-cream">
      <ModuleNav beratungId={beratungId} activeId={modulId} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href={`/beratung/${beratungId}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-berry"
        >
          <ChevronLeft className="h-4 w-4" />
          Zur Auswertung
        </Link>

        <Reveal>
          <header className="mt-8 flex items-start gap-5">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm',
              )}
            >
              <Icon className={cn('h-7 w-7', accentColor)} />
            </div>
            <div className="flex-1">
              <p className="text-sm uppercase tracking-wide text-muted">{meta.label}</p>
              <h1 className="mt-1 font-serif text-3xl leading-tight text-berry sm:text-4xl">
                {headlineKicker}{' '}
                <span className={cn('italic', accentColor)}>{headlineValue}</span>
              </h1>
              {headlineHint && (
                <p className="mt-2 max-w-2xl text-base text-ink/80">{headlineHint}</p>
              )}
            </div>
          </header>
        </Reveal>

        <div className="mt-10 space-y-10">{children}</div>
      </main>
    </div>
  );
}

function ModuleNav({ beratungId, activeId }: { beratungId: string; activeId: ModulId }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-rule bg-cream/95 backdrop-blur print:hidden">
      <div className="mx-auto max-w-5xl overflow-x-auto px-4">
        <ul className="flex gap-1 py-2 text-sm">
          {MODUL_REIHENFOLGE.map((id) => {
            const m = MODULE[id];
            const active = id === activeId;
            return (
              <li key={id}>
                <Link
                  href={`/beratung/${beratungId}/${m.slug}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 transition',
                    active
                      ? 'bg-berry text-cream'
                      : 'text-muted hover:bg-white hover:text-berry',
                  )}
                >
                  <m.icon className="h-3.5 w-3.5" />
                  {m.shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------- *
 *  Section primitives — kept inline for tight coupling.
 * -------------------------------------------------------- */

interface SectionProps {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}

export function ModuleSection({ number, title, intro, children }: SectionProps) {
  const labels = {
    1: 'Status quo',
    2: 'Was möglich ist',
    3: 'Spiel mit deinen Zahlen',
    4: 'Nächste Schritte',
    5: 'Transparenz',
  } as const;

  return (
    <Reveal delay={50}>
      <section>
        <header className="flex items-baseline gap-3">
          <span className="font-serif text-3xl text-orange/70 tabular-nums">
            {String(number).padStart(2, '0')}
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">{labels[number]}</p>
            <h2 className="font-serif text-2xl leading-tight text-berry">{title}</h2>
          </div>
        </header>
        {intro && <div className="mt-3 max-w-2xl text-base text-ink/80">{intro}</div>}
        <div className="mt-5">{children}</div>
      </section>
    </Reveal>
  );
}

interface ChecklistProps {
  items: Array<{ title: string; detail?: React.ReactNode; effort?: string }>;
}

export function Checklist({ items }: ChecklistProps) {
  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="flex items-start gap-3 rounded-xl border border-rule bg-white p-4"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange/40 text-xs font-medium text-orange-deep tabular-nums">
            {idx + 1}
          </span>
          <div className="flex-1">
            <p className="font-medium text-ink">{item.title}</p>
            {item.detail && (
              <div className="mt-1 text-sm text-muted">{item.detail}</div>
            )}
            {item.effort && (
              <p className="mt-2 text-xs uppercase tracking-wide text-muted">
                Aufwand: {item.effort}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

interface SourceItem {
  label: string;
  detail?: string;
  stand?: string;
}

export function SourcesBox({ items }: { items: SourceItem[] }) {
  return (
    <div className="rounded-xl border border-rule bg-white/60 p-5">
      <p className="text-xs uppercase tracking-wide text-muted">Quellen & Stand</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
        {items.map((it, idx) => (
          <li key={idx}>
            <span className="font-medium text-ink">{it.label}</span>
            {it.detail && <span className="text-muted"> — {it.detail}</span>}
            {it.stand && (
              <span className="text-muted"> · Stand {it.stand}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Schätzungen aus typisierten Rechnungen. Keine individuelle Steuer-, Renten- oder
        Anlageberatung. Konkrete Konditionen über deine Berater:in.
      </p>
    </div>
  );
}
