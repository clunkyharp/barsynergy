import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { PublicEmptyState } from '@/components/public/public-empty-state';
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

type SpecialistListSectionProps = {
  content: SpecialistListResult;
  filterOptions: Awaited<ReturnType<typeof import('@/lib/public/filter-options').getSpecialistFilterOptions>>;
  params: PublicContentSearchParams;
};

function SpecialistFilters({
  filterOptions,
  params,
}: {
  filterOptions: SpecialistListSectionProps['filterOptions'];
  params: PublicContentSearchParams;
}) {
  const activeMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  return (
    <div className="specialist-mode-panel">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Режим</span>
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
                  isActive
                    ? 'specialist-mode-link-active'
                    : 'specialist-mode-link-idle'
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

function SpecialistModeBar({
  filterOptions,
  params,
}: {
  filterOptions: SpecialistListSectionProps['filterOptions'];
  params: PublicContentSearchParams;
}) {
  const activeMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  return (
    <div className="specialist-mode-bar lg:hidden">
      <span className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Режим</span>
      <div className="specialist-mode-bar-links">
        {filterOptions.mode.map((opt) => {
          const isActive = activeMode === opt.value || (!activeMode && opt.value === 'seeking');
          return (
            <AppLink
              key={opt.value}
              className={cn(
                'specialist-mode-bar-link',
                isActive ? 'specialist-mode-bar-link-active' : 'specialist-mode-bar-link-idle'
              )}
              href={isActive ? '/vacancies?view=specialists' : buildModeUrl(params, opt.value)}
            >
              {opt.label}
            </AppLink>
          );
        })}
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
    <section className="specialist-directory-section background-zone background-zone-graphite border-b border-[var(--line)] py-8 md:py-14">
      <div className="container">
        <div className="lg:grid lg:grid-cols-[minmax(17rem,0.42fr)_minmax(0,1.58fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="flex flex-col gap-4">
              <SpecialistFilters filterOptions={filterOptions} params={params} />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <SpecialistModeBar filterOptions={filterOptions} params={params} />

            <div className="specialist-directory-summary">
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Каталог специалистов</span>
                <h2 className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.5rem]">Найдено {content.total}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Проверенные анкеты и предложения услуг для работы, проектов и сотрудничества.
                </p>
              </div>
            </div>

            {!hasItems ? (
              <PublicEmptyState
                actions={hasActiveFilters
                  ? [{ href: '/vacancies?view=specialists', label: 'Сбросить фильтры', variant: 'primary' }]
                  : [
                      { href: '/profile/settings#publish', label: 'Опубликовать резюме', variant: 'primary' },
                      { href: 'https://t.me/barsynergy', label: 'Следить в Telegram', variant: 'link' }
                    ]}
                className="bg-[var(--surface-card)]"
                description={hasActiveFilters
                  ? 'Сбросьте фильтры или измените запрос, чтобы вернуться к полному списку.'
                  : 'Когда появятся первые резюме и предложения услуг, они будут здесь.'}
                eyebrow="Специалисты"
                title={hasActiveFilters ? 'По этим параметрам ничего не найдено' : 'Специалистов пока нет'}
              />
            ) : (
              <Panel className="specialist-directory-panel" padding="none">
                <div className="flex flex-col gap-3 p-3 md:p-4">
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
