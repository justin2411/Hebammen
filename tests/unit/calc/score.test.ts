import { describe, it, expect } from 'vitest';
import { calcScore } from '@/lib/calc/score';
import { emptyBeratungDaten } from '@/lib/calc/types';

const base = emptyBeratungDaten('wochenbett');

describe('calcScore', () => {
  it('liefert niedrigen Score bei nichts vorhanden', () => {
    const r = calcScore({ ...base, aktuelleSparrate: 0, notgroschenMonate: 0 });
    expect(r.total).toBeLessThan(35);
    expect(r.subs.sparquote).toBe(0);
    expect(r.subs.buSchutz).toBe(15);
    expect(r.subs.liquidPuffer).toBe(10);
  });

  it('liefert hohen Score bei voller Absicherung', () => {
    const r = calcScore({
      ...base,
      bestehendeBU: { hat: true, monatsRente: 2000, endalter: 67 },
      nutztFoerderungen: true,
      steueroptimiert: true,
      hatFlexibleVorsorge: true,
      notgroschenMonate: 6,
      aktuelleSparrate: base.monatsbrutto * 0.15,
    });
    expect(r.total).toBeGreaterThan(85);
    expect(r.subs.sparquote).toBe(100);
    expect(r.subs.liquidPuffer).toBe(100);
  });

  it('cappt Sparquote bei 100', () => {
    const r = calcScore({ ...base, aktuelleSparrate: 2000 });
    expect(r.subs.sparquote).toBe(100);
  });

  it('BU-Score skaliert mit Rentenhöhe', () => {
    const ohne = calcScore({
      ...base,
      bestehendeBU: { hat: false, monatsRente: 0, endalter: 67 },
    });
    const niedrig = calcScore({
      ...base,
      bestehendeBU: { hat: true, monatsRente: 500, endalter: 67 },
    });
    const voll = calcScore({
      ...base,
      bestehendeBU: { hat: true, monatsRente: 2000, endalter: 67 },
    });
    expect(ohne.subs.buSchutz).toBe(15);
    expect(niedrig.subs.buSchutz).toBeGreaterThan(ohne.subs.buSchutz);
    expect(voll.subs.buSchutz).toBeGreaterThan(niedrig.subs.buSchutz);
    expect(voll.subs.buSchutz).toBeLessThanOrEqual(95);
  });

  it('total ist Durchschnitt der 6 Sub-Scores', () => {
    const r = calcScore({
      ...base,
      bestehendeBU: { hat: true, monatsRente: 1000, endalter: 67 },
    });
    const summe =
      r.subs.sparquote +
      r.subs.buSchutz +
      r.subs.foerderquote +
      r.subs.steuerOptimierung +
      r.subs.flexibilitaet +
      r.subs.liquidPuffer;
    expect(r.total).toBe(Math.round(summe / 6));
  });
});
