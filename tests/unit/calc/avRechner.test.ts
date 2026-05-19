import { describe, it, expect } from 'vitest';
import {
  calcGesetzlicheRente,
  calcVersorgungsziel,
  calcBenoetigtesKapital,
  calcSparrateFuerZiel,
  calcKostenDesWartens,
  calcInvestitionswunsch,
} from '@/lib/calc/avRechner';
import { emptyBeratungDaten } from '@/lib/calc/types';

const base = {
  ...emptyBeratungDaten('klinik'),
  alter: 35,
  monatsbrutto: 3400,
  berufseintrittsalter: 22,
  drvPflicht: true,
  versorgungszielNetto: 2000,
  lebenserwartung: 89,
  rentensteigerungProJahr: 0.01,
  renditeAnsparphase: 0.06,
  renditeEntnahmephase: 0.02,
  bestehendeVorsorgen: [],
};

describe('calcGesetzlicheRente', () => {
  it('liefert 0 wenn nicht DRV-pflichtig', () => {
    const r = calcGesetzlicheRente({ ...base, drvPflicht: false });
    expect(r.brutto).toBe(0);
    expect(r.entgeltpunkte).toBe(0);
  });

  it('berechnet Beitragsjahre aus Berufseintritt bis 67', () => {
    const r = calcGesetzlicheRente({ ...base, berufseintrittsalter: 22 });
    expect(r.beitragsjahre).toBe(45); // 67 - 22
  });

  it('Entgeltpunkte skalieren linear mit Brutto', () => {
    const r1 = calcGesetzlicheRente({ ...base, monatsbrutto: 3400 });
    const r2 = calcGesetzlicheRente({ ...base, monatsbrutto: 6800 });
    expect(r2.entgeltpunkte).toBeCloseTo(r1.entgeltpunkte * 2, 1);
  });

  it('Punkte/Jahr deckelt bei 2 (Beitragsbemessungsgrenze-ähnlich)', () => {
    const r = calcGesetzlicheRente({ ...base, monatsbrutto: 30000 });
    // 30k × 12 = 360k > 2 × Durchschnittsentgelt (94k) → capped
    expect(r.entgeltpunkte / r.beitragsjahre).toBeLessThanOrEqual(2.001);
  });
});

describe('calcVersorgungsziel', () => {
  it('Versorgungsziel-mit-Inflation steigt über Jahre', () => {
    const r = calcVersorgungsziel(base);
    expect(r.zielMitInflation).toBeGreaterThan(r.zielNetto);
  });

  it('ohne bestehende Verträge liegt Lücke bei großer Differenz', () => {
    const r = calcVersorgungsziel({ ...base, monatsbrutto: 2500 });
    expect(r.versorgungsluecke).toBeGreaterThan(500);
  });

  it('mit hoher bestehender Rente schließt sich die Lücke', () => {
    const r = calcVersorgungsziel({
      ...base,
      bestehendeVorsorgen: [
        {
          id: 'x',
          art: 'rürup',
          label: 'Rürup',
          monatsRente: 2000,
        },
      ],
    });
    expect(r.versorgungsluecke).toBeLessThan(1500);
  });

  it('liefert Positionen-Aufstellung mit DRV + bestehenden', () => {
    const r = calcVersorgungsziel({
      ...base,
      bestehendeVorsorgen: [
        { id: 'a', art: 'bav', label: 'BAV', monatsRente: 200 },
      ],
    });
    expect(r.positionen).toHaveLength(2);
    expect(r.positionen[0].label).toBe('Gesetzliche Rente');
  });
});

describe('calcBenoetigtesKapital', () => {
  it('linear bei Rendite = 0', () => {
    expect(calcBenoetigtesKapital(1000, 20, 0)).toBe(1000 * 12 * 20);
  });

  it('weniger Kapital nötig bei positiver Entnahmephase-Rendite', () => {
    const ohne = calcBenoetigtesKapital(1000, 20, 0);
    const mit = calcBenoetigtesKapital(1000, 20, 0.02);
    expect(mit).toBeLessThan(ohne);
  });

  it('liefert 0 bei keiner Lücke', () => {
    expect(calcBenoetigtesKapital(0, 20, 0.02)).toBe(0);
  });
});

describe('calcSparrateFuerZiel', () => {
  it('weniger Sparrate nötig bei längerem Horizont', () => {
    const kurz = calcSparrateFuerZiel(200000, 10, 0.06);
    const lang = calcSparrateFuerZiel(200000, 30, 0.06);
    expect(lang).toBeLessThan(kurz);
  });

  it('Startkapital reduziert nötige Sparrate', () => {
    const ohne = calcSparrateFuerZiel(200000, 20, 0.06, 0);
    const mit = calcSparrateFuerZiel(200000, 20, 0.06, 50000);
    expect(mit).toBeLessThan(ohne);
  });
});

describe('calcKostenDesWartens', () => {
  it('liefert 3 Szenarien (heute, 2J, 8J)', () => {
    const r = calcKostenDesWartens(base, 1500);
    expect(r.szenarien).toHaveLength(3);
    expect(r.szenarien[0].wartejahre).toBe(0);
    expect(r.szenarien[1].wartejahre).toBe(2);
    expect(r.szenarien[2].wartejahre).toBe(8);
  });

  it('Warten erhöht notwendige Sparrate dramatisch', () => {
    const r = calcKostenDesWartens(base, 1500);
    expect(r.szenarien[2].notwendigeSparrate).toBeGreaterThan(
      r.szenarien[0].notwendigeSparrate * 1.5,
    );
  });

  it('Warten reduziert erreichbares Kapital', () => {
    const r = calcKostenDesWartens({ ...base, aktuelleSparrate: 200 }, 1500);
    expect(r.szenarien[2].erreichbaresKapital).toBeLessThan(
      r.szenarien[0].erreichbaresKapital,
    );
    expect(r.szenarien[2].kapitalVerlust).toBeGreaterThan(0);
  });
});

describe('calcInvestitionswunsch', () => {
  it('100 % bei keinem Bedarf', () => {
    const r = calcInvestitionswunsch(500, 0);
    expect(r.prozent).toBe(100);
  });

  it('skaliert linear unter 100 %', () => {
    const r = calcInvestitionswunsch(500, 1000);
    expect(r.prozent).toBe(50);
    expect(r.status).toBe('fast_da');
  });

  it('Status-Stufen', () => {
    expect(calcInvestitionswunsch(50, 1000).status).toBe('unterversorgt');
    expect(calcInvestitionswunsch(500, 1000).status).toBe('fast_da');
    expect(calcInvestitionswunsch(900, 1000).status).toBe('erreicht');
    expect(calcInvestitionswunsch(1500, 1000).status).toBe('übererfüllt');
  });
});
