import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import type { PublicContentSearchParams } from '@/lib/public/content';
import { cn } from '@/lib/utils';

function buildModeUrl(params: PublicContentSearchParams, mode: string): string {
  const searchParams = new URLSearchParams();
  searchParams.set('view', 'specialists');

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'view' || key === 'mode' || key === 'page') return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value) {
      searchParams.set(key, value);
    }
  });

  searchParams.set('mode', mode);
  return `/vacancies?${searchParams.toString()}`;
}

type SpecialistFiltersProps = {
  filterOptions: Awaited<ReturnType<typeof import('@/lib/public/filter-options').getSpecialistFilterOptions>>;
  params: PublicContentSearchParams;
  titleMeta?: ReactNode;
};

export function SpecialistFilters({ filterOptions, params, titleMeta }: SpecialistFiltersProps) {
  const activeMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  return (
    <div className="specialist-mode-panel">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Режим</span>
          {titleMeta ? <span className="shrink-0 text-[13px] font-medium text-[var(--muted)]">{titleMeta}</span> : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Выберите, какие анкеты показывать в каталоге.</p>
      </div>
      <div className="grid gap-2">
        {filterOptions.mode.map((opt) => {
          const isActive = activeMode === opt.value || (!activeMode && opt.value === 'seeking');
          return (
            <AppLink
              key={opt.value}
              className={cn(
                'specialist-mode-link',
                isActive ? 'specialist-mode-link-active' : 'specialist-mode-link-idle'
              )}
              href={isActive ? '/vacancies?view=specialists' : buildModeUrl(params, opt.value)}
            >
              <span>{opt.label}</span>
              <span aria-hidden="true">{isActive ? '●' : '○'}</span>
            </AppLink>
          );
        })}
      </div>
      <div className="specialist-mode-note">
        Переключение режима сразу обновляет список.
      </div>
    </div>
  );
}
