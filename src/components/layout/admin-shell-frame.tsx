'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { UserRole } from '@prisma/client';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

const sidebarStorageKey = 'barsynergy-admin-sidebar-collapsed';

type AdminShellFrameProps = {
  children: ReactNode;
  email: string;
  role: UserRole;
};

export function AdminShellFrame({ children, email, role }: AdminShellFrameProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(window.localStorage.getItem(sidebarStorageKey) === 'true');
  }, []);

  const handleCollapsedChange = useCallback((nextValue: boolean) => {
    setIsCollapsed(nextValue);
    window.localStorage.setItem(sidebarStorageKey, String(nextValue));
  }, []);

  return (
    <div className="admin-layout-grid hidden min-h-screen lg:grid" data-sidebar-state={isCollapsed ? 'collapsed' : 'expanded'}>
      <AdminSidebar collapsed={isCollapsed} onCollapsedChange={handleCollapsedChange} role={role} />
      <div className="admin-main-shell min-w-0">
        <AdminHeader email={email} role={role} />
        <div className="admin-content-area">{children}</div>
      </div>
    </div>
  );
}
