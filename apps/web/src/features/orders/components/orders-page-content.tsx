'use client';

import { useEffect, useState } from 'react';
import { type FlowerProduct, type FlowerOrder, fetchAllOrders, updateOrderStatus } from '../api';
import { authStore } from '../../auth/auth-store';
import { isStaffRole } from '../../auth/role-check';
import { FlowerCatalog } from './flower-catalog';
import { OrderFormModal } from './order-form-modal';
import { MyOrders } from './my-orders';
import { showToast } from '../../../components/toast';

const STATUS_OPTIONS = [
  { value: 'pending', label: '注文受付' },
  { value: 'confirmed', label: '確認済' },
  { value: 'in_production', label: '制作中' },
  { value: 'delivered', label: 'お届け済' },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: '注文受付', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確認済', color: 'bg-blue-100 text-blue-700' },
  in_production: { label: '制作中', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'お届け済', color: 'bg-green-100 text-green-700' },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export function OrdersPageContent() {
  const [selectedProduct, setSelectedProduct] = useState<FlowerProduct | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<'catalog' | 'history'>('catalog');
  const user = authStore.getUser();
  const isStaff = user?.role ? isStaffRole(user.role) : false;

  if (isStaff) {
    return <StaffOrderManagement />;
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setTab('catalog')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'catalog'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          商品カタログ
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          注文履歴
        </button>
      </div>

      {tab === 'catalog' ? (
        <FlowerCatalog onSelect={setSelectedProduct} />
      ) : (
        <MyOrders refreshKey={refreshKey} />
      )}

      {selectedProduct && (
        <OrderFormModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOrdered={() => {
            setSelectedProduct(null);
            setRefreshKey((k) => k + 1);
            setTab('history');
          }}
        />
      )}
    </div>
  );
}

/** スタッフ向け注文管理画面 */
function StaffOrderManagement() {
  const [orders, setOrders] = useState<FlowerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchAllOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast('ステータスを更新しました');
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : '更新に失敗しました',
        'error',
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#ffc000]" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">注文はまだありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-5 py-3.5 font-medium text-gray-600">注文コード</th>
            <th className="px-5 py-3.5 font-medium text-gray-600">商品</th>
            <th className="px-5 py-3.5 font-medium text-gray-600">注文者</th>
            <th className="px-5 py-3.5 font-medium text-gray-600">数量</th>
            <th className="px-5 py-3.5 font-medium text-gray-600">合計</th>
            <th className="px-5 py-3.5 font-medium text-gray-600">注文日</th>
            <th className="px-5 py-3.5 font-medium text-gray-600">ステータス</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? {
              label: order.status,
              color: 'bg-gray-100 text-gray-700',
            };
            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                  {order.orderCode}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {order.flowerProduct.imageUrl ? (
                      <img
                        src={`${API_BASE}${order.flowerProduct.imageUrl}`}
                        alt=""
                        className="h-8 w-8 rounded border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-pink-50">
                        <svg
                          className="h-4 w-4 text-pink-300"
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
                    <span className="font-medium text-gray-900">
                      {order.flowerProduct.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-700">
                  {order.user?.name ?? '-'}
                </td>
                <td className="px-5 py-3.5 text-gray-700">x{order.quantity}</td>
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  {order.totalPrice.toLocaleString()}円
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.color} border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ffc000]/40`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
