'use client';

import { usePathname } from 'next/navigation';
import { Building2, FileText, Settings, Users } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Panel } from '@/components/ui/panel';
import { SubmitButton } from '@/components/ui/submit-button';
import { cn } from '@/lib/utils';

type BusinessSidebarProps = {
  logoutAction: () => Promise<void>;
};

const links = [
  { href: '/business/cabinet', label: 'Обзор', icon: Building2 },
  { href: '/business/cabinet/requests', label: 'Заявки', icon: FileText },
  { href: '/business/cabinet/responses', label: 'Отклики', icon: Users },
  { href: '/business/cabinet/settings', label: 'Настройки', icon: Settings }
];

export function BusinessSidebar({ logoutAction }: BusinessSidebarProps) {
  const pathname = usePathname();

  return (
    <Panel className="h-fit border-[var(--line)] shadow-none" padding="md" tone="elevated">
      <nav className="grid gap-1 text-sm" aria-label="Разделы кабинета компании">
        {links.map((link) => {
          const isActive =
            link.href === '/business/cabinet'
              ? pathname === link.href
              : pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <AppLink
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] border-l-2 border-l-transparent px-3 py-2 font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)]',
                isActive ? 'border-l-[var(--accent)] bg-[var(--surface-wash)]' : 'hover:bg-[var(--surface-muted)]'
              )}
              href={link.href}
              key={link.href}
            >
              <link.icon aria-hidden="true" size={16} strokeWidth={1.8} />
              {link.label}
            </AppLink>
          );
        })}
      </nav>
      <form action={logoutAction} className="mt-4">
        <SubmitButton className="w-full rounded-[var(--radius-md)]" variant="secondary">
          Выйти
        </SubmitButton>
      </form>
    </Panel>
  );
}
