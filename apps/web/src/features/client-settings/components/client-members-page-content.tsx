'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_LABELS, Role, type RoleId } from '@qlip/shared';
import { authStore } from '@/features/auth/auth-store';
import { isClientHR } from '@/features/auth/role-check';
import { ApiClientError } from '@/lib/api-client';
import {
  fetchClientUsers,
  updateClientUser,
  deleteClientUser,
  type ClientUser,
} from '../api';
import { AddUserModal } from './add-user-modal';

type SortKey = 'name' | 'email' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function SortIndicator({
  active,
  order,
}: {
  active: boolean;
  order: SortOrder;
}) {
  if (!active) return <span className="ml-1 text-gray-300">▲</span>;
  return <span className="ml-1">{order === 'asc' ? '▲' : '▼'}</span>;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? '有効' : '無効'}
    </span>
  );
}

export function ClientMembersPageContent() {
  const router = useRouter();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSaving, setEditSaving] = useState(false);

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
      const data = await fetchClientUsers();
      setUsers(data);
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
    let result = users;
    if (q) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'ja');
          break;
        case 'email':
          cmp = a.email.localeCompare(b.email);
          break;
        case 'role':
          cmp = a.role.localeCompare(b.role);
          break;
        case 'createdAt':
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [users, search, sortKey, sortOrder]);

  const startEdit = (u: ClientUser) => {
    setEditingId(u.id);
    setEditName(u.name);
    setEditRole(u.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRole('');
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;
    setEditSaving(true);
    try {
      const updated = await updateClientUser(id, {
        name: editName.trim(),
        role: editRole,
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    } catch {
      // keep editing
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleActive = async (target: ClientUser) => {
    try {
      if (target.isActive) {
        await deleteClientUser(target.id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === target.id ? { ...u, isActive: false } : u,
          ),
        );
      } else {
        const updated = await updateClientUser(target.id, { isActive: true });
        setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
      }
    } catch {
      // ignore
    }
  };

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
            placeholder="氏名・メールで検索..."
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
            ＋ メンバー追加
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className={thClass} onClick={() => handleSort('name')}>
                氏名
                <SortIndicator
                  active={sortKey === 'name'}
                  order={sortOrder}
                />
              </th>
              <th className={thClass} onClick={() => handleSort('email')}>
                メール
                <SortIndicator
                  active={sortKey === 'email'}
                  order={sortOrder}
                />
              </th>
              <th className={thClass} onClick={() => handleSort('role')}>
                権限
                <SortIndicator
                  active={sortKey === 'role'}
                  order={sortOrder}
                />
              </th>
              <th className="px-5 py-3">ステータス</th>
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
                  ユーザーが見つかりません
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5">
                    {editingId === u.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {u.name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    {editingId === u.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
                      >
                        <option value={Role.CLIENT_HR}>
                          管理者（人事担当者）
                        </option>
                        <option value={Role.CLIENT_EMPLOYEE}>
                          一般（従業員）
                        </option>
                      </select>
                    ) : (
                      <span className="text-gray-600">
                        {ROLE_LABELS[u.role as RoleId] ?? u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge active={u.isActive} />
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3.5">
                      {editingId === u.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSave(u.id)}
                            disabled={editSaving}
                            className="text-sm font-medium text-[#b38600] hover:text-[#8a6800]"
                          >
                            {editSaving ? '保存中...' : '保存'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEdit(u)}
                            className="text-sm text-[#b38600] hover:text-[#8a6800]"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`text-sm ${
                              u.isActive
                                ? 'text-red-500 hover:text-red-700'
                                : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {u.isActive ? '無効化' : '有効化'}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add user modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </>
  );
}
