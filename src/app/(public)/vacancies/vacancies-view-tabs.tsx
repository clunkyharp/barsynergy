'use client';

import { useSearchParams } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'vacancies', label: 'Вакансии', href: '/vacancies' },
  { value: 'specialists', label: 'Специалисты', href: '/vacancies?view=specialists' },
] as const;

export function VacanciesViewTabs() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') ?? 'vacancies';

  return (
    <div className="flex gap-0.5 rounded-[var(--radius-md)] bg-[var(--surface-wash)] p-0.5" role="tablist">
      {tabs.map((tab) => {
        const isActive = currentView === tab.value;
        return (
          <AppLink
            key={tab.value}
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] px-3 text-[13px] font-semibold leading-4 transition-colors',
              isActive
                ? 'bg-[var(--surface-card)] text-[var(--text)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
          </AppLink>
        );
      })}
    </div>
  );
}
