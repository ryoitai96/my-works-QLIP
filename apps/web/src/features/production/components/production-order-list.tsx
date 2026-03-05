'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type FlowerOrder, fetchProductionOrders } from '../api';
import { ProductionOrderCard } from './production-order-card';

export function ProductionOrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState<FlowerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchProductionOrders();
      setOrders(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError(
        'データの取得に失敗しました。しばらく経ってから再度お試しください。',
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="mb-4 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={loadOrders}
          className="rounded-lg bg-[#0077c7] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005fa3] focus:outline-none focus:ring-2 focus:ring-[#0077c7]/40 focus:ring-offset-2"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const inProduction = orders.filter((o) => o.status === 'in_production');
  const confirmed = orders.filter((o) => o.status === 'confirmed');

  if (inProduction.length === 0 && confirmed.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        対象の注文がありません。
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* In Production section */}
      {inProduction.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            制作中
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({inProduction.length})
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProduction.map((order) => (
              <ProductionOrderCard
                key={order.id}
                order={order}
                onStatusChanged={loadOrders}
              />
            ))}
          </div>
        </section>
      )}

      {/* Confirmed / waiting section */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            制作待ち
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({confirmed.length})
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {confirmed.map((order) => (
              <ProductionOrderCard
                key={order.id}
                order={order}
                onStatusChanged={loadOrders}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
