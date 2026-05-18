import { describe, it, expect } from 'vitest';
import { calcAltersvorsorge, computeWealth } from '@/lib/calc/altersvorsorge';

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

  it('rechnet jahreBisAusstieg = ausstiegsalter - alter', () => {
    const r = calcAltersvorsorge({
      alter: 35,
      ausstiegsalter: 60,
      aktuelleSparrate: 0,
      startCapital: 0,
      freigesetztesPotenzial: 0,
    });
    expect(r.jahreBisAusstieg).toBe(25);
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

  it('signalisiert Versorgungslücke negativ', () => {
    const r = calcAltersvorsorge({
      alter: 50,
      ausstiegsalter: 60,
      aktuelleSparrate: 50,
      startCapital: 0,
      freigesetztesPotenzial: 0,
    });
    expect(r.versorgungsluecke).toBeLessThan(0);
  });

  it('monatliche Rente entspricht Endkapital / (30×12)', () => {
    const r = calcAltersvorsorge({
      alter: 30,
      ausstiegsalter: 60,
      aktuelleSparrate: 300,
      startCapital: 0,
      freigesetztesPotenzial: 0,
    });
    expect(r.aktuell.monatlicheRente30Jahre).toBe(
      Math.round(r.aktuell.endkapital / 360),
    );
  });
});
