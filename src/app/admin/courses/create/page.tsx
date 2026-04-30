import { CategoryType, ContentStatus } from '@prisma/client';
import { createCourse } from '@/app/admin/courses/actions';
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

export default async function AdminCreateCoursePage() {
  await requireAdminSectionAccess('courses');

  const [categories, cities] = await Promise.all([
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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Курсы / Создание</p>
        <h1 className="mt-2 text-3xl font-semibold">Новый курс</h1>
      </header>

      <Card className="p-5">
        <form action={createCourse} className="grid gap-5 lg:grid-cols-2">
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
          <div className="lg:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" href="/admin/courses">
              Отмена
            </Button>
            <Button type="submit">Создать курс</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
