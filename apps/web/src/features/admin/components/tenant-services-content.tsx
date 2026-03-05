'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TENANT_SERVICE_KEYS,
  TENANT_SERVICE_LABELS,
  type TenantServiceKey,
} from '@qlip/shared';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import {
  type TenantServices,
  fetchTenantById,
  fetchTenantServices,
  updateTenantServices,
} from '../api';
import { showToast } from '../../../components/toast';

interface TenantServicesContentProps {
  tenantId: string;
}

export function TenantServicesContent({ tenantId }: TenantServicesContentProps) {
  const router = useRouter();
  const [tenantName, setTenantName] = useState('');
  const [services, setServices] = useState<TenantServices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<TenantServiceKey | null>(null);

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const [tenant, svc] = await Promise.all([
        fetchTenantById(tenantId),
        fetchTenantServices(tenantId),
      ]);
      setTenantName(tenant.name);
      setServices(svc);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('サービス設定の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router, tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (key: TenantServiceKey) => {
    if (!services) return;
    setUpdating(key);
    const newValue = !services[key];
    try {
      const updated = await updateTenantServices(tenantId, { [key]: newValue });
      setServices(updated);
      showToast(
        `${TENANT_SERVICE_LABELS[key]}を${newValue ? '有効' : '無効'}にしました`,
        'success',
      );
    } catch {
      showToast('更新に失敗しました', 'error');
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Link
          href={`/admin/tenants/${tenantId}`}
          className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-800"
        >
          &larr; 企業詳細に戻る
        </Link>
      </div>
    );
  }

  if (!services) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/tenants" className="hover:text-gray-700">
          企業一覧
        </Link>
        <span>/</span>
        <Link href={`/admin/tenants/${tenantId}`} className="hover:text-gray-700">
          {tenantName}
        </Link>
        <span>/</span>
        <span className="text-gray-900">サービス設定</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          サービス設定
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {tenantName} の利用サービスを切り替えます。無効にしたサービスはサイドバーと画面から非表示になります。
        </p>
      </div>

      {/* Toggle List */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
        {TENANT_SERVICE_KEYS.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="text-sm font-medium text-gray-900">
              {TENANT_SERVICE_LABELS[key]}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={services[key]}
              disabled={updating === key}
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                services[key] ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  services[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
