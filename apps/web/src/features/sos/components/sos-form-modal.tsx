'use client';

import { useState } from 'react';
import { submitSosReport } from '../api';

const CATEGORIES = [
  {
    value: 'harassment',
    label: 'ハラスメント',
    description: 'いじめ・嫌がらせ・暴言等',
    color: 'bg-red-50 border-red-200 text-red-700',
    selectedColor: 'bg-red-100 border-red-400 ring-2 ring-red-300',
  },
  {
    value: 'overwork',
    label: '業務過多',
    description: '無理な業務量・長時間労働等',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    selectedColor: 'bg-orange-100 border-orange-400 ring-2 ring-orange-300',
  },
  {
    value: 'health',
    label: '体調不良',
    description: '体調悪化・通院困難等',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    selectedColor: 'bg-blue-100 border-blue-400 ring-2 ring-blue-300',
  },
  {
    value: 'other',
    label: 'その他',
    description: '上記に当てはまらない相談',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    selectedColor: 'bg-gray-100 border-gray-400 ring-2 ring-gray-300',
  },
] as const;

interface SosFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SosFormModal({ isOpen, onClose, onSuccess }: SosFormModalProps) {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setCategory('');
    setContent('');
    setIsAnonymous(false);
    setShowConfirm(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmitClick = () => {
    if (!category) {
      setError('カテゴリを選択してください');
      return;
    }
    if (!content.trim()) {
      setError('内容を入力してください');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await submitSosReport({ category, content: content.trim(), isAnonymous });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました');
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {showConfirm ? (
          /* ── Confirmation Dialog ── */
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">送信確認</h3>
              <p className="mt-1 text-sm text-gray-500">
                以下の内容でSOS通報を送信します。よろしいですか？
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">カテゴリ</span>
                <span className="font-medium text-gray-800">
                  {CATEGORIES.find((c) => c.value === category)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">匿名</span>
                <span className="font-medium text-gray-800">
                  {isAnonymous ? 'はい' : 'いいえ'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">内容</span>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap">{content}</p>
              </div>
            </div>

            {isAnonymous && (
              <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
                匿名で送信されます。通報内容からあなたが特定されることはありません。
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Main Form ── */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">SOS通報</h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="閉じる"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500">
              困っていること、つらいことがあれば教えてください。
              あなたの安全を守るために対応します。
            </p>

            {/* Category selection */}
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">カテゴリを選択</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => { setCategory(cat.value); setError(''); }}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      category === cat.value ? cat.selectedColor : cat.color
                    }`}
                  >
                    <p className="text-sm font-bold">{cat.label}</p>
                    <p className="mt-0.5 text-[11px] opacity-75">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="sos-content" className="mb-1.5 block text-sm font-semibold text-gray-700">
                内容を教えてください
              </label>
              <textarea
                id="sos-content"
                value={content}
                onChange={(e) => { setContent(e.target.value); setError(''); }}
                placeholder="いつ、どこで、何があったかなど、できる範囲で教えてください..."
                rows={5}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {/* Anonymous checkbox */}
            <label className="flex items-start gap-3 rounded-xl border-2 border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">匿名で送信する</p>
                <p className="text-xs text-gray-500">
                  あなたの名前は管理者にも通知されません
                </p>
              </div>
            </label>

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSubmitClick}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                確認へ進む
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
