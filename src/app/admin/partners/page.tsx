import { CategoryType, type Prisma } from '@/modules/admin/queries';
import { deletePartnerDraft, updatePartnerStatus } from '@/app/admin/partners/actions';
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
  getAdminOptionLabel,
  getAdminTotalPages,
  partnerTypeOptions,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { getActiveCategories, getPartnerList } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

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
  const featuredFilter = getAdminStringFilter(params, 'featured');
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

  const [[partners, total], categories] = await Promise.all([
    getPartnerList(where, (page - 1) * ADMIN_CONTENT_PAGE_SIZE, ADMIN_CONTENT_PAGE_SIZE),
    getActiveCategories(CategoryType.PARTNER)
  ]);
  const totalPages = getAdminTotalPages(total);
  const hasActiveFilters = Boolean(q || status || categoryId || partnerType || featuredFilter);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={<Button href="/admin/partners/create">Создать партнёра</Button>}
        description="Карточки партнёрских программ, типы сотрудничества и управление публикацией."
        eyebrow="Админка / Партнёры"
        title="Партнёры"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_PARTNERS_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_PARTNERS_PATH}
        includeStatus={false}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'partnerType', label: 'Тип партнёра', allLabel: 'Все типы', options: [...partnerTypeOptions] },
          {
            name: 'featured',
            label: 'Подборка',
            allLabel: 'Любая подборка',
            options: [
              { value: 'true', label: 'В подборке' },
              { value: 'false', label: 'Не в подборке' }
            ]
          }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию"
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все партнёры</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        <AdminTableFrame>
          <AdminTable minWidth={980}>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeaderCell>Партнёр</AdminTableHeaderCell>
                <AdminTableHeaderCell>Компания и тип</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {partners.length === 0 ? (
                <AdminTableStateRow
                  colSpan={5}
                  description={hasActiveFilters ? 'По текущим фильтрам партнёров нет.' : 'Добавьте партнёра, тип сотрудничества и статус публикации.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Партнёры не найдены' : 'Партнёров пока нет'}
                />
              ) : (
                partners.map((partner) => (
                  <AdminTableRow key={partner.id}>
                    <AdminTableCell className="max-w-[320px]" label="Партнёр">
                      <AdminTableClamp className="font-semibold">{partner.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{partner.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{partner.category?.name ?? 'Без категории'}</div>
                      {partner.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {partner.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Компания и тип">
                      <div>{partner.companyName}</div>
                      {partner.partnerType ? (
                        <div className="mt-1 text-xs">{getAdminOptionLabel(partnerTypeOptions, partner.partnerType)}</div>
                      ) : null}
                      {partner.isFeatured ? <div className="mt-1 text-xs">В подборке</div> : null}
                    </AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[partner.status]}>{contentStatusLabels[partner.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
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
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

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
