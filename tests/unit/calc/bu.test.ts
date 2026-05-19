import { describe, it, expect } from 'vitest';
import { calcBuLuecke, schaetzeBuPraemie } from '@/lib/calc/bu';

describe('calcBuLuecke', () => {
  it('liefert "fehlt" wenn keine BU vorhanden', () => {
    const r = calcBuLuecke({
      monatsbrutto: 4000,
      bestehendeBU: { hat: false, monatsRente: 0, endalter: 67 },
    });
    expect(r.status).toBe('fehlt');
    expect(r.bestehend).toBe(0);
    expect(r.luecke).toBeGreaterThan(0);
  });

  it('liefert "unterversorgt" bei Teilabdeckung', () => {
    const r = calcBuLuecke({
      monatsbrutto: 4000,
      // 4000 × 0,65 × 0,8 ≈ 2.080 € empfohlen, 800 € bestehend → 38 %
      bestehendeBU: { hat: true, monatsRente: 800, endalter: 67 },
    });
    expect(r.status).toBe('unterversorgt');
  });

  it('liefert "ok" bei 70-100 % Abdeckung', () => {
    const r = calcBuLuecke({
      monatsbrutto: 4000,
      // 2.080 × 0,8 = 1.664 € → "ok"
      bestehendeBU: { hat: true, monatsRente: 1664, endalter: 67 },
    });
    expect(r.status).toBe('ok');
  });

  it('liefert "gut" bei Vollabdeckung', () => {
    const r = calcBuLuecke({
      monatsbrutto: 4000,
      bestehendeBU: { hat: true, monatsRente: 2500, endalter: 67 },
    });
    expect(r.status).toBe('gut');
    expect(r.luecke).toBeLessThanOrEqual(0);
  });

  it('berechnet empfohlene Rente als 52 % vom Brutto', () => {
    // 4000 × 0,65 × 0,8 = 2080 € (Netto-Annahme = 65% vom Brutto)
    const r = calcBuLuecke({
      monatsbrutto: 4000,
      bestehendeBU: { hat: false, monatsRente: 0, endalter: 67 },
    });
    expect(r.empfohleneMonatsRente).toBe(2080);
  });
});

describe('schaetzeBuPraemie', () => {
  it('Prämie steigt mit Alter (jüngere zahlen weniger)', () => {
    const p25 = schaetzeBuPraemie({ alter: 25, rente: 1500 });
    const p45 = schaetzeBuPraemie({ alter: 45, rente: 1500 });
    expect(p45.mitte).toBeGreaterThan(p25.mitte);
  });

  it('Prämie steigt mit Rentenhöhe', () => {
    const p1500 = schaetzeBuPraemie({ alter: 35, rente: 1500 });
    const p2500 = schaetzeBuPraemie({ alter: 35, rente: 2500 });
    expect(p2500.mitte).toBeGreaterThan(p1500.mitte * 1.5);
  });

  it('Spanne unten-mitte-oben ist plausibel sortiert', () => {
    const p = schaetzeBuPraemie({ alter: 40, rente: 2000 });
    expect(p.unten).toBeLessThan(p.mitte);
    expect(p.mitte).toBeLessThan(p.oben);
  });

  it('clampt Alter auf Tabellengrenzen (z.B. 60 → 55)', () => {
    const p = schaetzeBuPraemie({ alter: 60, rente: 1500 });
    expect(p.fuerAlter).toBe(55);
  });

  it('clampt sehr junges Alter auf Mindest-Stützstelle', () => {
    const p = schaetzeBuPraemie({ alter: 18, rente: 1500 });
    expect(p.fuerAlter).toBe(25);
  });
});
