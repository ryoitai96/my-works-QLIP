'use client';

import { useCallback, useEffect, useState } from 'react';
import { type CorrectionRequest, fetchMyCorrections } from '../api';

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
      return { text: '承認待ち', className: 'bg-yellow-100 text-yellow-700' };
    case 'approved':
      return { text: '承認済', className: 'bg-green-100 text-green-700' };
    case 'rejected':
      return { text: '却下', className: 'bg-red-100 text-red-700' };
    case 'returned':
      return { text: '差戻し', className: 'bg-orange-100 text-orange-700' };
    default:
      return { text: status, className: 'bg-gray-100 text-gray-600' };
  }
}

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

export function CorrectionRequestList() {
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyCorrections();
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ffc000] border-t-transparent" />
      </div>
    );
  }

  if (corrections.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        修正申請はありません
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {corrections.map((c) => {
        const badge = statusBadge(c.status);
        return (
          <div
            key={c.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {correctionTypeLabel(c.correctionType)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  希望値: {c.requestedValue}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  理由: {c.reason}
                </p>
                {c.reviewComment && (
                  <p className="mt-1 text-xs text-gray-500">
                    コメント: {c.reviewComment}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
              >
                {badge.text}
              </span>
            </div>
            <p className="mt-2 text-[10px] text-gray-400">
              {new Date(c.createdAt).toLocaleDateString('ja-JP')} 申請
              {c.reviewedBy
                ? ` / ${c.reviewedBy.name} が対応`
                : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}
