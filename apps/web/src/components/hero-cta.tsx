'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Role, ADMIN_ROLES, type RoleId } from '@qlip/shared';
import { authStore } from '../features/auth/auth-store';

export function HeroCta() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const authenticated = authStore.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const user = authStore.getUser();
      if (user) {
        const role = user.role as RoleId;
        setIsStaff(
          (ADMIN_ROLES as readonly string[]).includes(role) ||
            role === Role.JOB_COACH,
        );
      }
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const href = isAuthenticated
    ? isStaff
      ? '/dashboard'
      : '/health-check'
    : '/login';
  const label = isAuthenticated
    ? isStaff
      ? 'ダッシュボードへ'
      : '今日の体調を記録'
    : 'ログイン';

  return (
    <Link
      href={href}
      className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {label}
    </Link>
  );
}
