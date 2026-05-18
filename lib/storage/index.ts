import { localStorageAdapter } from './localStorage';
import type { BeratungAdapter } from './types';

/**
 * Aktiver Storage-Adapter.
 * Phase 1: LocalStorage. Phase 2: Supabase (Auth nötig).
 */
export const storage: BeratungAdapter = localStorageAdapter;

export type { Beratung } from './types';
