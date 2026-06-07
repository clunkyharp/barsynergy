import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { createArticle } from '@/app/admin/articles/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PUBLICATION_STATUS_HINT, contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

export const dynamic = 'force-dynamic';

const ADMIN_ARTICLES_PATH = '/admin/articles';
const ARTICLE_BODY_MAX_LENGTH = 20_000;

export default async function AdminArticlesCreatePage() {
  await requireAdminSectionAccess('articles');

  const [categories, cities, tags] = await Promise.all([
    prisma.category.findMany({
      where: { type: CategoryType.ARTICLE, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.tag.findMany({
      where: { type: CategoryType.ARTICLE, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Статьи / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новая статья</h1>
        </div>
        <Button href={ADMIN_ARTICLES_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminCmsForm action={createArticle}>
          <HiddenRedirect value={ADMIN_ARTICLES_PATH} />
          
          <AdminCmsSection title="Публикация" description="Название, адрес и первичный статус материала.">
            <AdminCmsGrid>
              <FormField htmlFor="title" label="Заголовок">
                <Input id="title" name="title" required minLength={2} maxLength={160} />
              </FormField>
              <FormField htmlFor="slug" label="Адрес страницы">
                <Input id="slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
              </FormField>
              <FormField htmlFor="status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
                <Select id="status" name="status" defaultValue={ContentStatus.DRAFT}>
                  {Object.values(ContentStatus).map((status) => (
                    <option key={status} value={status}>
                      {contentStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Классификация" description="Рубрики, город и теги для публичных фильтров и редакционного поиска.">
            <AdminCmsGrid>
              <FormField htmlFor="categoryId" label="Категория">
                <Select id="categoryId" name="categoryId" defaultValue="">
                  <option value="">Без категории</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField htmlFor="cityId" label="Город">
                <Select id="cityId" name="cityId" defaultValue="">
                  <option value="">Без города</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              {tags.length > 0 ? (
                <div className="lg:col-span-2">
                  <p className="mb-3 text-sm font-semibold">Теги</p>
                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => (
                      <CheckboxField
                        className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2"
                        key={tag.id}
                        name="tagIds"
                        value={tag.id}
                      >
                        {tag.name}
                      </CheckboxField>
                    ))}
                  </div>
                </div>
              ) : null}
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsAdvancedSection title="Редакционные данные" description="Автор, источник и время чтения. Заполняйте, если эти данные нужно показать в материале.">
            <AdminCmsGrid>
              <FormField htmlFor="authorName" label="Автор">
                <Input id="authorName" name="authorName" maxLength={120} />
              </FormField>
              <FormField htmlFor="sourceLabel" label="Источник">
                <Input id="sourceLabel" name="sourceLabel" maxLength={160} />
              </FormField>
              <FormField htmlFor="readingTimeMinutes" label="Время чтения, минут">
                <Input id="readingTimeMinutes" name="readingTimeMinutes" min={1} max={240} type="number" />
              </FormField>
            </AdminCmsGrid>
          </AdminCmsAdvancedSection>

          <AdminCmsSection title="Медиа" description="Обложка и alt-текст для карточки и страницы материала.">
            <AdminCmsGrid>
              <CoverImageField id="article-coverImage" />
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Контент" description="Короткое описание для списков и основной текст материала.">
            <div className="grid gap-4">
                <FormField htmlFor="summary" label="Краткое описание">
                  <Textarea id="summary" name="summary" required minLength={10} maxLength={500} />
                </FormField>
                <FormField htmlFor="body" label="Текст">
                  <Textarea id="body" name="body" required minLength={20} maxLength={ARTICLE_BODY_MAX_LENGTH} className="min-h-64" />
                </FormField>
            </div>
          </AdminCmsSection>

          <AdminCmsActions>
            <Button href={ADMIN_ARTICLES_PATH} type="button" variant="secondary">
              Отмена
            </Button>
            <Button type="submit">Создать статью</Button>
          </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
