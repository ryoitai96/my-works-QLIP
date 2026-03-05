'use client';

import { useEffect, useState } from 'react';
import { fetchDashboardStats, type DashboardStats } from '../api';
import { authStore } from '../../auth/auth-store';
import { isStaffRole, isMemberRole } from '../../auth/role-check';
import { StatCard } from './stat-card';
import { MemberDashboardContent } from './member-dashboard-content';

const SITE_TYPE_LABELS: Record<string, string> = {
  flower_lab: 'フラワーラボ',
  satellite_office: 'サテライトオフィス',
  remote: 'リモート',
};

const CATEGORY_LABELS: Record<string, string> = {
  great_job: 'グッジョブ',
  teamwork: 'チームワーク',
  creativity: '創造性',
  kindness: '思いやり',
  other: 'その他',
};

export function DashboardPageContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = mounted ? authStore.getUser() : null;
  const userRole = user?.role;
  const isStaff = userRole ? isStaffRole(userRole) : false;
  const isMember = userRole ? isMemberRole(userRole) : false;
  const hasPermission = isStaff || isMember;

  useEffect(() => {
    if (!mounted) return;
    if (!isStaff) {
      setLoading(false);
      return;
    }

    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [mounted, isStaff]);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-8">
        <p className="text-amber-800">この機能を利用する権限がありません。管理者にお問い合わせください。</p>
      </div>
    );
  }

  if (isMember) {
    return <MemberDashboardContent />;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
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

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Members */}
      <StatCard
        title="メンバー概要"
        mainValue={stats.members.active}
        mainLabel="在席メンバー"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>全メンバー</span>
            <span className="font-medium">{stats.members.total}名</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>休職中</span>
            <span className="font-medium">{stats.members.onLeave}名</span>
          </div>
          {stats.members.bySite.length > 1 && (
            <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
              {stats.members.bySite.map((s) => (
                <div key={s.siteId} className="flex justify-between text-gray-500">
                  <span className="truncate">{s.siteName}</span>
                  <span>{s.count}名</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </StatCard>

      {/* Tasks */}
      <StatCard
        title="タスク完了実績"
        mainValue={stats.tasks.totalCompletionsToday}
        mainLabel="本日の完了件数"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>今週</span>
            <span className="font-medium">{stats.tasks.totalCompletionsThisWeek}件</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>今月</span>
            <span className="font-medium">{stats.tasks.totalCompletionsThisMonth}件</span>
          </div>
          <div className="mt-2">
            <div className="mb-1 flex justify-between text-gray-600">
              <span>完了率</span>
              <span className="font-medium">{stats.tasks.completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-[#ffc000] transition-all"
                style={{ width: `${Math.min(stats.tasks.completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </StatCard>

      {/* Thanks */}
      <StatCard
        title="サンクスカード"
        mainValue={stats.thanks.totalThisMonth}
        mainLabel="今月の送信数"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>今週</span>
            <span className="font-medium">{stats.thanks.totalThisWeek}件</span>
          </div>
          {stats.thanks.topCategories.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
              <p className="text-xs font-medium text-gray-400">カテゴリ別 TOP</p>
              {stats.thanks.topCategories.map((c) => (
                <div key={c.category} className="flex justify-between text-gray-500">
                  <span>{CATEGORY_LABELS[c.category] ?? c.category}</span>
                  <span>{c.count}件</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </StatCard>

      {/* Sites */}
      <StatCard
        title="拠点情報"
        mainValue={stats.sites.total}
        mainLabel="拠点数"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
          </svg>
        }
      >
        <div className="space-y-1 text-sm">
          {stats.sites.bySiteType.map((t) => (
            <div key={t.siteType} className="flex justify-between text-gray-600">
              <span>{SITE_TYPE_LABELS[t.siteType] ?? t.siteType}</span>
              <span className="font-medium">{t.count}</span>
            </div>
          ))}
        </div>
      </StatCard>

      {/* Health Check */}
      <StatCard
        title="体調チェック"
        mainValue={`${stats.healthCheck.todayParticipationRate}%`}
        mainLabel="本日の参加率"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
          </svg>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>提出人数</span>
            <span className="font-medium">{stats.healthCheck.todaySubmissions}名</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>週間平均参加率</span>
            <span className="font-medium">{stats.healthCheck.weeklyAvgParticipationRate}%</span>
          </div>
        </div>
      </StatCard>
    </div>
  );
}
