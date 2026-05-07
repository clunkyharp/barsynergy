import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { updateVacancy } from '@/app/admin/vacancies/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
  getAdminOptionLabel,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import { vacancyPositionValues } from '@/lib/vacancies/positions';

export const dynamic = 'force-dynamic';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

type AdminVacancyEditPageProps = {
  params: Promise<{ vacancyId: string }>;
};

export default async function AdminVacancyEditPage({ params }: AdminVacancyEditPageProps) {
  await requireAdminSectionAccess('vacancies');
  const { vacancyId } = await params;

  const [vacancy, categories, cities] = await Promise.all([
    prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        coverImage: { select: { originalName: true } },
        _count: { select: { applications: true } }
      }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.VACANCY, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);

  if (!vacancy) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === vacancy.cityId)?.name ?? 'Город не указан';

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
            <>
              {vacancy.status === ContentStatus.PUBLISHED ? (
                <Button href={`/vacancies/${vacancy.slug}`} size="sm" variant="secondary">
                  Публичная страница
                </Button>
              ) : null}
              <Button href="/admin/applications?type=VACANCY_RESPONSE" size="sm" variant="secondary">
                Открыть отклики
              </Button>
            </>
          }
        />

        <AdminCmsSection title="Публикация" description="Заголовок, адрес страницы и статус вакансии.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-title" label="Заголовок">
              <Input id="vacancy-title" name="title" required minLength={2} maxLength={160} defaultValue={vacancy.title} />
            </FormField>
            <FormField htmlFor="vacancy-slug" label="Адрес страницы">
              <Input id="vacancy-slug" name="slug" maxLength={180} defaultValue={vacancy.slug} />
            </FormField>
            <FormField htmlFor="vacancy-status" label="Статус">
              <Select id="vacancy-status" name="status" defaultValue={vacancy.status}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Классификация" description="Рубрика вакансии для каталога и фильтров.">
          <AdminCmsGrid>
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
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контакты для отклика" description="Как кандидату лучше оставить отклик или с кем связаться после просмотра вакансии.">
          <AdminCmsGrid>
            <FormField htmlFor="vacancy-contactMode" label="Контакт" hint="Например: форма на сайте, Telegram HR, телефон управляющего.">
              <Input id="vacancy-contactMode" name="contactMode" maxLength={120} defaultValue={vacancy.contactMode ?? ''} />
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
            <FormField htmlFor="vacancy-summary" label="Краткое описание">
              <Textarea id="vacancy-summary" name="summary" required minLength={10} maxLength={500} defaultValue={vacancy.summary} />
            </FormField>
            <FormField htmlFor="vacancy-description" label="Описание">
              <Textarea id="vacancy-description" name="description" required minLength={20} className="min-h-64" defaultValue={vacancy.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button href={ADMIN_VACANCIES_PATH} type="button" variant="secondary">
            Отмена
          </Button>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
