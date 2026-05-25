import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AppLink } from '@/components/ui/app-link';
import { Panel } from '@/components/ui/panel';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessAdmin } from '@/lib/auth/permissions';

function AdminMobileUnsupportedState() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-6 md:hidden">
      <Panel aria-labelledby="admin-mobile-title" className="w-full max-w-md" padding="lg" tone="elevated">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Админка BARSYNERGY</p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight" id="admin-mobile-title">
          Нужен широкий экран
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Таблицы, формы публикации и рабочие действия админки рассчитаны на планшет или desktop. Откройте раздел на экране от 768px.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <AppLink
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[var(--border-strong)] px-[18px] py-[11px] text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-wash-strong)]"
            href="/"
          >
            На сайт
          </AppLink>
        </div>
      </Panel>
    </div>
  );
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (!canAccessAdmin(user.role)) {
    redirect('/');
  }

  return (
    <div className="admin-shell min-h-screen border-t border-[var(--line)] bg-[var(--surface)]">
      <AdminMobileUnsupportedState />
      <div className="container hidden gap-6 py-8 md:grid lg:grid-cols-[300px_1fr]">
        <AdminSidebar role={user.role} />
        <div className="min-w-0">
          <AdminHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
