import { describe, it, expect } from 'vitest';
import { generateEmpfehlungen } from '@/lib/calc/empfehlungen';
import { emptyBeratungDaten } from '@/lib/calc/types';

const base = {
  ...emptyBeratungDaten('wochenbett'),
  bestehendeBU: { hat: true, monatsRente: 1800, endalter: 67 },
  nutztFoerderungen: true,
  steueroptimiert: true,
  hatFlexibleVorsorge: true,
  aktuelleSparrate: 600,
  notgroschenMonate: 6,
};

describe('generateEmpfehlungen', () => {
  it('priorisiert fehlende BU als Prio 1', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, bestehendeBU: { hat: false, monatsRente: 0, endalter: 67 } },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'bu' && e.prio === 1)).toBe(true);
  });

  it('priorisiert fehlenden Notgroschen als Prio 1', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, notgroschenMonate: 0 },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'notgroschen' && e.prio === 1)).toBe(true);
  });

  it('warnt bei BU-Lücke (BU vorhanden, aber zu niedrig)', () => {
    const r = generateEmpfehlungen({
      daten: {
        ...base,
        monatsbrutto: 4000,
        bestehendeBU: { hat: true, monatsRente: 500, endalter: 67 },
      },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'bu_luecke')).toBe(true);
  });

  it('empfiehlt Sparrate-Erhöhung bei < 10 % Sparquote', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, aktuelleSparrate: 100 },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'sparrate')).toBe(true);
  });

  it('flagged Riester-Bestand zur Prüfung', () => {
    const r = generateEmpfehlungen({
      daten: { ...base, bestehenderRiester: true },
      steuerErsparnisProJahr: 0,
      foerderSummeProJahr: 0,
    });
    expect(r.some((e) => e.bereich === 'riester_check')).toBe(true);
  });

  it('gibt maximal 3 Empfehlungen zurück', () => {
    const r = generateEmpfehlungen({
      daten: {
        ...base,
        bestehendeBU: { hat: false, monatsRente: 0, endalter: 67 },
        nutztFoerderungen: false,
        steueroptimiert: false,
        hatFlexibleVorsorge: false,
        aktuelleSparrate: 0,
        notgroschenMonate: 0,
        bestehenderRiester: true,
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
