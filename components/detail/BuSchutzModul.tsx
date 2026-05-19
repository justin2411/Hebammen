'use client';

import { useState } from 'react';
import { Shield, Heart, AlertCircle } from 'lucide-react';
import {
  ModuleLayout,
  ModuleSection,
  Checklist,
  SourcesBox,
} from '@/components/module/ModuleLayout';
import { Card } from '@/components/ui/Card';
import { Range } from '@/components/ui/Field';
import { formatEuro } from '@/lib/utils';
import { calcBuLuecke, schaetzeBuPraemie } from '@/lib/calc/bu';
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

  const [wunschRente, setWunschRente] = useState(
    Math.max(1500, Math.round(luecke.empfohleneMonatsRente / 250) * 250),
  );

  const schaetzungAktuell = schaetzeBuPraemie({
    alter: daten.alter,
    rente: wunschRente,
  });

  // 3 Referenz-Rentenhöhen für die „Was möglich ist"-Sektion
  const referenzRenten = [1500, 2000, 2500];

  const headline =
    luecke.status === 'fehlt'
      ? { kicker: 'Du bist gerade', value: 'ohne Netz', hint: 'Aktuell kein BU-Schutz.' }
      : luecke.status === 'unterversorgt'
        ? {
            kicker: 'Pro Monat fehlen dir',
            value: formatEuro(luecke.luecke),
            hint: `Empfohlene Rente: ${formatEuro(luecke.empfohleneMonatsRente)}, du hast ${formatEuro(luecke.bestehend)}.`,
          }
        : luecke.status === 'ok'
          ? {
              kicker: 'Fast vollständig — offen',
              value: `${formatEuro(Math.max(0, luecke.luecke))}/Mon`,
              hint: 'Kleine Lücke, aber kein akutes Loch.',
            }
          : {
              kicker: 'BU-Schutz',
              value: 'solide',
              hint: 'Deine Versorgung deckt 80 % vom Netto oder mehr.',
            };

  return (
    <ModuleLayout
      beratungId={beratungId}
      modulId="bu-schutz"
      headlineKicker={headline.kicker}
      headlineValue={headline.value}
      headlineHint={headline.hint}
    >
      {/* === Section 1: Status quo === */}
      <ModuleSection
        number={1}
        title="Was du heute hast — und was du brauchst"
        intro={
          <>
            Berufsunfähigkeit trifft Hebammen statistisch zwischen 44 und 56 Jahren,
            häufigste Ursachen sind Nervenerkrankungen, Bandscheibe und psychische
            Erschöpfung. 43,6 % denken laut opta-data-Studie 2025 über einen Berufswechsel
            nach — die Risiken sind real.
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StatusCard
            label="Heute abgedeckt"
            value={formatEuro(luecke.bestehend) + ' / Mon'}
            sublabel={
              daten.bestehendeBU.hat
                ? `Endalter: ${daten.bestehendeBU.endalter}`
                : 'Kein laufender Vertrag'
            }
            tone={daten.bestehendeBU.hat ? 'neutral' : 'risk'}
          />
          <StatusCard
            label="Empfehlung (80 % vom Netto)"
            value={formatEuro(luecke.empfohleneMonatsRente) + ' / Mon'}
            sublabel="Decke Lebenshaltung ohne Sozialfall-Risiko"
            tone="positive"
          />
        </div>

        {luecke.luecke > 0 && (
          <Card className="mt-4 border-danger/40 bg-danger/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              <div>
                <p className="font-medium text-ink">
                  Lücke: {formatEuro(luecke.luecke)} / Monat
                </p>
                <p className="mt-1 text-sm text-ink/80">
                  Wenn dir morgen die Hände nicht mehr mitspielen oder der Rücken
                  endgültig sagt „so nicht weiter", fällt dieser Betrag im Monat weg.
                  Über 20 Jahre Berufsunfähigkeit sind das{' '}
                  <strong>{formatEuro(luecke.luecke * 12 * 20)}</strong>, die dir keiner
                  ersetzt — die Erwerbsminderungsrente der DRV liegt typischerweise bei
                  unter 1.000 € und ist nur in Vollberufsunfähigkeit zahlbar.
                </p>
              </div>
            </div>
          </Card>
        )}
      </ModuleSection>

      {/* === Section 2: Was möglich ist === */}
      <ModuleSection
        number={2}
        title="Was BU-Schutz für dich kosten würde"
        intro={
          <>
            Grobe Marktdurchschnitte für Hebammen in Risikoklasse {BU_ANNAHMEN.rechtsklasseHebamme}.
            Konkrete Prämien hängen stark vom Gesundheitszustand ab — die echte Zahl gibt
            es nur über eine Risikovoranfrage (anonym, ohne Antragspflicht).
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {referenzRenten.map((rente) => {
            const sch = schaetzeBuPraemie({ alter: daten.alter, rente });
            return (
              <Card key={rente} className="text-center">
                <p className="text-xs uppercase tracking-wide text-muted">
                  {formatEuro(rente)}/Mon Rente
                </p>
                <p className="mt-2 font-serif text-3xl text-berry tabular-nums">
                  {formatEuro(sch.mitte)}
                </p>
                <p className="mt-1 text-xs text-muted">/ Monat Prämie</p>
                <p className="mt-3 text-[11px] text-muted">
                  Spanne: {formatEuro(sch.unten)}–{formatEuro(sch.oben)}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="mt-5 bg-cream-dark">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
            <div className="text-sm text-ink/80">
              <p className="font-medium text-ink">Ergänze, wenn möglich, Krankentagegeld</p>
              <p className="mt-1">
                BU greift erst bei 50 % dauerhafter Berufsunfähigkeit (i.d.R. ab Monat 6).
                Krankentagegeld überbrückt die ersten Monate und schützt vor
                Liquiditätslücken. Für freiberufliche Hebammen besonders relevant, weil
                die Krankenkasse erst nach 6 Wochen Krankengeld zahlt — und das auch nur
                bei freiwilligem KK-Status mit höherem Beitrag.
              </p>
            </div>
          </div>
        </Card>
      </ModuleSection>

      {/* === Section 3: Spiel mit deinen Zahlen === */}
      <ModuleSection
        number={3}
        title="Wie viel BU-Rente macht für dich Sinn?"
        intro="Schieb den Regler — Prämie passt sich an. Die Schätzung gilt für dein Alter und gesunde Annahmen."
      >
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
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm text-muted">Gewählt:</span>
            <span className="font-serif text-2xl text-berry tabular-nums">
              {formatEuro(wunschRente)}/Mon
            </span>
          </div>

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
            Hinweis: Werte für Alter {schaetzungAktuell.fuerAlter} (gerundete Stützstelle).
            Linearer Faktor je 500 € Mehrrente. Hebammen werden je nach Versicherer
            unterschiedlich eingestuft — bis Faktor 1,5 zwischen den Anbietern realistisch.
          </p>
        </Card>
      </ModuleSection>

      {/* === Section 4: Nächste Schritte === */}
      <ModuleSection
        number={4}
        title="Was du als nächstes tun kannst"
      >
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
                  Jedes Jahr, das du wartest, kostet dich später spürbar mehr (siehe Tabelle
                  oben). Wer mit 35 statt 40 abschließt, spart über Restlaufzeit{' '}
                  <strong>5-stellig</strong>. Gesundheitliche Vorbelastungen können den
                  Abschluss zudem unmöglich machen.
                </>
              ),
              effort: '—',
            },
            {
              title: 'Krankentagegeld dazu — gerade als Freiberuflerin',
              detail:
                'BU zahlt erst ab dauerhafter Berufsunfähigkeit. Krankentagegeld deckt die ersten Monate. Speziell für Hebammen: HanseMerkur und R+V bieten Tarife mit kurzer Karenz (ab Tag 22 oder Tag 43).',
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
              label: 'BU-Häufigkeit',
              detail: 'GDV-Statistik: BU-Risiko Berufsklassen, Hebammen Klasse 3–4',
              stand: BU_ANNAHMEN.letztePruefung,
            },
            {
              label: 'Berufswechsel-Quote',
              detail: 'opta data Hebammenstudie 2025 — 43,6 % erwägen Wechsel',
              stand: '2025',
            },
            {
              label: 'Prämien-Tabelle',
              detail:
                'Marktdurchschnitte aus öffentlichen Vergleichsrechnern, Endalter 67, gesund. ±40 % Streuung.',
              stand: BU_ANNAHMEN.letztePruefung,
            },
            {
              label: 'Empfehlung 80 % vom Netto',
              detail: 'Standard-Beratungsempfehlung BdV / Stiftung Warentest',
            },
          ]}
        />
      </ModuleSection>
    </ModuleLayout>
  );
}

function StatusCard({
  label,
  value,
  sublabel,
  tone,
}: {
  label: string;
  value: string;
  sublabel: string;
  tone: 'positive' | 'neutral' | 'risk';
}) {
  const toneClasses = {
    positive: 'border-green/40 bg-green/5',
    neutral: 'border-rule bg-white',
    risk: 'border-danger/40 bg-danger/5',
  };
  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-serif text-2xl text-berry tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-ink/70">{sublabel}</p>
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

// Damit das Icon-Import nicht stillschweigend stirbt, falls Lint strict ist.
void Shield;
