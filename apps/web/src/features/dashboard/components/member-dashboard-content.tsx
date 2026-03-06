'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchMemberDashboardStats, fetchMyProfile, type MemberDashboardStats, type MyProfile } from '../api';
import { ThanksCard } from '../../thanks/components/thanks-card';
import { MemberAvatar } from '../../../components/member-avatar';
import { updateAssignmentStatus } from '../../task-assign/api';
import { BADGE_DEFINITIONS, getBadgeDefinition } from '../badge-definitions';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'おはようございます';
  if (hour < 18) return 'こんにちは';
  return 'おつかれさまです';
}

function getFormattedDate(): string {
  const now = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  return `${now.getMonth() + 1}月${now.getDate()}日（${dayNames[now.getDay()]}）`;
}

const DAILY_MESSAGES = [
  '今日もあなたのペースで大丈夫です',
  '小さな一歩が大きな成長につながります',
  'あなたの頑張りはちゃんと見えています',
  '今日できることを、ひとつずつ',
  '深呼吸して、今日も始めましょう',
  '昨日よりも少しだけ前に進めたら花丸です',
  '週末まであと少し、応援しています',
];

function getDailyMessage(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length];
}

export function MemberDashboardContent() {
  const [stats, setStats] = useState<MemberDashboardStats | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await updateAssignmentStatus(taskId, newStatus);
      // Refresh data after status update
      const freshStats = await fetchMemberDashboardStats();
      setStats(freshStats);
    } catch {
      // silently fail — user can retry
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-8">
      {/* A. 挨拶エリア */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {profile && <MemberAvatar avatarId={profile.avatarId} size="lg" />}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {profile?.user.name ?? ''}さん、{getGreeting()}
            </p>
            <p className="mt-1 text-sm text-gray-500">{getFormattedDate()}</p>
          </div>
        </div>
      </section>

      {/* B. 今日の一言 */}
      <section className="rounded-2xl border border-[#ffc000]/30 bg-[#ffc000]/5 p-4 shadow-sm">
        <p className="text-center text-sm font-medium text-gray-700">
          {getDailyMessage()}
        </p>
      </section>

      {/* C. 日報リンク */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        {stats.healthCheck.submittedToday ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
                &#x2714;
              </span>
              <div>
                <p className="text-sm font-semibold text-green-700">今日の日報は記録済みです</p>
                {stats.healthCheck.streakDays > 1 && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    連続 {stats.healthCheck.streakDays} 日記録中
                  </p>
                )}
              </div>
            </div>
            {stats.healthCheck.streakDays >= 3 && (
              <span className="text-2xl" title={`${stats.healthCheck.streakDays}日連続`}>
                &#x1F525;
              </span>
            )}
          </div>
        ) : (
          <Link
            href="/health-check"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc000] px-6 py-3 text-sm font-bold text-white shadow transition-colors hover:bg-[#e6ad00]"
          >
            <span className="text-lg">&#x1F4DD;</span>
            今日の日報を書く
          </Link>
        )}
      </section>

      {/* D. 今日のおしごと */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-gray-900">今日のおしごと</h2>
        {stats.todayTasks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-3">
            今日のおしごとはまだアサインされていません
          </p>
        ) : (
          <ul className="space-y-3">
            {stats.todayTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.microTask.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span>{task.microTask.taskCode}</span>
                    {task.microTask.standardDuration && (
                      <span>/ {task.microTask.standardDuration}分</span>
                    )}
                  </div>
                </div>
                <div className="ml-3 shrink-0">
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                      disabled={updatingTaskId === task.id}
                      className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                    >
                      {updatingTaskId === task.id ? '...' : '開始'}
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                      disabled={updatingTaskId === task.id}
                      className="rounded-lg bg-[#ffc000] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#e6ad00] disabled:opacity-50"
                    >
                      {updatingTaskId === task.id ? '...' : '完了!'}
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      &#x2714;
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* E. ありがとうの声 */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">ありがとうの声</h2>
          <Link
            href="/thanks"
            className="text-xs font-medium text-[#ffc000] hover:text-[#e6ad00] transition-colors"
          >
            すべて見る &rarr;
          </Link>
        </div>
        {stats.thanks.recentCards.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-3">
            まだサンクスカードはありません
          </p>
        ) : (
          <div className="space-y-3">
            {stats.thanks.recentCards.slice(0, 3).map((card) => (
              <ThanksCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>

      {/* F. わたしの成長きろく */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-gray-900">わたしの成長きろく</h2>

        {/* ポイント & バッジサマリー */}
        <div className="mb-3 flex items-center justify-between rounded-xl border border-[#ffc000]/20 bg-[#ffc000]/5 px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">ポイント</p>
            <p className="text-xl font-extrabold text-[#ffc000]">
              {stats.points.toLocaleString()}
              <span className="ml-0.5 text-xs font-bold">pt</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">バッジ</p>
            <p className="text-sm font-bold text-gray-800">
              {stats.badges.filter((b) => b.earned).length} / {BADGE_DEFINITIONS.length}
            </p>
          </div>
        </div>

        {/* 獲得済みバッジ一覧 */}
        {stats.badges.some((b) => b.earned) && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {stats.badges
              .filter((b) => b.earned)
              .map((b) => {
                const def = getBadgeDefinition(b.id);
                return def ? (
                  <span key={b.id} className="text-xl" title={def.title}>
                    {def.emoji}
                  </span>
                ) : null;
              })}
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
            <span className="text-gray-600">&#x1F525; 日報連続入力</span>
            <span className="font-bold text-gray-900">{stats.healthCheck.streakDays} 日</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
            <span className="text-gray-600">&#x1F49B; 今月のありがとう</span>
            <span className="font-bold text-gray-900">{stats.thanks.receivedThisMonth} 件</span>
          </div>
        </div>
        <Link
          href="/growth"
          className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-[#ffc000]/30 bg-[#ffc000]/5 px-4 py-2.5 text-sm font-medium text-[#ffc000] transition-colors hover:bg-[#ffc000]/10"
        >
          五角形チャートを見る &rarr;
        </Link>
      </section>

      {/* G. そうだんするボタン */}
      <section>
        <Link
          href="/messages"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#ffc000]/40 bg-white px-6 py-4 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-[#ffc000] hover:shadow-md"
        >
          <span className="text-xl">&#x1F4AC;</span>
          そうだんする
        </Link>
      </section>
    </div>
  );
}
