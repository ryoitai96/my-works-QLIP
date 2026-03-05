'use client';

import { useEffect, useState } from 'react';
import { type FlowerProduct, createOrder } from '../api';
import { showToast } from '../../../components/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface Props {
  product: FlowerProduct;
  onClose: () => void;
  onOrdered: () => void;
}

export function OrderFormModal({ product, onClose, onOrdered }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = product.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createOrder({
        flowerProductId: product.id,
        quantity,
        message: message || undefined,
        recipientName: recipientName || undefined,
        recipientAddress: recipientAddress || undefined,
      });
      showToast('注文が完了しました');
      onOrdered();
    } catch (err) {
      setError(err instanceof Error ? err.message : '注文に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#0077c7] focus:outline-none focus:ring-1 focus:ring-[#0077c7]/30';

  return (
    <div className="modal-overlay flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-panel w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">注文する</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 商品情報 */}
          <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
            {product.imageUrl ? (
              <img
                src={`${API_BASE}${product.imageUrl}`}
                alt={product.name}
                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-pink-100">
                <svg
                  className="h-8 w-8 text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                  />
                </svg>
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-900">
                {product.price.toLocaleString()}円
              </p>
            </div>
          </div>

          {/* 数量 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              数量 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                -
              </button>
              <span className="w-8 text-center text-lg font-bold text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={quantity >= 10}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* 合計金額 */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600">合計金額</p>
            <p className="text-xl font-bold text-gray-900">
              {totalPrice.toLocaleString()}
              <span className="ml-0.5 text-sm font-normal">円</span>
            </p>
          </div>

          {/* メッセージカード */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              メッセージカード
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="花と一緒にお届けするメッセージを入力..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">任意</p>
          </div>

          {/* 届先情報 */}
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700">届先情報（任意）</p>
            <p className="text-xs text-gray-400">
              未入力の場合はご自身宛てとしてお届けします
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                届先氏名
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="例: 山田太郎"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                届先住所
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="例: 東京都千代田区..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#0077c7] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#005fa3] disabled:opacity-50"
            >
              {submitting ? '送信中...' : '注文する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
