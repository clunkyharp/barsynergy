import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/app/auth/actions';
import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <ProfileSidebar />
          <form action={logoutAction}>
            <Button className="w-full rounded-[var(--radius-md)]" type="submit" variant="secondary">
              Выйти
            </Button>
          </form>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
