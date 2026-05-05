import { CategoryType, type Prisma } from '@prisma/client';
import { deletePartnerDraft, updatePartnerStatus } from '@/app/admin/partners/actions';
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
  partnerTypeOptions,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_PARTNERS_PATH = '/admin/partners';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminPartnersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminPartnersPage({ searchParams }: AdminPartnersPageProps) {
  await requireAdminSectionAccess('partners');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_PARTNERS_PATH, params);
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const categoryId = getAdminStringFilter(params, 'categoryId');
  const partnerType = getAdminStringFilter(params, 'partnerType');
  const isFeatured = getAdminBooleanFilter(params, 'featured');
  const where: Prisma.PartnerWhereInput = {
    status,
    categoryId,
    partnerType,
    isFeatured,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
            { partnerType: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, partners, categories] = await Promise.all([
    prisma.partner.count({ where }),
    prisma.partner.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.PARTNER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={<Button href="/admin/partners/create">Создать партнёра</Button>}
        description="Карточки партнёрских программ, типы сотрудничества и управление публикацией."
        eyebrow="Админка / Партнёры"
        title="Партнёры"
      />

      <AdminActionAlert params={params} />
      <AdminListFilters
        basePath={ADMIN_PARTNERS_PATH}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'partnerType', label: 'Тип партнёра', allLabel: 'Все типы', options: [...partnerTypeOptions] },
          {
            name: 'featured',
            label: 'Подборка',
            allLabel: 'Любой статус',
            options: [
              { value: 'true', label: 'В подборке' },
              { value: 'false', label: 'Не в подборке' }
            ]
          }
        ]}
        params={params}
        searchPlaceholder="Поиск по партнёру, компании или типу"
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все партнёры</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {partners.length === 0 ? (
          <EmptyState title="Партнёров пока нет" />
        ) : (
          <AdminTableFrame>
            <AdminTable minWidth={980}>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>Партнёр</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Контекст</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {partners.map((partner) => (
                  <AdminTableRow key={partner.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <AdminTableClamp className="font-semibold">{partner.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{partner.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{partner.category?.name ?? 'Без категории'}</div>
                      {partner.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {partner.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{partner.companyName}</div>
                      {partner.partnerType ? <div className="mt-1 text-xs">{partner.partnerType}</div> : null}
                      {partner.isFeatured ? <div className="mt-1 text-xs">В подборке</div> : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge variant={contentStatusBadgeVariants[partner.status]}>{contentStatusLabels[partner.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(partner.updatedAt)}</div>
                      {partner.updatedBy?.email ? <div className="mt-1 text-xs">{partner.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deletePartnerDraft}
                        editHref={`${ADMIN_PARTNERS_PATH}/${partner.id}`}
                        idName="partnerId"
                        idValue={partner.id}
                        publicHref={`/partners/${partner.slug}`}
                        status={partner.status}
                        updateStatusAction={updatePartnerStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </AdminTableFrame>
        )}

        <AdminPagination
          basePath={ADMIN_PARTNERS_PATH}
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
