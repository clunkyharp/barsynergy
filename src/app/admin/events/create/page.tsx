import { CategoryType, ContentStatus } from '@prisma/client';
import { createEvent } from '@/app/admin/events/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PUBLICATION_STATUS_HINT, contentStatusLabels, eventFormatOptions, eventRegistrationModeOptions } from '@/lib/admin/content-utils';
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

      <AdminCmsForm action={createEvent}>
          <HiddenRedirect value={ADMIN_EVENTS_PATH} />
          
          <AdminCmsSection title="Публикация" description="Название, адрес, категория и статус события.">
            <AdminCmsGrid>
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
              <FormField htmlFor="event-status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
                <Select id="event-status" name="status" defaultValue={ContentStatus.DRAFT}>
                  {Object.values(ContentStatus).map((status) => (
                    <option key={status} value={status}>
                      {contentStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Классификация" description="Город, площадка, формат и условия регистрации.">
            <AdminCmsGrid>
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
                <Select id="event-format" name="format" defaultValue="">
                  <option value="">Не указан</option>
                  {eventFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="event-capacity" label="Лимит мест">
                <Input id="event-capacity" name="capacity" min={1} max={100000} type="number" />
              </FormField>
              <FormField htmlFor="event-registrationMode" label="Регистрация">
                <Select id="event-registrationMode" name="registrationMode" defaultValue="">
                  <option value="">Не указана</option>
                  {eventRegistrationModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Расписание" description="Дата начала и окончание, если событие длится несколько часов или дней.">
            <AdminCmsGrid>
              <FormField htmlFor="event-startsAt" label="Начало" hint="Введите дату и время. После сохранения в списках будет формат дд.мм.гггг, чч:мм.">
                <Input id="event-startsAt" name="startsAt" lang="ru-RU" required title="дд.мм.гггг, чч:мм" type="datetime-local" />
              </FormField>
              <FormField htmlFor="event-endsAt" label="Окончание" hint="Заполните, если событие длится несколько часов или дней.">
                <Input id="event-endsAt" name="endsAt" lang="ru-RU" title="дд.мм.гггг, чч:мм" type="datetime-local" />
              </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Медиа" description="Обложка события для карточек и публичной страницы.">
            <AdminCmsGrid>
              <CoverImageField id="event-coverImage" />
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Контент" description="Краткое описание события для публичных списков.">
            <div className="grid gap-4">
                <FormField htmlFor="event-summary" label="Краткое описание">
                  <Textarea id="event-summary" name="summary" required minLength={10} maxLength={500} />
                </FormField>
            </div>
          </AdminCmsSection>

          <AdminCmsActions>
            <Button href={ADMIN_EVENTS_PATH} type="button" variant="secondary">
              Отмена
            </Button>
            <Button type="submit">Создать событие</Button>
          </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
