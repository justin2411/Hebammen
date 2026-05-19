'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { Card } from '@/components/ui/Card';
import type { Empfehlung } from '@/lib/calc/empfehlungen';
import { EMPFEHLUNG_TO_MODUL, MODULE } from '@/lib/calc/module';

const EFFORT_LABEL = {
  niedrig: 'Wenig Aufwand',
  mittel: 'Mittlerer Aufwand',
  hoch: 'Mehr Aufwand',
} as const;

const PRIO_BG = {
  1: 'bg-danger/10 text-danger',
  2: 'bg-orange/15 text-orange-deep',
  3: 'bg-cream-dark text-ink',
} as const;

interface EmpfehlungenProps {
  empfehlungen: Empfehlung[];
  beratungId: string;
}

export function Empfehlungen({ empfehlungen, beratungId }: EmpfehlungenProps) {
  if (empfehlungen.length === 0) {
    return (
      <Reveal delay={400}>
        <Card>
          <h2 className="font-serif text-2xl text-berry">
            <span className="italic text-orange">Stark aufgestellt</span>
          </h2>
          <p className="mt-2 text-muted">
            Auf Basis der eingegebenen Daten sehen wir keine akuten Lücken. Im Gespräch lohnt sich
            ein Blick auf Inflations-Schutz und Sensitivitäts-Szenarien.
          </p>
        </Card>
      </Reveal>
    );
  }

  return (
    <Reveal delay={400}>
      <div>
        <h2 className="mb-4 font-serif text-2xl text-berry">
          Empfehlungen <span className="italic text-orange">in dieser Reihenfolge</span>
        </h2>
        <ol className="grid gap-3">
          {empfehlungen.map((e, idx) => {
            const modulId = EMPFEHLUNG_TO_MODUL[e.bereich];
            const modul = MODULE[modulId];
            return (
              <li
                key={`${e.bereich}-${idx}`}
                className="rounded-2xl border border-rule bg-white p-5"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-lg ${PRIO_BG[e.prio]}`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-berry">{e.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/80">{e.why}</p>
                    <p className="mt-2 text-sm font-medium text-orange-deep">{e.impact}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-muted">
                        {EFFORT_LABEL[e.effort]} · etwa {e.effortMins} Minuten
                      </span>
                      <Link
                        href={`/beratung/${beratungId}/${modul.slug}`}
                        className="inline-flex items-center gap-1 rounded-full bg-berry/10 px-3 py-1 text-xs font-medium text-berry hover:bg-berry/15"
                      >
                        Mehr im Modul „{modul.label}"
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
