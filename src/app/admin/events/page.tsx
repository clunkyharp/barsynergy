import { ContentStatus } from '@prisma/client';
import { deleteEventDraft, updateEventStatus } from '@/app/admin/events/actions';
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

const ADMIN_EVENTS_PATH = '/admin/events';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

type AdminEventsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  await requireAdminSectionAccess('events');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_EVENTS_PATH, params);

  const [total, events] = await Promise.all([
    prisma.event.count(),
    prisma.event.findMany({
      orderBy: [{ startsAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    })
  ]);
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_EVENTS_PATH}/create`} variant="secondary">
            Новое событие
          </Button>
        }
        description="Календарь мероприятий, даты, место проведения и ручная публикация карточек."
        eyebrow="Админка / События"
        title="События"
      />

      <AdminActionAlert params={params} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">События</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {events.length === 0 ? (
          <EmptyState title="Событий пока нет" />
        ) : (
          <AdminTableFrame>
            <AdminTable minWidth={1040}>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Событие</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Дата</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Действия</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {events.map((event) => (
                  <AdminTableRow key={event.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <div className="font-semibold">{event.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{event.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{event.category?.name ?? 'Без категории'}</div>
                      {event.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {event.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(event.startsAt)}</div>
                      {event.endsAt ? <div className="mt-1 text-xs">до {dateFormatter.format(event.endsAt)}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">{event.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge variant={contentStatusBadgeVariants[event.status]}>{contentStatusLabels[event.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(event.updatedAt)}</div>
                      {event.updatedBy?.email ? <div className="mt-1 text-xs">{event.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button href={`${ADMIN_EVENTS_PATH}/${event.id}`} className="min-h-9 px-3 py-1.5 text-xs" variant="secondary">
                          Изменить
                        </Button>
                        {event.status !== ContentStatus.PUBLISHED ? (
                          <form action={updateEventStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="eventId" type="hidden" value={event.id} />
                            <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                              Опубликовать
                            </Button>
                          </form>
                        ) : null}
                        {event.status !== ContentStatus.ARCHIVED ? (
                          <form action={updateEventStatus}>
                            <HiddenRedirect value={currentPath} />
                            <input name="eventId" type="hidden" value={event.id} />
                            <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                              В архив
                            </Button>
                          </form>
                        ) : null}
                        {event.status !== ContentStatus.PUBLISHED ? (
                          <form action={deleteEventDraft}>
                            <HiddenRedirect value={currentPath} />
                            <input name="eventId" type="hidden" value={event.id} />
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
          basePath={ADMIN_EVENTS_PATH}
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
