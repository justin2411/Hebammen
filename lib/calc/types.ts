export type HebammenStatus = 'angestellt' | 'freiberuflich' | 'beleg' | 'kombi';

/**
 * Sub-Profil der Hebamme – Schnellstart-Kategorie mit Berufs-typischen Defaults.
 * Beeinflusst Wizard-Pre-fills, Empfehlungs-Logik und Sub-Profil-spezifische Hinweise.
 */
export type SubProfil =
  | 'klinik'        // Angestellt im Krankenhaus, junges Alter, Fokus BAV + BU
  | 'wochenbett'    // Freiberuflich, kein Geburtshilfe-Risiko, mittleres Einkommen
  | 'geburtshilfe'  // Außerklinische Geburtshilfe, GKV-Zuschlag, hohes BU-Risiko
  | 'beleg'         // Beleghebamme, Kombi-Steuer, HHV-Volatilität
  | 'praxis';       // Eigene Praxis, Equipment, ggf. Schulden aus Gründung

/**
 * Bestehende BU – wenn vorhanden, Konditionen für Lücken-Analyse.
 */
export interface BestehendeBU {
  hat: boolean;
  /** Monatliche BU-Rente in € (0 wenn unbekannt). */
  monatsRente: number;
  /** Vertragsendalter (typisch 65 oder 67). */
  endalter: number;
}

/**
 * Eingabedaten einer Beratung. Spiegelt das JSONB-Schema
 * von beratungen.daten in Supabase wider (Briefing §4 + Phase-2-Erweiterungen).
 */
export interface BeratungDaten {
  // Schnellstart
  subProfil: SubProfil;

  // Persönliches
  alter: number;
  status: HebammenStatus;
  geburtshilfe: boolean;
  monatsbrutto: number;
  verheiratet: boolean;
  kinder: number;
  kinderUeber6: number;

  // Versicherungs-/Vorsorge-Status (Hoch-Prio-Felder)
  /** Pflichtmitglied der Deutschen Rentenversicherung? Beeinflusst Rürup-Höchstbetrag. */
  drvPflicht: boolean;
  /** Bestehender Riester-Vertrag (Bestandsschutz ab 2027). */
  bestehenderRiester: boolean;
  /** Notgroschen in Monatsnettos (Liquide Reserve vor Vorsorge). */
  notgroschenMonate: number;
  /** Bestehende BU mit Konditionen für Lücken-Analyse. */
  bestehendeBU: BestehendeBU;

  // Arbeitsalltag
  kilometer: number;
  homeofficeTage: number;
  fortbildungen: number;
  equipment: number;

  // Status quo (qualitative Flags)
  nutztFoerderungen: boolean;
  steueroptimiert: boolean;
  hatFlexibleVorsorge: boolean;

  // Zukunft
  aktuelleSparrate: number;
  startCapital: number;
  ausstiegsalter: number;

  schemaVersion: number;
}

/**
 * Default-Werte pro Sub-Profil. Pre-filling im Wizard.
 * Werte aus typischen Berufsbildern (Hebammenverbände, HHV-Verteilung).
 */
export const SUB_PROFIL_DEFAULTS: Record<SubProfil, Partial<BeratungDaten>> = {
  klinik: {
    status: 'angestellt',
    geburtshilfe: true,
    monatsbrutto: 3400,
    kilometer: 500,
    homeofficeTage: 5,
    fortbildungen: 300,
    equipment: 100,
    drvPflicht: true,
  },
  wochenbett: {
    status: 'freiberuflich',
    geburtshilfe: false,
    monatsbrutto: 3200,
    kilometer: 8000,
    homeofficeTage: 30,
    fortbildungen: 400,
    equipment: 200,
    drvPflicht: true,
  },
  geburtshilfe: {
    status: 'freiberuflich',
    geburtshilfe: true,
    monatsbrutto: 4500,
    kilometer: 10000,
    homeofficeTage: 40,
    fortbildungen: 600,
    equipment: 800,
    drvPflicht: true,
  },
  beleg: {
    status: 'beleg',
    geburtshilfe: true,
    monatsbrutto: 4000,
    kilometer: 6000,
    homeofficeTage: 20,
    fortbildungen: 500,
    equipment: 400,
    drvPflicht: true,
  },
  praxis: {
    status: 'freiberuflich',
    geburtshilfe: false,
    monatsbrutto: 3800,
    kilometer: 3000,
    homeofficeTage: 60,
    fortbildungen: 700,
    equipment: 1500,
    drvPflicht: true,
  },
};

export const SUB_PROFIL_META: Record<SubProfil, { label: string; sub: string }> = {
  klinik: {
    label: 'Klinik · Angestellt',
    sub: 'Angestellt im Krankenhaus, regelmäßiges Brutto, BAV verfügbar',
  },
  wochenbett: {
    label: 'Wochenbett · Frei',
    sub: 'Freiberuflich ohne Geburtshilfe, viele Hausbesuche',
  },
  geburtshilfe: {
    label: 'Geburtshilfe · Frei',
    sub: 'Außerklinische Geburten, HHV-Stundensatz, GKV-Zuschlag möglich',
  },
  beleg: {
    label: 'Beleghebamme',
    sub: 'Klinik-Belege, Parallelbetreuung, schwankendes Einkommen',
  },
  praxis: {
    label: 'Eigene Praxis',
    sub: 'Praxisräume + Equipment, hohe Betriebsausgaben',
  },
};

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Liefert ein leeres BeratungDaten-Objekt mit sinnvollen Defaults.
 */
export function emptyBeratungDaten(subProfil: SubProfil = 'wochenbett'): BeratungDaten {
  return {
    subProfil,
    alter: 35,
    status: 'freiberuflich',
    geburtshilfe: false,
    monatsbrutto: 3200,
    verheiratet: false,
    kinder: 0,
    kinderUeber6: 0,
    drvPflicht: true,
    bestehenderRiester: false,
    notgroschenMonate: 0,
    bestehendeBU: { hat: false, monatsRente: 0, endalter: 67 },
    kilometer: 0,
    homeofficeTage: 0,
    fortbildungen: 0,
    equipment: 0,
    nutztFoerderungen: false,
    steueroptimiert: false,
    hatFlexibleVorsorge: false,
    aktuelleSparrate: 0,
    startCapital: 0,
    ausstiegsalter: 65,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...SUB_PROFIL_DEFAULTS[subProfil],
  };
}
