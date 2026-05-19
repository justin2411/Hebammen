'use client';

import { Reveal } from '@/components/shared/Reveal';
import { Card } from '@/components/ui/Card';
import { Szenarien } from '@/components/results/Szenarien';
import { formatEuro } from '@/lib/utils';
import type { BeratungDaten } from '@/lib/calc/types';
import type { BuLueckeResult } from '@/lib/calc/bu';
import type { RuerupResult } from '@/lib/calc/ruerup';

interface AltersvorsorgeDetailProps {
  daten: BeratungDaten;
  buLuecke: BuLueckeResult;
  ruerup: RuerupResult;
}

const STATUS_TONE = {
  fehlt: 'border-danger/40 bg-danger/10 text-danger',
  unterversorgt: 'border-warning/40 bg-warning/10 text-ink',
  ok: 'border-success/40 bg-success/10 text-ink',
  gut: 'border-success/40 bg-success/15 text-success',
} as const;

const STATUS_LABEL = {
  fehlt: 'BU fehlt komplett',
  unterversorgt: 'Deutliche Lücke',
  ok: 'Brauchbar',
  gut: 'Gut aufgestellt',
} as const;

export function AltersvorsorgeDetail({ daten, buLuecke, ruerup }: AltersvorsorgeDetailProps) {
  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Altersvorsorge</span> und BU
        </h1>
        <p className="mt-2 text-muted">
          Szenarien, Versorgungslücke und Stresstest.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <Card className={`${STATUS_TONE[buLuecke.status]} border`}>
          <h2 className="font-serif text-xl">BU-Lücke</h2>
          <p className="mt-1 text-sm">{STATUS_LABEL[buLuecke.status]}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Mini label="Empfohlene Rente" value={formatEuro(buLuecke.empfohleneMonatsRente)} />
            <Mini label="Bestehend" value={formatEuro(buLuecke.bestehend)} />
            <Mini
              label="Lücke / Monat"
              value={
                buLuecke.luecke > 0 ? formatEuro(buLuecke.luecke) : '—'
              }
            />
          </div>
        </Card>
      </Reveal>

      <Reveal delay={200}>
        <Card>
          <h2 className="font-serif text-xl text-berry">Rürup-Kapazität</h2>
          <p className="mt-1 text-sm text-muted">
            Der Höchstbetrag wird um DRV-Pflichtbeiträge gemindert.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Mini label="Höchstbetrag Brutto" value={formatEuro(ruerup.hoechstbetragBrutto)} />
            <Mini
              label="DRV-Pflichtbeitrag"
              value={formatEuro(ruerup.drvBeitragGeschaetzt)}
              hint={daten.drvPflicht ? '18,6 % vom Brutto' : 'Nicht pflichtversichert'}
            />
            <Mini label="Verfügbar / Jahr" value={formatEuro(ruerup.hoechstbetragVerfuegbar)} accent />
          </div>
          <p className="mt-4 text-xs text-muted">
            Empfohlener Eigenbeitrag (gedeckelt 12k €):{' '}
            <span className="tabular-nums">{formatEuro(ruerup.empfohlenerEigenbeitragJahr)}</span>
          </p>
        </Card>
      </Reveal>

      <Szenarien daten={daten} />
    </div>
  );
}

function Mini({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md bg-white/60 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 font-serif text-xl tabular-nums ${accent ? 'text-orange-deep' : 'text-berry'}`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
