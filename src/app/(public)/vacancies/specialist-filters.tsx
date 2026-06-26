import type { ReactNode } from 'react';
import { PublicFilters } from '@/components/public/public-filters';
import type { PublicContentSearchParams } from '@/lib/public/content';

type SpecialistFiltersProps = {
  filterOptions: Awaited<ReturnType<typeof import('@/lib/public/filter-options').getSpecialistFilterOptions>>;
  params: PublicContentSearchParams;
  titleMeta?: ReactNode;
};

export function SpecialistFilters({ filterOptions, titleMeta }: SpecialistFiltersProps) {
  return (
    <PublicFilters
      activeSummaryLabel="Параметры каталога"
      activeSummaryCountLabel="Фильтры каталога"
      cities={filterOptions.cities}
      cityAllLabel="Все города"
      cityLabel="Город"
      cityMode="multiple"
      embedded
      extraFilters={[
        { name: 'category', label: 'Профессия', allLabel: 'Любая', mode: 'multiple', options: filterOptions.professions },
        { name: 'employmentType', label: 'Занятость', allLabel: 'Любая', mode: 'multiple', options: filterOptions.employmentTypes },
        { name: 'jobSearchStatus', label: 'Статус поиска', allLabel: 'Любой', options: filterOptions.jobSearchStatuses }
      ]}
      placeholder="Имя, профессия или навык…"
      title="Фильтры"
      titleMeta={titleMeta}
      tone="directory"
      variant="sidebar"
    />
  );
}
