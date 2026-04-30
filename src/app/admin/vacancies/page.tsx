import { ContentStatus } from '@prisma/client';
import { deleteVacancyDraft, updateVacancyStatus } from '@/app/admin/vacancies/actions';
import {
  AdminActionAlert,
  AdminPagination,
  HiddenRedirect
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableFrame,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow
} from '@/components/ui/admin-table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusBadgeVariants,
  contentStatusLabels,
  getAdminCurrentPath,
  getAdminPage,
  getAdminTotalPages,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminVacanciesPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminVacanciesPage({ searchParams }: AdminVacanciesPageProps) {
  await requireAdminSectionAccess('vacancies');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_VACANCIES_PATH, params);

  const [total, vacancies, vacancyStatusCounts] = await Promise.all([
    prisma.vacancy.count(),
    prisma.vacancy.findMany({
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.vacancy.groupBy({
      by: ['status'],
      _count: { _all: true }
    })
  ]);
  const totalPages = getAdminTotalPages(total);
  const vacancyCountByStatus = new Map(vacancyStatusCounts.map((item) => [item.status, item._count._all] as const));

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_VACANCIES_PATH}/create`} variant="secondary">
            Новая вакансия
          </Button>
        }
        description="Список ролей, рабочие статусы и публикация карточек для публичного каталога."
        eyebrow="Админка / Вакансии"
        title="Вакансии"
      />

      <AdminActionAlert params={params} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Всего" value={total} />
        <StatCard label="Опубликовано" value={vacancyCountByStatus.get(ContentStatus.PUBLISHED) ?? 0} />
        <StatCard label="Черновики" value={vacancyCountByStatus.get(ContentStatus.DRAFT) ?? 0} />
        <StatCard label="Архив" value={vacancyCountByStatus.get(ContentStatus.ARCHIVED) ?? 0} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все вакансии</h2>
          <p className="text-sm text-[var(--muted)]">
            Страница {page} из {totalPages}.
          </p>
        </div>

        {vacancies.length === 0 ? (
          <EmptyState title="Вакансий пока нет" />
        ) : (
          <AdminTableFrame>
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Вакансия</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Компания</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Действия</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {vacancies.map((vacancy) => (
                  <AdminTableRow key={vacancy.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <div className="font-semibold">{vacancy.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{vacancy.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{vacancy.category?.name ?? 'Без категории'}</div>
                      {vacancy.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {vacancy.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{vacancy.companyName}</div>
                      <div className="mt-1 text-xs">{vacancy.position}</div>
                      {vacancy.salaryLabel ? <div className="mt-1 text-xs">{vacancy.salaryLabel}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">{vacancy.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge variant={contentStatusBadgeVariants[vacancy.status]}>{contentStatusLabels[vacancy.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(vacancy.updatedAt)}</div>
                      {vacancy.updatedBy?.email ? <div className="mt-1 text-xs">{vacancy.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button href={`${ADMIN_VACANCIES_PATH}/${vacancy.id}`} size="sm" variant="secondary">
                          Изменить
                        </Button>
                        {vacancy.status !== ContentStatus.PUBLISHED ? (
                          <form action={updateVacancyStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="vacancyId" type="hidden" value={vacancy.id} />
                            <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                            <Button size="sm" type="submit">
                              Опубликовать
                            </Button>
                          </form>
                        ) : null}
                        {vacancy.status !== ContentStatus.ARCHIVED ? (
                          <form action={updateVacancyStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="vacancyId" type="hidden" value={vacancy.id} />
                            <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                            <Button size="sm" type="submit" variant="secondary">
                              В архив
                            </Button>
                          </form>
                        ) : null}
                        {vacancy.status !== ContentStatus.PUBLISHED ? (
                          <form action={deleteVacancyDraft}>
                            <HiddenRedirect value={currentPath} />
                            <input name="vacancyId" type="hidden" value={vacancy.id} />
                            <Button size="sm" type="submit" variant="ghost">
                              Удалить
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </AdminTableFrame>
        )}

        <AdminPagination
          basePath={ADMIN_VACANCIES_PATH}
          page={page}
          pageSize={ADMIN_CONTENT_PAGE_SIZE}
          params={params}
          total={total}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}
