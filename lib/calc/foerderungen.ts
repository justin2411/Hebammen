import { AVD_2027 } from '@/config/avd';
import { FOERDERUNGEN_2026 } from '@/config/foerderungen';
import type { BeratungDaten } from './types';

export interface FoerderInput {
  alter: number;
  status: BeratungDaten['status'];
  geburtshilfe: boolean;
  kinder: number;
  kinderUeber6: number;
  monatsbrutto: number;
}

export interface FoerderResult {
  avd: {
    grundzulage: number;
    kinderzulage: number;
    berufseinsteigerBonus: number;
    summe: number;
    empfohlenerEigenbeitrag: number;
  };
  bav: {
    sozialversicherungsErsparnis: number;
    klinikzuschuss: number;
    summe: number;
  };
  vl: {
    arbeitgeberzuschuss: number;
  };
  gkvSicherstellungszuschlag: number;
  /** Summe aller jährlichen Förderungen (€). */
  gesamtProJahr: number;
}

/**
 * Berechnet die maximalen jährlichen AVD-Zulagen.
 *
 * Annahme: Hebamme schöpft den förderoptimalen Eigenbeitrag aus
 * (Grundzulage 540 €, also 360 € + 1.440 € × 0,25 = 1.800 € Eigenbeitrag).
 * Plus 300 € Eigenbeitrag pro Kind für die Kinderzulage.
 */
export function calcAvd(input: Pick<FoerderInput, 'alter' | 'kinder'>) {
  const grundzulage = AVD_2027.grundzulage.maxZulage;
  const kinderzulage = input.kinder * AVD_2027.kinderzulage.proKind;
  const berufseinsteigerBonus =
    input.alter <= AVD_2027.berufseinsteigerBonus.alterMax
      ? AVD_2027.berufseinsteigerBonus.betrag
      : 0;

  const empfohlenerEigenbeitrag =
    AVD_2027.grundzulage.stufe2.bis +
    input.kinder * AVD_2027.kinderzulage.erforderlicherEigenbeitragProKind;

  return {
    grundzulage,
    kinderzulage,
    berufseinsteigerBonus,
    summe: grundzulage + kinderzulage + berufseinsteigerBonus,
    empfohlenerEigenbeitrag,
  };
}

/**
 * Schätzt die jährliche Fördersumme aus allen Bausteinen.
 *
 * Vereinfachungen:
 * - BAV-SV-Ersparnis ≈ angenommener BAV-Beitrag × 20 % SV-Anteil.
 * - Klinikzuschuss als typischer Wert (15 % AG-Anteil) – tatsächlich kennen
 *   wir den Arbeitgeber nicht. Klar als "Schätzung" zu kennzeichnen im UI.
 */
export function calcFoerderungen(input: FoerderInput): FoerderResult {
  const istAngestellt = input.status === 'angestellt' || input.status === 'kombi';

  const avd = calcAvd(input);

  const bavBeitragMax = input.monatsbrutto * 12 * FOERDERUNGEN_2026.bav.sozialversicherungsfrei;
  const bav = istAngestellt
    ? {
        sozialversicherungsErsparnis: Math.round(bavBeitragMax * 0.20),
        klinikzuschuss: Math.round(bavBeitragMax * FOERDERUNGEN_2026.bav.klinikzuschussTypisch),
        summe: 0,
      }
    : { sozialversicherungsErsparnis: 0, klinikzuschuss: 0, summe: 0 };
  bav.summe = bav.sozialversicherungsErsparnis + bav.klinikzuschuss;

  const vl = istAngestellt
    ? { arbeitgeberzuschuss: FOERDERUNGEN_2026.vl.maxArbeitgeberzuschussProMonat * 12 }
    : { arbeitgeberzuschuss: 0 };

  // GKV-Sicherstellungszuschlag: nur bei Geburtshilfe-Tätigkeit.
  // Konservativ: 10 Geburten/Jahr × 700 € als Hausnummer.
  const gkvSicherstellungszuschlag = input.geburtshilfe
    ? FOERDERUNGEN_2026.gkvSicherstellungszuschlag.proGeburtsfall * 10
    : 0;

  const gesamtProJahr =
    avd.summe + bav.summe + vl.arbeitgeberzuschuss + gkvSicherstellungszuschlag;

  return {
    avd,
    bav,
    vl,
    gkvSicherstellungszuschlag,
    gesamtProJahr: Math.round(gesamtProJahr),
  };
}
