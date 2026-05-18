'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { computeWealth, type VorsorgeResult } from '@/lib/calc';
import { formatEuro } from '@/lib/utils';

interface LifelineProps {
  alter: number;
  ausstiegsalter: number;
  startCapital: number;
  aktuelleSparrate: number;
  optimierteSparrate: number;
  rendite: number;
  buStress: VorsorgeResult['buStress'];
}

const BU_KRITISCH_START = 44;
const BU_KRITISCH_ENDE = 56;

/**
 * Lebenslinie der Vorsorge – Vermögenskurve, kritische BU-Zone, Renteneintritt.
 */
export function Lifeline({
  alter,
  ausstiegsalter,
  startCapital,
  aktuelleSparrate,
  optimierteSparrate,
  rendite,
  buStress,
}: LifelineProps) {
  const data: Array<{ alter: number; aktuell: number; optimiert: number; mitBu?: number }> = [];

  for (let a = alter; a <= ausstiegsalter; a += 1) {
    const j = a - alter;
    const istVorBu = a <= buStress.buAlter;
    data.push({
      alter: a,
      aktuell: Math.round(computeWealth(aktuelleSparrate, j, rendite, startCapital)),
      optimiert: Math.round(computeWealth(optimierteSparrate, j, rendite, startCapital)),
      mitBu: istVorBu
        ? Math.round(computeWealth(optimierteSparrate, j, rendite, startCapital))
        : Math.round(
            computeWealth(optimierteSparrate, buStress.buAlter - alter, rendite, startCapital) *
              Math.pow(1 + rendite, a - buStress.buAlter),
          ),
    });
  }

  return (
    <div className="rounded-2xl border border-rule bg-white p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="font-serif text-xl text-berry">Vermögensverlauf</h3>
          <p className="text-xs text-muted">
            Aktuell · Optimiert · Stresstest „BU mit {buStress.buAlter}&quot;
          </p>
        </div>
        <div className="hidden gap-4 text-xs text-muted sm:flex">
          <Legend color="#8A7A72" label="aktuell" />
          <Legend color="#6B3343" label="optimiert" />
          <Legend color="#B85450" label="mit BU" dashed />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="optimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E89977" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#E89977" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5DCD2" vertical={false} />
            <XAxis
              dataKey="alter"
              tick={{ fill: '#8A7A72', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5DCD2' }}
            />
            <YAxis
              tick={{ fill: '#8A7A72', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5DCD2' }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              formatter={(value: number) => formatEuro(value)}
              labelFormatter={(a) => `Alter ${a}`}
              contentStyle={{
                background: '#fff',
                border: '1px solid #E5DCD2',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <ReferenceArea
              x1={BU_KRITISCH_START}
              x2={BU_KRITISCH_ENDE}
              fill="#B85450"
              fillOpacity={0.06}
              label={{ value: 'BU-Risiko', fontSize: 10, fill: '#B85450', position: 'insideTop' }}
            />
            <ReferenceLine
              x={ausstiegsalter}
              stroke="#6B3343"
              strokeDasharray="3 3"
              label={{ value: 'Ausstieg', fontSize: 10, fill: '#6B3343', position: 'top' }}
            />
            <Area
              type="monotone"
              dataKey="optimiert"
              stroke="#6B3343"
              strokeWidth={2.5}
              fill="url(#optimGrad)"
            />
            <Area
              type="monotone"
              dataKey="aktuell"
              stroke="#8A7A72"
              strokeWidth={2}
              fill="none"
            />
            <Area
              type="monotone"
              dataKey="mitBu"
              stroke="#B85450"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-6"
        style={{
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`
            : color,
        }}
      />
      {label}
    </span>
  );
}
