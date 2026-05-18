'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { AltersvorsorgeDetail } from '@/components/detail/AltersvorsorgeDetail';
import { aggregate } from '@/lib/calc/aggregate';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BeratungLoader id={id}>
      {(b) => {
        const agg = aggregate(b.daten);
        return (
          <main className="mx-auto max-w-4xl px-6 py-12">
            <Link
              href={`/beratung/${id}`}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-berry"
            >
              <ChevronLeft className="h-4 w-4" />
              Zur Auswertung
            </Link>
            <div className="mt-6">
              <AltersvorsorgeDetail
                daten={b.daten}
                buLuecke={agg.buLuecke}
                ruerup={agg.ruerup}
              />
            </div>
          </main>
        );
      }}
    </BeratungLoader>
  );
}
