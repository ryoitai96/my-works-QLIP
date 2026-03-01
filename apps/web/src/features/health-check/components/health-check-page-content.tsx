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
    setSuccessMessage(
      result.isUpdate ? '体調を更新しました！' : '体調を記録しました！',
    );
    setTimeout(() => setSuccessMessage(''), 3000);
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
          onClick={loadToday}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak badge */}
      {streakDays > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#ffc000]/30 bg-[#ffc000]/5 px-4 py-3">
          <svg
            className="h-5 w-5 text-[#ffc000]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 009.6 19.9a8.993 8.993 0 004.32-.648.75.75 0 00.07-1.313 4.493 4.493 0 01-1.695-2.29 5.066 5.066 0 012.347-1.46.75.75 0 00.332-1.14A10.2 10.2 0 0112.963 2.286z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {streakDays}日連続で記録中！
          </span>
        </div>
      )}

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

      {/* Form card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-center text-lg font-semibold text-gray-900">
          今日の体調を記録しましょう
        </h2>
        <HealthCheckForm
          key={initialData?.id ?? 'new'}
          initialData={initialData}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </div>
    </div>
  );
}
