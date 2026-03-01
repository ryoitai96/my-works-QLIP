'use client';

import { useEffect, useState } from 'react';
import { fetchTenant, type TenantInfo } from '../api';

export function TenantSettingsSection() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenant()
      .then(setTenant)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (!tenant) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">テナント・法定雇用率</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">テナント名</label>
          <p className="mt-1 text-gray-900">{tenant.name}</p>
        </div>

        {tenant.industry && (
          <div>
            <label className="block text-sm font-medium text-gray-500">業種</label>
            <p className="mt-1 text-gray-900">{tenant.industry}</p>
          </div>
        )}

        <div className="rounded-lg border border-[#ffc000]/30 bg-[#ffc000]/5 p-4">
          <h3 className="text-sm font-semibold text-gray-900">法定雇用率（2026年）</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#b38600]">{tenant.legalEmploymentRate}%</span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>現在の障害者雇用数</span>
              <span className="font-medium">{tenant.currentDisabilityEmployeeCount}名</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>全従業員数（推定）</span>
              <span className="rounded bg-[#ffc000]/15 px-2 py-0.5 text-xs font-medium text-[#8a6800]">
                Phase 1で設定可能
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
