import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessAdmin } from '@/lib/auth/permissions';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (!canAccessAdmin(user.role)) {
    redirect('/');
  }

  return (
    <div className="admin-shell min-h-screen border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <AdminSidebar role={user.role} />
        <div className="min-w-0">
          <AdminHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
