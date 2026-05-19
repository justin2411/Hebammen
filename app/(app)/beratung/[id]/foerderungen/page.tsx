'use client';

import { use } from 'react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { FoerderungenModul } from '@/components/detail/FoerderungenModul';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BeratungLoader id={id}>
      {(b) => <FoerderungenModul beratungId={b.id} daten={b.daten} />}
    </BeratungLoader>
  );
}
