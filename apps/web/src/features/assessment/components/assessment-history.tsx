'use client';

import { useEffect, useState } from 'react';
import {
  type AssessmentData,
  fetchAssessmentHistory,
} from '../api';
import { PentagonChart } from './pentagon-chart';

interface AssessmentHistoryProps {
  onSelectComparison?: (current: AssessmentData, previous: AssessmentData) => void;
}

export function AssessmentHistory({ onSelectComparison }: AssessmentHistoryProps) {
  const [history, setHistory] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    fetchAssessmentHistory()
      .then(setHistory)
      .catch(() => setError('履歴の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">まだアセスメント履歴がありません。</p>
      </div>
    );
  }

  const selected = history[selectedIdx];
  const previous = selectedIdx < history.length - 1 ? history[selectedIdx + 1] : null;

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {history.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelectedIdx(idx)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              idx === selectedIdx
                ? 'bg-[#ffc000] text-gray-900'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {item.period}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <PentagonChart
          scores={{
            d1: selected.d1Score,
            d2: selected.d2Score,
            d3: selected.d3Score,
            d4: selected.d4Score,
            d5: selected.d5Score,
          }}
          previousScores={
            previous
              ? {
                  d1: previous.d1Score,
                  d2: previous.d2Score,
                  d3: previous.d3Score,
                  d4: previous.d4Score,
                  d5: previous.d5Score,
                }
              : undefined
          }
        />
        {previous && (
          <p className="mt-2 text-center text-xs text-gray-400">
            オレンジ: {selected.period} / グレー: {previous.period}
          </p>
        )}
      </div>

      {/* Score comparison table */}
      <div className="space-y-2">
        {[
          { key: 'd1Score' as const, label: 'D1: 職務遂行' },
          { key: 'd2Score' as const, label: 'D2: 労働習慣' },
          { key: 'd3Score' as const, label: 'D3: 対人関係' },
          { key: 'd4Score' as const, label: 'D4: 感情制御' },
          { key: 'd5Score' as const, label: 'D5: 自己管理' },
        ].map(({ key, label }) => {
          const current = selected[key];
          const prev = previous?.[key];
          const diff =
            current != null && prev != null
              ? Math.round((current - prev) * 10) / 10
              : null;

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5"
            >
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#ffc000]">
                  {current?.toFixed(1) ?? '-'}
                </span>
                {diff !== null && diff !== 0 && (
                  <span
                    className={`text-xs font-semibold ${
                      diff > 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {diff > 0 ? '+' : ''}
                    {diff.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare button */}
      {previous && onSelectComparison && (
        <button
          onClick={() => onSelectComparison(selected, previous)}
          className="w-full rounded-xl border-2 border-[#ffc000] bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#ffc000]/5"
        >
          {selected.period} vs {previous.period} を詳細比較
        </button>
      )}
    </div>
  );
}
