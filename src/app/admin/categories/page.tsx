import { CategoryType } from '@/modules/admin/queries';
import { createCategory, updateCategory } from '@/app/admin/taxonomy/actions';
import {
  AdminCmsAdvancedSection,
  AdminCmsCompactRecordSummary,
  AdminCmsInlineEditRecord,
  AdminCmsPanel
} from '@/components/admin/admin-cms-form';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ContextualEmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AdminStatusChip } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getCategoryList } from '@/lib/admin/admin-queries';

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
  const categories = await getCategoryList();

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Категории для публичных каталогов и админских форм контента."
        eyebrow="Админка / Таксономия"
        title="Категории"
      />

      <AdminActionAlert params={params} />

      <AdminCmsPanel title="Новая категория" description="Создайте рубрику для материалов, каталогов или общих справочников. Новые категории активны сразу, статус можно изменить в строке редактирования.">
        <form action={createCategory} className="grid gap-4">
          <HiddenRedirect value={ADMIN_CATEGORIES_PATH} />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px_auto] lg:items-end">
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
            <Button type="submit">Создать</Button>
          </div>
          <AdminCmsAdvancedSection title="Описание" description="Необязательное пояснение для внутренних сценариев и будущих публичных выводов.">
            <FormField htmlFor="category-description" label="Описание">
              <Textarea id="category-description" name="description" maxLength={500} rows={3} />
            </FormField>
          </AdminCmsAdvancedSection>
        </form>
      </AdminCmsPanel>

      <section className="grid gap-4">
        {categories.length === 0 ? (
          <ContextualEmptyState context="Таксономия" title="Категорий пока нет" description="Создайте первую категорию, чтобы она появилась в фильтрах и формах контента." />
        ) : (
          categories.map((category) => (
            <AdminCmsInlineEditRecord
              action={updateCategory}
              groupName="category-edit-list"
              key={category.id}
              formClassName="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px_150px_auto] lg:items-end"
              summary={
                <AdminCmsCompactRecordSummary
                  title={category.name}
                  subtitle={category.slug}
                  items={[
                    { label: 'Раздел', value: categoryTypeLabels[category.type] },
                    { label: 'Порядок', value: category.sortOrder },
                    { label: 'Описание', value: category.description ? 'Заполнено' : 'Не указано' }
                  ]}
                  status={<AdminStatusChip variant={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Активна' : 'Выключена'}</AdminStatusChip>}
                />
              }
            >
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
              <FormField htmlFor={`category-isActive-${category.id}`} label="Статус">
                <Select id={`category-isActive-${category.id}`} name="isActive" defaultValue={category.isActive ? 'true' : 'false'}>
                  <option value="true">Активна</option>
                  <option value="false">Выключена</option>
                </Select>
              </FormField>
              <Button type="submit" variant="secondary">
                Сохранить
              </Button>
              <AdminCmsAdvancedSection
                className="lg:col-span-full"
                title="Описание"
                description="Необязательное пояснение для внутренних сценариев и будущих публичных выводов."
              >
                <FormField htmlFor={`category-description-${category.id}`} label="Описание">
                  <Textarea id={`category-description-${category.id}`} name="description" maxLength={500} defaultValue={category.description ?? ''} rows={3} />
                </FormField>
              </AdminCmsAdvancedSection>
            </AdminCmsInlineEditRecord>
          ))
        )}
      </section>
    </div>
  );
}
