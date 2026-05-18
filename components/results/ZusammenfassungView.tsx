'use client';

import { useState } from 'react';
import { FileDown, Mail, Printer } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { aggregate } from '@/lib/calc/aggregate';
import { formatEuro } from '@/lib/utils';
import type { Beratung } from '@/lib/storage';
import { SUB_PROFIL_META } from '@/lib/calc/types';

interface ZusammenfassungViewProps {
  beratung: Beratung;
}

async function downloadPdf(filename: string, render: () => Promise<Blob>) {
  const blob = await render();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ZusammenfassungView({ beratung }: ZusammenfassungViewProps) {
  const [busy, setBusy] = useState<'hebamme' | 'berater' | null>(null);
  const result = aggregate(beratung.daten);

  // PDFs werden lazy via dynamic import generiert, damit @react-pdf/renderer
  // nicht im normalen Bundle landet.
  async function exportHebamme() {
    setBusy('hebamme');
    try {
      const [{ pdf }, { HebammePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/HebammePdf'),
      ]);
      const doc = <HebammePdf beratung={beratung} result={result} />;
      await downloadPdf(
        `Vorsorge-Mitnehmer-${beratung.hebammeName.replace(/\s+/g, '_')}.pdf`,
        () => pdf(doc).toBlob(),
      );
    } finally {
      setBusy(null);
    }
  }

  async function exportBerater() {
    setBusy('berater');
    try {
      const [{ pdf }, { BeraterPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/BeraterPdf'),
      ]);
      const doc = <BeraterPdf beratung={beratung} result={result} />;
      await downloadPdf(
        `Berater-Doku-${beratung.hebammeName.replace(/\s+/g, '_')}.pdf`,
        () => pdf(doc).toBlob(),
      );
    } finally {
      setBusy(null);
    }
  }

  function emailVorlage() {
    const subject = `Deine Vorsorge-Zusammenfassung – ${beratung.hebammeName}`;
    const body =
      `Hallo ${beratung.hebammeName},\n\n` +
      `anbei deine persönliche Zusammenfassung aus unserer heutigen Beratung.\n\n` +
      `Dein jährliches Potenzial: ${formatEuro(result.freigesetztesPotenzialJahr)}\n` +
      `Vorsorge-Score: ${result.score.total}/100\n\n` +
      `Empfohlene nächste Schritte:\n` +
      result.empfehlungen.map((e, i) => `${i + 1}. ${e.title}`).join('\n') +
      `\n\nMelde dich gerne, wenn Rückfragen aufkommen.\n`;
    window.location.href = `mailto:${beratung.hebammeEmail ?? ''}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 print:py-0">
      <div className="print:hidden">
        <h1 className="font-serif text-4xl text-berry">
          <span className="italic text-orange">Zusammenfassung</span>
        </h1>
        <p className="mt-2 text-muted">
          Für {beratung.hebammeName} – {SUB_PROFIL_META[beratung.daten.subProfil].label}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button onClick={exportHebamme} disabled={busy !== null} variant="secondary">
            <FileDown className="h-4 w-4" />
            {busy === 'hebamme' ? 'Erzeuge ...' : 'PDF für Hebamme'}
          </Button>
          <Button onClick={exportBerater} disabled={busy !== null} variant="primary">
            <FileDown className="h-4 w-4" />
            {busy === 'berater' ? 'Erzeuge ...' : 'PDF für Berater'}
          </Button>
          <Button onClick={() => window.print()} variant="ghost">
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
          <Button onClick={emailVorlage} variant="ghost">
            <Mail className="h-4 w-4" />
            E-Mail-Vorlage
          </Button>
        </div>
      </div>

      {/* Druckansicht: das ist der eigentliche Inhalt, der bei print rauskommt */}
      <div className="mt-10 space-y-6 print:mt-0 print:space-y-3">
        <Card>
          <p className="text-xs uppercase tracking-widest text-muted">Beratung</p>
          <h2 className="mt-1 font-serif text-2xl text-berry">{beratung.hebammeName}</h2>
          <p className="text-xs text-muted">Stand: {beratung.datum}</p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryStat label="Jährliches Potenzial" value={formatEuro(result.freigesetztesPotenzialJahr)} />
          <SummaryStat label="Vorsorge-Score" value={`${result.score.total} / 100`} />
          <SummaryStat
            label="Endkapital optimiert"
            value={formatEuro(result.altersvorsorge.optimiert.endkapital)}
            sub={`über ${result.altersvorsorge.jahreBisAusstieg} Jahre`}
          />
        </div>

        <Card>
          <h3 className="font-serif text-lg text-berry">Wo das Potenzial herkommt</h3>
          <dl className="mt-3 grid gap-y-1 text-sm sm:grid-cols-2">
            <Row label="Steuer-Ersparnis" value={result.steuern.ersparnisProJahr} />
            <Row label="AVD-Zulagen" value={result.foerderungen.avd.summe} />
            <Row label="BAV-Effekt" value={result.foerderungen.bav.summe} />
            <Row label="VL Arbeitgeber" value={result.foerderungen.vl.arbeitgeberzuschuss} />
            <Row
              label="GKV-Sicherstellung"
              value={result.foerderungen.gkvSicherstellungszuschlag}
            />
          </dl>
        </Card>

        <Card>
          <h3 className="font-serif text-lg text-berry">Empfehlungen</h3>
          {result.empfehlungen.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Keine akuten Lücken erkennbar.</p>
          ) : (
            <ol className="mt-3 space-y-3 text-sm">
              {result.empfehlungen.map((e, idx) => (
                <li key={`${e.bereich}-${idx}`}>
                  <span className="font-medium text-berry">
                    {idx + 1}. {e.title}
                  </span>
                  <p className="mt-1 text-ink/80">{e.why}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <p className="text-xs leading-relaxed text-muted">
          Schätzungen, keine Steuer- oder Anlageberatung. Konkrete Konditionen über Steuerberater /
          Versicherungsmakler. Werte-Stand Mai 2026.
        </p>
      </div>
    </main>
  );
}

function SummaryStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-serif text-2xl text-berry tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums text-ink sm:text-right">{formatEuro(value)}</dd>
    </>
  );
}
