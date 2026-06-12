import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { UserRole } from '@/modules/profile/queries';
import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { logoutAction } from '@/app/auth/actions';

export const dynamic = 'force-dynamic';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?returnTo=/profile');
  }

  if (user.role === UserRole.BUSINESS) {
    redirect('/business/cabinet');
  }

  if (user.role !== UserRole.USER) {
    redirect('/');
  }

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <aside aria-label="Навигация по профилю">
            <ProfileSidebar logoutAction={logoutAction} />
          </aside>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
