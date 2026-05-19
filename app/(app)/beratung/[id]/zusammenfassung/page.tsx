'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { ZusammenfassungView } from '@/components/results/ZusammenfassungView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BeratungLoader id={id}>
      {(b) => (
        <>
          <div className="mx-auto max-w-4xl px-6 pt-6 print:hidden">
            <Link
              href={`/beratung/${id}`}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-berry"
            >
              <ChevronLeft className="h-4 w-4" />
              Zur Auswertung
            </Link>
          </div>
          <ZusammenfassungView beratung={b} />
        </>
      )}
    </BeratungLoader>
  );
}
