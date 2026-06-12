import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { deleteEventDraft, updateEvent, updateEventStatus } from '@/app/admin/events/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
  eventFormatOptions,
  eventRegistrationModeOptions,
  getAdminOptionLabel,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getEventById, getActiveCategories, getActiveCities } from '@/lib/admin/admin-queries';

export const dynamic = 'force-dynamic';

const ADMIN_EVENTS_PATH = '/admin/events';
const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

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
    getEventById(eventId),
    getActiveCategories(CategoryType.EVENT),
    getActiveCities()
  ]);

  if (!event) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === event.cityId)?.name ?? 'Город не указан';
  const currentPath = `${ADMIN_EVENTS_PATH}/${event.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Событие / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">{event.title}</h1>
        </div>
        <Button href={ADMIN_EVENTS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="eventId"
        idValue={event.id}
        publicHref={`/events/${event.slug}`}
        status={event.status}
        updateStatusAction={updateEventStatus}
      />

      <AdminCmsForm action={updateEvent}>
          <HiddenRedirect value={ADMIN_EVENTS_PATH} />
          <input name="eventId" type="hidden" value={event.id} />
          <AdminCmsSummary
            items={[
              { label: 'Статус', value: contentStatusLabels[event.status] },
              { label: 'Начало', value: dateTimeFormatter.format(event.startsAt) },
              { label: 'Город', value: cityName },
              { label: 'Формат', value: getAdminOptionLabel(eventFormatOptions, event.format) }
            ]}
          />
          
          <AdminCmsSection title="Публикация" description="Название и категория события.">
            <AdminCmsGrid>
              <FormField htmlFor="event-title" label="Название">
                <Input id="event-title" name="title" required minLength={2} maxLength={160} defaultValue={event.title} />
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
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsAdvancedSection title="Технические настройки" description="Адрес страницы. Изменение сломает существующие ссылки.">
            <AdminCmsGrid>
              <FormField htmlFor="event-slug" label="Адрес страницы">
                <Input id="event-slug" name="slug" readOnly defaultValue={event.slug} />
              </FormField>
            </AdminCmsGrid>
          </AdminCmsAdvancedSection>

          <AdminCmsSection title="Классификация" description="Город, площадка, формат и условия регистрации.">
            <AdminCmsGrid>
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
              <FormField htmlFor="event-registrationUrl" label="Ссылка для записи или регистрации" hint="Будет использована в кнопке «Записаться» на странице события. Если поле пустое, кнопка ведёт на контакты.">
                <Input id="event-registrationUrl" name="registrationUrl" maxLength={500} placeholder="https://..." type="url" defaultValue={event.registrationUrl ?? ''} />
              </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Расписание" description="Дата начала и окончание, если событие длится несколько часов или дней.">
            <AdminCmsGrid>
              <FormField htmlFor="event-startsAt" label="Начало" hint="Введите дату и время. После сохранения в списках будет формат дд.мм.гггг, чч:мм.">
                <Input
                  id="event-startsAt"
                  lang="ru-RU"
                  name="startsAt"
                  required
                  title="дд.мм.гггг, чч:мм"
                  type="datetime-local"
                  defaultValue={dateTimeLocalValue(event.startsAt)}
                />
              </FormField>
              <FormField htmlFor="event-endsAt" label="Окончание" hint="Заполните, если событие длится несколько часов или дней.">
                <Input
                  id="event-endsAt"
                  lang="ru-RU"
                  name="endsAt"
                  title="дд.мм.гггг, чч:мм"
                  type="datetime-local"
                  defaultValue={dateTimeLocalValue(event.endsAt)}
                />
              </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Медиа" description="Обложка события для карточек и публичной страницы.">
            <AdminCmsGrid>
              <CoverImageField id="event-coverImage" currentName={event.coverImage?.originalName} currentAlt={event.coverImageAlt} />
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Контент" description="Краткое описание события для публичных списков.">
            <div className="grid gap-4">
                <FormField htmlFor="event-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
                  <Textarea id="event-summary" name="summary" required minLength={10} maxLength={500} defaultValue={event.summary} />
                </FormField>
            </div>
          </AdminCmsSection>

          <AdminCmsActions>
            <Button type="submit">Сохранить изменения</Button>
          </AdminCmsActions>
      </AdminCmsForm>

      {event.status === ContentStatus.DRAFT ? (
        <form action={deleteEventDraft}>
          <input name="eventId" type="hidden" value={event.id} />
          <Button type="submit" variant="ghost">
            Удалить черновик
          </Button>
        </form>
      ) : null}
    </div>
  );
}
