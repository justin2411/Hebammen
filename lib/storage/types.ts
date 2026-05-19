import type { BeratungDaten } from '@/lib/calc/types';

export interface Beratung {
  id: string;
  hebammeName: string;
  hebammeEmail?: string;
  datum: string;
  status: 'aktiv' | 'archiviert';
  daten: BeratungDaten;
  notizen: Record<string, string>;
  empfehlungenGewaehlt: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BeratungAdapter {
  list(): Promise<Beratung[]>;
  get(id: string): Promise<Beratung | null>;
  create(input: Omit<Beratung, 'id' | 'createdAt' | 'updatedAt'>): Promise<Beratung>;
  update(id: string, patch: Partial<Omit<Beratung, 'id' | 'createdAt'>>): Promise<Beratung>;
  remove(id: string): Promise<void>;
}
