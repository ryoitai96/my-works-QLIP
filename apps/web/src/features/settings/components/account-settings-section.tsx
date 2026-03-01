'use client';

import { useEffect, useState } from 'react';
import { ROLE_LABELS, type RoleId } from '@qlip/shared';
import { fetchAccount, updateAccount, changePassword, type AccountInfo } from '../api';

export function AccountSettingsSection() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAccount()
      .then((data) => {
        setAccount(data);
        setNameValue(data.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNameSave = async () => {
    if (!nameValue.trim()) return;
    setNameSaving(true);
    try {
      const updated = await updateAccount({ name: nameValue.trim() });
      setAccount(updated);
      setEditingName(false);
      // Update localStorage user info
      const raw = localStorage.getItem('qlip_user');
      if (raw) {
        const user = JSON.parse(raw);
        user.name = updated.name;
        localStorage.setItem('qlip_user', JSON.stringify(user));
      }
    } catch {
      // keep editing
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return;
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const result = await changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'パスワード変更に失敗しました',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (!account) return null;

  const roleLabel = ROLE_LABELS[account.role as RoleId] ?? account.role;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">アカウント設定</h2>

      <div className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-500">メールアドレス</label>
          <p className="mt-1 text-gray-900">{account.email}</p>
        </div>

        {/* Role (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-500">ロール</label>
          <p className="mt-1 text-gray-900">{roleLabel}</p>
        </div>

        {/* Name (editable) */}
        <div>
          <label className="block text-sm font-medium text-gray-500">表示名</label>
          {editingName ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
              />
              <button
                onClick={handleNameSave}
                disabled={nameSaving}
                className="rounded-lg bg-[#ffc000] px-3 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
              >
                {nameSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameValue(account.name);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-gray-900">{account.name}</p>
              <button
                onClick={() => setEditingName(true)}
                className="text-sm text-[#b38600] hover:text-[#8a6800]"
              >
                編集
              </button>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-500">パスワード</label>
          {showPasswordForm ? (
            <div className="mt-2 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <label className="block text-sm text-gray-600">現在のパスワード</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">新しいパスワード</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordSaving || !currentPassword || !newPassword}
                  className="rounded-lg bg-[#ffc000] px-3 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
                >
                  {passwordSaving ? '変更中...' : '変更する'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setPasswordMessage(null);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage.text}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-1">
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-[#b38600] hover:text-[#8a6800]"
              >
                パスワードを変更
              </button>
              {passwordMessage?.type === 'success' && (
                <p className="mt-1 text-sm text-green-600">{passwordMessage.text}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
