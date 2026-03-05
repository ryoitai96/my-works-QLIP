import { apiClient, apiUpload } from '../../lib/api-client';

export interface FlowerProduct {
  id: string;
  productCode: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  productCode: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface UpdateProductPayload {
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  isActive?: boolean;
}

export function fetchProducts() {
  return apiClient<FlowerProduct[]>('/products', { auth: true });
}

export function fetchProductById(id: string) {
  return apiClient<FlowerProduct>(`/products/${id}`, { auth: true });
}

export function createProduct(payload: CreateProductPayload) {
  return apiClient<FlowerProduct>('/products', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function updateProduct(id: string, payload: UpdateProductPayload) {
  return apiClient<FlowerProduct>(`/products/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export function deleteProduct(id: string) {
  return apiClient<FlowerProduct>(`/products/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function uploadProductImage(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<FlowerProduct>(`/products/${id}/image`, formData);
}
