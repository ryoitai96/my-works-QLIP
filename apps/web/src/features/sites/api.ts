import { apiClient } from '../../lib/api-client';

export interface SiteItem {
  id: string;
  name: string;
  companyName: string | null;
  serviceName: string | null;
  siteType: string;
  address: string | null;
  isActive: boolean;
  memberCount: number;
}

export function fetchAllSites() {
  return apiClient<SiteItem[]>('/sites', { auth: true });
}

export function fetchSiteById(id: string) {
  return apiClient<SiteItem>(`/sites/${id}`, { auth: true });
}

export function createSiteApi(data: {
  name: string;
  companyName?: string;
  serviceName?: string;
  siteType: string;
  address?: string;
}) {
  return apiClient<SiteItem>('/sites', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export function updateSiteApi(
  id: string,
  data: {
    name?: string;
    companyName?: string;
    serviceName?: string;
    address?: string;
    isActive?: boolean;
  },
) {
  return apiClient<SiteItem>(`/sites/${id}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}
