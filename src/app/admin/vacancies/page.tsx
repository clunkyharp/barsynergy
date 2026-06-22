import { ContentStatus } from '@/modules/admin/queries';
import { deleteVacancyDraft, updateVacancyStatus } from '@/app/admin/vacancies/actions';
import {
  AdminActionAlert,
  AdminContentStatusTabs,
  AdminContentRowActions,
  AdminListFilters,
  AdminPagination
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import {
  AdminTable,
  AdminTableActionsCell,
  AdminTableActionsHeaderCell,
  AdminTableBody,
  AdminTableCell,
  AdminTableClamp,
  AdminTableFrame,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  AdminTableStateRow
} from '@/components/ui/admin-table';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusBadgeVariants,
  contentStatusLabels,
  getAdminCurrentPath,
  getAdminPage,
  getAdminSearchQuery,
  getAdminStringFilter,
  getAdminStatusFilter,
  getAdminTotalPages,
  vacancyEmploymentTypeOptions,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { listAdminVacancies } from '@/modules/admin/vacancies/queries';

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
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const categoryId = getAdminStringFilter(params, 'categoryId');
  const cityId = getAdminStringFilter(params, 'cityId');
  const employmentType = getAdminStringFilter(params, 'employmentType');

  const { vacancies, total, statusCounts: vacancyStatusCounts, categories, cities } = await listAdminVacancies({
    page,
    q,
    status,
    categoryId,
    cityId,
    employmentType
  });
  const totalPages = getAdminTotalPages(total);
  const vacancyCountByStatus = new Map(vacancyStatusCounts.map((item) => [item.status, item._count.id] as const));
  const hasActiveFilters = Boolean(q || status || categoryId || cityId || employmentType);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_VACANCIES_PATH}/create`}>
            Новая вакансия
          </Button>
        }
        description="Список ролей, рабочие статусы и публикация карточек для публичного каталога."
        eyebrow="Админка / Вакансии"
        title="Вакансии"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_VACANCIES_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_VACANCIES_PATH}
        includeStatus={false}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) },
          { name: 'employmentType', label: 'Тип занятости', allLabel: 'Все типы', options: [...vacancyEmploymentTypeOptions] }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию"
      />

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

        <AdminTableFrame>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>Вакансия</AdminTableHeaderCell>
                <AdminTableHeaderCell>Компания</AdminTableHeaderCell>
                <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {vacancies.length === 0 ? (
                <AdminTableStateRow
                  colSpan={6}
                  description={hasActiveFilters ? 'По текущим фильтрам вакансий нет.' : 'Добавьте первую вакансию и настройте её публикацию.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Вакансии не найдены' : 'Вакансий пока нет'}
                />
              ) : (
                vacancies.map((vacancy) => (
                  <AdminTableRow key={vacancy.id}>
                    <AdminTableCell className="max-w-[320px]" label="Вакансия">
                      <AdminTableClamp className="font-semibold">{vacancy.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{vacancy.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{vacancy.category?.name ?? 'Без категории'}</div>
                      {vacancy.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {vacancy.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Компания">
                      <div>{vacancy.companyName}</div>
                      <div className="mt-1 text-xs">{vacancy.position}</div>
                      {vacancy.salaryLabel ? <div className="mt-1 text-xs">{vacancy.salaryLabel}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Город">{vacancy.city?.name ?? <span className="text-[var(--muted)]">Без города</span>}</AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[vacancy.status]}>{contentStatusLabels[vacancy.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div>{dateFormatter.format(vacancy.updatedAt)}</div>
                      {vacancy.updatedBy?.email ? <div className="mt-1 text-xs">{vacancy.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deleteVacancyDraft}
                        editHref={`${ADMIN_VACANCIES_PATH}/${vacancy.id}`}
                        idName="vacancyId"
                        idValue={vacancy.id}
                        publicHref={`/vacancies/${vacancy.slug}`}
                        status={vacancy.status}
                        updateStatusAction={updateVacancyStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

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
