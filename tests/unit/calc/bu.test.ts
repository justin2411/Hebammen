import { describe, it, expect } from 'vitest';
import { calcBuLuecke } from '@/lib/calc/bu';

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
