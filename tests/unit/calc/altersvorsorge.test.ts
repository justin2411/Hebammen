import { describe, it, expect } from 'vitest';
import { calcAltersvorsorge, computeWealth, realwert } from '@/lib/calc/altersvorsorge';

describe('computeWealth', () => {
  it('liefert Startkapital bei 0 Jahren', () => {
    expect(computeWealth(500, 0, 0.06, 1000)).toBe(1000);
  });

  it('rechnet ohne Verzinsung linear', () => {
    expect(computeWealth(100, 10, 0, 0)).toBe(100 * 12 * 10);
  });

  it('rechnet Compound Interest bei 6 % p.a.', () => {
    // 200 €/Monat über 30 Jahre bei 6 % ≈ 200.903 €
    const result = computeWealth(200, 30, 0.06, 0);
    expect(result).toBeGreaterThan(195000);
    expect(result).toBeLessThan(205000);
  });

  it('berücksichtigt Startkapital korrekt', () => {
    const ohneStart = computeWealth(100, 20, 0.06, 0);
    const mitStart = computeWealth(100, 20, 0.06, 10000);
    // 10.000 × (1 + 0.06/12)^240 ≈ 33.102 (monatlich kapitalisiert)
    expect(mitStart - ohneStart).toBeGreaterThan(32500);
    expect(mitStart - ohneStart).toBeLessThan(33500);
  });
});

describe('realwert', () => {
  it('liefert Nominalwert bei 0 Jahren', () => {
    expect(realwert(100000, 0, 0.02)).toBe(100000);
  });

  it('halbiert ungefähr nach 35 Jahren bei 2 % Inflation', () => {
    const real = realwert(100000, 35, 0.02);
    expect(real).toBeGreaterThan(49000);
    expect(real).toBeLessThan(51000);
  });
});

describe('calcAltersvorsorge', () => {
  it('liefert drei Szenarien mit aufsteigendem Endkapital', () => {
    const r = calcAltersvorsorge({
      alter: 30,
      ausstiegsalter: 60,
      aktuelleSparrate: 100,
      startCapital: 0,
      freigesetztesPotenzial: 6000,
    });
    expect(r.aktuell.endkapital).toBeLessThan(r.optimiert.endkapital);
    expect(r.optimiert.endkapital).toBeLessThan(r.maximal.endkapital);
  });

  it('liefert nominale und reale Werte (real < nominal bei Inflation > 0)', () => {
    const r = calcAltersvorsorge({
      alter: 30,
      ausstiegsalter: 60,
      aktuelleSparrate: 300,
      startCapital: 0,
      freigesetztesPotenzial: 0,
    });
    expect(r.aktuell.endkapitalReal).toBeLessThan(r.aktuell.endkapital);
  });

  it('benutzt Default-Parameter wenn nicht überschrieben', () => {
    const r = calcAltersvorsorge({
      alter: 30,
      ausstiegsalter: 60,
      aktuelleSparrate: 0,
      startCapital: 0,
      freigesetztesPotenzial: 0,
    });
    expect(r.parameter.renditeNominal).toBe(0.06);
    expect(r.parameter.inflation).toBe(0.02);
  });

  it('respektiert übergebene Rendite und Inflation', () => {
    const r = calcAltersvorsorge({
      alter: 30,
      ausstiegsalter: 60,
      aktuelleSparrate: 100,
      startCapital: 0,
      freigesetztesPotenzial: 0,
      renditeNominal: 0.08,
      inflation: 0.03,
    });
    expect(r.parameter.renditeNominal).toBe(0.08);
    expect(r.parameter.inflation).toBe(0.03);
  });

  it('clampt jahreBisAusstieg auf 0 wenn ausstiegsalter < alter', () => {
    const r = calcAltersvorsorge({
      alter: 70,
      ausstiegsalter: 65,
      aktuelleSparrate: 100,
      startCapital: 50000,
      freigesetztesPotenzial: 0,
    });
    expect(r.jahreBisAusstieg).toBe(0);
    expect(r.aktuell.endkapital).toBe(50000);
  });

  it('BU-Stresstest liefert weniger Kapital als Optimal-Szenario', () => {
    const r = calcAltersvorsorge({
      alter: 30,
      ausstiegsalter: 65,
      aktuelleSparrate: 300,
      startCapital: 0,
      freigesetztesPotenzial: 6000,
    });
    expect(r.buStress.endkapital).toBeLessThan(r.optimiert.endkapital);
    expect(r.buStress.anteilOhneStress).toBeGreaterThan(0);
    expect(r.buStress.anteilOhneStress).toBeLessThan(1);
  });

  it('BU-Stresstest gleich Optimum wenn schon nach 50', () => {
    const r = calcAltersvorsorge({
      alter: 55,
      ausstiegsalter: 65,
      aktuelleSparrate: 300,
      startCapital: 100000,
      freigesetztesPotenzial: 0,
    });
    // Hebamme ist schon über 50 → Beiträge können nicht mehr durch BU gestoppt werden,
    // daher Stresstest = reguläres Szenario.
    expect(r.buStress.endkapital).toBeCloseTo(r.optimiert.endkapital, -2);
  });
});
