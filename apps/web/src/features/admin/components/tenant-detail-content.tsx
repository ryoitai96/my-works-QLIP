'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROLE_LABELS, type RoleId } from '@qlip/shared';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type TenantDetail, fetchTenantById } from '../api';

interface TenantDetailContentProps {
  tenantId: string;
}

export function TenantDetailContent({ tenantId }: TenantDetailContentProps) {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
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
      const data = await fetchTenantById(tenantId);
      setTenant(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      if (err instanceof ApiClientError && err.statusCode === 404) {
        setError('企業が見つかりません。');
        return;
      }
      setError('企業情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router, tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Link
          href="/admin/tenants"
          className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-800"
        >
          ← 企業一覧に戻る
        </Link>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ← 企業一覧に戻る
      </Link>

      {/* 企業基本情報 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{tenant.name}</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tenant.isActive
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {tenant.isActive ? '有効' : '無効'}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500">業種</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {tenant.industry ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">拠点数</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {tenant.sites.length}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">メンバー数</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {tenant._count.members}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">登録日</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {new Date(tenant.createdAt).toLocaleDateString('ja-JP')}
            </dd>
          </div>
        </dl>
      </div>

      {/* 拠点一覧 */}
      {tenant.sites.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              拠点一覧（{tenant.sites.length}）
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-2.5">拠点名</th>
                  <th className="px-5 py-2.5">タイプ</th>
                  <th className="px-5 py-2.5 text-center">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenant.sites.map((site) => (
                  <tr key={site.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {site.name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{site.siteType}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          site.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {site.isActive ? '有効' : '無効'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 所属ユーザー一覧 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            所属ユーザー（{tenant.users.length}）
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-5 py-2.5">氏名</th>
                <th className="px-5 py-2.5">メール</th>
                <th className="px-5 py-2.5">ロール</th>
                <th className="px-5 py-2.5 text-center">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenant.users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => router.push(`/admin/users/${u.id}`)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {ROLE_LABELS[u.role as RoleId] ?? u.role}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {u.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                </tr>
              ))}
              {tenant.users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    所属ユーザーはいません
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
