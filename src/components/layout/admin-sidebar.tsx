'use client';

import { usePathname } from 'next/navigation';
import type { UserRole } from '@prisma/client';
import { NavLink } from '@/components/ui/nav-link';
import { Panel } from '@/components/ui/panel';
import { type AdminSection, canAccessAdminSection } from '@/lib/auth/permissions';

const adminLinks: { label: string; href: string; section: AdminSection; available?: boolean }[] = [
  { label: 'Главная', href: '/admin', section: 'dashboard', available: true },
  { label: 'Статьи', href: '/admin/articles', section: 'articles', available: true },
  { label: 'События', href: '/admin/events', section: 'events', available: true },
  { label: 'Курсы', href: '/admin/courses', section: 'courses', available: true },
  { label: 'Вакансии', href: '/admin/vacancies', section: 'vacancies', available: true },
  { label: 'Поставщики', href: '/admin/suppliers', section: 'suppliers', available: true },
  { label: 'Партнёры', href: '/admin/partners', section: 'partners', available: true },
  { label: 'Заявки', href: '/admin/applications', section: 'applications', available: true },
  { label: 'Пользователи', href: '/admin/users', section: 'users', available: true },
  { label: 'Категории', href: '/admin/categories', section: 'categories', available: false },
  { label: 'Города', href: '/admin/cities', section: 'cities', available: false },
  { label: 'Теги', href: '/admin/tags', section: 'tags', available: false }
];

type AdminSidebarProps = {
  role: UserRole;
};

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const visibleLinks = adminLinks.filter((item) => item.available && canAccessAdminSection(role, item.section));
  const upcomingLinks = adminLinks.filter((item) => !item.available && canAccessAdminSection(role, item.section));

  return (
    <Panel className="backdrop-blur" padding="md" tone="elevated">
      <a className="block text-lg font-bold tracking-normal" href="/admin">
        Админка BARSYNERGY
      </a>
      <nav className="mt-5 grid gap-1.5 text-sm">
        {visibleLinks.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <NavLink active={isActive} className={!isActive ? 'text-[var(--muted)]' : undefined} href={item.href} key={item.href}>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      {upcomingLinks.length > 0 ? (
        <div className="mt-5 border-t border-[var(--line)] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Скоро</p>
          <div className="mt-3 grid gap-1.5 text-sm text-[var(--muted)]">
            {upcomingLinks.map((item) => (
              <span className="rounded-[var(--radius-md)] px-3 py-2.5" key={item.href}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
