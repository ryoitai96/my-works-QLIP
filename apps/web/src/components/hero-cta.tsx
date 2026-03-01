'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { STAFF_ROLES, type RoleId } from '@qlip/shared';
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
          (STAFF_ROLES as readonly string[]).includes(role),
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
    : '/';
  const label = isAuthenticated
    ? isStaff
      ? 'ダッシュボードへ'
      : '今日の体調を記録'
    : 'ログイン';

  return (
    <Link
      href={href}
      className="inline-block rounded-lg bg-[#ffc000] px-8 py-3 text-base font-semibold text-gray-900 shadow-lg shadow-[#ffc000]/25 transition-all hover:bg-[#e6ad00] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#ffc000]/40 focus:ring-offset-2 active:scale-[0.98]"
    >
      {label}
    </Link>
  );
}
