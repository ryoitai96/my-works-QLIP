'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/features/auth/auth-store';
import { isClientHR } from '@/features/auth/role-check';
import { ApiClientError } from '@/lib/api-client';
import {
  fetchTeams,
  fetchClientUsers,
  deleteTeam,
  type Team,
  type ClientUser,
} from '../api';
import { AddTeamModal } from './add-team-modal';
import { EditTeamModal } from './edit-team-modal';

type SortKey = 'name' | 'departmentCode' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function SortIndicator({
  active,
  order,
}: {
  active: boolean;
  order: SortOrder;
}) {
  if (!active) return <span className="ml-1 text-gray-300">&#x25B2;</span>;
  return <span className="ml-1">{order === 'asc' ? '\u25B2' : '\u25BC'}</span>;
}

export function TeamSettingsPageContent() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const user = authStore.getUser();
  const canEdit = user?.role ? isClientHR(user.role) : false;

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const [teamsData, usersData] = await Promise.all([
        fetchTeams(),
        fetchClientUsers(),
      ]);
      setTeams(teamsData);
      setUsers(usersData);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('データ取得に失敗しました。');
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
    let result = teams;
    if (q) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.departmentCode ?? '').toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'ja');
          break;
        case 'departmentCode':
          cmp = (a.departmentCode ?? '').localeCompare(
            b.departmentCode ?? '',
            'ja',
          );
          break;
        case 'createdAt':
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [teams, search, sortKey, sortOrder]);

  const handleDelete = async (team: Team) => {
    if (!window.confirm(`チーム「${team.name}」を削除してもよろしいですか？`))
      return;
    try {
      await deleteTeam(team.id);
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
    } catch {
      // ignore
    }
  };

  const getMemberNames = (team: Team, role: 'manager' | 'member') =>
    team.memberships
      .filter((m) => m.role === role)
      .map((m) => m.user.name)
      .join(', ') || '-';

  const thClass =
    'px-5 py-3 cursor-pointer select-none transition-colors hover:text-gray-700';

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
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
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="チーム名・部署コードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
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
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="shrink-0 rounded-lg bg-[#ffc000] px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-[#e6ad00]"
          >
            ＋ チーム追加
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className={thClass} onClick={() => handleSort('name')}>
                チーム名
                <SortIndicator
                  active={sortKey === 'name'}
                  order={sortOrder}
                />
              </th>
              <th
                className={thClass}
                onClick={() => handleSort('departmentCode')}
              >
                部署コード
                <SortIndicator
                  active={sortKey === 'departmentCode'}
                  order={sortOrder}
                />
              </th>
              <th className="px-5 py-3">マネージャー</th>
              <th className="px-5 py-3">メンバー</th>
              {canEdit && <th className="px-5 py-3">操作</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={canEdit ? 5 : 4}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  チームが見つかりません
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {t.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {t.departmentCode || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {getMemberNames(t, 'manager')}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {getMemberNames(t, 'member')}
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingTeam(t)}
                          className="text-sm text-[#b38600] hover:text-[#8a6800]"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add team modal */}
      {showAddModal && (
        <AddTeamModal
          users={users}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}

      {/* Edit team modal */}
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          users={users}
          onClose={() => setEditingTeam(null)}
          onUpdated={() => {
            setEditingTeam(null);
            load();
          }}
        />
      )}
    </>
  );
}
