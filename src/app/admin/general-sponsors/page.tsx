import type { Prisma } from '@/modules/admin/queries';
import {
  deleteGeneralSponsorDraft,
  updateGeneralSponsorStatus
} from '@/app/admin/general-sponsors/actions';
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
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusBadgeVariants,
  contentStatusLabels,
  getAdminCurrentPath,
  getAdminPage,
  getAdminBooleanFilter,
  getAdminSearchQuery,
  getAdminStringFilter,
  getAdminStatusFilter,
  getAdminTotalPages,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { getActiveCities, getGeneralSponsorList } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminGeneralSponsorsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminGeneralSponsorsPage({ searchParams }: AdminGeneralSponsorsPageProps) {
  await requireAdminSectionAccess('generalSponsors');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_GENERAL_SPONSORS_PATH, params);
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const cityId = getAdminStringFilter(params, 'cityId');
  const featuredFilter = getAdminStringFilter(params, 'featured');
  const isFeatured = getAdminBooleanFilter(params, 'featured');
  const where: Prisma.GeneralSponsorWhereInput = {
    status,
    cityId,
    isFeatured,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { shortDescription: { contains: q, mode: 'insensitive' } },
            { fullDescription: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [[sponsors, total], cities] = await Promise.all([
    getGeneralSponsorList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getActiveCities()
  ]);
  const totalPages = getAdminTotalPages(total);
  const hasActiveFilters = Boolean(q || status || cityId || featuredFilter);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={<Button href={`${ADMIN_GENERAL_SPONSORS_PATH}/new`}>Создать спонсора</Button>}
        description="Генеральные спонсоры для главной страницы и раздела спонсорства."
        eyebrow="Админка / Генспонсоры"
        title="Генеральные спонсоры"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_GENERAL_SPONSORS_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_GENERAL_SPONSORS_PATH}
        includeStatus={false}
        filters={[
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) },
          {
            name: 'featured',
            label: 'Приоритет',
            allLabel: 'Любой приоритет',
            options: [
              { value: 'true', label: 'Приоритетный' },
              { value: 'false', label: 'Обычный' }
            ]
          }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию"
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все генеральные спонсоры</h2>
          <p className="text-sm text-[var(--muted)]">Найдено записей: {total}.</p>
        </div>

        <AdminTableFrame>
          <AdminTable minWidth={1040}>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeaderCell>Спонсор</AdminTableHeaderCell>
                <AdminTableHeaderCell>Город и приоритет</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {sponsors.length === 0 ? (
                <AdminTableStateRow
                  colSpan={5}
                  description={hasActiveFilters ? 'По текущим фильтрам спонсоров нет.' : 'Добавьте генерального спонсора, город и параметры показа.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Генеральные спонсоры не найдены' : 'Генеральных спонсоров пока нет'}
                />
              ) : (
                sponsors.map((sponsor) => (
                  <AdminTableRow key={sponsor.id}>
                    <AdminTableCell className="max-w-[320px]" label="Спонсор">
                      <AdminTableClamp className="font-semibold">{sponsor.name}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{sponsor.slug}</div>
                      {sponsor.logoImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Логотип: {sponsor.logoImage.originalName}</div>
                      ) : sponsor.logoPath ? (
                        <div className="mt-1 truncate text-xs text-[var(--muted)]">Логотип: {sponsor.logoPath}</div>
                      ) : null}
                      {sponsor.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {sponsor.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Город и приоритет">
                      <div>{sponsor.city?.name ?? 'Без города'}</div>
                      {sponsor.seasonLabel ? <div className="mt-1 text-xs">{sponsor.seasonLabel}</div> : null}
                      {sponsor.isFeatured ? <div className="mt-1 text-xs">Приоритетный</div> : null}
                    </AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[sponsor.status]}>{contentStatusLabels[sponsor.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div>{dateFormatter.format(sponsor.updatedAt)}</div>
                      {sponsor.updatedBy?.email ? <div className="mt-1 text-xs">{sponsor.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deleteGeneralSponsorDraft}
                        editHref={`${ADMIN_GENERAL_SPONSORS_PATH}/${sponsor.id}/edit`}
                        idName="sponsorId"
                        idValue={sponsor.id}
                        publicHref="/general-sponsors"
                        status={sponsor.status}
                        updateStatusAction={updateGeneralSponsorStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

        <AdminPagination
          basePath={ADMIN_GENERAL_SPONSORS_PATH}
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
