'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type HealthCheckData, fetchTodayHealthCheck } from '../api';
import { HealthCheckForm } from './health-check-form';

export function HealthCheckPageContent() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<HealthCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [streakDays, setStreakDays] = useState(0);

  const loadToday = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchTodayHealthCheck();
      setInitialData(data);
      if (data) {
        setStreakDays(data.streakDays);
      }
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
    loadToday();
  }, [loadToday]);

  const handleSubmitSuccess = (
    result: HealthCheckData & { isUpdate: boolean },
  ) => {
    setInitialData(result);
    setStreakDays(result.streakDays);

    if (result.isUpdate) {
      setSuccessMessage('体調を更新しました！');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setSuccessMessage('体調を記録しました！ タスク一覧へ移動します...');
      setTimeout(() => {
        router.push('/micro-tasks');
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-8 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-red-300"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          onClick={loadToday}
          className="mt-4 rounded-xl bg-red-100 px-5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with greeting */}
      <div className="text-center">
        <h2 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
          今日の体調を記録しましょう
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          毎日の記録があなたの健康管理に役立ちます
        </p>
      </div>

      {/* Streak badge */}
      {streakDays > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-[#ffc000]/20 bg-gradient-to-r from-[#ffc000]/10 via-amber-50 to-orange-50 px-5 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffc000] to-orange-400 shadow-lg shadow-[#ffc000]/30">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 009.6 19.9a8.993 8.993 0 004.32-.648.75.75 0 00.07-1.313 4.493 4.493 0 01-1.695-2.29 5.066 5.066 0 012.347-1.46.75.75 0 00.332-1.14A10.2 10.2 0 0112.963 2.286z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                <span className="text-2xl text-[#ffc000]">{streakDays}</span>
                <span className="ml-1 text-sm">日連続</span>
              </p>
              <p className="text-[10px] text-gray-500">
                継続は力なり！
              </p>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#ffc000]/10" />
          <div className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-orange-200/20" />
        </div>
      )}

      {/* Success toast */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-4 w-4 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-emerald-700">
            {successMessage}
          </span>
        </div>
      )}

      {/* Form */}
      <HealthCheckForm
        key={initialData?.id ?? 'new'}
        initialData={initialData}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </div>
  );
}
