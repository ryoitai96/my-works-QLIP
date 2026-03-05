'use client';

import { useState } from 'react';
import { type AttendanceRecord, submitCorrection } from '../api';

const CORRECTION_TYPES = [
  { value: 'clock_in', label: '出勤時刻' },
  { value: 'clock_out', label: '退勤時刻' },
  { value: 'break', label: '休憩時間' },
  { value: 'other', label: 'その他' },
] as const;

export function CorrectionRequestForm({
  record,
  onClose,
  onSubmitted,
}: {
  record: AttendanceRecord;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [correctionType, setCorrectionType] = useState<string>('clock_in');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim() || !reason.trim()) {
      setError('修正希望値と理由は必須です');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitCorrection({
        attendanceRecordId: record.id,
        correctionType,
        requestedValue: requestedValue.trim(),
        reason: reason.trim(),
      });
      onSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '申請に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const recordDate = new Date(record.recordDate);
  const dateStr = recordDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <div className="modal-overlay flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">修正申請</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">対象日: {dateStr}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              修正種別
            </label>
            <select
              value={correctionType}
              onChange={(e) => setCorrectionType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
            >
              {CORRECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              修正希望値
            </label>
            <input
              type="text"
              value={requestedValue}
              onChange={(e) => setRequestedValue(e.target.value)}
              placeholder="例: 09:00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              理由
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="修正が必要な理由を入力してください"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#ffc000] py-2.5 text-sm font-bold text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
            >
              {submitting ? '送信中...' : '申請する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
