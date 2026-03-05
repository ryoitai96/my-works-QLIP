'use client';

import { useState } from 'react';

import { ApiClientError } from '../../../lib/api-client';
import { showToast } from '../../../components/toast';
import { updateProductionStatus } from '../api';
import type { FlowerOrder } from '../api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; action: string; actionClass: string; nextStatus: 'in_production' | 'delivered' }
> = {
  confirmed: {
    label: '制作待ち',
    badge: 'bg-yellow-100 text-yellow-700',
    action: '制作を開始する',
    actionClass:
      'bg-[#0077c7] text-white hover:bg-[#005fa3] focus:ring-[#0077c7]/40',
    nextStatus: 'in_production',
  },
  in_production: {
    label: '制作中',
    badge: 'bg-blue-100 text-blue-700',
    action: '完了・お届け済み',
    actionClass:
      'bg-[#0077c7] text-white hover:bg-[#005fa3] focus:ring-[#0077c7]/40',
    nextStatus: 'delivered',
  },
};

interface ProductionOrderCardProps {
  order: FlowerOrder;
  onStatusChanged: () => void;
}

export function ProductionOrderCard({
  order,
  onStatusChanged,
}: ProductionOrderCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = STATUS_CONFIG[order.status];

  if (!config) return null;

  async function handleAction() {
    setIsSubmitting(true);
    try {
      await updateProductionStatus(order.id, config.nextStatus);
      const message =
        config.nextStatus === 'in_production'
          ? `${order.orderCode} の制作を開始しました`
          : `${order.orderCode} を完了・お届け済みにしました`;
      showToast(message, 'success');
      onStatusChanged();
    } catch (err) {
      const message =
        err instanceof ApiClientError && err.statusCode === 400
          ? 'ステータスを変更できません。ページを再読み込みしてください。'
          : 'ステータスの更新に失敗しました。再度お試しください。';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5">
        {/* Header: order code + status badge */}
        <div className="mb-3 flex items-start justify-between">
          <span className="text-xs font-medium text-gray-400">
            {order.orderCode}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badge}`}
          >
            {config.label}
          </span>
        </div>

        {/* Product info */}
        <div className="mb-3 flex items-center gap-3">
          {order.flowerProduct.imageUrl ? (
            <img
              src={`${API_BASE}${order.flowerProduct.imageUrl}`}
              alt={order.flowerProduct.name}
              className="h-14 w-14 rounded-lg border border-gray-100 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
              <svg
                className="h-6 w-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
                />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {order.flowerProduct.name}
            </h3>
            <p className="text-xs text-gray-500">
              {order.flowerProduct.category}
            </p>
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
          <span>数量:</span>
          <span className="font-medium">{order.quantity}</span>
        </div>

        {/* Message (optional) */}
        {order.message && (
          <div className="rounded-lg bg-gray-50 p-2.5">
            <p className="text-xs text-gray-500">メッセージ</p>
            <p className="mt-0.5 text-sm text-gray-700">{order.message}</p>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="border-t border-gray-200 px-5 py-3">
        <button
          type="button"
          onClick={handleAction}
          disabled={isSubmitting}
          aria-label={`${order.orderCode} を${config.action}`}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${config.actionClass}`}
        >
          {isSubmitting ? '更新中...' : config.action}
        </button>
      </div>
    </article>
  );
}
