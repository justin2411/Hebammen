import { describe, it, expect } from 'vitest';
import { calcNetto } from '@/lib/calc/netto';

describe('calcNetto', () => {
  it('Brutto 3.400 € Klasse 1: Netto plausibel im Bereich 2.100–2.350', () => {
    const r = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    expect(r.netto).toBeGreaterThan(2100);
    expect(r.netto).toBeLessThan(2400);
  });

  it('Mit Kirchensteuer wird Netto niedriger', () => {
    const ohne = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    const mit = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: true,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    expect(mit.netto).toBeLessThan(ohne.netto);
  });

  it('PKV: keine GKV/PV-Beiträge im AN-SV-Anteil', () => {
    const gkv = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    const pkv = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'pkv',
      kinder: 0,
      alter: 35,
    });
    expect(pkv.svDetail.kv).toBe(0);
    expect(pkv.svDetail.pv).toBe(0);
    expect(pkv.sozialversicherungAn).toBeLessThan(gkv.sozialversicherungAn);
  });

  it('Kinderlos ≥ 23 zahlt Pflegezuschlag', () => {
    const kinderlos = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    const mitKind = calcNetto({
      monatsbrutto: 3400,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 1,
      alter: 35,
    });
    expect(kinderlos.svDetail.pv).toBeGreaterThan(mitKind.svDetail.pv);
  });

  it('Beitragsbemessungsgrenze deckelt SV', () => {
    const hoch = calcNetto({
      monatsbrutto: 12000,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    // KV/PV gedeckelt bei 5.512,50 €/Mon × ~11 %  ≈ 600 €
    expect(hoch.svDetail.kv).toBeLessThan(700);
  });

  it('Steuerklasse 4 (Splitting) liefert anderes Ergebnis als Klasse 1', () => {
    const k1 = calcNetto({
      monatsbrutto: 5000,
      steuerklasse: 1,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    const k4 = calcNetto({
      monatsbrutto: 5000,
      steuerklasse: 4,
      kirchensteuer: false,
      kvArt: 'gkv_pflicht',
      kinder: 0,
      alter: 35,
    });
    expect(k1.lohnsteuer).not.toBe(k4.lohnsteuer);
  });
});
