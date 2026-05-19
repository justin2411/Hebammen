'use client';

import Link from 'next/link';
import { Coins, Gift, TrendingUp, FileDown, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/shared/Reveal';
import { ScoreGauge } from './ScoreGauge';
import { PillarCard } from './PillarCard';
import { Hero } from './Hero';
import { Szenarien } from './Szenarien';
import { Empfehlungen } from './Empfehlungen';
import { SubScoreList } from './SubScoreList';
import { aggregate } from '@/lib/calc/aggregate';
import type { Beratung } from '@/lib/storage';
import { SUB_PROFIL_META } from '@/lib/calc/types';

interface AuswertungViewProps {
  beratung: Beratung;
}

export function AuswertungView({ beratung }: AuswertungViewProps) {
  const result = aggregate(beratung.daten);
  const av = result.altersvorsorge;
  const kumuliert = result.freigesetztesPotenzialJahr * av.jahreBisAusstieg;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Hero
        hebammeName={beratung.hebammeName}
        jahresPotenzial={result.freigesetztesPotenzialJahr}
        jahreBisAusstieg={av.jahreBisAusstieg}
        kumuliertesPotenzial={kumuliert}
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted">
        <span>{SUB_PROFIL_META[beratung.daten.subProfil].label}</span>
        <span>·</span>
        <span>{beratung.daten.alter} J.</span>
        <span>·</span>
        <span>Ausstieg mit {beratung.daten.ausstiegsalter}</span>
      </div>

      {/* Score + Pillars */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Reveal delay={100}>
          <Card className="flex flex-col items-center gap-4">
            <h2 className="font-serif text-xl text-berry">Vorsorge-Score</h2>
            <ScoreGauge value={result.score.total} />
            <SubScoreList subs={result.score.subs} />
          </Card>
        </Reveal>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <Reveal delay={150}>
            <PillarCard
              icon={Coins}
              label="Steueroptimierung"
              value={result.steuern.ersparnisProJahr}
              cumulativeLabel={`über ${av.jahreBisAusstieg} J.`}
              cumulativeValue={result.steuern.ersparnisProJahr * av.jahreBisAusstieg}
              href={`/beratung/${beratung.id}/steuern`}
              delay={300}
            />
          </Reveal>
          <Reveal delay={200}>
            <PillarCard
              icon={Gift}
              label="Förderungen"
              value={result.foerderungen.gesamtProJahr}
              cumulativeLabel={`über ${av.jahreBisAusstieg} J.`}
              cumulativeValue={result.foerderungen.gesamtProJahr * av.jahreBisAusstieg}
              href={`/beratung/${beratung.id}/foerderungen`}
              delay={500}
            />
          </Reveal>
          <Reveal delay={250} className="sm:col-span-2">
            <PillarCard
              icon={TrendingUp}
              label="Altersvorsorge (optimiert)"
              value={Math.round(av.optimiert.endkapital / Math.max(1, av.jahreBisAusstieg))}
              cumulativeLabel="Endkapital nominal"
              cumulativeValue={av.optimiert.endkapital}
              href={`/beratung/${beratung.id}/altersvorsorge`}
              delay={700}
            />
          </Reveal>
        </div>
      </div>

      {/* BU-Hinweis falls Lücke */}
      {result.buLuecke.status !== 'gut' && (
        <Reveal delay={350}>
          <Card className="mt-6 border-danger/40 bg-danger/5">
            <div className="flex items-start gap-4">
              <Shield className="mt-1 h-5 w-5 text-danger" />
              <div>
                <h3 className="font-serif text-lg text-berry">
                  BU-Lücke: {result.buLuecke.luecke > 0 ? 'klar erkennbar' : 'gering'}
                </h3>
                <p className="mt-1 text-sm text-ink/80">
                  Empfohlen: BU-Rente ab ≈{' '}
                  <span className="tabular-nums font-medium">
                    {result.buLuecke.empfohleneMonatsRente.toLocaleString('de-DE')} €
                  </span>
                  /Monat – aktuell {result.buLuecke.bestehend.toLocaleString('de-DE')} €. Genau in
                  der Lebensphase 44–56 ist das Risiko für Hebammen am höchsten.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      )}

      {/* Szenarien mit Slidern */}
      <div className="mt-6">
        <Szenarien daten={beratung.daten} />
      </div>

      {/* Empfehlungen */}
      <div className="mt-10">
        <Empfehlungen empfehlungen={result.empfehlungen} />
      </div>

      {/* Aktionen */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6">
        <p className="text-sm text-muted">
          Beratung gespeichert · zuletzt aktualisiert{' '}
          {new Date(beratung.updatedAt).toLocaleString('de-DE')}
        </p>
        <div className="flex gap-2">
          <Link href={`/beratung/${beratung.id}/zusammenfassung`}>
            <Button variant="ghost">
              <FileDown className="h-4 w-4" />
              Zusammenfassung & PDF
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
