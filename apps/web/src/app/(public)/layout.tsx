import { PublicOnlyGuard } from '../../features/auth/components/public-only-guard';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicOnlyGuard>{children}</PublicOnlyGuard>;
}
