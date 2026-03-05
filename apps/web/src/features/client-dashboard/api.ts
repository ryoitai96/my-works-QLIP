import { apiClient } from '../../lib/api-client';
import type { DashboardStats } from '../dashboard/api';

export type { DashboardStats };

export interface ClientMember {
  id: string;
  employeeNumber: string | null;
  employmentType: string | null;
  enrolledAt: string;
  status: string;
  user: { name: string };
  site: { name: string };
}

export async function fetchClientDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>('/dashboard/stats', { auth: true });
}

export async function fetchClientMembers(): Promise<ClientMember[]> {
  return apiClient<ClientMember[]>('/members', { auth: true });
}
