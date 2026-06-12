import { CategoryType } from '@/modules/admin/queries';
import { createCourse } from '@/app/admin/courses/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { courseFormatOptions, courseLevelOptions } from '@/lib/admin/content-utils';
import { getActiveCategories, getActiveCities } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

export default async function AdminCreateCoursePage() {
  await requireAdminSectionAccess('courses');

  const [categories, cities] = await Promise.all([
    getActiveCategories(CategoryType.COURSE),
    getActiveCities()
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Курсы / Создание</p>
        <h1 className="mt-2 text-3xl font-semibold">Новый курс</h1>
      </header>

      <AdminCmsForm action={createCourse}>
        <AdminCmsSection title="Публикация" description="Название и категория курса.">
          <AdminCmsGrid>
            <FormField htmlFor="course-title" label="Название">
              <Input id="course-title" name="title" required minLength={2} maxLength={160} />
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
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Параметры обучения" description="Город, формат и учебные параметры для каталога.">
          <AdminCmsGrid>
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
              <Select id="course-format" name="format" defaultValue="">
                <option value="">Не указан</option>
                {courseFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="course-durationLabel" label="Длительность">
              <Input id="course-durationLabel" name="durationLabel" maxLength={120} />
            </FormField>
            <FormField htmlFor="course-level" label="Уровень">
              <Select id="course-level" name="level" defaultValue="">
                <option value="">Не указан</option>
                {courseLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="course-priceLabel" label="Стоимость">
              <Input id="course-priceLabel" name="priceLabel" maxLength={120} />
            </FormField>
            <FormField htmlFor="course-instructorName" label="Преподаватель">
              <Input id="course-instructorName" name="instructorName" maxLength={160} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка курса для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="course-coverImage" />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Короткое описание и программа курса.">
          <div className="grid gap-4">
            <FormField htmlFor="course-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="course-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
            <FormField htmlFor="course-program" label="Программа" hint="Полное содержимое публичной страницы курса">
              <MarkdownEditor id="course-program" name="program" required minLength={20} maxLength={100_000} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
            <Button type="submit">Создать курс</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
