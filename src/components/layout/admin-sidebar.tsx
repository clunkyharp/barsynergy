import type { UserRole } from '@prisma/client';
import { type AdminSection, canAccessAdminSection } from '@/lib/auth/permissions';

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
  const visibleLinks = adminLinks.filter((item) => canAccessAdminSection(role, item.section));

  return (
    <aside className="rounded-lg border border-[var(--line)] bg-white p-4">
      <a className="block text-lg font-bold" href="/admin">
        Админка BARSYNERGY
      </a>
      <nav className="mt-6 grid gap-1 text-sm">
        {visibleLinks.map((item) => (
          <a
            className="rounded-md px-3 py-2 text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            key={item.href}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
