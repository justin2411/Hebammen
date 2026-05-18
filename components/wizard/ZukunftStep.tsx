'use client';

import { Field, NumberInput } from '@/components/ui/Field';
import type { BeratungDaten } from '@/lib/calc/types';

interface Props {
  daten: BeratungDaten;
  onChange: (patch: Partial<BeratungDaten>) => void;
}

export function ZukunftStep({ daten, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Zukunft</span>
        </h2>
        <p className="mt-2 text-muted">
          Was läuft heute schon an Vorsorge, und bis wann willst du arbeiten?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Aktuelle Sparrate pro Monat (€)"
          hint="Alles zusammen: Riester, BAV, ETF, ..."
        >
          <NumberInput
            min={0}
            step={50}
            value={daten.aktuelleSparrate}
            onChange={(e) => onChange({ aktuelleSparrate: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field
          label="Bisheriges Vorsorge-Kapital (€)"
          hint="Summe aller bisher angesparten Vorsorge-Töpfe"
        >
          <NumberInput
            min={0}
            step={1000}
            value={daten.startCapital}
            onChange={(e) => onChange({ startCapital: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field
          label="Gewünschtes Ausstiegsalter"
          hint="Bei Hebammen oft 55–62 wegen körperlicher Belastung"
        >
          <NumberInput
            min={50}
            max={70}
            value={daten.ausstiegsalter}
            onChange={(e) => onChange({ ausstiegsalter: Number(e.target.value) || 65 })}
          />
        </Field>
      </div>

      <div className="rounded-md bg-cream-dark p-4 text-sm leading-relaxed text-ink/80">
        <strong>Hinweis:</strong> Aus diesen Werten + dem freigesetzten Potenzial berechnen wir drei
        Szenarien (aktuell / optimiert / maximal), die Versorgungslücke und einen Stresstest
        &quot;BU mit 50&quot;.
      </div>
    </div>
  );
}
