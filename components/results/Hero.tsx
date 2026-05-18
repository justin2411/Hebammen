'use client';

import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { Reveal } from '@/components/shared/Reveal';
import { formatEuro } from '@/lib/utils';

interface HeroProps {
  hebammeName: string;
  jahresPotenzial: number;
  jahreBisAusstieg: number;
  kumuliertesPotenzial: number;
}

export function Hero({
  hebammeName,
  jahresPotenzial,
  jahreBisAusstieg,
  kumuliertesPotenzial,
}: HeroProps) {
  return (
    <Reveal>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Beratung für {hebammeName}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-berry md:text-5xl">
          Dein <span className="italic text-orange">jährliches Potenzial</span>
        </h1>
        <p className="mt-8 font-serif text-7xl leading-none text-berry tabular-nums md:text-8xl">
          <AnimatedNumber value={jahresPotenzial} duration={2000} format={(n) => formatEuro(n)} />
        </p>
        <p className="mt-4 text-sm text-muted">
          Über {jahreBisAusstieg} Jahre bis Ausstieg kumuliert ergibt das ≈{' '}
          <span className="font-medium text-ink tabular-nums">
            {formatEuro(kumuliertesPotenzial)}
          </span>
          .
        </p>
      </div>
    </Reveal>
  );
}
