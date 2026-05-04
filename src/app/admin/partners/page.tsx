import { ContentStatus } from '@prisma/client';
import { deletePartnerDraft, updatePartnerStatus } from '@/app/admin/partners/actions';
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

  const [total, partners] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.findMany({
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
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
                  <AdminTableHeaderCell>Действия</AdminTableHeaderCell>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {partners.map((partner) => (
                  <AdminTableRow key={partner.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <div className="font-semibold">{partner.title}</div>
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
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button className="min-h-9 px-3 py-1.5 text-xs" variant="secondary" href={`/admin/partners/${partner.id}`}>
                          Изменить
                        </Button>
                        {partner.status !== ContentStatus.PUBLISHED ? (
                          <form action={updatePartnerStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="partnerId" type="hidden" value={partner.id} />
                            <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                              Опубликовать
                            </Button>
                          </form>
                        ) : null}
                        {partner.status !== ContentStatus.ARCHIVED ? (
                          <form action={updatePartnerStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="partnerId" type="hidden" value={partner.id} />
                            <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                              В архив
                            </Button>
                          </form>
                        ) : null}
                        {partner.status !== ContentStatus.PUBLISHED ? (
                          <form action={deletePartnerDraft}>
                            <HiddenRedirect value={currentPath} />
                            <input name="partnerId" type="hidden" value={partner.id} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="ghost">
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
