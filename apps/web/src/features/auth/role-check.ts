import { ADMIN_ROLES, STAFF_ROLES, MEMBER_ROLES, CLIENT_ROLES, Role } from '@qlip/shared';

export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function isStaffRole(role: string): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isSuperAdmin(role: string): boolean {
  return role === Role.SUPER_ADMIN;
}

export function isMemberRole(role: string): boolean {
  return (MEMBER_ROLES as readonly string[]).includes(role);
}

export function isClientRole(role: string): boolean {
  return (CLIENT_ROLES as readonly string[]).includes(role);
}

export function isClientHR(role: string): boolean {
  return role === Role.CLIENT_HR;
}
