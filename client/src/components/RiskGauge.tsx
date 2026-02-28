/**
 * RiskGauge — Semicircular animated gauge for cardiovascular risk
 * Design: "Saúde Humanizada" — Warm Clinical
 */

interface RiskGaugeProps {
  risk: number; // 0-100
  category: 'low' | 'borderline' | 'intermediate' | 'high';
  color: string;
}

export function RiskGauge({ risk, category, color }: RiskGaugeProps) {
  const clampedRisk = Math.min(Math.max(risk, 0), 100);
  
  // Gauge arc parameters
  const radius = 60;
  const strokeWidth = 10;
  const cx = 80;
  const cy = 80;
  
  // Semicircle: from 180° to 0° (left to right)
  const startAngle = -180;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle; // 180°
  
  // Calculate arc length
  const circumference = Math.PI * radius; // half circle
  const fillPercent = clampedRisk / 100;
  const dashArray = circumference;
  const dashOffset = circumference * (1 - fillPercent);
  
  // Background arc (gray)
  const bgArcPath = describeArc(cx, cy, radius, -180, 0);
  // Fill arc
  const fillArcPath = describeArc(cx, cy, radius, -180, 0);
  
  // Needle angle
  const needleAngle = -180 + (clampedRisk / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = radius - 8;
  const needleX = cx + needleLength * Math.cos(needleRad);
  const needleY = cy + needleLength * Math.sin(needleRad);

  // Zone markers
  const zones = [
    { pct: 0, label: '0%', color: '#16a34a' },
    { pct: 5, label: '5%', color: '#ca8a04' },
    { pct: 7.5, label: '7.5%', color: '#ea580c' },
    { pct: 20, label: '20%', color: '#dc2626' },
    { pct: 100, label: '', color: '#dc2626' },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="95" viewBox="0 0 160 95" className="overflow-visible">
        {/* Background arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Colored zones */}
        {[
          { start: 0, end: 5, color: '#16a34a' },
          { start: 5, end: 7.5, color: '#ca8a04' },
          { start: 7.5, end: 20, color: '#ea580c' },
          { start: 20, end: 100, color: '#dc2626' },
        ].map((zone, i) => {
          const startAngle = -180 + (zone.start / 100) * 180;
          const endAngle = -180 + (zone.end / 100) * 180;
          const zonePath = describeArc(cx, cy, radius, startAngle, endAngle);
          const zoneCirc = ((endAngle - startAngle) / 360) * 2 * Math.PI * radius;
          return (
            <path
              key={i}
              d={zonePath}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              opacity={0.25}
            />
          );
        })}

        {/* Fill arc up to risk value */}
        <path
          d={fillArcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * fillPercent} ${circumference}`}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: 'rotate(0deg)',
          }}
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        <circle cx={cx} cy={cy} r={2.5} fill="white" />

        {/* Zone labels */}
        {[
          { pct: 0, label: '0' },
          { pct: 5, label: '5%' },
          { pct: 7.5, label: '7.5%' },
          { pct: 20, label: '20%' },
          { pct: 100, label: '100%' },
        ].map((marker) => {
          const angle = -180 + (marker.pct / 100) * 180;
          const rad = (angle * Math.PI) / 180;
          const r = radius + 14;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          return (
            <text
              key={marker.pct}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="#9ca3af"
              fontFamily="DM Sans, sans-serif"
            >
              {marker.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
