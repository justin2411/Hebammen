'use client';

import { useEffect, useRef, useState } from 'react';

export interface AnimatedNumberProps {
  value: number;
  /** Dauer in ms. Default 1800. */
  duration?: number;
  /** Funktion, die den Zwischenwert in einen String formatiert. */
  format?: (n: number) => string;
  className?: string;
  /** Verzögerung in ms vor dem Start. */
  delay?: number;
}

/**
 * Smooth-Counter mit requestAnimationFrame und ease-out-cubic.
 * Briefing §7.2 — animierte Zahlen 1500–2200 ms.
 */
export function AnimatedNumber({
  value,
  duration = 1800,
  format = (n) => Math.round(n).toLocaleString('de-DE'),
  className,
  delay = 0,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    startRef.current = null;
    let frame: number;

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t + delay;
      const elapsed = Math.max(0, t - startRef.current);
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      setDisplay(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, delay]);

  return <span className={className}>{format(display)}</span>;
}
