'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type AttendanceRecord,
  type AttendanceSummary,
  fetchMonthlySummary,
} from '../api';
import { MonthlyAttendanceList } from './monthly-attendance-list';
import { CorrectionRequestList } from './correction-request-list';
import { CorrectionRequestForm } from './correction-request-form';

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}時間${m}分`;
}

export function AttendanceInfoPanel() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchMonthlySummary(year, month);
      setSummary(data);
    } catch {
      // ignore
    }
  }, [year, month]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ===== あなたの勤怠 ===== */}
      <div className="border-b border-gray-100 px-6 pb-6 pt-5">
        <h2 className="mb-4 text-sm font-bold text-gray-800">あなたの勤怠</h2>

        {/* Summary cards */}
        {summary && (
          <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
            <p className="mb-3 text-xs font-semibold text-gray-500">
              {summary.year}年{summary.month}月度
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.workedDays}
                  <span className="ml-0.5 text-xs font-normal text-gray-400">日</span>
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">出勤日数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatMinutes(summary.totalWorkMinutes)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">総労働時間</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.correctionCount}
                  <span className="ml-0.5 text-xs font-normal text-gray-400">件</span>
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">修正申請</p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly list */}
        <MonthlyAttendanceList
          onSelectRecord={(r) => setSelectedRecord(r)}
        />
      </div>

      {/* ===== あなたの申請 ===== */}
      <div className="px-6 pb-6 pt-5">
        <h2 className="mb-4 text-sm font-bold text-gray-800">あなたの申請</h2>
        <CorrectionRequestList />
      </div>

      {/* Correction form modal */}
      {selectedRecord && (
        <CorrectionRequestForm
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSubmitted={() => {
            setSelectedRecord(null);
            loadSummary();
          }}
        />
      )}
    </div>
  );
}
