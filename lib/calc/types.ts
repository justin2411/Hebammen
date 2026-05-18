export type HebammenStatus = 'angestellt' | 'freiberuflich' | 'beleg' | 'kombi';

/**
 * Eingabedaten einer Beratung. Spiegelt das JSONB-Schema
 * von beratungen.daten in Supabase wider (Briefing §4).
 */
export interface BeratungDaten {
  // Persönliches
  alter: number;
  status: HebammenStatus;
  geburtshilfe: boolean;
  monatsbrutto: number;
  verheiratet: boolean;
  kinder: number;
  kinderUeber6: number;

  // Arbeitsalltag
  kilometer: number;
  homeofficeTage: number;
  fortbildungen: number;
  equipment: number;

  // Status quo
  hatBU: boolean;
  nutztFoerderungen: boolean;
  steueroptimiert: boolean;
  hatFlexibleVorsorge: boolean;

  // Zukunft
  aktuelleSparrate: number;
  startCapital: number;
  ausstiegsalter: number;

  schemaVersion: number;
}
