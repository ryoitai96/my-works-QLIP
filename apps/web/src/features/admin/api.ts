import { apiClient } from '../../lib/api-client';
import type { TenantServiceKey } from '@qlip/shared';

/* ── 型定義 ── */

export type TenantServices = Record<TenantServiceKey, boolean>;

export interface TenantSummary {
  id: string;
  tenantCode: string;
  name: string;
  industry: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; members: number; sites: number };
}

export interface TenantDetail {
  id: string;
  tenantCode: string;
  name: string;
  industry: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sites: {
    id: string;
    name: string;
    siteType: string;
    isActive: boolean;
  }[];
  users: {
    id: string;
    userCode: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }[];
  _count: { members: number };
}

export interface UserSummary {
  id: string;
  userCode: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenant: { id: string; tenantCode: string; name: string } | null;
}

export interface UserDetail {
  id: string;
  userCode: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: { id: string; tenantCode: string; name: string } | null;
  site: { id: string; name: string; siteType: string } | null;
  member: {
    id: string;
    employeeNumber: string | null;
    employmentType: string | null;
    enrolledAt: string;
    status: string;
  } | null;
}

/* ── API関数 ── */

export function fetchTenants() {
  return apiClient<TenantSummary[]>('/admin/tenants', { auth: true });
}

export function fetchTenantById(id: string) {
  return apiClient<TenantDetail>(`/admin/tenants/${id}`, { auth: true });
}

export function fetchUsers() {
  return apiClient<UserSummary[]>('/admin/users', { auth: true });
}

export function fetchUserById(id: string) {
  return apiClient<UserDetail>(`/admin/users/${id}`, { auth: true });
}

export function fetchTenantServices(tenantId: string) {
  return apiClient<TenantServices>(`/admin/tenants/${tenantId}/services`, {
    auth: true,
  });
}

export function updateTenantServices(
  tenantId: string,
  data: Partial<TenantServices>,
) {
  return apiClient<TenantServices>(`/admin/tenants/${tenantId}/services`, {
    auth: true,
    method: 'PATCH',
    body: data,
  });
}
