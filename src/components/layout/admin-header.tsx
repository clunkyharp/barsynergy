'use client';

import type { UserRole } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const adminRoleLabels: Record<UserRole, string> = {
  ADMIN: 'Админ',
  MODERATOR: 'Модератор',
  BUSINESS: 'Бизнес',
  USER: 'Участник'
};

const adminHeaderSections = [
  { title: 'Рабочая очередь', test: (pathname: string) => pathname === '/admin' },
  { title: 'Статьи', test: (pathname: string) => pathname.startsWith('/admin/articles') },
  { title: 'События', test: (pathname: string) => pathname.startsWith('/admin/events') },
  { title: 'Курсы', test: (pathname: string) => pathname.startsWith('/admin/courses') },
  { title: 'Вакансии', test: (pathname: string) => pathname.startsWith('/admin/vacancies') },
  { title: 'Поставщики', test: (pathname: string) => pathname.startsWith('/admin/suppliers') },
  { title: 'Партнёры', test: (pathname: string) => pathname.startsWith('/admin/partners') },
  { title: 'Генспонсоры', test: (pathname: string) => pathname.startsWith('/admin/general-sponsors') },
  { title: 'Главная сайта', test: (pathname: string) => pathname.startsWith('/admin/homepage') },
  { title: 'Заявки', test: (pathname: string) => pathname.startsWith('/admin/applications') },
  { title: 'Бизнес-доступы', test: (pathname: string) => pathname.startsWith('/admin/users') },
  { title: 'Категории', test: (pathname: string) => pathname.startsWith('/admin/categories') },
  { title: 'Города', test: (pathname: string) => pathname.startsWith('/admin/cities') },
  { title: 'Теги', test: (pathname: string) => pathname.startsWith('/admin/tags') }
] as const;

type AdminHeaderProps = {
  email: string;
  role: UserRole;
};

export function AdminHeader({ email, role }: AdminHeaderProps) {
  const pathname = usePathname();
  const currentSection = adminHeaderSections.find((section) => section.test(pathname))?.title ?? 'Админка';

  return (
    <header className="admin-workspace-header">
      <div className="min-w-0">
        <p className="admin-topbar-kicker">Админка BARSYNERGY</p>
        <p className="admin-topbar-title">{currentSection}</p>
      </div>
      <div className="admin-topbar-meta">
        <div className="admin-topbar-user">
          <span className="admin-topbar-user-email">{email}</span>
          <span className="admin-topbar-user-role">{adminRoleLabels[role]}</span>
        </div>
        <Button href="/" size="sm" variant="ghost">
          На сайт
        </Button>
      </div>
    </header>
  );
}
