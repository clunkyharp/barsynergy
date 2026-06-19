'use client';

import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/profile/settings/profile', label: 'Профиль' },
  { href: '/profile/settings/career', label: 'Карьера' },
  { href: '/profile/settings/notifications', label: 'Уведомления' },
  { href: '/profile/settings/security', label: 'Безопасность' }
] as const;

export function SettingsNavTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Разделы настроек" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

        return (
          <AppLink
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              isActive
                ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)]'
            )}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </AppLink>
        );
      })}
    </nav>
  );
}
