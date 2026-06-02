'use client';

import { usePathname } from 'next/navigation';
import { MetaChip } from '@/components/ui/meta-chip';
import { NavLink } from '@/components/ui/nav-link';
import { Panel } from '@/components/ui/panel';

const links = [
  { href: '/profile', label: 'Обзор' },
  { href: '/profile/responses', label: 'Мои отклики' }
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <Panel className="h-fit backdrop-blur" padding="md" tone="elevated">
      <MetaChip variant="filter">Кабинет специалиста</MetaChip>
      <nav className="mt-6 grid gap-2 text-sm">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <NavLink active={isActive} href={link.href} key={link.href}>
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </Panel>
  );
}
