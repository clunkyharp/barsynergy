import { CategoryType } from '@/modules/admin/queries';
import { createVacancy } from '@/app/admin/vacancies/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { vacancyEmploymentTypeOptions, vacancyExperienceOptions } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getActiveCategories, getActiveCities, getActiveBusinessAccounts } from '@/lib/admin/admin-queries';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

export const dynamic = 'force-dynamic';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

export default async function AdminVacanciesCreatePage() {
  await requireAdminSectionAccess('vacancies');

  const [categories, cities, businessAccounts] = await Promise.all([
    getActiveCategories(CategoryType.VACANCY),
    getActiveCities(),
    getActiveBusinessAccounts()
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Админка / Вакансии / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новая вакансия</h1>
        </div>
        <Button href={ADMIN_VACANCIES_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminCmsForm action={createVacancy}>
        <HiddenRedirect value={ADMIN_VACANCIES_PATH} />

        <AdminCmsSection title="Публикация" description="Название вакансии и категория.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-title" label="Название вакансии">
              <Input id="vacancy-title" name="title" required minLength={2} maxLength={160} />
            </FormField>
            <FormField htmlFor="vacancy-categoryId" label="Категория">
              <Select id="vacancy-categoryId" name="categoryId" defaultValue="">
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

        <AdminCmsSection title="Условия работы" description="Компания, позиция, город, формат занятости и требования к опыту.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-companyName" label="Компания">
              <Input id="vacancy-companyName" name="companyName" required minLength={2} maxLength={180} />
            </FormField>
            <FormField htmlFor="vacancy-position" label="Позиция">
              <Select id="vacancy-position" name="position" required defaultValue="">
                <option value="">Выберите позицию</option>
                {vacancyPositionValues.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-cityId" label="Город">
              <Select id="vacancy-cityId" name="cityId" defaultValue="">
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-employmentType" label="Тип занятости">
              <Select id="vacancy-employmentType" name="employmentType" defaultValue="">
                <option value="">Не указан</option>
                {vacancyEmploymentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-salaryLabel" label="Оплата">
              <Input id="vacancy-salaryLabel" name="salaryLabel" maxLength={120} />
            </FormField>
            <FormField htmlFor="vacancy-experienceLabel" label="Опыт">
              <Select id="vacancy-experienceLabel" name="experienceLabel" defaultValue="">
                <option value="">Не указан</option>
                {vacancyExperienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="vacancy-businessAccountId" label="Бизнес-аккаунт">
              <Select id="vacancy-businessAccountId" name="businessAccountId" defaultValue="">
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
            <FormField htmlFor="vacancy-contactMode" label="Контакт" hint="Например: форма на сайте, Telegram HR, телефон управляющего.">
              <Input id="vacancy-contactMode" name="contactMode" maxLength={120} />
            </FormField>
            <FormField htmlFor="vacancy-contactTelegram" label="Telegram для связи">
              <Input id="vacancy-contactTelegram" name="contactTelegram" maxLength={120} placeholder="@username или t.me/..." />
            </FormField>
            <FormField htmlFor="vacancy-contactPhone" label="Телефон">
              <Input id="vacancy-contactPhone" name="contactPhone" maxLength={30} placeholder="+7 ..." type="tel" />
            </FormField>
            <FormField htmlFor="vacancy-contactEmail" label="Email">
              <Input id="vacancy-contactEmail" name="contactEmail" maxLength={254} placeholder="hr@example.com" type="email" />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка для карточки вакансии.">
          <AdminCmsGrid>
            <CoverImageField id="vacancy-coverImage" />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст вакансии.">
          <div className="grid gap-4">
            <FormField htmlFor="vacancy-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="vacancy-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
            <FormField htmlFor="vacancy-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="vacancy-description" name="description" required minLength={20} maxLength={100_000} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Создать вакансию</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
