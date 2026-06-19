import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { UserRole } from '@/modules/profile/queries';
import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import { MobileCabinetNav } from '@/components/layout/mobile-cabinet-nav';
import { getCurrentUser } from '@/lib/auth/current-user';
import { logoutAction } from '@/app/auth/actions';

export const dynamic = 'force-dynamic';

const profileLinks = [
  { href: '/profile', label: 'Обзор', icon: 'LayoutDashboard' },
  { href: '/profile/responses', label: 'Мои отклики', icon: 'Mail' },
  { href: '/profile/inquiries', label: 'Запросы поставщикам', icon: 'MessageSquare' },
  { href: '/profile/saved-vacancies', label: 'Избранное', icon: 'Bookmark' },
  { href: '/profile/settings', label: 'Настройки', icon: 'Settings' }
];

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
      <MobileCabinetNav links={profileLinks} />
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="hidden space-y-4 lg:block">
          <aside aria-label="Навигация по профилю">
            <ProfileSidebar logoutAction={logoutAction} />
          </aside>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
