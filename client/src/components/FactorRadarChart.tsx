/**
 * FactorRadarChart — Radar chart for cardiovascular risk factors
 * Design: "Saúde Humanizada" — Warm Clinical
 */

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { FactorScore } from '@/lib/cardiovascularRisk';

interface FactorRadarChartProps {
  factors: FactorScore[];
}

export function FactorRadarChart({ factors }: FactorRadarChartProps) {
  const data = factors.map(f => ({
    subject: f.name,
    score: f.score,
    value: f.value,
    status: f.status,
  }));

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Radar de Fatores de Risco</h4>
      <p className="text-xs text-muted-foreground">Quanto maior a área, melhor o perfil de risco.</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}
          />
          <Radar
            name="Seu perfil"
            dataKey="score"
            stroke="oklch(0.38 0.12 0)"
            fill="oklch(0.38 0.12 0)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value}/100 — ${props.payload.value}`,
              'Pontuação',
            ]}
            contentStyle={{
              fontSize: '12px',
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: 'white',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { status: 'good', label: 'Bom', color: '#16a34a' },
          { status: 'borderline', label: 'Limítrofe', color: '#ca8a04' },
          { status: 'poor', label: 'Atenção', color: '#dc2626' },
        ].map(item => (
          <div key={item.status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Factor details */}
      <div className="space-y-1.5 mt-2">
        {factors.map(f => (
          <div key={f.name} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: f.status === 'good' ? '#16a34a' : f.status === 'borderline' ? '#ca8a04' : '#dc2626',
                }}
              />
              <span className="text-xs font-medium text-foreground/80">{f.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-foreground">{f.value}</span>
              <p className="text-xs text-muted-foreground">{f.reference}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
