import { getCurrentUser } from '@/lib/auth/current-user';
import { SiteFooter } from '@/components/layout/site-footer';
import type { LeadModalActions } from '@/components/public/lead-modal-providers';
import { hasActiveEmailSubscriptionForUser } from '@/lib/notifications/email-subscription/service';

export async function SiteFooterServer({ leadActions }: { leadActions: LeadModalActions }) {
  const user = await getCurrentUser();
  const hasNewsletterSubscription = user ? await hasActiveEmailSubscriptionForUser(user.id) : false;

  return (
    <SiteFooter
      leadActions={leadActions}
      newsletterDisabled={hasNewsletterSubscription}
      userEmail={user?.email ?? null}
      userRole={user?.role ?? null}
    />
  );
}
