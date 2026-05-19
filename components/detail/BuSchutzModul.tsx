'use client';

import { useState } from 'react';
import { Heart, AlertCircle, TrendingDown } from 'lucide-react';
import {
  ModuleLayout,
  ModuleSection,
  Checklist,
  SourcesBox,
} from '@/components/module/ModuleLayout';
import { Card } from '@/components/ui/Card';
import { Field, NumberInput, Range } from '@/components/ui/Field';
import { WunschGauge } from '@/components/shared/WunschGauge';
import { formatEuro } from '@/lib/utils';
import { calcBuLuecke, schaetzeBuPraemie } from '@/lib/calc/bu';
import { calcEinkommensPhasen } from '@/lib/calc/einkommensphasen';
import { BU_ANNAHMEN } from '@/config/bu';
import type { BeratungDaten } from '@/lib/calc/types';

interface BuSchutzModulProps {
  beratungId: string;
  daten: BeratungDaten;
}

export function BuSchutzModul({ beratungId, daten }: BuSchutzModulProps) {
  const luecke = calcBuLuecke({
    monatsbrutto: daten.monatsbrutto,
    bestehendeBU: daten.bestehendeBU,
  });

  // Restleistungsvermögen lokal anpassbar — Daten bleiben unverändert
  const [restleistung, setRestleistung] = useState(daten.restleistungsvermoegen);
  const phasen = calcEinkommensPhasen({ ...daten, restleistungsvermoegen: restleistung });

  const [wunschRente, setWunschRente] = useState(
    Math.max(1500, Math.round(luecke.empfohleneMonatsRente / 250) * 250),
  );

  // Absicherungswunsch — wieviel zusätzliche BU-Rente will sie haben?
  const [absicherungswunsch, setAbsicherungswunsch] = useState(
    Math.max(0, luecke.empfohleneMonatsRente - luecke.bestehend),
  );
  const gesamtBuAbsicherung = luecke.bestehend + absicherungswunsch;
  const absicherungsProzent =
    luecke.empfohleneMonatsRente > 0
      ? Math.round((gesamtBuAbsicherung / luecke.empfohleneMonatsRente) * 100)
      : 100;

  const schaetzungAktuell = schaetzeBuPraemie({ alter: daten.alter, rente: wunschRente });

  return (
    <ModuleLayout
      beratungId={beratungId}
      modulId="bu-schutz"
      headlineKicker="Verlust bei Berufsunfähigkeit bis Renteneintritt"
      headlineValue={formatEuro(phasen.verlustBisRente)}
      headlineHint={`Bei ${restleistung} h Restleistungsvermögen pro Tag. Hochgerechnet über ${Math.round(phasen.monateBisRente / 12)} Jahre — Netto-Differenz zur Erwerbsminderungsrente.`}
    >
      {/* === Section 1: Status quo === */}
      <ModuleSection
        number={1}
        title="Was passiert, wenn du morgen ausfällst — drei Phasen"
        intro={
          <>
            Wer Hebamme nicht mehr ausüben kann, durchläuft drei Phasen. Jede hat
            eigene Leistungen und Lücken — sichtbar gemacht.
          </>
        }
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {phasen.phasen.map((p) => (
            <PhasenCard key={p.id} phase={p} nettoReferenz={phasen.nettoReferenz} />
          ))}
        </div>

        <Card className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted">Dein Referenz-Netto</p>
            <p className="font-serif text-xl text-berry tabular-nums">
              {formatEuro(phasen.nettoReferenz)} / Mon
            </p>
          </div>
          <p className="mt-2 text-xs text-muted">
            Berechnet aus {formatEuro(daten.monatsbrutto)} Brutto, Steuerklasse{' '}
            {daten.steuerklasse}, {daten.kvArt === 'pkv' ? 'PKV' : 'GKV'}
            {daten.kirchensteuer ? ', kirchensteuerpflichtig' : ''}.
          </p>
        </Card>
      </ModuleSection>

      {/* === Section 2: Restleistungsvermögen === */}
      <ModuleSection
        number={2}
        title="Wie viel kannst du noch — Restleistungsvermögen"
        intro={
          <>
            Die gesetzliche Erwerbsminderungsrente unterscheidet nach Stunden, die du
            täglich noch <em>irgendeiner</em> Erwerbstätigkeit nachgehen kannst —
            nicht deinem Beruf. Das ist ein wichtiger Unterschied zur privaten BU.
          </>
        }
      >
        <Card>
          <Range
            label="Restleistungsvermögen (Stunden / Tag)"
            min={1}
            max={6}
            step={1}
            value={restleistung}
            onChange={setRestleistung}
            formatValue={(v) => `${v} h/Tag`}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <EmStufeBox
              label="< 3 h/Tag"
              prozent="34 %"
              status="Volle EM"
              active={phasen.emGrad === 'voll'}
            />
            <EmStufeBox
              label="3–6 h/Tag"
              prozent="17 %"
              status="Halbe EM"
              active={phasen.emGrad === 'halb'}
            />
            <EmStufeBox
              label="≥ 6 h/Tag"
              prozent="0 %"
              status="Kein Anspruch"
              active={phasen.emGrad === 'keine'}
            />
          </div>

          <p className="mt-4 text-xs text-muted">
            Schieb den Regler — die Headline und Phase 3 oben aktualisieren sich. Der Unterschied
            zwischen privater BU und gesetzlicher EM-Rente: BU greift ab 50 % Berufsunfähigkeit
            <strong> in deinem Beruf</strong>. EM-Rente greift erst, wenn du{' '}
            <strong>irgendwas</strong> nicht mehr 6 h täglich kannst — viel strenger.
          </p>
        </Card>

        <Card className="mt-5 border-danger/30 bg-danger/5">
          <div className="flex items-start gap-3">
            <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div className="text-sm">
              <p className="font-medium text-ink">
                Verlust gesamte Berufsunfähigkeit
              </p>
              <p className="mt-1 font-serif text-3xl text-danger tabular-nums">
                {formatEuro(phasen.verlustBisRente)}
              </p>
              <p className="mt-1 text-ink/80">
                Netto-Differenz pro Monat × Monate bis Renteneintritt — das ist die
                Summe, die dir bei der gewählten EM-Stufe fehlt. Eine private BU schließt
                genau diese Lücke.
              </p>
            </div>
          </div>
        </Card>
      </ModuleSection>

      {/* === Section 3: Spiel === */}
      <ModuleSection
        number={3}
        title="Was BU-Schutz für dich kosten würde"
        intro={
          <>
            Grobe Marktdurchschnitte für Hebammen in Risikoklasse{' '}
            {BU_ANNAHMEN.rechtsklasseHebamme}. Konkrete Prämien hängen stark vom
            Gesundheitszustand ab — die echte Zahl gibt es nur über eine Risikovoranfrage.
          </>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <Card>
            <Range
              label="Gewünschte BU-Rente pro Monat"
              min={1000}
              max={3500}
              step={100}
              value={wunschRente}
              onChange={setWunschRente}
              formatValue={(v) => formatEuro(v) + '/Mon'}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <PraemieBox
                label="Untere Schätzung"
                value={schaetzungAktuell.unten}
                hint="bestmögliche Gesundheit"
              />
              <PraemieBox
                label="Realistisch"
                value={schaetzungAktuell.mitte}
                hint="durchschnittlich gesund"
                accent
              />
              <PraemieBox
                label="Mit Zuschlag"
                value={schaetzungAktuell.oben}
                hint="z.B. Vor-OPs, Therapien"
              />
            </div>

            <p className="mt-4 text-xs text-muted">
              Werte für Alter {schaetzungAktuell.fuerAlter} (gerundete Stützstelle). Hebammen
              werden je nach Versicherer unterschiedlich eingestuft — bis Faktor 1,5 zwischen
              Anbietern realistisch.
            </p>
          </Card>

          {/* Absicherungswunsch-Gauge */}
          <Card>
            <p className="text-xs uppercase tracking-wide text-muted">Absicherungswunsch</p>
            <div className="mt-3 flex items-center gap-4">
              <WunschGauge prozent={Math.min(100, absicherungsProzent)} />
              <div>
                <p
                  className={`font-serif text-2xl tabular-nums ${
                    absicherungsProzent >= 80
                      ? 'text-green'
                      : absicherungsProzent >= 40
                        ? 'text-orange-deep'
                        : 'text-danger'
                  }`}
                >
                  {absicherungsProzent} %
                </p>
                <p className="text-xs text-muted">der Empfehlung</p>
              </div>
            </div>

            <Field
              label="Gewünschte BU-Rente zusätzlich (€/Mon)"
              hint={`Bestehend: ${formatEuro(luecke.bestehend)}/Mon · empfohlen: ${formatEuro(luecke.empfohleneMonatsRente)}/Mon`}
            >
              <NumberInput
                min={0}
                step={100}
                value={absicherungswunsch}
                onChange={(e) =>
                  setAbsicherungswunsch(Math.max(0, Number(e.target.value) || 0))
                }
              />
            </Field>

            <div className="mt-3 rounded-md bg-cream-dark/50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Bestand</span>
                <span className="tabular-nums">{formatEuro(luecke.bestehend)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Neu absichern</span>
                <span className="tabular-nums">{formatEuro(absicherungswunsch)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-rule pt-1">
                <span className="font-medium text-ink">Gesamt</span>
                <span className="font-medium tabular-nums text-berry">
                  {formatEuro(gesamtBuAbsicherung)}
                </span>
              </div>
            </div>

            {absicherungsProzent < 80 && (
              <p className="mt-3 text-xs text-danger">
                Lücke bleibt:{' '}
                {formatEuro(
                  Math.max(0, luecke.empfohleneMonatsRente - gesamtBuAbsicherung),
                )}{' '}
                /Mon
              </p>
            )}
          </Card>
        </div>

        <Card className="mt-5 bg-cream-dark">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
            <div className="text-sm text-ink/80">
              <p className="font-medium text-ink">Ergänze Krankentagegeld — gerade als Freiberuflerin</p>
              <p className="mt-1">
                BU greift erst bei dauerhafter 50%iger Berufsunfähigkeit (i.d.R. ab Monat
                6). Krankentagegeld überbrückt die ersten Monate. Für freiberufliche
                Hebammen besonders relevant, weil die Kasse — wenn überhaupt — erst nach
                6 Wochen Krankengeld zahlt. Tarife u.a. HanseMerkur, R+V (kurze Karenz ab
                Tag 22 oder 43).
              </p>
            </div>
          </div>
        </Card>
      </ModuleSection>

      {/* === Section 4: Nächste Schritte === */}
      <ModuleSection number={4} title="Was du als nächstes tun kannst">
        <Checklist
          items={[
            {
              title: 'Risikovoranfrage stellen — ohne Endbindung',
              detail: (
                <>
                  Ein unabhängiger Makler stellt mit deinen Gesundheitsdaten anonyme
                  Anfragen bei mehreren Versicherern. Du siehst <em>konkret</em>, wer dich
                  zu welcher Prämie versichert, ohne dass eine Ablehnung in deine Akte
                  geht. Wichtig: <strong>nicht</strong> selbst direkt beantragen.
                </>
              ),
              effort: '30 Min Vorgespräch · 2–3 Wo. Bearbeitung',
            },
            {
              title: 'Gesundheitsfragen ehrlich vorbereiten',
              detail:
                'Letzte 5–10 Jahre Diagnosen, Therapien, Reha, Krankschreibungen. Bei Verschweigen riskierst du die ganze Leistung im Ernstfall. Krankenkassen-Auszug anfordern (kostenlos) hilft.',
              effort: '1 Std Vorbereitung',
            },
            {
              title: 'Versicherer-Auswahl: Hebammen-Erfahrung prüfen',
              detail:
                'Frag den Makler explizit nach Hebammen-Erfahrung der jeweiligen Versicherer. Manche Anbieter sind hier deutlich strenger als andere — Faktor 1,5 in der Prämie keine Ausnahme.',
              effort: '15 Min',
            },
            {
              title: 'Wartezeit nicht unterschätzen — je früher, je günstiger',
              detail: (
                <>
                  Jedes Jahr, das du wartest, kostet dich später spürbar mehr. Wer mit 35
                  statt 40 abschließt, spart über Restlaufzeit <strong>5-stellig</strong>.
                  Gesundheitliche Vorbelastungen können den Abschluss zudem unmöglich machen.
                </>
              ),
              effort: '—',
            },
            {
              title: 'Krankentagegeld dazu — gerade als Freiberuflerin',
              detail:
                'BU zahlt erst ab dauerhafter Berufsunfähigkeit. Krankentagegeld deckt die ersten Monate. Speziell für Hebammen: HanseMerkur und R+V mit kurzer Karenz (ab Tag 22 oder Tag 43).',
              effort: 'mit der BU-Voranfrage kombinieren',
            },
          ]}
        />
      </ModuleSection>

      {/* === Section 5: Quellen === */}
      <ModuleSection number={5} title="Worauf das beruht">
        <SourcesBox
          items={[
            {
              label: 'Lohnfortzahlung',
              detail: '§3 EFZG, 6 Wochen 100 % Brutto durch Arbeitgeber',
              stand: '2026',
            },
            {
              label: 'Krankengeld',
              detail:
                '§47 SGB V, max. 70 % Brutto / 90 % Netto, max. 72 Wo. innerhalb 3 Jahren',
              stand: '2026',
            },
            {
              label: 'Erwerbsminderungsrente',
              detail: '§43 SGB VI, Restleistungsvermögen-Stufen <3h / 3–6h / ≥6h',
              stand: '2026',
            },
            {
              label: 'BU-Faustformel 34 % / 17 %',
              detail:
                'Vereinfachte Annahme: 34 % Brutto bei voller EM, 17 % bei halber. Echte DRV-Rechnung läuft über Punkte × Rentenwert × Faktoren — die echte Zahl kommt aus deinem Rentenbescheid.',
            },
            {
              label: 'BU-Häufigkeit Hebammen',
              detail: 'GDV-Statistik Berufsklassen 3–4 · opta data 2025',
              stand: BU_ANNAHMEN.letztePruefung,
            },
          ]}
        />
      </ModuleSection>
    </ModuleLayout>
  );
}

function PhasenCard({
  phase,
  nettoReferenz,
}: {
  phase: ReturnType<typeof calcEinkommensPhasen>['phasen'][number];
  nettoReferenz: number;
}) {
  const tone =
    phase.id === 'lohnfortzahlung'
      ? phase.versorgungsluecke === 0
        ? 'good'
        : 'risk'
      : phase.id === 'krankengeld'
        ? 'medium'
        : 'risk';

  const toneStyles = {
    good: {
      header: 'bg-success/20 text-success',
      body: 'border-success/40 bg-success/5',
      value: 'text-success',
    },
    medium: {
      header: 'bg-warning/30 text-orange-deep',
      body: 'border-warning/40 bg-warning/10',
      value: 'text-orange-deep',
    },
    risk: {
      header: 'bg-danger/15 text-danger',
      body: 'border-danger/40 bg-danger/5',
      value: 'text-danger',
    },
  } as const;
  const s = toneStyles[tone];

  return (
    <div className={`rounded-2xl border ${s.body} overflow-hidden`}>
      <div className={`px-4 py-2 text-xs font-medium uppercase tracking-wide ${s.header}`}>
        {phase.label}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">Auszahlung netto</p>
        <p className={`font-serif text-2xl tabular-nums ${s.value}`}>
          {formatEuro(phase.nettoProMonat)}
        </p>
        {phase.versorgungsluecke > 0 && (
          <>
            <p className="mt-3 text-xs text-muted">Versorgungslücke</p>
            <p className="font-serif text-lg text-danger tabular-nums">
              − {formatEuro(phase.versorgungsluecke)}
            </p>
          </>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink/70">{phase.erklaerung}</p>
        {/* Mini-Bar: Anteil vom Referenz-Netto */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
          <div
            className={`h-full ${
              tone === 'good'
                ? 'bg-success'
                : tone === 'medium'
                  ? 'bg-warning'
                  : 'bg-danger'
            }`}
            style={{
              width: `${Math.max(0, Math.min(100, (phase.nettoProMonat / nettoReferenz) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EmStufeBox({
  label,
  prozent,
  status,
  active,
}: {
  label: string;
  prozent: string;
  status: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        active ? 'border-berry bg-berry/5' : 'border-rule bg-white'
      }`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 font-serif text-xl ${
          active ? 'text-orange-deep' : 'text-berry'
        }`}
      >
        {prozent}
      </p>
      <p className="mt-1 text-xs text-muted">{status}</p>
    </div>
  );
}

function PraemieBox({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        accent ? 'border-berry bg-berry/5' : 'border-rule bg-white'
      }`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 font-serif text-xl tabular-nums ${
          accent ? 'text-orange-deep' : 'text-berry'
        }`}
      >
        {formatEuro(value)}
      </p>
      <p className="mt-1 text-[11px] text-muted">{hint}</p>
    </div>
  );
}

// avoid unused-import warning
void AlertCircle;
