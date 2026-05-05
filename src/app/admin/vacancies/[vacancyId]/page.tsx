import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { updateVacancy } from '@/app/admin/vacancies/actions';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
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
        coverImage: { select: { originalName: true } }
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

      <Card className="p-5">
        <form action={updateVacancy} className="grid gap-8">
          <HiddenRedirect value={ADMIN_VACANCIES_PATH} />
          <input type="hidden" name="vacancyId" value={vacancy.id} />
          
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Основная информация</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="vacancy-title" label="Заголовок">
                <Input id="vacancy-title" name="title" required minLength={2} maxLength={160} defaultValue={vacancy.title} />
              </FormField>
              <FormField htmlFor="vacancy-slug" label="Адрес страницы">
                <Input id="vacancy-slug" name="slug" maxLength={180} defaultValue={vacancy.slug} />
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
              <FormField htmlFor="vacancy-status" label="Статус">
                <Select id="vacancy-status" name="status" defaultValue={vacancy.status}>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Детали вакансии</h3>
            <div className="grid gap-5 lg:grid-cols-2">
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
              <FormField htmlFor="vacancy-contactMode" label="Контакт">
                <Input id="vacancy-contactMode" name="contactMode" maxLength={120} defaultValue={vacancy.contactMode ?? ''} />
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Медиа и описание</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <CoverImageField id="vacancy-coverImage" currentName={vacancy.coverImage?.originalName} currentAlt={vacancy.coverImageAlt} />
              <div className="lg:col-span-2">
                <FormField htmlFor="vacancy-summary" label="Краткое описание">
                  <Textarea id="vacancy-summary" name="summary" required minLength={10} maxLength={500} defaultValue={vacancy.summary} />
                </FormField>
              </div>
              <div className="lg:col-span-2">
                <FormField htmlFor="vacancy-description" label="Описание">
                  <Textarea id="vacancy-description" name="description" required minLength={20} className="min-h-64" defaultValue={vacancy.description} />
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
