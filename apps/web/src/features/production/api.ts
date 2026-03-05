import { apiClient } from '../../lib/api-client';
import type { FlowerOrder } from '../orders/api';

export type { FlowerOrder };

export function fetchProductionOrders() {
  return apiClient<FlowerOrder[]>('/orders/production', { auth: true });
}

export function updateProductionStatus(
  id: string,
  status: 'in_production' | 'delivered',
) {
  return apiClient<FlowerOrder>(`/orders/${id}/production-status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}
