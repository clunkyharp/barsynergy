import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { updateEvent } from '@/app/admin/events/actions';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
  eventFormatOptions,
  eventRegistrationModeOptions,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_EVENTS_PATH = '/admin/events';

function dateTimeLocalValue(value: Date | null) {
  if (!value) {
    return '';
  }

  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

type AdminEventEditPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function AdminEventEditPage({ params }: AdminEventEditPageProps) {
  await requireAdminSectionAccess('events');
  const { eventId } = await params;

  const [event, categories, cities] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      include: { coverImage: { select: { originalName: true } } }
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

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / События / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">Редактировать событие</h1>
        </div>
        <Button href={ADMIN_EVENTS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <Card className="p-5">
        <form action={updateEvent} className="grid gap-8">
          <HiddenRedirect value={ADMIN_EVENTS_PATH} />
          <input name="eventId" type="hidden" value={event.id} />
          
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Основная информация</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="event-title" label="Название">
                <Input id="event-title" name="title" required minLength={2} maxLength={160} defaultValue={event.title} />
              </FormField>
              <FormField htmlFor="event-slug" label="Адрес страницы">
                <Input id="event-slug" name="slug" maxLength={180} defaultValue={event.slug} />
              </FormField>
              <FormField htmlFor="event-categoryId" label="Категория">
                <Select id="event-categoryId" name="categoryId" defaultValue={event.categoryId ?? ''}>
                  <option value="">Без категории</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="event-status" label="Статус">
                <Select id="event-status" name="status" defaultValue={event.status}>
                  {Object.values(ContentStatus).map((status) => (
                    <option key={status} value={status}>
                      {contentStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Локация и условия</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="event-cityId" label="Город">
                <Select id="event-cityId" name="cityId" defaultValue={event.cityId ?? ''}>
                  <option value="">Без города</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="event-locationName" label="Площадка">
                <Input id="event-locationName" name="locationName" maxLength={180} defaultValue={event.locationName ?? ''} />
              </FormField>
              <FormField htmlFor="event-address" label="Адрес">
                <Input id="event-address" name="address" maxLength={240} defaultValue={event.address ?? ''} />
              </FormField>
              <FormField htmlFor="event-format" label="Формат">
                <Select id="event-format" name="format" defaultValue={event.format ?? ''}>
                  <option value="">Не указан</option>
                  {withCurrentValueOption([...eventFormatOptions], event.format).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="event-capacity" label="Лимит мест">
                <Input id="event-capacity" name="capacity" min={1} max={100000} type="number" defaultValue={event.capacity ?? ''} />
              </FormField>
              <FormField htmlFor="event-registrationMode" label="Регистрация">
                <Select id="event-registrationMode" name="registrationMode" defaultValue={event.registrationMode ?? ''}>
                  <option value="">Не указана</option>
                  {withCurrentValueOption([...eventRegistrationModeOptions], event.registrationMode).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Время проведения</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="event-startsAt" label="Начало" hint="Дата отображается в русском формате: дд.мм.гггг, чч:мм.">
                <Input
                  id="event-startsAt"
                  name="startsAt"
                  required
                  type="datetime-local"
                  defaultValue={dateTimeLocalValue(event.startsAt)}
                />
              </FormField>
              <FormField htmlFor="event-endsAt" label="Окончание" hint="Заполните, если событие длится несколько часов или дней.">
                <Input
                  id="event-endsAt"
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={dateTimeLocalValue(event.endsAt)}
                />
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Медиа и описание</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <CoverImageField id="event-coverImage" currentName={event.coverImage?.originalName} currentAlt={event.coverImageAlt} />
              <div className="lg:col-span-2">
                <FormField htmlFor="event-summary" label="Краткое описание">
                  <Textarea id="event-summary" name="summary" required minLength={10} maxLength={500} defaultValue={event.summary} />
                </FormField>
              </div>
            </div>
          </section>

          <div>
            <Button type="submit">Сохранить изменения</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
