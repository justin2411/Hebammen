import { describe, it, expect } from 'vitest';
import { generateEmpfehlungen } from '@/lib/calc/empfehlungen';
import type { BeratungDaten } from '@/lib/calc/types';

const base: BeratungDaten = {
  alter: 35,
  status: 'freiberuflich',
  geburtshilfe: false,
  monatsbrutto: 4000,
  verheiratet: false,
  kinder: 0,
  kinderUeber6: 0,
  kilometer: 0,
  homeofficeTage: 0,
  fortbildungen: 0,
  equipment: 0,
  hatBU: true,
  nutztFoerderungen: true,
  steueroptimiert: true,
  hatFlexibleVorsorge: true,
  aktuelleSparrate: 600,
  startCapital: 0,
  ausstiegsalter: 60,
  schemaVersion: 1,
};

describe('generateEmpfehlungen', () => {
  it('priorisiert fehlende BU immer als Prio 1', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, hatBU: false },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r[0].bereich).toBe('bu');
    expect(r[0].prio).toBe(1);
  });

  it('empfiehlt Sparrate-Erhöhung bei < 10 % Sparquote', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, aktuelleSparrate: 100 }, // 2,5 %
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'sparrate')).toBe(true);
  });

  it('empfiehlt Förderungen wenn ungenutzt und welche möglich sind', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, nutztFoerderungen: false },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 2000,
    });
    expect(r.some((e) => e.bereich === 'foerderungen')).toBe(true);
  });

  it('empfiehlt keine Steueroptimierung wenn Ersparnis < 200 €', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, steueroptimiert: false },
      steuerErsparnisProJahr: 100,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'steuern')).toBe(false);
  });

  it('gibt maximal 3 Empfehlungen zurück', () => {
    const r = generateEmpfehlungen({
      daten: {
        ...base,
        hatBU: false,
        nutztFoerderungen: false,
        steueroptimiert: false,
        hatFlexibleVorsorge: false,
        aktuelleSparrate: 0,
      },
      steuerErsparnisProJahr: 500,
      foerderSummeProJahr: 1500,
    });
    expect(r.length).toBeLessThanOrEqual(3);
  });

  it('liefert leere Liste bei vorbildlicher Aufstellung', () => {
    const r = generateEmpfehlungen({
      daten: base,
      steuerErsparnisProJahr: 500,
      foerderSummeProJahr: 1500,
    });
    expect(r).toHaveLength(0);
  });
});
