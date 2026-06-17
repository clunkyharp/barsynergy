'use client';

import { useSearchParams } from 'next/navigation';
import { BriefcaseBusiness, UserRound } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'vacancies', label: 'Вакансии', href: '/vacancies', icon: BriefcaseBusiness },
  { value: 'specialists', label: 'Специалисты', href: '/vacancies?view=specialists', icon: UserRound },
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
        const Icon = tab.icon;
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
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{tab.label}</span>
            {typeof count === 'number' ? (
              <span className="vacancy-directory-tab-count">{count}</span>
            ) : null}
          </AppLink>
        );
      })}
    </div>
  );
}
