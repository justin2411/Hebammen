'use client';

interface Props {
  /** Prozent von 0 bis 100 (Werte über 100 werden gecappt). */
  prozent: number;
  size?: 'sm' | 'lg';
}

/**
 * Halbkreis-Gauge — visualisiert „X % erreicht".
 * Rot < 40 %, Orange 40–80 %, Grün ≥ 80 %.
 */
export function WunschGauge({ prozent, size = 'sm' }: Props) {
  const clamped = Math.max(0, Math.min(100, prozent));
  const dim = size === 'lg' ? { w: 160, h: 96, r: 64, sw: 16 } : { w: 92, h: 56, r: 36, sw: 10 };
  const circumference = Math.PI * dim.r;
  const dashOffset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 80 ? '#6B8E6F' : clamped >= 40 ? '#C77658' : '#B85450';

  // Halbkreis: links unten = (cx - r, cy), rechts unten = (cx + r, cy)
  const cx = dim.w / 2;
  const cy = dim.h - dim.sw / 2;
  const left = cx - dim.r;
  const right = cx + dim.r;

  return (
    <svg width={dim.w} height={dim.h} viewBox={`0 0 ${dim.w} ${dim.h}`}>
      <path
        d={`M ${left} ${cy} A ${dim.r} ${dim.r} 0 0 1 ${right} ${cy}`}
        fill="none"
        stroke="#E5DCD2"
        strokeWidth={dim.sw}
        strokeLinecap="round"
      />
      <path
        d={`M ${left} ${cy} A ${dim.r} ${dim.r} 0 0 1 ${right} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={dim.sw}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
      />
    </svg>
  );
}
