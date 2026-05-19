import { RENTE_2026 } from '@/config/rente';
import { computeWealth } from './altersvorsorge';
import type { BeratungDaten, BestehendeVorsorge } from './types';

const RENTENEINTRITT = 67;

/**
 * Schätzt die gesetzliche DRV-Brutto-Rente für eine Hebamme.
 *
 * Vereinfachte Formel (capital-flow-Stil):
 *   Entgeltpunkte/Jahr ≈ Brutto / Durchschnittsentgelt
 *   Gesamtpunkte = Punkte/Jahr × Beitragsjahre
 *   Monatsrente Brutto = Gesamtpunkte × aktueller Rentenwert
 *
 * Beitragsjahre = (Renteneintritt − Berufseintrittsalter), maximal 47.
 * Hebammen sind als Pflegende pflichtversichert.
 *
 * Pure Funktion. Keine §32a-Punkte-Bonus-Tricks — für die echte Zahl
 * gilt der DRV-Rentenbescheid.
 */
export function calcGesetzlicheRente(daten: BeratungDaten): {
  brutto: number;
  beitragsjahre: number;
  entgeltpunkte: number;
} {
  if (!daten.drvPflicht) {
    return { brutto: 0, beitragsjahre: 0, entgeltpunkte: 0 };
  }

  const jahresBrutto = daten.monatsbrutto * 12;
  const punkteProJahr = Math.min(
    2,
    jahresBrutto / RENTE_2026.durchschnittsentgeltJahr,
  );
  const beitragsjahre = Math.max(
    0,
    Math.min(47, RENTENEINTRITT - daten.berufseintrittsalter),
  );
  const entgeltpunkte = punkteProJahr * beitragsjahre;
  const monatsbrutto = entgeltpunkte * RENTE_2026.rentenwertWest;

  return {
    brutto: Math.round(monatsbrutto),
    beitragsjahre: Math.round(beitragsjahre),
    entgeltpunkte: Math.round(entgeltpunkte * 100) / 100,
  };
}

/** Schätzt das Netto aus einer Brutto-Rente (vereinfacht: 12 % KV/PV/Steuer-Abzug). */
function renteBruttoZuNetto(brutto: number, mitKvdr: boolean): number {
  // KVdR: 50% KV/PV-Beitragssatz, sonst voll
  const kvSatz = mitKvdr ? 0.08 : 0.15;
  // Steueranteil EM/Alters-Rente: vereinfacht 5 % bis 10 %
  const steuer = 0.05;
  return Math.round(brutto * (1 - kvSatz - steuer));
}

export interface VersorgungsZielResult {
  zielNetto: number;
  zielMitInflation: number;
  erwarteteGesamtrenteBrutto: number;
  erwarteteGesamtrenteNetto: number;
  versorgungsluecke: number;
  jahreBisRente: number;
  gesetzlicheRente: ReturnType<typeof calcGesetzlicheRente>;
  positionen: Array<{ label: string; bruttoMonat: number; nettoMonat: number }>;
}

/**
 * Berechnet die Versorgungslücke im Alter:
 *  Ziel × (1 + Inflation)^Jahre  vs.  (gesetzliche Rente + bestehende Verträge)
 */
export function calcVersorgungsziel(
  daten: BeratungDaten,
  mitKvdr = true,
): VersorgungsZielResult {
  const jahre = Math.max(0, RENTENEINTRITT - daten.alter);
  const inflation = 0.02; // gleich wie altersvorsorge.ts Default

  // 1. Gesetzliche Rente
  const gesetzlich = calcGesetzlicheRente(daten);
  const gesetzlichNetto = renteBruttoZuNetto(gesetzlich.brutto, mitKvdr);

  // 2. Bestehende Verträge — monatsRente ist bereits brutto
  const bestehendBrutto = daten.bestehendeVorsorgen.reduce(
    (sum, v) => sum + (v.monatsRente ?? 0),
    0,
  );
  const bestehendNetto = renteBruttoZuNetto(bestehendBrutto, mitKvdr);

  // 3. Mit Rentensteigerung bis Renteneintritt hochrechnen
  const steigerungsfaktor = Math.pow(1 + daten.rentensteigerungProJahr, jahre);
  const gesetzlichSpaeterNetto = Math.round(gesetzlichNetto * steigerungsfaktor);
  const bestehendSpaeterNetto = Math.round(bestehendNetto * steigerungsfaktor);
  const gesamtNetto = gesetzlichSpaeterNetto + bestehendSpaeterNetto;
  const gesamtBrutto = Math.round((gesetzlich.brutto + bestehendBrutto) * steigerungsfaktor);

  // 4. Ziel mit Inflation
  const zielMitInflation = Math.round(
    daten.versorgungszielNetto * Math.pow(1 + inflation, jahre),
  );

  const versorgungsluecke = Math.max(0, zielMitInflation - gesamtNetto);

  return {
    zielNetto: daten.versorgungszielNetto,
    zielMitInflation,
    erwarteteGesamtrenteBrutto: gesamtBrutto,
    erwarteteGesamtrenteNetto: gesamtNetto,
    versorgungsluecke,
    jahreBisRente: jahre,
    gesetzlicheRente: gesetzlich,
    positionen: [
      {
        label: 'Gesetzliche Rente',
        bruttoMonat: Math.round(gesetzlich.brutto * steigerungsfaktor),
        nettoMonat: gesetzlichSpaeterNetto,
      },
      ...daten.bestehendeVorsorgen.map((v) => ({
        label: v.label || v.art,
        bruttoMonat: Math.round(v.monatsRente * steigerungsfaktor),
        nettoMonat: renteBruttoZuNetto(
          Math.round(v.monatsRente * steigerungsfaktor),
          mitKvdr,
        ),
      })),
    ],
  };
}

/**
 * Benötigtes Kapital bei Renteneintritt, damit die Lücke über die
 * Entnahmezeit (= Lebenserwartung − Renteneintritt) gedeckt ist.
 *
 * Annuitätenrechnung mit Restrendite: PV = PMT × (1 - (1+r)^-n) / r
 */
export function calcBenoetigtesKapital(
  monatlicheLuecke: number,
  entnahmejahre: number,
  renditeEntnahmephase: number,
): number {
  if (monatlicheLuecke <= 0 || entnahmejahre <= 0) return 0;
  const r = renditeEntnahmephase / 12;
  const n = entnahmejahre * 12;
  if (r === 0) return Math.round(monatlicheLuecke * n);
  const pv = monatlicheLuecke * ((1 - Math.pow(1 + r, -n)) / r);
  return Math.round(pv);
}

/**
 * Sparrate, um in `jahre` Jahren das Zielkapital zu erreichen.
 * PMT = FV × r / ((1+r)^n − 1)
 */
export function calcSparrateFuerZiel(
  zielkapital: number,
  jahre: number,
  rendite: number,
  startCapital = 0,
): number {
  if (zielkapital <= 0 || jahre <= 0) return 0;
  const r = rendite / 12;
  const n = jahre * 12;
  const startWert = startCapital * Math.pow(1 + r, n);
  const restbedarf = Math.max(0, zielkapital - startWert);
  if (r === 0) return Math.round(restbedarf / n);
  const pmt = (restbedarf * r) / (Math.pow(1 + r, n) - 1);
  return Math.round(pmt);
}

/**
 * "Was kostet dich Warten" — Kapital und nötige Sparrate für drei Szenarien:
 * Heute starten, in 2 Jahren starten, in 8 Jahren starten.
 *
 * Die zentrale Aufwach-Tabelle: zeigt, wie der Hebel "Zeit" kippt.
 */
export interface WartenSzenarien {
  benoetigtesKapital: number;
  szenarien: Array<{
    wartejahre: number;
    label: string;
    /** Endkapital, das man mit AKTUELLER Sparrate noch erreichen würde. */
    erreichbaresKapital: number;
    /** Sparrate, die NÖTIG wäre, um das Ziel noch zu erreichen. */
    notwendigeSparrate: number;
    /** Differenz zur aktuellen Sparrate. */
    sparrateDelta: number;
    /** Verlorenes Endkapital vs. heute starten. */
    kapitalVerlust: number;
  }>;
}

export function calcKostenDesWartens(
  daten: BeratungDaten,
  monatlicheLuecke: number,
): WartenSzenarien {
  const jahreBisRente = Math.max(0, RENTENEINTRITT - daten.alter);
  const entnahmejahre = Math.max(0, daten.lebenserwartung - RENTENEINTRITT);

  const benoetigt = calcBenoetigtesKapital(
    monatlicheLuecke,
    entnahmejahre,
    daten.renditeEntnahmephase,
  );

  const aktSparrate = daten.aktuelleSparrate;

  const szenario = (warte: number) => {
    const verbleibendeJahre = Math.max(0, jahreBisRente - warte);
    // Was schaffe ich mit aktueller Sparrate noch?
    const erreichbar = Math.round(
      computeWealth(
        aktSparrate,
        verbleibendeJahre,
        daten.renditeAnsparphase,
        daten.startCapital,
      ),
    );
    // Was bräuchte ich an Sparrate, um benötigt zu erreichen?
    const notwendig = calcSparrateFuerZiel(
      benoetigt,
      verbleibendeJahre,
      daten.renditeAnsparphase,
      daten.startCapital,
    );
    return {
      wartejahre: warte,
      label:
        warte === 0
          ? 'Wenn du heute startest'
          : `Wenn du ${warte} Jahre wartest`,
      erreichbaresKapital: erreichbar,
      notwendigeSparrate: notwendig,
      sparrateDelta: notwendig - aktSparrate,
      kapitalVerlust: 0, // wird unten gesetzt
    };
  };

  const heute = szenario(0);
  const in2 = szenario(2);
  const in8 = szenario(8);

  in2.kapitalVerlust = Math.max(0, heute.erreichbaresKapital - in2.erreichbaresKapital);
  in8.kapitalVerlust = Math.max(0, heute.erreichbaresKapital - in8.erreichbaresKapital);

  return {
    benoetigtesKapital: benoetigt,
    szenarien: [heute, in2, in8],
  };
}

/**
 * Investitionswunsch: bei gegebener Wunsch-Sparrate, wieviel Prozent der
 * notwendigen Sparrate werden erreicht?
 */
export function calcInvestitionswunsch(
  wunschSparrate: number,
  notwendigeSparrateHeute: number,
): { prozent: number; status: 'unterversorgt' | 'fast_da' | 'erreicht' | 'übererfüllt' } {
  if (notwendigeSparrateHeute <= 0) {
    return { prozent: 100, status: 'erreicht' };
  }
  const prozent = Math.round((wunschSparrate / notwendigeSparrateHeute) * 100);
  const status =
    prozent >= 100
      ? 'übererfüllt'
      : prozent >= 80
        ? 'erreicht'
        : prozent >= 40
          ? 'fast_da'
          : 'unterversorgt';
  return { prozent, status };
}

/** Helper für die UI: einen leeren Vorsorge-Eintrag erstellen. */
export function createBestehendeVorsorge(
  art: BestehendeVorsorge['art'],
): BestehendeVorsorge {
  return {
    id: `v_${Math.random().toString(36).slice(2, 10)}`,
    art,
    label: vorsorgeArtLabel(art),
    monatsRente: 0,
  };
}

export function vorsorgeArtLabel(art: BestehendeVorsorge['art']): string {
  const map: Record<BestehendeVorsorge['art'], string> = {
    drv: 'DRV (gesetzlich)',
    rürup: 'Rürup / Basisrente',
    riester: 'Riester',
    bav: 'Betriebliche Altersvorsorge',
    avd: 'Altersvorsorgedepot (AVD)',
    etf: 'ETF-Sparplan',
    nettopolice: 'Nettopolice',
    sonstiges: 'Sonstiges',
  };
  return map[art];
}
