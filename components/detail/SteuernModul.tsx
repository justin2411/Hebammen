'use client';

import { Coins, FileText } from 'lucide-react';
import {
  ModuleLayout,
  ModuleSection,
  Checklist,
  SourcesBox,
} from '@/components/module/ModuleLayout';
import { Card } from '@/components/ui/Card';
import { formatEuro, formatProzent } from '@/lib/utils';
import { aggregate } from '@/lib/calc/aggregate';
import { STEUERN_2026 } from '@/config/steuern';
import type { BeratungDaten } from '@/lib/calc/types';

interface SteuernModulProps {
  beratungId: string;
  daten: BeratungDaten;
}

export function SteuernModul({ beratungId, daten }: SteuernModulProps) {
  const s = aggregate(daten).steuern;
  const empfText = s.empfehlung === 'einzelnachweis' ? 'Einzelnachweis' : 'Pauschale';
  const istFreiberuflich = daten.status !== 'angestellt';

  return (
    <ModuleLayout
      beratungId={beratungId}
      modulId="steuern"
      headlineKicker="Pro Jahr verschenkst du gerade"
      headlineValue={formatEuro(s.ersparnisProJahr)}
      headlineHint={
        istFreiberuflich
          ? `Mit der richtigen Methode (${empfText}) reduzierst du deinen zu versteuernden Gewinn um ${formatEuro(s.bestBA)} — das spart bei deinem geschätzten Grenzsteuersatz von ${formatProzent(s.grenzsteuersatz)}.`
          : 'Als Angestellte: Werbungskosten-Pauschale, Pendlerpauschale, Fortbildung — der Hebel ist kleiner, aber vorhanden.'
      }
    >
      {/* === Section 1: Status quo === */}
      <ModuleSection
        number={1}
        title="Welche Methode bringt dir mehr?"
        intro={
          istFreiberuflich
            ? 'Als freiberufliche Hebamme darfst du zwischen zwei Wegen wählen: pauschal (1 Pauschalbetrag) oder einzeln (jeden Posten belegen). Du nimmst, was höher ist.'
            : 'Als Angestellte zählen Werbungskosten — Fahrten zur Arbeit, Fortbildungen, häusliches Arbeitszimmer. Über 1.230 €/Jahr lohnt sich Einzelnachweis.'
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <MethodBox
            title="Hebammen-Pauschale"
            value={s.pauschale}
            empfohlen={s.empfehlung === 'pauschale'}
            desc="25 % vom Umsatz, gedeckelt bei 1.535 €. Keine Belege, kein Aufwand."
          />
          <MethodBox
            title="Einzelnachweis"
            value={s.einzelnachweis.summe}
            empfohlen={s.empfehlung === 'einzelnachweis'}
            desc="Kilometer + Homeoffice + Fortbildungen + Equipment. Belege sammeln, dafür ggf. höher."
          />
        </div>

        <Card className="mt-4 bg-cream-dark">
          <h3 className="text-sm font-medium text-ink">Deine Einzelposten — wenn du belegst</h3>
          <dl className="mt-3 grid gap-y-1.5 text-sm sm:grid-cols-2">
            <Row label={`Kilometer (${daten.kilometer.toLocaleString('de-DE')} × 0,30 €)`} value={s.einzelnachweis.kilometer} />
            <Row label={`Homeoffice (${daten.homeofficeTage} × 6 €)`} value={s.einzelnachweis.homeoffice} />
            <Row label="Fortbildungen" value={s.einzelnachweis.fortbildungen} />
            <Row label="Equipment" value={s.einzelnachweis.equipment} />
          </dl>
        </Card>
      </ModuleSection>

      {/* === Section 2: Was möglich ist === */}
      <ModuleSection
        number={2}
        title="Was diese Ersparnis konkret bedeutet"
        intro="Steuerersparnis ist Betriebsausgabe × Grenzsteuersatz. Klingt trocken, ist aber bei Hebammen schnell zwischen 300 und 600 € im Jahr."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Beste Betriebsausgabe"
            value={formatEuro(s.bestBA)}
            hint={empfText}
          />
          <Stat
            label="Grenzsteuersatz (geschätzt)"
            value={formatProzent(s.grenzsteuersatz)}
            hint="Stufenfunktion; Verheiratete: Splitting"
          />
          <Stat label="Ersparnis pro Jahr" value={formatEuro(s.ersparnisProJahr)} accent />
        </div>

        <Card className="mt-5 bg-cream-dark">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-orange" />
            <div className="text-sm text-ink/80">
              <p className="font-medium text-ink">Wann sich Einzelnachweis wirklich lohnt</p>
              <p className="mt-1">
                Wenn du in einem Jahr mehr als 5.000 km für die Arbeit fährst, mehr als
                300 € Fortbildungen besucht hast oder größere Anschaffungen (Notebook,
                Doptone, Hebammenkoffer) ≥ 800 € getätigt hast — dann schlägt der
                Einzelnachweis die Pauschale schnell. Wer hauptsächlich in der Klinik
                arbeitet, bleibt meist bei der Pauschale besser.
              </p>
            </div>
          </div>
        </Card>
      </ModuleSection>

      {/* === Section 3: Spiel === */}
      <ModuleSection
        number={3}
        title="Hier wird's individuell — Beleg-Pflege ist der Hebel"
        intro="Es gibt nichts zu schieben — entweder du sammelst Belege oder nicht. Die Konsequenz: jeder nicht erfasste Kilometer × 0,30 € × Grenzsteuersatz fließt weg."
      >
        <Card>
          <p className="font-medium text-ink">Realitäts-Check</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>
              • <strong>1 km nicht erfasst</strong> ={' '}
              {formatEuro(0.3 * s.grenzsteuersatz, 2)} weniger Ersparnis
            </li>
            <li>
              • <strong>100 km nicht erfasst</strong> ={' '}
              {formatEuro(100 * 0.3 * s.grenzsteuersatz)} weniger Ersparnis
            </li>
            <li>
              • <strong>1.000 km nicht erfasst</strong> ={' '}
              {formatEuro(1000 * 0.3 * s.grenzsteuersatz)} weniger Ersparnis — pro Jahr
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            Über 30 Berufsjahre summiert sich das auf{' '}
            <strong className="tabular-nums">{formatEuro(1000 * 0.3 * s.grenzsteuersatz * 30)}</strong>{' '}
            (allein für 1.000 km/Jahr).
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
              title: 'Fahrtenbuch ab heute führen — oder App nutzen',
              detail:
                'Apps wie Fiskaly, Driversnote oder ein simples Heft im Auto. Datum, Anlass (z.B. „Hausgeburt Familie K."), gefahrene km. Reicht für Finanzamt, auch ohne Komplettnachweis. Steuerprüfung-Spielregel: realistische Schätzung mit Stichproben-Plausibilität.',
              effort: '2 Min pro Fahrt',
            },
            {
              title: 'Belege digital sammeln — bestes Tool: simple Foto-App',
              detail:
                'Jeden Beleg sofort fotografieren, in einen Ordner „Steuer 2026" auf dem Handy. Am Jahresende einmal sortieren. Ersetzt komplett Papierberge. Originale 10 Jahre aufbewahren bleibt Pflicht (Schuhkarton reicht).',
              effort: '10 Sek pro Beleg',
            },
            {
              title: 'Bei Erstanlage einmalig Steuerberater konsultieren',
              detail: (
                <>
                  Eine Stunde (~150 €) bei Berater:in mit Hebammen-Erfahrung
                  klärt: Pauschale oder Einzelnachweis, Vorauszahlungs-Höhe,
                  Liebhaberei-Frage falls Nebenerwerb. Lohnt sich auch wenn du sonst
                  selbst machst.
                </>
              ),
              effort: '1 Termin · 150 €',
            },
            {
              title: 'Quartal-Vorauszahlungen prüfen',
              detail:
                'Wenn dein Gewinn schwankt (Praxis-Auf-/-Abbau, Elternzeit), kannst du Vorauszahlungen anpassen lassen (Formular ESt 1 A). Liquidität wertvoll, weil du sonst dem Finanzamt einen zinslosen Kredit gibst.',
              effort: 'Schreiben ans Finanzamt, 15 Min',
            },
            ...(daten.status !== 'angestellt'
              ? [
                  {
                    title: 'Rückwirkend prüfen — letzte 4 Jahre',
                    detail:
                      'Steuererklärungen können bis 4 Jahre rückwirkend korrigiert werden, wenn du Pauschale/Einzelnachweis bisher nicht optimal angesetzt hast. Lohnt sich, wenn du 2022–2024 nicht alles abgerufen hast.',
                    effort: 'Mit Steuerberater · 1–2 Std',
                  },
                ]
              : []),
          ]}
        />
      </ModuleSection>

      {/* === Section 5: Quellen === */}
      <ModuleSection number={5} title="Worauf das beruht">
        <SourcesBox
          items={[
            {
              label: 'Hebammen-Betriebsausgabenpauschale',
              detail: '25 % des Umsatzes, max. 1.535 €. §3 EStR, BMF-Schreiben',
              stand: STEUERN_2026.letztePruefung,
            },
            {
              label: 'Kilometerpauschale',
              detail: `${STEUERN_2026.kilometerpauschale.toFixed(2).replace('.', ',')} €/km, Pendlerpauschale weiter`,
            },
            {
              label: 'Homeoffice-Pauschale',
              detail: `${STEUERN_2026.homeofficePauschale.proTag} €/Tag, max. ${STEUERN_2026.homeofficePauschale.maxTage} Tage, gedeckelt ${STEUERN_2026.homeofficePauschale.maxBetrag} €`,
            },
            {
              label: 'Grenzsteuersatz',
              detail: 'Vereinfachte Stufenfunktion auf zvE; Verheiratete: Splitting (zvE ÷ 2)',
            },
          ]}
        />
      </ModuleSection>
    </ModuleLayout>
  );
}

function MethodBox({
  title,
  value,
  empfohlen,
  desc,
}: {
  title: string;
  value: number;
  empfohlen: boolean;
  desc: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        empfohlen ? 'border-orange/40 bg-orange-soft/30' : 'border-rule bg-white'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium text-ink">{title}</h3>
        {empfohlen && (
          <span className="rounded-full bg-orange/15 px-2 py-0.5 text-[10px] uppercase text-orange-deep">
            empfohlen
          </span>
        )}
      </div>
      <p className="mt-3 font-serif text-3xl text-berry tabular-nums">{formatEuro(value)}</p>
      <p className="mt-2 text-sm text-ink/70">{desc}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-right tabular-nums text-ink sm:text-left">{formatEuro(value)}</dd>
    </>
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

void Coins;
