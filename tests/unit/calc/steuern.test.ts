import { describe, it, expect } from 'vitest';
import { calcSteuern, grenzsteuersatz } from '@/lib/calc/steuern';

describe('grenzsteuersatz', () => {
  it('liefert 14 % für niedrige Einkommen (ledig)', () => {
    expect(grenzsteuersatz(10000, false)).toBe(0.14);
  });

  it('liefert 42 % für gut verdienende Ledige', () => {
    expect(grenzsteuersatz(80000, false)).toBe(0.42);
  });

  it('berücksichtigt Splitting bei Verheirateten', () => {
    // 60.000 verheiratet → Referenz 30.000 → Stufe 0,32 (bis 35.000)
    expect(grenzsteuersatz(60000, true)).toBe(0.32);
    // 60.000 ledig → Stufe 0,40 (bis 65.000)
    expect(grenzsteuersatz(60000, false)).toBe(0.40);
  });

  it('cappt bei 45 % für Spitzenverdiener', () => {
    expect(grenzsteuersatz(500000, false)).toBe(0.45);
  });
});

describe('calcSteuern – Freiberuflich', () => {
  it('empfiehlt Pauschale bei wenigen Einzelbelegen', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 5000,
      verheiratet: false,
      kilometer: 1000,    // 300 €
      homeofficeTage: 50, // 300 €
      fortbildungen: 200,
      equipment: 100,
    });
    expect(result.empfehlung).toBe('pauschale');
    expect(result.pauschale).toBe(1535); // Cap greift (60.000 × 25 % = 15.000 > 1.535)
    expect(result.bestBA).toBe(1535);
    expect(result.einzelnachweis.summe).toBe(900);
  });

  it('empfiehlt Einzelnachweis bei hohem km-Anteil', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 5000,
      verheiratet: false,
      kilometer: 8000,    // 2.400 €
      homeofficeTage: 100, // 600 €
      fortbildungen: 800,
      equipment: 400,
    });
    expect(result.empfehlung).toBe('einzelnachweis');
    expect(result.einzelnachweis.summe).toBe(4200);
    expect(result.bestBA).toBe(4200);
  });

  it('cappt die Homeoffice-Pauschale bei 1.260 €', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 3000,
      verheiratet: false,
      kilometer: 0,
      homeofficeTage: 300, // 1.800 € → gecapt auf 1.260 €
      fortbildungen: 0,
      equipment: 0,
    });
    expect(result.einzelnachweis.homeoffice).toBe(1260);
  });

  it('cappt die Hebammen-Pauschale bei 1.535 €', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 10000, // 120.000 × 25 % = 30.000
      verheiratet: false,
      kilometer: 0,
      homeofficeTage: 0,
      fortbildungen: 0,
      equipment: 0,
    });
    expect(result.pauschale).toBe(1535);
  });

  it('berechnet Steuerersparnis = bestBA × Grenzsteuersatz', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 4000, // zvE ≈ 46.465 → Stufe 0,36
      verheiratet: false,
      kilometer: 0,
      homeofficeTage: 0,
      fortbildungen: 0,
      equipment: 0,
    });
    // bestBA = 1535, satz = 0.36 → ca. 553 €
    expect(result.ersparnisProJahr).toBe(Math.round(1535 * 0.36));
  });
});

describe('calcSteuern – Angestellt', () => {
  it('nutzt Werbungskostenpauschbetrag statt Hebammen-Pauschale', () => {
    const result = calcSteuern({
      status: 'angestellt',
      monatsbrutto: 4000,
      verheiratet: false,
      kilometer: 500,
      homeofficeTage: 20,
      fortbildungen: 100,
      equipment: 50,
    });
    expect(result.pauschale).toBe(1230);
  });
});
