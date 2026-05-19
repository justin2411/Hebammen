import {
  SV_BEITRAGE_2026,
  LOHNSTEUER_2026,
  KIRCHENSTEUER,
} from '@/config/sozialversicherung';
import { STEUERN_2026 } from '@/config/steuern';
import type { BeratungDaten, Steuerklasse, KvArt } from './types';

export interface NettoInput {
  monatsbrutto: number;
  steuerklasse: Steuerklasse;
  kirchensteuer: boolean;
  /** Bundesland für Kirchensteuersatz (BW/BY: 8 %, sonst 9 %). */
  bundesland?: 'BY' | 'BW' | 'andere';
  kvArt: KvArt;
  kinder: number;
  /** Alter — für Pflegeversicherungs-Zuschlag Kinderlose (≥ 23 Jahre). */
  alter: number;
}

export interface NettoResult {
  brutto: number;
  /** Lohnsteuer p.M. (vereinfacht über Stufentarif). */
  lohnsteuer: number;
  kirchensteuer: number;
  solidaritaetszuschlag: number;
  sozialversicherungAn: number;
  /** Detaillierte SV-Anteile. */
  svDetail: {
    kv: number;
    pv: number;
    rv: number;
    av: number;
  };
  netto: number;
  nettoQuote: number;
}

/**
 * Schätzt den Netto-Lohn aus dem Brutto.
 *
 * Vereinfachung: nutzt die Stufentarif-Schätzung aus config/steuern (kein §32a-Formel).
 * Für die Vorsorge-Beratung präzise genug — die Realität auf den Cent kommt vom
 * Steuerberater bzw. dem konkreten ELStAM-Datensatz.
 *
 * Pure Funktion, keine Side-Effects.
 */
export function calcNetto(input: NettoInput): NettoResult {
  const jahresBrutto = input.monatsbrutto * 12;

  // --- Sozialversicherung (nur bei GKV-pflichtig / freiwillig) -------------
  const istGkv =
    input.kvArt === 'gkv_pflicht' ||
    input.kvArt === 'gkv_freiwillig' ||
    input.kvArt === 'gkv_wahltarif';

  // Beitragsbemessungsgrenzen anwenden
  const bruttoKvBemessen = Math.min(input.monatsbrutto, SV_BEITRAGE_2026.bbgKv);
  const bruttoRvBemessen = Math.min(input.monatsbrutto, SV_BEITRAGE_2026.bbgRv);

  const kvSatz =
    SV_BEITRAGE_2026.krankenversicherung.basis +
    SV_BEITRAGE_2026.krankenversicherung.zusatzbeitragDurchschnitt;

  // Pflegeversicherung: Basis + Kinderloszuschlag − Abschlag je Kind ab 2.
  const pvKinderlosZuschlag =
    input.kinder === 0 && input.alter >= 23
      ? SV_BEITRAGE_2026.pflegeversicherung.zuschlagKinderlos
      : 0;
  const pvKinderabschlag = Math.max(
    0,
    Math.min(input.kinder - 1, 4) * SV_BEITRAGE_2026.pflegeversicherung.abschlagJeKind,
  );
  const pvSatz = Math.max(
    0,
    SV_BEITRAGE_2026.pflegeversicherung.basis + pvKinderlosZuschlag - pvKinderabschlag,
  );

  const kv = istGkv ? Math.round(bruttoKvBemessen * kvSatz * 100) / 100 : 0;
  const pv = istGkv ? Math.round(bruttoKvBemessen * pvSatz * 100) / 100 : 0;
  const rv = Math.round(bruttoRvBemessen * SV_BEITRAGE_2026.rentenversicherung * 100) / 100;
  const av =
    Math.round(bruttoRvBemessen * SV_BEITRAGE_2026.arbeitslosenversicherung * 100) / 100;

  const sozialversicherungAn = kv + pv + rv + av;

  // --- Steuer (vereinfacht) ----------------------------------------------
  // Bei Verheirateten (Klasse 3/4): Splitting → zvE / 2 für Grenzsteuersatz
  const splittingFaktor = input.steuerklasse === 3 || input.steuerklasse === 4 ? 0.5 : 1;
  const zvE = Math.max(
    0,
    (jahresBrutto - sozialversicherungAn * 12 - LOHNSTEUER_2026.grundfreibetrag) *
      splittingFaktor,
  );

  // Stufentarif aus config/steuern anwenden, dann zurück skalieren
  const grenzsatz = grenzSteuersatzAus(zvE);
  const estJahr =
    durchschnittsSteuerAus(zvE) / splittingFaktor;
  const lohnsteuer = Math.max(0, estJahr / 12);

  // Kirchensteuer: 8 % BW/BY, 9 % sonst
  const kiSatz =
    input.bundesland === 'BY' || input.bundesland === 'BW'
      ? KIRCHENSTEUER.bayern
      : KIRCHENSTEUER.rest;
  const kirchensteuer = input.kirchensteuer ? lohnsteuer * kiSatz : 0;

  // Solidaritätszuschlag (sehr vereinfacht — Freigrenze)
  const solidaritaetszuschlag =
    zvE > LOHNSTEUER_2026.solidaritaetsfreigrenze
      ? (lohnsteuer * LOHNSTEUER_2026.solidaritaetssatz)
      : 0;

  const netto =
    input.monatsbrutto -
    sozialversicherungAn -
    lohnsteuer -
    kirchensteuer -
    solidaritaetszuschlag;

  return {
    brutto: input.monatsbrutto,
    lohnsteuer: Math.round(lohnsteuer * 100) / 100,
    kirchensteuer: Math.round(kirchensteuer * 100) / 100,
    solidaritaetszuschlag: Math.round(solidaritaetszuschlag * 100) / 100,
    sozialversicherungAn: Math.round(sozialversicherungAn * 100) / 100,
    svDetail: { kv, pv, rv, av },
    netto: Math.round(netto * 100) / 100,
    nettoQuote: input.monatsbrutto > 0 ? netto / input.monatsbrutto : 0,
    // grenzsatz wird intern genutzt, derzeit nicht exportiert
    ...{ _grenzsatz: grenzsatz },
  } as NettoResult;
}

/** Vereinfachte Durchschnittssteuer aus Stufentarif. */
function durchschnittsSteuerAus(zvE: number): number {
  if (zvE <= 0) return 0;
  let restzvE = zvE;
  let steuer = 0;
  let untergrenze = 0;
  for (const stufe of STEUERN_2026.grenzsteuerStufen) {
    const stufenHoehe = stufe.bis - untergrenze;
    if (restzvE <= stufenHoehe) {
      steuer += restzvE * stufe.satz;
      return steuer;
    }
    steuer += stufenHoehe * stufe.satz;
    restzvE -= stufenHoehe;
    untergrenze = stufe.bis;
  }
  return steuer;
}

function grenzSteuersatzAus(zvE: number): number {
  for (const stufe of STEUERN_2026.grenzsteuerStufen) {
    if (zvE <= stufe.bis) return stufe.satz;
  }
  return STEUERN_2026.grenzsteuerStufen.at(-1)!.satz;
}

export function nettoInputFromBeratung(daten: BeratungDaten): NettoInput {
  return {
    monatsbrutto: daten.monatsbrutto,
    steuerklasse: daten.steuerklasse,
    kirchensteuer: daten.kirchensteuer,
    kvArt: daten.kvArt,
    kinder: daten.kinder,
    alter: daten.alter,
  };
}
