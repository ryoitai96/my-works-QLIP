'use client';

import { useEffect, useState } from 'react';
import { fetchClientMembers, type ClientMember } from '../api';
import { authStore } from '../../auth/auth-store';
import { isClientHR } from '../../auth/role-check';

const STATUS_LABELS: Record<string, string> = {
  active: '在席',
  inactive: '退職',
  on_leave: '休職中',
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  fixed_term: '有期雇用',
  permanent: '無期雇用',
};

export function ClientMemberListContent() {
  const [members, setMembers] = useState<ClientMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = mounted ? authStore.getUser() : null;
  const hasPermission = user?.role && isClientHR(user.role);

  useEffect(() => {
    if (!mounted) return;
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    fetchClientMembers()
      .then(setMembers)
      .catch((err) => setError(err instanceof Error ? err.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [mounted, hasPermission]);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-8">
        <p className="text-amber-800">この機能を利用する権限がありません。管理者にお問い合わせください。</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8">
        <p className="text-gray-500">メンバーが登録されていません。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              氏名
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              従業員番号
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              拠点
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              ステータス
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              雇用形態
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              入職日
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {member.user.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {member.employeeNumber ?? '-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {member.site.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : member.status === 'on_leave'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABELS[member.status] ?? member.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {member.employmentType
                  ? (EMPLOYMENT_TYPE_LABELS[member.employmentType] ?? member.employmentType)
                  : '-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {new Date(member.enrolledAt).toLocaleDateString('ja-JP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
