import { apiClient } from '../../lib/api-client';

export interface FlowerProduct {
  id: string;
  productCode: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface FlowerOrder {
  id: string;
  orderCode: string;
  userId: string;
  flowerProductId: string;
  flowerProduct: FlowerProduct;
  quantity: number;
  totalPrice: number;
  message: string | null;
  recipientName: string | null;
  recipientAddress: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    userCode: string;
    role: string;
  };
}

export interface CreateOrderPayload {
  flowerProductId: string;
  quantity: number;
  message?: string;
  recipientName?: string;
  recipientAddress?: string;
}

export function fetchCatalog() {
  return apiClient<FlowerProduct[]>('/orders/catalog', { auth: true });
}

export function createOrder(payload: CreateOrderPayload) {
  return apiClient<FlowerOrder>('/orders', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function fetchMyOrders() {
  return apiClient<FlowerOrder[]>('/orders/mine', { auth: true });
}

export function fetchAllOrders() {
  return apiClient<FlowerOrder[]>('/orders', { auth: true });
}

export function updateOrderStatus(id: string, status: string) {
  return apiClient<FlowerOrder>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}
