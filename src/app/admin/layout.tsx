import type { ReactNode } from 'react';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">
          <AdminHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
