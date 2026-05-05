import { CategoryType } from '@prisma/client';
import { createCategory, updateCategory } from '@/app/admin/taxonomy/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_CATEGORIES_PATH = '/admin/categories';

const categoryTypeLabels: Record<CategoryType, string> = {
  [CategoryType.ARTICLE]: 'Статьи',
  [CategoryType.EVENT]: 'События',
  [CategoryType.COURSE]: 'Курсы',
  [CategoryType.VACANCY]: 'Вакансии',
  [CategoryType.SUPPLIER]: 'Поставщики',
  [CategoryType.PARTNER]: 'Партнёры',
  [CategoryType.SERVICE]: 'Услуги',
  [CategoryType.GENERAL]: 'Общее'
};

type AdminCategoriesPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  await requireAdminSectionAccess('categories');

  const params = (await searchParams) ?? {};
  const categories = await prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
  });

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Категории для публичных каталогов и админских форм контента."
        eyebrow="Админка / Таксономия"
        title="Категории"
      />

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <form action={createCategory} className="grid gap-5 lg:grid-cols-[1fr_1fr_180px_140px_auto] lg:items-end">
          <HiddenRedirect value={ADMIN_CATEGORIES_PATH} />
          <FormField htmlFor="category-name" label="Название">
            <Input id="category-name" name="name" required minLength={2} maxLength={120} />
          </FormField>
          <FormField htmlFor="category-slug" label="Slug">
            <Input id="category-slug" name="slug" maxLength={160} placeholder="Если пусто, будет создан из названия" />
          </FormField>
          <FormField htmlFor="category-type" label="Раздел">
            <Select id="category-type" name="type" defaultValue={CategoryType.ARTICLE}>
              {Object.values(CategoryType).map((type) => (
                <option key={type} value={type}>
                  {categoryTypeLabels[type]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="category-sortOrder" label="Порядок">
            <Input id="category-sortOrder" name="sortOrder" min={0} max={100000} type="number" defaultValue={0} />
          </FormField>
          <div className="lg:col-span-4">
            <FormField htmlFor="category-description" label="Описание">
              <Textarea id="category-description" name="description" maxLength={500} />
            </FormField>
          </div>
          <div className="grid gap-3">
            <CheckboxField name="isActive" value="true" defaultChecked>
              Активна
            </CheckboxField>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Card>

      <section className="grid gap-4">
        {categories.length === 0 ? (
          <Card className="p-5 text-sm text-[var(--muted)]">Категорий пока нет.</Card>
        ) : (
          categories.map((category) => (
            <Card className="p-5" key={category.id}>
              <form action={updateCategory} className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_120px_140px_auto] lg:items-end">
                <HiddenRedirect value={ADMIN_CATEGORIES_PATH} />
                <input name="categoryId" type="hidden" value={category.id} />
                <FormField htmlFor={`category-name-${category.id}`} label="Название">
                  <Input id={`category-name-${category.id}`} name="name" required minLength={2} maxLength={120} defaultValue={category.name} />
                </FormField>
                <FormField htmlFor={`category-slug-${category.id}`} label="Slug">
                  <Input id={`category-slug-${category.id}`} name="slug" maxLength={160} defaultValue={category.slug} />
                </FormField>
                <FormField htmlFor={`category-type-${category.id}`} label="Раздел">
                  <Select id={`category-type-${category.id}`} name="type" defaultValue={category.type}>
                    {Object.values(CategoryType).map((type) => (
                      <option key={type} value={type}>
                        {categoryTypeLabels[type]}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField htmlFor={`category-sortOrder-${category.id}`} label="Порядок">
                  <Input id={`category-sortOrder-${category.id}`} name="sortOrder" min={0} max={100000} type="number" defaultValue={category.sortOrder} />
                </FormField>
                <div className="lg:col-span-4">
                  <FormField htmlFor={`category-description-${category.id}`} label="Описание">
                    <Textarea id={`category-description-${category.id}`} name="description" maxLength={500} defaultValue={category.description ?? ''} />
                  </FormField>
                </div>
                <div className="grid gap-3">
                  <StatusBadge variant={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Активна' : 'Выключена'}</StatusBadge>
                  <CheckboxField name="isActive" value="true" defaultChecked={category.isActive}>
                    Активна
                  </CheckboxField>
                </div>
                <Button type="submit" variant="secondary">
                  Сохранить
                </Button>
              </form>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
