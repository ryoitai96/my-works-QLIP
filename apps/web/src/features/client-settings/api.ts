import { apiClient } from '@/lib/api-client';

export interface ClientProfile {
  id: string;
  name: string;
  industry: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function fetchClientProfile() {
  return apiClient<ClientProfile>('/client-settings/profile', { auth: true });
}

export function updateClientProfile(data: { name?: string; industry?: string }) {
  return apiClient<ClientProfile>('/client-settings/profile', {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export function fetchClientUsers() {
  return apiClient<ClientUser[]>('/client-settings/members', { auth: true });
}

export function createClientUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return apiClient<ClientUser>('/client-settings/members', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export function updateClientUser(
  id: string,
  data: { name?: string; role?: string; isActive?: boolean },
) {
  return apiClient<ClientUser>(`/client-settings/members/${id}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export function deleteClientUser(id: string) {
  return apiClient<{ success: boolean }>(`/client-settings/members/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

// ===== Team types & API =====

export interface TeamMembershipUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: 'manager' | 'member';
  createdAt: string;
  user: TeamMembershipUser;
}

export interface Team {
  id: string;
  name: string;
  departmentCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberships: TeamMembership[];
}

export function fetchTeams() {
  return apiClient<Team[]>('/client-settings/teams', { auth: true });
}

export function createTeam(data: {
  name: string;
  departmentCode?: string;
  managerIds?: string[];
  memberIds?: string[];
}) {
  return apiClient<Team>('/client-settings/teams', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export function updateTeam(
  id: string,
  data: {
    name?: string;
    departmentCode?: string;
    managerIds?: string[];
    memberIds?: string[];
  },
) {
  return apiClient<Team>(`/client-settings/teams/${id}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export function deleteTeam(id: string) {
  return apiClient<{ success: boolean }>(`/client-settings/teams/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
