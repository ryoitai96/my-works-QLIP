'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type AssessmentData, fetchLatestAssessment } from '../api';
import { AssessmentForm } from './assessment-form';
import { PentagonChart } from './pentagon-chart';

export function AssessmentPageContent() {
  const router = useRouter();
  const [latestData, setLatestData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadLatest = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchLatestAssessment();
      setLatestData(data);
      setShowForm(!data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const handleSubmitSuccess = (result: AssessmentData) => {
    setLatestData(result);
    setShowForm(false);
    setSuccessMessage('アセスメントを送信しました！');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadLatest}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  // Show form
  if (showForm) {
    const initialAnswers: Record<string, number> | undefined = latestData
      ? Object.fromEntries(
          latestData.answers
            .filter((a) => a.score != null)
            .map((a) => [a.questionId, a.score as number]),
        )
      : undefined;

    return (
      <div className="space-y-6">
        {latestData && (
          <button
            onClick={() => setShowForm(false)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            ← 結果に戻る
          </button>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-center text-lg font-semibold text-gray-900">
            今月のアセスメント
          </h2>
          <p className="mb-6 text-center text-xs text-gray-400">
            各質問に正直に回答してください。成長の記録になります。
          </p>
          <AssessmentForm
            initialAnswers={initialAnswers}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      </div>
    );
  }

  // Show results
  return (
    <div className="space-y-6">
      {/* Success toast */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <svg
            className="h-5 w-5 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-green-700">
            {successMessage}
          </span>
        </div>
      )}

      {latestData && (
        <>
          {/* Chart card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-center text-lg font-semibold text-gray-900">
              わたしの成長きろく
            </h2>
            <p className="mb-4 text-center text-xs text-gray-400">
              {latestData.period} のアセスメント結果
            </p>
            <PentagonChart
              scores={{
                d1: latestData.d1Score,
                d2: latestData.d2Score,
                d3: latestData.d3Score,
                d4: latestData.d4Score,
                d5: latestData.d5Score,
              }}
            />
          </div>

          {/* Domain scores */}
          <div className="grid gap-3">
            {[
              { key: 'd1Score' as const, label: 'D1: 職務遂行・認知処理能力' },
              { key: 'd2Score' as const, label: 'D2: 基本的労働習慣・身体的耐性' },
              { key: 'd3Score' as const, label: 'D3: 対人関係・コミュニケーション' },
              { key: 'd4Score' as const, label: 'D4: 感情・ストレスコントロール' },
              { key: 'd5Score' as const, label: 'D5: 障害理解・自己管理' },
            ].map(({ key, label }) => {
              const score = latestData[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#ffc000]"
                        style={{ width: `${((score ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-bold text-[#ffc000]">
                      {score?.toFixed(1) ?? '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Retake button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl border-2 border-[#ffc000] bg-white px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-[#ffc000]/5"
          >
            もう一度回答する
          </button>
        </>
      )}
    </div>
  );
}
