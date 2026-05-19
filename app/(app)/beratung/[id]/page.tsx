import { BeratungLoader } from '@/components/results/BeratungLoader';
import { AuswertungView } from '@/components/results/AuswertungView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BeratungPage({ params }: PageProps) {
  const { id } = await params;
  return <BeratungLoader id={id}>{(b) => <AuswertungView beratung={b} />}</BeratungLoader>;
}
