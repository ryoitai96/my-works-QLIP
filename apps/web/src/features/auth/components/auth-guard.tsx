'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { LoadingScreen } from '../../../components/loading-screen';
import { authStore } from '../auth-store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/');
      return;
    }
    setIsChecked(true);

    function handleStorage(e: StorageEvent) {
      if (e.key === 'qlip_access_token' && !e.newValue) {
        router.replace('/');
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router]);

  if (!isChecked) return <LoadingScreen />;

  return <>{children}</>;
}
