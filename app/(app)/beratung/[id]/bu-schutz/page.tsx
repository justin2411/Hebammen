'use client';

import { use } from 'react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { BuSchutzModul } from '@/components/detail/BuSchutzModul';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BeratungLoader id={id}>
      {(b) => <BuSchutzModul beratungId={b.id} daten={b.daten} />}
    </BeratungLoader>
  );
}
