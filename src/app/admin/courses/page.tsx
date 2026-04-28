import { Fragment } from 'react';
import { CategoryType, ContentStatus } from '@prisma/client';
import { createCourse, deleteCourseDraft, updateCourse, updateCourseStatus } from '@/app/admin/courses/actions';
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

const ADMIN_COURSES_PATH = '/admin/courses';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminCoursesPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  await requireAdminSectionAccess('courses');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_COURSES_PATH, params);

  const [total, courses, categories, cities] = await Promise.all([
    prisma.course.count(),
    prisma.course.findMany({
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
      where: { type: CategoryType.COURSE, isActive: true },
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Курсы</p>
        <h1 className="mt-2 text-3xl font-semibold">Курсы</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создание, публикация и архивация образовательных программ.
        </p>
      </header>

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новый курс</h2>
        <form action={createCourse} className="mt-5 grid gap-5 lg:grid-cols-2">
          <HiddenRedirect value={currentPath} />
          <FormField htmlFor="course-title" label="Название">
            <Input id="course-title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="course-slug" label="Адрес страницы">
            <Input id="course-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из названия" />
          </FormField>
          <FormField htmlFor="course-categoryId" label="Категория">
            <Select id="course-categoryId" name="categoryId" defaultValue="">
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="course-cityId" label="Город">
            <Select id="course-cityId" name="cityId" defaultValue="">
              <option value="">Без города</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="course-format" label="Формат">
            <Input id="course-format" name="format" maxLength={80} placeholder="offline, online, hybrid" />
          </FormField>
          <FormField htmlFor="course-durationLabel" label="Длительность">
            <Input id="course-durationLabel" name="durationLabel" maxLength={120} />
          </FormField>
          <FormField htmlFor="course-level" label="Уровень">
            <Input id="course-level" name="level" maxLength={80} />
          </FormField>
          <FormField htmlFor="course-priceLabel" label="Стоимость">
            <Input id="course-priceLabel" name="priceLabel" maxLength={120} />
          </FormField>
          <FormField htmlFor="course-instructorName" label="Преподаватель">
            <Input id="course-instructorName" name="instructorName" maxLength={160} />
          </FormField>
          <CoverImageField id="course-coverImage" />
          <FormField htmlFor="course-status" label="Статус">
            <Select id="course-status" name="status" defaultValue={ContentStatus.DRAFT}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="course-summary" label="Краткое описание">
              <Textarea id="course-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="course-program" label="Программа">
              <Textarea id="course-program" name="program" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Создать курс</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Курсы</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            title="Курсов пока нет"
            description="Создайте первый курс, чтобы проверить рабочий процесс публикации."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Курс</th>
                  <th className="px-4 py-3 font-semibold">Параметры</th>
                  <th className="px-4 py-3 font-semibold">Город</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <Fragment key={course.id}>
                    <tr className="border-b border-[var(--line)]">
                      <td className="max-w-[320px] px-4 py-4 align-top">
                        <div className="font-semibold">{course.title}</div>
                        <div className="mt-1 truncate text-xs text-[var(--muted)]">/{course.slug}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{course.category?.name ?? 'Без категории'}</div>
                        {course.coverImage?.originalName ? (
                          <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {course.coverImage.originalName}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{course.format ?? 'Формат не указан'}</div>
                        {course.durationLabel ? <div className="mt-1 text-xs">{course.durationLabel}</div> : null}
                        {course.level ? <div className="mt-1 text-xs">{course.level}</div> : null}
                        {course.priceLabel ? <div className="mt-1 text-xs">{course.priceLabel}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">{course.city?.name ?? '-'}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={contentStatusBadgeVariants[course.status]}>{contentStatusLabels[course.status]}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{dateFormatter.format(course.updatedAt)}</div>
                        {course.updatedBy?.email ? <div className="mt-1 text-xs">{course.updatedBy.email}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {course.status !== ContentStatus.PUBLISHED ? (
                            <form action={updateCourseStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="courseId" type="hidden" value={course.id} />
                              <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                                Опубликовать
                              </Button>
                            </form>
                          ) : null}
                          {course.status !== ContentStatus.ARCHIVED ? (
                            <form action={updateCourseStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="courseId" type="hidden" value={course.id} />
                              <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                                В архив
                              </Button>
                            </form>
                          ) : null}
                          {course.status !== ContentStatus.PUBLISHED ? (
                            <form action={deleteCourseDraft}>
                              <HiddenRedirect value={currentPath} />
                              <input name="courseId" type="hidden" value={course.id} />
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
                          <form action={updateCourse} className="mt-5 grid gap-5 lg:grid-cols-2">
                            <HiddenRedirect value={currentPath} />
                            <input name="courseId" type="hidden" value={course.id} />
                            <FormField htmlFor={`course-title-${course.id}`} label="Название">
                              <Input id={`course-title-${course.id}`} name="title" required minLength={2} maxLength={160} defaultValue={course.title} />
                            </FormField>
                            <FormField htmlFor={`course-slug-${course.id}`} label="Адрес страницы">
                              <Input id={`course-slug-${course.id}`} name="slug" maxLength={180} defaultValue={course.slug} />
                            </FormField>
                            <FormField htmlFor={`course-category-${course.id}`} label="Категория">
                              <Select id={`course-category-${course.id}`} name="categoryId" defaultValue={course.categoryId ?? ''}>
                                <option value="">Без категории</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`course-city-${course.id}`} label="Город">
                              <Select id={`course-city-${course.id}`} name="cityId" defaultValue={course.cityId ?? ''}>
                                <option value="">Без города</option>
                                {cities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`course-format-${course.id}`} label="Формат">
                              <Input id={`course-format-${course.id}`} name="format" maxLength={80} defaultValue={course.format ?? ''} />
                            </FormField>
                            <FormField htmlFor={`course-duration-${course.id}`} label="Длительность">
                              <Input id={`course-duration-${course.id}`} name="durationLabel" maxLength={120} defaultValue={course.durationLabel ?? ''} />
                            </FormField>
                            <FormField htmlFor={`course-level-${course.id}`} label="Уровень">
                              <Input id={`course-level-${course.id}`} name="level" maxLength={80} defaultValue={course.level ?? ''} />
                            </FormField>
                            <FormField htmlFor={`course-price-${course.id}`} label="Стоимость">
                              <Input id={`course-price-${course.id}`} name="priceLabel" maxLength={120} defaultValue={course.priceLabel ?? ''} />
                            </FormField>
                            <FormField htmlFor={`course-instructor-${course.id}`} label="Преподаватель">
                              <Input
                                id={`course-instructor-${course.id}`}
                                name="instructorName"
                                maxLength={160}
                                defaultValue={course.instructorName ?? ''}
                              />
                            </FormField>
                            <CoverImageField id={`course-cover-${course.id}`} currentName={course.coverImage?.originalName} />
                            <FormField htmlFor={`course-status-${course.id}`} label="Статус">
                              <Select id={`course-status-${course.id}`} name="status" defaultValue={course.status}>
                                {Object.values(ContentStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {contentStatusLabels[status]}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`course-summary-${course.id}`} label="Краткое описание">
                                <Textarea
                                  id={`course-summary-${course.id}`}
                                  name="summary"
                                  required
                                  minLength={10}
                                  maxLength={500}
                                  defaultValue={course.summary}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`course-program-${course.id}`} label="Программа">
                                <Textarea
                                  id={`course-program-${course.id}`}
                                  name="program"
                                  required
                                  minLength={20}
                                  className="min-h-64"
                                  defaultValue={course.program}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <Button type="submit">Сохранить курс</Button>
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
          basePath={ADMIN_COURSES_PATH}
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
