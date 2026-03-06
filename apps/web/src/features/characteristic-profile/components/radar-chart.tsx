'use client';

interface RadarChartProps {
  scores: Record<string, number | null>;
}

const AXES = [
  { key: 'visualCognition', label: '視覚認知力' },
  { key: 'auditoryCognition', label: '聴覚認知力' },
  { key: 'dexterity', label: '手先の器用さ' },
  { key: 'physicalEndurance', label: '体力・持久力' },
  { key: 'repetitiveWorkTolerance', label: '反復作業耐性' },
  { key: 'adaptability', label: '変化対応力' },
  { key: 'interpersonalCommunication', label: '対人コミュニケーション' },
  { key: 'concentrationDuration', label: '集中持続' },
  { key: 'stressTolerance', label: 'ストレス耐性' },
];

const COUNT = AXES.length;
const CENTER = 160;
const RADIUS = 110;
const LEVELS = 5;

function normalizeConcentrationDuration(minutes: number | null): number {
  if (minutes == null) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 90) return 3;
  if (minutes <= 120) return 4;
  return 5;
}

function polarToXY(index: number, radius: number) {
  const angle = ((360 / COUNT) * index - 90) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

export function RadarChart({ scores }: RadarChartProps) {
  const gridLines = Array.from({ length: LEVELS }, (_, i) => {
    const level = i + 1;
    const r = (RADIUS / LEVELS) * level;
    const points = Array.from({ length: COUNT }, (_, j) => {
      const { x, y } = polarToXY(j, r);
      return `${x},${y}`;
    }).join(' ');
    return (
      <polygon
        key={level}
        points={points}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="1"
      />
    );
  });

  const axisLines = Array.from({ length: COUNT }, (_, i) => {
    const { x, y } = polarToXY(i, RADIUS);
    return (
      <line
        key={i}
        x1={CENTER}
        y1={CENTER}
        x2={x}
        y2={y}
        stroke="#f3f4f6"
        strokeWidth="1"
      />
    );
  });

  const dataPoints = AXES.map(({ key }, i) => {
    let score = scores[key] ?? 0;
    if (key === 'concentrationDuration') {
      score = normalizeConcentrationDuration(scores[key]);
    }
    const r = (RADIUS / LEVELS) * score;
    return polarToXY(i, r);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const dots = dataPoints.map((p, i) => (
    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ffc000" />
  ));

  const labelElements = AXES.map(({ key, label }, i) => {
    const { x, y } = polarToXY(i, RADIUS + 30);
    const rawScore = scores[key];
    let displayScore: string | null = null;
    if (key === 'concentrationDuration') {
      displayScore = rawScore != null ? `${rawScore}分` : null;
    } else {
      displayScore = rawScore != null ? String(rawScore) : null;
    }
    return (
      <text
        key={key}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-600 text-[10px] font-medium"
      >
        <tspan x={x} dy="-0.3em">
          {label}
        </tspan>
        {displayScore != null && (
          <tspan
            x={x}
            dy="1.3em"
            className="fill-[#ffc000] text-[11px] font-bold"
          >
            {displayScore}
          </tspan>
        )}
      </text>
    );
  });

  return (
    <div
      className="flex justify-center"
      role="img"
      aria-label="特性プロファイルレーダーチャート"
    >
      <svg width="320" height="320" viewBox="0 0 320 320">
        {gridLines}
        {axisLines}
        <polygon
          points={dataPolygon}
          fill="#ffc000"
          fillOpacity="0.35"
          stroke="#ffc000"
          strokeWidth="2"
        />
        {dots}
        {labelElements}
      </svg>
    </div>
  );
}
