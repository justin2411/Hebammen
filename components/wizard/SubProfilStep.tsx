'use client';

import { Building2, Home, Baby, Network, Briefcase } from 'lucide-react';
import { SUB_PROFIL_META, type SubProfil } from '@/lib/calc/types';
import { cn } from '@/lib/utils';

const ICONS: Record<SubProfil, typeof Building2> = {
  klinik: Building2,
  wochenbett: Home,
  geburtshilfe: Baby,
  beleg: Network,
  praxis: Briefcase,
};

const PROFILE_ORDER: SubProfil[] = ['klinik', 'wochenbett', 'geburtshilfe', 'beleg', 'praxis'];

interface SubProfilStepProps {
  value: SubProfil;
  onChange: (v: SubProfil) => void;
}

export function SubProfilStep({ value, onChange }: SubProfilStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-berry">
          Welcher <span className="italic text-orange">Hebammen-Typ</span> bist du?
        </h2>
        <p className="mt-2 text-muted">
          Wir füllen typische Werte schon mal vor – du kannst alles im nächsten Schritt anpassen.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROFILE_ORDER.map((id) => {
          const Icon = ICONS[id];
          const meta = SUB_PROFIL_META[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                'group flex flex-col gap-3 rounded-2xl border bg-white p-5 text-left transition-all',
                active
                  ? 'border-berry shadow-[0_4px_12px_rgba(107,51,67,0.15)]'
                  : 'border-rule hover:border-berry/30',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  active ? 'bg-berry text-cream' : 'bg-cream-dark text-berry',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-lg text-berry">{meta.label}</h3>
                <p className="mt-1 text-sm leading-snug text-muted">{meta.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
