import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { deleteArticleDraft, updateArticle, updateArticleStatus } from '@/app/admin/articles/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminActionAlert, AdminContentVisibilityPanel, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PUBLICATION_STATUS_HINT, contentStatusLabels, type AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_ARTICLES_PATH = '/admin/articles';
const ARTICLE_BODY_MAX_LENGTH = 20_000;

type AdminArticleDetailPageProps = {
  params: Promise<{ articleId: string }>;
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminArticleDetailPage({ params, searchParams }: AdminArticleDetailPageProps) {
  await requireAdminSectionAccess('articles');

  const { articleId } = await params;
  const currentPath = `${ADMIN_ARTICLES_PATH}/${articleId}`;
  const query = (await searchParams) ?? {};
  const [article, categories, cities, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: {
        coverImage: { select: { originalName: true } },
        tags: { select: { tagId: true } }
      }
    }),
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

  if (!article) {
    notFound();
  }
  const selectedTagIds = new Set(article.tags.map((tag) => tag.tagId));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Статьи</p>
          <h1 className="mt-2 text-3xl font-semibold">{article.title}</h1>
        </div>
        <Button href={ADMIN_ARTICLES_PATH} variant="ghost">
          Назад к списку
        </Button>
      </header>

      <AdminActionAlert params={query} />

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="articleId"
        idValue={article.id}
        publicHref={`/articles/${article.slug}`}
        status={article.status}
        updateStatusAction={updateArticleStatus}
      />

      <AdminCmsForm action={updateArticle}>
          <HiddenRedirect value={currentPath} />
          <input name="articleId" type="hidden" value={article.id} />
          <AdminCmsSummary
            items={[
              { label: 'Статус', value: contentStatusLabels[article.status] },
            { label: 'Адрес', value: `/${article.slug}` },
            { label: 'Автор', value: article.authorName ?? 'Не указан' },
            { label: 'Теги', value: article.tags.length }
          ]}
          />
          <AdminCmsSection title="Публикация" description="Название и адрес материала.">
            <AdminCmsGrid>
          <FormField htmlFor="article-title" label="Заголовок">
            <Input id="article-title" name="title" required minLength={2} maxLength={160} defaultValue={article.title} />
          </FormField>
          <FormField htmlFor="article-slug" label="Адрес страницы">
            <Input id="article-slug" name="slug" maxLength={180} defaultValue={article.slug} />
          </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Классификация" description="Рубрика и город для публичных фильтров.">
            <AdminCmsGrid>
          <FormField htmlFor="article-categoryId" label="Категория">
            <Select id="article-categoryId" name="categoryId" defaultValue={article.categoryId ?? ''}>
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="article-cityId" label="Город">
            <Select id="article-cityId" name="cityId" defaultValue={article.cityId ?? ''}>
              <option value="">Без города</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsAdvancedSection
            defaultOpen={Boolean(article.authorName || article.sourceLabel || article.readingTimeMinutes)}
            title="Редакционные данные"
            description="Автор, источник и время чтения. Вторичные поля раскрыты только если уже заполнены."
          >
            <AdminCmsGrid>
          <FormField htmlFor="article-authorName" label="Автор">
            <Input id="article-authorName" name="authorName" maxLength={120} defaultValue={article.authorName ?? ''} />
          </FormField>
          <FormField htmlFor="article-sourceLabel" label="Источник">
            <Input id="article-sourceLabel" name="sourceLabel" maxLength={160} defaultValue={article.sourceLabel ?? ''} />
          </FormField>
          <FormField htmlFor="article-readingTimeMinutes" label="Время чтения, минут">
            <Input
              id="article-readingTimeMinutes"
              name="readingTimeMinutes"
              min={1}
              max={240}
              type="number"
              defaultValue={article.readingTimeMinutes ?? ''}
            />
          </FormField>
            </AdminCmsGrid>
          </AdminCmsAdvancedSection>

          <AdminCmsSection title="Медиа" description="Обложка и alt-текст для карточки и страницы материала.">
            <AdminCmsGrid>
          <CoverImageField id="article-coverImage" currentName={article.coverImage?.originalName} currentAlt={article.coverImageAlt} />
            </AdminCmsGrid>
          </AdminCmsSection>

          <AdminCmsSection title="Статус и настройки" description="Публикационный статус и теги материала.">
            <AdminCmsGrid>
          <FormField htmlFor="article-status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
            <Select id="article-status" name="status" defaultValue={article.status}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
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
                    defaultChecked={selectedTagIds.has(tag.id)}
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

          <AdminCmsSection title="Контент" description="Короткое описание для списков и основной текст материала.">
            <div className="grid gap-4">
            <FormField htmlFor="article-summary" label="Краткое описание">
              <Textarea id="article-summary" name="summary" required minLength={10} maxLength={500} defaultValue={article.summary} />
            </FormField>
            <FormField htmlFor="article-body" label="Текст">
              <Textarea
                id="article-body"
                name="body"
                required
                minLength={20}
                maxLength={ARTICLE_BODY_MAX_LENGTH}
                className="min-h-80"
                defaultValue={article.body}
              />
            </FormField>
            </div>
          </AdminCmsSection>

          <AdminCmsActions>
            <Button href={ADMIN_ARTICLES_PATH} type="button" variant="secondary">
              Отмена
            </Button>
            <Button type="submit">Сохранить статью</Button>
          </AdminCmsActions>
      </AdminCmsForm>

      {article.status === ContentStatus.DRAFT ? (
        <form action={deleteArticleDraft}>
          <input name="articleId" type="hidden" value={article.id} />
          <Button type="submit" variant="ghost">
            Удалить черновик
          </Button>
        </form>
      ) : null}
    </div>
  );
}
