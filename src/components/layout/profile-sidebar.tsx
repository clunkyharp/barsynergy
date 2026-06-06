'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bookmark, LayoutDashboard, Mail, Settings } from 'lucide-react';
import { logoutAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/ui/nav-link';
import { Panel } from '@/components/ui/panel';

type SidebarUser = {
  displayName: string | null;
  initials: string | null;
  avatarUrl: string | null;
};

type ProfileSidebarProps = {
  user?: SidebarUser | null;
};

const links = [
  { href: '/profile', label: 'Обзор', icon: LayoutDashboard },
  { href: '/profile/responses', label: 'Мои отклики', icon: Mail },
  { href: '/profile/saved-vacancies', label: 'Избранное', icon: Bookmark },
  { href: '/profile/settings', label: 'Настройки', icon: Settings }
];

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <Panel className="h-fit" padding="md" tone="elevated">
      {user?.displayName && (
        <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4 mb-4">
          {user.avatarUrl ? (
            <Image
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              height={40}
              src={user.avatarUrl}
              width={40}
            />
          ) : user.initials ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
              {user.initials}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.displayName}</p>
            <p className="text-[11px] text-[var(--muted)]">Кабинет специалиста</p>
          </div>
        </div>
      )}
      {!user?.displayName && (
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Кабинет специалиста</p>
      )}
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
