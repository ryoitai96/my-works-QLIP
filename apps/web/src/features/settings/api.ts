import { apiClient } from '../../lib/api-client';

export interface AccountInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface SiteInfo {
  id: string;
  name: string;
  siteType: string;
  address: string | null;
  isActive: boolean;
}

export interface TenantInfo {
  id: string;
  name: string;
  industry: string | null;
  isActive: boolean;
  createdAt: string;
  legalEmploymentRate: number;
  currentDisabilityEmployeeCount: number;
}

export async function fetchAccount(): Promise<AccountInfo> {
  return apiClient<AccountInfo>('/settings/account', { auth: true });
}

export async function updateAccount(data: { name: string }): Promise<AccountInfo> {
  return apiClient<AccountInfo>('/settings/account', {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/settings/account/password', {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export async function fetchSites(): Promise<SiteInfo[]> {
  return apiClient<SiteInfo[]>('/settings/sites', { auth: true });
}

export async function updateSite(
  siteId: string,
  data: { name?: string; address?: string; isActive?: boolean },
): Promise<SiteInfo> {
  return apiClient<SiteInfo>(`/settings/sites/${siteId}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export async function createSite(data: {
  name: string;
  siteType: string;
  address?: string;
}): Promise<SiteInfo> {
  return apiClient<SiteInfo>('/settings/sites', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function fetchTenant(): Promise<TenantInfo> {
  return apiClient<TenantInfo>('/settings/tenant', { auth: true });
}
