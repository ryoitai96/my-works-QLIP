'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type MemberSummary, fetchMembers } from '../api';
import { MemberAvatar } from '../../../components/member-avatar';

type SortKey = 'name' | 'employeeNumber' | 'gender' | 'site' | 'employmentType' | 'status' | 'enrolledAt';
type SortOrder = 'asc' | 'desc';

const STATUS_LABELS: Record<string, string> = {
  active: '在籍',
  on_leave: '休職中',
  inactive: '退職',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  on_leave: 'bg-yellow-50 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
};

const GENDER_LABELS: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
  prefer_not_to_say: '回答しない',
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  fixed_term: '有期雇用',
  permanent: '無期雇用',
};

function SortIndicator({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <span className="ml-1 text-gray-300">&#9650;</span>;
  return <span className="ml-1">{order === 'asc' ? '▲' : '▼'}</span>;
}

export function MembersPageContent() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberSummary[]>([]);
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
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('従業員一覧の取得に失敗しました。');
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
    let result = members;

    if (q) {
      result = result.filter(
        (m) =>
          m.user.name.toLowerCase().includes(q) ||
          (m.employeeNumber ?? '').toLowerCase().includes(q) ||
          m.site.name.toLowerCase().includes(q) ||
          (STATUS_LABELS[m.status] ?? '').includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.user.name.localeCompare(b.user.name, 'ja');
          break;
        case 'employeeNumber':
          cmp = (a.employeeNumber ?? '').localeCompare(b.employeeNumber ?? '');
          break;
        case 'gender':
          cmp = (a.gender ?? '').localeCompare(b.gender ?? '');
          break;
        case 'site':
          cmp = a.site.name.localeCompare(b.site.name, 'ja');
          break;
        case 'employmentType':
          cmp = (a.employmentType ?? '').localeCompare(b.employmentType ?? '');
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'enrolledAt':
          cmp = new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [members, search, sortKey, sortOrder]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="氏名・従業員番号・拠点・ステータスで検索..."
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
        <button
          onClick={() => router.push('/members/new')}
          className="shrink-0 rounded-lg bg-[#ffc000] px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#e6ad00]"
        >
          新規追加
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-3 py-3 w-12"></th>
                <th className={thClass} onClick={() => handleSort('name')}>
                  氏名
                  <SortIndicator active={sortKey === 'name'} order={sortOrder} />
                </th>
                <th className={thClass} onClick={() => handleSort('employeeNumber')}>
                  従業員番号
                  <SortIndicator active={sortKey === 'employeeNumber'} order={sortOrder} />
                </th>
                <th className={thClass} onClick={() => handleSort('gender')}>
                  性別
                  <SortIndicator active={sortKey === 'gender'} order={sortOrder} />
                </th>
                <th className={thClass} onClick={() => handleSort('site')}>
                  拠点
                  <SortIndicator active={sortKey === 'site'} order={sortOrder} />
                </th>
                <th className={thClass} onClick={() => handleSort('employmentType')}>
                  雇用形態
                  <SortIndicator active={sortKey === 'employmentType'} order={sortOrder} />
                </th>
                <th className="px-5 py-3 text-center">ステータス</th>
                <th className={thClass} onClick={() => handleSort('enrolledAt')}>
                  入職日
                  <SortIndicator active={sortKey === 'enrolledAt'} order={sortOrder} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => router.push(`/members/${m.id}`)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-3 py-3.5">
                    <MemberAvatar avatarId={m.avatarId} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {m.user.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {m.employeeNumber ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {m.gender ? (GENDER_LABELS[m.gender] ?? m.gender) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{m.site.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {m.employmentType
                      ? (EMPLOYMENT_TYPE_LABELS[m.employmentType] ?? m.employmentType)
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[m.status] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {STATUS_LABELS[m.status] ?? m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(m.enrolledAt).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                    {search ? '検索条件に一致する従業員はいません' : '登録されている従業員はいません'}
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
