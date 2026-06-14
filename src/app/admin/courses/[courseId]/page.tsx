import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { deleteCourseDraft, updateCourse, updateCourseStatus } from '@/app/admin/courses/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
  courseFormatOptions,
  courseLevelOptions,
  getAdminOptionLabel,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { getActiveCategories, getActiveCities, getCourseById } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

const ADMIN_COURSES_PATH = '/admin/courses';

type AdminEditCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminEditCoursePage({ params }: AdminEditCoursePageProps) {
  await requireAdminSectionAccess('courses');
  const { courseId } = await params;

  const [course, categories, cities] = await Promise.all([
    getCourseById(courseId),
    getActiveCategories(CategoryType.COURSE),
    getActiveCities()
  ]);

  if (!course) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === course.cityId)?.name ?? 'Город не указан';
  const currentPath = `${ADMIN_COURSES_PATH}/${course.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Курс / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">{course.title}</h1>
        </div>
        <Button href={ADMIN_COURSES_PATH} variant="secondary">
          Назад к списку
        </Button>
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

        <AdminCmsSection title="Публикация" description="Название и категория курса.">
          <AdminCmsGrid>
            <FormField htmlFor="course-title" label="Название">
              <Input id="course-title" name="title" required minLength={2} maxLength={160} defaultValue={course.title} />
            </FormField>
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
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsAdvancedSection title="Технические настройки" description="Адрес страницы. Изменение сломает существующие ссылки.">
          <AdminCmsGrid>
            <FormField htmlFor="course-slug" label="Адрес страницы">
              <Input id="course-slug" name="slug" readOnly defaultValue={course.slug} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsAdvancedSection>

        <AdminCmsSection title="Параметры обучения" description="Город, формат и учебные параметры для каталога.">
          <AdminCmsGrid>
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
            <FormField htmlFor="course-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="course-summary" name="summary" required minLength={10} maxLength={500} defaultValue={course.summary} />
            </FormField>
            <FormField htmlFor="course-program" label="Программа" hint="Полное содержимое публичной страницы курса">
              <MarkdownEditor id="course-program" name="program" required minLength={20} maxLength={100_000} defaultValue={course.program} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
            <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>

      {course.status === ContentStatus.DRAFT ? (
        <form action={deleteCourseDraft}>
          <input name="courseId" type="hidden" value={course.id} />
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
