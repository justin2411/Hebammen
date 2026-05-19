import {
  Coins,
  Gift,
  TrendingUp,
  Sprout,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export type ModulId =
  | 'steuern'
  | 'foerderungen'
  | 'altersvorsorge'
  | 'vermoegensaufbau'
  | 'bu-schutz';

export interface ModulMeta {
  id: ModulId;
  slug: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Akzentfarbe (Tailwind class fragment) */
  accent: 'orange' | 'berry' | 'green';
  /** Kurze, ehrliche Beschreibung – für TopicSelector. */
  subtitle: string;
}

export const MODULE: Record<ModulId, ModulMeta> = {
  steuern: {
    id: 'steuern',
    slug: 'steuern',
    label: 'Steuern',
    shortLabel: 'Steuern',
    icon: Coins,
    accent: 'orange',
    subtitle:
      'Pauschale oder Einzelnachweis – was bringt dir mehr? Mit Hebammen-spezifischer Rechnung.',
  },
  foerderungen: {
    id: 'foerderungen',
    slug: 'foerderungen',
    label: 'Förderungen',
    shortLabel: 'Förderung',
    icon: Gift,
    accent: 'orange',
    subtitle:
      'AVD-Zulagen, Klinikzuschuss, GKV-Sicherstellung – was du jedes Jahr automatisch liegen lässt.',
  },
  altersvorsorge: {
    id: 'altersvorsorge',
    slug: 'altersvorsorge',
    label: 'Altersvorsorge',
    shortLabel: 'Vorsorge',
    icon: TrendingUp,
    accent: 'berry',
    subtitle:
      'Schicht 1+2: DRV, Rürup mit echter Anrechnung, AVD. Was die gesetzliche Rente wirklich liefert.',
  },
  vermoegensaufbau: {
    id: 'vermoegensaufbau',
    slug: 'vermoegensaufbau',
    label: 'Vermögensaufbau',
    shortLabel: 'Vermögen',
    icon: Sprout,
    accent: 'green',
    subtitle:
      'Schicht 3 – flexibel verfügbar. Genau dort, wo dich Rürup & AVD nicht hinlassen: vor 62.',
  },
  'bu-schutz': {
    id: 'bu-schutz',
    slug: 'bu-schutz',
    label: 'BU-Schutz',
    shortLabel: 'BU',
    icon: Shield,
    accent: 'berry',
    subtitle:
      'Größtes Existenzrisiko für Hebammen. Statistisch trifft es zwischen 44 und 56. Was deckt dich wirklich?',
  },
};

export const MODUL_REIHENFOLGE: ModulId[] = [
  'bu-schutz',
  'steuern',
  'foerderungen',
  'altersvorsorge',
  'vermoegensaufbau',
];
