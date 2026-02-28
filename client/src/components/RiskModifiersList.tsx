/**
 * RiskModifiersList — List of risk modifiers with impact indicators
 * Design: "Saúde Humanizada" — Warm Clinical
 */

import type { RiskModifier } from '@/lib/cardiovascularRisk';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskModifiersListProps {
  modifiers: RiskModifier[];
}

export function RiskModifiersList({ modifiers }: RiskModifiersListProps) {
  if (modifiers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">Nenhum modificador de risco identificado além dos fatores base.</p>
      </div>
    );
  }

  const increases = modifiers.filter(m => m.impact === 'increases');
  const decreases = modifiers.filter(m => m.impact === 'decreases');

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Os modificadores abaixo foram aplicados ao risco base calculado pelas Equações de Coorte Agrupadas (ASCVD).
      </p>

      {increases.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            Aumentam o risco ({increases.length})
          </h5>
          {increases.map((m, i) => (
            <ModifierCard key={i} modifier={m} />
          ))}
        </div>
      )}

      {decreases.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-green-500" />
            Reduzem o risco ({decreases.length})
          </h5>
          {decreases.map((m, i) => (
            <ModifierCard key={i} modifier={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModifierCard({ modifier }: { modifier: RiskModifier }) {
  const isIncrease = modifier.impact === 'increases';
  const magnitudeColors = {
    low: isIncrease ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100',
    moderate: isIncrease ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100',
    high: isIncrease ? 'bg-red-100 border-red-200' : 'bg-emerald-100 border-emerald-200',
  };

  const iconColors = {
    increases: { low: '#ea580c', moderate: '#dc2626', high: '#b91c1c' },
    decreases: { low: '#16a34a', moderate: '#15803d', high: '#166534' },
    neutral: { low: '#6b7280', moderate: '#6b7280', high: '#6b7280' },
  };

  const iconColor = iconColors[modifier.impact][modifier.magnitude];

  return (
    <div className={`rounded-lg border p-3 ${magnitudeColors[modifier.magnitude]}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {modifier.impact === 'increases' ? (
            <TrendingUp className="w-4 h-4" style={{ color: iconColor }} />
          ) : modifier.impact === 'decreases' ? (
            <TrendingDown className="w-4 h-4" style={{ color: iconColor }} />
          ) : (
            <Minus className="w-4 h-4" style={{ color: iconColor }} />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground/90 leading-tight">{modifier.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{modifier.description}</p>
          <span className={`inline-block mt-1.5 text-xs px-1.5 py-0.5 rounded font-medium ${
            modifier.magnitude === 'high' ? 'bg-white/60 text-foreground/70' : 'bg-white/40 text-foreground/60'
          }`}>
            Impacto {modifier.magnitude === 'high' ? 'alto' : modifier.magnitude === 'moderate' ? 'moderado' : 'baixo'}
          </span>
        </div>
      </div>
    </div>
  );
}
