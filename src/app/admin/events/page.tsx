import { CategoryType, type Prisma } from '@/modules/admin/queries';
import { deleteEventDraft, updateEventStatus } from '@/app/admin/events/actions';
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
  getAdminSearchQuery,
  getAdminStringFilter,
  getAdminStatusFilter,
  getAdminTotalPages,
  eventFormatOptions,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

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
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const categoryId = getAdminStringFilter(params, 'categoryId');
  const cityId = getAdminStringFilter(params, 'cityId');
  const format = getAdminStringFilter(params, 'format');
  const where: Prisma.EventWhereInput = {
    status,
    categoryId,
    cityId,
    format,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { locationName: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, events, categories, cities] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ startsAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.EVENT, isActive: true },
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
  const hasActiveFilters = Boolean(q || status || categoryId || cityId || format);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={
          <Button href={`${ADMIN_EVENTS_PATH}/create`}>
            Новое событие
          </Button>
        }
        description="Календарь мероприятий, даты, место проведения и ручная публикация карточек."
        eyebrow="Админка / События"
        title="События"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_EVENTS_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_EVENTS_PATH}
        includeStatus={false}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) },
          { name: 'format', label: 'Формат', allLabel: 'Все форматы', options: [...eventFormatOptions] }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию"
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">События</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        <AdminTableFrame>
          <AdminTable minWidth={1040}>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>Событие</AdminTableHeaderCell>
                <AdminTableHeaderCell>Дата</AdminTableHeaderCell>
                <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {events.length === 0 ? (
                <AdminTableStateRow
                  colSpan={6}
                  description={hasActiveFilters ? 'По текущим фильтрам записей нет.' : 'Добавьте событие с датой, городом и статусом публикации.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'События не найдены' : 'Событий пока нет'}
                />
              ) : (
                events.map((event) => (
                  <AdminTableRow key={event.id}>
                    <AdminTableCell className="max-w-[320px]" label="Событие">
                      <AdminTableClamp className="font-semibold">{event.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{event.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{event.category?.name ?? 'Без категории'}</div>
                      {event.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {event.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Дата">
                      <div>{dateFormatter.format(event.startsAt)}</div>
                      {event.endsAt ? <div className="mt-1 text-xs">до {dateFormatter.format(event.endsAt)}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Город">{event.city?.name ?? <span className="text-[var(--muted)]">Без города</span>}</AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[event.status]}>{contentStatusLabels[event.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div>{dateFormatter.format(event.updatedAt)}</div>
                      {event.updatedBy?.email ? <div className="mt-1 text-xs">{event.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deleteEventDraft}
                        editHref={`${ADMIN_EVENTS_PATH}/${event.id}`}
                        idName="eventId"
                        idValue={event.id}
                        publicHref={`/events/${event.slug}`}
                        status={event.status}
                        updateStatusAction={updateEventStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

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
