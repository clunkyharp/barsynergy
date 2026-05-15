'use client';

import { usePathname } from 'next/navigation';
import { MetaChip } from '@/components/ui/meta-chip';
import { NavLink } from '@/components/ui/nav-link';
import { Panel } from '@/components/ui/panel';

type BusinessSidebarProps = {
  companyName: string;
};

const links = [
  { href: '/business/cabinet', label: 'Компания' },
  { href: '/business/cabinet/requests', label: 'Заявки' }
];

export function BusinessSidebar({ companyName }: BusinessSidebarProps) {
  const pathname = usePathname();

  return (
    <Panel className="h-fit backdrop-blur" padding="md" tone="elevated">
      <MetaChip variant="filter">Бизнес-кабинет</MetaChip>
      <p className="mt-3 text-2xl font-semibold tracking-normal">{companyName}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Управление заявками, статусом компании и рабочими комментариями.</p>
      <nav className="mt-6 grid gap-2 text-sm">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <NavLink active={isActive} href={link.href} key={link.href}>
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <Panel className="mt-6 text-sm leading-6 text-[var(--muted)]" padding="sm">
        Сначала проверьте статус компании и текущие заявки. Новые запросы лучше отправлять только с заполненным профилем.
      </Panel>
    </Panel>
  );
}
