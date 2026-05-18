import { describe, it, expect } from 'vitest';
import { calcRuerup } from '@/lib/calc/ruerup';

describe('calcRuerup', () => {
  it('liefert vollen Höchstbetrag wenn nicht DRV-pflichtig', () => {
    const r = calcRuerup({
      monatsbrutto: 4000,
      verheiratet: false,
      drvPflicht: false,
    });
    expect(r.drvBeitragGeschaetzt).toBe(0);
    expect(r.hoechstbetragVerfuegbar).toBe(r.hoechstbetragBrutto);
  });

  it('rechnet DRV-Pflichtbeiträge an', () => {
    const r = calcRuerup({
      monatsbrutto: 4000,
      verheiratet: false,
      drvPflicht: true,
    });
    // 48.000 × 0,186 ≈ 8.928 €
    expect(r.drvBeitragGeschaetzt).toBe(Math.round(48000 * 0.186));
    expect(r.hoechstbetragVerfuegbar).toBe(r.hoechstbetragBrutto - r.drvBeitragGeschaetzt);
  });

  it('verdoppelt Höchstbetrag bei Verheirateten', () => {
    const ledig = calcRuerup({ monatsbrutto: 3000, verheiratet: false, drvPflicht: false });
    const verheiratet = calcRuerup({ monatsbrutto: 3000, verheiratet: true, drvPflicht: false });
    expect(verheiratet.hoechstbetragBrutto).toBe(ledig.hoechstbetragBrutto * 2);
  });

  it('cappt empfohlenen Eigenbeitrag bei 12k €/Jahr', () => {
    const r = calcRuerup({
      monatsbrutto: 15000,
      verheiratet: true,
      drvPflicht: false,
    });
    expect(r.empfohlenerEigenbeitragJahr).toBe(12000);
  });

  it('clampt verfügbaren Höchstbetrag auf 0 bei extremem DRV-Anteil', () => {
    const r = calcRuerup({
      monatsbrutto: 20000, // 240k × 0,186 ≈ 44.640 → > 30.826
      verheiratet: false,
      drvPflicht: true,
    });
    expect(r.hoechstbetragVerfuegbar).toBe(0);
    expect(r.empfohlenerEigenbeitragJahr).toBe(0);
  });
});
