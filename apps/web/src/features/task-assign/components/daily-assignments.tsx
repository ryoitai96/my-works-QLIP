'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchAssignments,
  updateAssignmentStatus,
  type TaskAssignment,
} from '../api';

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  assigned: { label: '未着手', bg: 'bg-gray-100', text: 'text-gray-600' },
  in_progress: { label: '作業中', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { label: '完了', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { label: 'キャンセル', bg: 'bg-red-100', text: 'text-red-600' },
};

interface DailyAssignmentsProps {
  date?: string;
  refreshKey?: number;
}

export function DailyAssignments({ date, refreshKey }: DailyAssignmentsProps) {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAssignments(date);
      setAssignments(data);
    } catch {
      setError('アサイン一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAssignmentStatus(id, newStatus);
      load();
    } catch {
      // silent fail - could add toast
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">本日のアサインはありません。</p>
      </div>
    );
  }

  // Group by member
  const byMember = new Map<string, TaskAssignment[]>();
  for (const a of assignments) {
    const key = a.member.id;
    if (!byMember.has(key)) byMember.set(key, []);
    byMember.get(key)!.push(a);
  }

  return (
    <div className="space-y-4">
      {Array.from(byMember.entries()).map(([memberId, memberAssignments]) => {
        const member = memberAssignments[0].member;
        return (
          <div
            key={memberId}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 px-4 py-2.5">
              <span className="text-sm font-semibold text-gray-900">
                {member.user.name}
              </span>
              {member.site && (
                <span className="ml-2 text-xs text-gray-400">
                  {member.site.name}
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {memberAssignments.map((a) => {
                const statusInfo = STATUS_LABELS[a.status] ?? STATUS_LABELS.assigned;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">
                          {a.microTask.taskCode}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {a.microTask.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      {a.notes && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {a.notes}
                        </p>
                      )}
                    </div>

                    {/* Quick status actions */}
                    {a.status === 'assigned' && (
                      <button
                        onClick={() => handleStatusChange(a.id, 'in_progress')}
                        className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-700 hover:bg-blue-100"
                      >
                        開始
                      </button>
                    )}
                    {a.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(a.id, 'completed')}
                        className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        完了
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
