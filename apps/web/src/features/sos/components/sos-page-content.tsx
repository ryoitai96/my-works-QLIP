'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@qlip/shared';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type SosReport, fetchSosReports } from '../api';
import { SosFormModal } from './sos-form-modal';
import { SosReportList } from './sos-report-list';

export function SosPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [reports, setReports] = useState<SosReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isR01 = user?.role === Role.SUPER_ADMIN;
  const isR02 = user?.role === Role.JOB_COACH;
  const isR03 = user?.role === Role.MEMBER;
  const isManager = isR01 || isR02;

  const loadReports = useCallback(async () => {
    if (!isManager) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchSosReports();
      setReports(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/');
        return;
      }
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [isManager, router]);

  useEffect(() => {
    const u = authStore.getUser();
    if (!u) {
      router.replace('/');
      return;
    }
    setUser(u);
  }, [router]);

  useEffect(() => {
    if (isManager) {
      loadReports();
    } else if (user) {
      setIsLoading(false);
    }
  }, [isManager, user, loadReports]);

  const handleSubmitSuccess = () => {
    setShowModal(false);
    setSuccessMessage('SOS通報を送信しました。管理者が確認します。');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  if (!user) return null;

  // R03 Member view — SOS button
  if (isR03) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            困っていることやつらいことがあれば、<br />
            いつでもSOSを送ることができます。
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-emerald-700">{successMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-6 text-center shadow-lg shadow-red-200/50 transition-all hover:from-red-600 hover:to-red-700 hover:shadow-xl active:scale-[0.98]"
        >
          <div className="flex flex-col items-center gap-2">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="text-xl font-bold text-white">SOSを送る</span>
            <span className="text-sm text-white/80">困ったときはここを押してください</span>
          </div>
        </button>

        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">安心してください</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>匿名で送信することもできます</li>
            <li>管理者があなたの安全を守ります</li>
            <li>ハラスメント通報は上位管理者のみが確認します</li>
          </ul>
        </div>

        <SosFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      </div>
    );
  }

  // R01/R02 Manager view — report list
  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            onClick={loadReports}
            className="mt-2 rounded-lg bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-200"
          >
            再読み込み
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {reports.length}件の通報
              {isR02 && <span className="text-xs text-gray-400 ml-1">(ハラスメント通報を除く)</span>}
            </p>
            <button
              onClick={loadReports}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
            >
              更新
            </button>
          </div>
          <SosReportList reports={reports} isR01={isR01} onRefresh={loadReports} />
        </>
      )}
    </div>
  );
}
