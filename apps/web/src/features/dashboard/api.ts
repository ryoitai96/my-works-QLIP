import { apiClient } from '../../lib/api-client';

export interface DashboardStats {
  members: {
    total: number;
    active: number;
    onLeave: number;
    bySite: Array<{ siteId: string; siteName: string; count: number }>;
  };
  tasks: {
    totalCompletionsToday: number;
    totalCompletionsThisWeek: number;
    totalCompletionsThisMonth: number;
    completionRate: number;
  };
  thanks: {
    totalThisMonth: number;
    totalThisWeek: number;
    topCategories: Array<{ category: string; count: number }>;
  };
  sites: {
    total: number;
    bySiteType: Array<{ siteType: string; count: number }>;
  };
  healthCheck: {
    todaySubmissions: number;
    todayParticipationRate: number;
    weeklyAvgParticipationRate: number;
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>('/dashboard/stats', { auth: true });
}
