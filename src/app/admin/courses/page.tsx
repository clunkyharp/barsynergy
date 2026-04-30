import { ContentStatus } from '@prisma/client';
import { deleteCourseDraft, updateCourseStatus } from '@/app/admin/courses/actions';
import {
  AdminActionAlert,
  AdminPagination,
  HiddenRedirect
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableFrame,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow
} from '@/components/ui/admin-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
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

  const [total, courses] = await Promise.all([
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
    })
  ]);
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        action={<Button href="/admin/courses/create">Создать курс</Button>}
        description="Программы, интенсивы и учебные форматы с ручным контролем статуса публикации."
        eyebrow="Админка / Курсы"
        title="Курсы"
      />

      <AdminActionAlert params={params} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Все курсы</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {courses.length === 0 ? (
          <EmptyState title="Курсов пока нет" />
        ) : (
          <AdminTableFrame>
            <AdminTable minWidth={1040}>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>Курс</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Параметры</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Действия</AdminTableHeaderCell>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {courses.map((course) => (
                  <AdminTableRow key={course.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <div className="font-semibold">{course.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{course.slug}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{course.category?.name ?? 'Без категории'}</div>
                      {course.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {course.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{course.format ?? 'Формат не указан'}</div>
                      {course.durationLabel ? <div className="mt-1 text-xs">{course.durationLabel}</div> : null}
                      {course.level ? <div className="mt-1 text-xs">{course.level}</div> : null}
                      {course.priceLabel ? <div className="mt-1 text-xs">{course.priceLabel}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">{course.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge variant={contentStatusBadgeVariants[course.status]}>{contentStatusLabels[course.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(course.updatedAt)}</div>
                      {course.updatedBy?.email ? <div className="mt-1 text-xs">{course.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button className="min-h-9 px-3 py-1.5 text-xs" variant="secondary" href={`/admin/courses/${course.id}`}>
                          Изменить
                        </Button>
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
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </AdminTableFrame>
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
