'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { authStore } from '../features/auth/auth-store';

export function HeroCta() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authStore.isAuthenticated());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Link
      href={isAuthenticated ? '/micro-tasks' : '/login'}
      className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {isAuthenticated ? 'タスク一覧へ' : 'ログイン'}
    </Link>
  );
}
