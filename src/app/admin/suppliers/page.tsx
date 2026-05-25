import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { deleteSupplierDraft, updateSupplierStatus } from '@/app/admin/suppliers/actions';
import {
  AdminActionAlert,
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
  AdminTableRow
} from '@/components/ui/admin-table';
import { EmptyState } from '@/components/ui/empty-state';
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
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
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
  const isVerified = getAdminBooleanFilter(params, 'verified');
  const searchWhere: Prisma.SupplierWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { serviceArea: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {};
  const where: Prisma.SupplierWhereInput = {
    status,
    categoryId,
    cityId,
    isVerified,
    ...searchWhere
  };

  const [total, suppliers, supplierStatusCounts, categories, cities] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
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
    prisma.supplier.groupBy({
      by: ['status'],
      where: searchWhere,
      _count: { _all: true }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.SUPPLIER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);
  const totalPages = getAdminTotalPages(total);
  const supplierCountByStatus = new Map(supplierStatusCounts.map((item) => [item.status, item._count._all] as const));
  const hasActiveFilters = Boolean(q || status || categoryId || cityId || verifiedFilter);

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
      <AdminListFilters
        basePath={ADMIN_SUPPLIERS_PATH}
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

        {suppliers.length === 0 ? (
          <EmptyState
            actionHref={hasActiveFilters ? ADMIN_SUPPLIERS_PATH : `${ADMIN_SUPPLIERS_PATH}/create`}
            actionLabel={hasActiveFilters ? 'Сбросить фильтры' : 'Создать поставщика'}
            description={hasActiveFilters ? 'По текущим фильтрам поставщиков нет.' : 'Добавьте компанию, географию работы и статус проверки.'}
            title={hasActiveFilters ? 'Поставщики не найдены' : 'Поставщиков пока нет'}
          />
        ) : (
          <AdminTableFrame>
            <AdminTable minWidth={1040}>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Поставщик</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Компания</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {suppliers.map((supplier) => (
                  <AdminTableRow key={supplier.id}>
                    <AdminTableCell className="max-w-[320px]" label="Поставщик">
                      <AdminTableClamp className="font-semibold">{supplier.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{supplier.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{supplier.category?.name ?? 'Без категории'}</div>
                      {supplier.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {supplier.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Компания">
                      <div>{supplier.companyName}</div>
                      <div className="mt-1">
                        <StatusBadge variant={supplier.isVerified ? 'success' : 'warning'}>
                          {supplier.isVerified ? 'Проверен' : 'Не проверен'}
                        </StatusBadge>
                      </div>
                      {supplier.serviceArea ? <div className="mt-1 text-xs">{supplier.serviceArea}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Город">{supplier.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[supplier.status]}>{contentStatusLabels[supplier.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div>{dateFormatter.format(supplier.updatedAt)}</div>
                      {supplier.updatedBy?.email ? <div className="mt-1 text-xs">{supplier.updatedBy.email}</div> : null}
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
                ))}
              </AdminTableBody>
            </AdminTable>
          </AdminTableFrame>
        )}

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
