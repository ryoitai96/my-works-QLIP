'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type AttendanceRecord,
  clockIn,
  clockOut,
  breakStart,
  breakEnd,
  fetchTodayAttendance,
} from '../api';

function formatTime(iso: string | null): string {
  if (!iso) return '---';
  const d = new Date(iso);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export function PunchClockPanel({
  onRecordUpdate,
}: {
  onRecordUpdate?: (record: AttendanceRecord) => void;
}) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadToday = useCallback(async () => {
    try {
      const data = await fetchTodayAttendance();
      setRecord(data);
    } catch {
      setError('勤怠データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (action: () => Promise<AttendanceRecord>) => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await action();
      setRecord(updated);
      onRecordUpdate?.(updated);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '操作に失敗しました';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const status = record?.status ?? 'not_clocked_in';

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ffc000] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-between px-6 py-8">
      {/* Date */}
      <p className="text-sm font-medium text-gray-500">{dateStr}</p>

      {/* Clock + Status */}
      <div className="text-center">
        <p className="font-mono text-5xl font-bold tabular-nums text-gray-900">
          {currentTime.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>

        {/* Status badge */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              status === 'clocked_in'
                ? 'bg-green-500'
                : status === 'on_break'
                  ? 'bg-yellow-500'
                  : status === 'clocked_out'
                    ? 'bg-gray-400'
                    : 'bg-gray-300'
            }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {status === 'clocked_in'
              ? '勤務中'
              : status === 'on_break'
                ? '休憩中'
                : status === 'clocked_out'
                  ? '退勤済み'
                  : '未出勤'}
          </span>
        </div>

        {/* Clock in/out times — horizontal */}
        <div className="mt-5 flex items-center justify-center gap-6 text-sm">
          <p>
            <span className="text-gray-400">出勤時刻：</span>
            <span className="font-semibold text-gray-800">
              {formatTime(record?.clockIn ?? null)}
            </span>
          </p>
          <span className="text-gray-200">|</span>
          <p>
            <span className="text-gray-400">退勤時刻：</span>
            <span className="font-semibold text-gray-800">
              {formatTime(record?.clockOut ?? null)}
            </span>
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Action buttons — click to punch & show time */}
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-3">
        <button
          onClick={() => handleAction(clockIn)}
          disabled={actionLoading || status !== 'not_clocked_in'}
          className={`flex h-16 flex-col items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all ${
            status === 'clocked_in' || status === 'on_break'
              ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2'
              : status === 'not_clocked_in'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400'
          } disabled:cursor-not-allowed`}
          aria-label="出勤"
        >
          <span>出勤</span>
          {record?.clockIn && (
            <span className="mt-0.5 text-[11px] font-normal opacity-80">
              {formatTime(record.clockIn)}
            </span>
          )}
        </button>
        <button
          onClick={() => handleAction(clockOut)}
          disabled={actionLoading || status !== 'clocked_in'}
          className={`flex h-16 flex-col items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all ${
            status === 'clocked_out'
              ? 'bg-rose-600 text-white ring-2 ring-rose-300 ring-offset-2'
              : status === 'clocked_in'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-gray-100 text-gray-400'
          } disabled:cursor-not-allowed`}
          aria-label="退勤"
        >
          <span>退勤</span>
          {record?.clockOut && (
            <span className="mt-0.5 text-[11px] font-normal opacity-80">
              {formatTime(record.clockOut)}
            </span>
          )}
        </button>
        <button
          onClick={() => handleAction(breakStart)}
          disabled={actionLoading || status !== 'clocked_in'}
          className={`flex h-16 flex-col items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all ${
            status === 'on_break'
              ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2'
              : status === 'clocked_in'
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-gray-100 text-gray-400'
          } disabled:cursor-not-allowed`}
          aria-label="休憩開始"
        >
          <span>休憩開始</span>
          {record?.breaks && record.breaks.length > 0 && (
            <span className="mt-0.5 text-[11px] font-normal opacity-80">
              {formatTime(record.breaks[record.breaks.length - 1].breakStart)}
            </span>
          )}
        </button>
        <button
          onClick={() => handleAction(breakEnd)}
          disabled={actionLoading || status !== 'on_break'}
          className={`flex h-16 flex-col items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all ${
            status === 'on_break'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-100 text-gray-400'
          } disabled:cursor-not-allowed`}
          aria-label="休憩終了"
        >
          <span>休憩終了</span>
          {record?.breaks && record.breaks.some((b) => b.breakEnd) && (
            <span className="mt-0.5 text-[11px] font-normal opacity-80">
              {formatTime(
                record.breaks
                  .filter((b) => b.breakEnd)
                  .slice(-1)[0]?.breakEnd ?? null,
              )}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
