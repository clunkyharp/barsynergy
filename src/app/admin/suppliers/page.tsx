import { ContentStatus } from '@/modules/admin/queries';
import { BadgeCheck, TriangleAlert } from 'lucide-react';
import { deleteSupplierDraft, updateSupplierStatus } from '@/app/admin/suppliers/actions';
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
import { listAdminSuppliers } from '@/modules/admin/suppliers/queries';

export const dynamic = 'force-dynamic';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

type AdminSuppliersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminSuppliersPage({ searchParams }: AdminSuppliersPageProps) {
  await requireAdminSectionAccess('suppliers');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_SUPPLIERS_PATH, params);
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const categoryId = getAdminStringFilter(params, 'categoryId');
  const cityId = getAdminStringFilter(params, 'cityId');
  const verifiedFilter = getAdminStringFilter(params, 'verified');
  const quickFilter = getAdminStringFilter(params, 'filter');
  const isNoCityFilter = quickFilter === 'no-city';
  const isVerified = getAdminBooleanFilter(params, 'verified');
  const { suppliers, total, statusCounts: supplierStatusCounts, categories, cities } = await listAdminSuppliers({
    page,
    q,
    status,
    categoryId,
    cityId,
    isVerified,
    isNoCityFilter
  });
  const totalPages = getAdminTotalPages(total);
  const supplierCountByStatus = new Map(supplierStatusCounts.map((item) => [item.status, item._count.id] as const));
  const hasActiveFilters = Boolean(q || status || categoryId || cityId || verifiedFilter || isNoCityFilter);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_SUPPLIERS_PATH}/create`}>
            Новый поставщик
          </Button>
        }
        description="Карточки компаний, проверка данных и ручная публикация каталога поставщиков."
        eyebrow="Админка / Поставщики"
        title="Поставщики"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_SUPPLIERS_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_SUPPLIERS_PATH}
        includeStatus={false}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) },
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
        <Button href={`${ADMIN_SUPPLIERS_PATH}?filter=no-city`} variant={isNoCityFilter ? 'primary' : 'secondary'}>
          Без города
        </Button>
        {isNoCityFilter ? (
          <Button href={ADMIN_SUPPLIERS_PATH} variant="ghost">
            Сбросить быстрый фильтр
          </Button>
        ) : null}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Всего" value={total} />
        <StatCard label="Опубликовано" value={supplierCountByStatus.get(ContentStatus.PUBLISHED) ?? 0} />
        <StatCard label="Черновики" value={supplierCountByStatus.get(ContentStatus.DRAFT) ?? 0} />
        <StatCard label="Архив" value={supplierCountByStatus.get(ContentStatus.ARCHIVED) ?? 0} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все поставщики</h2>
          <p className="text-sm text-[var(--muted)]">
            Страница {page} из {totalPages}.
          </p>
        </div>

        <AdminTableFrame>
          <AdminTable minWidth={920}>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>Поставщик</AdminTableHeaderCell>
                <AdminTableHeaderCell>Компания</AdminTableHeaderCell>
                <AdminTableHeaderCell>География</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {suppliers.length === 0 ? (
                <AdminTableStateRow
                  colSpan={6}
                  description={hasActiveFilters ? 'По текущим фильтрам поставщиков нет.' : 'Добавьте компанию, географию работы и статус проверки.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Поставщики не найдены' : 'Поставщиков пока нет'}
                />
              ) : (
                suppliers.map((supplier) => (
                  <AdminTableRow key={supplier.id}>
                    <AdminTableCell className="max-w-[320px]" label="Поставщик">
                      <AdminTableClamp className="font-semibold" title={`/${supplier.slug}`}>
                        {supplier.title}
                      </AdminTableClamp>
                      <div className="mt-1 text-xs text-[var(--muted)]">{supplier.category?.name ?? 'Без категории'}</div>
                    </AdminTableCell>
                    <AdminTableCell label="Компания">
                      <span className="inline-flex max-w-full items-center gap-1.5">
                        <span className="truncate">{supplier.companyName}</span>
                        {supplier.isVerified ? (
                          <BadgeCheck aria-label="Проверен" className="shrink-0 text-[var(--success-text)]" size={14} strokeWidth={1.8} />
                        ) : (
                          <TriangleAlert aria-label="Не проверен" className="shrink-0 text-[var(--warning-text)]" size={14} strokeWidth={1.8} />
                        )}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell label="География">
                      <div className={supplier.city?.name ? 'text-[var(--text)]' : 'font-medium text-[var(--warning-text)]'}>
                        {supplier.city?.name ?? 'Без города'}
                      </div>
                      {supplier.serviceArea ? <div className="mt-1 text-xs text-[var(--muted)]">{supplier.serviceArea}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[supplier.status]}>{contentStatusLabels[supplier.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div className="max-w-[12rem] truncate">
                        {dateFormatter.format(supplier.updatedAt)}
                        {supplier.updatedBy?.email ? ` · ${formatAdminActor(supplier.updatedBy.email)}` : ''}
                      </div>
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deleteSupplierDraft}
                        editHref={`${ADMIN_SUPPLIERS_PATH}/${supplier.id}`}
                        idName="supplierId"
                        idValue={supplier.id}
                        publicHref={`/suppliers/${supplier.slug}`}
                        status={supplier.status}
                        updateStatusAction={updateSupplierStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

        <AdminPagination
          basePath={ADMIN_SUPPLIERS_PATH}
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
