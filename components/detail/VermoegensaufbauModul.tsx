'use client';

import { useState, useMemo } from 'react';
import { PiggyBank, Clock, TrendingDown } from 'lucide-react';
import {
  ModuleLayout,
  ModuleSection,
  Checklist,
  SourcesBox,
} from '@/components/module/ModuleLayout';
import { Card } from '@/components/ui/Card';
import { Range, Toggle } from '@/components/ui/Field';
import { Lifeline } from '@/components/results/Lifeline';
import { formatEuro } from '@/lib/utils';
import { calcAltersvorsorge, computeWealth, realwert } from '@/lib/calc/altersvorsorge';
import { aggregate } from '@/lib/calc/aggregate';
import type { BeratungDaten } from '@/lib/calc/types';

interface VermoegensaufbauModulProps {
  beratungId: string;
  daten: BeratungDaten;
}

export function VermoegensaufbauModul({ beratungId, daten }: VermoegensaufbauModulProps) {
  const agg = aggregate(daten);
  const av = agg.altersvorsorge;

  const [sparrate, setSparrate] = useState(daten.aktuelleSparrate);
  const [rendite, setRendite] = useState(0.06);
  const [stress, setStress] = useState(false);

  const jahre = av.jahreBisAusstieg;
  const inflation = av.parameter.inflation;

  const szenario = useMemo(() => {
    if (!stress) {
      const nominal = computeWealth(sparrate, jahre, rendite, daten.startCapital);
      return {
        endkapital: nominal,
        real: realwert(nominal, jahre, inflation),
      };
    }
    // BU-Stresstest: bis 50 einzahlen, danach nur Verzinsung
    const jahreBisBu = Math.max(0, Math.min(50, daten.ausstiegsalter) - daten.alter);
    const jahreNurZinsen = Math.max(0, daten.ausstiegsalter - Math.max(50, daten.alter));
    const beiBu = computeWealth(sparrate, jahreBisBu, rendite, daten.startCapital);
    const nominal = beiBu * Math.pow(1 + rendite, jahreNurZinsen);
    return {
      endkapital: nominal,
      real: realwert(nominal, jahre, inflation),
    };
  }, [sparrate, rendite, stress, jahre, inflation, daten]);

  const notgroschenStatus = daten.notgroschenMonate >= 3 ? 'gut' : daten.notgroschenMonate >= 1 ? 'mau' : 'kritisch';
  const monatsnetto = Math.round(daten.monatsbrutto * 0.65);

  // Headline-Zahl: Was bringt der nächste 50€/Monat-Schritt?
  const naechsteStufeSparrate = sparrate + 50;
  const naechsteStufeEnde = computeWealth(naechsteStufeSparrate, jahre, rendite, daten.startCapital);
  const differenz = naechsteStufeEnde - computeWealth(sparrate, jahre, rendite, daten.startCapital);

  return (
    <ModuleLayout
      beratungId={beratungId}
      modulId="vermoegensaufbau"
      headlineKicker="Über deine Berufsjahre können das"
      headlineValue={formatEuro(szenario.endkapital)}
      headlineHint={`werden — flexibel verfügbar, nicht gesperrt bis 62. Heute hast du eine Sparrate von ${formatEuro(daten.aktuelleSparrate)}/Mon.`}
    >
      {/* === Section 1: Status quo === */}
      <ModuleSection
        number={1}
        title="Wo du heute startest"
        intro={
          <>
            Schicht 3 ist die einzige Vorsorge-Ebene, an die du <em>jederzeit</em> rankommst.
            Genau das ist der Knackpunkt für Hebammen: BU-Statistik 44–56, viele steigen
            vor 62/65 aus — und genau in dieser Lücke greift weder Rürup noch AVD.
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatusCard
            label="Aktuelle Sparrate"
            value={formatEuro(daten.aktuelleSparrate) + '/Mon'}
            sublabel={
              daten.aktuelleSparrate > 0
                ? `${((daten.aktuelleSparrate * 12) / (daten.monatsbrutto * 12) * 100).toFixed(1)} % vom Brutto`
                : 'Noch nichts laufendes'
            }
          />
          <StatusCard
            label="Startkapital"
            value={formatEuro(daten.startCapital)}
            sublabel="bereits vorhanden"
          />
          <StatusCard
            label="Notgroschen"
            value={`${daten.notgroschenMonate} Monatsnettos`}
            sublabel={
              notgroschenStatus === 'gut'
                ? 'Solide Basis'
                : notgroschenStatus === 'mau'
                  ? 'Sollten 3–6 Monatsnettos sein'
                  : 'Erste Baustelle vor allem anderen'
            }
            tone={notgroschenStatus === 'gut' ? 'positive' : 'risk'}
          />
        </div>

        {notgroschenStatus !== 'gut' && (
          <Card className="mt-4 border-orange/30 bg-orange-soft/30">
            <div className="flex items-start gap-3">
              <PiggyBank className="mt-0.5 h-5 w-5 shrink-0 text-orange-deep" />
              <div>
                <p className="font-medium text-ink">Notgroschen zuerst — bevor wir investieren</p>
                <p className="mt-1 text-sm text-ink/80">
                  3 bis 6 Monatsnettos auf Tagesgeld. Das sind bei dir etwa{' '}
                  <strong>{formatEuro(monatsnetto * 3)}–{formatEuro(monatsnetto * 6)}</strong>.
                  Diese Reserve verhindert, dass du in einer Krise (Krankheit, ausfallende
                  Praxis) langfristige Anlagen mit Verlust auflösen musst. Anlegen mit
                  ETF lohnt sich erst, wenn dieser Puffer steht.
                </p>
              </div>
            </div>
          </Card>
        )}
      </ModuleSection>

      {/* === Section 2: Was möglich ist === */}
      <ModuleSection
        number={2}
        title="Wie sich Sparrate über deine Jahre entwickelt"
        intro="ETF-Sparplan, breit gestreut (z.B. MSCI All-Country World), ist die einfachste und kostengünstigste Variante. Langfristig 5–7 % Rendite p.a. nach Inflation sind realistische Annahme."
      >
        <Lifeline
          alter={daten.alter}
          ausstiegsalter={daten.ausstiegsalter}
          startCapital={daten.startCapital}
          aktuelleSparrate={daten.aktuelleSparrate}
          optimierteSparrate={daten.aktuelleSparrate + agg.freigesetztesPotenzialJahr / 12}
          rendite={av.parameter.renditeNominal}
          buStress={av.buStress}
        />

        <Card className="mt-5 bg-cream-dark">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
            <div className="text-sm text-ink/80">
              <p className="font-medium text-ink">Der Hebel ist Zeit, nicht Höhe der Rate</p>
              <p className="mt-1">
                Wer 25 Jahre lang 100 €/Mon spart und 6 % Rendite bekommt, hat am Ende{' '}
                <strong>{formatEuro(computeWealth(100, 25, 0.06))}</strong>. Wer 10 Jahre
                spart und 250 €/Mon investiert (gleicher Gesamteinzahler von 30.000 €),
                kommt nur auf <strong>{formatEuro(computeWealth(250, 10, 0.06))}</strong>.
                Je früher dein Geld arbeitet, je weniger musst du arbeiten lassen.
              </p>
            </div>
          </div>
        </Card>
      </ModuleSection>

      {/* === Section 3: Spielfeld === */}
      <ModuleSection
        number={3}
        title="Schieb die Regler — was wäre wenn?"
        intro={`Deine Headline oben spiegelt die Slider hier wider. Aktuell ergibt sich eine Endsumme von ${formatEuro(szenario.endkapital)} (nominal), in heutiger Kaufkraft ${formatEuro(szenario.real)}.`}
      >
        <Card>
          <div className="space-y-6">
            <Range
              label="Monatliche Sparrate"
              min={0}
              max={1500}
              step={25}
              value={sparrate}
              onChange={setSparrate}
              formatValue={(v) => formatEuro(v) + '/Mon'}
            />

            <Range
              label="Erwartete Rendite p.a. (nominal)"
              min={0.02}
              max={0.09}
              step={0.005}
              value={rendite}
              onChange={setRendite}
              formatValue={(v) => `${(v * 100).toFixed(1)} %`}
            />

            <Toggle
              checked={stress}
              onChange={setStress}
              label='Stresstest: „BU mit 50&quot; — danach keine Beiträge mehr'
              description="Beiträge stoppen ab Alter 50, nur die Verzinsung läuft weiter. Realität ist: BU ist statistisch der wahrscheinlichste Berufs-Exit für Hebammen."
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ResultBox
              label="Endkapital nominal"
              value={szenario.endkapital}
              hint={`in ${jahre} Jahren, kompoundiert`}
              accent
            />
            <ResultBox
              label="In heutiger Kaufkraft"
              value={szenario.real}
              hint={`Inflation ${(inflation * 100).toFixed(1)} % p.a. abgezogen`}
            />
          </div>

          <Card className="mt-5 border-orange/30 bg-white">
            <div className="flex items-start gap-3">
              <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
              <div className="text-sm">
                <p className="font-medium text-ink">
                  Was dir 50 €/Mon mehr bringen würden
                </p>
                <p className="mt-1 text-ink/80">
                  Würdest du ab heute <strong>{formatEuro(naechsteStufeSparrate)}</strong>{' '}
                  statt {formatEuro(sparrate)} im Monat anlegen, wären das am Ende
                  zusätzliche <strong>{formatEuro(differenz)}</strong>. Eine Pizza weniger
                  pro Woche, sozusagen.
                </p>
              </div>
            </div>
          </Card>
        </Card>
      </ModuleSection>

      {/* === Section 4: Nächste Schritte === */}
      <ModuleSection
        number={4}
        title="Was du als nächstes tun kannst"
      >
        <Checklist
          items={[
            ...(notgroschenStatus !== 'gut'
              ? [
                  {
                    title: 'Notgroschen aufbauen — auf Tagesgeldkonto',
                    detail: (
                      <>
                        3–6 Monatsnettos liquide halten. Bei dir{' '}
                        <strong>{formatEuro(monatsnetto * 3)}–{formatEuro(monatsnetto * 6)}</strong>.
                        Tagesgeld bringt aktuell rund 2–3 % Zinsen, das reicht. <em>Vor</em>{' '}
                        jeder anderen Geldanlage. Empfehlung: separates Konto, nicht zur
                        täglichen Verfügung im Sichtkonto.
                      </>
                    ),
                    effort: '15 Min Kontoeröffnung · monatlicher Dauerauftrag',
                  },
                ]
              : []),
            {
              title: 'ETF-Sparplan starten oder erhöhen',
              detail: (
                <>
                  Breit gestreut: MSCI All-Country World (3.000+ Aktien aus 47 Ländern) oder
                  FTSE All-World. Kostengünstige Anbieter mit gratis Sparplänen: ING,
                  Comdirect, Trade Republic, Scalable. Ziel-Sparrate{' '}
                  <strong>10–15 % vom Netto</strong>, das wären bei dir{' '}
                  <strong>{formatEuro(Math.round(monatsnetto * 0.12))}/Mon</strong>.
                </>
              ),
              effort: '30 Min Setup · läuft danach automatisch',
            },
            {
              title: 'Bestehende Verträge prüfen — Riester / alte LV',
              detail:
                'Riester rechnet sich nur in ganz wenigen Konstellationen weiter. Alte Lebens-/Rentenversicherungen aus den 2000ern haben oft Garantiezinsen, die sich heute lohnen — neuere Verträge eher nicht. Beitragsfreistellung statt Kündigung prüfen, weil Kündigung oft Verluste auslöst.',
              effort: '1 Termin mit unabhängigem Berater',
            },
            {
              title: 'Bei höherer Sparquote: Nettopolice statt Direktinvest',
              detail:
                'Ab ca. 200 €/Mon und langem Horizont (15+ J.) kann eine Nettopolice (ohne Abschlusskosten) steuerlich besser sein als ein direkter ETF-Sparplan. Wegen Halbeinkünfteverfahren bei Auszahlung nach 12 J. + 62. Lebensjahr. Wichtig: NETTO-Police, keine klassische Provisionspolice.',
              effort: 'Vergleichsrechnung mit Berater',
            },
            {
              title: 'Plan B notieren: „BU mit 50"',
              detail: (
                <>
                  Schreib auf, was du tust, wenn du mit 50 nicht mehr Hebamme sein kannst.
                  Welche Rücklage brauchst du? Wer hilft? Welche Versicherung greift? Allein
                  diese Übung macht klar, ob das jetzige Sparen reicht. Dein Stresstest oben
                  zeigt: mit Sparstop ab 50 bleiben <strong>{formatEuro(av.buStress.endkapital)}</strong>.
                </>
              ),
              effort: '20 Min, am besten zusammen mit jemandem',
            },
          ]}
        />
      </ModuleSection>

      {/* === Section 5: Quellen === */}
      <ModuleSection number={5} title="Worauf das beruht">
        <SourcesBox
          items={[
            {
              label: 'Rendite-Annahme 6 % nominal',
              detail:
                'Langfristiger Durchschnitt MSCI World 1970–2024 vor Steuern (DAI-Renditedreieck).',
            },
            {
              label: 'Inflation 2 % p.a.',
              detail: 'EZB-Zielwert, langfristiger Schnitt Deutschland 1995–2024.',
            },
            {
              label: 'BU-Stressalter 50',
              detail:
                'opta data Hebammenstudie 2025 + GDV-BU-Statistik (median statisch zwischen 44 und 56).',
              stand: '2025',
            },
            {
              label: 'Notgroschen 3–6 Monatsnettos',
              detail: 'Standard-Empfehlung BdV / Stiftung Warentest / Finanztest.',
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
  tone = 'neutral',
}: {
  label: string;
  value: string;
  sublabel: string;
  tone?: 'positive' | 'neutral' | 'risk';
}) {
  const toneClasses = {
    positive: 'border-green/40 bg-green/5',
    neutral: 'border-rule bg-white',
    risk: 'border-danger/40 bg-danger/5',
  } as const;
  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-serif text-xl text-berry tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-ink/70">{sublabel}</p>
    </div>
  );
}

function ResultBox({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? 'border-berry bg-berry/5' : 'border-rule bg-white'
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl tabular-nums ${
          accent ? 'text-orange-deep' : 'text-berry'
        }`}
      >
        {formatEuro(value)}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

// avoid unused warning
void calcAltersvorsorge;
