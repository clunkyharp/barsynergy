import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { updateCourse } from '@/app/admin/courses/actions';
import { CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Курсы / Редактирование</p>
        <h1 className="mt-2 text-3xl font-semibold">{course.title}</h1>
      </header>

      <Card className="p-5">
        <form action={updateCourse} className="grid gap-5 lg:grid-cols-2">
          <input name="courseId" type="hidden" value={course.id} />
          <FormField htmlFor="course-title" label="Название">
            <Input id="course-title" name="title" required minLength={2} maxLength={160} defaultValue={course.title} />
          </FormField>
          <FormField htmlFor="course-slug" label="Адрес страницы">
            <Input id="course-slug" name="slug" maxLength={180} defaultValue={course.slug} />
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
            <Input id="course-format" name="format" maxLength={80} defaultValue={course.format ?? ''} />
          </FormField>
          <FormField htmlFor="course-durationLabel" label="Длительность">
            <Input id="course-durationLabel" name="durationLabel" maxLength={120} defaultValue={course.durationLabel ?? ''} />
          </FormField>
          <FormField htmlFor="course-level" label="Уровень">
            <Input id="course-level" name="level" maxLength={80} defaultValue={course.level ?? ''} />
          </FormField>
          <FormField htmlFor="course-priceLabel" label="Стоимость">
            <Input id="course-priceLabel" name="priceLabel" maxLength={120} defaultValue={course.priceLabel ?? ''} />
          </FormField>
          <FormField htmlFor="course-instructorName" label="Преподаватель">
            <Input id="course-instructorName" name="instructorName" maxLength={160} defaultValue={course.instructorName ?? ''} />
          </FormField>
          <CoverImageField id="course-coverImage" currentName={course.coverImage?.originalName} />
          <FormField htmlFor="course-status" label="Статус">
            <Select id="course-status" name="status" defaultValue={course.status}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="course-summary" label="Краткое описание">
              <Textarea id="course-summary" name="summary" required minLength={10} maxLength={500} defaultValue={course.summary} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="course-program" label="Программа">
              <Textarea id="course-program" name="program" required minLength={20} className="min-h-64" defaultValue={course.program} />
            </FormField>
          </div>
          <div className="lg:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" href="/admin/courses">
              Отмена
            </Button>
            <Button type="submit">Сохранить изменения</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
