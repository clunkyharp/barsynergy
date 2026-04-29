'use client';

import { usePathname } from 'next/navigation';
import type { UserRole } from '@prisma/client';
import { type AdminSection, canAccessAdminSection } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

const adminLinks: { label: string; href: string; section: AdminSection }[] = [
  { label: 'Главная', href: '/admin', section: 'dashboard' },
  { label: 'Статьи', href: '/admin/articles', section: 'articles' },
  { label: 'События', href: '/admin/events', section: 'events' },
  { label: 'Курсы', href: '/admin/courses', section: 'courses' },
  { label: 'Вакансии', href: '/admin/vacancies', section: 'vacancies' },
  { label: 'Поставщики', href: '/admin/suppliers', section: 'suppliers' },
  { label: 'Партнеры', href: '/admin/partners', section: 'partners' },
  { label: 'Заявки', href: '/admin/applications', section: 'applications' },
  { label: 'Пользователи', href: '/admin/users', section: 'users' },
  { label: 'Категории', href: '/admin/categories', section: 'categories' },
  { label: 'Города', href: '/admin/cities', section: 'cities' },
  { label: 'Теги', href: '/admin/tags', section: 'tags' }
];

type AdminSidebarProps = {
  role: UserRole;
};

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const visibleLinks = adminLinks.filter((item) => canAccessAdminSection(role, item.section));

  return (
    <aside className="rounded-[1.75rem] border border-[var(--line)] bg-white/90 p-5 shadow-[0_24px_80px_rgba(22,19,15,0.08)] backdrop-blur">
      <a className="block text-lg font-bold tracking-[-0.02em]" href="/admin">
        Админка BARSYNERGY
      </a>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Рабочая зона для модерации контента, заявок и доступов.</p>
      <nav className="mt-6 grid gap-1.5 text-sm">
        {visibleLinks.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <a
              className={cn(
                'rounded-2xl px-3 py-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
                isActive && 'bg-[var(--graphite)] text-white hover:bg-[var(--graphite)] hover:text-white'
              )}
              key={item.href}
              href={item.href}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
