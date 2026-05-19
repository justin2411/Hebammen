'use client';

import { use } from 'react';
import { BeratungLoader } from '@/components/results/BeratungLoader';
import { AuswertungView } from '@/components/results/AuswertungView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BeratungPage({ params }: PageProps) {
  const { id } = use(params);
  return <BeratungLoader id={id}>{(b) => <AuswertungView beratung={b} />}</BeratungLoader>;
}
