'use client';

import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { formatEuro } from '@/lib/utils';
import type { Beratung } from '@/lib/storage';
import type { AggregateResult } from '@/lib/calc/aggregate';
import { buildTopicInsights } from '@/lib/calc/topicInsights';
import { EMPFEHLUNG_TO_MODUL, MODULE, MODUL_REIHENFOLGE } from '@/lib/calc/module';

interface Props {
  beratung: Beratung;
  result: AggregateResult;
}

/**
 * "Mitnehmer" für die Hebamme – 2-3 Seiten.
 * Klar, persönlich, ohne Berater-internen Detailgrad.
 * Spiegelt die 5 Module + Empfehlungen + nächste Schritte.
 */
export function HebammePdf({ beratung, result }: Props) {
  const insights = buildTopicInsights(result, beratung.daten);

  return (
    <Document title={`Hebammen·Vorsorge – Zusammenfassung ${beratung.hebammeName}`}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>Hebammen·Vorsorge — für dich</Text>
        <Text style={pdfStyles.h1}>{beratung.hebammeName}</Text>
        <Text style={pdfStyles.small}>
          Stand: {beratung.datum} · Vorsorge-Score: {result.score.total} / 100
        </Text>

        <Text style={pdfStyles.h2}>Dein jährliches Potenzial</Text>
        <Text style={[pdfStyles.h1, { fontSize: 32, marginTop: 4 }]}>
          {formatEuro(result.freigesetztesPotenzialJahr)}
        </Text>
        <Text style={pdfStyles.small}>
          Über {result.altersvorsorge.jahreBisAusstieg} Berufsjahre kumuliert{' '}
          {formatEuro(
            result.freigesetztesPotenzialJahr * result.altersvorsorge.jahreBisAusstieg,
          )}
          {' '}— bei gleichem Lebensstil, einfach durch klügere Aufstellung.
        </Text>

        <Text style={pdfStyles.h2}>Deine fünf Themen — auf einen Blick</Text>
        <View style={pdfStyles.topicGrid}>
          {MODUL_REIHENFOLGE.map((id) => {
            const insight = insights[id];
            const meta = MODULE[id];
            return (
              <View key={id} style={pdfStyles.topicBox}>
                <Text style={pdfStyles.topicLabel}>{meta.label}</Text>
                <Text style={pdfStyles.topicKicker}>{insight.kicker}</Text>
                <Text style={pdfStyles.topicValue}>{insight.value}</Text>
              </View>
            );
          })}
        </View>

        <Text style={pdfStyles.h2}>Was als nächstes ansteht</Text>
        {result.empfehlungen.length === 0 && (
          <Text style={pdfStyles.p}>
            Stark aufgestellt – auf Basis deiner Eingaben sehen wir keine akuten Lücken.
          </Text>
        )}
        {result.empfehlungen.map((e, idx) => {
          const modul = MODULE[EMPFEHLUNG_TO_MODUL[e.bereich]];
          return (
            <View key={`${e.bereich}-${idx}`} style={pdfStyles.empfBox}>
              <Text style={pdfStyles.empfTitle}>
                {idx + 1}. {e.title}
              </Text>
              <Text style={pdfStyles.empfWhy}>{e.why}</Text>
              <Text style={pdfStyles.empfImpact}>{e.impact}</Text>
              <Text style={pdfStyles.empfModulHint}>
                Thema: {modul.label} · etwa {e.effortMins} Min Aufwand
              </Text>
            </View>
          );
        })}

        <Text style={pdfStyles.footer}>
          Schätzungen, keine Steuer- oder Anlageberatung. Konkrete Konditionen
          über Steuerberater:in / Versicherungsmakler:in. Werte-Stand 2026.
          {'\n'}Erstellt mit Hebammen·Vorsorge.
        </Text>
      </Page>
    </Document>
  );
}
