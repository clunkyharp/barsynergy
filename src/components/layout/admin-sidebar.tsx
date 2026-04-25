const adminLinks = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Courses', href: '/admin/courses' },
  { label: 'Vacancies', href: '/admin/vacancies' },
  { label: 'Suppliers', href: '/admin/suppliers' },
  { label: 'Partners', href: '/admin/partners' },
  { label: 'Applications', href: '/admin/applications' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Cities', href: '/admin/cities' },
  { label: 'Tags', href: '/admin/tags' }
];

export function AdminSidebar() {
  return (
    <aside className="rounded-lg border border-[var(--line)] bg-white p-4">
      <a className="block text-lg font-bold" href="/admin">
        BARSYNERGY Admin
      </a>
      <nav className="mt-6 grid gap-1 text-sm">
        {adminLinks.map((item) => (
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
