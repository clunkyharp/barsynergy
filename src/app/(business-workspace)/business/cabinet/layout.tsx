import type { ReactNode } from 'react';
import { BusinessSidebar } from '@/components/layout/business-sidebar';
import { MobileCabinetNav } from '@/components/layout/mobile-cabinet-nav';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { logoutAction } from '@/app/auth/actions';

const businessLinks = [
  { href: '/business/cabinet', label: 'Обзор', icon: 'Building2' },
  { href: '/business/cabinet/requests', label: 'Заявки', icon: 'FileText' },
  { href: '/business/cabinet/masters', label: 'Услуги мастеров', icon: 'Wrench' },
  { href: '/business/cabinet/responses', label: 'Отклики', icon: 'Users' },
  { href: '/business/cabinet/settings', label: 'Настройки', icon: 'Settings' }
];

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  await requireBusinessAccountAccess();

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <MobileCabinetNav links={businessLinks} />
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <div className="hidden space-y-4 lg:block">
          <BusinessSidebar logoutAction={logoutAction} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
