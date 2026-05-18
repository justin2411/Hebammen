'use client';

import { AnimatedNumber } from '@/components/shared/AnimatedNumber';

interface ScoreGaugeProps {
  /** 0..100 */
  value: number;
  size?: number;
  label?: string;
}

const STROKE = 14;

/**
 * SVG-Kreissegment-Anzeige für den Vorsorge-Score.
 * Farbe wechselt nach Schwelle.
 */
export function ScoreGauge({ value, size = 200, label = 'Vorsorge-Score' }: ScoreGaugeProps) {
  const r = size / 2 - STROKE / 2;
  const circumference = 2 * Math.PI * r;
  // 270° Bogen (3/4 Kreis), unten offen.
  const arc = circumference * 0.75;
  const offset = arc * (1 - Math.min(1, Math.max(0, value / 100)));

  const color =
    value >= 75
      ? '#6B8E6F' // success
      : value >= 50
        ? '#E89977' // orange
        : value >= 30
          ? '#D4A574' // warning
          : '#B85450'; // danger

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E5DCD2"
            strokeWidth={STROKE}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.2, 0.65, 0.3, 1)' }}
          />
        </g>
      </svg>
      <div className="-mt-32 flex flex-col items-center">
        <AnimatedNumber
          value={value}
          format={(n) => `${Math.round(n)}`}
          className="font-serif text-5xl text-berry tabular-nums"
        />
        <span className="text-xs uppercase tracking-widest text-muted">von 100</span>
      </div>
    </div>
  );
}
