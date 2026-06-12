'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { UserRole } from '@prisma/client';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { UnsavedChangesProvider } from '@/components/admin/unsaved-changes-guard';

const sidebarStorageKey = 'barsynergy-admin-sidebar-collapsed';

type AdminShellFrameProps = {
  children: ReactNode;
  email: string;
  logoutAction: (formData: FormData) => Promise<void>;
  newApplicationsCount: number;
  role: UserRole;
};

export function AdminShellFrame({ children, email, logoutAction, newApplicationsCount, role }: AdminShellFrameProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(sidebarStorageKey);
    if (stored === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const handleCollapsedChange = useCallback((nextValue: boolean) => {
    setIsCollapsed(nextValue);
    window.localStorage.setItem(sidebarStorageKey, String(nextValue));
  }, []);

  return (
    <div className="admin-layout-grid hidden min-h-screen lg:grid" data-sidebar-state={isCollapsed ? 'collapsed' : 'expanded'}>
      <AdminSidebar collapsed={isCollapsed} onCollapsedChange={handleCollapsedChange} newApplicationsCount={newApplicationsCount} role={role} />
      <div className="admin-main-shell min-w-0">
        <AdminHeader email={email} logoutAction={logoutAction} role={role} />
        <div className="admin-content-area">
          <UnsavedChangesProvider>{children}</UnsavedChangesProvider>
        </div>
      </div>
    </div>
  );
}
