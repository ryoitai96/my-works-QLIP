'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStore, type UserInfo } from '../../auth/auth-store';
import { isStaffRole, isClientHR } from '../../auth/role-check';
import {
  type AttendanceSummary,
  type CorrectionRequest,
  fetchMonthlySummary,
  fetchMyCorrections,
} from '../api';
import { PunchClockPanel } from './punch-clock-panel';
import { AttendanceInfoPanel } from './attendance-info-panel';
import { StaffAttendanceContent } from './staff-attendance-content';
import { HRCorrectionsContent } from './hr-corrections-content';

function AlertBlock({
  summary,
  corrections,
}: {
  summary: AttendanceSummary | null;
  corrections: CorrectionRequest[];
}) {
  const pendingCount = corrections.filter((c) => c.status === 'pending').length;
  const returnedCount = corrections.filter(
    (c) => c.status === 'returned',
  ).length;
  const hasAlert = pendingCount > 0 || returnedCount > 0;

  if (hasAlert) {
    const parts: string[] = [];
    if (returnedCount > 0) parts.push(`差戻し ${returnedCount}件`);
    if (pendingCount > 0) parts.push(`承認待ち ${pendingCount}件`);

    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-amber-800">
          修正申請に対応が必要なものがあります：
          <span className="font-semibold">{parts.join('、')}</span>
        </p>
      </div>
    );
  }

  // No alerts — show calm description
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-100 px-5 py-3.5">
      <p className="text-sm text-gray-500">
        未対応の通知はありません。出退勤の打刻や勤怠情報の確認はこちらから行えます。
      </p>
    </div>
  );
}

export function AttendancePageContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(authStore.getUser());
    setMounted(true);
  }, [router]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loadAlertData = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        fetchMonthlySummary(year, month),
        fetchMyCorrections(),
      ]);
      setSummary(s);
      setCorrections(c);
    } catch {
      // ignore — alert block is supplementary
    }
  }, [year, month]);

  useEffect(() => {
    if (mounted && user?.role === 'R03') {
      loadAlertData();
    }
  }, [mounted, user?.role, loadAlertData]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="h-[420px] animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-[420px] animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  const role = user?.role ?? '';

  // R01/R02: Staff view
  if (isStaffRole(role)) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <StaffAttendanceContent />
        <div className="border-t border-gray-200 pt-8">
          <HRCorrectionsContent />
        </div>
      </div>
    );
  }

  // R04: Client HR
  if (isClientHR(role)) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <HRCorrectionsContent />
      </div>
    );
  }

  // R03: Member view — punch clock + info
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Page title */}
      <h1 className="mb-4 text-xl font-bold text-gray-900">勤怠管理</h1>

      {/* Alert / info block */}
      <div className="mb-6">
        <AlertBlock summary={summary} corrections={corrections} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left: Punch clock */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <PunchClockPanel />
        </div>

        {/* Right: Attendance + Corrections */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <AttendanceInfoPanel />
        </div>
      </div>
    </div>
  );
}
