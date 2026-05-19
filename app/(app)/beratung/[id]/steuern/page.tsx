'use client';

import { use } from 'react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { SteuernModul } from '@/components/detail/SteuernModul';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BeratungLoader id={id}>
      {(b) => <SteuernModul beratungId={b.id} daten={b.daten} />}
    </BeratungLoader>
  );
}
