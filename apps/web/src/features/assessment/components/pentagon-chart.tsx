'use client';

type Scores = {
  d1: number | null;
  d2: number | null;
  d3: number | null;
  d4: number | null;
  d5: number | null;
};

interface PentagonChartProps {
  scores: Scores;
  previousScores?: Scores;
}

const LABELS = [
  { key: 'd1' as const, label: 'D1: 職務遂行' },
  { key: 'd2' as const, label: 'D2: 労働習慣' },
  { key: 'd3' as const, label: 'D3: 対人関係' },
  { key: 'd4' as const, label: 'D4: 感情制御' },
  { key: 'd5' as const, label: 'D5: 自己管理' },
];

const CENTER = 150;
const RADIUS = 110;
const LEVELS = 5;

function polarToXY(angle: number, radius: number) {
  // Start from top (-90deg), go clockwise
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function getVertexAngle(index: number) {
  return (360 / 5) * index;
}

export function PentagonChart({ scores, previousScores }: PentagonChartProps) {
  // Grid lines for each level
  const gridLines = Array.from({ length: LEVELS }, (_, i) => {
    const level = i + 1;
    const r = (RADIUS / LEVELS) * level;
    const points = Array.from({ length: 5 }, (_, j) => {
      const { x, y } = polarToXY(getVertexAngle(j), r);
      return `${x},${y}`;
    }).join(' ');
    return <polygon key={level} points={points} fill="none" stroke="#f3f4f6" strokeWidth="1" />;
  });

  // Axis lines from center to each vertex
  const axisLines = Array.from({ length: 5 }, (_, i) => {
    const { x, y } = polarToXY(getVertexAngle(i), RADIUS);
    return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#f3f4f6" strokeWidth="1" />;
  });

  // Data polygon
  const dataPoints = LABELS.map(({ key }, i) => {
    const score = scores[key] ?? 0;
    const r = (RADIUS / LEVELS) * score;
    return polarToXY(getVertexAngle(i), r);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Labels
  const labelElements = LABELS.map(({ key, label }, i) => {
    const { x, y } = polarToXY(getVertexAngle(i), RADIUS + 28);
    const score = scores[key];
    return (
      <text
        key={key}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-600 text-[11px] font-medium"
      >
        <tspan x={x} dy="-0.3em">{label}</tspan>
        {score != null && (
          <tspan x={x} dy="1.3em" className="fill-[#ffc000] text-[12px] font-bold">
            {score.toFixed(1)}
          </tspan>
        )}
      </text>
    );
  });

  // Score dots
  const dots = dataPoints.map((p, i) => (
    <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ffc000" />
  ));

  // Previous data polygon (for comparison overlay)
  const prevPolygon = previousScores
    ? LABELS.map(({ key }, i) => {
        const score = previousScores[key] ?? 0;
        const r = (RADIUS / LEVELS) * score;
        const p = polarToXY(getVertexAngle(i), r);
        return `${p.x},${p.y}`;
      }).join(' ')
    : null;

  return (
    <div className="flex justify-center" role="img" aria-label="五角形アセスメントチャート">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {gridLines}
        {axisLines}
        {prevPolygon && (
          <polygon
            points={prevPolygon}
            fill="#9ca3af"
            fillOpacity="0.15"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
        <polygon
          points={dataPolygon}
          fill="#ffc000"
          fillOpacity="0.35"
          stroke="#ffc000"
          strokeWidth="2.5"
        />
        {dots}
        {labelElements}
      </svg>
    </div>
  );
}
