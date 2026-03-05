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

export interface MemberDashboardStats {
  production: {
    deliveredTotal: number;
    deliveredToday: number;
    deliveredThisWeek: number;
    deliveredThisMonth: number;
    inProgressCount: number;
    waitingCount: number;
    pendingCount: number;
  };
  thanks: {
    receivedTotal: number;
    receivedThisMonth: number;
    recentCards: Array<{
      id: string;
      fromUserId: string;
      toUserId: string;
      content: string;
      category: string;
      createdAt: string;
      fromUser: { id: string; name: string };
    }>;
  };
}

export async function fetchMemberDashboardStats(): Promise<MemberDashboardStats> {
  return apiClient<MemberDashboardStats>('/dashboard/member-stats', { auth: true });
}

export interface MyProfile {
  id: string;
  avatarId: string | null;
  user: { name: string };
}

export async function fetchMyProfile(): Promise<MyProfile> {
  return apiClient<MyProfile>('/members/me', { auth: true });
}
