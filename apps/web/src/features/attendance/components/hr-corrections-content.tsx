'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type PendingCorrection,
  fetchPendingCorrections,
  reviewCorrection,
} from '../api';

function correctionTypeLabel(type: string) {
  switch (type) {
    case 'clock_in':
      return '出勤時刻';
    case 'clock_out':
      return '退勤時刻';
    case 'break':
      return '休憩時間';
    default:
      return 'その他';
  }
}

export function HRCorrectionsContent() {
  const [corrections, setCorrections] = useState<PendingCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchPendingCorrections();
      setCorrections(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (
    id: string,
    status: 'approved' | 'rejected' | 'returned',
  ) => {
    try {
      await reviewCorrection(id, { status, reviewComment: reviewComment || undefined });
      setActionId(null);
      setReviewComment('');
      load();
    } catch {
      // ignore
    }
  };

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">承認待ち修正申請</h2>
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
          {corrections.length}件
        </span>
      </div>

      {corrections.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-400">承認待ちの申請はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {c.attendanceRecord.member.user.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {correctionTypeLabel(c.correctionType)} → {c.requestedValue}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    理由: {c.reason}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString('ja-JP')} 申請
                  </p>
                </div>
              </div>

              {actionId === c.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="コメント（任意）"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0077c7] focus:outline-none focus:ring-1 focus:ring-[#0077c7]/30"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(c.id, 'approved')}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleReview(c.id, 'returned')}
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
                    >
                      差戻し
                    </button>
                    <button
                      onClick={() => handleReview(c.id, 'rejected')}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      却下
                    </button>
                    <button
                      onClick={() => {
                        setActionId(null);
                        setReviewComment('');
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActionId(c.id)}
                  className="mt-3 rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  対応する
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
