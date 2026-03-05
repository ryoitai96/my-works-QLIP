'use client';

import { useState } from 'react';
import { createTeam, type ClientUser } from '../api';

interface AddTeamModalProps {
  users: ClientUser[];
  onClose: () => void;
  onCreated: () => void;
}

export function AddTeamModal({ users, onClose, onCreated }: AddTeamModalProps) {
  const [name, setName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeUsers = users.filter((u) => u.isActive);

  const toggleId = (
    id: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');
    try {
      await createTeam({
        name: name.trim(),
        departmentCode: departmentCode.trim() || undefined,
        managerIds: managerIds.length > 0 ? managerIds : undefined,
        memberIds: memberIds.length > 0 ? memberIds : undefined,
      });
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'チーム作成に失敗しました',
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]';

  return (
    <div className="modal-overlay flex items-center justify-center">
      <div className="modal-panel w-full max-w-md p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          チーム追加
        </h3>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              チーム名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              部署コード
            </label>
            <input
              type="text"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              マネージャー
            </label>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-300 p-2">
              {activeUsers.filter((u) => !memberIds.includes(u.id)).length ===
              0 ? (
                <p className="px-1 py-0.5 text-xs text-gray-400">
                  選択可能なユーザーがいません
                </p>
              ) : (
                activeUsers
                  .filter((u) => !memberIds.includes(u.id))
                  .map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={managerIds.includes(u.id)}
                        onChange={() =>
                          toggleId(u.id, managerIds, setManagerIds)
                        }
                        className="accent-[#ffc000]"
                      />
                      {u.name}
                    </label>
                  ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              メンバー
            </label>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-300 p-2">
              {activeUsers.filter((u) => !managerIds.includes(u.id)).length ===
              0 ? (
                <p className="px-1 py-0.5 text-xs text-gray-400">
                  選択可能なユーザーがいません
                </p>
              ) : (
                activeUsers
                  .filter((u) => !managerIds.includes(u.id))
                  .map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={memberIds.includes(u.id)}
                        onChange={() =>
                          toggleId(u.id, memberIds, setMemberIds)
                        }
                        className="accent-[#ffc000]"
                      />
                      {u.name}
                    </label>
                  ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
            >
              {saving ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
