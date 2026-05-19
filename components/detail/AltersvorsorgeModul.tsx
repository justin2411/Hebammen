'use client';

import { Landmark, Info } from 'lucide-react';
import {
  ModuleLayout,
  ModuleSection,
  Checklist,
  SourcesBox,
} from '@/components/module/ModuleLayout';
import { Card } from '@/components/ui/Card';
import { Szenarien } from '@/components/results/Szenarien';
import { formatEuro } from '@/lib/utils';
import { aggregate } from '@/lib/calc/aggregate';
import { RUERUP_2026 } from '@/config/ruerup';
import { AVD_2027 } from '@/config/avd';
import type { BeratungDaten } from '@/lib/calc/types';

interface AltersvorsorgeModulProps {
  beratungId: string;
  daten: BeratungDaten;
}

export function AltersvorsorgeModul({ beratungId, daten }: AltersvorsorgeModulProps) {
  const agg = aggregate(daten);
  const ruerup = agg.ruerup;
  const av = agg.altersvorsorge;

  return (
    <ModuleLayout
      beratungId={beratungId}
      modulId="altersvorsorge"
      headlineKicker="Optimiertes Endkapital"
      headlineValue={formatEuro(av.optimiert.endkapital)}
      headlineHint={`Nominal in ${av.jahreBisAusstieg} Jahren. In heutiger Kaufkraft: ${formatEuro(av.optimiert.endkapitalReal)}. Schicht 1+2 — gefördert, dafür gesperrt bis 62/65.`}
    >
      {/* === Section 1: Status quo === */}
      <ModuleSection
        number={1}
        title="Das 3-Schichten-Modell — kurz, ohne Theater"
        intro={
          <>
            Deutschland kennt drei Schichten der Altersvorsorge. Für Hebammen ist die
            Unterscheidung wichtig, weil <em>Schicht 1 und 2 dich nicht VOR der Rente
            erreichen kannst</em> — Schicht 3 (Vermögensaufbau) ist die einzige, die
            flexibel bleibt. Hier geht's um Schicht 1+2.
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <SchichtCard
            schicht="1"
            label="Basisversorgung"
            desc="DRV, Rürup. Maximal gefördert, dafür gesperrt bis Rentenalter. Pflicht für Hebammen über Standesversicherung."
          />
          <SchichtCard
            schicht="2"
            label="Geförderte Zusatz"
            desc="BAV (angestellt), AVD ab 2027, alter Riester (Bestand). Förderquoten hoch, aber zweckgebunden für Rente."
            active
          />
          <SchichtCard
            schicht="3"
            label="Privatvermögen"
            desc="ETF, Sparkonto, Nettopolice. Jederzeit verfügbar — der wichtige Notausgang bei Frühausstieg. Siehe Vermögensaufbau-Modul."
          />
        </div>
      </ModuleSection>

      {/* === Section 2: Was möglich ist === */}
      <ModuleSection
        number={2}
        title="Rürup — wie viel passt für dich rein"
        intro={
          <>
            Rürup (Basisrente) kann bis 100 % vom Höchstbetrag steuerlich abgesetzt
            werden. <strong>Aber:</strong> DRV-Pflichtbeiträge werden angerechnet —
            sonst überschätzen wir das Potenzial.
          </>
        }
      >
        <Card>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Höchstbetrag brutto"
              value={formatEuro(ruerup.hoechstbetragBrutto)}
              hint={daten.verheiratet ? 'Verheiratet (Splitting)' : 'Ledig'}
            />
            <Stat
              label="DRV-Anrechnung"
              value={formatEuro(ruerup.drvBeitragGeschaetzt)}
              hint={daten.drvPflicht ? '18,6 % vom Jahresbrutto' : 'Nicht pflichtversichert'}
            />
            <Stat
              label="Verfügbar für Rürup"
              value={formatEuro(ruerup.hoechstbetragVerfuegbar)}
              accent
            />
          </div>
          <p className="mt-4 rounded-md bg-cream-dark p-3 text-sm text-ink/80">
            <strong>Praktischer Cap:</strong> über 12.000 €/Jahr in Rürup zu schieben
            macht für Hebammen-Einkommen selten Sinn — das Kapital ist bis 65/67
            gebunden, und ein Großteil der Hebammen steigt vorher aus. Wir empfehlen
            maximal <strong>{formatEuro(ruerup.empfohlenerEigenbeitragJahr)}/Jahr</strong>.
          </p>
        </Card>

        <Card className="mt-5 bg-cream-dark">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
            <div className="text-sm text-ink/80">
              <p className="font-medium text-ink">DRV-Standpunkt — was du als Hebamme weißt</p>
              <p className="mt-1">
                Hebammen sind in der DRV pflichtversichert, weil sie nach §2 SGB VI als
                Pflegekräfte gelten. Damit zahlst du automatisch 18,6 % vom Brutto in die
                gesetzliche Rente — was deine spätere Rentenpunkte aufbaut, aber den
                Rürup-Hebel reduziert. Im Klartext: du hast bereits eine Schicht-1-Säule,
                ob du willst oder nicht.
              </p>
            </div>
          </div>
        </Card>
      </ModuleSection>

      {/* === Section 3: Szenarien === */}
      <ModuleSection
        number={3}
        title="Spiel mit Rendite und Inflation"
        intro="Die Szenarien zeigen, wie sich aktuelle vs. optimierte Sparrate über deine Jahre entwickeln. Inflation und Rendite kannst du verstellen — die Realität ist nicht 6 % nominal jedes Jahr."
      >
        <Szenarien daten={daten} />
      </ModuleSection>

      {/* === Section 4: Nächste Schritte === */}
      <ModuleSection
        number={4}
        title="Was du als nächstes tun kannst"
      >
        <Checklist
          items={[
            {
              title: 'DRV-Renteninformation anfordern (kostenlos)',
              detail:
                'Einmal pro Jahr von der DRV. Online unter deutsche-rentenversicherung.de oder per Post. Zeigt deinen aktuellen Rentenanspruch und die zu erwartende Rente bei gleichem Beitrag bis 67. Basis für jede weitere Planung — solltest du JEDES Jahr neu durchsehen.',
              effort: '5 Min Antrag · kommt per Post',
            },
            {
              title: 'AVD-Konto ab 2027 — Anbieter vergleichen',
              detail: (
                <>
                  Wenn du Kinder hast, ist AVD ein No-Brainer: 300 € Kinderzulage pro
                  Kind gegen 300 € Eigenbeitrag = 100 % Förderquote. Achte beim
                  Anbietervergleich auf: niedrige TER, breit gestreuter ETF (kein
                  Branchen-Fokus), Kostenstruktur transparent. Start: 1.1.2027.
                </>
              ),
              effort: '1 Std Vergleich Ende 2026',
            },
            {
              title: 'Bestehender Riester: Bestandscheck statt Aktion',
              detail: daten.bestehenderRiester
                ? 'Du hast einen Riester-Vertrag. Lass die Kostenstruktur prüfen (Abschluss + Verwaltung). Häufig: Beitragsfreistellung statt Kündigung, weil Zulagen nicht zurückgezahlt werden müssen. AVD-Übertragung ist gesetzlich vorgesehen (Details kommen 2027).'
                : 'Kein Riester vorhanden — gut so. Riester-Neuabschluss ab 2027 nicht mehr möglich, AVD ersetzt es.',
              effort: '1 Std mit unabhängigem Berater',
            },
            {
              title: 'Rürup nur, wenn Spitzensteuersatz und Disziplin gegeben',
              detail: (
                <>
                  Rürup lohnt sich vor allem für Hebammen mit Spitzensteuersatz UND
                  Disziplin, langfristig durchzuhalten. Wer mit 55 aussteigt, hat von
                  Rürup wenig — das Kapital ist bis 65 gesperrt, vererbbar nur sehr
                  eingeschränkt. Lieber Schicht 3 (siehe Vermögensaufbau-Modul) priorisieren.
                </>
              ),
              effort: 'Vergleichsrechnung mit Berater',
            },
          ]}
        />
      </ModuleSection>

      {/* === Section 5: Quellen === */}
      <ModuleSection number={5} title="Worauf das beruht">
        <SourcesBox
          items={[
            {
              label: 'Rürup-Höchstbetrag 2026',
              detail: `${formatEuro(RUERUP_2026.hoechstbetrag.ledig)} ledig · ${formatEuro(RUERUP_2026.hoechstbetrag.verheiratet)} verheiratet · 100 % absetzbar (§10 EStG)`,
              stand: RUERUP_2026.letztePruefung,
            },
            {
              label: 'AVD 2027',
              detail:
                'Bundesrat 8.5.2026 · Start 1.1.2027 · Grundzulage 540 € · Kinderzulage 300 €',
              stand: AVD_2027.letztePruefung,
            },
            {
              label: 'DRV-Pflicht für Hebammen',
              detail:
                '§2 SGB VI · 18,6 % vom Brutto (geteilt AN/AG bei Angestellten, voll bei Freiberuflichen)',
            },
          ]}
        />
      </ModuleSection>
    </ModuleLayout>
  );
}

function SchichtCard({
  schicht,
  label,
  desc,
  active,
}: {
  schicht: string;
  label: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        active ? 'border-berry/40 bg-berry/5' : 'border-rule bg-white'
      }`}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl text-orange/70 tabular-nums">{schicht}</span>
        <p className="text-sm font-medium text-ink">{label}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">{desc}</p>
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
        className={`mt-2 font-serif text-2xl tabular-nums ${
          accent ? 'text-orange-deep' : 'text-berry'
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

void Landmark;
