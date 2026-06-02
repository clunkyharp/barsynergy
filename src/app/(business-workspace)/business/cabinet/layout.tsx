import type { ReactNode } from 'react';
import { ApplicationStatus } from '@prisma/client';
import { logoutAction } from '@/app/auth/actions';
import { BusinessSidebar } from '@/components/layout/business-sidebar';
import { SubmitButton } from '@/components/ui/submit-button';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const activeRequestCount = await prisma.application.count({
    where: {
      businessAccountId: businessAccount.id,
      status: {
        notIn: [ApplicationStatus.DRAFT, ApplicationStatus.COMPLETED, ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED]
      }
    }
  });

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <BusinessSidebar
            activeRequestCount={activeRequestCount}
            cityName={businessAccount.city?.name}
            companyName={businessAccount.companyName}
          />
          <form action={logoutAction}>
            <SubmitButton className="w-full rounded-[var(--radius-md)]" variant="secondary">
              Выйти
            </SubmitButton>
          </form>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
