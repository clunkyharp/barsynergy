import { CategoryType } from '@/modules/admin/queries';
import { createTag, updateTag } from '@/app/admin/tags/actions';
import {
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
import { getTagList } from '@/lib/admin/admin-queries';

export const dynamic = 'force-dynamic';

const ADMIN_TAGS_PATH = '/admin/tags';

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

type AdminTagsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminTagsPage({ searchParams }: AdminTagsPageProps) {
  await requireAdminSectionAccess('tags');

  const params = (await searchParams) ?? {};
  const tags = await getTagList();

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Теги для материалов. В публичных статьях показываются только активные теги."
        eyebrow="Админка / Таксономия"
        title="Теги"
      />

      <AdminActionAlert params={params} />

      <AdminCmsPanel title="Новый тег" description="Создайте короткий редакционный тег. Новые теги активны сразу, статус можно изменить в строке редактирования.">
        <form action={createTag} className="grid gap-4">
          <HiddenRedirect value={ADMIN_TAGS_PATH} />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px_auto] lg:items-end">
            <FormField htmlFor="tag-name" label="Название">
              <Input id="tag-name" name="name" required minLength={2} maxLength={120} />
            </FormField>
            <FormField htmlFor="tag-slug" label="Slug">
              <Input id="tag-slug" name="slug" maxLength={160} placeholder="Если пусто, будет создан из названия" />
            </FormField>
            <FormField htmlFor="tag-type" label="Раздел">
              <Select id="tag-type" name="type" defaultValue={CategoryType.ARTICLE}>
                {Object.values(CategoryType).map((type) => (
                  <option key={type} value={type}>
                    {categoryTypeLabels[type]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="tag-sortOrder" label="Порядок">
              <Input id="tag-sortOrder" name="sortOrder" min={0} max={100000} type="number" defaultValue={0} />
            </FormField>
            <Button type="submit">Создать</Button>
          </div>
          <FormField
            className="lg:col-span-full"
            htmlFor="tag-description"
            label="Описание"
            hint="Необязательное пояснение для редакции и будущих подборок."
          >
            <Textarea id="tag-description" name="description" maxLength={500} rows={3} />
          </FormField>
        </form>
      </AdminCmsPanel>

      <section className="grid gap-4">
        {tags.length === 0 ? (
          <ContextualEmptyState context="Таксономия" title="Тегов пока нет" description="Добавьте первый тег для редакционных материалов и будущих подборок." />
        ) : (
          tags.map((tag) => (
            <AdminCmsInlineEditRecord
              action={updateTag}
              groupName="tag-edit-list"
              key={tag.id}
              formClassName="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px_150px_auto] lg:items-end"
              summary={
                <AdminCmsCompactRecordSummary
                  title={tag.name}
                  subtitle={tag.slug}
                  items={[
                    { label: 'Раздел', value: categoryTypeLabels[tag.type] },
                    { label: 'Порядок', value: tag.sortOrder },
                    { label: 'Статей', value: tag._count.articleTags },
                    { label: 'Описание', value: tag.description ? 'Заполнено' : 'Не указано' }
                  ]}
                  status={<AdminStatusChip variant={tag.isActive ? 'success' : 'neutral'}>{tag.isActive ? 'Активен' : 'Выключен'}</AdminStatusChip>}
                />
              }
            >
              <HiddenRedirect value={ADMIN_TAGS_PATH} />
              <input name="tagId" type="hidden" value={tag.id} />
              <FormField htmlFor={`tag-name-${tag.id}`} label="Название">
                <Input id={`tag-name-${tag.id}`} name="name" required minLength={2} maxLength={120} defaultValue={tag.name} />
              </FormField>
              <FormField htmlFor={`tag-slug-${tag.id}`} label="Slug">
                <Input id={`tag-slug-${tag.id}`} name="slug" maxLength={160} defaultValue={tag.slug} />
              </FormField>
              <FormField htmlFor={`tag-type-${tag.id}`} label="Раздел">
                <Select id={`tag-type-${tag.id}`} name="type" defaultValue={tag.type}>
                  {Object.values(CategoryType).map((type) => (
                    <option key={type} value={type}>
                      {categoryTypeLabels[type]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor={`tag-sortOrder-${tag.id}`} label="Порядок">
                <Input id={`tag-sortOrder-${tag.id}`} name="sortOrder" min={0} max={100000} type="number" defaultValue={tag.sortOrder} />
              </FormField>
              <FormField htmlFor={`tag-isActive-${tag.id}`} label="Статус">
                <Select id={`tag-isActive-${tag.id}`} name="isActive" defaultValue={tag.isActive ? 'true' : 'false'}>
                  <option value="true">Активен</option>
                  <option value="false">Выключен</option>
                </Select>
              </FormField>
              <Button type="submit" variant="secondary">
                Сохранить
              </Button>
              <FormField
                className="lg:col-span-full"
                htmlFor={`tag-description-${tag.id}`}
                label="Описание"
                hint="Необязательное пояснение для редакции и будущих подборок."
              >
                <Textarea id={`tag-description-${tag.id}`} name="description" maxLength={500} defaultValue={tag.description ?? ''} rows={3} />
              </FormField>
            </AdminCmsInlineEditRecord>
          ))
        )}
      </section>
    </div>
  );
}
