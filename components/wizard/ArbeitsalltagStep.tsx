'use client';

import { Field, NumberInput } from '@/components/ui/Field';
import type { BeratungDaten } from '@/lib/calc/types';

interface Props {
  daten: BeratungDaten;
  onChange: (patch: Partial<BeratungDaten>) => void;
}

export function ArbeitsalltagStep({ daten, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Arbeitsalltag</span>
        </h2>
        <p className="mt-2 text-muted">
          Für die Berechnung der Steueroptimierung – Werte aus dem Sub-Profil sind vorbefüllt,
          können aber justiert werden.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kilometer pro Jahr (beruflich)" hint="0,30 € pro km steuerlich ansetzbar">
          <NumberInput
            min={0}
            step={100}
            value={daten.kilometer}
            onChange={(e) => onChange({ kilometer: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field
          label="Homeoffice-Tage pro Jahr"
          hint="6 €/Tag, max. 210 Tage = 1.260 €"
        >
          <NumberInput
            min={0}
            max={210}
            value={daten.homeofficeTage}
            onChange={(e) => onChange({ homeofficeTage: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field
          label="Fortbildungen (€/Jahr)"
          hint="Kurse, Bücher, Reisekosten zu Veranstaltungen"
        >
          <NumberInput
            min={0}
            step={50}
            value={daten.fortbildungen}
            onChange={(e) => onChange({ fortbildungen: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field
          label="Equipment / Arbeitsmittel (€/Jahr)"
          hint="CTG, Mobiltelefon, Laptop, Verbrauchsmaterial"
        >
          <NumberInput
            min={0}
            step={50}
            value={daten.equipment}
            onChange={(e) => onChange({ equipment: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <div className="rounded-md bg-cream-dark p-4 text-sm leading-relaxed text-ink/80">
        <strong>Hinweis:</strong> Bei Freiberuflichen vergleicht das Tool diese Einzelnachweise mit
        der Hebammen-Betriebsausgabenpauschale (25 %, max. 1.535 €). Wir empfehlen das günstigere.
      </div>
    </div>
  );
}
