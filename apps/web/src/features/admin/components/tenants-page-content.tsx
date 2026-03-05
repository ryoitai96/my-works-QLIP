'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type TenantSummary, fetchTenants } from '../api';

type SortKey = 'name' | 'industry' | 'sites' | 'users' | 'members' | 'createdAt';
type SortOrder = 'asc' | 'desc';

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

function SortIndicator({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <span className="ml-1 text-gray-300">▲</span>;
  return <span className="ml-1">{order === 'asc' ? '▲' : '▼'}</span>;
}

export function TenantsPageContent() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = tenants;

    if (q) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.industry ?? '').toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'ja');
          break;
        case 'industry':
          cmp = (a.industry ?? '').localeCompare(b.industry ?? '', 'ja');
          break;
        case 'sites':
          cmp = a._count.sites - b._count.sites;
          break;
        case 'users':
          cmp = a._count.users - b._count.users;
          break;
        case 'members':
          cmp = a._count.members - b._count.members;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [tenants, search, sortKey, sortOrder]);

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

  const thClass =
    'px-5 py-3 cursor-pointer select-none transition-colors hover:text-gray-700';

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="企業名・業種で検索..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
        />
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">企業ID</th>
                <th className={thClass} onClick={() => handleSort('name')}>
                  企業名
                  <SortIndicator active={sortKey === 'name'} order={sortOrder} />
                </th>
                <th className={thClass} onClick={() => handleSort('industry')}>
                  業種
                  <SortIndicator active={sortKey === 'industry'} order={sortOrder} />
                </th>
                <th
                  className={`${thClass} text-center`}
                  onClick={() => handleSort('sites')}
                >
                  拠点数
                  <SortIndicator active={sortKey === 'sites'} order={sortOrder} />
                </th>
                <th
                  className={`${thClass} text-center`}
                  onClick={() => handleSort('users')}
                >
                  ユーザー数
                  <SortIndicator active={sortKey === 'users'} order={sortOrder} />
                </th>
                <th
                  className={`${thClass} text-center`}
                  onClick={() => handleSort('members')}
                >
                  メンバー数
                  <SortIndicator active={sortKey === 'members'} order={sortOrder} />
                </th>
                <th className="px-5 py-3 text-center">ステータス</th>
                <th className={thClass} onClick={() => handleSort('createdAt')}>
                  登録日
                  <SortIndicator active={sortKey === 'createdAt'} order={sortOrder} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/admin/tenants/${t.id}`)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                    {t.tenantCode}
                  </td>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                    {search ? '検索条件に一致する企業はありません' : '登録されている企業はありません'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
