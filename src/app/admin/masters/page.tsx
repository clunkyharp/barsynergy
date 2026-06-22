import { ContentStatus } from '@/modules/admin/queries';
import { BadgeCheck, TriangleAlert } from 'lucide-react';
import { deleteMasterDraft, updateMasterStatus } from '@/app/admin/masters/actions';
import {
  AdminActionAlert,
  AdminContentStatusTabs,
  AdminContentRowActions,
  AdminListFilters,
  AdminPagination
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
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
import { StatCard } from '@/components/ui/stat-card';
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
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { listAdminMasters } from '@/modules/admin/masters/queries';

export const dynamic = 'force-dynamic';

const ADMIN_MASTERS_PATH = '/admin/masters';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

const entityTypeLabels: Record<string, string> = {
  INDIVIDUAL: 'Физ. лицо',
  BUSINESS: 'Компания'
};

type AdminMastersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminMastersPage({ searchParams }: AdminMastersPageProps) {
  await requireAdminSectionAccess('masters');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_MASTERS_PATH, params);
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const categoryId = getAdminStringFilter(params, 'categoryId');
  const cityId = getAdminStringFilter(params, 'cityId');
  const entityType = getAdminStringFilter(params, 'entityType');
  const isVerified = getAdminBooleanFilter(params, 'verified');
  const quickFilter = getAdminStringFilter(params, 'filter');
  const isNoCityFilter = quickFilter === 'no-city';
  const { masters, total, statusCounts: masterStatusCounts, categories, cities } = await listAdminMasters({
    page,
    q,
    status,
    categoryId,
    cityId,
    entityType,
    isVerified,
    isNoCityFilter
  });
  const totalPages = getAdminTotalPages(total);
  const masterCountByStatus = new Map(masterStatusCounts.map((item) => [item.status, item._count.id] as const));
  const hasActiveFilters = Boolean(q || status || categoryId || cityId || entityType || isVerified != null || isNoCityFilter);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_MASTERS_PATH}/create`}>
            Новый мастер
          </Button>
        }
        description="Карточки мастеров, проверка данных и ручная публикация."
        eyebrow="Админка / Мастера"
        title="Мастера"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_MASTERS_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_MASTERS_PATH}
        includeStatus={false}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) },
          {
            name: 'entityType',
            label: 'Тип',
            allLabel: 'Все типы',
            options: [
              { value: 'INDIVIDUAL', label: 'Физ. лицо' },
              { value: 'BUSINESS', label: 'Компания' }
            ]
          },
          {
            name: 'verified',
            label: 'Проверка',
            allLabel: 'Любая проверка',
            options: [
              { value: 'true', label: 'Проверен' },
              { value: 'false', label: 'Не проверен' }
            ]
          }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button href={`${ADMIN_MASTERS_PATH}?filter=no-city`} variant={isNoCityFilter ? 'primary' : 'secondary'}>
          Без города
        </Button>
        {isNoCityFilter ? (
          <Button href={ADMIN_MASTERS_PATH} variant="ghost">
            Сбросить быстрый фильтр
          </Button>
        ) : null}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Всего" value={total} />
        <StatCard label="Опубликовано" value={masterCountByStatus.get(ContentStatus.PUBLISHED) ?? 0} />
        <StatCard label="Черновики" value={masterCountByStatus.get(ContentStatus.DRAFT) ?? 0} />
        <StatCard label="Архив" value={masterCountByStatus.get(ContentStatus.ARCHIVED) ?? 0} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все мастера</h2>
          <p className="text-sm text-[var(--muted)]">
            Страница {page} из {totalPages}.
          </p>
        </div>

        <AdminTableFrame>
          <AdminTable minWidth={920}>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>Мастер</AdminTableHeaderCell>
                <AdminTableHeaderCell>Тип / Контакт</AdminTableHeaderCell>
                <AdminTableHeaderCell>География</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {masters.length === 0 ? (
                <AdminTableStateRow
                  colSpan={6}
                  description={hasActiveFilters ? 'По текущим фильтрам мастеров нет.' : 'Добавьте карточку мастера, укажите город и проверку.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Мастера не найдены' : 'Мастеров пока нет'}
                />
              ) : (
                masters.map((master) => (
                  <AdminTableRow key={master.id}>
                    <AdminTableCell className="max-w-[320px]" label="Мастер">
                      <AdminTableClamp className="font-semibold" title={`/${master.slug}`}>
                        {master.title}
                      </AdminTableClamp>
                      <div className="mt-1 text-xs text-[var(--muted)]">{master.category?.name ?? 'Без категории'}</div>
                    </AdminTableCell>
                    <AdminTableCell label="Тип / Контакт">
                      <div className="text-xs text-[var(--muted)]">
                        {entityTypeLabels[master.entityType] ?? master.entityType}
                      </div>
                      <div className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs">
                        <span className="truncate">{master.fullName ?? master.companyName ?? '—'}</span>
                        {master.isVerified ? (
                          <BadgeCheck aria-label="Проверен" className="shrink-0 text-[var(--success-text)]" size={14} strokeWidth={1.8} />
                        ) : (
                          <TriangleAlert aria-label="Не проверен" className="shrink-0 text-[var(--warning-text)]" size={14} strokeWidth={1.8} />
                        )}
                      </div>
                      {master.businessAccount ? (
                        <div className="mt-1 text-xs text-[var(--admin-accent)]">{master.businessAccount.companyName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell label="География">
                      <div className={master.city?.name ? 'text-[var(--text)]' : 'font-medium text-[var(--warning-text)]'}>
                        {master.city?.name ?? 'Без города'}
                      </div>
                      {master.serviceArea ? <div className="mt-1 text-xs text-[var(--muted)]">{master.serviceArea}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[master.status]}>{contentStatusLabels[master.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div className="max-w-[12rem] truncate">
                        {dateFormatter.format(master.updatedAt)}
                        {master.updatedBy?.email ? ` · ${formatAdminActor(master.updatedBy.email)}` : ''}
                      </div>
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deleteMasterDraft}
                        editHref={`${ADMIN_MASTERS_PATH}/${master.id}`}
                        idName="masterId"
                        idValue={master.id}
                        publicHref={`/masters/${master.slug}`}
                        status={master.status}
                        updateStatusAction={updateMasterStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

        <AdminPagination
          basePath={ADMIN_MASTERS_PATH}
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

function formatAdminActor(email: string) {
  return email.split('@')[0] || email;
}
