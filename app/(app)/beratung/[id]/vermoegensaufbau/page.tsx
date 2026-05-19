'use client';

import { use } from 'react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { VermoegensaufbauModul } from '@/components/detail/VermoegensaufbauModul';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BeratungLoader id={id}>
      {(b) => <VermoegensaufbauModul beratungId={b.id} daten={b.daten} />}
    </BeratungLoader>
  );
}
