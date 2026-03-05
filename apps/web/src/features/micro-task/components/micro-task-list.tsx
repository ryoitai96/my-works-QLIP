'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type MicroTask, fetchMicroTasks } from '../api';
import { MicroTaskCard } from './micro-task-card';

export function MicroTaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchMicroTasks();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('データの取得に失敗しました。しばらく経ってから再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="mb-4 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={loadTasks}
          className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#e6ad00] focus:outline-none focus:ring-2 focus:ring-[#ffc000]/40 focus:ring-offset-2"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        マイクロタスクが登録されていません。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <MicroTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
