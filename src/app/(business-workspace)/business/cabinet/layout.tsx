import type { ReactNode } from 'react';
import { BusinessSidebar } from '@/components/layout/business-sidebar';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { getActiveRequestCount } from '@/modules/business/queries';
import { logoutAction } from '@/app/auth/actions';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const activeRequestCount = await getActiveRequestCount(businessAccount.id);

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <BusinessSidebar
            activeRequestCount={activeRequestCount}
            cityName={businessAccount.city?.name}
            companyName={businessAccount.companyName}
            logoutAction={logoutAction}
          />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
