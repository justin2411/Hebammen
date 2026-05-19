'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/shared/Reveal';
import { SubProfilStep } from './SubProfilStep';
import { PersoenlichesStep } from './PersoenlichesStep';
import { ArbeitsalltagStep } from './ArbeitsalltagStep';
import { AbsicherungStep } from './AbsicherungStep';
import { ZukunftStep } from './ZukunftStep';
import {
  emptyBeratungDaten,
  SUB_PROFIL_DEFAULTS,
  type BeratungDaten,
  type SubProfil,
} from '@/lib/calc/types';
import { storage } from '@/lib/storage';
import { useLocalStorageState } from '@/lib/hooks/useLocalStorageState';
import { cn } from '@/lib/utils';

const DRAFT_KEY = 'hebammen-vorsorge:wizard-draft';

const STEP_TITLES = ['Profil', 'Persönliches', 'Arbeitsalltag', 'Absicherung', 'Zukunft'] as const;

interface DraftState {
  hebammeName: string;
  daten: BeratungDaten;
}

const EMPTY_DRAFT: DraftState = {
  hebammeName: '',
  daten: emptyBeratungDaten('wochenbett'),
};

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft, clearDraft] = useLocalStorageState<DraftState>(
    DRAFT_KEY,
    EMPTY_DRAFT,
  );
  const [saving, setSaving] = useState(false);

  const { hebammeName, daten } = draft;

  const setHebammeName = (v: string) =>
    setDraft((current) => ({ ...current, hebammeName: v }));

  const updateDaten = (patch: Partial<BeratungDaten>) =>
    setDraft((current) => ({ ...current, daten: { ...current.daten, ...patch } }));

  const setSubProfil = (subProfil: SubProfil) => {
    setDraft((current) => ({
      ...current,
      daten: { ...current.daten, subProfil, ...SUB_PROFIL_DEFAULTS[subProfil] },
    }));
  };

  async function finish() {
    setSaving(true);
    try {
      const beratung = await storage.create({
        hebammeName: hebammeName || 'Neue Beratung',
        datum: new Date().toISOString().slice(0, 10),
        status: 'aktiv',
        daten,
        notizen: {},
        empfehlungenGewaehlt: [],
      });
      clearDraft();
      router.push(`/beratung/${beratung.id}`);
    } finally {
      setSaving(false);
    }
  }

  const isLast = step === STEP_TITLES.length - 1;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <Stepper current={step} />

      <div className="mt-10">
        <Reveal key={step}>
          {step === 0 && <SubProfilStep value={daten.subProfil} onChange={setSubProfil} />}
          {step === 1 && (
            <PersoenlichesStep
              daten={daten}
              hebammeName={hebammeName}
              onChangeName={setHebammeName}
              onChange={updateDaten}
            />
          )}
          {step === 2 && <ArbeitsalltagStep daten={daten} onChange={updateDaten} />}
          {step === 3 && <AbsicherungStep daten={daten} onChange={updateDaten} />}
          {step === 4 && <ZukunftStep daten={daten} onChange={updateDaten} />}
        </Reveal>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-rule pt-6">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück
        </Button>

        <span className="text-sm text-muted">
          Schritt {step + 1} von {STEP_TITLES.length}
        </span>

        {!isLast ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="secondary" onClick={finish} disabled={saving}>
            {saving ? 'Speichere ...' : 'Auswertung anzeigen'}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEP_TITLES.map((title, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={title} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors',
                done && 'border-berry bg-berry text-cream',
                active && 'border-berry bg-cream text-berry',
                !done && !active && 'border-rule bg-cream text-muted',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </span>
            <span
              className={cn(
                'hidden text-xs sm:inline',
                active ? 'text-berry' : done ? 'text-ink' : 'text-muted',
              )}
            >
              {title}
            </span>
            {idx < STEP_TITLES.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1 transition-colors',
                  done ? 'bg-berry' : 'bg-rule',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
