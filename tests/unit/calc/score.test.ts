import { describe, it, expect } from 'vitest';
import { calcScore } from '@/lib/calc/score';
import type { BeratungDaten } from '@/lib/calc/types';

const base: BeratungDaten = {
  alter: 35,
  status: 'freiberuflich',
  geburtshilfe: true,
  monatsbrutto: 4000,
  verheiratet: false,
  kinder: 0,
  kinderUeber6: 0,
  kilometer: 0,
  homeofficeTage: 0,
  fortbildungen: 0,
  equipment: 0,
  hatBU: false,
  nutztFoerderungen: false,
  steueroptimiert: false,
  hatFlexibleVorsorge: false,
  aktuelleSparrate: 0,
  startCapital: 0,
  ausstiegsalter: 65,
  schemaVersion: 1,
};

describe('calcScore', () => {
  it('liefert niedrigen Score bei nichts vorhanden', () => {
    const r = calcScore(base);
    expect(r.total).toBeLessThan(30);
    expect(r.subs.sparquote).toBe(0);
    expect(r.subs.buSchutz).toBe(15);
  });

  it('liefert hohen Score bei voller Absicherung', () => {
    const r = calcScore({
      ...base,
      hatBU: true,
      nutztFoerderungen: true,
      steueroptimiert: true,
      hatFlexibleVorsorge: true,
      aktuelleSparrate: 600, // 15 % von 4000
    });
    expect(r.total).toBeGreaterThan(85);
    expect(r.subs.sparquote).toBe(100);
  });

  it('cappt Sparquote bei 100', () => {
    const r = calcScore({ ...base, aktuelleSparrate: 2000 });
    expect(r.subs.sparquote).toBe(100);
  });

  it('total ist Durchschnitt der 5 Sub-Scores', () => {
    const r = calcScore({ ...base, hatBU: true });
    const erwartet = Math.round(
      (r.subs.sparquote +
        r.subs.buSchutz +
        r.subs.foerderquote +
        r.subs.steuerOptimierung +
        r.subs.flexibilitaet) /
        5,
    );
    expect(r.total).toBe(erwartet);
  });
});
