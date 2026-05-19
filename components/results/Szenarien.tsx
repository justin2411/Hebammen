'use client';

import { useState } from 'react';
import { Range, Toggle } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';
import { aggregate } from '@/lib/calc/aggregate';
import { Lifeline } from './Lifeline';
import { formatEuro, formatProzent } from '@/lib/utils';
import { Reveal } from '@/components/shared/Reveal';
import type { BeratungDaten } from '@/lib/calc/types';

interface SzenarienProps {
  daten: BeratungDaten;
}

/**
 * Szenarien-Block mit Rendite- und Inflations-Slider.
 * Re-aggregiert bei jedem Slider-Wert für Live-Update.
 */
export function Szenarien({ daten }: SzenarienProps) {
  const [rendite, setRendite] = useState(0.06);
  const [inflation, setInflation] = useState(0.02);
  const [realWert, setRealWert] = useState(false);

  const result = aggregate(daten, { renditeNominal: rendite, inflation });
  const av = result.altersvorsorge;

  const pickKapital = (s: { endkapital: number; endkapitalReal: number }) =>
    realWert ? s.endkapitalReal : s.endkapital;
  const pickRente = (s: { monatlicheRente30Jahre: number; monatlicheRente30JahreReal: number }) =>
    realWert ? s.monatlicheRente30JahreReal : s.monatlicheRente30Jahre;

  return (
    <Reveal delay={300}>
      <Card className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-berry">
              Drei Szenarien über {av.jahreBisAusstieg} Jahre
            </h2>
            <p className="mt-1 text-sm text-muted">
              Wie sich verschiedene Sparraten unter deinen Annahmen entwickeln.
            </p>
          </div>
          <Toggle
            checked={realWert}
            onChange={setRealWert}
            label={realWert ? 'Heutige Kaufkraft' : 'Nominale Werte'}
            description={
              realWert
                ? 'Inflation eingerechnet'
                : `Nicht inflationsbereinigt (Inflation = ${formatProzent(inflation)})`
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Range
            label="Erwartete Rendite p.a."
            value={rendite}
            onChange={setRendite}
            min={0.02}
            max={0.10}
            step={0.005}
            formatValue={(v) => formatProzent(v, 1)}
          />
          <Range
            label="Inflation p.a."
            value={inflation}
            onChange={setInflation}
            min={0}
            max={0.05}
            step={0.005}
            formatValue={(v) => formatProzent(v, 1)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SzenarioPill
            label="aktuell"
            kapital={pickKapital(av.aktuell)}
            rente={pickRente(av.aktuell)}
            monatlich={av.aktuell.monatlicheRate}
            tone="muted"
          />
          <SzenarioPill
            label="optimiert"
            kapital={pickKapital(av.optimiert)}
            rente={pickRente(av.optimiert)}
            monatlich={av.optimiert.monatlicheRate}
            tone="berry"
          />
          <SzenarioPill
            label="maximal"
            kapital={pickKapital(av.maximal)}
            rente={pickRente(av.maximal)}
            monatlich={av.maximal.monatlicheRate}
            tone="orange"
          />
        </div>

        <Lifeline
          alter={daten.alter}
          ausstiegsalter={daten.ausstiegsalter}
          startCapital={daten.startCapital}
          aktuelleSparrate={av.aktuell.monatlicheRate}
          optimierteSparrate={av.optimiert.monatlicheRate}
          rendite={rendite}
          buStress={av.buStress}
        />

        <div className="rounded-md border border-danger/30 bg-danger/5 p-4 text-sm leading-relaxed text-ink">
          <strong className="text-danger">Stresstest BU mit {av.buStress.buAlter}: </strong>
          Wenn ab dieser Stelle keine Beiträge mehr fließen, bleibt nur{' '}
          <span className="font-medium tabular-nums">
            {formatEuro(av.buStress.endkapital)}
          </span>{' '}
          (≈ {formatProzent(av.buStress.anteilOhneStress, 0)} vom optimierten Verlauf).
          Genau dafür ist die BU da.
        </div>
      </Card>
    </Reveal>
  );
}

function SzenarioPill({
  label,
  kapital,
  rente,
  monatlich,
  tone,
}: {
  label: string;
  kapital: number;
  rente: number;
  monatlich: number;
  tone: 'muted' | 'berry' | 'orange';
}) {
  const toneClass =
    tone === 'berry'
      ? 'border-berry/30 bg-berry/5 text-berry'
      : tone === 'orange'
        ? 'border-orange/40 bg-orange/10 text-orange-deep'
        : 'border-rule bg-cream-dark/50 text-ink';
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-2 font-serif text-2xl tabular-nums">{formatEuro(kapital)}</p>
      <p className="mt-1 text-xs opacity-80">
        ≈ {formatEuro(rente)}/Mon. über 30 J. Entnahme
      </p>
      <p className="mt-2 text-xs opacity-60">Rate: {formatEuro(monatlich)}/Mon.</p>
    </div>
  );
}
