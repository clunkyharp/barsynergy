'use client';

import { usePathname } from 'next/navigation';
import { Building2, FileText, Users } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { SubmitButton } from '@/components/ui/submit-button';
import { cn } from '@/lib/utils';

type BusinessSidebarProps = {
  activeRequestCount: number;
  cityName?: string | null;
  companyName: string;
  logoutAction: () => Promise<void>;
};

const links = [
  { href: '/business/cabinet', label: 'Компания', icon: Building2 },
  { href: '/business/cabinet/requests', label: 'Заявки', icon: FileText },
  { href: '/business/cabinet/responses', label: 'Отклики', icon: Users }
];

export function BusinessSidebar({ activeRequestCount, cityName, companyName, logoutAction }: BusinessSidebarProps) {
  const pathname = usePathname();
  const companyMark = companyName.trim().charAt(0).toUpperCase() || 'B';

  return (
    <Panel className="h-fit border-[var(--line)] shadow-none" padding="md" tone="elevated">
      <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-wash)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex min-w-0 items-center gap-3">
            <span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-base font-semibold text-[var(--text)]">
              {companyMark}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Бизнес-кабинет</p>
              <p className="truncate text-lg font-semibold tracking-normal">{companyName}</p>
            </div>
          </div>
          <StatusBadge showDot={false} variant="success">Активен</StatusBadge>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          {cityName ? <span>{cityName}</span> : null}
          {activeRequestCount > 0 ? (
            <StatusBadge showDot={false} variant="pending">
              Заявок в работе: {activeRequestCount}
            </StatusBadge>
          ) : null}
        </div>
      </div>
      <nav className="mt-5 grid gap-1 text-sm" aria-label="Разделы кабинета компании">
        {links.map((link) => {
          const isActive =
            link.href === '/business/cabinet'
              ? pathname === link.href
              : pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <AppLink
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-10 items-center gap-3 rounded-[var(--radius-md)] border-l-2 border-l-transparent px-3 py-2 font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)]',
                isActive ? 'border-l-[var(--accent)] bg-[var(--surface-wash)]' : 'hover:bg-[var(--surface-muted)]'
              )}
              href={link.href}
              key={link.href}
            >
              <link.icon aria-hidden="true" size={16} strokeWidth={1.8} />
              {link.label}
            </AppLink>
          );
        })}
      </nav>
      {activeRequestCount === 0 ? (
        <Panel className="mt-5 border-[var(--line)] bg-[var(--surface-wash)] text-sm leading-6 text-[var(--muted)] shadow-none" padding="sm">
          Сначала проверьте профиль и текущие заявки. Новые запросы лучше отправлять после заполнения основных данных компании.
        </Panel>
      ) : null}
      <form action={logoutAction} className="mt-4">
        <SubmitButton className="w-full rounded-[var(--radius-md)]" variant="secondary">
          Выйти
        </SubmitButton>
      </form>
    </Panel>
  );
}
