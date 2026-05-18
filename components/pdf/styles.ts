import { StyleSheet } from '@react-pdf/renderer';

export const COLORS = {
  cream: '#FAF3EB',
  berry: '#6B3343',
  orange: '#E89977',
  orangeDeep: '#C77658',
  ink: '#2A2225',
  muted: '#8A7A72',
  rule: '#E5DCD2',
};

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.ink,
    backgroundColor: COLORS.cream,
  },
  brand: { fontSize: 9, color: COLORS.muted, letterSpacing: 2, textTransform: 'uppercase' },
  h1: { fontSize: 24, color: COLORS.berry, marginTop: 8, fontFamily: 'Times-Roman' },
  h2: { fontSize: 14, color: COLORS.berry, marginTop: 24, fontFamily: 'Times-Roman' },
  h3: { fontSize: 11, color: COLORS.berry, marginTop: 12, fontWeight: 700 },
  p: { fontSize: 10, lineHeight: 1.5, color: COLORS.ink, marginTop: 6 },
  small: { fontSize: 8, color: COLORS.muted, marginTop: 4 },
  pillar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pillarBox: {
    flexGrow: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  pillarLabel: { fontSize: 7, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  pillarValue: { fontSize: 18, color: COLORS.berry, marginTop: 4, fontFamily: 'Times-Roman' },
  empfBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  empfTitle: { fontSize: 11, color: COLORS.berry, fontWeight: 700 },
  empfWhy: { fontSize: 9, color: COLORS.ink, marginTop: 4, lineHeight: 1.5 },
  empfImpact: { fontSize: 9, color: COLORS.orangeDeep, marginTop: 4 },
  footer: {
    marginTop: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
});
