import { apiClient } from '../../lib/api-client';

export interface SosReport {
  id: string;
  tenantId: string;
  reporterUserId: string | null;
  siteId: string;
  category: 'harassment' | 'overwork' | 'health' | 'other';
  content: string;
  isAnonymous: boolean;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  resolvedById: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string } | null;
  site: { id: string; name: string };
  resolvedBy: { id: string; name: string } | null;
}

export interface SubmitSosRequest {
  category: string;
  content: string;
  isAnonymous?: boolean;
}

export async function submitSosReport(
  data: SubmitSosRequest,
): Promise<SosReport> {
  return apiClient<SosReport>('/sos', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function fetchSosReports(): Promise<SosReport[]> {
  return apiClient<SosReport[]>('/sos', { auth: true });
}

export async function updateSosStatus(
  id: string,
  data: { status: string; resolutionNote?: string },
): Promise<SosReport> {
  return apiClient<SosReport>(`/sos/${id}/status`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}
