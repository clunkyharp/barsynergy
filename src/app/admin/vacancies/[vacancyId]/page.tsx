import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { deleteVacancyDraft, updateVacancy, updateVacancyStatus } from '@/app/admin/vacancies/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
  getAdminOptionLabel,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getVacancyById, getActiveCategories, getActiveCities, getActiveBusinessAccounts } from '@/lib/admin/admin-queries';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

export const dynamic = 'force-dynamic';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

type AdminVacancyEditPageProps = {
  params: Promise<{ vacancyId: string }>;
};

export default async function AdminVacancyEditPage({ params }: AdminVacancyEditPageProps) {
  await requireAdminSectionAccess('vacancies');
  const { vacancyId } = await params;

  const [vacancy, categories, cities, businessAccounts] = await Promise.all([
    getVacancyById(vacancyId),
    getActiveCategories(CategoryType.VACANCY),
    getActiveCities(),
    getActiveBusinessAccounts()
  ]);

  if (!vacancy) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === vacancy.cityId)?.name ?? 'Город не указан';
  const currentPath = `${ADMIN_VACANCIES_PATH}/${vacancy.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Вакансии / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">{vacancy.title}</h1>
        </div>
        <Button href={ADMIN_VACANCIES_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="vacancyId"
        idValue={vacancy.id}
        publicHref={`/vacancies/${vacancy.slug}`}
        status={vacancy.status}
        updateStatusAction={updateVacancyStatus}
      />

      <AdminCmsForm action={updateVacancy}>
        <HiddenRedirect value={ADMIN_VACANCIES_PATH} />
        <input type="hidden" name="vacancyId" value={vacancy.id} />
        <AdminCmsSummary
          items={[
            { label: 'Статус', value: contentStatusLabels[vacancy.status] },
            { label: 'Компания', value: vacancy.companyName },
            { label: 'Город', value: cityName },
            { label: 'Позиция', value: vacancy.position },
            { label: 'Отклики', value: vacancy._count.applications }
          ]}
          actions={
            <Button href="/admin/applications?type=VACANCY_RESPONSE" size="sm" variant="secondary">
              Открыть отклики
            </Button>
          }
        />

        <AdminCmsSection title="Публикация" description="Название вакансии, категория и классификация.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-title" label="Название вакансии">
              <Input id="vacancy-title" name="title" required minLength={2} maxLength={160} defaultValue={vacancy.title} />
            </FormField>
            <FormField htmlFor="vacancy-categoryId" label="Категория">
              <Select id="vacancy-categoryId" name="categoryId" defaultValue={vacancy.categoryId ?? ''}>
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
            <FormField htmlFor="vacancy-slug" label="Адрес страницы">
              <Input id="vacancy-slug" name="slug" readOnly defaultValue={vacancy.slug} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsAdvancedSection>

        <AdminCmsSection title="Условия работы" description="Компания, позиция, город, формат занятости и требования к опыту.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-companyName" label="Компания">
              <Input id="vacancy-companyName" name="companyName" required minLength={2} maxLength={180} defaultValue={vacancy.companyName} />
            </FormField>
            <FormField htmlFor="vacancy-position" label="Позиция">
              <Select id="vacancy-position" name="position" required defaultValue={vacancy.position}>
                <option value="">Выберите позицию</option>
                {vacancyPositionValues.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-cityId" label="Город">
              <Select id="vacancy-cityId" name="cityId" defaultValue={vacancy.cityId ?? ''}>
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-employmentType" label="Тип занятости">
              <Select id="vacancy-employmentType" name="employmentType" defaultValue={vacancy.employmentType ?? ''}>
                <option value="">Не указан</option>
                {withCurrentValueOption([...vacancyEmploymentTypeOptions], vacancy.employmentType).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-salaryLabel" label="Оплата">
              <Input id="vacancy-salaryLabel" name="salaryLabel" maxLength={120} defaultValue={vacancy.salaryLabel ?? ''} />
            </FormField>
            <FormField htmlFor="vacancy-experienceLabel" label="Опыт">
              <Select id="vacancy-experienceLabel" name="experienceLabel" defaultValue={vacancy.experienceLabel ?? ''}>
                <option value="">Не указан</option>
                {withCurrentValueOption([...vacancyExperienceOptions], vacancy.experienceLabel).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-businessAccountId" label="Бизнес-аккаунт">
              <Select id="vacancy-businessAccountId" name="businessAccountId" defaultValue={vacancy.businessAccountId ?? ''}>
                <option value="">Без привязки</option>
                {businessAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.companyName}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контакты для отклика" description="Как кандидату лучше оставить отклик или с кем связаться после просмотра вакансии.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-contactMode" label="Контактное лицо" hint="Только имя или должность. Telegram/телефон — в полях ниже.">
              <Input id="vacancy-contactMode" name="contactMode" maxLength={120} defaultValue={vacancy.contactMode ?? ''} />
            </FormField>
            <FormField htmlFor="vacancy-contactTelegram" label="Telegram для связи">
              <Input id="vacancy-contactTelegram" name="contactTelegram" maxLength={120} defaultValue={vacancy.contactTelegram ?? ''} placeholder="@username или t.me/..." />
            </FormField>
            <FormField htmlFor="vacancy-contactPhone" label="Телефон">
              <Input id="vacancy-contactPhone" name="contactPhone" maxLength={30} defaultValue={vacancy.contactPhone ?? ''} placeholder="+7 ..." type="tel" />
            </FormField>
            <FormField htmlFor="vacancy-contactEmail" label="Email">
              <Input id="vacancy-contactEmail" name="contactEmail" maxLength={254} defaultValue={vacancy.contactEmail ?? ''} placeholder="hr@example.com" type="email" />
            </FormField>
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--muted)]">
              Формат: {getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType)} · опыт: {getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel)}
            </div>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка для карточки вакансии.">
          <AdminCmsGrid>
            <CoverImageField id="vacancy-coverImage" currentName={vacancy.coverImage?.originalName} currentAlt={vacancy.coverImageAlt} />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст вакансии.">
          <div className="grid gap-4">
            <FormField htmlFor="vacancy-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="vacancy-summary" name="summary" required minLength={10} maxLength={500} defaultValue={vacancy.summary} />
            </FormField>
            <FormField htmlFor="vacancy-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="vacancy-description" name="description" required minLength={20} maxLength={100_000} defaultValue={vacancy.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>

      {vacancy.status === ContentStatus.DRAFT ? (
        <form action={deleteVacancyDraft}>
          <input name="vacancyId" type="hidden" value={vacancy.id} />
          <ConfirmSubmitButton
            confirmActionLabel="Удалить"
            confirmText="Это действие нельзя отменить."
            confirmTitle="Удалить черновик?"
            type="submit"
            variant="ghost"
          >
            Удалить черновик
          </ConfirmSubmitButton>
        </form>
      ) : null}
    </div>
  );
}
