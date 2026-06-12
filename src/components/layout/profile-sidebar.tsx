'use client';

import { usePathname } from 'next/navigation';
import { Bookmark, LayoutDashboard, Mail, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/ui/nav-link';
import { Panel } from '@/components/ui/panel';

type ProfileSidebarProps = {
  logoutAction: () => Promise<void>;
};

const links = [
  { href: '/profile', label: 'Обзор', icon: LayoutDashboard },
  { href: '/profile/responses', label: 'Мои отклики', icon: Mail },
  { href: '/profile/inquiries', label: 'Запросы поставщикам', icon: MessageSquare },
  { href: '/profile/saved-vacancies', label: 'Избранное', icon: Bookmark },
  { href: '/profile/settings', label: 'Настройки', icon: Settings }
];

export function ProfileSidebar({ logoutAction }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <Panel className="h-fit" padding="md" tone="elevated">
      <nav aria-label="Profile navigation" className="grid gap-2 text-sm">
        {links.map((link) => {
          const isActive = link.href === '/profile'
            ? pathname === link.href
            : pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <NavLink active={isActive} className="flex items-center gap-3" href={link.href} key={link.href}>
              <link.icon aria-hidden="true" className="shrink-0" size={16} strokeWidth={1.8} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <form action={logoutAction} className="mt-6">
        <Button className="w-full rounded-[var(--radius-md)]" type="submit" variant="secondary">
          Выйти
        </Button>
      </form>
    </Panel>
  );
}
