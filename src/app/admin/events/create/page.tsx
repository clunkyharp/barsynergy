import { CategoryType, ContentStatus } from '@prisma/client';
import { createEvent } from '@/app/admin/events/actions';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_EVENTS_PATH = '/admin/events';

export default async function AdminEventsCreatePage() {
  await requireAdminSectionAccess('events');

  const [categories, cities] = await Promise.all([
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
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / События / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новое событие</h1>
        </div>
        <Button href={ADMIN_EVENTS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <Card className="p-5">
        <form action={createEvent} className="grid gap-8">
          <HiddenRedirect value={ADMIN_EVENTS_PATH} />
          
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Основная информация</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="event-title" label="Название">
                <Input id="event-title" name="title" required minLength={2} maxLength={160} />
              </FormField>
              <FormField htmlFor="event-slug" label="Адрес страницы">
                <Input id="event-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из названия" />
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
              <FormField htmlFor="event-status" label="Статус">
                <Select id="event-status" name="status" defaultValue={ContentStatus.DRAFT}>
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
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Время проведения</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="event-startsAt" label="Начало">
                <Input id="event-startsAt" name="startsAt" required type="datetime-local" />
              </FormField>
              <FormField htmlFor="event-endsAt" label="Окончание">
                <Input id="event-endsAt" name="endsAt" type="datetime-local" />
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Медиа и описание</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <CoverImageField id="event-coverImage" />
              <div className="lg:col-span-2">
                <FormField htmlFor="event-summary" label="Краткое описание">
                  <Textarea id="event-summary" name="summary" required minLength={10} maxLength={500} />
                </FormField>
              </div>
            </div>
          </section>

          <div>
            <Button type="submit">Создать событие</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
