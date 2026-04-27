import { CategoryType, ContentStatus } from '@prisma/client';
import { createEvent, deleteEventDraft, updateEventStatus } from '@/app/admin/events/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusBadgeVariants, contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export default async function AdminEventsPage() {
  await requireAdminSectionAccess('events');

  const [events, categories, cities] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ startsAt: 'desc' }],
      take: 50,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Admin / Events</p>
        <h1 className="mt-2 text-3xl font-semibold">События</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создание, публикация и архивация событий для публичного календаря.
        </p>
      </header>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новое событие</h2>
        <form action={createEvent} className="mt-5 grid gap-5 lg:grid-cols-2">
          <FormField htmlFor="event-title" label="Название">
            <Input id="event-title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="event-slug" label="Slug">
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
          <p className="text-sm text-[var(--muted)]">Показаны последние 50 записей.</p>
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
                  <tr key={event.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="max-w-[320px] px-4 py-4 align-top">
                      <div className="font-semibold">{event.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{event.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{event.category?.name ?? 'Без категории'}</div>
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
                            <input name="eventId" type="hidden" value={event.id} />
                            <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                              Опубликовать
                            </Button>
                          </form>
                        ) : null}
                        {event.status !== ContentStatus.ARCHIVED ? (
                          <form action={updateEventStatus}>
                            <input name="eventId" type="hidden" value={event.id} />
                            <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                              В архив
                            </Button>
                          </form>
                        ) : null}
                        {event.status !== ContentStatus.PUBLISHED ? (
                          <form action={deleteEventDraft}>
                            <input name="eventId" type="hidden" value={event.id} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="ghost">
                              Удалить
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
