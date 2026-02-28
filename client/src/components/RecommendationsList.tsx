/**
 * RecommendationsList — Personalized cardiovascular recommendations
 * Design: "Saúde Humanizada" — Warm Clinical
 */

import type { Recommendation } from '@/lib/cardiovascularRisk';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const high = recommendations.filter(r => r.priority === 'high');
  const medium = recommendations.filter(r => r.priority === 'medium');
  const low = recommendations.filter(r => r.priority === 'low');

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Recomendações personalizadas com base no seu perfil de risco. Discuta estas orientações com seu médico.
      </p>

      {high.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-red-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Prioridade Alta
          </h5>
          {high.map((r, i) => <RecommendationCard key={i} rec={r} />)}
        </div>
      )}

      {medium.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-orange-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            Prioridade Média
          </h5>
          {medium.map((r, i) => <RecommendationCard key={i} rec={r} />)}
        </div>
      )}

      {low.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-blue-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Manutenção
          </h5>
          {low.map((r, i) => <RecommendationCard key={i} rec={r} />)}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const priorityStyles = {
    high: 'bg-red-50 border-red-100',
    medium: 'bg-orange-50 border-orange-100',
    low: 'bg-blue-50 border-blue-100',
  };

  const categoryStyles = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`rounded-lg border p-3 ${priorityStyles[rec.priority]}`}>
      <div className="flex items-start gap-2.5">
        <span className="text-lg flex-shrink-0 mt-0.5">{rec.icon}</span>
        <div>
          <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded mb-1 ${categoryStyles[rec.priority]}`}>
            {rec.category}
          </span>
          <p className="text-xs text-foreground/80 leading-relaxed">{rec.text}</p>
        </div>
      </div>
    </div>
  );
}
