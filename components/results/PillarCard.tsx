'use client';

import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { formatEuro } from '@/lib/utils';

interface PillarCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  /** Unter dem Hauptwert: kumulierter Wert über N Jahre. */
  cumulativeLabel?: string;
  cumulativeValue?: number;
  href?: string;
  delay?: number;
}

export function PillarCard({
  icon: Icon,
  label,
  value,
  cumulativeLabel,
  cumulativeValue,
  href,
  delay = 0,
}: PillarCardProps) {
  const inner = (
    <div className="group flex h-full flex-col gap-5 rounded-2xl border border-rule bg-white p-6 transition-all hover:border-berry/30 hover:shadow-[0_4px_16px_rgba(107,51,67,0.08)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark text-berry">
          <Icon className="h-5 w-5" />
        </span>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-berry" />
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
        <p className="mt-1 font-serif text-4xl text-berry tabular-nums">
          <AnimatedNumber value={value} delay={delay} format={(n) => formatEuro(n)} />
        </p>
        <p className="mt-1 text-xs text-muted">pro Jahr Potenzial</p>
      </div>

      {cumulativeValue !== undefined && cumulativeLabel && (
        <div className="mt-auto border-t border-rule pt-3 text-xs">
          <span className="text-muted">{cumulativeLabel}: </span>
          <span className="font-medium text-ink tabular-nums">
            <AnimatedNumber
              value={cumulativeValue}
              delay={delay + 400}
              format={(n) => formatEuro(n)}
            />
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href as never} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
