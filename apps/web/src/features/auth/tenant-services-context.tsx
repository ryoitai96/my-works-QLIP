'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_TENANT_SERVICES,
  STAFF_ROLES,
  type TenantServiceKey,
} from '@qlip/shared';
import { apiClient } from '../../lib/api-client';
import { authStore } from './auth-store';

type TenantServices = Record<TenantServiceKey, boolean>;

interface TenantServicesContextValue {
  services: TenantServices;
  isServiceEnabled: (key: TenantServiceKey) => boolean;
  loading: boolean;
  refetch: () => void;
}

const TenantServicesContext = createContext<TenantServicesContextValue>({
  services: { ...DEFAULT_TENANT_SERVICES },
  isServiceEnabled: () => true,
  loading: true,
  refetch: () => {},
});

export function TenantServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<TenantServices>({
    ...DEFAULT_TENANT_SERVICES,
  });
  const [loading, setLoading] = useState(true);

  const fetchServices = () => {
    const user = authStore.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // R01/R02 always get all services
    if ((STAFF_ROLES as readonly string[]).includes(user.role)) {
      setServices({ ...DEFAULT_TENANT_SERVICES });
      setLoading(false);
      return;
    }

    apiClient<TenantServices>('/settings/tenant-services', { auth: true })
      .then(setServices)
      .catch(() => {
        // Fallback to all enabled on error
        setServices({ ...DEFAULT_TENANT_SERVICES });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const isServiceEnabled = (key: TenantServiceKey) => services[key] ?? true;

  return (
    <TenantServicesContext.Provider
      value={{ services, isServiceEnabled, loading, refetch: fetchServices }}
    >
      {children}
    </TenantServicesContext.Provider>
  );
}

export function useTenantServices() {
  return useContext(TenantServicesContext);
}
