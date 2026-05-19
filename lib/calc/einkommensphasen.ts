import {
  ENTGELTFORTZAHLUNG,
  KRANKENGELD,
  EM_RENTE_FAKTOREN,
} from '@/config/sozialversicherung';
import { calcNetto } from './netto';
import type { BeratungDaten } from './types';
import { nettoInputFromBeratung } from './netto';

export type Phase = 'lohnfortzahlung' | 'krankengeld' | 'em_rente';

export interface EinkommensPhase {
  id: Phase;
  label: string;
  /** Dauer in Wochen (oder null = unbefristet bis Rente). */
  wochen: number | null;
  /** Brutto-Auszahlung pro Monat in dieser Phase. */
  bruttoProMonat: number;
  /** Netto-Auszahlung pro Monat in dieser Phase. */
  nettoProMonat: number;
  /** Lücke zum bisherigen Netto. */
  versorgungsluecke: number;
  /** Erklärtext für die UI. */
  erklaerung: string;
}

export interface EinkommensPhasenResult {
  /** Bisheriges Netto (Referenz). */
  nettoReferenz: number;
  /** Bisheriges Brutto. */
  bruttoReferenz: number;
  phasen: EinkommensPhase[];
  /**
   * Kumulativer Verlust über die Restberufszeit bei voll-/halb-BU
   * (Differenz Netto-Referenz zur EM-Rente × Monate bis Renteneintritt).
   */
  verlustBisRente: number;
  /**
   * Anzahl Monate bis Renteneintritt (für Verlust-Hochrechnung).
   */
  monateBisRente: number;
  /**
   * Erwerbsminderungs-Grad basierend auf Restleistungsvermögen.
   */
  emGrad: 'voll' | 'halb' | 'keine';
}

/**
 * Berechnet die Drei-Phasen-Einkommenssicherung bei längerer Krankheit/BU.
 *
 * Phasen (für Angestellte mit GKV):
 *   1. Lohnfortzahlung (6 Wo, 100 % Brutto = volles Netto)
 *   2. Krankengeld (max 72 Wo, min(70 % Brutto, 90 % Netto) − SV)
 *   3. Erwerbsminderungsrente bzw. BU-Eintritt
 *
 * Für PKV: Phase 2 wird zu Krankentagegeld (Vertragsleistung, Inputfeld).
 * Für Freiberufliche ohne Krankengeld-Wahltarif: Phase 2 entfällt komplett.
 *
 * Rechtsgrundlagen:
 *   - §3 EFZG: 6 Wochen Lohnfortzahlung
 *   - §47 SGB V: Krankengeld 70 % Brutto / 90 % Netto Cap
 *   - §43 SGB VI: Erwerbsminderungsrente
 */
export function calcEinkommensPhasen(daten: BeratungDaten): EinkommensPhasenResult {
  const netto = calcNetto(nettoInputFromBeratung(daten));
  const nettoReferenz = netto.netto;
  const bruttoReferenz = daten.monatsbrutto;

  // EM-Grad aus Restleistungsvermögen herleiten
  const emGrad: EinkommensPhasenResult['emGrad'] =
    daten.restleistungsvermoegen < 3
      ? 'voll'
      : daten.restleistungsvermoegen < 6
        ? 'halb'
        : 'keine';

  const emFaktor =
    emGrad === 'voll'
      ? EM_RENTE_FAKTOREN.voll
      : emGrad === 'halb'
        ? EM_RENTE_FAKTOREN.halb
        : EM_RENTE_FAKTOREN.keine;

  const phasen: EinkommensPhase[] = [];

  // ---- Phase 1: Lohnfortzahlung -------------------------------------------
  // Gilt nur bei Angestellten (kein Lohn-Anspruch bei Freiberuflichen).
  const istAngestellt = daten.status === 'angestellt' || daten.status === 'kombi';
  if (istAngestellt) {
    phasen.push({
      id: 'lohnfortzahlung',
      label: '6 Wochen Lohnfortzahlung',
      wochen: ENTGELTFORTZAHLUNG.wochen,
      bruttoProMonat: bruttoReferenz,
      nettoProMonat: nettoReferenz,
      versorgungsluecke: 0,
      erklaerung:
        'Volle Lohnfortzahlung durch den Arbeitgeber für 6 Wochen — §3 EFZG. Keine Lücke.',
    });
  } else {
    // Bei Freiberuflichen: gar keine Lohnfortzahlung — die Lücke ist sofort 100 %
    phasen.push({
      id: 'lohnfortzahlung',
      label: 'Sofort ab Tag 1 (keine Lohnfortzahlung)',
      wochen: 0,
      bruttoProMonat: 0,
      nettoProMonat: 0,
      versorgungsluecke: nettoReferenz,
      erklaerung:
        'Als Freiberuflerin gibt es keine 6 Wochen Lohnfortzahlung — ab Tag 1 fehlt das volle Einkommen.',
    });
  }

  // ---- Phase 2: Krankengeld / Krankentagegeld -----------------------------
  if (
    daten.kvArt === 'gkv_pflicht' ||
    daten.kvArt === 'gkv_freiwillig' ||
    daten.kvArt === 'gkv_wahltarif'
  ) {
    // GKV-Krankengeld berechnen
    const krankengeldBrutto = bruttoReferenz * KRANKENGELD.prozentBrutto;
    const krankengeldNettoCap = nettoReferenz * KRANKENGELD.prozentNettoCap;
    const krankengeldAuszahlung = Math.min(krankengeldBrutto, krankengeldNettoCap);
    // Davon noch RV/AV/PV abziehen (KV trägt die Kasse)
    const krankengeldNetto = krankengeldAuszahlung * (1 - KRANKENGELD.svAbzug);

    // Bei freiwilliger GKV ohne Wahltarif: kein Anspruch
    if (daten.status !== 'angestellt' && daten.kvArt === 'gkv_freiwillig') {
      phasen.push({
        id: 'krankengeld',
        label: 'Krankengeld (nicht abgeschlossen)',
        wochen: 0,
        bruttoProMonat: 0,
        nettoProMonat: 0,
        versorgungsluecke: nettoReferenz,
        erklaerung:
          'Als Freiberuflerin in freiwilliger GKV ohne Wahltarif gibt es kein Krankengeld. Empfehlung: Wahltarif abschließen oder PKV-Krankentagegeld.',
      });
    } else {
      phasen.push({
        id: 'krankengeld',
        label: 'Max. 72 Wochen Krankengeld',
        wochen: KRANKENGELD.wochen,
        bruttoProMonat: Math.round(krankengeldAuszahlung),
        nettoProMonat: Math.round(krankengeldNetto),
        versorgungsluecke: Math.round(nettoReferenz - krankengeldNetto),
        erklaerung:
          'Max. 70 % vom Brutto oder 90 % vom Netto (was niedriger ist), abzüglich SV-Beiträge. Für maximal 72 Wochen innerhalb 3 Jahren wegen derselben Krankheit.',
      });
    }
  } else if (daten.kvArt === 'pkv') {
    // PKV: nur falls Krankentagegeld abgeschlossen
    if (daten.krankentagegeld > 0) {
      const ktgMonatlich = daten.krankentagegeld;
      phasen.push({
        id: 'krankengeld',
        label: 'Krankentagegeld (PKV)',
        wochen: null, // vertragsabhängig
        bruttoProMonat: ktgMonatlich,
        nettoProMonat: ktgMonatlich, // KTG ist steuer- und SV-frei
        versorgungsluecke: Math.max(0, Math.round(nettoReferenz - ktgMonatlich)),
        erklaerung:
          'Krankentagegeld aus deinem PKV-Vertrag. Steuer- und SV-frei. Höhe + Karenzzeit + Dauer richten sich nach Vertrag.',
      });
    } else {
      phasen.push({
        id: 'krankengeld',
        label: 'Kein Krankentagegeld vereinbart',
        wochen: 0,
        bruttoProMonat: 0,
        nettoProMonat: 0,
        versorgungsluecke: nettoReferenz,
        erklaerung:
          'PKV ohne Krankentagegeld-Baustein: nach Lohnfortzahlung gibt es keine laufende Leistung. Dringend nachholen.',
      });
    }
  }

  // ---- Phase 3: Erwerbsminderungsrente ------------------------------------
  const emRenteBrutto = bruttoReferenz * emFaktor;
  // EM-Rente wird besteuert (Ertragsanteil), aber SV-frei (Rentner-KV nur ermäßigt)
  // Vereinfachung: 90 % vom Brutto als Netto-Schätzwert
  const emRenteNetto = emRenteBrutto * 0.9;

  const emLabel =
    emGrad === 'voll'
      ? 'Volle Erwerbsminderungsrente'
      : emGrad === 'halb'
        ? 'Halbe Erwerbsminderungsrente'
        : 'Keine Erwerbsminderungsrente';

  const emErklaerung =
    emGrad === 'voll'
      ? '< 3 h Restleistungsvermögen pro Tag = volle EM, gesetzlich 34 % vom Brutto.'
      : emGrad === 'halb'
        ? '3–6 h Restleistungsvermögen = halbe EM, gesetzlich 17 % vom Brutto. Du wirst auf den Markt verwiesen — heißt: du musst irgendwas anderes machen können.'
        : '≥ 6 h Restleistungsvermögen = kein Anspruch. Erwerbsminderungsrente fällt komplett weg.';

  phasen.push({
    id: 'em_rente',
    label: emLabel,
    wochen: null,
    bruttoProMonat: Math.round(emRenteBrutto),
    nettoProMonat: Math.round(emRenteNetto),
    versorgungsluecke: Math.round(nettoReferenz - emRenteNetto),
    erklaerung: emErklaerung,
  });

  // ---- Verlust bis Renteneintritt -----------------------------------------
  // Nehmen wir an, der EM-Fall tritt mit BU-Alter (50, Stresstest) oder
  // aktuellem Alter ein. Hier: Verlust = (Netto − EM-Netto) × Monate bis 67.
  const renteneintritt = 67;
  const monateBisRente = Math.max(0, (renteneintritt - daten.alter) * 12);
  const verlustBisRente = Math.max(0, (nettoReferenz - emRenteNetto) * monateBisRente);

  return {
    nettoReferenz,
    bruttoReferenz,
    phasen,
    verlustBisRente: Math.round(verlustBisRente),
    monateBisRente,
    emGrad,
  };
}
