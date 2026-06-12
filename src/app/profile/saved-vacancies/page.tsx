import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Bookmark, BookmarkX, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getSavedVacancies } from '@/modules/profile/queries';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { AppLink } from '@/components/ui/app-link';
import { getAdminOptionLabel, vacancyEmploymentTypeOptions } from '@/lib/admin/content-labels';
import { removeSavedVacancyAction } from '@/lib/profile/saved-vacancies-actions';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Избранные вакансии',
  description: 'Список сохранённых вакансий.'
});

export default async function SavedVacanciesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/saved-vacancies');
  }

  const savedVacancies = await getSavedVacancies(currentUser.id);

  return (
    <div className="space-y-6">
      <PageHeader bare title="Избранное" />

      <div className="space-y-4">
        {savedVacancies.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Сохранённых вакансий нет"
            description="Нажмите на значок закладки на странице вакансии — она появится здесь."
            actions={[{ label: 'Смотреть вакансии', href: '/vacancies', icon: Search }]}
          />
        ) : (
          savedVacancies.map((sv) => {
            const v = sv.vacancy;
            return (
              <Panel key={sv.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" padding="md" tone="elevated">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">
                    <AppLink className="hover:text-[var(--accent)] transition-colors" href={`/vacancies/${v.slug}`}>
                      {v.title}
                    </AppLink>
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{v.companyName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {v.city && <MetaChip variant="filter">{v.city.name}</MetaChip>}
                    {v.salaryLabel && <MetaChip variant="filter">{v.salaryLabel}</MetaChip>}
                    {v.employmentType && <MetaChip variant="filter">{getAdminOptionLabel(vacancyEmploymentTypeOptions, v.employmentType)}</MetaChip>}
                  </div>
                </div>
                <form action={async (formData) => { await removeSavedVacancyAction(formData); }}>
                  <input name="savedVacancyId" type="hidden" value={sv.id} />
                  <Button className="rounded-[var(--radius-md)]" size="sm" type="submit" variant="secondary">
                    <BookmarkX size={14} strokeWidth={1.8} />
                    Убрать
                  </Button>
                </form>
              </Panel>
            );
          })
        )}
      </div>
    </div>
  );
}
