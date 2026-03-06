import type { RoleId } from '@qlip/shared';
import { Role } from '@qlip/shared';

const ALL_ROLES: RoleId[] = [
  Role.SUPER_ADMIN,
  Role.JOB_COACH,
  Role.MEMBER,
  Role.CLIENT_HR,
  Role.CLIENT_EMPLOYEE,
  Role.AUDITOR,
];

export function getRoleHomePath(role: RoleId): string {
  switch (role) {
    case Role.SUPER_ADMIN:
    case Role.JOB_COACH:
      return '/dashboard';
    case Role.MEMBER:
      return '/health-check';
    case Role.CLIENT_HR:
      return '/client-dashboard';
    case Role.CLIENT_EMPLOYEE:
      return '/thanks';
    case Role.AUDITOR:
      return '/help';
    default:
      return '/dashboard';
  }
}

const ROUTE_PERMISSIONS: { prefix: string; roles: RoleId[] }[] = [
  { prefix: '/dashboard', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/members/me', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER, Role.CLIENT_HR] },
  { prefix: '/members/new', roles: [Role.SUPER_ADMIN, Role.JOB_COACH] },
  { prefix: '/sites', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.CLIENT_HR] },
  { prefix: '/members', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.CLIENT_HR] },
  { prefix: '/attendance', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER, Role.CLIENT_HR] },
  { prefix: '/health-check', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/assessment', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/micro-tasks', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/task-assign', roles: [Role.SUPER_ADMIN, Role.JOB_COACH] },
  { prefix: '/growth', roles: [Role.MEMBER] },
  { prefix: '/production', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/messages', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.CLIENT_HR] },
  { prefix: '/thanks', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER, Role.CLIENT_HR, Role.CLIENT_EMPLOYEE] },
  { prefix: '/orders', roles: [Role.SUPER_ADMIN, Role.CLIENT_HR, Role.CLIENT_EMPLOYEE] },
  { prefix: '/products', roles: [Role.SUPER_ADMIN] },
  { prefix: '/admin', roles: [Role.SUPER_ADMIN] },
  { prefix: '/qr-tokens', roles: [Role.SUPER_ADMIN, Role.JOB_COACH] },
  { prefix: '/sos', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/settings', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/profile', roles: [Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER] },
  { prefix: '/client-dashboard', roles: [Role.CLIENT_HR] },
  { prefix: '/client-settings', roles: [Role.CLIENT_HR] },
  { prefix: '/help', roles: ALL_ROLES },
  { prefix: '/contact', roles: ALL_ROLES },
];

export function isRouteAllowed(pathname: string, role: RoleId): boolean {
  let bestMatch: { prefix: string; roles: RoleId[] } | null = null;

  for (const route of ROUTE_PERMISSIONS) {
    if (
      (pathname === route.prefix || pathname.startsWith(route.prefix + '/')) &&
      (!bestMatch || route.prefix.length > bestMatch.prefix.length)
    ) {
      bestMatch = route;
    }
  }

  if (!bestMatch) return false;

  return bestMatch.roles.includes(role);
}
