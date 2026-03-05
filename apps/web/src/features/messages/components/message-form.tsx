'use client';

import { useEffect, useState } from 'react';
import {
  type MessageCategory,
  type MessageUser,
  CATEGORY_LABELS,
  fetchRecipients,
  createMessage,
} from '../api';

const CATEGORIES: MessageCategory[] = [
  'late_notice',
  'early_leave',
  'paid_leave',
  'welfare',
  'meeting',
  'other',
];

export function MessageForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [recipients, setRecipients] = useState<MessageUser[]>([]);
  const [toUserId, setToUserId] = useState('');
  const [category, setCategory] = useState<MessageCategory>('late_notice');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipients()
      .then((list) => {
        setRecipients(list);
        if (list.length > 0) setToUserId(list[0].id);
      })
      .catch(() => setError('宛先の取得に失敗しました'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId || !subject.trim() || !content.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await createMessage({
        toUserId,
        category,
        subject: subject.trim(),
        content: content.trim(),
      });
      onCreated();
    } catch {
      setError('送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'block w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-[#ffc000] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffc000]/30 placeholder:text-gray-400';

  return (
    <div
      className="modal-overlay flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="modal-panel mx-4 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">新規メッセージ</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">宛先</span>
              <select value={toUserId} onChange={(e) => setToUserId(e.target.value)} className={inputClass}>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">カテゴリ</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MessageCategory)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">件名</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="件名を入力"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">内容</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="内容を入力"
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting || !toUserId || !subject.trim() || !content.trim()}
              className="rounded-lg bg-[#ffc000] px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-all hover:bg-[#e6ad00] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            >
              {submitting ? '送信中…' : '送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
