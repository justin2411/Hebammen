# Hebammen·Vorsorge

Interaktives Beratungs-Cockpit für Finanzberatung mit Hebammen.
Berechnet Steueroptimierung, Förderungen und Altersvorsorge in einem Wizard und liefert priorisierte Empfehlungen mit ehrlichen Szenarien.

> Vollständiger fachlicher Kontext: siehe [`CLAUDE.md`](./CLAUDE.md).

## Stand

**Phase 1 – MVP komplett** (lokal speichert in LocalStorage, Supabase-Migration kommt in Phase 2)

- ✅ Next.js 16 + TypeScript strict + Tailwind 4
- ✅ Brand-Theme (Cream/Berry/Orange) + DM Serif Display / Inter
- ✅ Konfigurations-Werte zentralisiert in `config/` (AVD 2027, HHV, Steuern 2026, Rürup, BU, Förderungen)
- ✅ Pure Berechnungen in `lib/calc/`: Steuern, Förderungen, Rürup (mit DRV-Anrechnung), BU-Lücke, Altersvorsorge (mit Inflation + Rendite-Slidern), Score (6 Sub-Scores), Empfehlungen (3-Layer-Priorisierung), Aggregator
- ✅ **53 Tests grün**, Coverage > 80 %
- ✅ Wizard mit 5 Sub-Profilen (Klinik / Wochenbett / Geburtshilfe / Beleg / Praxis), 5 Schritten, LocalStorage-Draft
- ✅ Auswertung mit Hero, Score-Gauge, 3 Pillar-Cards, Lifeline (kritische BU-Zone), Szenarien-Slider, Top-3-Empfehlungen
- ✅ Detail-Views: Steuern (Pauschale vs. Einzelnachweis), Förderungen (AVD/BAV/VL/GKV), Altersvorsorge (BU-Lücke + Rürup + Szenarien)
- ✅ **Doppel-PDF**: Mitnehmer für Hebamme + Vollversion für Berater (via `@react-pdf/renderer`)
- ✅ Print-Stylesheet auf Zusammenfassung
- ✅ CI-Pipeline (lint, typecheck, test, build)
- ⏳ Supabase-Anbindung (Phase 2 mit Auth)

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Supabase-Keys eintragen (Phase 2)
npm run dev                  # http://localhost:3000
```

Du landest direkt auf dem Dashboard. „Neue Beratung" → 5-Schritt-Wizard → Auswertung.
Daten liegen in `localStorage` unter `hebammen-vorsorge:beratungen` und können per Browser-DevTools gelöscht werden.

### Scripts

| Script | Zweck |
|---|---|
| `npm run dev` | Dev-Server |
| `npm run build` | Production-Build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest (`lib/calc` Coverage > 80 %) |
| `npm run test:coverage` | Coverage-Report nach `coverage/` |

## Supabase-Setup (einmalig, für Phase 2)

1. Projekt im Dashboard anlegen (Region Frankfurt für DSGVO)
2. Aus **Settings → API** holen:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Secret key (`sb_secret_…`) → `SUPABASE_SERVICE_ROLE_KEY`
3. Migration ausführen: `supabase/migrations/0001_init.sql` im SQL-Editor einfügen → **Run**
4. Werte in `.env.local` eintragen (nicht committen)

## Projekt-Struktur

```
app/                    Next.js App Router
  (app)/                geschützter Bereich – Header + Footer
    dashboard/
    beratung/
      neu/              Wizard
      [id]/             Auswertung
        steuern/        Detail-View
        foerderungen/
        altersvorsorge/
        zusammenfassung/  Druckansicht + PDF-Export
components/
  ui/                   Buttons, Field, Card
  shared/               AnimatedNumber, Reveal, SourceTooltip
  wizard/               Sub-Profil + 5 Schritte
  results/              Hero, ScoreGauge, PillarCard, Lifeline, Szenarien
  detail/               Vollansichten Steuern / Förderungen / Altersvorsorge
  pdf/                  React-PDF Komponenten (Hebamme + Berater)
config/                 ◀ Single Source of Truth (AVD 2027, HHV, Steuern, Rürup, BU, Förderungen)
lib/
  calc/                 ◀ Pure Berechnungs-Funktionen mit Tests
  supabase/             Browser + Server Clients
  storage/              LocalStorage-Adapter (Supabase-ready)
  hooks/                useLocalStorageState
supabase/migrations/    SQL-Migrations
tests/unit/             Vitest
.github/workflows/      CI
```

## Designentscheidungen (Auszug)

- **Sub-Profile** verkürzen den Wizard von 25 Eingaben auf ~10 sichtbare, weil Berufs-typische Werte vorbefüllt werden.
- **Inflation eingebaut**: Werte kommen nominal UND real (in heutiger Kaufkraft) — ohne das verspricht das Tool Beträge, die nicht zum echten Bedarf passen.
- **DRV-Anrechnung beim Rürup**: Hebammen sind Pflichtmitglied, sonst Höchstbetrag überschätzt.
- **BU-Stresstest „BU mit 50"** macht die statistische Realität (BU 44–56) sichtbar — stärkstes Gesprächs-Argument.
- **3-Layer-Empfehlungen** (Existenz → Substanz → Feinjustage) statt einer flachen Liste.
- **Doppel-PDF**: Mitnehmer für Hebamme ≠ Berater-Doku.

Mehr in [`CLAUDE.md`](./CLAUDE.md) §5, §8, §12 und §13.

## Mitarbeiten

- Werte ändern? Nur in `config/`, nie in `lib/calc/` hartcoden – und `letztePruefung`-Datum aktualisieren.
- Neue Berechnung? Test zuerst (TDD).
- Vor Commits: `npm run lint && npm run typecheck && npm run test:unit && npm run build` müssen grün sein.
