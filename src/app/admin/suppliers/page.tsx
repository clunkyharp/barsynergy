import { ContentStatus } from '@prisma/client';
import { deleteSupplierDraft, updateSupplierStatus } from '@/app/admin/suppliers/actions';
import {
  AdminActionAlert,
  AdminPagination,
  HiddenRedirect
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
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

  const [total, suppliers, supplierStatusCounts] = await Promise.all([
    prisma.supplier.count(),
    prisma.supplier.findMany({
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
      _count: { _all: true }
    })
  ]);
  const totalPages = getAdminTotalPages(total);
  const supplierCountByStatus = new Map(supplierStatusCounts.map((item) => [item.status, item._count._all] as const));

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_SUPPLIERS_PATH}/create`} variant="secondary">
            Новый поставщик
          </Button>
        }
        description="Карточки компаний, проверка контекста и ручная публикация каталога поставщиков."
        eyebrow="Админка / Поставщики"
        title="Поставщики"
      />

      <AdminActionAlert params={params} />

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
          <EmptyState title="Поставщиков пока нет" />
        ) : (
          <AdminTableFrame>
            <AdminTable minWidth={1040}>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Поставщик</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Контекст</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Действия</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {suppliers.map((supplier) => (
                  <AdminTableRow key={supplier.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <div className="font-semibold">{supplier.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{supplier.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{supplier.category?.name ?? 'Без категории'}</div>
                      {supplier.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {supplier.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{supplier.companyName}</div>
                      {supplier.isVerified ? <div className="mt-1 text-xs">Проверен</div> : null}
                      {supplier.serviceArea ? <div className="mt-1 text-xs">{supplier.serviceArea}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">{supplier.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge variant={contentStatusBadgeVariants[supplier.status]}>{contentStatusLabels[supplier.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(supplier.updatedAt)}</div>
                      {supplier.updatedBy?.email ? <div className="mt-1 text-xs">{supplier.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button href={`${ADMIN_SUPPLIERS_PATH}/${supplier.id}`} className="min-h-9 px-3 py-1.5 text-xs" variant="secondary">
                          Изменить
                        </Button>
                        {supplier.status !== ContentStatus.PUBLISHED ? (
                          <form action={updateSupplierStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="supplierId" type="hidden" value={supplier.id} />
                            <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                              Опубликовать
                            </Button>
                          </form>
                        ) : null}
                        {supplier.status !== ContentStatus.ARCHIVED ? (
                          <form action={updateSupplierStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="supplierId" type="hidden" value={supplier.id} />
                            <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                              В архив
                            </Button>
                          </form>
                        ) : null}
                        {supplier.status !== ContentStatus.PUBLISHED ? (
                          <form action={deleteSupplierDraft}>
                            <HiddenRedirect value={currentPath} />
                            <input name="supplierId" type="hidden" value={supplier.id} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="ghost">
                              Удалить
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>            </AdminTable>
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
