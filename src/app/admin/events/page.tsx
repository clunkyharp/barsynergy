import { Fragment } from 'react';
import { CategoryType, ContentStatus } from '@prisma/client';
import { createEvent, deleteEventDraft, updateEvent, updateEventStatus } from '@/app/admin/events/actions';
import {
  AdminActionAlert,
  AdminPagination,
  CoverImageField,
  HiddenRedirect
} from '@/components/admin/content-admin-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

const ADMIN_EVENTS_PATH = '/admin/events';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

function dateTimeLocalValue(value: Date | null) {
  if (!value) {
    return '';
  }

  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

type AdminEventsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  await requireAdminSectionAccess('events');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_EVENTS_PATH, params);

  const [total, events, categories, cities] = await Promise.all([
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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / События</p>
        <h1 className="mt-2 text-3xl font-semibold">События</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создание, публикация и архивация событий для публичного календаря.
        </p>
      </header>

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новое событие</h2>
        <form action={createEvent} className="mt-5 grid gap-5 lg:grid-cols-2">
          <HiddenRedirect value={currentPath} />
          <FormField htmlFor="event-title" label="Название">
            <Input id="event-title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="event-slug" label="Адрес страницы">
            <Input id="event-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из названия" />
          </FormField>
          <FormField htmlFor="event-startsAt" label="Начало">
            <Input id="event-startsAt" name="startsAt" required type="datetime-local" />
          </FormField>
          <FormField htmlFor="event-endsAt" label="Окончание">
            <Input id="event-endsAt" name="endsAt" type="datetime-local" />
          </FormField>
          <FormField htmlFor="event-categoryId" label="Категория">
            <Select id="event-categoryId" name="categoryId" defaultValue="">
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="event-cityId" label="Город">
            <Select id="event-cityId" name="cityId" defaultValue="">
              <option value="">Без города</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="event-locationName" label="Площадка">
            <Input id="event-locationName" name="locationName" maxLength={180} />
          </FormField>
          <FormField htmlFor="event-address" label="Адрес">
            <Input id="event-address" name="address" maxLength={240} />
          </FormField>
          <FormField htmlFor="event-format" label="Формат">
            <Input id="event-format" name="format" maxLength={80} placeholder="offline, online, hybrid" />
          </FormField>
          <FormField htmlFor="event-capacity" label="Лимит мест">
            <Input id="event-capacity" name="capacity" min={1} max={100000} type="number" />
          </FormField>
          <FormField htmlFor="event-registrationMode" label="Регистрация">
            <Input id="event-registrationMode" name="registrationMode" maxLength={120} />
          </FormField>
          <CoverImageField id="event-coverImage" />
          <FormField htmlFor="event-status" label="Статус">
            <Select id="event-status" name="status" defaultValue={ContentStatus.DRAFT}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="event-summary" label="Краткое описание">
              <Textarea id="event-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Создать событие</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">События</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="Событий пока нет"
            description="Создайте первое событие, чтобы проверить рабочий процесс публикации."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Событие</th>
                  <th className="px-4 py-3 font-semibold">Дата</th>
                  <th className="px-4 py-3 font-semibold">Город</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <Fragment key={event.id}>
                    <tr className="border-b border-[var(--line)]">
                      <td className="max-w-[320px] px-4 py-4 align-top">
                        <div className="font-semibold">{event.title}</div>
                        <div className="mt-1 truncate text-xs text-[var(--muted)]">/{event.slug}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{event.category?.name ?? 'Без категории'}</div>
                        {event.coverImage?.originalName ? (
                          <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {event.coverImage.originalName}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{dateFormatter.format(event.startsAt)}</div>
                        {event.endsAt ? <div className="mt-1 text-xs">до {dateFormatter.format(event.endsAt)}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">{event.city?.name ?? '-'}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={contentStatusBadgeVariants[event.status]}>{contentStatusLabels[event.status]}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{dateFormatter.format(event.updatedAt)}</div>
                        {event.updatedBy?.email ? <div className="mt-1 text-xs">{event.updatedBy.email}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
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
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--line)] last:border-0">
                      <td className="bg-[var(--surface-muted)] px-4 py-4" colSpan={6}>
                        <details>
                          <summary className="cursor-pointer text-sm font-semibold">Редактировать запись</summary>
                          <form action={updateEvent} className="mt-5 grid gap-5 lg:grid-cols-2">
                            <HiddenRedirect value={currentPath} />
                            <input name="eventId" type="hidden" value={event.id} />
                            <FormField htmlFor={`event-title-${event.id}`} label="Название">
                              <Input id={`event-title-${event.id}`} name="title" required minLength={2} maxLength={160} defaultValue={event.title} />
                            </FormField>
                            <FormField htmlFor={`event-slug-${event.id}`} label="Адрес страницы">
                              <Input id={`event-slug-${event.id}`} name="slug" maxLength={180} defaultValue={event.slug} />
                            </FormField>
                            <FormField htmlFor={`event-startsAt-${event.id}`} label="Начало">
                              <Input
                                id={`event-startsAt-${event.id}`}
                                name="startsAt"
                                required
                                type="datetime-local"
                                defaultValue={dateTimeLocalValue(event.startsAt)}
                              />
                            </FormField>
                            <FormField htmlFor={`event-endsAt-${event.id}`} label="Окончание">
                              <Input
                                id={`event-endsAt-${event.id}`}
                                name="endsAt"
                                type="datetime-local"
                                defaultValue={dateTimeLocalValue(event.endsAt)}
                              />
                            </FormField>
                            <FormField htmlFor={`event-category-${event.id}`} label="Категория">
                              <Select id={`event-category-${event.id}`} name="categoryId" defaultValue={event.categoryId ?? ''}>
                                <option value="">Без категории</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`event-city-${event.id}`} label="Город">
                              <Select id={`event-city-${event.id}`} name="cityId" defaultValue={event.cityId ?? ''}>
                                <option value="">Без города</option>
                                {cities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`event-location-${event.id}`} label="Площадка">
                              <Input id={`event-location-${event.id}`} name="locationName" maxLength={180} defaultValue={event.locationName ?? ''} />
                            </FormField>
                            <FormField htmlFor={`event-address-${event.id}`} label="Адрес">
                              <Input id={`event-address-${event.id}`} name="address" maxLength={240} defaultValue={event.address ?? ''} />
                            </FormField>
                            <FormField htmlFor={`event-format-${event.id}`} label="Формат">
                              <Input id={`event-format-${event.id}`} name="format" maxLength={80} defaultValue={event.format ?? ''} />
                            </FormField>
                            <FormField htmlFor={`event-capacity-${event.id}`} label="Лимит мест">
                              <Input
                                id={`event-capacity-${event.id}`}
                                name="capacity"
                                min={1}
                                max={100000}
                                type="number"
                                defaultValue={event.capacity ?? ''}
                              />
                            </FormField>
                            <FormField htmlFor={`event-registration-${event.id}`} label="Регистрация">
                              <Input
                                id={`event-registration-${event.id}`}
                                name="registrationMode"
                                maxLength={120}
                                defaultValue={event.registrationMode ?? ''}
                              />
                            </FormField>
                            <CoverImageField id={`event-cover-${event.id}`} currentName={event.coverImage?.originalName} />
                            <FormField htmlFor={`event-status-${event.id}`} label="Статус">
                              <Select id={`event-status-${event.id}`} name="status" defaultValue={event.status}>
                                {Object.values(ContentStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {contentStatusLabels[status]}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`event-summary-${event.id}`} label="Краткое описание">
                                <Textarea
                                  id={`event-summary-${event.id}`}
                                  name="summary"
                                  required
                                  minLength={10}
                                  maxLength={500}
                                  defaultValue={event.summary}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <Button type="submit">Сохранить событие</Button>
                            </div>
                          </form>
                        </details>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
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
