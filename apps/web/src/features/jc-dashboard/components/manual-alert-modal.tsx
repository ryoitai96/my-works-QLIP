'use client';

import { useState } from 'react';
import { setManualAlert, type TeamMemberOverview } from '../api';

interface ManualAlertModalProps {
  member: TeamMemberOverview;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualAlertModal({
  member,
  onClose,
  onSuccess,
}: ManualAlertModalProps) {
  const [alertLevel, setAlertLevel] = useState<string>(
    member.alertLevel ?? 'WARNING',
  );
  const [reason, setReason] = useState(member.alertReason ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await setManualAlert(member.memberId, alertLevel, reason || null);
      onSuccess();
    } catch {
      setError('設定に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await setManualAlert(member.memberId, null, null);
      onSuccess();
    } catch {
      setError('解除に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            手動アラート設定
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          <span className="font-medium">{member.name}</span> のアラートレベルを設定します。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert level selection */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              アラートレベル
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAlertLevel('WARNING')}
                className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  alertLevel === 'WARNING'
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                WARNING
              </button>
              <button
                type="button"
                onClick={() => setAlertLevel('CRITICAL')}
                className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  alertLevel === 'CRITICAL'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                CRITICAL
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="alert-reason"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              理由（任意）
            </label>
            <textarea
              id="alert-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例: 朝から元気がない様子、面談で不安を訴えていた"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {member.alertLevel && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                解除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-[#0077c7] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005fa3] disabled:opacity-50"
            >
              {isSubmitting ? '設定中...' : '設定する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
