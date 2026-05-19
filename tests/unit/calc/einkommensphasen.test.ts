import { describe, it, expect } from 'vitest';
import { calcEinkommensPhasen } from '@/lib/calc/einkommensphasen';
import { emptyBeratungDaten } from '@/lib/calc/types';

const baseDaten = {
  ...emptyBeratungDaten('klinik'),
  monatsbrutto: 3400,
  alter: 35,
  steuerklasse: 1 as const,
  kirchensteuer: false,
  kvArt: 'gkv_pflicht' as const,
  krankentagegeld: 0,
  restleistungsvermoegen: 3,
};

describe('calcEinkommensPhasen', () => {
  it('Angestellte mit GKV: 3 Phasen, Phase 1 = volles Netto', () => {
    const r = calcEinkommensPhasen(baseDaten);
    expect(r.phasen).toHaveLength(3);
    expect(r.phasen[0].id).toBe('lohnfortzahlung');
    expect(r.phasen[0].versorgungsluecke).toBe(0);
  });

  it('Phase 2 Krankengeld liegt unter Netto-Referenz', () => {
    const r = calcEinkommensPhasen(baseDaten);
    const kg = r.phasen.find((p) => p.id === 'krankengeld')!;
    expect(kg.nettoProMonat).toBeLessThan(r.nettoReferenz);
    expect(kg.versorgungsluecke).toBeGreaterThan(0);
  });

  it('Restleistungsvermögen < 3h → volle EM (34 %)', () => {
    const r = calcEinkommensPhasen({ ...baseDaten, restleistungsvermoegen: 2 });
    expect(r.emGrad).toBe('voll');
    const em = r.phasen.find((p) => p.id === 'em_rente')!;
    expect(em.bruttoProMonat).toBeCloseTo(baseDaten.monatsbrutto * 0.34, -1);
  });

  it('Restleistungsvermögen 3–5h → halbe EM (17 %)', () => {
    const r = calcEinkommensPhasen({ ...baseDaten, restleistungsvermoegen: 4 });
    expect(r.emGrad).toBe('halb');
    const em = r.phasen.find((p) => p.id === 'em_rente')!;
    expect(em.bruttoProMonat).toBeCloseTo(baseDaten.monatsbrutto * 0.17, -1);
  });

  it('Restleistungsvermögen ≥ 6h → keine EM (0)', () => {
    const r = calcEinkommensPhasen({ ...baseDaten, restleistungsvermoegen: 6 });
    expect(r.emGrad).toBe('keine');
    const em = r.phasen.find((p) => p.id === 'em_rente')!;
    expect(em.bruttoProMonat).toBe(0);
    // ohne EM-Rente ist die Lücke gleich dem Netto-Referenz
    expect(em.versorgungsluecke).toBe(Math.round(r.nettoReferenz));
  });

  it('Freiberufliche: Phase 1 hat 0 Auszahlung (keine Lohnfortzahlung)', () => {
    const r = calcEinkommensPhasen({
      ...baseDaten,
      status: 'freiberuflich',
      kvArt: 'gkv_pflicht',
    });
    expect(r.phasen[0].id).toBe('lohnfortzahlung');
    expect(r.phasen[0].nettoProMonat).toBe(0);
    expect(r.phasen[0].versorgungsluecke).toBe(r.nettoReferenz);
  });

  it('PKV mit Krankentagegeld: KTG = Netto-Auszahlung', () => {
    const r = calcEinkommensPhasen({
      ...baseDaten,
      kvArt: 'pkv',
      krankentagegeld: 2500,
    });
    const kg = r.phasen.find((p) => p.id === 'krankengeld')!;
    expect(kg.nettoProMonat).toBe(2500);
  });

  it('PKV ohne Krankentagegeld: 0 Auszahlung in Phase 2', () => {
    const r = calcEinkommensPhasen({
      ...baseDaten,
      kvArt: 'pkv',
      krankentagegeld: 0,
    });
    const kg = r.phasen.find((p) => p.id === 'krankengeld')!;
    expect(kg.nettoProMonat).toBe(0);
    expect(kg.versorgungsluecke).toBe(r.nettoReferenz);
  });

  it('Verlust bis Rente skaliert mit Alter (jüngere höherer Verlust)', () => {
    const r25 = calcEinkommensPhasen({ ...baseDaten, alter: 25, restleistungsvermoegen: 2 });
    const r55 = calcEinkommensPhasen({ ...baseDaten, alter: 55, restleistungsvermoegen: 2 });
    expect(r25.verlustBisRente).toBeGreaterThan(r55.verlustBisRente);
  });
});
