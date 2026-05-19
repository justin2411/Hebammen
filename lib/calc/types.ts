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

/** Steuerklasse 1–6 nach EStG. */
export type Steuerklasse = 1 | 2 | 3 | 4 | 5 | 6;

/** Art der Krankenversicherung – beeinflusst Krankengeld/-tagegeld. */
export type KvArt = 'gkv_pflicht' | 'gkv_freiwillig' | 'gkv_wahltarif' | 'pkv';

/** Art einer bestehenden Altersvorsorge-Position. */
export type VorsorgeArt =
  | 'drv'
  | 'rürup'
  | 'riester'
  | 'bav'
  | 'avd'
  | 'etf'
  | 'nettopolice'
  | 'sonstiges';

/** Ein konkreter bestehender Vorsorge-Vertrag mit seinem Beitrag zur monatlichen Rente. */
export interface BestehendeVorsorge {
  id: string;
  art: VorsorgeArt;
  label: string;
  /** Erwartete monatliche Brutto-Rente aus diesem Vertrag. */
  monatsRente: number;
  /** Aktuelle monatliche Einzahlung (für Zinseszins-Hochrechnung). */
  monatsSparrate?: number;
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

  // Schema-v3: Einkommenssicherung
  /** Lohnsteuerklasse. Default: 1 (ledig). */
  steuerklasse: Steuerklasse;
  /** Kirchensteuerpflichtig (8 % BW/BY, sonst 9 %). */
  kirchensteuer: boolean;
  /** Art der Krankenversicherung — entscheidend für Krankengeld. */
  kvArt: KvArt;
  /**
   * Monatliches Krankentagegeld (PKV) oder freiwilliges GKV-Wahltarif-Krankengeld.
   * 0 wenn nicht abgeschlossen / nicht relevant. Greift nach Phase 1 (6 Wo Lohnfortzahlung).
   */
  krankentagegeld: number;
  /**
   * Restleistungsvermögen-Annahme im BU-Szenario (Stunden pro Tag).
   * § 43 SGB VI: ≥ 6h = keine EM, 3–6h = halbe EM, < 3h = volle EM.
   * Default für UI: 3 (mittleres Szenario).
   */
  restleistungsvermoegen: number;

  // Schema-v4: AV-Rechner
  /**
   * Versorgungsziel im Alter — gewünschtes monatliches Netto.
   * Default: 70 % vom aktuellen Netto.
   */
  versorgungszielNetto: number;
  /** Lebenserwartung in Jahren (DRV-Schnitt Frauen: 89). */
  lebenserwartung: number;
  /** Rentensteigerung p.a. (typisch 0,01–0,02). */
  rentensteigerungProJahr: number;
  /** Rendite Ansparphase p.a. (Default 0,06). */
  renditeAnsparphase: number;
  /** Rendite Entnahmephase p.a. (Default 0,02 — konservativer im Alter). */
  renditeEntnahmephase: number;
  /**
   * Liste bestehender Vorsorge-Verträge mit jeweils erwarteter monatlicher Rente.
   * Erste DRV-Position wird beim Migrieren automatisch erstellt.
   */
  bestehendeVorsorgen: BestehendeVorsorge[];
  /** Berufseintrittsalter — für DRV-Renten-Schätzung (Jahre der Beitragszahlung). */
  berufseintrittsalter: number;

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

export const CURRENT_SCHEMA_VERSION = 4;

/** Default-Werte für die neuen Schema-v3-Felder (für Migration v2 → v3). */
export const EINKOMMENSSICHERUNG_DEFAULTS = {
  steuerklasse: 1 as Steuerklasse,
  kirchensteuer: false,
  kvArt: 'gkv_pflicht' as KvArt,
  krankentagegeld: 0,
  restleistungsvermoegen: 3,
} as const;

/** Default-Werte für Schema-v4-Felder (AV-Rechner). */
export const AV_RECHNER_DEFAULTS = {
  versorgungszielNetto: 0, // wird in migrateBeratungDaten dynamisch gesetzt
  lebenserwartung: 89,
  rentensteigerungProJahr: 0.01,
  renditeAnsparphase: 0.06,
  renditeEntnahmephase: 0.02,
  bestehendeVorsorgen: [] as BestehendeVorsorge[],
  berufseintrittsalter: 22,
} as const;

/**
 * Migriert alte Beratungs-Daten auf die aktuelle Schema-Version.
 * Wird beim Laden aus LocalStorage aufgerufen.
 */
export function migrateBeratungDaten(daten: Partial<BeratungDaten>): BeratungDaten {
  const merged = { ...daten } as BeratungDaten;

  if (!merged.schemaVersion || merged.schemaVersion < 3) {
    Object.assign(merged, {
      ...EINKOMMENSSICHERUNG_DEFAULTS,
      // verheiratet → Steuerklasse 4 als Default (Splitting), sonst 1
      steuerklasse: daten.verheiratet ? 4 : 1,
      schemaVersion: 3,
    });
  }

  if (merged.schemaVersion < 4) {
    // Versorgungsziel ≈ 70 % vom geschätzten Netto (Netto ≈ Brutto × 0,65)
    const geschaetztesNetto = Math.round((merged.monatsbrutto ?? 3200) * 0.65);
    Object.assign(merged, {
      ...AV_RECHNER_DEFAULTS,
      versorgungszielNetto: Math.round(geschaetztesNetto * 0.7),
      schemaVersion: 4,
    });
  }

  return merged;
}

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
    ...EINKOMMENSSICHERUNG_DEFAULTS,
    ...AV_RECHNER_DEFAULTS,
    versorgungszielNetto: Math.round((SUB_PROFIL_DEFAULTS[subProfil].monatsbrutto ?? 3200) * 0.65 * 0.7),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...SUB_PROFIL_DEFAULTS[subProfil],
  };
}
