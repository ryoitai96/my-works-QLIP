'use client';

import { useState } from 'react';
import { Role } from '@qlip/shared';
import { createClientUser } from '../api';

interface AddUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function AddUserModal({ onClose, onCreated }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(Role.CLIENT_EMPLOYEE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setSaving(true);
    setError('');
    try {
      await createClientUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ユーザー作成に失敗しました',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay flex items-center justify-center">
      <div className="modal-panel w-full max-w-md p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          メンバー追加
        </h3>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              初期パスワード <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              権限 <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
            >
              <option value={Role.CLIENT_HR}>管理者（人事担当者）</option>
              <option value={Role.CLIENT_EMPLOYEE}>一般（従業員）</option>
            </select>
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
              disabled={saving || !name.trim() || !email.trim() || !password}
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
