import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { SpecialistCard } from '@/components/public/specialist-card';
import type { SpecialistListResult, PublicContentSearchParams } from '@/lib/public/content';
import { cn } from '@/lib/utils';

function buildSpecialistPageUrl(params: PublicContentSearchParams, page: number): string {
  const searchParams = new URLSearchParams();
  searchParams.set('view', 'specialists');

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'view') return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value) {
      searchParams.set(key, value);
    }
  });

  if (page > 1) searchParams.set('page', String(page));
  else searchParams.delete('page');

  const query = searchParams.toString();
  return `/vacancies?${query}`;
}

type SpecialistListSectionProps = {
  content: SpecialistListResult;
  filterOptions: Awaited<ReturnType<typeof import('@/lib/public/filter-options').getSpecialistFilterOptions>>;
  params: PublicContentSearchParams;
};

function SpecialistFilters({
  filterOptions,
}: {
  filterOptions: SpecialistListSectionProps['filterOptions'];
}) {
  const activeMode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('mode')
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Режим</span>
        <div className="flex flex-col gap-1">
          {filterOptions.mode.map((opt) => {
            const href = opt.value === activeMode ? '/vacancies?view=specialists' : `/vacancies?view=specialists&mode=${opt.value}`;
            const isActive = activeMode === opt.value || (!activeMode && opt.value === 'seeking');
            return (
              <AppLink
                key={opt.value}
                className={cn(
                  'rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--accent)]/10 font-semibold text-[var(--accent-strong)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface-wash)] hover:text-[var(--text)]'
                )}
                href={href}
              >
                {opt.label}
              </AppLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SpecialistListSection({
  content,
  filterOptions,
  params,
}: SpecialistListSectionProps) {
  const hasItems = content.items.length > 0;
  const hasActiveFilters = Object.keys(params).length > 0;

  return (
    <section className="public-section">
      <div className="public-section-inner">
        <div className="xl:grid xl:grid-cols-[280px_1fr] xl:gap-10">
          <aside className="hidden xl:block">
            <div className="sticky top-24 flex flex-col gap-6">
              <SpecialistFilters filterOptions={filterOptions} />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">{content.total} найдено</span>
              </div>
            </div>

            {!hasItems ? (
              <Panel tone="elevated">
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <PublicDisplayTitle as="h2">
                    {hasActiveFilters ? 'По этим параметрам ничего не найдено' : 'Специалистов пока нет'}
                  </PublicDisplayTitle>
                  <PublicBodyText>
                    {hasActiveFilters
                      ? 'Сбросьте фильтры или измените запрос.'
                      : 'Когда появятся первые резюме и предложения, они будут здесь.'}
                  </PublicBodyText>
                  {hasActiveFilters ? (
                    <Button href="/vacancies?view=specialists" variant="link">
                      Сбросить фильтры
                      <ArrowUpRight size={14} />
                    </Button>
                  ) : null}
                </div>
              </Panel>
            ) : (
              <Panel tone="elevated">
                <div className="flex flex-col gap-3">
                  {content.items.map((item) => (
                    <SpecialistCard key={`${item.mode}-${item.id}`} item={item} rowActionLabel="Подробнее" />
                  ))}
                </div>
              </Panel>
            )}

            {content.totalPages > 1 ? (
              <nav aria-label="Пагинация" className="flex items-center justify-center gap-4">
                {content.page > 1 ? (
                  <Button
                    href={buildSpecialistPageUrl(params, content.page - 1)}
                    size="sm"
                    variant="secondary"
                  >
                    Назад
                  </Button>
                ) : (
                  <span />
                )}
                <span className="text-sm text-[var(--muted)]">
                  {content.page} из {content.totalPages}
                </span>
                {content.page < content.totalPages ? (
                  <Button
                    href={buildSpecialistPageUrl(params, content.page + 1)}
                    size="sm"
                    variant="secondary"
                  >
                    Вперёд
                  </Button>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
