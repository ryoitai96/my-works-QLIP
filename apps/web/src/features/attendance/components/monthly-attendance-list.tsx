'use client';

import { useCallback, useEffect, useState } from 'react';
import { type AttendanceRecord, fetchMonthlyAttendance } from '../api';

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMinutes(minutes: number | null): string {
  if (minutes == null) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function statusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case 'clocked_out':
      return { text: '退勤済', className: 'bg-gray-100 text-gray-600' };
    case 'clocked_in':
      return { text: '勤務中', className: 'bg-green-100 text-green-700' };
    case 'on_break':
      return { text: '休憩中', className: 'bg-yellow-100 text-yellow-700' };
    default:
      return { text: '未出勤', className: 'bg-gray-50 text-gray-400' };
  }
}

export function MonthlyAttendanceList({
  year: initialYear,
  month: initialMonth,
  onSelectRecord,
}: {
  year?: number;
  month?: number;
  onSelectRecord?: (record: AttendanceRecord) => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMonthlyAttendance(year, month);
      setRecords(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const prevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div>
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          &lt; 前月
        </button>
        <h3 className="text-sm font-bold text-gray-800">
          {year}年{month}月
        </h3>
        <button
          onClick={nextMonth}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          翌月 &gt;
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ffc000] border-t-transparent" />
        </div>
      ) : records.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          この月の勤怠データはありません
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
                <th className="pb-2 pr-3">日付</th>
                <th className="pb-2 pr-3">出勤</th>
                <th className="pb-2 pr-3">退勤</th>
                <th className="pb-2 pr-3">実働</th>
                <th className="pb-2 pr-3">休憩</th>
                <th className="pb-2">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const d = new Date(r.recordDate);
                const dayOfWeek = d.toLocaleDateString('ja-JP', {
                  weekday: 'short',
                });
                const dayNum = d.getUTCDate();
                const st = statusLabel(r.status);

                return (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                    onClick={() => onSelectRecord?.(r)}
                  >
                    <td className="py-2.5 pr-3 font-medium text-gray-700">
                      {dayNum}日({dayOfWeek})
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-gray-600">
                      {formatTime(r.clockIn)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-gray-600">
                      {formatTime(r.clockOut)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-gray-600">
                      {formatMinutes(r.workMinutes)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-gray-600">
                      {formatMinutes(r.breakMinutes)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${st.className}`}
                      >
                        {st.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
