'use client';

import { Gift, AlertCircle } from 'lucide-react';
import {
  ModuleLayout,
  ModuleSection,
  Checklist,
  SourcesBox,
} from '@/components/module/ModuleLayout';
import { Card } from '@/components/ui/Card';
import { formatEuro } from '@/lib/utils';
import { aggregate } from '@/lib/calc/aggregate';
import { AVD_2027 } from '@/config/avd';
import { FOERDERUNGEN_2026 } from '@/config/foerderungen';
import type { BeratungDaten } from '@/lib/calc/types';

interface FoerderungenModulProps {
  beratungId: string;
  daten: BeratungDaten;
}

export function FoerderungenModul({ beratungId, daten }: FoerderungenModulProps) {
  const agg = aggregate(daten);
  const f = agg.foerderungen;
  const istAngestellt = daten.status === 'angestellt' || daten.status === 'kombi';

  return (
    <ModuleLayout
      beratungId={beratungId}
      modulId="foerderungen"
      headlineKicker="Pro Jahr liegen für dich rum"
      headlineValue={formatEuro(f.gesamtProJahr)}
      headlineHint="Geld, das du nicht verdienen musst — du musst es nur einmal beantragen."
    >
      {/* === Section 1: Status quo === */}
      <ModuleSection
        number={1}
        title="Was dir konkret zusteht"
        intro="Förderungen sind keine Almosen — der Staat gibt sie, weil er will, dass du Vorsorge betreibst. Was du nicht abrufst, geht an Steuermittel zurück, nicht an dich."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FoerderCard
            label="AVD-Zulagen (ab 2027)"
            value={f.avd.summe}
            detail={
              <>
                Grundzulage {formatEuro(f.avd.grundzulage)}
                {f.avd.kinderzulage > 0 && <> · Kinderzulage {formatEuro(f.avd.kinderzulage)}</>}
                {f.avd.berufseinsteigerBonus > 0 && (
                  <> · Einsteiger-Bonus {formatEuro(f.avd.berufseinsteigerBonus)}</>
                )}
              </>
            }
            hint={`Für ${formatEuro(f.avd.empfohlenerEigenbeitrag)} Eigenbeitrag/Jahr`}
          />
          <FoerderCard
            label="BAV (nur angestellt)"
            value={f.bav.summe}
            detail={
              istAngestellt
                ? `SV-Ersparnis ${formatEuro(f.bav.sozialversicherungsErsparnis)} · Klinikzuschuss ${formatEuro(f.bav.klinikzuschuss)}`
                : 'Bei dir nicht anwendbar (freiberuflich).'
            }
            hint="§3 Nr. 63 EStG — bis 4 % BBG steuer-/SV-frei"
            inactive={!istAngestellt}
          />
          <FoerderCard
            label="VL (vermögenswirksame Leistungen)"
            value={f.vl.arbeitgeberzuschuss}
            detail={
              istAngestellt
                ? `Bis ${FOERDERUNGEN_2026.vl.maxArbeitgeberzuschussProMonat} €/Mon Arbeitgeber-Zuschuss`
                : 'Nur für Angestellte (über Tarifvertrag).'
            }
            hint="Tarifvertrag oder Klinik-Personalabteilung"
            inactive={!istAngestellt}
          />
          <FoerderCard
            label="GKV-Sicherstellungszuschlag"
            value={f.gkvSicherstellungszuschlag}
            detail={
              daten.geburtshilfe
                ? `Schätzung: 10 Geburten/Jahr × ${FOERDERUNGEN_2026.gkvSicherstellungszuschlag.proGeburtsfall} €`
                : 'Nur bei freiberuflicher Geburtshilfe.'
            }
            hint="GKV-Spitzenverband, formloser Antrag"
            inactive={!daten.geburtshilfe}
          />
        </div>
      </ModuleSection>

      {/* === Section 2: Was möglich ist === */}
      <ModuleSection
        number={2}
        title="Über deine Berufsjahre macht das…"
        intro={`Mit ${agg.altersvorsorge.jahreBisAusstieg} Jahren bis zum Ausstieg summiert sich das Förderpaket — wenn du es regelmäßig abrufst.`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat
            label="Pro Jahr"
            value={formatEuro(f.gesamtProJahr)}
            hint="Wenn du alles ausschöpfst"
            accent
          />
          <Stat
            label={`Über ${agg.altersvorsorge.jahreBisAusstieg} Jahre kumuliert`}
            value={formatEuro(f.gesamtProJahr * agg.altersvorsorge.jahreBisAusstieg)}
            hint="Ohne Zinseszins — reine Förderhöhe"
          />
        </div>

        <Card className="mt-5 bg-cream-dark">
          <p className="font-medium text-ink">AVD: Wie der Hebel wirklich funktioniert</p>
          <p className="mt-1 text-sm text-ink/80">
            Für 1.800 € Eigenbeitrag im Jahr (=150 €/Mon) bekommst du 540 € Grundzulage.
            Das sind <strong>30 % Förderquote</strong> — keine andere private
            Vorsorge bietet diesen Hebel. Pro Kind nochmal 300 € Kinderzulage gegen
            300 € Mehreinzahlung — 100 % Förderquote auf den Kinderanteil. Wer Kinder
            hat und das nicht nutzt, verschenkt buchstäblich Geld.
          </p>
        </Card>
      </ModuleSection>

      {/* === Section 3: Nichts zum Spielen === */}
      <ModuleSection
        number={3}
        title="Hier gibt's nichts zu rechnen — nur zu beantragen"
        intro="Förderungen sind feste Beträge, keine Stellschrauben. Wo du Hebel hast, ist beim Antrag — der entweder gestellt ist oder nicht."
      >
        <Card className="border-orange/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-deep" />
            <div className="text-sm text-ink/80">
              <p className="font-medium text-ink">Tipp aus der Praxis</p>
              <p className="mt-1">
                Anträge sind oft 1–2 Seiten lang und brauchen 15–30 Minuten. Der häufigste
                Grund, warum sie nicht gestellt werden, ist nicht Bürokratie — sondern weil
                niemand weiß, dass es sie gibt. Wir sind dabei jetzt durch.
              </p>
            </div>
          </div>
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
              title: 'AVD-Antrag vorbereiten (Start 1.1.2027)',
              detail: (
                <>
                  Konto/Depot bei einem AVD-Anbieter wählen (kommen ab Ende 2026 raus —
                  voraussichtlich u.a. ING, DKB, Volksbanken). Zulagenantrag wird vom
                  Anbieter automatisiert. <strong>Vor 31.12.2026 die letzte Möglichkeit
                  Riester abzuschließen</strong>, falls sinnvoll — Bestandsschutz bleibt.
                </>
              ),
              effort: '30 Min Anbietervergleich · Antrag kommt automatisch',
            },
            ...(istAngestellt
              ? [
                  {
                    title: 'BAV-Klinikzuschuss prüfen — gesetzliche Pflicht seit 2022',
                    detail: (
                      <>
                        Wenn du BAV machst (Entgeltumwandlung), <strong>muss</strong> dein
                        Arbeitgeber 15 % zuschießen. Viele Kliniken machen das nicht
                        automatisch — explizit ansprechen, schriftlich, mit Verweis auf §1a
                        Abs. 1a BetrAVG. Bei Bestandsverträgen gilt das auch seit 2022.
                      </>
                    ),
                    effort: '1 E-Mail an Personalabteilung',
                  },
                ]
              : []),
            ...(daten.geburtshilfe
              ? [
                  {
                    title: 'GKV-Sicherstellungszuschlag beantragen',
                    detail: (
                      <>
                        Für freiberufliche Hebammen, die Geburtshilfe leisten. Pro betreuter
                        Schwangerschaft Pauschale (aktuell ca. 70 € je Fall). Antrag formlos
                        beim GKV-Spitzenverband (Formulare über DHV).
                      </>
                    ),
                    effort: '1 Stunde · jährlich wiederholen',
                  },
                ]
              : []),
            ...(daten.kinder > 0 && daten.alter <= 25
              ? [
                  {
                    title: '200 € Berufseinsteiger-Bonus mitnehmen (einmalig)',
                    detail:
                      'Wenn du bei AVD-Start (ab 1.1.2027) noch unter 25 bist, gibt es einmalig 200 € Bonus. Funktioniert automatisch über den AVD-Antrag.',
                    effort: '—',
                  },
                ]
              : []),
            {
              title: 'Frühstart-Rente für deine Kinder (ab 2026)',
              detail:
                'Pro Kind unter 18 zahlt der Staat ab 2026 monatlich 10 € in ein staatlich gefördertes Depot. Eltern können privat aufstocken (steuerbegünstigt bis 18). Antrag über die Familienkasse.',
              effort: '15 Min, einmalig pro Kind',
            },
          ]}
        />
      </ModuleSection>

      {/* === Section 5: Quellen === */}
      <ModuleSection number={5} title="Worauf das beruht">
        <SourcesBox
          items={[
            {
              label: 'AVD',
              detail: 'Altersvorsorgedepot, Bundestag-Beschluss 27.3.2026, Bundesrat 8.5.2026, Start 1.1.2027',
              stand: AVD_2027.letztePruefung,
            },
            {
              label: 'BAV',
              detail: '§3 Nr. 63 EStG + §1a Abs. 1a BetrAVG (15 % Klinik-Pflicht)',
              stand: '2026',
            },
            {
              label: 'GKV-Sicherstellungszuschlag',
              detail: 'GKV-Spitzenverband, Hebammenhilfevertrag § 22 ff., DHV',
              stand: '1.4.2026',
            },
            {
              label: 'Frühstart-Rente',
              detail: 'Bundesregierung, Frühstart-Rente, Start ab Geburten ab 2026',
            },
          ]}
        />
      </ModuleSection>
    </ModuleLayout>
  );
}

function FoerderCard({
  label,
  value,
  detail,
  hint,
  inactive,
}: {
  label: string;
  value: number;
  detail: React.ReactNode;
  hint?: string;
  inactive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        inactive ? 'border-rule bg-cream-dark/40' : 'border-orange/30 bg-white'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ink">{label}</p>
        {inactive && (
          <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] uppercase text-muted">
            n/a
          </span>
        )}
      </div>
      <p
        className={`mt-2 font-serif text-3xl tabular-nums ${
          inactive ? 'text-muted/60' : 'text-berry'
        }`}
      >
        {formatEuro(value)}
      </p>
      <p className="mt-2 text-sm text-ink/70">{detail}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-rule bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl tabular-nums ${
          accent ? 'text-orange-deep' : 'text-berry'
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

// Avoid unused-import warning during refactor
void Gift;
