'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Field, NumberInput, Range, Select, Toggle } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { WunschGauge } from '@/components/shared/WunschGauge';
import { formatEuro } from '@/lib/utils';
import {
  calcVersorgungsziel,
  calcKostenDesWartens,
  calcInvestitionswunsch,
  calcSparrateFuerZiel,
  calcBenoetigtesKapital,
  createBestehendeVorsorge,
  vorsorgeArtLabel,
} from '@/lib/calc/avRechner';
import type { BeratungDaten, BestehendeVorsorge, VorsorgeArt } from '@/lib/calc/types';

interface AvRechnerProps {
  daten: BeratungDaten;
}

/**
 * AV-Rechner als interaktive Komponente — alle Inputs lokal,
 * keine Mutation der Beratungsdaten. Schiebe-Sliders, Add/Remove Verträge.
 */
export function AvRechner({ daten: initial }: AvRechnerProps) {
  const [daten, setDaten] = useState<BeratungDaten>(initial);
  const [mitKvdr, setMitKvdr] = useState(true);
  const [nachKaufkraft, setNachKaufkraft] = useState(false);
  const [wunschSparrate, setWunschSparrate] = useState(initial.aktuelleSparrate || 100);

  const ziel = useMemo(() => calcVersorgungsziel(daten, mitKvdr), [daten, mitKvdr]);
  const entnahmejahre = Math.max(0, daten.lebenserwartung - 67);
  const benoetigt = calcBenoetigtesKapital(
    ziel.versorgungsluecke,
    entnahmejahre,
    daten.renditeEntnahmephase,
  );
  const wartenSzenarien = useMemo(
    () => calcKostenDesWartens(daten, ziel.versorgungsluecke),
    [daten, ziel.versorgungsluecke],
  );
  const notwendigeSparrateHeute = wartenSzenarien.szenarien[0].notwendigeSparrate;
  const wunsch = calcInvestitionswunsch(wunschSparrate, notwendigeSparrateHeute);

  // Faktor für Kaufkraft-Toggle
  const kaufkraftFaktor = nachKaufkraft
    ? 1 / Math.pow(1 + 0.02, Math.max(0, 67 - daten.alter))
    : 1;

  function update<K extends keyof BeratungDaten>(key: K, value: BeratungDaten[K]) {
    setDaten((d) => ({ ...d, [key]: value }));
  }

  function addVertrag(art: VorsorgeArt) {
    setDaten((d) => ({
      ...d,
      bestehendeVorsorgen: [...d.bestehendeVorsorgen, createBestehendeVorsorge(art)],
    }));
  }

  function updateVertrag(id: string, patch: Partial<BestehendeVorsorge>) {
    setDaten((d) => ({
      ...d,
      bestehendeVorsorgen: d.bestehendeVorsorgen.map((v) =>
        v.id === id ? { ...v, ...patch } : v,
      ),
    }));
  }

  function removeVertrag(id: string) {
    setDaten((d) => ({
      ...d,
      bestehendeVorsorgen: d.bestehendeVorsorgen.filter((v) => v.id !== id),
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* === Linke Spalte: Inputs + Vorsorgeverteilung === */}
      <div className="space-y-6">
        {/* Eingaben */}
        <Card>
          <h3 className="font-serif text-lg text-berry">Ziel & Eckdaten</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Versorgungsziel im Alter (Netto/Monat)"
              hint="Was du im Alter brauchst — heute gerechnet. Typisch: 70 % vom aktuellen Netto."
            >
              <NumberInput
                min={500}
                max={10000}
                step={50}
                value={daten.versorgungszielNetto}
                onChange={(e) =>
                  update('versorgungszielNetto', Number(e.target.value) || 0)
                }
              />
            </Field>
            <Field
              label="Lebenserwartung"
              hint="DRV-Schnitt Frauen: 89, Männer: 84"
            >
              <NumberInput
                min={70}
                max={100}
                step={1}
                value={daten.lebenserwartung}
                onChange={(e) => update('lebenserwartung', Number(e.target.value) || 89)}
              />
            </Field>
            <Field label="Berufseintrittsalter (DRV-Beitragsstart)">
              <NumberInput
                min={16}
                max={50}
                value={daten.berufseintrittsalter}
                onChange={(e) =>
                  update('berufseintrittsalter', Number(e.target.value) || 22)
                }
              />
            </Field>
            <Field label="Rentensteigerung p.a.">
              <NumberInput
                min={0}
                max={5}
                step={0.1}
                value={Math.round(daten.rentensteigerungProJahr * 1000) / 10}
                onChange={(e) =>
                  update('rentensteigerungProJahr', (Number(e.target.value) || 1) / 100)
                }
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Range
              label={`Rendite Ansparphase`}
              min={0.01}
              max={0.1}
              step={0.005}
              value={daten.renditeAnsparphase}
              onChange={(v) => update('renditeAnsparphase', v)}
              formatValue={(v) => `${(v * 100).toFixed(1)} %`}
            />
            <Range
              label={`Rendite Entnahmephase`}
              min={0.005}
              max={0.06}
              step={0.005}
              value={daten.renditeEntnahmephase}
              onChange={(v) => update('renditeEntnahmephase', v)}
              formatValue={(v) => `${(v * 100).toFixed(1)} %`}
            />
            <div className="flex items-end">
              <Toggle
                checked={nachKaufkraft}
                onChange={setNachKaufkraft}
                label="Nach heutiger Kaufkraft"
                description="2 % Inflation rückgerechnet"
              />
            </div>
          </div>

          <div className="mt-4">
            <Toggle
              checked={mitKvdr}
              onChange={setMitKvdr}
              label="Mit KVdR im Alter (Krankenversicherung der Rentner)"
              description="Halbierter KV-Beitrag — meist möglich bei 90 % gesetzlich versichert in 2. Lebenshälfte."
            />
          </div>
        </Card>

        {/* Drei-Balken-Verteilung */}
        <Card>
          <h3 className="font-serif text-lg text-berry">Vorsorgeverteilung</h3>
          <p className="mt-1 text-sm text-muted">
            Drei Werte: was du brauchst (heute), was du brauchst (mit Inflation),
            was kommt rein (Rente und bestehende Verträge).
          </p>

          <div className="mt-6 grid grid-cols-3 items-end gap-4">
            <BalkenBox
              label="Versorgungsziel"
              value={ziel.zielNetto * kaufkraftFaktor}
              color="bg-cream-dark"
              height={50}
            />
            <BalkenBox
              label="Ziel mit Inflation"
              value={ziel.zielMitInflation * kaufkraftFaktor}
              color="bg-berry/80"
              height={Math.min(100, (ziel.zielMitInflation / ziel.zielNetto) * 50)}
              white
            />
            <BalkenStapelBox
              luecke={ziel.versorgungsluecke * kaufkraftFaktor}
              rente={ziel.erwarteteGesamtrenteNetto * kaufkraftFaktor}
              referenz={ziel.zielMitInflation * kaufkraftFaktor}
              renteBrutto={ziel.erwarteteGesamtrenteBrutto * kaufkraftFaktor}
              positionen={ziel.positionen.map((p) => ({
                ...p,
                bruttoMonat: p.bruttoMonat * kaufkraftFaktor,
                nettoMonat: p.nettoMonat * kaufkraftFaktor,
              }))}
            />
          </div>

          <div className="mt-6 rounded-lg bg-cream-dark/50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted">Gesamt-Rente Netto</p>
            <p className="mt-1 font-serif text-2xl text-green tabular-nums">
              {formatEuro(ziel.erwarteteGesamtrenteNetto * kaufkraftFaktor)}
            </p>
            <p className="mt-1 text-xs text-muted">
              davon Gesetzliche: {formatEuro(ziel.positionen[0].nettoMonat * kaufkraftFaktor)}{' '}
              · {ziel.gesetzlicheRente.entgeltpunkte} Entgeltpunkte ·{' '}
              {ziel.gesetzlicheRente.beitragsjahre} Beitragsjahre
            </p>
          </div>
        </Card>

        {/* Bestehende Vorsorge */}
        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-lg text-berry">Bestehende Vorsorge</h3>
            <span className="text-xs text-muted">monatliche Brutto-Rente, heute gerechnet</span>
          </div>

          {daten.bestehendeVorsorgen.length === 0 && (
            <p className="mt-3 text-sm text-muted">
              Noch nichts erfasst. Die gesetzliche Rente ist oben bereits eingerechnet.
            </p>
          )}

          <ul className="mt-3 space-y-2">
            {daten.bestehendeVorsorgen.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-3 rounded-lg border border-rule bg-white p-3"
              >
                <Select
                  value={v.art}
                  onChange={(e) =>
                    updateVertrag(v.id, {
                      art: e.target.value as VorsorgeArt,
                      label: vorsorgeArtLabel(e.target.value as VorsorgeArt),
                    })
                  }
                  className="w-44"
                >
                  {(
                    ['rürup', 'riester', 'bav', 'avd', 'etf', 'nettopolice', 'sonstiges'] as const
                  ).map((a) => (
                    <option key={a} value={a}>
                      {vorsorgeArtLabel(a)}
                    </option>
                  ))}
                </Select>
                <NumberInput
                  className="w-32"
                  min={0}
                  step={50}
                  value={v.monatsRente}
                  onChange={(e) =>
                    updateVertrag(v.id, { monatsRente: Number(e.target.value) || 0 })
                  }
                />
                <span className="text-xs text-muted">€/Mon Brutto</span>
                <button
                  type="button"
                  onClick={() => removeVertrag(v.id)}
                  className="ml-auto rounded-md p-2 text-muted hover:bg-cream-dark hover:text-danger"
                  aria-label="Entfernen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap gap-2">
            {(['rürup', 'bav', 'avd', 'etf', 'riester'] as const).map((a) => (
              <Button
                key={a}
                variant="ghost"
                onClick={() => addVertrag(a)}
              >
                <Plus className="h-3 w-3" />
                {vorsorgeArtLabel(a)}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* === Rechte Sidebar: Werkzeuge === */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {/* Benötigtes Kapital */}
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Benötigtes Kapital</p>
          <p className="mt-2 font-serif text-2xl text-berry tabular-nums">
            {formatEuro(benoetigt)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Damit deine Lücke von {formatEuro(ziel.versorgungsluecke)}/Mon über {entnahmejahre} J.
            Entnahmephase gedeckt ist.
          </p>
        </Card>

        {/* Notwendige Sparrate — die Aufwach-Tabelle */}
        <Card className="border-orange/30 bg-orange-soft/20">
          <p className="text-xs uppercase tracking-wide text-muted">
            Notwendige Sparrate — was kostet dich Warten
          </p>
          <ul className="mt-3 space-y-3">
            {wartenSzenarien.szenarien.map((s, idx) => (
              <li
                key={s.wartejahre}
                className={
                  idx === 0
                    ? 'border-b border-rule pb-3'
                    : ''
                }
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{s.label}</span>
                </div>
                <p
                  className={`mt-1 font-serif text-xl tabular-nums ${
                    idx === 0 ? 'text-orange-deep' : 'text-danger'
                  }`}
                >
                  {formatEuro(s.notwendigeSparrate)} / Mon
                </p>
                {idx > 0 && (
                  <p className="mt-1 text-xs text-danger">
                    <ArrowRight className="inline h-3 w-3" />{' '}
                    +{formatEuro(s.sparrateDelta - wartenSzenarien.szenarien[0].sparrateDelta)}
                    /Mon mehr · −{formatEuro(s.kapitalVerlust)} Endkapital
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* Investitionswunsch */}
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Investitionswunsch</p>
          <div className="mt-3 flex items-center gap-4">
            <WunschGauge prozent={Math.min(100, wunsch.prozent)} />
            <div>
              <p
                className={`font-serif text-3xl tabular-nums ${
                  wunsch.status === 'unterversorgt'
                    ? 'text-danger'
                    : wunsch.status === 'fast_da'
                      ? 'text-orange-deep'
                      : 'text-green'
                }`}
              >
                {wunsch.prozent} %
              </p>
              <p className="text-xs text-muted">erreicht</p>
            </div>
          </div>

          <Field label="Gewünschte monatliche Sparrate" hint="Schieb hier, was du dir vorstellst — Gauge passt sich an.">
            <NumberInput
              min={0}
              step={50}
              value={wunschSparrate}
              onChange={(e) => setWunschSparrate(Number(e.target.value) || 0)}
            />
          </Field>

          {wunsch.status === 'unterversorgt' && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-danger/5 p-2 text-xs text-danger">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Lücke wächst weiter. Notwendig wären{' '}
                {formatEuro(notwendigeSparrateHeute)}/Mon.
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function BalkenBox({
  label,
  value,
  color,
  height,
  white,
}: {
  label: string;
  value: number;
  color: string;
  height: number;
  white?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex w-full items-end justify-center rounded-t-xl ${color}`}
        style={{ height: `${height * 2.4}px` }}
      >
        <div className="pb-3 text-center">
          <p
            className={`font-serif text-lg tabular-nums leading-tight ${white ? 'text-white' : 'text-ink'}`}
          >
            {formatEuro(value)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">{label}</p>
    </div>
  );
}

function BalkenStapelBox({
  luecke,
  rente,
  referenz,
  renteBrutto,
  positionen,
}: {
  luecke: number;
  rente: number;
  referenz: number;
  renteBrutto: number;
  positionen: Array<{ label: string; bruttoMonat: number; nettoMonat: number }>;
}) {
  const total = luecke + rente;
  const totalHeight = (total / referenz) * 50 * 2.4;
  const renteHeight = (rente / total) * totalHeight;
  const lueckeHeight = totalHeight - renteHeight;
  const kvSteuerAbzug = Math.max(0, renteBrutto - rente);
  return (
    <div className="flex flex-col items-center">
      <div className="w-full">
        {luecke > 0 && (
          <div
            className="flex items-end justify-center rounded-t-xl bg-danger/80 text-white"
            style={{ height: `${lueckeHeight}px` }}
          >
            <div className="pb-2 text-center">
              <p className="font-serif text-lg tabular-nums leading-tight">
                {formatEuro(luecke)}
              </p>
              <p className="text-[10px] uppercase">Versorgungslücke</p>
            </div>
          </div>
        )}
        <div
          className={`group relative flex items-end justify-center bg-green/80 text-white ${luecke > 0 ? '' : 'rounded-t-xl'}`}
          style={{ height: `${renteHeight}px` }}
        >
          <div className="pb-2 text-center">
            <p className="font-serif text-lg tabular-nums leading-tight">
              {formatEuro(rente)}
            </p>
            <p className="text-[10px] uppercase">Rente</p>
          </div>
          {/* Hover-Tooltip mit Aufschlüsselung */}
          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
            <div className="min-w-56 rounded-lg bg-ink p-3 text-left text-xs text-white shadow-lg">
              <p className="mb-2 font-medium">Rentenaufschlüsselung</p>
              {positionen.map((p, i) => (
                <div key={i} className="flex justify-between gap-3 text-cream/80">
                  <span>{p.label}</span>
                  <span className="tabular-nums">{formatEuro(p.nettoMonat)} netto</span>
                </div>
              ))}
              <div className="mt-2 border-t border-cream/20 pt-2">
                <div className="flex justify-between">
                  <span>Brutto gesamt</span>
                  <span className="tabular-nums">{formatEuro(renteBrutto)}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span>KV + Steuer</span>
                  <span className="tabular-nums">− {formatEuro(kvSteuerAbzug)}</span>
                </div>
                <div className="flex justify-between font-medium text-green">
                  <span>Netto</span>
                  <span className="tabular-nums">{formatEuro(rente)}</span>
                </div>
              </div>
            </div>
            <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 bg-ink" />
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Lücke vs. erwartete Rente · Hover für Details</p>
    </div>
  );
}

// avoid unused-import warning for unused calc
void calcSparrateFuerZiel;
