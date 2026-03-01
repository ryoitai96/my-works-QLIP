'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROLE_LABELS, type RoleId } from '@qlip/shared';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type UserDetail, fetchUserById } from '../api';

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  fixed_term: '有期雇用',
  permanent: '無期雇用',
};

const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: '在籍',
  inactive: '退職',
  on_leave: '休職中',
};

interface UserDetailContentProps {
  userId: string;
}

export function UserDetailContent({ userId }: UserDetailContentProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
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
      const data = await fetchUserById(userId);
      setUser(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      if (err instanceof ApiClientError && err.statusCode === 404) {
        setError('ユーザーが見つかりません。');
        return;
      }
      setError('ユーザー情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router, userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Link
          href="/admin/users"
          className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-800"
        >
          ← 個人一覧に戻る
        </Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ← 個人一覧に戻る
      </Link>

      {/* ユーザー基本情報 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffc000] text-lg font-semibold text-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              user.isActive
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {user.isActive ? '有効' : '無効'}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500">ロール</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {ROLE_LABELS[user.role as RoleId] ?? user.role}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">所属企業</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {user.tenant ? (
                <Link
                  href={`/admin/tenants/${user.tenant.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {user.tenant.name}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">拠点</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {user.site?.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">登録日</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('ja-JP')}
            </dd>
          </div>
        </dl>
      </div>

      {/* Member情報 */}
      {user.member && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            メンバー情報
          </h3>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-gray-500">従業員番号</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {user.member.employeeNumber ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">雇用形態</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {user.member.employmentType
                  ? (EMPLOYMENT_TYPE_LABELS[user.member.employmentType] ??
                    user.member.employmentType)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">入職日</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {new Date(user.member.enrolledAt).toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">在籍状況</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.member.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : user.member.status === 'on_leave'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {MEMBER_STATUS_LABELS[user.member.status] ??
                    user.member.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
