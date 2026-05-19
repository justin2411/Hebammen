/**
 * Hand-gepflegte Datenbank-Types.
 * In Phase 2 ersetzen durch `supabase gen types typescript --linked`.
 */
import type { BeratungDaten } from '@/lib/calc/types';

export interface BeratungRow {
  id: string;
  berater_id: string;
  hebamme_name: string;
  hebamme_email: string | null;
  datum: string;
  status: 'aktiv' | 'archiviert';
  daten: BeratungDaten;
  notizen: Record<string, string>;
  empfehlungen_gewaehlt: string[];
  created_at: string;
  updated_at: string;
}

export interface ParameterLogRow {
  id: string;
  parameter_typ: string;
  alter_wert: unknown;
  neuer_wert: unknown;
  geaendert_von: string | null;
  begruendung: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      beratungen: {
        Row: BeratungRow;
        Insert: Omit<BeratungRow, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<BeratungRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<BeratungRow>;
      };
      parameter_log: {
        Row: ParameterLogRow;
        Insert: Omit<ParameterLogRow, 'id' | 'created_at'> &
          Partial<Pick<ParameterLogRow, 'id' | 'created_at'>>;
        Update: Partial<ParameterLogRow>;
      };
    };
  };
}
