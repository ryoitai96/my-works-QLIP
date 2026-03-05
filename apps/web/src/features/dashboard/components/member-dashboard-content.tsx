'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMemberDashboardStats, fetchMyProfile, type MemberDashboardStats, type MyProfile } from '../api';
import { StatCard } from './stat-card';
import { ThanksCard } from '../../thanks/components/thanks-card';
import { MemberAvatar } from '../../../components/member-avatar';

export function MemberDashboardContent() {
  const [stats, setStats] = useState<MemberDashboardStats | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchMemberDashboardStats(),
      fetchMyProfile().catch(() => null),
    ])
      .then(([s, p]) => {
        setStats(s);
        setProfile(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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
    <div className="space-y-8">
      {profile && (
        <div className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm">
          <MemberAvatar avatarId={profile.avatarId} size="lg" />
          <div>
            <p className="text-xl font-semibold text-gray-900">
              {profile.user.name}さん、おはようございます
            </p>
            <p className="mt-1 text-sm text-gray-500">今日も一日がんばりましょう</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Production record */}
        <StatCard
          title="制作実績"
          mainValue={stats.production.deliveredTotal}
          mainLabel="累計納品数"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>本日</span>
              <span className="font-medium">{stats.production.deliveredToday}件</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>今週</span>
              <span className="font-medium">{stats.production.deliveredThisWeek}件</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>今月</span>
              <span className="font-medium">{stats.production.deliveredThisMonth}件</span>
            </div>
          </div>
        </StatCard>

        {/* Production status */}
        <StatCard
          title="制作状況"
          mainValue={stats.production.inProgressCount}
          mainLabel="制作中"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.4a.75.75 0 010-1.28l5.1-3.4a.75.75 0 011.18.64v6.76a.75.75 0 01-1.18.64zm5.7 0l-5.1-3.4a.75.75 0 010-1.28l5.1-3.4a.75.75 0 011.18.64v6.76a.75.75 0 01-1.18.64z" />
            </svg>
          }
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>受注待ち</span>
              <span className="font-medium">{stats.production.pendingCount}件</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>制作待ち</span>
              <span className="font-medium">{stats.production.waitingCount}件</span>
            </div>
          </div>
        </StatCard>

        {/* Thanks summary */}
        <StatCard
          title="サンクスカード"
          mainValue={stats.thanks.receivedTotal}
          mainLabel="累計受取数"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          }
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>今月</span>
              <span className="font-medium">{stats.thanks.receivedThisMonth}件</span>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Recent thanks cards */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近届いたサンクスカード</h2>
          <Link
            href="/thanks"
            className="text-sm font-medium text-[#ffc000] hover:text-[#e6ad00] transition-colors"
          >
            すべて見る &rarr;
          </Link>
        </div>
        {stats.thanks.recentCards.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            まだサンクスカードはありません
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.thanks.recentCards.map((card) => (
              <ThanksCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
