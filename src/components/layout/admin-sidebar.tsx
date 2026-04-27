import type { UserRole } from '@prisma/client';
import { type AdminSection, canAccessAdminSection } from '@/lib/auth/permissions';

const adminLinks: { label: string; href: string; section: AdminSection }[] = [
  { label: 'Dashboard', href: '/admin', section: 'dashboard' },
  { label: 'Articles', href: '/admin/articles', section: 'articles' },
  { label: 'Events', href: '/admin/events', section: 'events' },
  { label: 'Courses', href: '/admin/courses', section: 'courses' },
  { label: 'Vacancies', href: '/admin/vacancies', section: 'vacancies' },
  { label: 'Suppliers', href: '/admin/suppliers', section: 'suppliers' },
  { label: 'Partners', href: '/admin/partners', section: 'partners' },
  { label: 'Applications', href: '/admin/applications', section: 'applications' },
  { label: 'Users', href: '/admin/users', section: 'users' },
  { label: 'Categories', href: '/admin/categories', section: 'categories' },
  { label: 'Cities', href: '/admin/cities', section: 'cities' },
  { label: 'Tags', href: '/admin/tags', section: 'tags' }
];

type AdminSidebarProps = {
  role: UserRole;
};

export function AdminSidebar({ role }: AdminSidebarProps) {
  const visibleLinks = adminLinks.filter((item) => canAccessAdminSection(role, item.section));

  return (
    <aside className="rounded-lg border border-[var(--line)] bg-white p-4">
      <a className="block text-lg font-bold" href="/admin">
        BARSYNERGY Admin
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
