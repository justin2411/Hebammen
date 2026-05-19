'use client';

import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/shared/Reveal';
import { SourceTooltip } from '@/components/shared/SourceTooltip';
import { STEUERN_2026 } from '@/config/steuern';
import { formatEuro, formatProzent } from '@/lib/utils';
import type { SteuerResult } from '@/lib/calc/steuern';

export function SteuernDetail({ result }: { result: SteuerResult }) {
  const empf = result.empfehlung === 'einzelnachweis' ? 'Einzelnachweis' : 'Pauschale';
  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Steuern</span>
        </h1>
        <p className="mt-2 text-muted">
          Vergleich Hebammen-Betriebsausgabenpauschale vs. Einzelnachweis. Empfehlung:{' '}
          <span className="font-medium text-ink">{empf}</span>.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <Card>
          <h2 className="font-serif text-xl text-berry">Methodenvergleich</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MethodBox
              title="Pauschale"
              active={result.empfehlung === 'pauschale'}
              value={result.pauschale}
              note={
                <SourceTooltip label="25 % vom Umsatz, max. 1.535 €">
                  <strong>Hebammen-Betriebsausgabenpauschale</strong>
                  <br />
                  25 % des Jahresumsatzes, gedeckelt bei 1.535 €.<br />
                  Rechtsgrundlage: §3 EStR, BMF-Schreiben.<br />
                  Stand: {STEUERN_2026.letztePruefung}.
                </SourceTooltip>
              }
            />
            <MethodBox
              title="Einzelnachweis"
              active={result.empfehlung === 'einzelnachweis'}
              value={result.einzelnachweis.summe}
              note="Kilometer + Homeoffice + Fortbildung + Equipment"
            />
          </div>

          <div className="mt-6 rounded-md bg-cream-dark p-4">
            <h3 className="text-sm font-medium text-ink">Einzelposten</h3>
            <dl className="mt-3 grid gap-y-1 text-sm sm:grid-cols-2">
              <PostenRow label="Kilometer (0,30 €/km)" value={result.einzelnachweis.kilometer} />
              <PostenRow label="Homeoffice (6 €/Tag)" value={result.einzelnachweis.homeoffice} />
              <PostenRow label="Fortbildungen" value={result.einzelnachweis.fortbildungen} />
              <PostenRow label="Equipment" value={result.einzelnachweis.equipment} />
            </dl>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={200}>
        <Card>
          <h2 className="font-serif text-xl text-berry">Ersparnis</h2>
          <p className="mt-2 text-sm text-muted">
            Angesetzte Betriebsausgaben × geschätzter Grenzsteuersatz.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Beste Betriebsausgabe"
              value={formatEuro(result.bestBA)}
              hint={empf}
            />
            <Stat
              label={<SourceTooltip label="Grenzsteuersatz">
                Vereinfachte Stufenfunktion (kein §32a-Formel).
                <br />Bei Verheirateten: Referenz = zvE / 2 (Splitting).
              </SourceTooltip>}
              value={formatProzent(result.grenzsteuersatz)}
            />
            <Stat
              label="Ersparnis pro Jahr"
              value={formatEuro(result.ersparnisProJahr)}
              accent
            />
          </div>
        </Card>
      </Reveal>

      <Disclaimer />
    </div>
  );
}

function MethodBox({
  title,
  value,
  note,
  active,
}: {
  title: string;
  value: number;
  note: React.ReactNode;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${active ? 'border-berry bg-berry/5' : 'border-rule'}`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {active && (
          <span className="rounded-full bg-berry px-2 py-0.5 text-[10px] uppercase text-cream">
            empfohlen
          </span>
        )}
      </div>
      <p className="mt-2 font-serif text-2xl text-berry tabular-nums">{formatEuro(value)}</p>
      <p className="mt-2 text-xs text-muted">{note}</p>
    </div>
  );
}

function PostenRow({ label, value }: { label: string; value: number }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-right tabular-nums text-ink sm:text-left">{formatEuro(value)}</dd>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: React.ReactNode;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-rule bg-cream-dark/40 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 font-serif text-2xl tabular-nums ${accent ? 'text-orange-deep' : 'text-berry'}`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="text-xs leading-relaxed text-muted">
      Schätzungen, keine Steuerberatung. Konkrete Konditionen über Steuerberater. Werte-Stand:{' '}
      {STEUERN_2026.letztePruefung}.
    </p>
  );
}
