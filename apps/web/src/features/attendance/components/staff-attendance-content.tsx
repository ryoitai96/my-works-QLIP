'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type MemberTodayAttendance,
  fetchMembersTodayAttendance,
} from '../api';

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: string | undefined) {
  switch (status) {
    case 'clocked_in':
      return { text: '勤務中', dot: 'bg-green-500' };
    case 'on_break':
      return { text: '休憩中', dot: 'bg-yellow-500' };
    case 'clocked_out':
      return { text: '退勤済', dot: 'bg-gray-400' };
    default:
      return { text: '未出勤', dot: 'bg-gray-300' };
  }
}

export function StaffAttendanceContent() {
  const [members, setMembers] = useState<MemberTodayAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchMembersTodayAttendance();
      setMembers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const activeCount = members.filter(
    (m) =>
      m.attendance?.status === 'clocked_in' ||
      m.attendance?.status === 'on_break',
  ).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-gray-50" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            本日のメンバー出勤状況
          </h2>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-2 text-center">
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          <p className="text-[10px] text-gray-900">勤務中</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <th className="px-5 py-3.5">メンバー</th>
              <th className="px-5 py-3.5">ステータス</th>
              <th className="px-5 py-3.5">出勤</th>
              <th className="px-5 py-3.5">退勤</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const badge = statusBadge(m.attendance?.status);
              return (
                <tr
                  key={m.memberId}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-5 py-3.5 font-medium text-gray-800">
                    {m.memberName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${badge.dot}`}
                      />
                      <span className="text-gray-600">{badge.text}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-gray-600">
                    {formatTime(m.attendance?.clockIn ?? null)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-gray-600">
                    {formatTime(m.attendance?.clockOut ?? null)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          メンバーがいません
        </p>
      )}
    </div>
  );
}
