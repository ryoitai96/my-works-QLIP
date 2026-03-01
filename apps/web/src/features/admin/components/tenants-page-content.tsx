'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type TenantSummary, fetchTenants } from '../api';

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? '有効' : '無効'}
    </span>
  );
}

export function TenantsPageContent() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('企業一覧の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={load}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">企業名</th>
              <th className="px-5 py-3">業種</th>
              <th className="px-5 py-3 text-center">拠点数</th>
              <th className="px-5 py-3 text-center">ユーザー数</th>
              <th className="px-5 py-3 text-center">メンバー数</th>
              <th className="px-5 py-3 text-center">ステータス</th>
              <th className="px-5 py-3">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tenants.map((t) => (
              <tr
                key={t.id}
                onClick={() => router.push(`/admin/tenants/${t.id}`)}
                className="cursor-pointer transition-colors hover:bg-gray-50"
              >
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  {t.name}
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  {t.industry ?? '—'}
                </td>
                <td className="px-5 py-3.5 text-center text-gray-600">
                  {t._count.sites}
                </td>
                <td className="px-5 py-3.5 text-center text-gray-600">
                  {t._count.users}
                </td>
                <td className="px-5 py-3.5 text-center text-gray-600">
                  {t._count.members}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <StatusBadge active={t.isActive} />
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {new Date(t.createdAt).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  登録されている企業はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
