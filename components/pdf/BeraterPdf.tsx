'use client';

import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { formatEuro, formatProzent } from '@/lib/utils';
import { SUB_PROFIL_META } from '@/lib/calc/types';
import type { Beratung } from '@/lib/storage';
import type { AggregateResult } from '@/lib/calc/aggregate';

interface Props {
  beratung: Beratung;
  result: AggregateResult;
}

/**
 * Vollständige Beratungs-Dokumentation für den Berater.
 * Alle Posten, Methodik, Quellen-Hinweise.
 */
export function BeraterPdf({ beratung, result }: Props) {
  const d = beratung.daten;
  return (
    <Document title={`Hebammen·Vorsorge – Berater-Dokumentation ${beratung.hebammeName}`}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>Hebammen·Vorsorge — Berater-Doku</Text>
        <Text style={pdfStyles.h1}>{beratung.hebammeName}</Text>
        <Text style={pdfStyles.small}>
          Stand: {beratung.datum} · Profil: {SUB_PROFIL_META[d.subProfil].label}
        </Text>

        {/* Stammdaten */}
        <Text style={pdfStyles.h2}>Stammdaten</Text>
        <Row label="Alter" value={`${d.alter} J.`} />
        <Row label="Status" value={d.status} />
        <Row label="Familie" value={`${d.verheiratet ? 'verheiratet' : 'ledig'} · ${d.kinder} Kind(er)`} />
        <Row label="Monatsbrutto" value={formatEuro(d.monatsbrutto)} />
        <Row label="DRV-pflichtig" value={d.drvPflicht ? 'ja' : 'nein'} />
        <Row label="Notgroschen" value={`${d.notgroschenMonate} Monatsnettos`} />

        {/* Steuern */}
        <Text style={pdfStyles.h2}>Steuern</Text>
        <Row
          label="Empfehlung"
          value={result.steuern.empfehlung === 'einzelnachweis' ? 'Einzelnachweis' : 'Pauschale'}
        />
        <Row label="Pauschale" value={formatEuro(result.steuern.pauschale)} />
        <Row label="Einzelnachweis (Summe)" value={formatEuro(result.steuern.einzelnachweis.summe)} />
        <Row label="Grenzsteuersatz" value={formatProzent(result.steuern.grenzsteuersatz)} />
        <Row label="Ersparnis p.a." value={formatEuro(result.steuern.ersparnisProJahr)} />

        {/* Förderungen */}
        <Text style={pdfStyles.h2}>Förderungen</Text>
        <Row label="AVD Grundzulage" value={formatEuro(result.foerderungen.avd.grundzulage)} />
        <Row label="AVD Kinderzulage" value={formatEuro(result.foerderungen.avd.kinderzulage)} />
        <Row
          label="AVD Berufseinsteiger"
          value={formatEuro(result.foerderungen.avd.berufseinsteigerBonus)}
        />
        <Row label="BAV (Summe)" value={formatEuro(result.foerderungen.bav.summe)} />
        <Row label="VL AG-Zuschuss" value={formatEuro(result.foerderungen.vl.arbeitgeberzuschuss)} />
        <Row
          label="GKV-Sicherstellung"
          value={formatEuro(result.foerderungen.gkvSicherstellungszuschlag)}
        />
        <Row label="Gesamt p.a." value={formatEuro(result.foerderungen.gesamtProJahr)} />

        {/* BU + Rürup */}
        <Text style={pdfStyles.h2}>BU & Rürup</Text>
        <Row label="BU-Status" value={result.buLuecke.status} />
        <Row
          label="Empfohlene BU-Rente"
          value={formatEuro(result.buLuecke.empfohleneMonatsRente)}
        />
        <Row label="Bestehende BU" value={formatEuro(result.buLuecke.bestehend)} />
        <Row label="BU-Lücke / Monat" value={formatEuro(Math.max(0, result.buLuecke.luecke))} />
        <Row label="Rürup verfügbar" value={formatEuro(result.ruerup.hoechstbetragVerfuegbar)} />
        <Row
          label="DRV-Beitrag (Anrechnung)"
          value={formatEuro(result.ruerup.drvBeitragGeschaetzt)}
        />

        {/* Altersvorsorge */}
        <Text style={pdfStyles.h2}>Altersvorsorge-Szenarien</Text>
        <Row
          label={`Aktuell (${result.altersvorsorge.aktuell.monatlicheRate} €/Mon.)`}
          value={`${formatEuro(result.altersvorsorge.aktuell.endkapital)} nominal / ${formatEuro(result.altersvorsorge.aktuell.endkapitalReal)} real`}
        />
        <Row
          label={`Optimiert (${result.altersvorsorge.optimiert.monatlicheRate} €/Mon.)`}
          value={`${formatEuro(result.altersvorsorge.optimiert.endkapital)} nominal / ${formatEuro(result.altersvorsorge.optimiert.endkapitalReal)} real`}
        />
        <Row
          label={`Maximal (${result.altersvorsorge.maximal.monatlicheRate} €/Mon.)`}
          value={`${formatEuro(result.altersvorsorge.maximal.endkapital)} nominal / ${formatEuro(result.altersvorsorge.maximal.endkapitalReal)} real`}
        />
        <Row
          label={`BU-Stresstest (BU mit ${result.altersvorsorge.buStress.buAlter})`}
          value={`${formatEuro(result.altersvorsorge.buStress.endkapital)} (${formatProzent(result.altersvorsorge.buStress.anteilOhneStress)})`}
        />

        {/* Score */}
        <Text style={pdfStyles.h2}>Vorsorge-Score: {result.score.total} / 100</Text>
        {Object.entries(result.score.subs).map(([k, v]) => (
          <Row key={k} label={k} value={`${v}`} />
        ))}

        {/* Empfehlungen */}
        <Text style={pdfStyles.h2}>Empfehlungen</Text>
        {result.empfehlungen.map((e, idx) => (
          <View key={`${e.bereich}-${idx}`} style={pdfStyles.empfBox}>
            <Text style={pdfStyles.empfTitle}>
              {idx + 1}. ({e.prio}) {e.title}
            </Text>
            <Text style={pdfStyles.empfWhy}>{e.why}</Text>
            <Text style={pdfStyles.empfImpact}>{e.impact}</Text>
            <Text style={pdfStyles.small}>
              Aufwand: {e.effort} · ca. {e.effortMins} Min.
            </Text>
          </View>
        ))}

        <Text style={pdfStyles.footer}>
          Berechnungen basieren auf Werten Stand Mai 2026. Hebammen-Pauschale §3 EStR, AVD
          Bundesrat-Beschluss 8.5.2026, HHV-Stundensatz §134a SGB V. Vereinfachte
          Grenzsteuersatz-Stufen, keine §32a-Formel. BU-Schätzungen ohne Risikovoranfrage.
        </Text>
      </Page>
    </Document>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
      <Text style={{ color: '#8A7A72', fontSize: 9 }}>{label}</Text>
      <Text style={{ color: '#2A2225', fontSize: 9 }}>{value}</Text>
    </View>
  );
}
