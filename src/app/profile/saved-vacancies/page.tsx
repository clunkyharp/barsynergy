import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Bookmark, BookmarkX, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
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

  const savedVacancies = await prisma.savedVacancy.findMany({
    where: { userId: currentUser.id },
    include: {
      vacancy: {
        select: {
          id: true,
          title: true,
          slug: true,
          companyName: true,
          city: { select: { name: true } },
          salaryLabel: true,
          employmentType: true,
          publishedAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Закладки"
        description="Вакансии, которые вы сохранили для просмотра."
        title="Избранное"
      />

      <div className="space-y-4">
        {savedVacancies.length === 0 ? (
          <Panel className="max-w-xl" padding="lg">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Bookmark aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-7 text-[var(--text)]">Сохранённых вакансий нет</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Нажмите на значок закладки на странице вакансии — она появится здесь.
                </p>
              </div>
              <Button href="/vacancies">
                <Search size={15} strokeWidth={1.8} />
                Смотреть вакансии
              </Button>
            </div>
          </Panel>
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
                <form action={removeSavedVacancyAction}>
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
