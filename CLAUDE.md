# CLAUDE.md

> **Briefing für Claude Code**
> Dieses Dokument ist der zentrale Kontext für die Entwicklung des Hebammen-Vorsorge-Beratungstools.
> Lies es vollständig, bevor du Code änderst. Halte es aktuell, wenn sich Entscheidungen ändern.

---

## 1. Projekt-Zweck

Dieses Tool ist ein **interaktives Beratungs-Cockpit**, das ein Finanzberater (der Nutzer dieses Tools) gemeinsam mit Hebammen in Beratungsgesprächen einsetzt. Es hat zwei Hauptfunktionen:

1. **Potenzial-Rechner**: Daten der Hebamme eingeben → Berechnung des maximal möglichen finanziellen Potenzials in drei Bereichen (Steueroptimierung, Förderungen, Altersvorsorge).
2. **Beratungs-Begleiter**: Strukturierte Gespräche, Notizen pro Thema, Status-Tracking, Zusammenfassung als PDF/E-Mail-Text.

Die Zielgruppe sind Hebammen in Deutschland – ein Berufsstand mit spezifischen Steuer- und Fördermöglichkeiten, hohem BU-Risiko, oft frühem Berufsausstieg vor 67 und einer ausgeprägten Skepsis gegenüber Finanzvertrieb. Das Tool muss **inhaltlich präzise, optisch hochwertig und ethisch sauber** sein.

### Was es NICHT ist
- Kein Vergleichsportal für konkrete Produkte
- Keine Abschluss-Maschine
- Keine reine Sales-Pipeline

Es ist ein **Beratungs-Werkzeug**, das echte Klarheit für die Hebamme schafft und dem Berater ermöglicht, fundiert zu arbeiten.

---

## 2. Tech-Stack

| Layer | Technologie | Begründung |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Server Components, gute Vercel-Integration, SEO falls später Marketing-Seite |
| Sprache | **TypeScript (strict mode)** | Berechnungen müssen typsicher sein |
| Styling | **Tailwind CSS** + **shadcn/ui** | Schnelle, konsistente UI, Komponenten als Code nicht als Dependency |
| Datenbank | **Supabase (Postgres)** | Auth, Realtime, Row-Level-Security |
| Auth | **Supabase Auth (Magic Link)** | Niedrige Friction für den Berater |
| Charts | **Recharts** | Bewährt, gute API, passt zum Design |
| Icons | **Lucide React** | Konsistent, Open Source |
| Animations | **Framer Motion** (sparsam) | Nur für Reveals und Transitions |
| PDF-Export | **react-pdf** oder serverseitig **puppeteer** | PDF-Zusammenfassungen für Hebammen |
| Hosting | **Vercel** | Automatic Deploys aus main |
| CI/CD | **GitHub Actions** | Tests, Linting, Type-Check auf jedes PR |
| Tests | **Vitest** (unit) + **Playwright** (e2e) | Berechnungen müssen getestet sein |

---

## 3. Projektstruktur

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            # Authed layout
│   │   ├── dashboard/page.tsx    # Sessions-Übersicht
│   │   ├── beratung/
│   │   │   ├── neu/page.tsx      # Wizard
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Auswertung
│   │   │   │   ├── steuern/page.tsx
│   │   │   │   ├── foerderungen/page.tsx
│   │   │   │   ├── altersvorsorge/page.tsx
│   │   │   │   └── zusammenfassung/page.tsx
│   │   └── einstellungen/page.tsx
│   └── api/
│       └── pdf/[id]/route.ts     # PDF-Generation
│
├── components/
│   ├── ui/                       # shadcn/ui Komponenten
│   ├── wizard/                   # Wizard-Schritte
│   ├── results/                  # Ergebnis-Bausteine (Hero, Score, Pillars, Lifeline)
│   ├── detail/                   # Detail-Views
│   └── shared/                   # AnimatedNumber, Reveal, etc.
│
├── lib/
│   ├── calc/                     # PURE Berechnungsfunktionen — vollständig getestet
│   │   ├── steuern.ts
│   │   ├── foerderungen.ts
│   │   ├── altersvorsorge.ts
│   │   ├── score.ts
│   │   └── empfehlungen.ts
│   ├── supabase/
│   │   ├── client.ts             # Browser
│   │   ├── server.ts             # Server
│   │   └── types.ts              # generated db types
│   └── utils.ts
│
├── config/                       # SINGLE SOURCE OF TRUTH für Parameter
│   ├── hhv.ts                    # Hebammenhilfevertrag
│   ├── avd.ts                    # Altersvorsorgedepot 2027
│   ├── ruerup.ts                 # Basisrente
│   ├── steuern.ts                # Pauschalen, Grenzsteuersätze
│   ├── bu.ts                     # BU-Tarif-Annahmen
│   └── index.ts                  # re-exports
│
├── content/                      # Texte, Tipps, Empfehlungen
│   ├── tips.ts                   # Beratungs-Tipps pro Bereich
│   └── empfehlungen.ts           # Empfehlungs-Templates
│
├── tests/
│   ├── unit/                     # vitest
│   └── e2e/                      # playwright
│
├── .github/workflows/
│   ├── ci.yml                    # Lint, Type, Test, Build auf jedes PR
│   └── deploy.yml                # Vercel-Deploy auf main
│
├── CLAUDE.md                     # ← Diese Datei
├── README.md
├── package.json
└── ...
```

---

## 4. Datenmodell (Supabase)

### Tabelle: `users`
Wird automatisch über Supabase Auth angelegt. Ein User = ein Berater.

### Tabelle: `beratungen`
```sql
create table beratungen (
  id uuid primary key default gen_random_uuid(),
  berater_id uuid references auth.users(id) not null,
  hebamme_name text not null,
  hebamme_email text,
  datum date not null default current_date,
  status text not null default 'aktiv' check (status in ('aktiv', 'archiviert')),
  daten jsonb not null,           -- siehe Schema unten
  notizen jsonb default '{}'::jsonb,
  empfehlungen_gewaehlt jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table beratungen enable row level security;
create policy "berater_sieht_eigene" on beratungen
  for all using (auth.uid() = berater_id);
```

### `beratungen.daten` JSONB-Schema
```typescript
interface BeratungDaten {
  // Persönliches
  alter: number;
  status: 'angestellt' | 'freiberuflich' | 'beleg' | 'kombi';
  geburtshilfe: boolean;
  monatsbrutto: number;
  verheiratet: boolean;
  kinder: number;
  kinderUeber6: number;

  // Arbeitsalltag (für Steueroptimierung)
  kilometer: number;
  homeofficeTage: number;
  fortbildungen: number;
  equipment: number;

  // Status quo
  hatBU: boolean;
  nutztFoerderungen: boolean;
  steueroptimiert: boolean;
  hatFlexibleVorsorge: boolean;

  // Zukunft
  aktuelleSparrate: number;
  startCapital: number;
  ausstiegsalter: number;

  // Version für Migrations
  schemaVersion: number;
}
```

### Tabelle: `parameter_log` (Audit-Trail)
```sql
create table parameter_log (
  id uuid primary key default gen_random_uuid(),
  parameter_typ text not null,    -- z.B. 'avd_grundzulage'
  alter_wert jsonb,
  neuer_wert jsonb,
  geaendert_von uuid references auth.users(id),
  begruendung text,
  created_at timestamptz default now()
);
```
Wenn der Berater einen Parameter ändert (z.B. neue Förderhöhe), wird das geloggt. Wichtig für Rückfragen: "Auf welcher Grundlage habt ihr gerechnet?"

---

## 5. Berechnungslogik (pure Funktionen in `lib/calc/`)

**WICHTIG**: Alle Berechnungen müssen **pure Funktionen** sein – kein Side-Effekt, gleiche Eingabe → gleiche Ausgabe. Das macht sie testbar und audit-fähig.

### `lib/calc/steuern.ts`
Berechnet Steuerersparnis. Bei Freiberuflichen vergleicht Hebammen-Betriebsausgabenpauschale (25%, max. 1.535 €) mit Einzelnachweis (Kilometerpauschale + Homeoffice + Fortbildungen + Equipment) und empfiehlt das günstigere. Multipliziert mit geschätztem Grenzsteuersatz.

### `lib/calc/foerderungen.ts`
Berechnet jährliche Fördersumme: AVD-Zulagen (Grund + Kind + Berufseinsteiger), BAV (Klinikzuschuss + SV-Ersparnis), VL, GKV-Sicherstellungszuschlag bei Geburtshilfe, Frühstart-Rente.

### `lib/calc/altersvorsorge.ts`
Compound-Interest-Funktion: `computeWealth(monthly, years, rate, startCapital)`. Berechnet auch:
- Aktuelles Szenario
- Optimiertes Szenario (aktuelle Sparrate + 70% des freigesetzten Potenzials)
- Maximales Szenario (alles ausgereizt)
- Versorgungslücke

### `lib/calc/score.ts`
Vorsorge-Score 0–100, basierend auf 5 Sub-Scores:
- Sparquote (in % vom Einkommen)
- BU-Schutz (binär ja/nein → 95/15)
- Förderquote
- Steuer-Optimierung
- Flexibilität (3. Schicht vorhanden?)

### `lib/calc/empfehlungen.ts`
Generiert priorisierte Top-3-Empfehlungen basierend auf Lücken. Logik:
- Wenn keine BU → Prio 1 BU
- Wenn Sparquote < 10% → Sparrate erhöhen
- Wenn Förderungen nicht genutzt → AVD setup
- Etc.

Jede Empfehlung hat: `prio`, `title`, `why`, `impact`, `effort`, `effortMins`.

---

## 6. Konfiguration als Code (`config/`)

Alle externen Parameter (Förderhöhen, Steuersätze, HHV-Werte) sind in `config/` zentralisiert. **Nie im Berechnungscode hartkodieren.**

### Beispiel: `config/avd.ts`
```typescript
export const AVD_2027 = {
  startdatum: '2027-01-01',
  grundzulage: {
    stufe1: { bis: 360, prozent: 0.50 },     // 50% bis 360 €
    stufe2: { bis: 1800, prozent: 0.25 },    // 25% bis 1.800 €
    maxZulage: 540,
  },
  kinderzulage: {
    proKind: 300,
    erforderlicherEigenbeitragProKind: 300,
  },
  berufseinsteigerBonus: {
    alterMax: 25,
    betrag: 200,
    einmalig: true,
  },
  maxEinzahlbar: 6840,                       // pro Depot/Jahr
  rechtsstand: '2026-05-08',                 // Bundesrat-Beschluss
  letztePruefung: '2026-05-18',
} as const;
```

### Beispiel: `config/steuern.ts`
```typescript
export const STEUERN_2026 = {
  hebammenpauschale: {
    prozentVomUmsatz: 0.25,
    maxBetrag: 1535,
    rechtsgrundlage: 'EStR §3, BMF-Schreiben',
  },
  kilometerpauschale: 0.30,                  // pro km
  homeofficePauschale: {
    proTag: 6,
    maxTage: 210,
    maxBetrag: 1260,
  },
  werbungskostenPauschbetrag: 1230,
  ruerupHoechstbetrag: {
    ledig: 30826,
    verheiratet: 61652,
    absetzbarProzent: 1.00,                  // 100% seit 2023
  },
  grenzsteuerStufen: [
    { bis: 12000, satz: 0.14 },
    { bis: 18000, satz: 0.20 },
    { bis: 25000, satz: 0.26 },
    { bis: 35000, satz: 0.32 },
    { bis: 50000, satz: 0.36 },
    { bis: 65000, satz: 0.40 },
    { bis: 280000, satz: 0.42 },
    { bis: Infinity, satz: 0.45 },
  ],
} as const;
```

### Beispiel: `config/hhv.ts`
```typescript
export const HHV = {
  inkraftSeit: '2025-11-01',
  letzteAenderung: '2026-04-01',
  stundensatzAusserklinisch: 74.28,
  stundensatzBeleg: 59.40,
  abrechnungstakt: 5,                        // 5-Minuten-Takt
  beleghebammen: {
    parallelBetreuung: { erste: 0.80, zweite: 0.30, dritte: 0.30 },
    einbussePotenziellBisZu: 0.30,
  },
  studie2025: {
    quelle: 'opta data Hebammenstudie 2025',
    berufswechselGedanken: 0.436,
  },
} as const;
```

**Wenn sich Werte ändern**: nur diese Dateien anpassen, **nicht** den Berechnungscode. Tests prüfen, dass alles weiter passt.

---

## 7. UI / Design-System

### Marken-Farben
```typescript
export const BRAND = {
  cream: '#FAF3EB',
  creamDark: '#F5EDE3',
  berry: '#6B3343',
  berryDeep: '#4A1E2A',
  berryLight: '#8B4A5B',
  orange: '#E89977',
  orangeSoft: '#F2C4AC',
  orangeDeep: '#C77658',
  green: '#A8B9A1',
  text: '#2A2225',
  muted: '#8A7A72',
  rule: '#E5DCD2',
  white: '#FFFFFF',
  danger: '#B85450',
  warning: '#D4A574',
  success: '#6B8E6F',
} as const;
```

### Typografie
- **Headlines**: Serif – `Georgia` als Fallback, **DM Serif Display** als Webfont (Google Fonts)
- **Body**: Sans – `Inter` als Webfont, System-Fallback
- **Akzent**: Italic + Orange für zentrale Begriffe in Headlines (sehr distinktiv für die Marke)
- Typografie immer mit `tabular-nums` für Zahlen

### Design-Prinzipien
1. **Gestaffelte Reveals**: Inhalte erscheinen nacheinander (200–300ms Stagger). Nicht überanimieren.
2. **Animierte Zahlen**: Zentrale Beträge zählen smooth hoch (ease-out cubic, 1500–2200ms).
3. **Cream-Background**: Keine harten Weiß-Flächen außer Cards.
4. **Berry für Autorität**, **Orange für Akzent**, sparsam mischen.
5. **Großzügige Whitespace** – keine Info-Wand.
6. **Editorial-Anmutung** – mehr Magazin als App.

### Komponenten-Patterns
- **Pillar-Cards**: Icon + Label + große Zahl (animiert) + Subtitle + ggf. kumulierter Wert
- **Reveal-Wrapper**: `<Reveal delay={200}>` für gestaffelten Auftritt
- **AnimatedNumber**: Smooth-Counter mit `requestAnimationFrame`
- **ScoreGauge**: SVG-Kreissegment mit progress
- **Lifeline**: SVG-Timeline mit Vermögenskurve, Markern, kritischer Zone

---

## 8. Inhaltlicher Stand (Mai 2026) — wichtig für Berechnungen

### Hebammenhilfevertrag (HHV)
- Schiedsspruch April 2025, in Kraft seit **1.11.2025**, aktualisiert **1.4.2026**
- Stundensatz außerklinisch: **74,28 €** (vorher 56 €)
- 5-Minuten-Abrechnungstakt
- Beleghebammen: bis zu 30% Einbußen bei Parallelbetreuung
- Quelle: GKV-Spitzenverband, DHV

### Altersvorsorgedepot (AVD)
- Bundestag-Beschluss: **27. März 2026**
- Bundesrat-Zustimmung: **8. Mai 2026**
- Start: **1. Januar 2027**
- Maximale Grundzulage: **540 €/Jahr**
- Kinderzulage: **300 €/Kind**
- Berufseinsteiger-Bonus: **200 € einmalig** (unter 25)
- Max. förderfähiger Eigenbeitrag: **1.800 €/Jahr**
- Riester läuft mit Bestandsschutz weiter, ab 2027 keine Neuabschlüsse

### Rürup (Basisrente)
- Höchstbetrag 2026: **30.826 €** (Ledige) / **61.652 €** (Verheiratete)
- 100% absetzbar
- Pflichtbeiträge zur DRV werden angerechnet (relevant für Hebammen!)

### Hebammen-Steuerpauschale
- 25% des Umsatzes, max. **1.535 €/Jahr**
- Ohne Einzelnachweis
- Rechtsgrundlage: §3 EStR

### Statistik (für Argumentation)
- ~24.000 Hebammen in DE, davon ~19.000 freiberuflich
- 99% Frauen
- 43,6% denken über Berufswechsel nach (opta data 2025)
- BU statistisch zwischen 44–56 Jahren
- Nervenerkrankungen sind häufigste BU-Ursache

**Alle Quellen mit Datum im `config/` dokumentieren.** Bei Änderungen: Audit-Log-Eintrag in `parameter_log`.

---

## 9. CI/CD-Pipeline

### `.github/workflows/ci.yml`
Läuft auf jedem PR und Push zu main:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### `.github/workflows/deploy.yml`
Vercel-Deploy passiert automatisch über die Vercel-GitHub-Integration. Hier nur ein Smoke-Test gegen Production nach Deploy:

```yaml
name: Smoke Test Production

on:
  deployment_status:

jobs:
  smoke:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: curl -f ${{ github.event.deployment_status.target_url }}
      # später: echte Playwright-Smoke-Tests gegen Production
```

### Pflicht-Checks vor Merge
- ✅ Lint (ESLint + Prettier)
- ✅ Typecheck (`tsc --noEmit`)
- ✅ Unit Tests (Coverage > 80% für `lib/calc/`)
- ✅ Build erfolgreich
- ✅ E2E mindestens für Happy Path Wizard → Auswertung

---

## 10. Test-Strategie

### Was MUSS getestet sein
- **Alle Funktionen in `lib/calc/`** — mit konkreten Test-Cases pro Berufsform und Familiensituation
- **Grenzsteuersatz-Schätzung** — verschiedene Einkommen, ledig/verheiratet
- **Hebammen-Pauschale vs. Einzelnachweis** — beide Fälle erzwingen
- **Score-Berechnung** — Edge Cases: 0%, 100%, gemischte Eingaben
- **Empfehlungs-Generator** — verschiedene Lücken-Konstellationen

### Beispiel Test (`tests/unit/calc/steuern.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import { calcSteuern } from '@/lib/calc/steuern';

describe('calcSteuern', () => {
  it('empfiehlt Pauschale bei wenigen Einzelbelegen (Freiberuflich)', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 5000,
      verheiratet: false,
      kilometer: 1000,
      homeofficeTage: 50,
      fortbildungen: 200,
      equipment: 100,
    });
    // 1535 € (Pauschale, gedeckelt) > 300 + 300 + 200 + 100 = 900 €
    expect(result.empfehlung).toBe('pauschale');
    expect(result.bestBA).toBe(1535);
  });

  it('empfiehlt Einzelnachweis bei hohem km-Anteil', () => {
    const result = calcSteuern({
      status: 'freiberuflich',
      monatsbrutto: 5000,
      verheiratet: false,
      kilometer: 8000,
      homeofficeTage: 100,
      fortbildungen: 800,
      equipment: 400,
    });
    // 2400 + 600 + 800 + 400 = 4200 € > 1535 € Pauschale
    expect(result.empfehlung).toBe('einzelnachweis');
  });
});
```

### E2E Happy Path (Playwright)
1. Login → Dashboard
2. Neue Beratung starten → alle 5 Wizard-Schritte
3. Auswertung wird angezeigt mit korrekten Zahlen
4. Klick auf "Altersvorsorge" → Slider funktionieren, Chart aktualisiert
5. Zusammenfassung als PDF exportieren

---

## 11. Sicherheit & Datenschutz

Da hier persönliche Finanzdaten von Hebammen verarbeitet werden, ist DSGVO ernst zu nehmen:

- **Row Level Security** in Supabase aktiviert — ein Berater sieht nur eigene Daten
- **Hebammen-E-Mails optional** — nicht erforderlich für Tool-Nutzung
- **Daten-Export** für jede Hebamme möglich (DSGVO Art. 20)
- **Daten-Löschung** auf Anfrage (DSGVO Art. 17) — Soft-Delete + harter Cron-Job nach 30 Tagen
- **Kein Tracking, keine Analytics von Drittanbietern** — Vercel Analytics auf Off
- **HTTPS only**, secure cookies
- **Secrets** ausschließlich in Vercel Environment Variables, nie ins Repo

---

## 12. Wichtige Design-Entscheidungen (mit Begründung)

### 1. Warum 3. Schicht bevorzugt?
Hebammen werden statistisch zwischen 44–56 berufsunfähig. Wer mit 55 aufhören muss, braucht **Geld vor 62/65** — genau dort sind AVD und Rürup gesperrt. Die 3. Schicht (ETF, Nettopolice) ist jederzeit verfügbar. Das ist **kein Vertriebsargument, sondern eine fachliche Realität für diese Zielgruppe**. AVD-Zulagen werden trotzdem mitgenommen — Geld nicht liegen lassen — aber der Hauptaufbau läuft flexibel.

### 2. Warum animierte Riesen-Zahlen?
Das kumulierte Potenzial über 30 Jahre ist **objektiv beeindruckend** (oft sechsstellig). Eine ehrliche, dramatische Visualisierung dieser Zahl macht Klarheit — die meisten Hebammen unterschätzen den Hebel der Zeit massiv.

### 3. Warum 5-Schritt-Wizard?
Tests zeigen: Hebammen-Termine sind oft 60–90 Min. Wizard sollte in 3–4 Min durchlaufen sein, damit genug Zeit fürs Gespräch bleibt. 5 Schritte mit klaren Themen sind besser als 1 langes Formular.

### 4. Warum Vorsorge-Score?
Schafft eine **gemeinsame Sprache** zwischen Berater und Hebamme. "Score 35/100" ist eingängiger als 5 verschiedene Kennzahlen. Sub-Scores zeigen wo's hakt.

### 5. Warum Cream/Berry/Orange?
Markenidentität aus der bestehenden Präsentation. Warm, weiblich-konnotiert ohne klischeehaft, professionell-editorial. Bewusster Abstand zu typischen Finanz-Blau-Designs.

---

## 13. Was Claude bei Änderungen beachten muss

### Berechnungslogik ändern
1. **Test schreiben, der den neuen Fall abdeckt** (TDD)
2. Berechnung in `lib/calc/` anpassen
3. **Konfigurations-Werte nur in `config/` ändern, nie in `lib/calc/`**
4. `letztePruefung`-Datum in `config/` aktualisieren
5. Falls relevant: Audit-Log-Eintrag im README erwähnen

### UI-Komponente bauen
1. **shadcn/ui prüfen** ob es schon was Passendes gibt
2. Konsistent zum Design-System (Farben aus `config/brand.ts`)
3. Mobile-first denken — Beratung läuft auch mal am Tablet
4. Storybook-Eintrag (optional, falls eingerichtet)

### Neue Datenfelder einführen
1. **Migration** in `supabase/migrations/`
2. **TypeScript-Types** regenerieren (`supabase gen types`)
3. **Schema-Version** im JSON erhöhen
4. **Migrations-Funktion** für alte Daten schreiben

### Neue externe Daten / Gesetze
1. Quelle dokumentieren mit Datum
2. In `config/` aufnehmen
3. Test schreiben mit Beispielrechnung aus offiziellem Material
4. Audit-Log-Eintrag erstellen
5. UI ggf. mit "Stand: XX.YY.2026"-Hinweis versehen

### Was Claude NICHT tun soll
- Werte hartkodieren (immer aus `config/`)
- Berechnungen "vereinfachen", wenn das die fachliche Genauigkeit reduziert
- Sales-y Sprache ("Sichern Sie sich jetzt!", "Letzte Chance!") — die Zielgruppe ist skeptisch und intelligent
- Genderspezifisch werden ohne Anlass — die Hebamme ist die Hauptperson, aber das Tool soll auch für Partner (ggf. männlich) funktionieren
- Drittanbieter-Scripts/Analytics einfügen ohne Rücksprache
- BU-Konditionen versprechen, die wir nicht kennen — immer als Schätzung kennzeichnen

---

## 14. Roadmap / Phasen

### Phase 1 — MVP (Woche 1–2)
- [x] Wizard mit 5 Schritten
- [x] Auswertung mit Score, 3 Pillars, Timeline, Szenarien, Empfehlungen
- [x] Detail-Views für Steuern, Förderungen, Altersvorsorge
- [x] Persistente Sessions (Supabase)
- [x] Login (Magic Link)
- [x] PDF-Export der Zusammenfassung

### Phase 2 — Tiefe (Woche 3–4)
- [ ] BU-Tarif-Schätzung je nach Alter (Tabelle pflegbar)
- [ ] Mehrere Szenarien pro Hebamme speichern ("Lena Stand heute" / "Lena mit 2. Kind")
- [ ] Inflations-Toggle (real vs. nominal)
- [ ] Admin-Bereich für Parameter-Pflege ohne Code-Änderung
- [ ] Stand-Hinweis "Daten Stand: XX.YY.2026" überall im UI

### Phase 3 — Beratungs-Workflow (Woche 5–6)
- [ ] Notizfelder pro Bereich während des Gesprächs
- [ ] "Mitnehmer"-Generator: was die Hebamme als E-Mail/PDF mitbekommt
- [ ] Folgetermin-Planung
- [ ] Wiedervorlage-System

### Phase 4 — Nice-to-have (später)
- [ ] Self-Service-Modus für Hebammen (eigener Vor-Check vor Beratung)
- [ ] Benchmark "Andere Hebammen deines Alters" (anonymisiert)
- [ ] Newsletter-Trigger bei Gesetzesänderungen
- [ ] Mehrsprachigkeit (DE/EN, falls international)

---

## 15. Erster Auftrag an Claude Code

Wenn du dieses Repo zum ersten Mal öffnest:

1. **Lies diese CLAUDE.md vollständig.**
2. **Initialisiere das Projekt**:
   - Next.js 14 mit App Router, TypeScript strict, Tailwind, ESLint
   - Installiere: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `recharts`, `framer-motion`, `class-variance-authority`, `clsx`, `tailwind-merge`
   - Initialisiere shadcn/ui mit Cream/Berry/Orange-Theme
   - Konfiguriere Vitest und Playwright
3. **Erstelle die Ordnerstruktur** wie unter Abschnitt 3 beschrieben.
4. **Lege die config/-Dateien** mit den Werten aus Abschnitt 8 an.
5. **Schreibe die `lib/calc/`-Funktionen** mit vollem Test-Coverage. **Nicht** die UI vor den Berechnungen!
6. **Baue dann die UI** — Wizard zuerst, dann Auswertung, dann Detail-Views.
7. **Supabase-Setup** als letzten Schritt (zuerst lokales Storage, dann Migration auf Supabase).
8. **CI/CD-Pipeline** einrichten.
9. **README.md schreiben** mit Setup-Anleitung für den Berater.

**Stoppe nach jedem größeren Schritt** und melde Zwischenstand. Lieber kleine PRs als ein Monster-PR.

---

## 16. Kontext über den Auftraggeber (Berater)

Der Berater ist Finanzdienstleister mit Fokus auf Hebammen als Zielgruppe. Hat eine bestehende Präsentation mit der Marke "Hebammen·Vorsorge" — Cream/Berry/Orange, serifige Headlines mit italic Orange-Akzenten. Das Tool soll **in diese Optik passen**.

Der Berater nutzt das Tool **im Gespräch** vor sich auf dem Laptop, oft auch mit der Hebamme an seiner Seite — d.h. die Hebamme sieht den Bildschirm. Das beeinflusst Design-Entscheidungen:
- Keine internen Bemerkungen sichtbar
- Keine "Sales-Hinweise" im UI
- Tonalität: "wir schauen gemeinsam", nicht "Sie müssen jetzt..."
- Hebammen sind gebildet, kritisch, anti-Pushy — das UI muss respektvoll bleiben

---

## 17. Wenn du unsicher bist

- **Frag nach**, bevor du Annahmen über Fachliches triffst
- **Linke Quellen**, wenn du externe Daten in `config/` einträgst
- **Schreibe Tests zuerst**, wenn Berechnungslogik geändert wird
- **Halte diese Datei aktuell** — wenn Architektur-Entscheidungen sich ändern, hier dokumentieren

---

*Letzter Stand dieser Datei: Mai 2026. Bei Updates: Datum oben aktualisieren und Änderungen committen.*
