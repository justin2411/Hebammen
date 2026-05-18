'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Archive } from 'lucide-react';
import { storage, type Beratung } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatEuro } from '@/lib/utils';
import { aggregate } from '@/lib/calc/aggregate';
import { SUB_PROFIL_META } from '@/lib/calc/types';

export default function DashboardPage() {
  const [list, setList] = useState<Beratung[] | null>(null);

  useEffect(() => {
    storage.list().then(setList);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-4xl text-berry">
            <span className="italic text-orange">Beratungen</span>
          </h1>
          <p className="mt-2 text-muted">
            Übersicht deiner laufenden Hebammen-Vorsorge-Beratungen.
          </p>
        </div>
        <Link href="/beratung/neu">
          <Button variant="primary">
            <FilePlus className="h-4 w-4" />
            Neue Beratung
          </Button>
        </Link>
      </div>

      <div className="mt-10">
        {list === null ? (
          <p className="text-sm text-muted">Lade …</p>
        ) : list.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => {
              const agg = aggregate(b.daten);
              return (
                <Link key={b.id} href={`/beratung/${b.id}`} className="block">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-xl text-berry">{b.hebammeName}</h3>
                      {b.status === 'archiviert' && (
                        <Archive className="h-4 w-4 text-muted" />
                      )}
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                      {SUB_PROFIL_META[b.daten.subProfil].label}
                    </p>
                    <p className="mt-4 font-serif text-2xl text-berry tabular-nums">
                      {formatEuro(agg.freigesetztesPotenzialJahr)}
                    </p>
                    <p className="text-xs text-muted">Potenzial pro Jahr</p>
                    <p className="mt-4 text-xs text-muted">
                      Score {agg.score.total}/100 · {b.datum}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function Empty() {
  return (
    <Card className="flex flex-col items-center gap-4 py-16 text-center">
      <FileText className="h-10 w-10 text-muted" />
      <div>
        <h2 className="font-serif text-2xl text-berry">Noch keine Beratungen</h2>
        <p className="mt-1 text-muted">
          Starte deine erste Hebammen-Beratung – der Wizard dauert 3-4 Minuten.
        </p>
      </div>
      <Link href="/beratung/neu">
        <Button>
          <FilePlus className="h-4 w-4" />
          Neue Beratung starten
        </Button>
      </Link>
    </Card>
  );
}
