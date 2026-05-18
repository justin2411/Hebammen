# Hebammen·Vorsorge

Interaktives Beratungs-Cockpit für Finanzberatung mit Hebammen.
Berechnet Steueroptimierung, Förderungen und Altersvorsorge in einem strukturierten 5-Schritt-Wizard und liefert priorisierte Empfehlungen.

> Vollständiger fachlicher Kontext: siehe [`CLAUDE.md`](./CLAUDE.md).

## Stand

**Phase 1 – Foundation (in Arbeit)**
- ✅ Next.js 16 + TypeScript strict + Tailwind 4
- ✅ Brand-Theme (Cream/Berry/Orange) + DM Serif Display / Inter
- ✅ Konfigurations-Werte zentralisiert in `config/` (AVD 2027, HHV, Steuern 2026, Rürup, BU, Förderungen)
- ✅ Pure Berechnungs-Funktionen in `lib/calc/` (Steuern, Förderungen, Altersvorsorge, Score, Empfehlungen) – 37 Tests grün
- ✅ Supabase Clients + Migrations-SQL + Type-Definitionen
- ✅ CI-Pipeline (lint, typecheck, test, build)
- ⏳ Wizard, Auswertung, Detail-Views, PDF (Schritt 2)
- ⏳ Auth (Phase 2)

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Werte eintragen
npm run dev                  # http://localhost:3000
```

### Verfügbare Scripts

| Script | Was es macht |
|---|---|
| `npm run dev` | Dev-Server |
| `npm run build` | Production-Build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest (lib/calc Coverage > 80 %) |
| `npm run test:coverage` | Coverage-Report nach `coverage/` |

## Supabase-Setup (einmalig)

1. Projekt im Dashboard anlegen (Region Frankfurt für DSGVO)
2. Aus **Settings → API** holen:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Secret key (`sb_secret_…`) → `SUPABASE_SERVICE_ROLE_KEY`
3. Migration ausführen: `supabase/migrations/0001_init.sql` im SQL-Editor einfügen → **Run**
4. Werte in `.env.local` eintragen (nicht committen)

## Projekt-Struktur

```
app/             Next.js App Router
components/      UI-Komponenten (folgt)
config/          ◀ Single Source of Truth für alle Parameter
lib/calc/        ◀ Pure Berechnungs-Funktionen (volle Test-Coverage)
lib/supabase/    DB-Clients (browser + server)
supabase/        SQL-Migrations
tests/unit/      Vitest
.github/         CI-Workflows
```

## Mitarbeiten

- Werte ändern? Nur in `config/`, nie in `lib/calc/` hartcoden – und `letztePruefung`-Datum aktualisieren.
- Neue Berechnung? Test zuerst.
- Details zu Entscheidungen, Tonalität, Sicherheit: [`CLAUDE.md`](./CLAUDE.md).
