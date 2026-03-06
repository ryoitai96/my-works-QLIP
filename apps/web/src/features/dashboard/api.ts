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
      fromUserId: string | null;
      toUserId: string;
      content: string;
      category: string;
      isQrThanks?: boolean;
      senderDisplayName?: string | null;
      createdAt: string;
      fromUser: { id: string; name: string } | null;
    }>;
  };
  todayTasks: Array<{
    id: string;
    status: string;
    microTask: {
      taskCode: string;
      name: string;
      standardDuration: number | null;
    };
  }>;
  healthCheck: {
    submittedToday: boolean;
    streakDays: number;
  };
  points: number;
  badges: Array<{ id: string; earned: boolean }>;
  badgeStats: {
    healthReports: number;
    tasksCompleted: number;
    thanksSent: number;
    thanksReceived: number;
    assessments: number;
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
