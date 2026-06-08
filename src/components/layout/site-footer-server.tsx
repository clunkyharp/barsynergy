import { getCurrentUser } from '@/lib/auth/current-user';
import { SiteFooter } from '@/components/layout/site-footer';

export async function SiteFooterServer() {
  const user = await getCurrentUser();
  return <SiteFooter userRole={user?.role ?? null} />;
}
