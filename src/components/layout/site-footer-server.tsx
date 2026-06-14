import { getCurrentUser } from '@/lib/auth/current-user';
import { SiteFooter } from '@/components/layout/site-footer';
import type { LeadModalActions } from '@/components/public/lead-modal-providers';

export async function SiteFooterServer({ leadActions }: { leadActions: LeadModalActions }) {
  const user = await getCurrentUser();
  return <SiteFooter leadActions={leadActions} userRole={user?.role ?? null} />;
}
