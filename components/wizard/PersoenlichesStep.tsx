'use client';

import { Field, NumberInput, Select, Toggle } from '@/components/ui/Field';
import type { BeratungDaten } from '@/lib/calc/types';

interface Props {
  daten: BeratungDaten;
  hebammeName: string;
  onChangeName: (v: string) => void;
  onChange: (patch: Partial<BeratungDaten>) => void;
}

export function PersoenlichesStep({ daten, hebammeName, onChangeName, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Persönliches</span>
        </h2>
        <p className="mt-2 text-muted">
          Name der Hebamme und Basisdaten – beeinflusst Steuer- und Förder-Logik.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name der Hebamme">
          <input
            type="text"
            value={hebammeName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Vorname Nachname"
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-base text-ink focus:border-berry focus:outline-none focus:ring-2 focus:ring-berry/15"
          />
        </Field>

        <Field label="Alter">
          <NumberInput
            min={18}
            max={75}
            value={daten.alter}
            onChange={(e) => onChange({ alter: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field label="Berufsstatus">
          <Select
            value={daten.status}
            onChange={(e) => onChange({ status: e.target.value as BeratungDaten['status'] })}
          >
            <option value="angestellt">Angestellt (Klinik)</option>
            <option value="freiberuflich">Freiberuflich</option>
            <option value="beleg">Beleghebamme</option>
            <option value="kombi">Kombination angestellt + frei</option>
          </Select>
        </Field>

        <Field label="Monatsbrutto (€)">
          <NumberInput
            min={0}
            step={100}
            value={daten.monatsbrutto}
            onChange={(e) => onChange({ monatsbrutto: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field
          label="Berufseintrittsalter"
          hint="Wann hast du als Hebamme angefangen? Beeinflusst die DRV-Beitragsjahre."
        >
          <NumberInput
            min={16}
            max={50}
            value={daten.berufseintrittsalter}
            onChange={(e) =>
              onChange({ berufseintrittsalter: Number(e.target.value) || 22 })
            }
          />
        </Field>

        <Field label="Anzahl Kinder">
          <NumberInput
            min={0}
            max={10}
            value={daten.kinder}
            onChange={(e) => onChange({ kinder: Number(e.target.value) || 0 })}
          />
        </Field>

        <Field label="Davon über 6 Jahre">
          <NumberInput
            min={0}
            max={daten.kinder}
            value={daten.kinderUeber6}
            onChange={(e) => onChange({ kinderUeber6: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle
          checked={daten.verheiratet}
          onChange={(v) => onChange({ verheiratet: v })}
          label="Verheiratet"
          description="Splitting-Vorteil bei der Steuer"
        />
        <Toggle
          checked={daten.geburtshilfe}
          onChange={(v) => onChange({ geburtshilfe: v })}
          label="Geburtshilfe-Tätigkeit"
          description="Außerklinische Geburten – GKV-Sicherstellungszuschlag möglich"
        />
      </div>
    </div>
  );
}
