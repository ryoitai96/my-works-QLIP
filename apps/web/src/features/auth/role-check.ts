import { ADMIN_ROLES, Role } from '@qlip/shared';

export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function isSuperAdmin(role: string): boolean {
  return role === Role.SUPER_ADMIN;
}
