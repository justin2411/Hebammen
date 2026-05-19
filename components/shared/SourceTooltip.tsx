'use client';

import { Info } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export interface SourceTooltipProps {
  label: string;
  /** Berechnungs-Erklärung / Quelle / Stand. */
  children: ReactNode;
}

/**
 * Quellen-Tooltip an Zahlen. Briefing-Erweiterung: skeptische Zielgruppe
 * muss jede Zahl ableiten können.
 */
export function SourceTooltip({ label, children }: SourceTooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <span>{label}</span>
      <button
        type="button"
        aria-label="Quelle und Berechnung anzeigen"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted hover:text-berry"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span className="absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded border border-rule bg-white p-3 text-left text-xs leading-relaxed text-ink shadow-lg">
          {children}
        </span>
      )}
    </span>
  );
}
