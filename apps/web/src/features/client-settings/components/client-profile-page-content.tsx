'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/features/auth/auth-store';
import { isClientHR } from '@/features/auth/role-check';
import { ApiClientError } from '@/lib/api-client';
import {
  fetchClientProfile,
  updateClientProfile,
  type ClientProfile,
} from '../api';

export function ClientProfilePageContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [industryValue, setIndustryValue] = useState('');
  const [saving, setSaving] = useState(false);

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
      const data = await fetchClientProfile();
      setProfile(data);
      setNameValue(data.name);
      setIndustryValue(data.industry ?? '');
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

  const handleSave = async () => {
    if (!nameValue.trim()) return;
    setSaving(true);
    try {
      const updated = await updateClientProfile({
        name: nameValue.trim(),
        industry: industryValue.trim() || undefined,
      });
      setProfile(updated);
      setEditing(false);
    } catch {
      // keep editing
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setNameValue(profile.name);
      setIndustryValue(profile.industry ?? '');
    }
  };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
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

  if (!profile) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">企業プロフィール</h2>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-[#b38600] hover:text-[#8a6800]"
          >
            編集
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Company name */}
        <div>
          <label className="block text-sm font-medium text-gray-500">
            企業名
          </label>
          {editing ? (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
            />
          ) : (
            <p className="mt-1 text-gray-900">{profile.name}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-500">
            業種
          </label>
          {editing ? (
            <input
              type="text"
              value={industryValue}
              onChange={(e) => setIndustryValue(e.target.value)}
              placeholder="例: 製造業、IT、小売業"
              className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
            />
          ) : (
            <p className="mt-1 text-gray-900">
              {profile.industry || '未設定'}
            </p>
          )}
        </div>

        {/* Status (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-500">
            ステータス
          </label>
          <p className="mt-1">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                profile.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {profile.isActive ? '有効' : '無効'}
            </span>
          </p>
        </div>

        {/* Edit actions */}
        {editing && (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !nameValue.trim()}
              className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
