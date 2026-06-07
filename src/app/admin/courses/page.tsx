import { deleteCourseDraft, updateCourseStatus } from '@/app/admin/courses/actions';
import {
  AdminActionAlert,
  AdminContentStatusTabs,
  AdminContentRowActions,
  AdminListFilters,
  AdminPagination,
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import {
  AdminTable,
  AdminTableActionsCell,
  AdminTableActionsHeaderCell,
  AdminTableBody,
  AdminTableCell,
  AdminTableClamp,
  AdminTableFrame,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  AdminTableStateRow
} from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusBadgeVariants,
  contentStatusLabels,
  courseFormatOptions,
  courseLevelOptions,
  getAdminCurrentPath,
  getAdminOptionLabel,
  getAdminPage,
  getAdminSearchQuery,
  getAdminStatusFilter,
  getAdminStringFilter,
  getAdminTotalPages,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

export const dynamic = 'force-dynamic';

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
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const cityId = getAdminStringFilter(params, 'cityId');
  const format = getAdminStringFilter(params, 'format');
  const level = getAdminStringFilter(params, 'level');
  const where = {
    status,
    cityId,
    format,
    level,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { summary: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: q, mode: 'insensitive' as const } }
          ]
        }
      : {})
  };

  const [total, courses, cities] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
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
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);
  const totalPages = getAdminTotalPages(total);
  const hasActiveFilters = Boolean(q || status || cityId || format || level);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={<Button href="/admin/courses/create">Создать курс</Button>}
        description="Программы, интенсивы и учебные форматы с ручным контролем статуса публикации."
        eyebrow="Админка / Курсы"
        title="Курсы"
      />

      <AdminActionAlert params={params} />
      <AdminContentStatusTabs basePath={ADMIN_COURSES_PATH} params={params} />
      <AdminListFilters
        basePath={ADMIN_COURSES_PATH}
        includeStatus={false}
        filters={[
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) },
          { name: 'format', label: 'Формат', allLabel: 'Все форматы', options: [...courseFormatOptions] },
          { name: 'level', label: 'Уровень', allLabel: 'Все уровни', options: [...courseLevelOptions] }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию"
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все курсы</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        <AdminTableFrame>
          <AdminTable minWidth={1040}>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeaderCell>Курс</AdminTableHeaderCell>
                <AdminTableHeaderCell>Параметры</AdminTableHeaderCell>
                <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {courses.length === 0 ? (
                <AdminTableStateRow
                  colSpan={6}
                  description={hasActiveFilters ? 'По текущим фильтрам курсов нет.' : 'Добавьте программу, интенсив или другой учебный формат для публикации в разделе образования.'}
                  state={hasActiveFilters ? 'no-results' : 'empty'}
                  title={hasActiveFilters ? 'Курсы не найдены' : 'Курсов пока нет'}
                />
              ) : (
                courses.map((course) => (
                  <AdminTableRow key={course.id}>
                    <AdminTableCell className="max-w-[320px]" label="Курс">
                      <AdminTableClamp className="font-semibold">{course.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{course.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{course.category?.name ?? 'Без категории'}</div>
                      {course.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {course.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Параметры">
                      <div>{getAdminOptionLabel(courseFormatOptions, course.format, 'Формат не указан')}</div>
                      {course.durationLabel ? <div className="mt-1 text-xs">{course.durationLabel}</div> : null}
                      {course.level ? (
                        <div className="mt-1 text-xs">{getAdminOptionLabel(courseLevelOptions, course.level)}</div>
                      ) : null}
                      {course.priceLabel ? <div className="mt-1 text-xs">{course.priceLabel}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Город">{course.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell label="Статус">
                      <StatusBadge variant={contentStatusBadgeVariants[course.status]}>{contentStatusLabels[course.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]" label="Обновлено">
                      <div>{dateFormatter.format(course.updatedAt)}</div>
                      {course.updatedBy?.email ? <div className="mt-1 text-xs">{course.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <AdminContentRowActions
                        currentPath={currentPath}
                        deleteAction={deleteCourseDraft}
                        editHref={`${ADMIN_COURSES_PATH}/${course.id}`}
                        idName="courseId"
                        idValue={course.id}
                        publicHref={`/education/${course.slug}`}
                        status={course.status}
                        updateStatusAction={updateCourseStatus}
                      />
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableFrame>

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
