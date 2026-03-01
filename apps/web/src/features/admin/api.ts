import { apiClient } from '../../lib/api-client';

/* ── 型定義 ── */

export interface TenantSummary {
  id: string;
  name: string;
  industry: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; members: number; sites: number };
}

export interface TenantDetail {
  id: string;
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
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenant: { id: string; name: string } | null;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: { id: string; name: string } | null;
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
