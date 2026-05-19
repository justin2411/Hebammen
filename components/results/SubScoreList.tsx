'use client';

import type { ScoreSubs } from '@/lib/calc/score';

const LABEL: Record<keyof ScoreSubs, string> = {
  sparquote: 'Sparquote',
  buSchutz: 'BU-Schutz',
  foerderquote: 'Förderquote',
  steuerOptimierung: 'Steueroptimierung',
  flexibilitaet: 'Flexible 3. Schicht',
  liquidPuffer: 'Liquider Puffer',
};

export function SubScoreList({ subs }: { subs: ScoreSubs }) {
  const keys = Object.keys(subs) as (keyof ScoreSubs)[];
  return (
    <ul className="space-y-2">
      {keys.map((k) => {
        const v = subs[k];
        const tone =
          v >= 75
            ? 'bg-success'
            : v >= 50
              ? 'bg-orange'
              : v >= 30
                ? 'bg-warning'
                : 'bg-danger';
        return (
          <li key={k}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="text-ink">{LABEL[k]}</span>
              <span className="tabular-nums text-muted">{v}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-rule">
              <div
                className={`h-full ${tone} transition-all duration-1000`}
                style={{ width: `${v}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
