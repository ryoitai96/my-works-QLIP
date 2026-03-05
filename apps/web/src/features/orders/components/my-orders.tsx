'use client';

import { useEffect, useState } from 'react';
import { type FlowerOrder, fetchMyOrders } from '../api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: '注文受付', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確認済', color: 'bg-blue-100 text-blue-700' },
  in_production: { label: '制作中', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'お届け済', color: 'bg-green-100 text-green-700' },
};

interface Props {
  refreshKey: number;
}

export function MyOrders({ refreshKey }: Props) {
  const [orders, setOrders] = useState<FlowerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">注文履歴はまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status] ?? {
          label: order.status,
          color: 'bg-gray-100 text-gray-700',
        };
        return (
          <div
            key={order.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {order.flowerProduct.imageUrl ? (
              <img
                src={`${API_BASE}${order.flowerProduct.imageUrl}`}
                alt={order.flowerProduct.name}
                className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-pink-50">
                <svg
                  className="h-7 w-7 text-pink-300"
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">
                  {order.orderCode}
                </span>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 font-medium text-gray-900 truncate">
                {order.flowerProduct.name}
              </p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                <span>x{order.quantity}</span>
                <span className="font-medium text-gray-700">
                  {order.totalPrice.toLocaleString()}円
                </span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
