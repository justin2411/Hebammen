'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { storage, type Beratung } from '@/lib/storage';

interface Props {
  id: string;
  children: (beratung: Beratung) => ReactNode;
}

/**
 * Lädt eine Beratung aus dem aktiven Storage und reicht sie an children weiter.
 * Behandelt Loading + Not-Found-State.
 */
export function BeratungLoader({ id, children }: Props) {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'loaded'; beratung: Beratung } | { status: 'missing' }>({
    status: 'loading',
  });

  useEffect(() => {
    storage.get(id).then((b) => {
      setState(b ? { status: 'loaded', beratung: b } : { status: 'missing' });
    });
  }, [id]);

  if (state.status === 'loading') {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center text-muted">Lade …</main>
    );
  }
  if (state.status === 'missing') {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-berry">Beratung nicht gefunden</h1>
        <p className="mt-2 text-muted">
          Diese Beratung gibt es nicht (mehr). Sie war evtl. nur lokal gespeichert.
        </p>
      </main>
    );
  }
  return <>{children(state.beratung)}</>;
}
