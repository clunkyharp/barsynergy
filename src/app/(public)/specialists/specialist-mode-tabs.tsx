'use client';

import { useSearchParams } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const MODE_TABS = [
  { value: 'job', label: 'Ищут работу', href: '/specialists?mode=job' },
  { value: 'services', label: 'Предлагают услуги', href: '/specialists?mode=services' },
  { value: 'teams', label: 'Сервисные команды', href: '/specialists?mode=teams' }
] as const;

type SpecialistModeTabsProps = {
  counts?: Record<string, number>;
};

export function SpecialistModeTabs({ counts }: SpecialistModeTabsProps) {
  const searchParams = useSearchParams();
  const currentMode = searchParams.get('mode') ?? 'job';

  return (
    <div className="vacancy-directory-tabs" role="tablist">
      {MODE_TABS.map((tab) => {
        const isActive = currentMode === tab.value;
        const count = counts?.[tab.value];
        return (
          <AppLink
            key={tab.value}
            className={cn(
              'vacancy-directory-tab',
              isActive ? 'vacancy-directory-tab-active' : 'vacancy-directory-tab-idle'
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
