'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAssessmentTeamOverview, type AssessmentTeamMember } from '../api';
import { getAvatarPath } from '@qlip/shared';

function getCurrentPeriod(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function AssessmentOverviewTab() {
  const router = useRouter();
  const [members, setMembers] = useState<AssessmentTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssessmentTeamOverview();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const currentPeriod = getCurrentPeriod();
  const notDone = members.filter(
    (m) => !m.latestAssessment || m.latestAssessment.period !== currentPeriod,
  );
  const doneCount = members.length - notDone.length;

  if (notDone.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <p className="text-lg font-medium text-green-700">
            全メンバーのアセスメントが完了しています
          </p>
          <p className="mt-1 text-sm text-green-600">
            {doneCount}名 / {members.length}名 実施済み
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">今月の実施状況</p>
          <p className="mt-0.5 text-lg font-bold text-gray-900">
            {doneCount}
            <span className="text-sm font-normal text-gray-400">
              {' '}/ {members.length}名 実施済み
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">未実施</p>
          <p className="text-lg font-bold text-orange-600">{notDone.length}名</p>
        </div>
      </div>

      {/* Not done list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">
          アセスメント未実施メンバー
        </h3>
        {notDone.map((m) => {
          const days = m.latestAssessment
            ? daysSince(m.latestAssessment.assessmentDate)
            : null;

          return (
            <button
              key={m.memberId}
              onClick={() => router.push(`/members/${m.memberId}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {m.avatarId ? (
                  <img
                    src={getAvatarPath(m.avatarId)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-400">
                    {m.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {m.name}
                </p>
                <p className="text-xs text-gray-500">{m.siteName}</p>
              </div>

              {/* Last assessment */}
              <div className="shrink-0 text-right">
                {m.latestAssessment ? (
                  <>
                    <p className="text-xs text-gray-400">最終実施</p>
                    <p className="text-sm font-medium text-orange-600">
                      {days}日前
                    </p>
                  </>
                ) : (
                  <p className="text-xs font-medium text-red-500">未実施</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
