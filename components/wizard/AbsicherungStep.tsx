'use client';

import { Field, NumberInput, Toggle } from '@/components/ui/Field';
import type { BeratungDaten } from '@/lib/calc/types';

interface Props {
  daten: BeratungDaten;
  onChange: (patch: Partial<BeratungDaten>) => void;
}

export function AbsicherungStep({ daten, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Absicherung</span> heute
        </h2>
        <p className="mt-2 text-muted">
          Was ist schon da – BU, Notgroschen, Pflichtversicherung. Beeinflusst Empfehlungen direkt.
        </p>
      </div>

      <div className="space-y-3">
        <Toggle
          checked={daten.drvPflicht}
          onChange={(v) => onChange({ drvPflicht: v })}
          label="DRV-pflichtversichert"
          description="Hebammen sind als Pflegende grundsätzlich Pflichtmitglied – wirkt sich auf Rürup-Höchstbetrag aus."
        />

        <Toggle
          checked={daten.bestehendeBU.hat}
          onChange={(v) =>
            onChange({
              bestehendeBU: { ...daten.bestehendeBU, hat: v },
            })
          }
          label="Berufsunfähigkeitsversicherung vorhanden"
          description="Statistisch werden Hebammen zwischen 44 und 56 berufsunfähig – mit Abstand wichtigste Police."
        />

        {daten.bestehendeBU.hat && (
          <div className="grid gap-4 rounded-md border border-rule bg-cream-dark/40 p-4 sm:grid-cols-2">
            <Field label="Monatliche BU-Rente (€)">
              <NumberInput
                min={0}
                step={100}
                value={daten.bestehendeBU.monatsRente}
                onChange={(e) =>
                  onChange({
                    bestehendeBU: {
                      ...daten.bestehendeBU,
                      monatsRente: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="Vertragsendalter">
              <NumberInput
                min={50}
                max={75}
                value={daten.bestehendeBU.endalter}
                onChange={(e) =>
                  onChange({
                    bestehendeBU: {
                      ...daten.bestehendeBU,
                      endalter: Number(e.target.value) || 67,
                    },
                  })
                }
              />
            </Field>
          </div>
        )}

        <Toggle
          checked={daten.bestehenderRiester}
          onChange={(v) => onChange({ bestehenderRiester: v })}
          label="Bestehender Riester-Vertrag"
          description="Läuft mit Bestandsschutz weiter, ab 2027 keine Neuabschlüsse. Wir prüfen, ob weiter besparen sinnvoll ist."
        />
      </div>

      <Field
        label="Notgroschen (in Monatsnettos)"
        hint="Empfohlen: 3–6 Monatsnettos liquide. Geht VOR Vorsorgeaufbau."
      >
        <NumberInput
          min={0}
          max={24}
          value={daten.notgroschenMonate}
          onChange={(e) => onChange({ notgroschenMonate: Number(e.target.value) || 0 })}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Toggle
          checked={daten.nutztFoerderungen}
          onChange={(v) => onChange({ nutztFoerderungen: v })}
          label="Förderungen genutzt"
          description="AVD, BAV, VL, GKV-Zuschlag"
        />
        <Toggle
          checked={daten.steueroptimiert}
          onChange={(v) => onChange({ steueroptimiert: v })}
          label="Steuerlich optimiert"
          description="Pauschale/Belege bewusst gewählt"
        />
        <Toggle
          checked={daten.hatFlexibleVorsorge}
          onChange={(v) => onChange({ hatFlexibleVorsorge: v })}
          label="Flexible 3. Schicht"
          description="ETF-Depot oder Nettopolice"
        />
      </div>
    </div>
  );
}
