'use client';

import type { UserRole } from '@prisma/client';
import {
  BadgePercent,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  Files,
  GraduationCap,
  Handshake,
  Hash,
  Home,
  Inbox,
  LayoutDashboard,
  MapPin,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { NavLink } from '@/components/ui/nav-link';
import { type AdminSection, canAccessAdminSection } from '@/lib/auth/permissions';

const adminLinks: { icon: LucideIcon; label: string; href: string; section: AdminSection; available?: boolean }[] = [
  { icon: LayoutDashboard, label: 'Рабочая очередь', href: '/admin', section: 'dashboard', available: true },
  { icon: Files, label: 'Статьи', href: '/admin/articles', section: 'articles', available: true },
  { icon: CalendarDays, label: 'События', href: '/admin/events', section: 'events', available: true },
  { icon: GraduationCap, label: 'Курсы', href: '/admin/courses', section: 'courses', available: true },
  { icon: BriefcaseBusiness, label: 'Вакансии', href: '/admin/vacancies', section: 'vacancies', available: true },
  { icon: Package, label: 'Поставщики', href: '/admin/suppliers', section: 'suppliers', available: true },
  { icon: Handshake, label: 'Партнёры', href: '/admin/partners', section: 'partners', available: true },
  { icon: BadgePercent, label: 'Генеральные спонсоры', href: '/admin/general-sponsors', section: 'generalSponsors', available: true },
  { icon: Home, label: 'Главная страница', href: '/admin/homepage', section: 'homepage', available: true },
  { icon: Inbox, label: 'Заявки', href: '/admin/applications', section: 'applications', available: true },
  { icon: Users, label: 'Бизнес-доступы', href: '/admin/users', section: 'users', available: true },
  { icon: Tags, label: 'Категории', href: '/admin/categories', section: 'categories', available: true },
  { icon: MapPin, label: 'Города', href: '/admin/cities', section: 'cities', available: true },
  { icon: Hash, label: 'Теги', href: '/admin/tags', section: 'tags', available: true },
  { icon: BrainCircuit, label: 'Навыки', href: '/admin/skills', section: 'skills', available: true }
];

const adminSidebarGroups: { title: string; sections: AdminSection[] }[] = [
  { title: 'Работа', sections: ['dashboard'] },
  {
    title: 'Контент',
    sections: ['articles', 'events', 'courses', 'vacancies', 'suppliers', 'partners', 'generalSponsors', 'homepage']
  },
  { title: 'Заявки', sections: ['applications'] },
  { title: 'Бизнес', sections: ['users'] },
  { title: 'Справочники', sections: ['categories', 'cities', 'tags', 'skills'] }
];

type AdminSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (nextValue: boolean) => void;
  newApplicationsCount: number;
  role: UserRole;
};

export function AdminSidebar({ collapsed, onCollapsedChange, newApplicationsCount, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const visibleLinks = adminLinks.filter((item) => item.available && canAccessAdminSection(role, item.section));
  const visibleGroups = adminSidebarGroups
    .map((group) => ({
      ...group,
      links: group.sections
        .map((section) => visibleLinks.find((item) => item.section === section))
        .filter((item): item is (typeof visibleLinks)[number] => Boolean(item))
    }))
    .filter((group) => group.links.length > 0);
  const roleLabel = role === 'ADMIN' ? 'Админ' : 'Модератор';
  const toggleLabel = collapsed ? 'Развернуть боковую навигацию' : 'Свернуть боковую навигацию';

  return (
    <aside aria-label="Навигация админки" className="admin-sidebar-shell" data-sidebar-state={collapsed ? 'collapsed' : 'expanded'} data-theme="dark">
      <button
        aria-controls="admin-sidebar-nav"
        aria-expanded={!collapsed}
        aria-label={toggleLabel}
        className="admin-sidebar-toggle"
        onClick={() => onCollapsedChange(!collapsed)}
        type="button"
      >
        {collapsed ? <PanelLeftOpen aria-hidden="true" size={17} strokeWidth={2.4} /> : <PanelLeftClose aria-hidden="true" size={17} strokeWidth={2.4} />}
      </button>
      <div className="admin-sidebar-body">
        <div className="admin-sidebar-header">
          <AppLink aria-label="Админка BARSYNERGY" className="admin-sidebar-brand" href="/admin">
            <span aria-hidden="true" className="admin-sidebar-brand-mark">
              B
            </span>
            <span className="admin-sidebar-brand-copy">
              <span className="admin-sidebar-brand-wordmark">BARSYNERGY</span>
              <span className="admin-sidebar-role-badge">
                <span className="admin-sidebar-role-badge-dot" aria-hidden="true" />
                {roleLabel}
              </span>
            </span>
          </AppLink>
        </div>
        <nav className="admin-sidebar-nav" id="admin-sidebar-nav">
          <div className="admin-sidebar-groups">
            {visibleGroups.map((group) => (
              <section aria-label={group.title} className="admin-sidebar-group" key={group.title}>
                <p className="admin-sidebar-group-title">{group.title}</p>
                <div className="admin-sidebar-group-links">
                  {group.links.map((item) => {
                    const isActive = item.href === '/admin' ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <NavLink
                        active={isActive}
                        aria-label={item.label}
                        className="admin-nav-link"
                        href={item.href}
                        key={item.href}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon aria-hidden="true" className="admin-sidebar-link-icon" size={18} strokeWidth={2.1} />
                        <span className="admin-sidebar-link-label">{item.label}</span>
                        {item.section === 'applications' && newApplicationsCount > 0 ? (
                          <span
                            aria-label={`Новых заявок: ${newApplicationsCount}`}
                            className="admin-sidebar-count-badge inline-flex items-center justify-center rounded-full bg-[var(--accent)] font-bold leading-none text-[var(--accent-contrast)]"
                          >
                            {newApplicationsCount > 9 ? '9+' : newApplicationsCount}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
