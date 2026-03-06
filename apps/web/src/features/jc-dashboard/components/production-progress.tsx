'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchProductionProgress, type ProductionProgress } from '../api';

const STATUS_CONFIG = [
  { key: 'pending' as const, label: '受付中', color: 'bg-yellow-400', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { key: 'confirmed' as const, label: '確定', color: 'bg-blue-400', textColor: 'text-blue-700', bgLight: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'inProduction' as const, label: '制作中', color: 'bg-purple-400', textColor: 'text-purple-700', bgLight: 'bg-purple-50', borderColor: 'border-purple-200' },
  { key: 'delivered' as const, label: '納品済み', color: 'bg-green-400', textColor: 'text-green-700', bgLight: 'bg-green-50', borderColor: 'border-green-200' },
] as const;

export function ProductionProgressTab() {
  const [data, setData] = useState<ProductionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProductionProgress();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-lg font-medium text-gray-500">
          本日の注文はありません
        </p>
      </div>
    );
  }

  const progressPercent = data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">全体進捗</h3>
          <span className="text-sm font-bold text-gray-900">
            {data.delivered} / {data.total} 件納品済み ({progressPercent}%)
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Pipeline bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          パイプライン
        </h3>
        <div className="flex h-6 overflow-hidden rounded-full bg-gray-100">
          {STATUS_CONFIG.map(({ key, color }) => {
            const count = data[key];
            const pct = data.total > 0 ? (count / data.total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={key}
                className={`${color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${count}件`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex gap-4">
          {STATUS_CONFIG.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_CONFIG.map(({ key, label, textColor, bgLight, borderColor }) => (
          <div
            key={key}
            className={`rounded-xl border ${borderColor} ${bgLight} p-4`}
          >
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${textColor}`}>
              {data[key]}
              <span className="ml-1 text-sm font-normal text-gray-400">件</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
