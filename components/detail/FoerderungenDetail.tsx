'use client';

import { Reveal } from '@/components/shared/Reveal';
import { Card } from '@/components/ui/Card';
import { SourceTooltip } from '@/components/shared/SourceTooltip';
import { AVD_2027 } from '@/config/avd';
import { FOERDERUNGEN_2026 } from '@/config/foerderungen';
import { formatEuro } from '@/lib/utils';
import type { FoerderResult } from '@/lib/calc/foerderungen';

export function FoerderungenDetail({ result }: { result: FoerderResult }) {
  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="font-serif text-3xl text-berry">
          <span className="italic text-orange">Förderungen</span>
        </h1>
        <p className="mt-2 text-muted">
          AVD-Zulagen, BAV, VL und GKV-Sicherstellungszuschlag im Detail.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <Card>
          <h2 className="font-serif text-xl text-berry">
            Altersvorsorgedepot (AVD)
            <SourceTooltip label="">
              <strong>AVD 2027</strong>
              <br />
              Bundesrat 8.5.2026, Start 1.1.2027.
              <br />
              Maximale Grundzulage 540 €. Kinderzulage 300 € pro Kind.
              <br />
              Berufseinsteiger-Bonus 200 € einmalig (≤ 25 J.).
              <br />
              Empfohlener Eigenbeitrag: 1.800 € + 300 € pro Kind.
              <br />
              Rechtsstand: {AVD_2027.rechtsstand}.
            </SourceTooltip>
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <KleinStat label="Grundzulage" value={result.avd.grundzulage} />
            <KleinStat label="Kinderzulage" value={result.avd.kinderzulage} />
            <KleinStat label="Berufseinsteiger" value={result.avd.berufseinsteigerBonus} />
          </div>
          <div className="mt-4 rounded-md bg-cream-dark p-3 text-sm">
            Empfohlener Eigenbeitrag:{' '}
            <span className="font-medium tabular-nums">
              {formatEuro(result.avd.empfohlenerEigenbeitrag)}
            </span>{' '}
            / Jahr · holt {formatEuro(result.avd.summe)} Zulagen.
          </div>
        </Card>
      </Reveal>

      <Reveal delay={200}>
        <Card>
          <h2 className="font-serif text-xl text-berry">
            Betriebliche Altersvorsorge (BAV)
            <SourceTooltip label="">
              §3 Nr. 63 EStG. Bis zu 4 % der BBG steuer-/SV-frei. Klinikzuschuss als typische
              Schätzung 15 % vom AN-Beitrag.
            </SourceTooltip>
          </h2>
          {result.bav.summe > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <KleinStat label="SV-Ersparnis" value={result.bav.sozialversicherungsErsparnis} />
              <KleinStat label="Klinikzuschuss (Schätzung)" value={result.bav.klinikzuschuss} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Nicht anwendbar – BAV ist Sache von Angestellten / Kombi-Status.
            </p>
          )}
        </Card>
      </Reveal>

      <Reveal delay={300}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <h3 className="font-serif text-lg text-berry">VL</h3>
            {result.vl.arbeitgeberzuschuss > 0 ? (
              <p className="mt-2 font-serif text-2xl text-berry tabular-nums">
                {formatEuro(result.vl.arbeitgeberzuschuss)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Nicht anwendbar (Freiberuflich).</p>
            )}
            <p className="mt-2 text-xs text-muted">
              Max. AG-Zuschuss {FOERDERUNGEN_2026.vl.maxArbeitgeberzuschussProMonat} €/Monat
            </p>
          </Card>
          <Card>
            <h3 className="font-serif text-lg text-berry">GKV-Sicherstellung</h3>
            {result.gkvSicherstellungszuschlag > 0 ? (
              <p className="mt-2 font-serif text-2xl text-berry tabular-nums">
                {formatEuro(result.gkvSicherstellungszuschlag)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Nur bei Geburtshilfe-Tätigkeit relevant.
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              Annahme: 10 Geburten × {FOERDERUNGEN_2026.gkvSicherstellungszuschlag.proGeburtsfall} €.
            </p>
          </Card>
        </div>
      </Reveal>

      <Reveal delay={400}>
        <Card className="bg-orange/10 border-orange/30">
          <p className="text-sm text-ink">
            <strong>Summe:</strong>{' '}
            <span className="font-serif text-2xl text-berry tabular-nums">
              {formatEuro(result.gesamtProJahr)}
            </span>{' '}
            jährlich an Förderungen verfügbar.
          </p>
        </Card>
      </Reveal>
    </div>
  );
}

function KleinStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-cream-dark/40 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-serif text-xl text-berry tabular-nums">{formatEuro(value)}</p>
    </div>
  );
}
