'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { RoleId } from '@qlip/shared';

import { LoadingScreen } from '../../../components/loading-screen';
import { authStore } from '../auth-store';
import { getRoleHomePath } from '../route-permissions';

export function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      const user = authStore.getUser();
      if (user) {
        router.replace(getRoleHomePath(user.role as RoleId));
        return;
      }
    }
    setIsChecked(true);
  }, [router]);

  if (!isChecked) return <LoadingScreen />;

  return <>{children}</>;
}
