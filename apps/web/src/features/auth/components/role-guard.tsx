'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { RoleId } from '@qlip/shared';

import { LoadingScreen } from '../../../components/loading-screen';
import { authStore } from '../auth-store';
import { getRoleHomePath, isRouteAllowed } from '../route-permissions';

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const user = authStore.getUser();
    if (!user) {
      router.replace('/');
      return;
    }

    const role = user.role as RoleId;
    if (!isRouteAllowed(pathname, role)) {
      router.replace(getRoleHomePath(role));
      return;
    }

    setIsAllowed(true);
  }, [pathname, router]);

  if (!isAllowed) return <LoadingScreen />;

  return <>{children}</>;
}
