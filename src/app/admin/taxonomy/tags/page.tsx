import { CategoryType } from '@prisma/client';
import { createTag, updateTag } from '@/app/admin/taxonomy/tags/actions';
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

const ADMIN_TAGS_PATH = '/admin/taxonomy/tags';

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

export default async function AdminTaxonomyTagsPage({ searchParams }: AdminTagsPageProps) {
  await requireAdminSectionAccess('tags');

  const params = (await searchParams) ?? {};
  const tags = await prisma.tag.findMany({
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { articleTags: true } }
    }
  });

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Теги для материалов. В публичных статьях показываются только активные теги."
        eyebrow="Админка / Таксономия"
        title="Теги"
      />

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <form action={createTag} className="grid gap-5 lg:grid-cols-[1fr_1fr_180px_140px_auto] lg:items-end">
          <HiddenRedirect value={ADMIN_TAGS_PATH} />
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
          <div className="lg:col-span-4">
            <FormField htmlFor="tag-description" label="Описание">
              <Textarea id="tag-description" name="description" maxLength={500} />
            </FormField>
          </div>
          <div className="grid gap-3">
            <CheckboxField name="isActive" value="true" defaultChecked>
              Активен
            </CheckboxField>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Card>

      <section className="grid gap-4">
        {tags.length === 0 ? (
          <Card className="p-5 text-sm text-[var(--muted)]">Тегов пока нет.</Card>
        ) : (
          tags.map((tag) => (
            <Card className="p-5" key={tag.id}>
              <form action={updateTag} className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_120px_140px_auto] lg:items-end">
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
                <div className="lg:col-span-4">
                  <FormField htmlFor={`tag-description-${tag.id}`} label="Описание">
                    <Textarea id={`tag-description-${tag.id}`} name="description" maxLength={500} defaultValue={tag.description ?? ''} />
                  </FormField>
                </div>
                <div className="grid gap-3">
                  <StatusBadge variant={tag.isActive ? 'success' : 'neutral'}>{tag.isActive ? 'Активен' : 'Выключен'}</StatusBadge>
                  <CheckboxField name="isActive" value="true" defaultChecked={tag.isActive}>
                    Активен
                  </CheckboxField>
                  <p className="text-xs text-[var(--muted)]">Статей: {tag._count.articleTags}</p>
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
