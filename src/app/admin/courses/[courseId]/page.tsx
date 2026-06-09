import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { updateCourse, updateCourseStatus } from '@/app/admin/courses/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import {
  PUBLICATION_STATUS_HINT,
  contentStatusLabels,
  courseFormatOptions,
  courseLevelOptions,
  getAdminOptionLabel,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

export const dynamic = 'force-dynamic';

const ADMIN_COURSES_PATH = '/admin/courses';

type AdminEditCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminEditCoursePage({ params }: AdminEditCoursePageProps) {
  await requireAdminSectionAccess('courses');
  const { courseId } = await params;

  const [course, categories, cities] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: { coverImage: { select: { originalName: true } } }
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

  if (!course) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === course.cityId)?.name ?? 'Город не указан';
  const currentPath = `${ADMIN_COURSES_PATH}/${course.id}`;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Курсы / Редактирование</p>
        <h1 className="mt-2 text-3xl font-semibold">{course.title}</h1>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="courseId"
        idValue={course.id}
        publicHref={`/education/${course.slug}`}
        status={course.status}
        updateStatusAction={updateCourseStatus}
      />

      <AdminCmsForm action={updateCourse}>
        <input name="courseId" type="hidden" value={course.id} />
        <AdminCmsSummary
          items={[
            { label: 'Статус', value: contentStatusLabels[course.status] },
            { label: 'Формат', value: getAdminOptionLabel(courseFormatOptions, course.format) },
            { label: 'Уровень', value: getAdminOptionLabel(courseLevelOptions, course.level) },
            { label: 'Город', value: cityName }
          ]}
        />

        <AdminCmsSection title="Публикация" description="Название, адрес страницы и публикационный статус курса.">
          <AdminCmsGrid>
            <FormField htmlFor="course-title" label="Название">
              <Input id="course-title" name="title" required minLength={2} maxLength={160} defaultValue={course.title} />
            </FormField>
            <FormField htmlFor="course-slug" label="Адрес страницы">
              <Input id="course-slug" name="slug" maxLength={180} defaultValue={course.slug} />
            </FormField>
            <FormField htmlFor="course-status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
              <Select id="course-status" name="status" defaultValue={course.status}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Параметры обучения" description="Рубрика, город, формат и учебные параметры для каталога.">
          <AdminCmsGrid>
            <FormField htmlFor="course-categoryId" label="Категория">
              <Select id="course-categoryId" name="categoryId" defaultValue={course.categoryId ?? ''}>
                <option value="">Без категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="course-cityId" label="Город">
              <Select id="course-cityId" name="cityId" defaultValue={course.cityId ?? ''}>
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="course-format" label="Формат">
              <Select id="course-format" name="format" defaultValue={course.format ?? ''}>
                <option value="">Не указан</option>
                {withCurrentValueOption([...courseFormatOptions], course.format).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="course-durationLabel" label="Длительность">
              <Input id="course-durationLabel" name="durationLabel" maxLength={120} defaultValue={course.durationLabel ?? ''} />
            </FormField>
            <FormField htmlFor="course-level" label="Уровень">
              <Select id="course-level" name="level" defaultValue={course.level ?? ''}>
                <option value="">Не указан</option>
                {withCurrentValueOption([...courseLevelOptions], course.level).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="course-priceLabel" label="Стоимость">
              <Input id="course-priceLabel" name="priceLabel" maxLength={120} defaultValue={course.priceLabel ?? ''} />
            </FormField>
            <FormField htmlFor="course-instructorName" label="Преподаватель">
              <Input id="course-instructorName" name="instructorName" maxLength={160} defaultValue={course.instructorName ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка курса для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="course-coverImage" currentName={course.coverImage?.originalName} currentAlt={course.coverImageAlt} />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Короткое описание и программа курса.">
          <div className="grid gap-4">
            <FormField htmlFor="course-summary" label="Краткое описание">
              <Textarea id="course-summary" name="summary" required minLength={10} maxLength={500} defaultValue={course.summary} />
            </FormField>
            <FormField htmlFor="course-program" label="Программа">
              <MarkdownEditor id="course-program" name="program" required minLength={20} maxLength={100_000} className="min-h-64" defaultValue={course.program} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
            <Button type="button" variant="secondary" href={ADMIN_COURSES_PATH}>
              Отмена
            </Button>
            <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
