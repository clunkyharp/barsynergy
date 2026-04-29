import type { ReactNode } from 'react';
import { logoutAction } from '@/app/auth/actions';
import { BusinessSidebar } from '@/components/layout/business-sidebar';
import { Button } from '@/components/ui/button';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const { businessAccount } = await requireBusinessAccountAccess();

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <BusinessSidebar companyName={businessAccount.companyName} />
          <form action={logoutAction}>
            <Button className="w-full rounded-full" type="submit" variant="secondary">
              Выйти
            </Button>
          </form>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
