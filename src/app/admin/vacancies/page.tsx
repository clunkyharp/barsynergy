import { Fragment } from 'react';
import { CategoryType, ContentStatus } from '@prisma/client';
import { createVacancy, deleteVacancyDraft, updateVacancy, updateVacancyStatus } from '@/app/admin/vacancies/actions';
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
import { isVacancyPosition, vacancyPositionValues } from '@/lib/vacancies/positions';

const ADMIN_VACANCIES_PATH = '/admin/vacancies';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminVacanciesPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminVacanciesPage({ searchParams }: AdminVacanciesPageProps) {
  await requireAdminSectionAccess('vacancies');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_VACANCIES_PATH, params);

  const [total, vacancies, categories, cities] = await Promise.all([
    prisma.vacancy.count(),
    prisma.vacancy.findMany({
      orderBy: [{ createdAt: 'desc' }],
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
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Вакансии</p>
        <h1 className="mt-2 text-3xl font-semibold">Вакансии</h1>
      </header>

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новая вакансия</h2>
        <form action={createVacancy} className="mt-5 grid gap-5 lg:grid-cols-2">
          <HiddenRedirect value={currentPath} />
          <FormField htmlFor="vacancy-title" label="Заголовок">
            <Input id="vacancy-title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="vacancy-slug" label="Адрес страницы">
            <Input id="vacancy-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
          </FormField>
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
            <Input id="vacancy-employmentType" name="employmentType" maxLength={100} />
          </FormField>
          <FormField htmlFor="vacancy-salaryLabel" label="Оплата">
            <Input id="vacancy-salaryLabel" name="salaryLabel" maxLength={120} />
          </FormField>
          <FormField htmlFor="vacancy-experienceLabel" label="Опыт">
            <Input id="vacancy-experienceLabel" name="experienceLabel" maxLength={120} />
          </FormField>
          <FormField htmlFor="vacancy-contactMode" label="Контакт">
            <Input id="vacancy-contactMode" name="contactMode" maxLength={120} />
          </FormField>
          <CoverImageField id="vacancy-coverImage" />
          <div className="lg:col-span-2">
            <FormField htmlFor="vacancy-status" label="Статус">
              <Select id="vacancy-status" name="status" defaultValue={ContentStatus.DRAFT}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="vacancy-summary" label="Краткое описание">
              <Textarea id="vacancy-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="vacancy-description" label="Описание">
              <Textarea id="vacancy-description" name="description" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Создать вакансию</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Вакансии</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {vacancies.length === 0 ? (
          <EmptyState title="Вакансий пока нет" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Вакансия</th>
                  <th className="px-4 py-3 font-semibold">Компания</th>
                  <th className="px-4 py-3 font-semibold">Город</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {vacancies.map((vacancy) => (
                  <Fragment key={vacancy.id}>
                    <tr className="border-b border-[var(--line)]">
                      <td className="max-w-[320px] px-4 py-4 align-top">
                        <div className="font-semibold">{vacancy.title}</div>
                        <div className="mt-1 truncate text-xs text-[var(--muted)]">/{vacancy.slug}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{vacancy.category?.name ?? 'Без категории'}</div>
                        {vacancy.coverImage?.originalName ? (
                          <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {vacancy.coverImage.originalName}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{vacancy.companyName}</div>
                        <div className="mt-1 text-xs">{vacancy.position}</div>
                        {vacancy.salaryLabel ? <div className="mt-1 text-xs">{vacancy.salaryLabel}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">{vacancy.city?.name ?? '-'}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={contentStatusBadgeVariants[vacancy.status]}>{contentStatusLabels[vacancy.status]}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{dateFormatter.format(vacancy.updatedAt)}</div>
                        {vacancy.updatedBy?.email ? <div className="mt-1 text-xs">{vacancy.updatedBy.email}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {vacancy.status !== ContentStatus.PUBLISHED ? (
                            <form action={updateVacancyStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="vacancyId" type="hidden" value={vacancy.id} />
                              <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                                Опубликовать
                              </Button>
                            </form>
                          ) : null}
                          {vacancy.status !== ContentStatus.ARCHIVED ? (
                            <form action={updateVacancyStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="vacancyId" type="hidden" value={vacancy.id} />
                              <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                                В архив
                              </Button>
                            </form>
                          ) : null}
                          {vacancy.status !== ContentStatus.PUBLISHED ? (
                            <form action={deleteVacancyDraft}>
                              <HiddenRedirect value={currentPath} />
                              <input name="vacancyId" type="hidden" value={vacancy.id} />
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
                          <form action={updateVacancy} className="mt-5 grid gap-5 lg:grid-cols-2">
                            <HiddenRedirect value={currentPath} />
                            <input name="vacancyId" type="hidden" value={vacancy.id} />
                            <FormField htmlFor={`vacancy-title-${vacancy.id}`} label="Заголовок">
                              <Input
                                id={`vacancy-title-${vacancy.id}`}
                                name="title"
                                required
                                minLength={2}
                                maxLength={160}
                                defaultValue={vacancy.title}
                              />
                            </FormField>
                            <FormField htmlFor={`vacancy-slug-${vacancy.id}`} label="Адрес страницы">
                              <Input id={`vacancy-slug-${vacancy.id}`} name="slug" maxLength={180} defaultValue={vacancy.slug} />
                            </FormField>
                            <FormField htmlFor={`vacancy-company-${vacancy.id}`} label="Компания">
                              <Input
                                id={`vacancy-company-${vacancy.id}`}
                                name="companyName"
                                required
                                minLength={2}
                                maxLength={180}
                                defaultValue={vacancy.companyName}
                              />
                            </FormField>
                            <FormField htmlFor={`vacancy-position-${vacancy.id}`} label="Позиция">
                              <Select
                                id={`vacancy-position-${vacancy.id}`}
                                name="position"
                                required
                                defaultValue={isVacancyPosition(vacancy.position) ? vacancy.position : ''}
                              >
                                <option value="">Выберите позицию</option>
                                {vacancyPositionValues.map((position) => (
                                  <option key={position} value={position}>
                                    {position}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`vacancy-category-${vacancy.id}`} label="Категория">
                              <Select id={`vacancy-category-${vacancy.id}`} name="categoryId" defaultValue={vacancy.categoryId ?? ''}>
                                <option value="">Без категории</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`vacancy-city-${vacancy.id}`} label="Город">
                              <Select id={`vacancy-city-${vacancy.id}`} name="cityId" defaultValue={vacancy.cityId ?? ''}>
                                <option value="">Без города</option>
                                {cities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`vacancy-employment-${vacancy.id}`} label="Тип занятости">
                              <Input
                                id={`vacancy-employment-${vacancy.id}`}
                                name="employmentType"
                                maxLength={100}
                                defaultValue={vacancy.employmentType ?? ''}
                              />
                            </FormField>
                            <FormField htmlFor={`vacancy-salary-${vacancy.id}`} label="Оплата">
                              <Input id={`vacancy-salary-${vacancy.id}`} name="salaryLabel" maxLength={120} defaultValue={vacancy.salaryLabel ?? ''} />
                            </FormField>
                            <FormField htmlFor={`vacancy-experience-${vacancy.id}`} label="Опыт">
                              <Input
                                id={`vacancy-experience-${vacancy.id}`}
                                name="experienceLabel"
                                maxLength={120}
                                defaultValue={vacancy.experienceLabel ?? ''}
                              />
                            </FormField>
                            <FormField htmlFor={`vacancy-contact-${vacancy.id}`} label="Контакт">
                              <Input id={`vacancy-contact-${vacancy.id}`} name="contactMode" maxLength={120} defaultValue={vacancy.contactMode ?? ''} />
                            </FormField>
                            <CoverImageField id={`vacancy-cover-${vacancy.id}`} currentName={vacancy.coverImage?.originalName} />
                            <FormField htmlFor={`vacancy-status-${vacancy.id}`} label="Статус">
                              <Select id={`vacancy-status-${vacancy.id}`} name="status" defaultValue={vacancy.status}>
                                {Object.values(ContentStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {contentStatusLabels[status]}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`vacancy-summary-${vacancy.id}`} label="Краткое описание">
                                <Textarea
                                  id={`vacancy-summary-${vacancy.id}`}
                                  name="summary"
                                  required
                                  minLength={10}
                                  maxLength={500}
                                  defaultValue={vacancy.summary}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`vacancy-description-${vacancy.id}`} label="Описание">
                                <Textarea
                                  id={`vacancy-description-${vacancy.id}`}
                                  name="description"
                                  required
                                  minLength={20}
                                  className="min-h-64"
                                  defaultValue={vacancy.description}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <Button type="submit">Сохранить вакансию</Button>
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
          basePath={ADMIN_VACANCIES_PATH}
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
