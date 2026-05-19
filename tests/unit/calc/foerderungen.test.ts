import { describe, it, expect } from 'vitest';
import { calcAvd, calcFoerderungen } from '@/lib/calc/foerderungen';

describe('calcAvd', () => {
  it('liefert maximale Grundzulage von 540 €', () => {
    const r = calcAvd({ alter: 30, kinder: 0 });
    expect(r.grundzulage).toBe(540);
    expect(r.summe).toBe(540);
  });

  it('rechnet 300 € pro Kind dazu', () => {
    const r = calcAvd({ alter: 30, kinder: 2 });
    expect(r.kinderzulage).toBe(600);
    expect(r.summe).toBe(1140);
  });

  it('gibt Berufseinsteiger-Bonus nur bis Alter 25', () => {
    expect(calcAvd({ alter: 24, kinder: 0 }).berufseinsteigerBonus).toBe(200);
    expect(calcAvd({ alter: 25, kinder: 0 }).berufseinsteigerBonus).toBe(200);
    expect(calcAvd({ alter: 26, kinder: 0 }).berufseinsteigerBonus).toBe(0);
  });

  it('empfiehlt 1.800 € Eigenbeitrag + 300 € pro Kind', () => {
    expect(calcAvd({ alter: 30, kinder: 0 }).empfohlenerEigenbeitrag).toBe(1800);
    expect(calcAvd({ alter: 30, kinder: 2 }).empfohlenerEigenbeitrag).toBe(2400);
  });
});

describe('calcFoerderungen', () => {
  it('liefert keine BAV/VL bei Freiberuflichen', () => {
    const r = calcFoerderungen({
      alter: 35,
      status: 'freiberuflich',
      geburtshilfe: false,
      kinder: 1,
      kinderUeber6: 0,
      monatsbrutto: 4000,
    });
    expect(r.bav.summe).toBe(0);
    expect(r.vl.arbeitgeberzuschuss).toBe(0);
    expect(r.avd.summe).toBe(840); // 540 + 300
  });

  it('rechnet BAV+VL bei Angestellten', () => {
    const r = calcFoerderungen({
      alter: 35,
      status: 'angestellt',
      geburtshilfe: false,
      kinder: 0,
      kinderUeber6: 0,
      monatsbrutto: 4000,
    });
    expect(r.bav.summe).toBeGreaterThan(0);
    expect(r.vl.arbeitgeberzuschuss).toBe(480); // 40 × 12
  });

  it('zählt GKV-Sicherstellungszuschlag nur bei Geburtshilfe', () => {
    const ohne = calcFoerderungen({
      alter: 35,
      status: 'freiberuflich',
      geburtshilfe: false,
      kinder: 0,
      kinderUeber6: 0,
      monatsbrutto: 4000,
    });
    const mit = calcFoerderungen({
      alter: 35,
      status: 'freiberuflich',
      geburtshilfe: true,
      kinder: 0,
      kinderUeber6: 0,
      monatsbrutto: 4000,
    });
    expect(ohne.gkvSicherstellungszuschlag).toBe(0);
    expect(mit.gkvSicherstellungszuschlag).toBe(7000); // 700 × 10
  });

  it('summiert alle Bausteine korrekt', () => {
    const r = calcFoerderungen({
      alter: 30,
      status: 'angestellt',
      geburtshilfe: false,
      kinder: 2,
      kinderUeber6: 1,
      monatsbrutto: 4000,
    });
    expect(r.gesamtProJahr).toBe(
      r.avd.summe + r.bav.summe + r.vl.arbeitgeberzuschuss + r.gkvSicherstellungszuschlag,
    );
  });
});
