'use client';

import Link from 'next/link';
import { FileDown, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/shared/Reveal';
import { ScoreGauge } from './ScoreGauge';
import { Hero } from './Hero';
import { Szenarien } from './Szenarien';
import { Empfehlungen } from './Empfehlungen';
import { SubScoreList } from './SubScoreList';
import { TopicSelector } from './TopicSelector';
import { aggregate } from '@/lib/calc/aggregate';
import { buildTopicInsights } from '@/lib/calc/topicInsights';
import type { Beratung } from '@/lib/storage';
import { SUB_PROFIL_META } from '@/lib/calc/types';

interface AuswertungViewProps {
  beratung: Beratung;
}

export function AuswertungView({ beratung }: AuswertungViewProps) {
  const result = aggregate(beratung.daten);
  const av = result.altersvorsorge;
  const kumuliert = result.freigesetztesPotenzialJahr * av.jahreBisAusstieg;
  const insights = buildTopicInsights(result);

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

      {/* Score + BU-Hinweis */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Reveal delay={100}>
          <Card className="flex flex-col items-center gap-4">
            <h2 className="font-serif text-xl text-berry">Vorsorge-Score</h2>
            <ScoreGauge value={result.score.total} />
            <SubScoreList subs={result.score.subs} />
          </Card>
        </Reveal>

        <div className="lg:col-span-2 space-y-4">
          {result.buLuecke.status !== 'gut' && (
            <Reveal delay={150}>
              <Card className="border-danger/40 bg-danger/5">
                <div className="flex items-start gap-4">
                  <Shield className="mt-1 h-5 w-5 text-danger" />
                  <div>
                    <h3 className="font-serif text-lg text-berry">
                      BU-Lücke:{' '}
                      {result.buLuecke.status === 'fehlt'
                        ? 'kein Schutz vorhanden'
                        : result.buLuecke.status === 'unterversorgt'
                          ? 'klar unterversorgt'
                          : 'leicht unterversorgt'}
                    </h3>
                    <p className="mt-1 text-sm text-ink/80">
                      Empfohlen: BU-Rente ab ≈{' '}
                      <span className="font-medium tabular-nums">
                        {result.buLuecke.empfohleneMonatsRente.toLocaleString('de-DE')} €
                      </span>
                      /Monat – aktuell{' '}
                      <span className="font-medium tabular-nums">
                        {result.buLuecke.bestehend.toLocaleString('de-DE')} €
                      </span>
                      . Genau in der Lebensphase 44–56 ist das Risiko für Hebammen am höchsten
                      (Statistik: 43,6 % denken über Berufswechsel nach).
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal delay={200}>
            <Card>
              <h3 className="font-serif text-lg text-berry">Wie das hier zu verstehen ist</h3>
              <p className="mt-2 text-sm text-ink/80">
                Die Auswertung zeigt das Bild im Großen. Wenn du tiefer reingehen willst,
                wähle unten ein Thema — jedes hat eine Status-quo-Aufnahme, eine
                Möglichkeitsrechnung mit deinen Zahlen, Szenarien zum Spielen und eine
                konkrete Checkliste, was als nächstes ansteht.
              </p>
            </Card>
          </Reveal>
        </div>
      </div>

      {/* Topic-Selector — der zentrale „such dir was aus"-Block */}
      <TopicSelector beratungId={beratung.id} insights={insights} />

      {/* Szenarien mit Slidern */}
      <div className="mt-16">
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
