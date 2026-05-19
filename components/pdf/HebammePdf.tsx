'use client';

import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { formatEuro } from '@/lib/utils';
import type { Beratung } from '@/lib/storage';
import type { AggregateResult } from '@/lib/calc/aggregate';

interface Props {
  beratung: Beratung;
  result: AggregateResult;
}

/**
 * Reduzierter "Mitnehmer" für die Hebamme – 2-3 Seiten.
 * Klar, persönlich, ohne Berater-internen Detailgrad.
 */
export function HebammePdf({ beratung, result }: Props) {
  return (
    <Document title={`Hebammen·Vorsorge – Zusammenfassung ${beratung.hebammeName}`}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>Hebammen·Vorsorge — für dich</Text>
        <Text style={pdfStyles.h1}>{beratung.hebammeName}</Text>
        <Text style={pdfStyles.small}>Stand: {beratung.datum}</Text>

        <Text style={pdfStyles.h2}>Dein jährliches Potenzial</Text>
        <Text style={[pdfStyles.h1, { fontSize: 36, marginTop: 4 }]}>
          {formatEuro(result.freigesetztesPotenzialJahr)}
        </Text>
        <Text style={pdfStyles.small}>
          So viel könnte pro Jahr zusätzlich für deine Vorsorge arbeiten.
        </Text>

        <Text style={pdfStyles.h2}>Aus drei Bereichen</Text>
        <View style={pdfStyles.pillar}>
          <View style={pdfStyles.pillarBox}>
            <Text style={pdfStyles.pillarLabel}>Steuer</Text>
            <Text style={pdfStyles.pillarValue}>{formatEuro(result.steuern.ersparnisProJahr)}</Text>
          </View>
          <View style={pdfStyles.pillarBox}>
            <Text style={pdfStyles.pillarLabel}>Förderungen</Text>
            <Text style={pdfStyles.pillarValue}>{formatEuro(result.foerderungen.gesamtProJahr)}</Text>
          </View>
          <View style={pdfStyles.pillarBox}>
            <Text style={pdfStyles.pillarLabel}>Vorsorge-Score</Text>
            <Text style={pdfStyles.pillarValue}>{result.score.total} / 100</Text>
          </View>
        </View>

        <Text style={pdfStyles.h2}>Deine Top-Empfehlungen</Text>
        {result.empfehlungen.length === 0 && (
          <Text style={pdfStyles.p}>
            Stark aufgestellt – auf Basis deiner Eingaben sehen wir keine akuten Lücken.
          </Text>
        )}
        {result.empfehlungen.map((e, idx) => (
          <View key={`${e.bereich}-${idx}`} style={pdfStyles.empfBox}>
            <Text style={pdfStyles.empfTitle}>
              {idx + 1}. {e.title}
            </Text>
            <Text style={pdfStyles.empfWhy}>{e.why}</Text>
            <Text style={pdfStyles.empfImpact}>{e.impact}</Text>
          </View>
        ))}

        <Text style={pdfStyles.footer}>
          Schätzungen, keine Steuer- oder Anlageberatung. Konkrete Konditionen über Steuerberater /
          Versicherungsmakler. Werte-Stand 2026.
        </Text>
      </Page>
    </Document>
  );
}
