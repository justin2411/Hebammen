'use client';

import { Field, NumberInput, Select, Toggle } from '@/components/ui/Field';
import type { BeratungDaten, KvArt, Steuerklasse } from '@/lib/calc/types';

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

      {/* Schema-v3: Einkommenssicherung — präzisere Netto-Berechnung */}
      <div className="space-y-3 rounded-lg border border-rule bg-cream-dark/30 p-5">
        <h3 className="font-serif text-lg text-berry">
          Steuer & Krankenversicherung
        </h3>
        <p className="text-sm text-muted">
          Für die genaue Netto-Rechnung und das Krankengeld-/BU-Szenario.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Steuerklasse">
            <Select
              value={daten.steuerklasse}
              onChange={(e) =>
                onChange({ steuerklasse: Number(e.target.value) as Steuerklasse })
              }
            >
              <option value={1}>1 — ledig</option>
              <option value={2}>2 — alleinerziehend</option>
              <option value={3}>3 — verheiratet (Hauptverdienend)</option>
              <option value={4}>4 — verheiratet (gleich verdienend)</option>
              <option value={5}>5 — verheiratet (zweitverdienend)</option>
              <option value={6}>6 — Zweitjob</option>
            </Select>
          </Field>

          <Field label="Krankenversicherung">
            <Select
              value={daten.kvArt}
              onChange={(e) => onChange({ kvArt: e.target.value as KvArt })}
            >
              <option value="gkv_pflicht">Gesetzlich pflichtversichert</option>
              <option value="gkv_freiwillig">Gesetzlich freiwillig (kein Krankengeld)</option>
              <option value="gkv_wahltarif">Gesetzlich + Wahltarif Krankengeld</option>
              <option value="pkv">Privat</option>
            </Select>
          </Field>
        </div>

        <Toggle
          checked={daten.kirchensteuer}
          onChange={(v) => onChange({ kirchensteuer: v })}
          label="Kirchensteuerpflichtig"
          description="8 % in BW/BY, sonst 9 % der Lohnsteuer"
        />

        {(daten.kvArt === 'pkv' || daten.kvArt === 'gkv_freiwillig') && (
          <Field
            label="Monatliches Krankentagegeld (€)"
            hint={
              daten.kvArt === 'pkv'
                ? 'Aus deinem PKV-Vertrag — steuer- und SV-frei. 0 wenn nicht abgeschlossen.'
                : 'Wahltarif/Wahlleistung deiner Kasse. 0 wenn nicht abgeschlossen.'
            }
          >
            <NumberInput
              min={0}
              step={100}
              value={daten.krankentagegeld}
              onChange={(e) =>
                onChange({ krankentagegeld: Number(e.target.value) || 0 })
              }
            />
          </Field>
        )}
      </div>
    </div>
  );
}
