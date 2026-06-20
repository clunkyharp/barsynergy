'use client';

import { useSearchParams } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'vacancies', label: 'Вакансии', href: '/vacancies' },
  { value: 'specialists', label: 'Специалисты', href: '/vacancies?view=specialists' },
] as const;

type VacanciesViewTabsProps = {
  vacanciesCount?: number;
  specialistsCount?: number;
};

export function VacanciesViewTabs({ vacanciesCount, specialistsCount }: VacanciesViewTabsProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') ?? 'vacancies';
  const counts = {
    vacancies: vacanciesCount,
    specialists: specialistsCount
  };

  return (
    <div className="vacancy-directory-tabs" role="tablist">
      {tabs.map((tab) => {
        const isActive = currentView === tab.value;
        const count = counts[tab.value];
        return (
          <AppLink
            key={tab.value}
            className={cn(
              'vacancy-directory-tab',
              isActive
                ? 'vacancy-directory-tab-active'
                : 'vacancy-directory-tab-idle'
            )}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
          >
            <span>{tab.label}</span>
            {typeof count === 'number' ? (
              <span className="vacancy-directory-tab-count">{count.toLocaleString('ru-RU')}</span>
            ) : null}
          </AppLink>
        );
      })}
    </div>
  );
}
